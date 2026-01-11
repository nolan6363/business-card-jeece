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
    CORS(app, origins='*')

    # Register routes
    from app.routes import api_bp
    app.register_blueprint(api_bp, url_prefix='/api')

    # Create tables
    with app.app_context():
        db.create_all()

    return app
