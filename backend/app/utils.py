import os
import base64
from datetime import datetime, timedelta
from PIL import Image
import jwt
import bcrypt
from flask import current_app

def allowed_file(filename):
    """Check if file extension is allowed"""
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in current_app.config['ALLOWED_EXTENSIONS']

def process_image(file, card_id):
    """
    Process and save uploaded image
    - Resize to 400x400px
    - Save with card UUID as filename
    Returns: filename of saved image
    """
    if file and allowed_file(file.filename):
        # Get file extension
        ext = file.filename.rsplit('.', 1)[1].lower()
        filename = f"{card_id}.{ext}"
        filepath = os.path.join(current_app.config['UPLOAD_FOLDER'], filename)

        # Open and resize image
        img = Image.open(file)

        # Convert RGBA to RGB if needed (for JPEG compatibility)
        if img.mode == 'RGBA':
            background = Image.new('RGB', img.size, (255, 255, 255))
            background.paste(img, mask=img.split()[3])
            img = background

        # Resize maintaining aspect ratio, then crop to square
        img.thumbnail((400, 400), Image.Resampling.LANCZOS)

        # Create square image
        if img.size[0] != img.size[1]:
            size = min(img.size)
            left = (img.size[0] - size) // 2
            top = (img.size[1] - size) // 2
            img = img.crop((left, top, left + size, top + size))

        # Save processed image
        img.save(filepath, quality=85, optimize=True)
        return filename

    return None

def detect_device_type(user_agent):
    """Detect device type from User-Agent string"""
    if not user_agent:
        return 'Unknown'

    user_agent = user_agent.lower()

    if 'iphone' in user_agent or 'ipad' in user_agent:
        return 'iOS'
    elif 'android' in user_agent:
        return 'Android'
    else:
        return 'Desktop'

def generate_vcard(card, photo_url=None):
    """
    Generate vCard (VCF) format for a business card
    Follows RFC 6350 (vCard 3.0)
    """
    vcard_lines = [
        "BEGIN:VCARD",
        "VERSION:3.0",
        f"FN:{card.first_name} {card.last_name}",
        f"N:{card.last_name};{card.first_name};;;",
        f"EMAIL:{card.email}",
        f"ORG:{card.company}",
        f"TITLE:{card.position}"
    ]

    # Add phone if present
    if card.phone:
        vcard_lines.append(f"TEL:{card.phone}")

    # Add website if present
    if card.website:
        vcard_lines.append(f"URL:{card.website}")

    # Add photo if present
    if photo_url:
        vcard_lines.append(f"PHOTO;VALUE=URL:{photo_url}")

    vcard_lines.append("END:VCARD")

    return "\n".join(vcard_lines)

def hash_password(password):
    """Hash a password using bcrypt"""
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password, hashed):
    """Verify a password against its hash"""
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def generate_jwt_token(data):
    """Generate JWT token"""
    payload = {
        'data': data,
        'exp': datetime.utcnow() + timedelta(hours=current_app.config['JWT_EXPIRATION_HOURS'])
    }
    return jwt.encode(payload, current_app.config['SECRET_KEY'], algorithm='HS256')

def verify_jwt_token(token):
    """Verify JWT token"""
    try:
        payload = jwt.decode(token, current_app.config['SECRET_KEY'], algorithms=['HS256'])
        return payload['data']
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None

def calculate_stats(scans, days=30):
    """
    Calculate statistics from scan data
    Returns dict with scans per day, per device, etc.
    """
    from collections import defaultdict
    from datetime import date

    # Initialize
    stats = {
        'total_scans': len(scans),
        'scans_by_day': [],
        'scans_by_device': {'iOS': 0, 'Android': 0, 'Desktop': 0, 'Unknown': 0}
    }

    # Calculate date range
    end_date = date.today()
    start_date = end_date - timedelta(days=days-1)

    # Initialize all days with 0 scans
    scans_by_date = defaultdict(int)
    current_date = start_date
    while current_date <= end_date:
        scans_by_date[current_date.isoformat()] = 0
        current_date += timedelta(days=1)

    # Count scans
    for scan in scans:
        scan_date = scan.scanned_at.date()
        if scan_date >= start_date:
            scans_by_date[scan_date.isoformat()] += 1

        # Count by device
        device = scan.device_type or 'Unknown'
        if device in stats['scans_by_device']:
            stats['scans_by_device'][device] += 1

    # Format for charts
    stats['scans_by_day'] = [
        {'date': date_str, 'count': count}
        for date_str, count in sorted(scans_by_date.items())
    ]

    return stats
