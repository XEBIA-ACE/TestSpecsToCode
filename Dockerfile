FROM python:3.12-slim

# Set environment variables for Python best practices
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Create and set work directory
WORKDIR /app

# Install pip and upgrade setuptools and wheel
RUN pip install --upgrade pip setuptools wheel

# Copy requirements first to leverage Docker cache
COPY requirements.txt .

# Install Flask 3.0.3 (force version in requirements)
RUN pip install Flask==3.0.3 --requirement requirements.txt

# Copy app code
COPY . .

# Expose Flask default port
EXPOSE 5000

# Set entrypoint
CMD ["flask", "run", "--host=0.0.0.0"]