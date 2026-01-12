import os
from dotenv import load_dotenv

# Get the base directory (backend folder)
BASE_DIR = os.path.abspath(os.path.dirname(os.path.dirname(__file__)))

# Get the project root directory (parent of backend)
PROJECT_ROOT = os.path.dirname(BASE_DIR)

# Only load .env if it exists (local dev)
# In Docker, variables come from docker-compose.yml
# Check both current directory and parent directory for .env file
env_path = os.path.join(PROJECT_ROOT, '.env')
if os.path.exists(env_path):
    load_dotenv(env_path)
elif os.path.exists('.env'):
    load_dotenv()

class Config:
    # Database
    SQLALCHEMY_DATABASE_URI = os.getenv('DATABASE_URL', 'postgresql://admin:password@localhost:5432/business_cards')
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # Security
    SECRET_KEY = os.getenv('SECRET_KEY', 'dev-secret-key-change-in-production')
    ADMIN_PASSWORD = os.getenv('ADMIN_PASSWORD', 'admin123')

    # Upload settings
    UPLOAD_FOLDER = os.path.join(BASE_DIR, 'uploads')
    MAX_CONTENT_LENGTH = 5 * 1024 * 1024  # 5MB max file size
    ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'webp'}

    # JWT
    JWT_EXPIRATION_HOURS = 24
