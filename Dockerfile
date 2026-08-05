# Base Image
FROM python:3.12-slim as base

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends gcc libpq-dev \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Specify default command
CMD ["flask", "run", "--host=0.0.0.0"]

# Define Flask-specific environment variables
ENV FLASK_APP=app.py
ENV FLASK_ENV=production

# Expose the application port
EXPOSE 5000

# Health-check (optional, just an example)
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s \
    CMD curl -f http://localhost:5000/ || exit 1