FROM python:3.12-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

WORKDIR /app

# Create a non-root user for security
RUN addgroup --system django && adduser --system --ingroup django django-user

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Install python dependencies
COPY requirements.txt .
RUN pip install --upgrade pip && pip install -r requirements.txt

# Copy project files
COPY . .

# Collect static files (uses placeholder keys from settings.py)
RUN python manage.py collectstatic --noinput

# Change ownership of the app directory to the non-root user
RUN chown -R django-user:django /app

# Switch to the non-root user
USER django-user

# Run Daphne (ASGI server)
CMD ["daphne", "-b", "0.0.0.0", "-p", "8000", "config.asgi:application"]
