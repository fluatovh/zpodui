<?php
/**
 * Dynamic API Proxy for zPodFactory
 * This script acts as a proxy to forward requests to any API endpoint dynamically
 * It bypasses CORS restrictions and allows changing the API endpoint without restarting Apache
 * SECURITY: Only allows requests to verified zPodFactory APIs
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS, PATCH');
header('Access-Control-Allow-Headers: access_token, Content-Type, Authorization, X-Requested-With');
header('Access-Control-Allow-Credentials: true');

// Handle preflight OPTIONS requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Cache file for validated endpoints (stored in /tmp)
$cacheFile = sys_get_temp_dir() . '/zpodfactory_proxy_cache.json';
$cache = [];
if (file_exists($cacheFile)) {
    $cache = json_decode(file_get_contents($cacheFile), true) ?: [];
}

// Server-side configuration file (not accessible via web)
$serverConfigFile = __DIR__ . '/.zpodfactory_config.json';

// Function to read server-side configuration (token + endpoint)
function readServerConfig() {
    global $serverConfigFile;
    $config = [
        'apiEndpoint' => null,
        'accessToken' => null
    ];
    
    if (!file_exists($serverConfigFile)) {
        return $config;
    }
    
    $content = file_get_contents($serverConfigFile);
    $data = json_decode($content, true);
    
    if ($data && is_array($data)) {
        $config['apiEndpoint'] = $data['apiEndpoint'] ?? null;
        $config['accessToken'] = $data['accessToken'] ?? null;
    }
    
    return $config;
}

// Function to save server-side configuration
function saveServerConfig($apiEndpoint, $accessToken) {
    global $serverConfigFile;
    $data = [
        'apiEndpoint' => $apiEndpoint,
        'accessToken' => $accessToken
    ];
    
    $result = file_put_contents($serverConfigFile, json_encode($data, JSON_PRETTY_PRINT));
    
    // Set secure permissions (readable/writable by owner only)
    if ($result !== false) {
        chmod($serverConfigFile, 0600);
    }
    
    return $result !== false;
}

// Function to read client-side configuration from config.js (endpoint only, no token)
function readClientConfig() {
    $configFile = __DIR__ . '/config.js';
    $config = [
        'apiEndpoint' => null
    ];
    
    if (!file_exists($configFile)) {
        return $config;
    }
    
    $content = file_get_contents($configFile);
    
    // Extract apiEndpoint (handle empty string case)
    if (preg_match('/apiEndpoint\s*:\s*[\'"]([^\'"]*)[\'"]/', $content, $matches)) {
        $endpoint = trim($matches[1]);
        if (!empty($endpoint)) {
            $config['apiEndpoint'] = $endpoint;
        }
    }
    
    return $config;
}

// Function to save client-side configuration to config.js (endpoint only, no token)
function saveClientConfig($apiEndpoint) {
    $configFile = __DIR__ . '/config.js';
    $content = "// zPod Factory Configuration\n";
    $content .= "// This file contains the API endpoint (client-side)\n";
    $content .= "// WARNING: Do not commit this file to a public repository\n\n";
    $content .= "window.ZPODFACTORY_CONFIG = {\n";
    $content .= "    apiEndpoint: '" . addslashes($apiEndpoint) . "',\n";
    $content .= "    apiBaseUrl: '/api'  // Legacy, not used anymore\n";
    $content .= "};\n";
    
    return file_put_contents($configFile, $content) !== false;
}

// Function to validate if an endpoint is a zPodFactory API
function validateZpodFactoryApi($targetUrl) {
    global $cache, $cacheFile;
    
    // Check cache first (valid for 1 hour)
    if (isset($cache[$targetUrl])) {
        $cached = $cache[$targetUrl];
        if (time() - $cached['timestamp'] < 3600) {
            return $cached['valid'];
        }
    }
    
    // Try to fetch OpenAPI JSON from common endpoints
    $openApiEndpoints = [
        '/openapi.json',
        '/docs/openapi.json',
        '/api/openapi.json',
        '/openapi',
        '/docs/openapi'
    ];
    
    $isValid = false;
    
    foreach ($openApiEndpoints as $openApiPath) {
        $openApiUrl = rtrim($targetUrl, '/') . $openApiPath;
        
        $ch = curl_init($openApiUrl);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);
        curl_setopt($ch, CURLOPT_TIMEOUT, 5);
        curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 3);
        
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        
        if ($httpCode === 200 && $response) {
            $openApi = json_decode($response, true);
            
            if ($openApi && is_array($openApi)) {
                // Check for zPodFactory-specific identifiers in OpenAPI
                $title = strtolower($openApi['info']['title'] ?? '');
                $description = strtolower($openApi['info']['description'] ?? '');
                $servers = $openApi['servers'] ?? [];
                
                // Check if it's zPodFactory API
                if (
                    strpos($title, 'zpod') !== false ||
                    strpos($title, 'zpodfactory') !== false ||
                    strpos($description, 'zpod') !== false ||
                    strpos($description, 'zpodfactory') !== false ||
                    isset($openApi['paths']['/zpods']) ||
                    isset($openApi['paths']['/api/zpods'])
                ) {
                    $isValid = true;
                    break;
                }
            }
        }
    }
    
    // If OpenAPI check failed, try to check for zPodFactory-specific endpoints
    if (!$isValid) {
        $testUrl = rtrim($targetUrl, '/') . '/zpods';
        $ch = curl_init($testUrl);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);
        curl_setopt($ch, CURLOPT_TIMEOUT, 5);
        curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 3);
        curl_setopt($ch, CURLOPT_HTTPHEADER, ['access_token: test']);
        
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        
        // If we get a response (even 401/403), it means the endpoint exists
        // If we get 404, it might not be a zPodFactory API
        if ($httpCode !== 404 && $httpCode !== 0) {
            // Additional check: look for zPodFactory-specific response structure
            $data = json_decode($response, true);
            if ($data && (is_array($data) || isset($data['detail']))) {
                // Could be a zPodFactory API (even if auth failed)
                $isValid = true;
            }
        }
    }
    
    // Cache the result
    $cache[$targetUrl] = [
        'valid' => $isValid,
        'timestamp' => time()
    ];
    
    // Save cache (keep only last 100 entries)
    if (count($cache) > 100) {
        $cache = array_slice($cache, -100, 100, true);
    }
    global $cacheFile;
    file_put_contents($cacheFile, json_encode($cache));
    
    return $isValid;
}

// Handle configuration endpoint
if (isset($_GET['action']) && $_GET['action'] === 'configure') {
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        header('Content-Type: application/json');
        $input = json_decode(file_get_contents('php://input'), true);
        $apiEndpoint = $input['apiEndpoint'] ?? '';
        $accessToken = $input['accessToken'] ?? '';
        
        if (empty($apiEndpoint) || empty($accessToken)) {
            http_response_code(400);
            echo json_encode(['error' => 'Both apiEndpoint and accessToken are required']);
            exit;
        }
        
        // Validate endpoint URL
        if (!filter_var($apiEndpoint, FILTER_VALIDATE_URL)) {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid API endpoint URL']);
            exit;
        }
        
        // Validate that it's a zPodFactory API
        if (!validateZpodFactoryApi($apiEndpoint)) {
            http_response_code(403);
            echo json_encode([
                'error' => 'Invalid API endpoint',
                'message' => 'The provided endpoint is not a valid zPodFactory API'
            ]);
            exit;
        }
        
        // Save configuration: endpoint to config.js (client), token to server config (secure)
        $savedServer = saveServerConfig($apiEndpoint, $accessToken);
        $savedClient = saveClientConfig($apiEndpoint);
        
        if ($savedServer && $savedClient) {
            echo json_encode(['success' => true, 'message' => 'Configuration saved successfully']);
        } else {
            http_response_code(500);
            $errorMsg = 'Failed to save configuration';
            if (!$savedServer) $errorMsg .= ' (server config)';
            if (!$savedClient) $errorMsg .= ' (client config)';
            echo json_encode(['error' => $errorMsg]);
        }
        exit;
    } else {
        // Return configuration page HTML
        header('Content-Type: text/html; charset=utf-8');
        $clientConfig = readClientConfig();
        $serverConfig = readServerConfig();
        $currentEndpoint = htmlspecialchars($clientConfig['apiEndpoint'] ?? $serverConfig['apiEndpoint'] ?? '');
        $hasToken = !empty($serverConfig['accessToken']);
        
        echo '<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>zPodFactory API Configuration</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }
        .container {
            background: white;
            border-radius: 10px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.2);
            max-width: 500px;
            width: 100%;
            padding: 40px;
        }
        h1 {
            color: #333;
            margin-bottom: 10px;
            font-size: 24px;
        }
        p {
            color: #666;
            margin-bottom: 30px;
            font-size: 14px;
        }
        .form-group {
            margin-bottom: 20px;
        }
        label {
            display: block;
            color: #333;
            font-weight: 600;
            margin-bottom: 8px;
            font-size: 14px;
        }
        input {
            width: 100%;
            padding: 12px;
            border: 2px solid #e0e0e0;
            border-radius: 6px;
            font-size: 14px;
            transition: border-color 0.3s;
        }
        input:focus {
            outline: none;
            border-color: #667eea;
        }
        button {
            width: 100%;
            padding: 12px;
            background: #667eea;
            color: white;
            border: none;
            border-radius: 6px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            transition: background 0.3s;
        }
        button:hover {
            background: #5568d3;
        }
        button:disabled {
            background: #ccc;
            cursor: not-allowed;
        }
        .message {
            padding: 12px;
            border-radius: 6px;
            margin-bottom: 20px;
            font-size: 14px;
        }
        .success {
            background: #d4edda;
            color: #155724;
            border: 1px solid #c3e6cb;
        }
        .error {
            background: #f8d7da;
            color: #721c24;
            border: 1px solid #f5c6cb;
        }
        .info {
            background: #d1ecf1;
            color: #0c5460;
            border: 1px solid #bee5eb;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>⚙️ zPodFactory API Configuration</h1>
        <p>Configure the API endpoint and access token for zPodFactory</p>
        <div id="message"></div>
        <form id="configForm">
            <div class="form-group">
                <label for="apiEndpoint">API Endpoint</label>
                <input type="text" id="apiEndpoint" name="apiEndpoint" value="' . $currentEndpoint . '" placeholder="http://example.com:8000" required>
            </div>
            <div class="form-group">
                <label for="accessToken">Access Token</label>
                <input type="password" id="accessToken" name="accessToken" placeholder="' . ($hasToken ? 'Token configured (leave empty to keep current)' : 'Enter access token') . '" required>
            </div>
            <button type="submit" id="submitBtn">Save Configuration</button>
        </form>
    </div>
    <script>
        document.getElementById("configForm").addEventListener("submit", async function(e) {
            e.preventDefault();
            const btn = document.getElementById("submitBtn");
            const msgDiv = document.getElementById("message");
            const endpoint = document.getElementById("apiEndpoint").value;
            const token = document.getElementById("accessToken").value;
            
            if (!endpoint || !token) {
                msgDiv.className = "message error";
                msgDiv.textContent = "Please fill in all fields";
                return;
            }
            
            btn.disabled = true;
            btn.textContent = "Saving...";
            msgDiv.className = "";
            msgDiv.textContent = "";
            
            try {
                const response = await fetch("/proxy.php?action=configure", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ apiEndpoint: endpoint, accessToken: token })
                });
                
                const data = await response.json();
                
                if (response.ok) {
                    msgDiv.className = "message success";
                    msgDiv.textContent = "Configuration saved successfully! Redirecting...";
                    setTimeout(() => {
                        window.location.href = "/";
                    }, 2000);
                } else {
                    msgDiv.className = "message error";
                    msgDiv.textContent = data.error || "Failed to save configuration";
                    btn.disabled = false;
                    btn.textContent = "Save Configuration";
                }
            } catch (error) {
                msgDiv.className = "message error";
                msgDiv.textContent = "Error: " + error.message;
                btn.disabled = false;
                btn.textContent = "Save Configuration";
            }
        });
    </script>
</body>
</html>';
        exit;
    }
}

// Read default configuration: endpoint from client config.js, token from server config
$clientConfig = readClientConfig();
$serverConfig = readServerConfig();
$defaultConfig = [
    'apiEndpoint' => $clientConfig['apiEndpoint'] ?? $serverConfig['apiEndpoint'],
    'accessToken' => $serverConfig['accessToken']  // Token only from server config
];

// Get target URL from query parameter or use default from config.js
$targetUrl = isset($_GET['target']) ? $_GET['target'] : $defaultConfig['apiEndpoint'];
$path = isset($_GET['path']) ? $_GET['path'] : '';

// If no target URL and no default, return error (client will handle redirect)
if (!$targetUrl) {
    http_response_code(400);
    echo json_encode([
        'error' => 'API endpoint not configured',
        'message' => 'Please configure the API endpoint and token first',
        'configureUrl' => '/proxy.php?action=configure'
    ]);
    exit;
}

// Validate URL format
if (!filter_var($targetUrl, FILTER_VALIDATE_URL)) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid target URL']);
    exit;
}

// SECURITY: Validate that the target is a zPodFactory API
if (!validateZpodFactoryApi($targetUrl)) {
    http_response_code(403);
    echo json_encode([
        'error' => 'Access denied: Target endpoint is not a valid zPodFactory API',
        'message' => 'This proxy only accepts requests to verified zPodFactory API endpoints'
    ]);
    exit;
}

// Construct full URL
$fullUrl = rtrim($targetUrl, '/') . '/' . ltrim($path, '/');

// Get request method
$method = $_SERVER['REQUEST_METHOD'];

// Get headers (exclude access_token from client headers for security)
$headers = [];
foreach (getallheaders() as $name => $value) {
    // Forward relevant headers (skip host, connection, content-length, transfer-encoding, and access_token)
    // access_token is handled server-side only from config.js for security
    if (!in_array(strtolower($name), ['host', 'connection', 'content-length', 'transfer-encoding', 'access_token'])) {
        $headers[] = "$name: $value";
    }
}

// Always use access_token from config.js (server-side only, never from client)
if (!empty($defaultConfig['accessToken'])) {
    $headers[] = "access_token: " . $defaultConfig['accessToken'];
} else {
    // No token configured, return error
    http_response_code(401);
    echo json_encode([
        'error' => 'Authentication token not configured',
        'message' => 'Please configure the API token in config.js'
    ]);
    exit;
}

// Get request body
$body = file_get_contents('php://input');

// Initialize cURL
$ch = curl_init($fullUrl);
curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);
curl_setopt($ch, CURLOPT_TIMEOUT, 30);

// Set headers
if (!empty($headers)) {
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
}

// Set request body for POST, PUT, PATCH, DELETE
if (in_array($method, ['POST', 'PUT', 'PATCH', 'DELETE']) && !empty($body)) {
    curl_setopt($ch, CURLOPT_POSTFIELDS, $body);
}

// Execute request
$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$contentType = curl_getinfo($ch, CURLINFO_CONTENT_TYPE);
$error = curl_error($ch);
curl_close($ch);

// Handle cURL errors
if ($error) {
    http_response_code(500);
    echo json_encode(['error' => 'Proxy error: ' . $error]);
    exit;
}

// Set response code
http_response_code($httpCode);

// Set content type if available
if ($contentType) {
    header('Content-Type: ' . $contentType);
}

// Return response
echo $response;
?>

