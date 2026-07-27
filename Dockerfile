FROM python:3.12-slim AS builder

WORKDIR /app

# Install build dependencies (if any)
# RUN apt-get update && apt-get install -y build-essential

# Upgrade pip and install dependencies if a requirements file is provided
COPY requirements.txt .
RUN pip install --upgrade pip && \
    if [ -f requirements.txt ]; then pip install --user -r requirements.txt; fi

COPY . .

# If applicable, build the application (e.g. compile assets)

# Final image
FROM python:3.12-slim

WORKDIR /app

# Copy installed dependencies from builder layer (if --user was used, add to PATH/ENV)
COPY --from=builder /root/.local /root/.local
ENV PATH=/root/.local/bin:$PATH

COPY . .

EXPOSE 8000

# Default command; update if a different entrypoint is required
CMD ["python", "app.py"]