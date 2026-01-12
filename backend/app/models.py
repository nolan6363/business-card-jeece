import uuid
from datetime import datetime
from app import db

class Card(db.Model):
    __tablename__ = 'cards'

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    first_name = db.Column(db.String(100), nullable=False)
    last_name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(255), nullable=False)
    phone = db.Column(db.String(50), nullable=True)
    company = db.Column(db.String(255), nullable=False)
    position = db.Column(db.String(255), nullable=False)
    website = db.Column(db.String(500), nullable=True)
    photo_path = db.Column(db.String(500), nullable=True)
    is_active = db.Column(db.Boolean, default=True, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    # Relationship
    scans = db.relationship('Scan', backref='card', lazy=True, cascade='all, delete-orphan')

    def to_dict(self):
        return {
            'id': self.id,
            'first_name': self.first_name,
            'last_name': self.last_name,
            'email': self.email,
            'phone': self.phone,
            'company': self.company,
            'position': self.position,
            'website': self.website,
            'photo_path': self.photo_path,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat(),
            'scan_count': len(self.scans)
        }

class Scan(db.Model):
    __tablename__ = 'scans'

    id = db.Column(db.Integer, primary_key=True)
    card_id = db.Column(db.String(36), db.ForeignKey('cards.id'), nullable=False)
    scanned_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    user_agent = db.Column(db.String(500), nullable=True)
    device_type = db.Column(db.String(50), nullable=True)  # iOS, Android, Desktop

    def to_dict(self):
        return {
            'id': self.id,
            'card_id': self.card_id,
            'scanned_at': self.scanned_at.isoformat(),
            'user_agent': self.user_agent,
            'device_type': self.device_type
        }
