from app import create_app

app = create_app()

if __name__ == '__main__':
    # Only used for local development - Docker uses Gunicorn directly
    app.run(host='0.0.0.0', port=5000, debug=False)
