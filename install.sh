#!/bin/bash

# Installation script for zPodFactory web interface
# This script installs and configures Apache2 to serve the web interface

set -e  # Stop on error

echo "=========================================="
echo "Installing zPodFactory web interface"
echo "=========================================="
echo ""

# Colors for messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to display messages
info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check that the script is run as root
if [ "$EUID" -ne 0 ]; then 
    error "This script must be run as root (use sudo)"
    exit 1
fi

# Check that we are in the correct directory
if [ ! -f "index.html" ] || [ ! -f "app.js" ] || [ ! -f "styles.css" ]; then
    error "Required files not found. Make sure you are in the project directory."
    exit 1
fi

info "Step 1/7: Checking and installing dependencies..."

# Check if Apache2 is installed
if ! command -v apache2 &> /dev/null; then
    warn "Apache2 is not installed. Installing..."
    apt update
    apt install -y apache2
else
    info "Apache2 is already installed"
fi

# Check if PHP is installed
if ! command -v php &> /dev/null; then
    warn "PHP is not installed. Installing..."
    apt update
    apt install -y php libapache2-mod-php php-curl
else
    info "PHP is already installed"
fi

# Enable required Apache2 modules
info "Step 2/7: Enabling Apache2 modules..."
# Note: proxy modules are no longer required (using PHP proxy instead)
# but we keep headers and rewrite for potential future use
a2enmod headers rewrite 2>/dev/null || {
    error "Unable to enable Apache2 modules"
    exit 1
}

# Enable PHP module (try different versions)
if command -v php &> /dev/null; then
    PHP_VERSION=$(php -r 'echo PHP_MAJOR_VERSION . "." . PHP_MINOR_VERSION;')
    info "Detected PHP version: $PHP_VERSION"
    # Try to enable the specific version module
    if a2enmod php${PHP_VERSION} 2>/dev/null; then
        info "PHP module php${PHP_VERSION} enabled"
    elif a2enmod php 2>/dev/null; then
        info "PHP module enabled"
    else
        warn "Could not auto-enable PHP module, you may need to enable it manually"
    fi
else
    warn "PHP not found, PHP module may not be enabled"
fi

info "Apache2 modules enabled"

# Copy web files
info "Step 3/7: Copying web files..."
cp index.html styles.css app.js config.js proxy.php /var/www/html/ 2>/dev/null || {
    error "Unable to copy web files"
    exit 1
}
chown www-data:www-data /var/www/html/* 2>/dev/null || {
    error "Unable to modify permissions"
    exit 1
}
info "Web files copied to /var/www/html/"

# Create secure server-side configuration file if it doesn't exist
info "Step 3.5/7: Setting up secure server-side configuration..."
SERVER_CONFIG_FILE="/var/www/html/.zpodfactory_config.json"
if [ ! -f "$SERVER_CONFIG_FILE" ]; then
    echo '{"apiEndpoint":"","accessToken":""}' > "$SERVER_CONFIG_FILE"
    chown www-data:www-data "$SERVER_CONFIG_FILE"
    chmod 600 "$SERVER_CONFIG_FILE"
    info "Created secure server-side configuration file: $SERVER_CONFIG_FILE"
    warn "Please configure the API endpoint and token via the web interface"
else
    info "Server-side configuration file already exists"
    chmod 600 "$SERVER_CONFIG_FILE" 2>/dev/null || warn "Could not set secure permissions on existing config file"
fi

# Configure Apache2
info "Step 4/7: Configuring Apache2..."
if [ -f "zpodfactory.conf" ]; then
    cp zpodfactory.conf /etc/apache2/sites-available/ 2>/dev/null || {
        error "Unable to copy Apache2 configuration"
        exit 1
    }
    info "Apache2 configuration copied"
else
    error "zpodfactory.conf file not found"
    exit 1
fi

# Enable the site
info "Step 5/7: Enabling the site..."
a2ensite zpodfactory.conf 2>/dev/null || {
    warn "Site may already be enabled"
}

# Disable default site if necessary
if [ -f "/etc/apache2/sites-enabled/000-default.conf" ]; then
    warn "Disabling default Apache2 site..."
    a2dissite 000-default.conf 2>/dev/null || {
        warn "Unable to disable default site (may already be disabled)"
    }
fi

# Check Apache2 configuration
info "Checking Apache2 configuration..."
if apache2ctl configtest 2>/dev/null; then
    info "Apache2 configuration is valid"
else
    error "Apache2 configuration contains errors"
    apache2ctl configtest
    exit 1
fi

# Restart Apache2
info "Step 6/7: Restarting Apache2..."
systemctl reload apache2 2>/dev/null || {
    error "Unable to reload Apache2"
    exit 1
}
info "Apache2 reloaded successfully"

echo ""
echo "=========================================="
echo -e "${GREEN}Installation completed successfully!${NC}"
echo "=========================================="
echo ""
echo "The web interface is now accessible at:"
echo "  http://localhost/"
echo ""
echo "To access from another computer, use:"
echo "  http://$(hostname -I | awk '{print $1}')/"
echo ""
echo "Configuration:"
echo "  - Web files: /var/www/html/"
echo "  - Apache2 configuration: /etc/apache2/sites-available/zpodfactory.conf"
echo "  - Client-side config: /var/www/html/config.js (API endpoint only)"
echo "  - Server-side config: /var/www/html/.zpodfactory_config.json (endpoint + token, secure)"
echo "  - PHP proxy: /var/www/html/proxy.php (dynamic API endpoint proxy)"
echo ""
echo "To modify the API endpoint or token, use the configuration menu"
echo "in the web interface (⚙️ button in the top right)."
echo "The API endpoint can be changed dynamically without restarting Apache."
echo ""
echo "Security:"
echo "  - The access token is stored securely server-side in .zpodfactory_config.json"
echo "  - The token is never exposed to the client (permissions 600)"
echo "  - All API requests are proxied through proxy.php which adds the token server-side"
echo ""
warn "Don't forget to configure the API endpoint and token via the web interface"
warn "configuration menu (⚙️ button) or manually edit the configuration files."
