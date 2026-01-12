import os
from flask import Flask
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from app.config import Config

db = SQLAlchemy()

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # Initialize extensions
    db.init_app(app)

    # Configure CORS properly for cross-origin requests
    CORS(app,
         resources={r"/api/*": {
             "origins": ["https://card.jeece.fr", "http://localhost:3000", "http://localhost:5173"],
             "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
             "allow_headers": ["Content-Type", "Authorization"],
             "expose_headers": ["Content-Type", "Authorization"],
             "supports_credentials": False,
             "max_age": 3600
         }})

    # Create uploads folder if it doesn't exist
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

    # Register routes
    from app.routes import api_bp
    app.register_blueprint(api_bp, url_prefix='/api')

    # Create tables
    with app.app_context():
        db.create_all()

    return app
