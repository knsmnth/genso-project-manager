
FROM php:8.2-cli-alpine

# Install system dependencies and PHP extensions
RUN apk add --no-cache \
    sqlite-libs \
    sqlite-dev \
    libzip-dev \
    zip \
    unzip \
    git \
    curl \
    && docker-php-ext-install pdo pdo_sqlite pdo_mysql zip pcntl

# Install Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /app

# Copy application files
COPY . .

# Install PHP dependencies
RUN composer install --no-dev --optimize-autoloader --no-interaction

# Create database folder and sqlite file if not present
RUN mkdir -p database && touch database/database.sqlite

# Ensure permissions for Laravel
RUN chmod -R 777 storage bootstrap/cache database

# Default port
EXPOSE 8080

# Run migrations and start server
CMD ["sh", "-c", "if [ -z \"$APP_KEY\" ]; then php artisan key:generate --force; fi && php artisan migrate --force && php artisan serve --host=0.0.0.0 --port=${PORT:-8080}"]
