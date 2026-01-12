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

    # Configure CORS for browser clients (Dashboard hosted on another domain)
    # Default: allow your production frontend + local dev.
    cors_origins_raw = os.getenv(
        "CORS_ORIGINS",
        "https://card.jeece.fr,http://localhost:3333,http://localhost:5173",
    )
    cors_origins = [o.strip() for o in cors_origins_raw.split(",") if o.strip()]

    # If user sets "*" explicitly, do not enable credentials (required by CORS spec).
    supports_credentials = cors_origins != ["*"]

    CORS(
        app,
        resources={r"/api/*": {"origins": cors_origins}},
        supports_credentials=supports_credentials,
        allow_headers=["Content-Type", "Authorization"],
        methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        max_age=86400,
    )

    # Create uploads folder if it doesn't exist
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

    # Register routes
    from app.routes import api_bp
    app.register_blueprint(api_bp, url_prefix='/api')

    # Create tables
    with app.app_context():
        db.create_all()

    return app
