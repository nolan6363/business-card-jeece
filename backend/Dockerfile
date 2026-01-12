FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Create uploads directory
RUN mkdir -p uploads

# Expose port
EXPOSE 5000

# Run with gunicorn (optimized for minimal memory usage)
# --workers 1: Single worker for low traffic apps (<100 requests/day)
# --worker-class gevent: Async worker for efficient I/O (handles multiple connections with 1 worker)
# --max-requests 1000: Recycle worker periodically to prevent memory leaks
CMD ["gunicorn", "--bind", "0.0.0.0:5000", "--workers", "1", "--worker-class", "gevent", "--max-requests", "1000", "--max-requests-jitter", "100", "--timeout", "120", "run:app"]
