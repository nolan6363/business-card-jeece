import os
from functools import wraps
from flask import Blueprint, request, jsonify, send_file, current_app, url_for
from werkzeug.utils import secure_filename
from app import db
from app.models import Card, Scan
from app.utils import (
    process_image, detect_device_type, generate_vcard,
    verify_password, generate_jwt_token, verify_jwt_token,
    calculate_stats
)
from collections import defaultdict

api_bp = Blueprint('api', __name__)

@api_bp.route("/", defaults={"path": ""}, methods=["OPTIONS"])
@api_bp.route("/<path:path>", methods=["OPTIONS"])
def cors_preflight(path):
    """
    Répond aux requêtes CORS préflight (OPTIONS) pour n'importe quel endpoint /api/*
    afin d'éviter les 404/405 qui cassent le CORS côté navigateur.
    """
    return ("", 204)

def token_required(f):
    """Decorator to protect routes with JWT token"""
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')

        if not token:
            return jsonify({'error': 'Token missing'}), 401

        # Remove 'Bearer ' prefix if present
        if token.startswith('Bearer '):
            token = token[7:]

        data = verify_jwt_token(token)
        if not data:
            return jsonify({'error': 'Invalid or expired token'}), 401

        return f(*args, **kwargs)
    return decorated

@api_bp.route('/auth/login', methods=['POST'])
def login():
    """Authenticate with password and return JWT token"""
    data = request.get_json()
    password = data.get('password')

    if not password:
        return jsonify({'error': 'Password required'}), 400

    # Compare with configured admin password
    if password == current_app.config['ADMIN_PASSWORD']:
        token = generate_jwt_token({'authenticated': True})
        return jsonify({'token': token, 'message': 'Login successful'}), 200
    else:
        return jsonify({'error': 'Invalid password'}), 401

@api_bp.route('/cards', methods=['GET'])
@token_required
def get_cards():
    """Get all cards (protected)"""
    cards = Card.query.order_by(Card.created_at.desc()).all()
    return jsonify([card.to_dict() for card in cards]), 200

@api_bp.route('/cards/<card_id>', methods=['GET'])
def get_card(card_id):
    """Get a single card by ID (public)"""
    card = Card.query.get(card_id)

    if not card:
        return jsonify({'error': 'Card not found'}), 404

    # Build photo URL if photo exists
    card_data = card.to_dict()
    if card.photo_path:
        card_data['photo_url'] = url_for('api.get_photo', filename=card.photo_path, _external=True)

    return jsonify(card_data), 200

@api_bp.route('/cards', methods=['POST'])
@token_required
def create_card():
    """Create a new card (protected)"""
    # Get form data
    first_name = request.form.get('first_name')
    last_name = request.form.get('last_name')
    email = request.form.get('email')
    phone = request.form.get('phone', '')
    company = request.form.get('company')
    position = request.form.get('position')
    website = request.form.get('website', '')
    is_active = request.form.get('is_active', 'true').lower() == 'true'

    # Validate required fields
    if not all([first_name, last_name, email, company, position]):
        return jsonify({'error': 'Missing required fields'}), 400

    # Create card
    card = Card(
        first_name=first_name,
        last_name=last_name,
        email=email,
        phone=phone,
        company=company,
        position=position,
        website=website,
        is_active=is_active
    )

    db.session.add(card)
    db.session.flush()  # Get the card ID before committing

    # Process photo if uploaded
    if 'photo' in request.files:
        file = request.files['photo']
        if file.filename != '':
            filename = process_image(file, card.id)
            if filename:
                card.photo_path = filename

    db.session.commit()

    card_data = card.to_dict()
    if card.photo_path:
        card_data['photo_url'] = url_for('api.get_photo', filename=card.photo_path, _external=True)

    return jsonify(card_data), 201

@api_bp.route('/cards/<card_id>', methods=['PUT'])
@token_required
def update_card(card_id):
    """Update a card (protected)"""
    card = Card.query.get(card_id)

    if not card:
        return jsonify({'error': 'Card not found'}), 404

    # Update fields
    card.first_name = request.form.get('first_name', card.first_name)
    card.last_name = request.form.get('last_name', card.last_name)
    card.email = request.form.get('email', card.email)
    card.phone = request.form.get('phone', card.phone)
    card.company = request.form.get('company', card.company)
    card.position = request.form.get('position', card.position)
    card.website = request.form.get('website', card.website)

    # Handle is_active field
    if 'is_active' in request.form:
        card.is_active = request.form.get('is_active').lower() == 'true'

    # Process new photo if uploaded
    if 'photo' in request.files:
        file = request.files['photo']
        if file.filename != '':
            # Delete old photo if exists
            if card.photo_path:
                old_path = os.path.join(current_app.config['UPLOAD_FOLDER'], card.photo_path)
                if os.path.exists(old_path):
                    os.remove(old_path)

            filename = process_image(file, card.id)
            if filename:
                card.photo_path = filename

    db.session.commit()

    card_data = card.to_dict()
    if card.photo_path:
        card_data['photo_url'] = url_for('api.get_photo', filename=card.photo_path, _external=True)

    return jsonify(card_data), 200

@api_bp.route('/cards/<card_id>', methods=['DELETE'])
@token_required
def delete_card(card_id):
    """Delete a card (protected)"""
    card = Card.query.get(card_id)

    if not card:
        return jsonify({'error': 'Card not found'}), 404

    # Delete photo file if exists
    if card.photo_path:
        photo_path = os.path.join(current_app.config['UPLOAD_FOLDER'], card.photo_path)
        if os.path.exists(photo_path):
            os.remove(photo_path)

    db.session.delete(card)
    db.session.commit()

    return jsonify({'message': 'Card deleted successfully'}), 200

@api_bp.route('/cards/<card_id>/scan', methods=['POST'])
def record_scan(card_id):
    """Record a scan for a card (public)"""
    card = Card.query.get(card_id)

    if not card:
        return jsonify({'error': 'Card not found'}), 404

    # Get user agent and detect device
    user_agent = request.headers.get('User-Agent', '')
    device_type = detect_device_type(user_agent)

    # Create scan record
    scan = Scan(
        card_id=card_id,
        user_agent=user_agent,
        device_type=device_type
    )

    db.session.add(scan)
    db.session.commit()

    return jsonify({'message': 'Scan recorded', 'device_type': device_type}), 201

@api_bp.route('/cards/<card_id>/vcard', methods=['GET'])
def download_vcard(card_id):
    """Download vCard file for a card (public)"""
    card = Card.query.get(card_id)

    if not card:
        return jsonify({'error': 'Card not found'}), 404

    # Generate photo URL if available
    photo_url = None
    if card.photo_path:
        photo_url = url_for('api.get_photo', filename=card.photo_path, _external=True)

    # Generate vCard content
    vcard_content = generate_vcard(card, photo_url)

    # Create temporary file
    import tempfile
    with tempfile.NamedTemporaryFile(mode='w', delete=False, suffix='.vcf') as f:
        f.write(vcard_content)
        temp_path = f.name

    # Send file
    filename = f"{card.first_name}_{card.last_name}.vcf"
    response = send_file(
        temp_path,
        mimetype='text/vcard',
        as_attachment=True,
        download_name=filename
    )

    # Clean up temp file after sending
    @response.call_on_close
    def cleanup():
        if os.path.exists(temp_path):
            os.remove(temp_path)

    return response

@api_bp.route('/photos/<filename>', methods=['GET'])
def get_photo(filename):
    """Serve uploaded photos"""
    filepath = os.path.join(current_app.config['UPLOAD_FOLDER'], filename)

    # Check if file exists
    if not os.path.exists(filepath):
        return jsonify({'error': 'Photo not found'}), 404

    # Detect mimetype based on extension
    ext = filename.rsplit('.', 1)[-1].lower()
    mimetype_map = {
        'jpg': 'image/jpeg',
        'jpeg': 'image/jpeg',
        'png': 'image/png',
        'webp': 'image/webp'
    }
    mimetype = mimetype_map.get(ext, 'image/jpeg')

    return send_file(filepath, mimetype=mimetype)

@api_bp.route('/stats', methods=['GET'])
@token_required
def get_global_stats():
    """Get global statistics (protected)"""
    # Get all scans
    scans = Scan.query.all()

    # Calculate stats
    stats = calculate_stats(scans)

    # Add per-card breakdown
    cards_stats = []
    cards = Card.query.all()
    for card in cards:
        card_scans = [s for s in scans if s.card_id == card.id]
        cards_stats.append({
            'card_id': card.id,
            'card_name': f"{card.first_name} {card.last_name}",
            'scan_count': len(card_scans)
        })

    stats['cards'] = sorted(cards_stats, key=lambda x: x['scan_count'], reverse=True)

    return jsonify(stats), 200

@api_bp.route('/stats/<card_id>', methods=['GET'])
@token_required
def get_card_stats(card_id):
    """Get statistics for a specific card (protected)"""
    card = Card.query.get(card_id)

    if not card:
        return jsonify({'error': 'Card not found'}), 404

    # Get card scans
    scans = Scan.query.filter_by(card_id=card_id).all()

    # Calculate stats
    stats = calculate_stats(scans)
    stats['card_name'] = f"{card.first_name} {card.last_name}"

    return jsonify(stats), 200
