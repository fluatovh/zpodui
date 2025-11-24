# zPodFactory Web Interface

Modern web interface to manage and visualize zPods via the zPodFactory API.

## Features

### 📦 zPod Management
- **zPod List** : Display of all zPods with their main information
- **Real-time search** : Filter by zPod name
- **zPod Creation** : "+" button to create a new zPod with automatic profile and endpoint selection if only one is available
- **Detail Page** : Complete view of a zPod with :
  - Main information (name, domain, profile, endpoint, description, status)
  - Authentication (password, owner)
  - Features (JSON configuration)
  - Dates (creation and modification)
  - Network list with distinction of the management network (untagged) and VLAN display
  - **Interactive network diagram** : Visual diagram of the network architecture
  - **Component Management** :
    - Component list with column filters (displaying Hostname instead of Component Name)
    - "+" button to add a component with complete dialog (UID, hostname, IP, vCPU, vMem, vDisks)
    - Delete button (🗑️) for each component
    - Disk options displayed only for ESXi type components
  - **DNS Entry Management** :
    - DNS entry list (Hostname, IP)
    - "+" button to add a DNS entry
    - Delete button (🗑️) for each DNS entry
  - **zPod Deletion** : Red button to delete the entire zPod
  - **Optimized Display** : Immediate display of main data without waiting for complete DNS loading

### 📋 Profile Management
- **Profile List** : Display of all available profiles with component count
- **Profile Creation** : Green "+" button to create a new profile with:
  - Profile name input
  - Component selection from active components (alphabetically sorted)
  - Component specification (CPU, RAM, and Disks for ESXi components)
  - Ability to add multiple components before creating the profile
- **Profile Editing** : Edit button (✏️) on each profile tile to:
  - Modify profile name
  - View all components with their specifications (CPU, RAM, Disks)
  - Remove components from the profile (local JavaScript, no API call until Save)
  - Add new components with full specifications (CPU, RAM, Disks for ESXi)
  - Save changes (DELETE + POST workflow to update the profile)
- **Profile Deletion** : Delete button (🗑️) on each profile tile
- **Profile Details** : Detail modal with complete component information:
  - Component UID and Name
  - CPU specifications
  - Memory (RAM) specifications
  - Disk specifications (properly displayed for ESXi components with multiple disks)

### 🧩 Component Management
- List of all components
- Filter by status (All, Active, Inactive) - **defaults to "Active"**
- Detailed information (name, UID, version, library, file, download status)

### 🔗 Endpoint Management
- List of all configured endpoints
- Configuration information (compute, network)

### 📚 Library Management
- List of all available libraries

### 🎨 User Interface
- **Light/dark theme** : Toggle in the top right
- **Burger menu** : Navigation between different pages
  - **Prefect Dashboard Link** : Direct access to Prefect dashboard (port 8060) from the menu
- **Dynamic configuration** : Menu to change API endpoint and token **without restarting Apache**
- **Password copy** : Click on any password field to copy to clipboard
- **Responsive design** : Interface adapted to different screen sizes
- **Success modals** : After adding or deleting components/zPods, choice between staying on the page or going to the Prefect dashboard
- **Loading indicators** : Hourglass animation (⏳) during deletion operations

### 🔄 Dynamic PHP Proxy
- **No Apache restart required** : Change API endpoint on the fly via web interface
- **Automatic CORS handling** : All CORS headers managed by the PHP proxy
- **Universal compatibility** : Works with any API endpoint without configuration changes
- **Full HTTP method support** : GET, POST, PUT, DELETE, PATCH, OPTIONS
- **Secure token handling** : Access token stored server-side only, never exposed to client
- **API validation** : Only accepts requests to verified zPodFactory APIs

## Prerequisites

- Apache2
- PHP (8.1 or higher) with `php-curl` extension
- Apache2 modules : `headers`, `rewrite`, `php` (or `php8.1`, `php8.2`, `php8.3`, `php8.4`)
- Access to the zPodFactory API

**Security Note**: The API access token is stored securely server-side in `.zpodfactory_config.json` (not accessible via web). Only the API endpoint is stored in `config.js` (client-side).

## Installation

### Automatic Installation

Run the installation script:

```bash
sudo ./install.sh
```

The script will:
1. Check and install dependencies (Apache2, PHP, php-curl, required modules)
2. Enable Apache2 modules (headers, rewrite, PHP)
3. Copy web files to `/var/www/html` (including `proxy.php`)
4. Create secure server-side configuration file (`.zpodfactory_config.json`)
5. Configure Apache2 with VirtualHost and PHP support
6. Enable the configuration
7. Restart Apache2

### Manual Installation

1. **Install Apache2, PHP and required modules** :
```bash
sudo apt update
sudo apt install -y apache2 php libapache2-mod-php php-curl
sudo a2enmod headers rewrite php8.4  # or php8.1, php8.2, php8.3 depending on your PHP version
sudo systemctl restart apache2
```

2. **Copy files** :
```bash
sudo cp index.html styles.css app.js config.js proxy.php /var/www/html/
sudo chown www-data:www-data /var/www/html/*
```

3. **Configure Apache2** :
```bash
sudo cp zpodfactory.conf /etc/apache2/sites-available/
sudo a2ensite zpodfactory.conf
sudo a2dissite 000-default.conf  # Disable default site
sudo systemctl reload apache2
```

4. **Configure API endpoint and token** :
   - **Via Web Interface** (Recommended): Access the web interface and use the configuration menu (⚙️) to set both the API endpoint and token
   - **Manually**: 
     - Edit `/var/www/html/config.js` to set the API endpoint (client-side):
     ```javascript
     window.ZPODFACTORY_CONFIG = {
         apiEndpoint: 'http://your-api-server:8000',
         apiBaseUrl: '/api'
     }
     ```
     - Create `/var/www/html/.zpodfactory_config.json` for server-side secure storage:
     ```json
     {
         "apiEndpoint": "http://your-api-server:8000",
         "accessToken": "YOUR_TOKEN_HERE"
     }
     ```
     - Set secure permissions: `sudo chmod 600 /var/www/html/.zpodfactory_config.json`
     - Set ownership: `sudo chown www-data:www-data /var/www/html/.zpodfactory_config.json`

**Security Note**: The access token is stored securely server-side in `.zpodfactory_config.json` (permissions 600, not accessible via web). Only the API endpoint is stored in `config.js` (client-side). The token is never exposed to the client.

## Configuration

### API Configuration

The interface allows **dynamic configuration** of:
- **API Endpoint** : zPodFactory API URL (stored in `config.js` - client-side)
- **Access Token** : Authentication token for the API (stored in `.zpodfactory_config.json` - server-side only)

**Security Architecture**:
- The **API endpoint** is stored in `config.js` (accessible to the client) to allow dynamic configuration
- The **access token** is stored securely server-side in `.zpodfactory_config.json` (not accessible via web, permissions 600)
- The token is **never exposed** to the client - all API requests are proxied through `proxy.php` which adds the token server-side
- Configuration can be changed at any time via the configuration menu (⚙️) without restarting Apache

**Important**: The API endpoint can be changed at any time via the configuration menu (⚙️) without needing to restart Apache or modify configuration files. The PHP proxy (`proxy.php`) handles all API requests dynamically and automatically adds the token from the secure server-side configuration.

### Apache2 Configuration

The `zpodfactory.conf` file configures:
- The VirtualHost to serve the web interface
- PHP processing for the dynamic proxy
- Static file caching headers
- Security settings

**Note**: Unlike previous versions, there is no hardcoded API endpoint in the Apache configuration. All API routing is handled dynamically by the PHP proxy.

## Usage

1. **Access the interface** :
   Open your browser and go to `http://your-server/`

2. **Configure the API** :
   - Click on the configuration button (⚙️) in the top right
   - Enter the API endpoint and token
   - Save

3. **Navigate** :
   - Use the burger menu (☰) in the top left to navigate between pages
   - Click on a zPod to see its complete details
   - Use filters to search and filter data
   - Access the Prefect Dashboard via the link in the burger menu

4. **Manage zPods** :
   - **Create a zPod** : Click on the "+" button on the main zPods page
   - **Delete a zPod** : On the detail page, click on the red "Delete zPod" button
   - After creation, choose to go to the Prefect dashboard or stay on the page

5. **Manage components** :
   - **Add a component** : On a zPod detail page, click on the "+" button in the Components section
   - Fill in the form (UID, hostname, IP, vCPU, vMem, and disks for ESXi)
   - **Delete a component** : Click on the trash icon (🗑️) next to the component
   - After add/delete, choose to go to the Prefect dashboard or stay on the page

6. **Manage DNS entries** :
   - **Add a DNS entry** : Click on the "+" button in the DNS section
   - **Delete a DNS entry** : Click on the trash icon (🗑️) next to the entry

7. **Manage profiles** :
   - **Create a profile** : Click on the green "+" button on the Profiles page
     - Enter a profile name
     - Select components from the dropdown (alphabetically sorted)
     - For each component, specify CPU, RAM, and Disks (for ESXi components)
     - Add multiple components before creating the profile
   - **Edit a profile** : Click on the Edit button (✏️) on a profile tile
     - Modify the profile name if needed
     - View all components with their specifications
     - Remove components by clicking the "×" button (local change, no API call)
     - Add new components by clicking "Add Component", selecting from the dropdown, and specifying CPU/RAM/Disks
     - Click "Save Changes" to apply modifications (DELETE + POST workflow)
   - **Delete a profile** : Click on the Delete button (🗑️) on a profile tile
   - **View profile details** : Click on a profile card to see complete component information (UID, Name, CPU, Mem, Disk)

8. **Copy a password** :
   - Click on any password field to automatically copy it to the clipboard

9. **Change theme** :
   - Click on the theme button (🌙/☀️) in the top right

## File Structure

```
zpodfactory/
├── index.html              # Main HTML structure
├── styles.css              # CSS styles (light/dark theme)
├── app.js                 # Main JavaScript logic
├── config.js              # Client-side configuration (API endpoint only)
├── .zpodfactory_config.json # Server-side secure configuration (endpoint + token)
├── proxy.php              # Dynamic PHP proxy for API requests
├── zpodfactory.conf       # Apache2 configuration
├── install.sh             # Automatic installation script
└── README.md              # Documentation
```

**Security Files**:
- `config.js`: Contains API endpoint only (accessible to client, used for dynamic configuration)
- `.zpodfactory_config.json`: Contains API endpoint and token (server-side only, permissions 600, not accessible via web)

## Advanced Features

### Network Diagram
The network diagram displays:
- NSX T0 with the endpoint name
- NSX T1 with the zPod profile
- Static routes NSX-T1 to zbox
- NSX segment information (VLANs)
- zbox with all its network interfaces (eth0, eth1.64, eth1.128, eth1.192)

### Component Table Filters
On a zPod detail page, the component table can be filtered by:
- Hostname (instead of Component Name)
- Component UID
- IP
- Access URL
- Credentials
- Status

### Component Management
- **Component Addition** : Complete dialog allowing selection of:
  - Component UID (alphabetically sorted list)
  - Hostname
  - Last IP octet (network prefix is automatically detected)
  - vCPU
  - vMem
  - vDisks (only for ESXi type components, up to 15 disks)
- **Component Deletion** : Deletion via API with visual confirmation

### DNS Entry Management
- **DNS Table** : Simplified display with only Hostname and IP (FQDN column removed)
- **DNS Entry Addition** : Green "+" button to quickly add an entry
- **DNS Entry Deletion** : Red trash button for each entry

### Prefect Dashboard Integration
- Direct link in the burger menu to the Prefect dashboard
- URL automatically built from the API endpoint (same IP, port 8060)
- Success modals offering to go to the dashboard after important operations

### Dynamic PHP Proxy
- **No Apache restart required** : The API endpoint can be changed dynamically via the web interface
- **CORS handling** : The PHP proxy automatically handles CORS headers for all API requests
- **Flexible routing** : Works with any API endpoint without configuration changes
- **All HTTP methods supported** : GET, POST, PUT, DELETE, PATCH, OPTIONS
- **Secure token handling** : The access token is stored server-side only and automatically added to all API requests
- **Server-side security** : Token never exposed to client, stored in `.zpodfactory_config.json` with permissions 600
- **API validation** : Only accepts requests to verified zPodFactory APIs (validates OpenAPI schema)

## Troubleshooting

### API Not Responding
- Check that the API endpoint is correct in the configuration menu (⚙️)
- Verify that PHP is installed and the `php-curl` extension is enabled: `php -m | grep curl`
- Check that the PHP module is enabled in Apache: `apache2ctl -M | grep php`
- Check Apache2 logs: `sudo tail -f /var/log/apache2/error.log`
- Test the PHP proxy directly: `curl "http://localhost/proxy.php?target=http%3A%2F%2F172.16.0.10%3A8000&path=health"`

### CORS Error
- The PHP proxy should handle CORS automatically
- Check that `proxy.php` is accessible and has correct permissions
- Verify PHP is processing correctly: `php -v`
- Check Apache2 error logs for PHP errors

### Token Not Working
- Check that the token is correct in the server-side configuration file: `/var/www/html/.zpodfactory_config.json`
- Verify file exists and permissions: `ls -l /var/www/html/.zpodfactory_config.json` (should be 600, owned by www-data)
- Verify file content: `sudo cat /var/www/html/.zpodfactory_config.json` (should contain valid JSON with apiEndpoint and accessToken)
- Use the configuration menu (⚙️) to update the token
- Check API logs for authentication errors
- Verify the token is NOT exposed in `config.js` (it should only contain the endpoint, no token)
- Check Apache error logs: `sudo tail -f /var/log/apache2/error.log` for PHP errors
- Note: The token is added server-side by `proxy.php`, so it won't appear in browser network tab headers

### PHP Proxy Issues
- Ensure `php-curl` is installed: `sudo apt install php-curl`
- Check PHP error logs: `sudo tail -f /var/log/apache2/error.log`
- Verify `proxy.php` permissions: `ls -l /var/www/html/proxy.php`
- Test PHP processing: Create a test file `test.php` with `<?php phpinfo(); ?>` and access it via browser

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for more details.

## Support

For any questions or issues, consult the zPodFactory API documentation or contact the system administrator.
