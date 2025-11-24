// Configuration - Token will be loaded exclusively from config.js
let config = {
    apiBaseUrl: '/api',  // Legacy, not used anymore (replaced by PHP proxy)
    accessToken: null,
    apiEndpoint: null  // API endpoint (configured via config.js or UI settings)
};

// Endpoints cache (id -> name)
let endpointsCache = {};

// Application state
let currentPage = 'zpods';
let currentZpodId = null;
let allZpods = []; // Store all zPods for filtering

// DOM elements
const zpodsContainer = document.getElementById('zpodsContainer');
const loadingElement = document.getElementById('loading');
const loadingText = document.getElementById('loadingText');
const errorElement = document.getElementById('error');
const refreshBtn = document.getElementById('refreshBtn');
const statusIndicator = document.getElementById('statusIndicator');
const statusText = document.getElementById('statusText');
const configBtn = document.getElementById('configBtn');
const configModal = document.getElementById('configModal');
const closeConfigModal = document.getElementById('closeConfigModal');
const cancelConfig = document.getElementById('cancelConfig');
const configForm = document.getElementById('configForm');
const apiEndpointInput = document.getElementById('apiEndpoint');
const apiTokenInput = document.getElementById('apiToken');
const menuToggle = document.getElementById('menuToggle');
const sidebar = document.getElementById('sidebar');
const sidebarOverlay = document.getElementById('sidebarOverlay');
const closeSidebar = document.getElementById('closeSidebar');
const navItems = document.querySelectorAll('.nav-item');
const pageTitle = document.getElementById('pageTitle');
const pageSubtitle = document.getElementById('pageSubtitle');
const profileDetailModal = document.getElementById('profileDetailModal');
const closeProfileDetailModal = document.getElementById('closeProfileDetailModal');
const profileDetailTitle = document.getElementById('profileDetailTitle');
const profileDetailContent = document.getElementById('profileDetailContent');
const componentFilter = document.getElementById('componentFilter');
const zpodDetailContainer = document.getElementById('zpodDetailContainer');
const backToZpodsBtn = document.getElementById('backToZpodsBtn');
const refreshZpodDetailBtn = document.getElementById('refreshZpodDetailBtn');
const deleteZpodBtn = document.getElementById('deleteZpodBtn');
const addDnsModal = document.getElementById('addDnsModal');
const closeAddDnsModalBtn = document.getElementById('closeAddDnsModal');
const cancelAddDnsBtn = document.getElementById('cancelAddDnsBtn');
const addDnsForm = document.getElementById('addDnsForm');
const dashboardLink = document.getElementById('dashboardLink');
const addComponentModal = document.getElementById('addComponentModal');
const closeAddComponentModalBtn = document.getElementById('closeAddComponentModal');
const cancelAddComponentBtn = document.getElementById('cancelAddComponentBtn');
const addComponentForm = document.getElementById('addComponentForm');
const componentUidSelect = document.getElementById('componentUid');
const componentIpPrefix = document.getElementById('componentIpPrefix');
const componentDisksContainer = document.getElementById('componentDisksContainer');
const addDiskBtn = document.getElementById('addDiskBtn');
const componentSuccessModal = document.getElementById('componentSuccessModal');
const componentSuccessTitle = document.getElementById('componentSuccessTitle');
const componentSuccessMessage = document.getElementById('componentSuccessMessage');
const goToDashboardBtn = document.getElementById('goToDashboardBtn');
const stayOnPageBtn = document.getElementById('stayOnPageBtn');
const addZpodBtn = document.getElementById('addZpodBtn');
const addZpodModal = document.getElementById('addZpodModal');
const closeAddZpodModalBtn = document.getElementById('closeAddZpodModal');
const cancelAddZpodBtn = document.getElementById('cancelAddZpodBtn');
const addZpodForm = document.getElementById('addZpodForm');
const zpodNameInput = document.getElementById('zpodName');
const zpodProfileSelect = document.getElementById('zpodProfile');
const zpodEndpointSelect = document.getElementById('zpodEndpoint');
const zpodSuccessModal = document.getElementById('zpodSuccessModal');
const goToDashboardZpodBtn = document.getElementById('goToDashboardZpodBtn');
const stayOnZpodPageBtn = document.getElementById('stayOnZpodPageBtn');
const addProfileBtn = document.getElementById('addProfileBtn');
const addProfileModal = document.getElementById('addProfileModal');
const closeAddProfileModalBtn = document.getElementById('closeAddProfileModal');
const cancelAddProfileBtn = document.getElementById('cancelAddProfileBtn');
const addProfileForm = document.getElementById('addProfileForm');
const profileNameInput = document.getElementById('profileName');
const addComponentToProfileBtn = document.getElementById('addComponentToProfileBtn');
const addComponentToProfileModal = document.getElementById('addComponentToProfileModal');
const closeAddComponentToProfileModalBtn = document.getElementById('closeAddComponentToProfileModal');
const cancelAddComponentToProfileBtn = document.getElementById('cancelAddComponentToProfileBtn');
const addComponentToProfileForm = document.getElementById('addComponentToProfileForm');
const profileComponentUidSelect = document.getElementById('profileComponentUid');
const addProfileComponentSelect = document.getElementById('addProfileComponentSelect');
const addComponentToNewProfileBtn = document.getElementById('addComponentToNewProfileBtn');
const editProfileModal = document.getElementById('editProfileModal');
const closeEditProfileModalBtn = document.getElementById('closeEditProfileModal');
const cancelEditProfileBtn = document.getElementById('cancelEditProfileBtn');
const editProfileForm = document.getElementById('editProfileForm');
const editProfileIdInput = document.getElementById('editProfileId');
const editProfileNameInput = document.getElementById('editProfileName');
const editProfileComponentsList = document.getElementById('editProfileComponentsList');
const addComponentToEditProfileBtn = document.getElementById('addComponentToEditProfileBtn');
const editProfileComponentSelect = document.getElementById('editProfileComponentSelect');
const addComponentWithSpecsModal = document.getElementById('addComponentWithSpecsModal');
const closeAddComponentWithSpecsModalBtn = document.getElementById('closeAddComponentWithSpecsModal');
const cancelAddComponentWithSpecsBtn = document.getElementById('cancelAddComponentWithSpecsBtn');
const addComponentWithSpecsForm = document.getElementById('addComponentWithSpecsForm');
const componentSpecName = document.getElementById('componentSpecName');
const componentSpecUid = document.getElementById('componentSpecUid');
const componentSpecVcpu = document.getElementById('componentSpecVcpu');
const componentSpecVmem = document.getElementById('componentSpecVmem');
const componentSpecDisksGroup = document.getElementById('componentSpecDisksGroup');
const componentSpecDisksContainer = document.getElementById('componentSpecDisksContainer');
const addSpecDiskBtn = document.getElementById('addSpecDiskBtn');

// Load configuration exclusively from config.js (endpoint only, token is server-side)
function loadConfig() {
    // Load from config.js only (endpoint, no token)
    if (typeof window.ZPODFACTORY_CONFIG !== 'undefined' && window.ZPODFACTORY_CONFIG !== null) {
        config.apiBaseUrl = window.ZPODFACTORY_CONFIG.apiBaseUrl || config.apiBaseUrl;
        if (window.ZPODFACTORY_CONFIG.apiEndpoint) {
            config.apiEndpoint = window.ZPODFACTORY_CONFIG.apiEndpoint;
        }
    } else {
        // config.js not loaded or doesn't exist
        console.warn('config.js not found or not loaded');
        config.apiEndpoint = null;
    }
    
    // Token is not loaded from client-side config (it's server-side only)
    // We only check if endpoint is configured
    const endpointValid = config.apiEndpoint && typeof config.apiEndpoint === 'string' && config.apiEndpoint.trim().length > 0;
    
    if (!endpointValid) {
        // Redirect to configuration page
        console.log('Configuration incomplete: endpoint not configured');
        window.location.replace('/proxy.php?action=configure');
        return;
    }
    
    // Configuration is valid, update proxy config
    updateProxyConfig(config.apiEndpoint);
}

// Save configuration is now handled by proxy.php (saves to config.js)
// This function is kept for compatibility but doesn't use localStorage anymore
function saveConfig() {
    // Configuration is saved in config.js via proxy.php
    // Just update the dashboard link
    updateDashboardLink();
}

// Update dashboard link with API IP
function updateDashboardLink() {
    if (!dashboardLink) return;
    
    try {
        // Extract IP from API endpoint
        const endpoint = config.apiEndpoint || '';
        if (!endpoint) {
            console.warn('No API endpoint configured, cannot build dashboard URL');
            return;
        }
        const apiUrl = new URL(endpoint);
        const dashboardUrl = `${apiUrl.protocol}//${apiUrl.hostname}:8060`;
        dashboardLink.href = dashboardUrl;
    } catch (error) {
        console.error('Error building dashboard URL:', error);
        // If error, try to extract from current dashboard link or leave empty
        if (dashboardLink.href && dashboardLink.href.includes(':8060')) {
            // Keep existing URL if valid
            return;
        }
        console.warn('Could not build dashboard URL from API endpoint');
    }
}

// Update proxy configuration
// With PHP proxy, endpoint changes are dynamic and don't require Apache restart
function updateProxyConfig(endpoint) {
    config.apiEndpoint = endpoint;
}

// Load configuration into form
function loadConfigIntoForm() {
    apiEndpointInput.value = config.apiEndpoint || '';
    // Don't display token, leave field empty
    apiTokenInput.value = '';
    apiTokenInput.setAttribute('data-real-token', config.accessToken || '');
    apiTokenInput.setAttribute('type', 'password');
}

// Save configuration from form to config.js via proxy.php
async function saveConfigFromForm() {
    const endpoint = apiEndpointInput.value.trim();
    const newToken = apiTokenInput.value.trim();
    // Get the real stored token
    const realToken = apiTokenInput.getAttribute('data-real-token') || '';
    
    // Use new token if entered, otherwise keep the old one
    const token = newToken || realToken;
    
    if (!endpoint) {
        alert('Please fill in the API endpoint');
        return false;
    }
    
    if (!token) {
        alert('Please enter an access token');
        return false;
    }
    
    // Validate URL
    try {
        new URL(endpoint);
    } catch (e) {
        alert('Invalid URL. Please enter a valid URL (e.g., http://example.com:8000)');
        return false;
    }
    
    // Save to config.js via proxy.php
    try {
        const response = await fetch('/proxy.php?action=configure', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                apiEndpoint: endpoint,
                accessToken: token
            })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            alert('Error saving configuration: ' + (data.error || 'Unknown error'));
            return false;
        }
        
        // Update local config (endpoint only, token is server-side)
        config.apiEndpoint = endpoint;
        // Token is stored server-side only, not in client config
        updateProxyConfig(endpoint);
        updateDashboardLink();
        
        // Reload page to load new config.js
        window.location.reload();
        
        return true;
    } catch (error) {
        alert('Error saving configuration: ' + error.message);
        return false;
    }
}

// Function to fetch endpoints from API
async function fetchEndpoints() {
    try {
        // Use dynamic PHP proxy
        const apiUrl = getApiUrl('/endpoints');

        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                // access_token is handled server-side by proxy.php from config.js
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            const endpoints = await response.json();
            // Create id -> name cache
            endpointsCache = {};
            endpoints.forEach(endpoint => {
                endpointsCache[endpoint.id] = endpoint.name;
            });
            console.log('Endpoints loaded:', endpointsCache);
        } else {
            console.warn('Unable to load endpoints:', response.status);
        }
    } catch (error) {
        console.warn('Error fetching endpoints:', error);
        // Don't block application if endpoints can't be loaded
    }
}

// Function to get endpoint name from its ID
function getEndpointName(endpointId) {
    if (!endpointId) return 'N/A';
    return endpointsCache[endpointId] || `Endpoint #${endpointId}`;
}

// Utility function to get API URL
// Uses dynamic PHP proxy to allow changing endpoint without restarting Apache
function getApiUrl(endpoint) {
    // apiEndpoint should be set from config.js or user configuration
    // If not set, we cannot make API calls
    if (!config.apiEndpoint) {
        console.error('API endpoint not configured. Please configure it in the settings menu.');
        throw new Error('API endpoint not configured');
    }
    
    // Remove leading slash from endpoint if present
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint.substring(1) : endpoint;
    
    // Use PHP proxy with target and path parameters
    const target = encodeURIComponent(config.apiEndpoint);
    const path = encodeURIComponent(cleanEndpoint);
    
    return `/proxy.php?target=${target}&path=${path}`;
}

// Function to fetch profiles (without display, for dropdowns)
async function fetchProfilesList() {
    try {
        const apiUrl = getApiUrl('/profiles');
        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                // access_token is handled server-side by proxy.php from config.js
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
        }
        
        const profiles = await response.json();
        return profiles;
    } catch (error) {
        console.error('Error fetching profiles:', error);
        return [];
    }
}

// Function to fetch endpoints (without display, for dropdowns)
async function fetchEndpointsListForSelect() {
    try {
        const apiUrl = getApiUrl('/endpoints');
        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                // access_token is handled server-side by proxy.php from config.js
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
        }
        
        const endpoints = await response.json();
        return endpoints;
    } catch (error) {
        console.error('Error fetching endpoints:', error);
        return [];
    }
}

// Function to initialize add zPod button
function initAddZpodButton() {
    if (!addZpodBtn) return;

    addZpodBtn.addEventListener('click', async () => {
        // Reset form first
        if (addZpodForm) {
            addZpodForm.reset();
        }
        
        // Fetch profiles and endpoints
        const [profiles, endpoints] = await Promise.all([
            fetchProfilesList(),
            fetchEndpointsListForSelect()
        ]);
        
        // Fill profile dropdown
        if (zpodProfileSelect) {
            zpodProfileSelect.innerHTML = '<option value="">Select a profile...</option>';
            profiles.forEach(profile => {
                const option = document.createElement('option');
                option.value = profile.name || profile.profile_name || '';
                option.textContent = profile.name || profile.profile_name || '';
                zpodProfileSelect.appendChild(option);
            });
            
            // Auto-select if only one profile
            if (profiles.length === 1) {
                const selectedValue = profiles[0].name || profiles[0].profile_name || '';
                zpodProfileSelect.value = selectedValue;
            }
        }
        
        // Fill endpoint dropdown
        if (zpodEndpointSelect) {
            zpodEndpointSelect.innerHTML = '<option value="">Select an endpoint...</option>';
            endpoints.forEach(endpoint => {
                const option = document.createElement('option');
                option.value = endpoint.id || '';
                option.textContent = endpoint.name || `Endpoint #${endpoint.id}`;
                zpodEndpointSelect.appendChild(option);
            });
            
            // Auto-select if only one endpoint
            if (endpoints.length === 1) {
                const selectedValue = endpoints[0].id || '';
                zpodEndpointSelect.value = selectedValue;
            }
        }
        
        // Show modal
        if (addZpodModal) {
            addZpodModal.classList.remove('hidden');
        }
    });
}

// Function to close add zPod modal
function closeAddZpodModal() {
    if (addZpodModal) {
        addZpodModal.classList.add('hidden');
    }
}

// Function to create a zPod
async function createZpod(zpodData) {
    try {
        const apiUrl = getApiUrl('/zpods');
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                // access_token is handled server-side by proxy.php from config.js
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(zpodData)
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Error ${response.status}: ${errorText}`);
        }

        const result = await response.json();
        return result;
    } catch (error) {
        console.error('Error creating zPod:', error);
        throw error;
    }
}

// Function to delete a zPod
async function deleteZpod(zpodId) {
    try {
        const apiUrl = getApiUrl(`/zpods/${zpodId}`);
        const response = await fetch(apiUrl, {
            method: 'DELETE',
            headers: {
                // access_token is handled server-side by proxy.php from config.js
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Error ${response.status}: ${errorText}`);
        }

        return true;
    } catch (error) {
        console.error('Error deleting zPod:', error);
        throw error;
    }
}

// Function to create a profile
async function createProfile(profileName, components = []) {
    try {
        // Build profile array from components list
        // Components can be either strings (UIDs) or objects with UID and optional specs
        const profileArray = components.map(comp => {
            if (typeof comp === 'string') {
                // Simple UID string
                return {
                    component_uid: comp
                };
            } else {
                // Object with UID and optional specs
                const componentData = {
                    component_uid: comp.uid || comp.component_uid
                };
                if (comp.vcpu) {
                    componentData.vcpu = comp.vcpu;
                }
                if (comp.vmem) {
                    componentData.vmem = comp.vmem;
                }
                if (comp.vdisks && Array.isArray(comp.vdisks) && comp.vdisks.length > 0) {
                    componentData.vdisks = comp.vdisks;
                }
                return componentData;
            }
        });
        
        const apiUrl = getApiUrl('/profiles');
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                // access_token is handled server-side by proxy.php from config.js
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: profileName,
                profile: profileArray
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Error ${response.status}: ${errorText}`);
        }

        const result = await response.json();
        return result;
    } catch (error) {
        console.error('Error creating profile:', error);
        throw error;
    }
}

// Function to delete a profile
async function deleteProfile(profileId) {
    try {
        const apiUrl = getApiUrl(`/profiles/${profileId}`);
        const response = await fetch(apiUrl, {
            method: 'DELETE',
            headers: {
                // access_token is handled server-side by proxy.php from config.js
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Error ${response.status}: ${errorText}`);
        }

        return true;
    } catch (error) {
        console.error('Error deleting profile:', error);
        throw error;
    }
}

// Function to add a component to a profile
async function addComponentToProfile(profileId, componentUid) {
    try {
        // First, get the current profile
        const getUrl = getApiUrl(`/profiles/${profileId}`);
        const getResponse = await fetch(getUrl, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!getResponse.ok) {
            throw new Error(`Error fetching profile: ${getResponse.status}`);
        }

        const profile = await getResponse.json();
        
        // Add the component to the profile array
        const updatedProfile = profile.profile || [];
        updatedProfile.push({
            component_uid: componentUid
        });

        // Update the profile - try PATCH first, then PUT
        const updateUrl = getApiUrl(`/profiles/${profileId}`);
        let updateResponse = await fetch(updateUrl, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: profile.name,
                profile: updatedProfile
            })
        });

        // If PATCH doesn't work (405), try PUT
        if (!updateResponse.ok && updateResponse.status === 405) {
            console.log('PATCH not supported, trying PUT...');
            updateResponse = await fetch(updateUrl, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: profile.name,
                    profile: updatedProfile
                })
            });
        }

        if (!updateResponse.ok) {
            const errorText = await updateResponse.text();
            throw new Error(`Error ${updateResponse.status}: ${errorText}`);
        }

        const result = await updateResponse.json();
        return result;
    } catch (error) {
        console.error('Error adding component to profile:', error);
        throw error;
    }
}


// Functions to fetch data for each page
async function fetchProfiles() {
    try {
        showLoading(true, 'Loading profiles...');
        hideError();
        
        const apiUrl = getApiUrl('/profiles');
        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                // access_token is handled server-side by proxy.php from config.js
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
        }
        
        const profiles = await response.json();
        displayProfiles(profiles);
    } catch (error) {
        console.error('Error fetching profiles:', error);
        showError(error.message || 'An error occurred while fetching profiles.');
        document.getElementById('profilesContainer').innerHTML = '';
    } finally {
        showLoading(false);
    }
}

// Store components for filtering
let allComponents = [];

async function fetchComponents() {
    try {
        showLoading(true, 'Loading components...');
        hideError();
        
        const apiUrl = getApiUrl('/components');
        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                // access_token is handled server-side by proxy.php from config.js
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
        }
        
        allComponents = await response.json();
        // Set default filter to "Active"
        if (componentFilter) {
            componentFilter.value = 'ACTIVE';
        }
        applyComponentFilter();
    } catch (error) {
        console.error('Error fetching components:', error);
        showError(error.message || 'An error occurred while fetching components.');
        document.getElementById('componentsContainer').innerHTML = '';
        allComponents = [];
    } finally {
        showLoading(false);
    }
}

// Function to apply filter on components
function applyComponentFilter() {
    const filterValue = componentFilter ? componentFilter.value : 'ACTIVE';
    let filteredComponents = allComponents;
    
    if (filterValue !== 'all') {
        filteredComponents = allComponents.filter(comp => {
            const status = (comp.status || '').toUpperCase();
            return status === filterValue.toUpperCase();
        });
    }
    
    displayComponents(filteredComponents);
}

async function fetchEndpointsList() {
    try {
        showLoading(true, 'Loading endpoints...');
        hideError();
        
        const apiUrl = getApiUrl('/endpoints');
        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                // access_token is handled server-side by proxy.php from config.js
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
        }
        
        const endpoints = await response.json();
        displayEndpoints(endpoints);
        
        // Update cache
        endpointsCache = {};
        endpoints.forEach(endpoint => {
            endpointsCache[endpoint.id] = endpoint.name;
        });
    } catch (error) {
        console.error('Error fetching endpoints:', error);
        showError(error.message || 'An error occurred while fetching endpoints.');
        document.getElementById('endpointsContainer').innerHTML = '';
    } finally {
        showLoading(false);
    }
}

async function fetchLibraries() {
    try {
        showLoading(true, 'Loading libraries...');
        hideError();
        
        const apiUrl = getApiUrl('/libraries');
        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                // access_token is handled server-side by proxy.php from config.js
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
        }
        
        const libraries = await response.json();
        displayLibraries(libraries);
    } catch (error) {
        console.error('Error fetching libraries:', error);
        showError(error.message || 'An error occurred while fetching libraries.');
        document.getElementById('librariesContainer').innerHTML = '';
    } finally {
        showLoading(false);
    }
}

// Function to extract all components from a profile
function extractProfileComponents(profileData) {
    const components = [];
    
    if (!profileData || !Array.isArray(profileData)) {
        return components;
    }
    
    profileData.forEach(item => {
        if (Array.isArray(item)) {
            // It's an array of components with details
            item.forEach(comp => {
                if (comp && typeof comp === 'object') {
                    // Handle vdisks array for ESXi components
                    let diskDisplay = 'N/A';
                    if (comp.vdisks && Array.isArray(comp.vdisks) && comp.vdisks.length > 0) {
                        diskDisplay = comp.vdisks.join(', ') + ' GB';
                    } else if (comp.disk) {
                        diskDisplay = comp.disk + ' GB';
                    } else if (comp.vdisk) {
                        diskDisplay = comp.vdisk + ' GB';
                    }
                    
                    components.push({
                        uid: comp.component_uid || 'N/A',
                        name: comp.hostname || comp.component_uid || 'N/A',
                        cpu: comp.vcpu || comp.cpu || 'N/A',
                        mem: comp.vmem || comp.mem || 'N/A',
                        disk: diskDisplay
                    });
                }
            });
        } else if (item && typeof item === 'object' && item.component_uid) {
            // It's a simple component
            // Handle vdisks array for ESXi components
            let diskDisplay = 'N/A';
            if (item.vdisks && Array.isArray(item.vdisks) && item.vdisks.length > 0) {
                diskDisplay = item.vdisks.join(', ') + ' GB';
            } else if (item.disk) {
                diskDisplay = item.disk + ' GB';
            } else if (item.vdisk) {
                diskDisplay = item.vdisk + ' GB';
            }
            
            components.push({
                uid: item.component_uid,
                name: item.component_uid,
                cpu: item.vcpu || item.cpu || 'N/A',
                mem: item.vmem || item.mem || 'N/A',
                disk: diskDisplay
            });
        }
    });
    
    return components;
}

// Function to count components in a profile
function countProfileComponents(profileData) {
    let count = 0;
    
    if (!profileData || !Array.isArray(profileData)) {
        return 0;
    }
    
    profileData.forEach(item => {
        if (Array.isArray(item)) {
            count += item.length;
        } else if (item && typeof item === 'object') {
            count += 1;
        }
    });
    
    return count;
}

// Function to display profile details in a modal
function showProfileDetails(profile) {
    const components = extractProfileComponents(profile.profile);
    
    profileDetailTitle.textContent = `📋 Profile: ${escapeHtml(profile.name)}`;
    
    if (components.length === 0) {
        profileDetailContent.innerHTML = '<p>No components in this profile.</p>';
    } else {
        profileDetailContent.innerHTML = `
            <div class="components-table">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>UID</th>
                            <th>Name</th>
                            <th>CPU</th>
                            <th>Mem</th>
                            <th>Disk</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${components.map(comp => `
                            <tr>
                                <td>${escapeHtml(comp.uid)}</td>
                                <td>${escapeHtml(comp.name)}</td>
                                <td>${escapeHtml(comp.cpu)}</td>
                                <td>${escapeHtml(comp.mem)}${comp.mem !== 'N/A' ? ' GB' : ''}</td>
                                <td>${escapeHtml(comp.disk)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }
    
    profileDetailModal.classList.remove('hidden');
}

// Display functions
function displayProfiles(profiles) {
    const container = document.getElementById('profilesContainer');
    if (!profiles || profiles.length === 0) {
        container.innerHTML = '<div class="empty-state"><div class="empty-state-icon">📋</div><h2>No profiles found</h2><p>There are currently no profiles available.</p></div>';
        return;
    }
    
    container.innerHTML = profiles.map(profile => {
        const creationDate = formatDate(profile.creation_date);
        const lastModified = formatDate(profile.last_modified_date);
        const componentCount = countProfileComponents(profile.profile);
        
        return `
            <div class="card profile-card" data-profile-id="${profile.id}">
                <div class="card-header">
                    <div>
                        <div class="card-title">${escapeHtml(profile.name)}</div>
                        <div class="card-subtitle">ID: ${profile.id}</div>
                    </div>
                    <div class="card-actions" style="display: flex; gap: 8px;">
                        <button class="btn-edit-profile" data-profile-id="${profile.id}" data-profile-name="${escapeHtml(profile.name)}" title="Edit profile" style="background: var(--primary-color); color: white; border: none; border-radius: 6px; width: 32px; height: 32px; font-size: 16px; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; transition: all 0.3s ease; box-shadow: var(--shadow);">
                            ✏️
                        </button>
                        <button class="btn-delete-profile" data-profile-id="${profile.id}" data-profile-name="${escapeHtml(profile.name)}" title="Delete profile" style="background: #ef4444; color: white; border: none; border-radius: 6px; width: 32px; height: 32px; font-size: 16px; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; transition: all 0.3s ease; box-shadow: var(--shadow);">
                            🗑️
                        </button>
                    </div>
                </div>
                <div class="card-info" style="cursor: pointer;">
                    <div class="info-item">
                        <span class="info-label">📦 Components:</span>
                        <span class="info-value">${componentCount}</span>
                    </div>
                </div>
                <div class="card-details" style="cursor: pointer;">
                    <div class="details-title">📊 Details</div>
                    <div class="details-grid">
                        <div class="detail-item">
                            <span class="detail-label">Created:</span>
                            <span class="detail-value">${creationDate}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Modified:</span>
                            <span class="detail-value">${lastModified}</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
    
    // Add click events on profile cards (excluding buttons)
    container.querySelectorAll('.profile-card').forEach(card => {
        const cardInfo = card.querySelector('.card-info');
        const cardDetails = card.querySelector('.card-details');
        
        if (cardInfo) {
            cardInfo.addEventListener('click', () => {
                const profileId = parseInt(card.dataset.profileId);
                const profile = profiles.find(p => p.id === profileId);
                if (profile) {
                    showProfileDetails(profile);
                }
            });
        }
        
        if (cardDetails) {
            cardDetails.addEventListener('click', () => {
                const profileId = parseInt(card.dataset.profileId);
                const profile = profiles.find(p => p.id === profileId);
                if (profile) {
                    showProfileDetails(profile);
                }
            });
        }
    });
    
    // Initialize delete and edit buttons
    initDeleteProfileButtons();
    initEditProfileButtons();
}

// Function to initialize edit profile buttons
function initEditProfileButtons() {
    const editButtons = document.querySelectorAll('.btn-edit-profile');
    editButtons.forEach(button => {
        button.addEventListener('click', async (e) => {
            e.stopPropagation(); // Prevent card click
            
            const profileId = parseInt(button.dataset.profileId);
            
            if (!profileId) {
                alert('Profile ID not found');
                return;
            }
            
            // Fetch profile details
            try {
                const apiUrl = getApiUrl(`/profiles/${profileId}`);
                const response = await fetch(apiUrl, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });

                if (!response.ok) {
                    throw new Error(`Error ${response.status}`);
                }

                const profile = await response.json();
                openEditProfileModal(profile);
            } catch (error) {
                alert(`Error loading profile: ${error.message}`);
            }
        });
    });
}

// Store components for editing (local JavaScript array, not sent to API until Save)
let editProfileComponents = [];
// Track if we're adding component for edit or create
let isAddingComponentForEdit = false;

// Function to open edit profile modal
function openEditProfileModal(profile) {
    if (!editProfileModal || !editProfileNameInput || !editProfileIdInput || !editProfileComponentsList) {
        return;
    }
    
    // Set profile data
    editProfileIdInput.value = profile.id;
    editProfileNameInput.value = profile.name || '';
    
    // Extract all components with their full properties
    editProfileComponents = [];
    const profileData = profile.profile || [];
    
    // Flatten the profile array to get all components
    profileData.forEach(item => {
        if (Array.isArray(item)) {
            item.forEach(comp => {
                if (comp && typeof comp === 'object' && comp.component_uid) {
                    editProfileComponents.push(JSON.parse(JSON.stringify(comp)));
                }
            });
        } else if (item && typeof item === 'object' && item.component_uid) {
            editProfileComponents.push(JSON.parse(JSON.stringify(item)));
        }
    });
    
    // Display components
    updateEditProfileComponentsList();
    
    // Show modal
    editProfileModal.classList.remove('hidden');
}

// Function to update the components list display in edit profile modal
function updateEditProfileComponentsList() {
    if (!editProfileComponentsList) return;
    
    if (editProfileComponents.length === 0) {
        editProfileComponentsList.innerHTML = '<p style="color: var(--text-secondary);">No components in this profile.</p>';
    } else {
        editProfileComponentsList.innerHTML = editProfileComponents.map((comp, index) => {
            const isEsxi = comp.component_uid && (comp.component_uid.toLowerCase().includes('esxi') || comp.component_uid.toLowerCase().startsWith('esxi'));
            
            // Build specs display
            const specsParts = [];
            if (comp.vcpu) {
                specsParts.push(`<span style="color: var(--text-primary);"><strong>CPU:</strong> ${comp.vcpu}</span>`);
            }
            if (comp.vmem) {
                specsParts.push(`<span style="color: var(--text-primary);"><strong>RAM:</strong> ${comp.vmem} GB</span>`);
            }
            if (isEsxi && comp.vdisks && Array.isArray(comp.vdisks) && comp.vdisks.length > 0) {
                specsParts.push(`<span style="color: var(--text-primary);"><strong>Disks:</strong> ${comp.vdisks.join(', ')} GB</span>`);
            }
            
            const specsHtml = specsParts.length > 0 
                ? `<div style="margin-top: 4px; display: flex; flex-wrap: wrap; gap: 12px; font-size: 0.9em;">${specsParts.join('')}</div>`
                : '';
            
            return `
            <div style="display: flex; justify-content: space-between; align-items: flex-start; padding: 12px; background: var(--bg-primary); border: 1px solid var(--border-color); border-radius: 4px; margin-bottom: 8px;">
                <div style="flex: 1;">
                    <div>
                        <strong style="color: var(--text-primary);">${escapeHtml(comp.component_uid)}</strong>
                    </div>
                    ${specsHtml}
                </div>
                <button type="button" class="btn-remove-edit-component" data-index="${index}" style="background: #ef4444; color: white; border: none; border-radius: 4px; width: 28px; height: 28px; cursor: pointer; font-size: 18px; font-weight: bold; line-height: 1; margin-left: 12px; flex-shrink: 0; transition: background 0.2s;" onmouseover="this.style.background='#dc2626'" onmouseout="this.style.background='#ef4444'">×</button>
            </div>
        `;
        }).join('');
        
        // Add event listeners to remove buttons
        editProfileComponentsList.querySelectorAll('.btn-remove-edit-component').forEach(btn => {
            btn.addEventListener('click', () => {
                const index = parseInt(btn.dataset.index);
                removeComponentFromEditList(index);
            });
        });
    }
}

// Function to remove component from edit list (JavaScript only, no API call)
function removeComponentFromEditList(index) {
    if (index >= 0 && index < editProfileComponents.length) {
        editProfileComponents.splice(index, 1);
        updateEditProfileComponentsList();
    }
}

// Function to close edit profile modal
function closeEditProfileModal() {
    if (editProfileModal) {
        editProfileModal.classList.add('hidden');
    }
    // Reset components list
    editProfileComponents = [];
    if (editProfileComponentsList) {
        editProfileComponentsList.innerHTML = '';
    }
    // Reset edit mode flag
    isAddingComponentForEdit = false;
}

// Function to open add component modal for edit profile
async function openAddComponentForEditProfile() {
    // Set context to edit mode
    isAddingComponentForEdit = true;
    
    // Load active components
    try {
        const activeComponents = await fetchActiveComponents();
        
        // Use the edit profile component select
        if (editProfileComponentSelect) {
            editProfileComponentSelect.innerHTML = '<option value="">Select a component...</option>';
            
            const sortedComponents = activeComponents.sort((a, b) => {
                const nameA = (a.component_name || a.uid || '').toLowerCase();
                const nameB = (b.component_name || b.uid || '').toLowerCase();
                return nameA.localeCompare(nameB);
            });
            
            sortedComponents.forEach(comp => {
                const option = document.createElement('option');
                option.value = comp.uid || comp.component_uid || '';
                option.textContent = `${comp.component_name || comp.uid || comp.component_uid || 'Unknown'} (${comp.uid || comp.component_uid || ''})`;
                editProfileComponentSelect.appendChild(option);
            });
            
            // Show the select dropdown
            editProfileComponentSelect.style.display = 'block';
        }
    } catch (error) {
        alert(`Error loading components: ${error.message}`);
        isAddingComponentForEdit = false;
    }
}

// Function to initialize delete profile buttons
function initDeleteProfileButtons() {
    const deleteButtons = document.querySelectorAll('.btn-delete-profile');
    deleteButtons.forEach(button => {
        button.addEventListener('click', async (e) => {
            e.stopPropagation(); // Prevent card click
            
            const profileId = parseInt(button.dataset.profileId);
            const profileName = button.dataset.profileName || `Profile #${profileId}`;
            
            if (!confirm(`Are you sure you want to delete the profile "${profileName}"? This action cannot be undone.`)) {
                return;
            }
            
            // Disable button during deletion
            button.disabled = true;
            button.innerHTML = '⏳';
            
            try {
                await deleteProfile(profileId);
                
                // Reload profiles list
                await fetchProfiles();
            } catch (error) {
                alert(`Error deleting profile: ${error.message}`);
                // Re-enable button on error
                button.disabled = false;
                button.innerHTML = '🗑️';
            }
        });
    });
}


// Function to initialize add profile button
function initAddProfileButton() {
    if (!addProfileBtn) return;

    addProfileBtn.addEventListener('click', async () => {
        // Reset form
        if (addProfileForm) {
            addProfileForm.reset();
        }
        
        // Clear components list
        const componentsList = document.getElementById('addProfileComponentsList');
        if (componentsList) {
            componentsList.innerHTML = '<p style="color: var(--text-secondary); margin: 0;">No components added yet. Click the button below to add components.</p>';
        }
        
        // Load active components into select
        await loadActiveComponentsIntoSelect();
        
        // Show modal
        if (addProfileModal) {
            addProfileModal.classList.remove('hidden');
        }
    });
}


// Function to close add profile modal
function closeAddProfileModal() {
    if (addProfileModal) {
        addProfileModal.classList.add('hidden');
        // Reset form
        if (addProfileForm) {
            addProfileForm.reset();
            delete addProfileForm.dataset.profileId;
        }
        // Reset components list
        newProfileComponents = [];
        updateNewProfileComponentsList([]);
        // Hide components section
        const componentsSection = document.getElementById('addProfileComponentsSection');
        if (componentsSection) {
            componentsSection.style.display = 'none';
        }
        // Reload profiles list
        if (currentPage === 'profiles') {
            fetchProfiles();
        }
    }
}

// Function to close add component to profile modal
function closeAddComponentToProfileModal() {
    if (addComponentToProfileModal) {
        addComponentToProfileModal.classList.add('hidden');
    }
}

function displayComponents(components) {
    const container = document.getElementById('componentsContainer');
    if (!components || components.length === 0) {
        container.innerHTML = '<div class="empty-state"><div class="empty-state-icon">🧩</div><h2>No components found</h2><p>There are currently no components available.</p></div>';
        return;
    }
    
    container.innerHTML = components.map(comp => {
        return `
            <div class="card">
                <div class="card-header">
                    <div>
                        <div class="card-title">${escapeHtml(comp.component_name || comp.component_uid)}</div>
                        <div class="card-subtitle">${escapeHtml(comp.component_uid)}</div>
                    </div>
                    <span class="status-badge ${getStatusClass(comp.status)}">${getStatusLabel(comp.status)}</span>
                </div>
                <div class="card-info">
                    <div class="info-item">
                        <span class="info-label">📦 Version:</span>
                        <span class="info-value">${escapeHtml(comp.component_version || 'N/A')}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">📚 Library:</span>
                        <span class="info-value">${escapeHtml(comp.library_name || 'N/A')}</span>
                    </div>
                    ${comp.component_description ? `
                        <div class="zpod-description">${escapeHtml(comp.component_description)}</div>
                    ` : ''}
                </div>
                <div class="card-details">
                    <div class="details-title">📊 Details</div>
                    <div class="details-grid">
                        ${comp.filename ? `
                            <div class="detail-item">
                                <span class="detail-label">File:</span>
                                <span class="detail-value">${escapeHtml(comp.filename)}</span>
                            </div>
                        ` : ''}
                        ${comp.download_status ? `
                            <div class="detail-item">
                                <span class="detail-label">Download:</span>
                                <span class="detail-value">${escapeHtml(comp.download_status)}</span>
                            </div>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function displayEndpoints(endpoints) {
    const container = document.getElementById('endpointsContainer');
    if (!endpoints || endpoints.length === 0) {
        container.innerHTML = '<div class="empty-state"><div class="empty-state-icon">🔗</div><h2>No endpoints found</h2><p>There are currently no endpoints available.</p></div>';
        return;
    }
    
    container.innerHTML = endpoints.map(endpoint => {
        return `
            <div class="card">
                <div class="card-header">
                    <div>
                        <div class="card-title">${escapeHtml(endpoint.name)}</div>
                        <div class="card-subtitle">ID: ${endpoint.id}</div>
                    </div>
                    <span class="status-badge ${getStatusClass(endpoint.status)}">${getStatusLabel(endpoint.status)}</span>
                </div>
                <div class="card-info">
                    ${endpoint.description ? `
                        <div class="zpod-description">${escapeHtml(endpoint.description)}</div>
                    ` : ''}
                </div>
                ${endpoint.endpoints ? `
                    <div class="card-details">
                        <div class="details-title">Configuration</div>
                        <div class="details-grid">
                            ${endpoint.endpoints.compute ? `
                                <div class="detail-item">
                                    <span class="detail-label">Compute Driver:</span>
                                    <span class="detail-value">${escapeHtml(endpoint.endpoints.compute.driver || 'N/A')}</span>
                                </div>
                                <div class="detail-item">
                                    <span class="detail-label">Hostname:</span>
                                    <span class="detail-value">${escapeHtml(endpoint.endpoints.compute.hostname || 'N/A')}</span>
                                </div>
                                <div class="detail-item">
                                    <span class="detail-label">Datacenter:</span>
                                    <span class="detail-value">${escapeHtml(endpoint.endpoints.compute.datacenter || 'N/A')}</span>
                                </div>
                            ` : ''}
                            ${endpoint.endpoints.network ? `
                                <div class="detail-item">
                                    <span class="detail-label">Network Driver:</span>
                                    <span class="detail-value">${escapeHtml(endpoint.endpoints.network.driver || 'N/A')}</span>
                                </div>
                                <div class="detail-item">
                                    <span class="detail-label">Network Hostname:</span>
                                    <span class="detail-value">${escapeHtml(endpoint.endpoints.network.hostname || 'N/A')}</span>
                                </div>
                                <div class="detail-item">
                                    <span class="detail-label">Networks:</span>
                                    <span class="detail-value">${escapeHtml(endpoint.endpoints.network.networks || 'N/A')}</span>
                                </div>
                            ` : ''}
                        </div>
                    </div>
                ` : ''}
            </div>
        `;
    }).join('');
}

function displayLibraries(libraries) {
    const container = document.getElementById('librariesContainer');
    if (!libraries || libraries.length === 0) {
        container.innerHTML = '<div class="empty-state"><div class="empty-state-icon">📚</div><h2>No libraries found</h2><p>There are currently no libraries available.</p></div>';
        return;
    }
    
    container.innerHTML = libraries.map(lib => {
        const creationDate = formatDate(lib.creation_date);
        const lastModified = formatDate(lib.last_modified_date);
        const enabledStatus = lib.enabled ? 'Active' : 'Inactive';
        const enabledClass = lib.enabled ? 'status-active' : 'status-inactive';
        
        return `
            <div class="card">
                <div class="card-header">
                    <div>
                        <div class="card-title">${escapeHtml(lib.name)}</div>
                        <div class="card-subtitle">ID: ${lib.id}</div>
                    </div>
                    <span class="status-badge ${enabledClass}">${enabledStatus}</span>
                </div>
                <div class="card-info">
                    ${lib.description ? `
                        <div class="zpod-description">${escapeHtml(lib.description)}</div>
                    ` : ''}
                    ${lib.git_url ? `
                        <div class="info-item">
                            <span class="info-label">🔗 Git URL:</span>
                            <span class="info-value">${escapeHtml(lib.git_url)}</span>
                        </div>
                    ` : ''}
                </div>
                <div class="card-details">
                    <div class="details-title">📊 Details</div>
                    <div class="details-grid">
                        <div class="detail-item">
                            <span class="detail-label">Created:</span>
                            <span class="detail-value">${creationDate}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Modified:</span>
                            <span class="detail-value">${lastModified}</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// Fonction pour récupérer les zPods depuis l'API
async function fetchZpods() {
    try {
        showLoading(true, 'Loading zPods...');
        hideError();
        updateStatus('Connecting...', false);

        // Load endpoints first
        await fetchEndpoints();

        // Use dynamic PHP proxy for all requests
        const apiUrl = getApiUrl('/zpods');
        
        console.log('Connection attempt to:', apiUrl);
        console.log('API Endpoint:', config.apiEndpoint);
        console.log('Token:', config.accessToken ? 'Present' : 'Missing');

        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                // access_token is handled server-side by proxy.php from config.js
                'Content-Type': 'application/json'
            }
        });

        console.log('Response received:', response.status, response.statusText);

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Response error:', errorText);
            if (response.status === 401) {
                throw new Error('Authentication error. Check your token.');
            } else if (response.status === 404) {
                throw new Error(`Endpoint not found (${apiUrl}). Check the API URL.`);
            } else if (response.status === 0 || response.type === 'opaque') {
                throw new Error('CORS error. The API must allow requests from this domain.');
            } else {
                throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
            }
        }

        const zpods = await response.json();
        updateStatus('Connected', true);
        allZpods = zpods; // Store all zPods
        displayZpods(allZpods); // Display all zPods by default
    } catch (error) {
        console.error('Error fetching zPods:', error);
        showError(error.message || 'An error occurred while fetching zPods.');
        updateStatus('Error', false);
        zpodsContainer.innerHTML = '';
    } finally {
        showLoading(false);
    }
}

// Navigation entre les pages
function navigateToPage(page) {
    // Cacher toutes les pages
    document.querySelectorAll('.page-content').forEach(p => p.classList.add('hidden'));
    
    // Show requested page
    const pageElement = document.getElementById(`page-${page}`);
    if (pageElement) {
        pageElement.classList.remove('hidden');
    }
    
    // Update active menu
    navItems.forEach(item => {
        if (item.dataset.page === page) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
    
    // Update title
    const pageTitles = {
        'zpods': { title: '🚀 zPod Factory', subtitle: 'zPod Manager' },
        'profiles': { title: '📋 Profiles', subtitle: 'Profile Management' },
        'components': { title: '🧩 Components', subtitle: 'Component Management' },
        'endpoints': { title: '🔗 Endpoints', subtitle: 'Endpoint Management' },
        'libraries': { title: '📚 Libraries', subtitle: 'Library Management' }
    };
    
    const pageInfo = pageTitles[page] || pageTitles['zpods'];
    pageTitle.textContent = pageInfo.title;
    pageSubtitle.textContent = pageInfo.subtitle;
    
    currentPage = page;
    
    // Charger les données de la page
    loadPageData(page);
}

// Charger les données de la page
function loadPageData(page) {
    switch(page) {
        case 'zpods':
            fetchZpods();
            break;
        case 'profiles':
            fetchProfiles();
            break;
        case 'components':
            fetchComponents();
            break;
        case 'endpoints':
            fetchEndpointsList();
            break;
        case 'libraries':
            fetchLibraries();
            break;
        case 'zpod-detail':
            if (currentZpodId) {
                fetchZpodDetail(currentZpodId);
            }
            break;
    }
}

// Function to display zPods
function displayZpods(zpods) {
    if (!zpods || zpods.length === 0) {
        zpodsContainer.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📦</div>
                <h2>No zPods found</h2>
                <p>${allZpods.length > 0 ? 'No zPods match your search.' : 'There are currently no zPods available.'}</p>
            </div>
        `;
        return;
    }

    zpodsContainer.innerHTML = zpods.map(zpod => createZpodCard(zpod)).join('');
    
    // Add click events on zPod cards
    zpodsContainer.querySelectorAll('.zpod-card').forEach(card => {
        card.addEventListener('click', () => {
            const zpodId = parseInt(card.dataset.zpodId);
            navigateToZpodDetail(zpodId);
        });
    });
}

// Function to apply search filter on zPods
function applyZpodFilter() {
    if (!allZpods || allZpods.length === 0) {
        return; // No zPods to filter
    }
    
    const searchInput = document.getElementById('zpodSearchFilter');
    const searchTerm = searchInput ? searchInput.value.toLowerCase().trim() : '';
    
    let filteredZpods = allZpods;
    
    if (searchTerm && searchTerm.length > 0) {
        filteredZpods = allZpods.filter(zpod => {
            const name = (zpod.name || '').toLowerCase();
            return name.includes(searchTerm);
        });
    }
    
    displayZpods(filteredZpods);
}

// Function to create a zPod card
function createZpodCard(zpod) {
    const statusClass = getStatusClass(zpod.status);
    const statusLabel = getStatusLabel(zpod.status);
    const creationDate = formatDate(zpod.creation_date);
    const lastModified = formatDate(zpod.last_modified_date);

    return `
        <div class="zpod-card" data-zpod-id="${zpod.id}" style="cursor: pointer;">
            <div class="zpod-header">
                <div>
                    <div class="zpod-name">${escapeHtml(zpod.name)}</div>
                    <div class="zpod-id">ID: ${escapeHtml(zpod.id)}</div>
                </div>
                <span class="status-badge ${statusClass}">${statusLabel}</span>
            </div>

            ${zpod.description ? `
                <div class="zpod-description">
                    ${escapeHtml(zpod.description)}
                </div>
            ` : ''}

            <div class="zpod-info">
                <div class="info-item">
                    <span class="info-label">🌐 Domain:</span>
                    <span class="info-value">${escapeHtml(zpod.domain)}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">📋 Profile:</span>
                    <span class="info-value">${escapeHtml(zpod.profile)}</span>
                </div>
                ${zpod.endpoint ? `
                    <div class="info-item">
                        <span class="info-label">🔗 Endpoint:</span>
                        <span class="info-value">${escapeHtml(zpod.endpoint.name || getEndpointName(zpod.endpoint.id) || 'N/A')}</span>
                    </div>
                ` : ''}
            </div>

            <div class="zpod-details">
                <div class="details-title">📊 Details</div>
                <div class="details-grid">
                    <div class="detail-item">
                        <span class="detail-label">Created:</span>
                        <span class="detail-value">${creationDate}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Modified:</span>
                        <span class="detail-value">${lastModified}</span>
                    </div>
                    ${zpod.networks && zpod.networks.length > 0 ? `
                        <div class="detail-item">
                            <span class="detail-label">Networks:</span>
                            <span class="detail-value">${zpod.networks.length}</span>
                        </div>
                    ` : ''}
                    ${zpod.components && zpod.components.length > 0 ? `
                        <div class="detail-item">
                            <span class="detail-label">Components:</span>
                            <span class="detail-value">${zpod.components.length}</span>
                        </div>
                    ` : ''}
                </div>
            </div>
        </div>
    `;
}

// Function to fetch all DNS entries of a zPod
async function fetchZpodDnsEntries(zpodId) {
    try {
        const apiUrl = getApiUrl(`/zpods/${zpodId}/dns`);
        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                // access_token is handled server-side by proxy.php from config.js
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            // If endpoint doesn't exist or returns an error, return empty array
            if (response.status === 404) {
                return [];
            }
            throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
        }
        
        const dnsEntries = await response.json();
        return Array.isArray(dnsEntries) ? dnsEntries : [];
    } catch (error) {
        console.error('Error fetching DNS entries:', error);
        // Return empty array on error to not block display
        return [];
    }
}

// Function to reset delete button
function resetDeleteButton() {
    if (deleteZpodBtn) {
        deleteZpodBtn.disabled = false;
        deleteZpodBtn.innerHTML = '<span class="icon">🗑️</span> Delete zPod';
    }
}

// Function to fetch zPod details
async function fetchZpodDetail(zpodId) {
    // Reset delete button at start of loading
    resetDeleteButton();
    try {
        showLoading(true, 'Loading zPod details...');
        hideError();
        
        const apiUrl = getApiUrl(`/zpods/${zpodId}`);
        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                // access_token is handled server-side by proxy.php from config.js
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
        }
        
        const zpod = await response.json();
        
        // Fetch components with their unique IDs from dedicated endpoint
        try {
            const componentsResponse = await fetch(getApiUrl(`/zpods/${zpodId}/components`), {
                method: 'GET',
                headers: {
                    // access_token is handled server-side by proxy.php from config.js
                    'Content-Type': 'application/json'
                }
            });
            if (componentsResponse.ok) {
                const componentsWithIds = await componentsResponse.json();
                // Create hostname -> ID mapping to merge with components
                const idMap = {};
                componentsWithIds.forEach((comp, idx) => {
                    const hostname = comp.hostname;
                    if (hostname) {
                        // Search for ID in different possible properties
                        idMap[hostname] = comp.id || comp.component_instance_id || comp.component_id || idx;
                    }
                });
                
                // Merge IDs with zPod components
                if (zpod.components && Array.isArray(zpod.components)) {
                    zpod.components.forEach((comp) => {
                        if (comp.hostname && idMap[comp.hostname] !== undefined) {
                            comp.component_instance_id = idMap[comp.hostname];
                        }
                    });
                }
            }
        } catch (error) {
            console.error('Error fetching component IDs:', error);
        }
        
        // Display immediately with empty DNS table
        zpod.dns_entries = [];
        displayZpodDetail(zpod);
        showLoading(false);
        
        // Load DNS in background and update
        fetchZpodDnsEntries(zpodId).then(dnsEntries => {
            updateDnsTable(zpodId, dnsEntries);
        }).catch(error => {
            console.error('Error fetching DNS entries:', error);
            // Display discrete error message or leave empty
        });
    } catch (error) {
        console.error('Error fetching zPod details:', error);
        showError(error.message || 'An error occurred while fetching zPod details.');
        if (zpodDetailContainer) {
            zpodDetailContainer.innerHTML = '';
        }
        showLoading(false);
    }
}

// Function to display zPod detail page
function displayZpodDetail(zpod) {
    if (!zpodDetailContainer) return;
    
    const statusClass = getStatusClass(zpod.status);
    const statusLabel = getStatusLabel(zpod.status);
    const creationDate = formatDate(zpod.creation_date);
    const lastModified = formatDate(zpod.last_modified_date);
    
    // Récupérer le propriétaire
    const owner = zpod.permissions && zpod.permissions.length > 0 
        ? zpod.permissions.find(p => p.permission === 'OWNER')
        : null;
    const ownerUsers = owner && owner.users ? owner.users.map(u => u.username || u.email).join(', ') : 'N/A';
    
    // Formater les features
    const featuresText = zpod.features && Object.keys(zpod.features).length > 0
        ? JSON.stringify(zpod.features, null, 2)
        : 'None';
    
    zpodDetailContainer.innerHTML = `
        <div class="zpod-detail-card">
            <div class="zpod-detail-header">
                <div>
                    <h2 class="zpod-detail-name">${escapeHtml(zpod.name)}</h2>
                    <div class="zpod-detail-meta">
                        <div class="zpod-detail-id">ID: ${zpod.id}</div>
                        <div class="zpod-detail-date">Created: ${creationDate}</div>
                        ${lastModified !== creationDate ? `<div class="zpod-detail-date">Modified: ${lastModified}</div>` : ''}
                    </div>
                </div>
                <span class="status-badge ${statusClass}" style="font-size: 1rem; padding: 10px 20px;">${statusLabel}</span>
            </div>

            <div class="zpod-detail-sections">
                <!-- Main Information -->
                <div class="detail-section">
                    <h3 class="section-title"><span>📋</span> Main Information</h3>
                    <div class="detail-grid">
                        <div class="detail-item">
                            <span class="detail-label">Name</span>
                            <span class="detail-value">${escapeHtml(zpod.name)}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Domain</span>
                            <span class="detail-value">${escapeHtml(zpod.domain)}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Profile</span>
                            <span class="detail-value">${escapeHtml(zpod.profile)}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Endpoint</span>
                            <span class="detail-value">${escapeHtml(zpod.endpoint ? (zpod.endpoint.name || getEndpointName(zpod.endpoint.id) || 'N/A') : 'N/A')}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Status</span>
                            <span class="detail-value"><span class="status-badge ${statusClass}">${statusLabel}</span></span>
                        </div>
                        ${zpod.description ? `
                            <div class="detail-item full-width">
                                <span class="detail-label">Description</span>
                                <span class="detail-value">${escapeHtml(zpod.description)}</span>
                            </div>
                        ` : ''}
                    </div>
                </div>

                <!-- Authentication -->
                <div class="detail-section">
                    <h3 class="section-title"><span>🔐</span> Authentication</h3>
                    <div class="detail-grid">
                        <div class="detail-item">
                            <span class="detail-label">Password</span>
                            <span class="detail-value password-copyable" data-password="${escapeHtml(zpod.password || '')}" style="font-family: 'Courier New', monospace; font-weight: 600; cursor: pointer; user-select: none;" title="Click to copy">${escapeHtml(zpod.password || 'N/A')}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Owner</span>
                            <span class="detail-value">${escapeHtml(ownerUsers)}</span>
                        </div>
                    </div>
                </div>

                <!-- Features -->
                <div class="detail-section full-width">
                    <h3 class="section-title"><span>⚙️</span> Features</h3>
                    <pre class="features-code">${escapeHtml(featuresText)}</pre>
                </div>

                <!-- Networks -->
                ${zpod.networks && zpod.networks.length > 0 ? `
                    <div class="detail-section full-width">
                        <h3 class="section-title"><span>🌐</span> Networks <span style="font-size: 0.9rem; font-weight: 400; color: var(--text-secondary);">(${zpod.networks.length})</span></h3>
                        <div class="networks-list" style="margin-bottom: 24px;">
                            ${zpod.networks.map((network, idx) => {
                                const isManagement = idx === 0; // The first network is the management network (untagged)
                                const ipParts = network.cidr ? network.cidr.split('/')[0].split('.') : [];
                                const vlan = ipParts.length > 0 ? ipParts[3] : null;
                                const vlanDisplay = vlan ? `VLAN ${vlan}` : '';
                                
                                return `
                                <div class="network-item ${isManagement ? 'network-management' : ''}">
                                    <div class="network-info">
                                        <span class="network-cidr ${isManagement ? 'network-bold' : ''}">${escapeHtml(network.cidr || 'N/A')}</span>
                                        ${isManagement ? `<span class="network-tag network-tag-management">Management (Untagged)</span>` : ''}
                                        ${!isManagement && vlanDisplay ? `<span class="network-tag network-tag-vlan">${vlanDisplay}</span>` : ''}
                                    </div>
                                    ${network.id ? `<span class="network-id">ID: ${network.id}</span>` : ''}
                                </div>
                            `;
                            }).join('')}
                        </div>
                        <div class="network-diagram-container">
                            <div id="networkDiagram-${zpod.id}" class="network-diagram"></div>
                        </div>
                    </div>
                ` : ''}

                <!-- Components -->
                ${zpod.components && zpod.components.length > 0 ? `
                    <div class="detail-section full-width">
                        <h3 class="section-title">
                            <span>🧩</span> Components <span style="font-size: 0.9rem; font-weight: 400; color: var(--text-secondary);">(<span id="component-count-${zpod.id}">${zpod.components.length}</span>)</span>
                            <button class="btn-reload-table" id="reload-components-${zpod.id}" title="Reload components table" style="background: var(--primary-color); color: white; border: none; border-radius: 8px; width: 32px; height: 32px; font-size: 16px; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; margin-left: 12px; transition: all 0.3s ease; box-shadow: var(--shadow);">🔄</button>
                            <button class="btn-add-component" id="add-component-${zpod.id}" title="Add a component" style="background: var(--success-color); color: white; border: none; border-radius: 8px; width: 32px; height: 32px; font-size: 16px; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; margin-left: 8px; transition: all 0.3s ease; box-shadow: var(--shadow);">+</button>
                        </h3>
                        <div class="table-filters" id="component-filters-${zpod.id}">
                            <input type="text" class="table-filter" data-column="0" placeholder="🔍 Filter by hostname..." />
                            <input type="text" class="table-filter" data-column="1" placeholder="🔍 Filter by UID..." />
                            <input type="text" class="table-filter" data-column="2" placeholder="🔍 Filter by IP..." />
                            <input type="text" class="table-filter" data-column="3" placeholder="🔍 Filter by URL..." />
                            <input type="text" class="table-filter" data-column="4" placeholder="🔍 Filter by credentials..." />
                            <select class="table-filter" data-column="5">
                                <option value="">All statuses</option>
                                <option value="ACTIVE">Active</option>
                                <option value="INACTIVE">Inactive</option>
                                <option value="STOPPED">Stopped</option>
                                <option value="PENDING">Pending</option>
                            </select>
                        </div>
                        <div class="components-table-wrapper">
                            <table class="data-table" id="components-table-${zpod.id}">
                                <thead>
                                    <tr>
                                        <th>Hostname</th>
                                        <th>Component UID</th>
                                        <th>IP</th>
                                        <th>Access URL</th>
                                        <th>Credentials</th>
                                        <th>Status</th>
                                        <th style="width: 60px; text-align: center;">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${zpod.components.map((comp, idx) => {
                                        const component = comp.component || {};
                                        const accessUrl = comp.fqdn ? `https://${escapeHtml(comp.fqdn)}` : (comp.ip ? `https://${escapeHtml(comp.ip)}` : 'N/A');
                                        const credentials = comp.usernames && comp.usernames.length > 0
                                            ? comp.usernames.map(u => `<div style="margin-bottom: 4px;"><strong>${escapeHtml(u.username)}</strong> <span style="color: var(--text-secondary); font-size: 0.85rem;">(${escapeHtml(u.type)})</span></div>`).join('')
                                            : 'N/A';
                                        const password = comp.password ? `<div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid var(--border-color);"><span style="font-size: 0.85rem; color: var(--text-secondary);">Password:</span> <code class="password-copyable" data-password="${escapeHtml(comp.password)}" style="background: var(--bg-card-hover); padding: 2px 6px; border-radius: 4px; font-family: 'Courier New', monospace; cursor: pointer; user-select: none;" title="Click to copy">${escapeHtml(comp.password)}</code></div>` : '';
                                        const hostname = comp.hostname || 'N/A';
                                        
                                        return `
                                            <tr data-component-hostname="${escapeHtml((hostname || 'N/A').toLowerCase())}" 
                                                data-component-uid="${escapeHtml((component.component_uid || 'N/A').toLowerCase())}" 
                                                data-component-ip="${escapeHtml((comp.ip || 'N/A').toLowerCase())}" 
                                                data-component-url="${escapeHtml(accessUrl.toLowerCase())}" 
                                                data-component-credentials="${escapeHtml((credentials + (comp.password || '')).toLowerCase())}" 
                                                data-component-status="${escapeHtml((comp.status || '').toUpperCase())}"
                                                data-component-index="${idx}">
                                                <td><strong>${escapeHtml(hostname)}</strong></td>
                                                <td><code style="background: var(--bg-card-hover); padding: 4px 8px; border-radius: 4px; font-family: 'Courier New', monospace;">${escapeHtml(component.component_uid || 'N/A')}</code></td>
                                                <td><code style="font-family: 'Courier New', monospace;">${escapeHtml(comp.ip || 'N/A')}</code></td>
                                                <td>${accessUrl !== 'N/A' ? `<a href="${accessUrl}" target="_blank" rel="noopener noreferrer">${accessUrl}</a>` : 'N/A'}</td>
                                                <td style="min-width: 200px;">
                                                    ${credentials !== 'N/A' ? credentials : 'N/A'}
                                                    ${password}
                                                </td>
                                                <td><span class="status-badge ${getStatusClass(comp.status)}">${getStatusLabel(comp.status)}</span></td>
                                                <td style="text-align: center;">
                                                    <button class="btn-delete-component" 
                                                        data-zpod-id="${zpod.id}"
                                                        data-component-hostname="${escapeHtml(hostname || '')}"
                                                        data-component-uid="${escapeHtml(component.component_uid || '')}"
                                                        data-component-instance-id="${comp.component_instance_id !== undefined ? comp.component_instance_id : idx}"
                                                        title="Delete this component">
                                                        🗑️
                                                    </button>
                                                </td>
                                            </tr>
                                        `;
                                    }).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ` : ''}

                <!-- DNS Entries -->
                ${(() => {
                    // Use only DNS entries from API (complete list)
                    const allDnsEntries = zpod.dns_entries || [];
                    
                    return `
                    <div class="detail-section full-width" id="dns-section-${zpod.id}">
                        <h3 class="section-title">
                            <span>🌐</span> DNS Entries <span style="font-size: 0.9rem; font-weight: 400; color: var(--text-secondary);">(<span id="dns-count-${zpod.id}">${allDnsEntries.length}</span>)</span>
                            <button class="btn-reload-table" id="reload-dns-${zpod.id}" title="Reload DNS table" style="background: var(--primary-color); color: white; border: none; border-radius: 8px; width: 32px; height: 32px; font-size: 16px; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; margin-left: 12px; transition: all 0.3s ease; box-shadow: var(--shadow);">🔄</button>
                            <button class="btn-add-dns" id="addDnsBtn-${zpod.id}" title="Add a DNS entry" style="background: var(--success-color); color: white; border: none; border-radius: 8px; width: 32px; height: 32px; font-size: 16px; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; margin-left: 8px; transition: all 0.3s ease; box-shadow: var(--shadow);">+</button>
                        </h3>
                        <div class="dns-content-wrapper">
                            ${allDnsEntries.length > 0 ? `
                            <div class="table-filters" id="dns-filters-${zpod.id}">
                                <input type="text" class="table-filter" data-column="0" placeholder="🔍 Filter by hostname..." />
                                <input type="text" class="table-filter" data-column="1" placeholder="🔍 Filter by IP..." />
                            </div>
                            <div class="dns-table-wrapper">
                                <table class="data-table" id="dns-table-${zpod.id}">
                                    <thead>
                                        <tr>
                                            <th>Hostname</th>
                                            <th>IP</th>
                                            <th style="width: 60px; text-align: center;">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${allDnsEntries.map((dns, index) => `
                                            <tr data-dns-hostname="${escapeHtml((dns.hostname || 'N/A').toLowerCase())}" 
                                                data-dns-ip="${escapeHtml((dns.ip || 'N/A').toLowerCase())}"
                                                data-dns-index="${index}">
                                                <td><strong>${escapeHtml(dns.hostname || 'N/A')}</strong></td>
                                                <td><code style="font-family: 'Courier New', monospace;">${escapeHtml(dns.ip || 'N/A')}</code></td>
                                                <td style="text-align: center;">
                                                    <button class="btn-delete-dns" 
                                                        data-zpod-id="${zpod.id}"
                                                        data-dns-hostname="${escapeHtml(dns.hostname || '')}"
                                                        data-dns-ip="${escapeHtml(dns.ip || '')}"
                                                        title="Delete this DNS entry"
                                                        style="background: #ef4444; color: white; border: none; border-radius: 6px; width: 32px; height: 32px; font-size: 16px; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; transition: all 0.3s ease; box-shadow: var(--shadow);">
                                                        🗑️
                                                    </button>
                                                </td>
                                            </tr>
                                        `).join('')}
                                    </tbody>
                                </table>
                            </div>
                            ` : `
                            <div style="text-align: center; padding: 40px; color: var(--text-secondary);">
                                <p>No DNS entries at the moment.</p>
                                <p style="font-size: 0.9rem; margin-top: 8px;">Click the "+" button to add one.</p>
                            </div>
                            `}
                        </div>
                    </div>
                `;
                })()}
            </div>
        </div>
    `;
    
    // Generate network diagram after rendering
    if (zpod.networks && zpod.networks.length > 0) {
        setTimeout(() => {
            renderNetworkDiagram(zpod.id, zpod);
        }, 100);
    }
    
    // Initialiser les filtres du tableau des composants
    if (zpod.components && zpod.components.length > 0) {
        setTimeout(() => {
            initComponentTableFilters(zpod.id);
            initReloadComponentTable(zpod.id);
            initDeleteComponentButtons(zpod.id);
            initAddComponentButton(zpod.id, zpod);
        }, 100);
    }
    
    // Initialiser les filtres du tableau DNS et le bouton d'ajout
    setTimeout(() => {
        initAddDnsButton(zpod.id);
        initReloadDnsTable(zpod.id);
        // Utiliser uniquement les entrées DNS de l'API (liste complète)
        const allDnsEntries = zpod.dns_entries || [];
        if (allDnsEntries.length > 0) {
            initDnsTableFilters(zpod.id);
            initDeleteDnsButtons(zpod.id);
        }
    }, 100);
    
    // Initialiser les fonctionnalités de copie de mot de passe
    setTimeout(() => {
        initPasswordCopy();
    }, 150);
}

// Fonction pour initialiser les filtres du tableau des composants
function initComponentTableFilters(zpodId) {
    const filters = document.querySelectorAll(`#component-filters-${zpodId} .table-filter`);
    const table = document.getElementById(`components-table-${zpodId}`);
    const countElement = document.getElementById(`component-count-${zpodId}`);
    
    if (!table || !countElement) return;
    
    filters.forEach(filter => {
        filter.addEventListener('input', () => {
            filterComponentTable(zpodId);
        });
        filter.addEventListener('change', () => {
            filterComponentTable(zpodId);
        });
    });
}

// Function to filter component table
function filterComponentTable(zpodId) {
    const table = document.getElementById(`components-table-${zpodId}`);
    const countElement = document.getElementById(`component-count-${zpodId}`);
    const filters = document.querySelectorAll(`#component-filters-${zpodId} .table-filter`);
    
    if (!table || !countElement) return;
    
    const rows = table.querySelectorAll('tbody tr');
    let visibleCount = 0;
    
    rows.forEach(row => {
        let show = true;
        
        filters.forEach(filter => {
            const column = parseInt(filter.dataset.column);
            const filterValue = filter.value.toLowerCase().trim();
            
            if (filterValue) {
                let cellValue = '';
                
                switch(column) {
                    case 0: // Hostname
                        cellValue = row.dataset.componentHostname || '';
                        break;
                    case 1: // Component UID
                        cellValue = row.dataset.componentUid || '';
                        break;
                    case 2: // IP
                        cellValue = row.dataset.componentIp || '';
                        break;
                    case 3: // Access URL
                        cellValue = row.dataset.componentUrl || '';
                        break;
                    case 4: // Credentials
                        cellValue = row.dataset.componentCredentials || '';
                        break;
                    case 5: // Status
                        cellValue = row.dataset.componentStatus || '';
                        break;
                }
                
                if (!cellValue.includes(filterValue)) {
                    show = false;
                }
            }
        });
        
        if (show) {
            row.style.display = '';
            visibleCount++;
        } else {
            row.style.display = 'none';
        }
    });
    
    // Update counter
    if (countElement) {
        countElement.textContent = visibleCount;
    }
}

// Fonction pour initialiser les filtres du tableau DNS
function initDnsTableFilters(zpodId) {
    const filters = document.querySelectorAll(`#dns-filters-${zpodId} .table-filter`);
    const table = document.getElementById(`dns-table-${zpodId}`);
    const countElement = document.getElementById(`dns-count-${zpodId}`);
    
    if (!table || !countElement) return;
    
    filters.forEach(filter => {
        filter.addEventListener('input', () => {
            filterDnsTable(zpodId);
        });
        filter.addEventListener('change', () => {
            filterDnsTable(zpodId);
        });
    });
}

// Function to filter DNS table
function filterDnsTable(zpodId) {
    const table = document.getElementById(`dns-table-${zpodId}`);
    const countElement = document.getElementById(`dns-count-${zpodId}`);
    const filters = document.querySelectorAll(`#dns-filters-${zpodId} .table-filter`);
    
    if (!table || !countElement) return;
    
    const rows = table.querySelectorAll('tbody tr');
    let visibleCount = 0;
    
    rows.forEach(row => {
        let show = true;
        
        filters.forEach(filter => {
            const column = parseInt(filter.dataset.column);
            const filterValue = filter.value.toLowerCase().trim();
            
            if (filterValue) {
                let cellValue = '';
                
                switch(column) {
                    case 0: // Hostname
                        cellValue = row.dataset.dnsHostname || '';
                        break;
                    case 1: // IP
                        cellValue = row.dataset.dnsIp || '';
                        break;
                }
                
                if (!cellValue.includes(filterValue)) {
                    show = false;
                }
            }
        });
        
        if (show) {
            row.style.display = '';
            visibleCount++;
        } else {
            row.style.display = 'none';
        }
    });
    
    // Update counter
    if (countElement) {
        countElement.textContent = visibleCount;
    }
}

// Function to update only DNS table
function updateDnsTable(zpodId, dnsEntries) {
    const allDnsEntries = dnsEntries || [];
    const dnsSection = document.getElementById(`dns-section-${zpodId}`);
    
    if (!dnsSection) {
        console.error(`Section DNS introuvable pour zPod ${zpodId}`);
        return;
    }
    
    // Update counter
    const countElement = document.getElementById(`dns-count-${zpodId}`);
    if (countElement) {
        countElement.textContent = allDnsEntries.length;
    }
    
    // Update DNS section content
    const dnsContent = allDnsEntries.length > 0 ? `
        <div class="table-filters" id="dns-filters-${zpodId}">
            <input type="text" class="table-filter" data-column="0" placeholder="🔍 Filter by hostname..." />
            <input type="text" class="table-filter" data-column="1" placeholder="🔍 Filter by IP..." />
        </div>
        <div class="dns-table-wrapper">
            <table class="data-table" id="dns-table-${zpodId}">
                <thead>
                    <tr>
                        <th>Hostname</th>
                        <th>IP</th>
                        <th style="width: 60px; text-align: center;">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${allDnsEntries.map((dns, index) => `
                        <tr data-dns-hostname="${escapeHtml((dns.hostname || 'N/A').toLowerCase())}" 
                            data-dns-ip="${escapeHtml((dns.ip || 'N/A').toLowerCase())}"
                            data-dns-index="${index}">
                            <td><strong>${escapeHtml(dns.hostname || 'N/A')}</strong></td>
                            <td><code style="font-family: 'Courier New', monospace;">${escapeHtml(dns.ip || 'N/A')}</code></td>
                            <td style="text-align: center;">
                                <button class="btn-delete-dns" 
                                    data-zpod-id="${zpodId}"
                                    data-dns-hostname="${escapeHtml(dns.hostname || '')}"
                                    data-dns-ip="${escapeHtml(dns.ip || '')}"
                                    title="Delete this DNS entry"
                                    style="background: #ef4444; color: white; border: none; border-radius: 6px; width: 32px; height: 32px; font-size: 16px; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; transition: all 0.3s ease; box-shadow: var(--shadow);">
                                    🗑️
                                </button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    ` : `
        <div style="text-align: center; padding: 40px; color: var(--text-secondary);">
            <p>No DNS entries at the moment.</p>
            <p style="font-size: 0.9rem; margin-top: 8px;">Click the "+" button to add one.</p>
        </div>
    `;
    
    // Replace content in wrapper
    const contentWrapper = dnsSection.querySelector('.dns-content-wrapper');
    if (contentWrapper) {
        contentWrapper.innerHTML = dnsContent;
    } else {
        console.error(`Wrapper DNS introuvable pour zPod ${zpodId}`);
        return;
    }
    
    // Réinitialiser les filtres et boutons
    if (allDnsEntries.length > 0) {
        setTimeout(() => {
            initDnsTableFilters(zpodId);
            initDeleteDnsButtons(zpodId);
        }, 100);
    }
}

// Fonction pour initialiser le bouton de rechargement du tableau des composants
function initReloadComponentTable(zpodId) {
    const reloadBtn = document.getElementById(`reload-components-${zpodId}`);
    if (reloadBtn) {
        reloadBtn.addEventListener('click', async () => {
            if (!currentZpodId) return;
            
            // Désactiver le bouton pendant le rechargement
            reloadBtn.disabled = true;
            reloadBtn.style.opacity = '0.5';
            reloadBtn.textContent = '⏳';
            
            try {
                await fetchZpodDetail(currentZpodId);
            } catch (error) {
                alert(`Error reloading: ${error.message}`);
            } finally {
                // Re-enable button after short delay
                setTimeout(() => {
                    reloadBtn.disabled = false;
                    reloadBtn.style.opacity = '1';
                    reloadBtn.textContent = '🔄';
                }, 500);
            }
        });
    }
}

// Fonction pour initialiser le bouton de rechargement du tableau DNS
function initReloadDnsTable(zpodId) {
    const reloadBtn = document.getElementById(`reload-dns-${zpodId}`);
    if (reloadBtn) {
        reloadBtn.addEventListener('click', async () => {
            if (!currentZpodId) return;
            
            // Désactiver le bouton pendant le rechargement
            reloadBtn.disabled = true;
            reloadBtn.style.opacity = '0.5';
            reloadBtn.textContent = '⏳';
            
            try {
                await fetchZpodDetail(currentZpodId);
            } catch (error) {
                alert(`Error reloading: ${error.message}`);
            } finally {
                // Re-enable button after short delay
                setTimeout(() => {
                    reloadBtn.disabled = false;
                    reloadBtn.style.opacity = '1';
                    reloadBtn.textContent = '🔄';
                }, 500);
            }
        });
    }
}

// Fonction pour copier le texte dans le presse-papier
async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch (err) {
        // Fallback pour les navigateurs plus anciens
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try {
            document.execCommand('copy');
            textArea.remove();
            return true;
        } catch (err) {
            textArea.remove();
            return false;
        }
    }
}

// Fonction pour initialiser le bouton d'ajout DNS
function initAddDnsButton(zpodId) {
    const addDnsBtn = document.getElementById(`addDnsBtn-${zpodId}`);
    if (!addDnsBtn) return;
    
    addDnsBtn.addEventListener('click', () => {
        openAddDnsModal(zpodId);
    });
}

// Fonction pour ouvrir le modal d'ajout DNS
function openAddDnsModal(zpodId) {
    const modal = document.getElementById('addDnsModal');
    const form = document.getElementById('addDnsForm');
    const hostnameInput = document.getElementById('dnsHostname');
    const ipInput = document.getElementById('dnsIp');
    
    if (!modal || !form) return;
    
    // Store zPod ID in form
    form.dataset.zpodId = zpodId;
    
    // Réinitialiser le formulaire
    form.reset();
    
    // Ouvrir le modal
    modal.classList.remove('hidden');
    hostnameInput.focus();
}

// Function to close add DNS modal
function closeAddDnsModal() {
    const modal = document.getElementById('addDnsModal');
    if (modal) {
        modal.classList.add('hidden');
    }
}

// Function to add a DNS entry
async function addDnsEntry(zpodId, hostname, ip) {
    try {
        // Use dynamic PHP proxy
        const apiUrl = getApiUrl(`/zpods/${zpodId}/dns`);
        
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                // access_token is handled server-side by proxy.php from config.js
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                hostname: hostname,
                ip: ip
            })
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Error ${response.status}: ${errorText}`);
        }
        
        const result = await response.json();
        return result;
    } catch (error) {
        console.error('Error adding DNS entry:', error);
        throw error;
    }
}

// Function to delete a DNS entry
async function deleteDnsEntry(zpodId, hostname, ip) {
    try {
        // API expects order: /zpods/{zpodId}/dns/{ip}/{hostname}
        // Use dynamic PHP proxy
        let apiUrl = getApiUrl(`/zpods/${zpodId}/dns/${encodeURIComponent(ip)}/${encodeURIComponent(hostname)}`);
        let response = await fetch(apiUrl, {
            method: 'DELETE',
            headers: {
                // access_token is handled server-side by proxy.php from config.js
                'Content-Type': 'application/json'
            }
        });
        
        // Method 2: If DELETE doesn't work (405), try POST with action=delete
        if (!response.ok && (response.status === 405 || response.status === 404)) {
            console.log('DELETE not supported, trying POST...');
            apiUrl = getApiUrl(`/zpods/${zpodId}/dns`);
            response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    // access_token is handled server-side by proxy.php from config.js
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    hostname: hostname,
                    ip: ip,
                    action: 'delete'
                })
            });
        }
        
        // Method 3: If still not OK, try DELETE with body
        if (!response.ok && response.status !== 200 && response.status !== 204) {
            console.log('POST with action=delete not supported, trying DELETE with body...');
            apiUrl = getApiUrl(`/zpods/${zpodId}/dns`);
            response = await fetch(apiUrl, {
                method: 'DELETE',
                headers: {
                    // access_token is handled server-side by proxy.php from config.js
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    hostname: hostname,
                    ip: ip
                })
            });
        }
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('DNS deletion error:', {
                status: response.status,
                statusText: response.statusText,
                url: apiUrl,
                error: errorText
            });
            throw new Error(`Erreur ${response.status}: ${errorText || response.statusText}`);
        }
        
        return true;
    } catch (error) {
        console.error('Error deleting DNS entry:', error);
        throw error;
    }
}

// Fonction pour récupérer les IDs uniques des composants
async function fetchComponentIds(zpodId) {
    try {
        const apiUrl = getApiUrl(`/zpods/${zpodId}/components`);
        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                // access_token is handled server-side by proxy.php from config.js
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            return null;
        }
        
        const components = await response.json();
        // Create hostname -> component_instance_id mapping
        const idMap = {};
        components.forEach((comp, idx) => {
            if (comp.id !== undefined) {
                idMap[comp.hostname] = comp.id;
            } else if (comp.component_instance_id !== undefined) {
                idMap[comp.hostname] = comp.component_instance_id;
            }
        });
        return idMap;
    } catch (error) {
        console.error('Error fetching component IDs:', error);
        return null;
    }
}

// Function to delete a component
async function deleteComponent(zpodId, hostname) {
    try {
        // API accepts hostname in format "hostname=esxi14" according to OpenAPI documentation
        // Use dynamic PHP proxy
        const componentId = `hostname=${encodeURIComponent(hostname)}`;
        const apiUrl = getApiUrl(`/zpods/${zpodId}/components/${componentId}`);
        const response = await fetch(apiUrl, {
            method: 'DELETE',
            headers: {
                // access_token is handled server-side by proxy.php from config.js
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Component deletion error:', {
                status: response.status,
                statusText: response.statusText,
                url: apiUrl,
                error: errorText
            });
            throw new Error(`Erreur ${response.status}: ${errorText || response.statusText}`);
        }
        
        return true;
    } catch (error) {
        console.error('Error deleting component:', error);
        throw error;
    }
}

// Fonction pour initialiser les boutons de suppression de composants
function initDeleteComponentButtons(zpodId) {
    const deleteButtons = document.querySelectorAll(`.btn-delete-component[data-zpod-id="${zpodId}"]`);
    deleteButtons.forEach(button => {
        button.addEventListener('click', async (e) => {
            e.stopPropagation();
            
            const hostname = button.dataset.componentHostname;
            
            if (!hostname || hostname === 'N/A') {
                alert('Unable to delete: missing hostname');
                return;
            }
            
            // Demander confirmation
            if (!confirm(`Are you sure you want to delete the component "${hostname}"?`)) {
                return;
            }
            
            // Désactiver le bouton pendant la suppression
            button.disabled = true;
            button.textContent = '';
            
            try {
                await deleteComponent(zpodId, hostname);
                
                // Update modal title and message for deletion
                if (componentSuccessTitle) {
                    componentSuccessTitle.textContent = '✅ Component deleted successfully!';
                }
                if (componentSuccessMessage) {
                    componentSuccessMessage.textContent = 'The component has been deleted from the zPod successfully.';
                }
                
                // Show success modal
                if (componentSuccessModal) {
                    componentSuccessModal.classList.remove('hidden');
                }
            } catch (error) {
                alert(`Error deleting: ${error.message}`);
                // Re-enable button on error
                button.disabled = false;
                button.style.opacity = '1';
                button.textContent = '🗑️';
            }
        });
    });
}

// Fonction pour initialiser les boutons de suppression DNS
function initDeleteDnsButtons(zpodId) {
    const deleteButtons = document.querySelectorAll(`.btn-delete-dns[data-zpod-id="${zpodId}"]`);
    deleteButtons.forEach(button => {
        button.addEventListener('click', async (e) => {
            e.stopPropagation();
            
            const hostname = button.dataset.dnsHostname;
            const ip = button.dataset.dnsIp;
            
            if (!hostname || !ip) {
                alert('Unable to delete: missing data');
                return;
            }
            
            // Demander confirmation
            if (!confirm(`Are you sure you want to delete the DNS entry "${hostname}" (${ip})?`)) {
                return;
            }
            
            // Désactiver le bouton pendant la suppression
            button.disabled = true;
            button.textContent = '';
            
            try {
                await deleteDnsEntry(zpodId, hostname, ip);
                
                // Reload zPod details to update table
                if (currentZpodId) {
                    await fetchZpodDetail(currentZpodId);
                }
            } catch (error) {
                alert(`Error deleting: ${error.message}`);
                // Re-enable button on error
                button.disabled = false;
                button.style.opacity = '1';
                button.textContent = '🗑️';
            }
        });
    });
}

// Function to get management network of a zPod
function getManagementNetwork(zpod) {
    if (!zpod.networks || zpod.networks.length === 0) {
        return null;
    }
    // The first network is usually the management network (untagged)
    return zpod.networks[0];
}

// Function to get IP prefix of management network
function getManagementNetworkPrefix(zpod) {
    const managementNetwork = getManagementNetwork(zpod);
    if (!managementNetwork || !managementNetwork.cidr) {
        return '172.16.0'; // Valeur par défaut
    }
    const ipParts = managementNetwork.cidr.split('/')[0].split('.');
    return ipParts.slice(0, 3).join('.');
}

// Fonction pour récupérer les composants actifs
async function fetchActiveComponents() {
    try {
        const apiUrl = getApiUrl('/components');
        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                // access_token is handled server-side by proxy.php from config.js
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
        }

        const components = await response.json();
        // Filter only active components
        return components.filter(comp => (comp.status || '').toUpperCase() === 'ACTIVE');
    } catch (error) {
        console.error('Error fetching active components:', error);
        return [];
    }
}

// Fonction pour initialiser le bouton d'ajout de composant
function initAddComponentButton(zpodId, zpod) {
    const addBtn = document.getElementById(`add-component-${zpodId}`);
    if (!addBtn) return;

    addBtn.addEventListener('click', async () => {
        // Récupérer les composants actifs
        const activeComponents = await fetchActiveComponents();
        
        // Trier les composants par ordre alphabétique (par nom)
        const sortedComponents = activeComponents.sort((a, b) => {
            const nameA = (a.component_name || a.name || '').toLowerCase();
            const nameB = (b.component_name || b.name || '').toLowerCase();
            return nameA.localeCompare(nameB);
        });
        
        // Fill dropdown with component data storage
        if (componentUidSelect) {
            componentUidSelect.innerHTML = '<option value="">Sélectionner un composant...</option>';
            sortedComponents.forEach(comp => {
                const option = document.createElement('option');
                option.value = comp.component_uid || comp.uid || '';
                option.textContent = `${comp.component_name || comp.name || ''} (${comp.component_uid || comp.uid || ''})`;
                // Stocker le nom du composant dans l'option pour vérifier si c'est ESXi
                option.dataset.componentName = (comp.component_name || comp.name || '').toLowerCase();
                componentUidSelect.appendChild(option);
            });
        }

        // Update IP prefix
        const ipPrefix = getManagementNetworkPrefix(zpod);
        if (componentIpPrefix) {
            componentIpPrefix.textContent = `${ipPrefix}.`;
        }

        // Réinitialiser le formulaire
        if (addComponentForm) {
            addComponentForm.reset();
            addComponentForm.dataset.zpodId = zpodId;
        }

        // Réinitialiser les disques (un seul disque par défaut)
        if (componentDisksContainer) {
            componentDisksContainer.innerHTML = `
                <div class="disk-input-row" style="display: flex; gap: 8px; margin-bottom: 8px; align-items: center;">
                    <input 
                        type="number" 
                        class="disk-size-input" 
                        placeholder="Taille en GB"
                        min="1"
                        style="flex: 1;"
                    />
                    <button type="button" class="btn-remove-disk" style="background: #ef4444; color: white; border: none; border-radius: 4px; width: 32px; height: 32px; cursor: pointer; display: none;">×</button>
                </div>
            `;
        }

        // Hide disk section by default
        const disksGroup = document.getElementById('componentDisksGroup');
        if (disksGroup) {
            disksGroup.style.display = 'none';
        }

        // Show modal
        if (addComponentModal) {
            addComponentModal.classList.remove('hidden');
        }
    });
}


// Function to add a component to a zPod
async function addComponentToZpod(zpodId, componentData) {
    try {
        const apiUrl = getApiUrl(`/zpods/${zpodId}/components`);
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                // access_token is handled server-side by proxy.php from config.js
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(componentData)
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Error ${response.status}: ${errorText}`);
        }

        const result = await response.json();
        return result;
    } catch (error) {
        console.error('Error adding component:', error);
        throw error;
    }
}

// Function to close add component modal
function closeAddComponentModal() {
    if (addComponentModal) {
        addComponentModal.classList.add('hidden');
    }
}

// Fonction pour initialiser les fonctionnalités de copie de mot de passe
function initPasswordCopy() {
    const passwordElements = document.querySelectorAll('.password-copyable');
    passwordElements.forEach(element => {
        element.addEventListener('click', async (e) => {
            const password = element.dataset.password;
            if (password && password !== 'N/A') {
                const success = await copyToClipboard(password);
                if (success) {
                    // Feedback visuel temporaire
                    const originalText = element.textContent;
                    element.textContent = '✓ Copié !';
                    element.style.color = 'var(--primary-color)';
                    setTimeout(() => {
                        element.textContent = originalText;
                        element.style.color = '';
                    }, 2000);
                } else {
                    alert('Impossible de copier dans le presse-papier');
                }
            }
        });
    });
}

// Function to generate network diagram
function renderNetworkDiagram(zpodId, zpod) {
    const container = document.getElementById(`networkDiagram-${zpodId}`);
    if (!container) return;
    
    // Extract network information
    const networks = zpod.networks || [];
    const components = zpod.components || [];
    const zbox = components.find(c => c.component && c.component.component_name === 'zbox');
    const endpoint = zpod.endpoint;
    
    // Analyze networks to determine structure
    const managementNetwork = networks[0] || null;
    const subnetBase = managementNetwork && managementNetwork.cidr 
        ? managementNetwork.cidr.split('/')[0].split('.').slice(0, 3).join('.') 
        : '172.16.0';
    
    // Extract network information
    const networkCidrs = networks.map(n => n.cidr || '').filter(c => c);
    const zboxIp = zbox ? zbox.ip : `${subnetBase}.2`;
    
    // Calculer les positions et dimensions
    const routesCount = Math.min(networks.length - 1, 3);
    const routesHeight = routesCount * 18;
    const segmentHeight = 38;
    const totalInfoHeight = 25 + routesHeight + 20 + segmentHeight; // Management + routes + segment
    const zboxHeight = 140 + routesCount * 18;
    const zboxStartY = 340 + totalInfoHeight + 80; // Après NSX T1 + espace + infos + marge supplémentaire encore augmentée
    const totalHeight = zboxStartY + zboxHeight + 50; // zbox + marge
    
    // Create SVG
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', `0 0 1000 ${totalHeight}`);
    svg.setAttribute('class', 'network-svg');
    
    svg.innerHTML = `
        <defs>
            <linearGradient id="gradient-nsxt0-${zpodId}" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" style="stop-color:#6366f1;stop-opacity:1" />
                <stop offset="100%" style="stop-color:#4f46e5;stop-opacity:1" />
            </linearGradient>
            <linearGradient id="gradient-nsxt1-${zpodId}" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" style="stop-color:#8b5cf6;stop-opacity:1" />
                <stop offset="100%" style="stop-color:#7c3aed;stop-opacity:1" />
            </linearGradient>
            <linearGradient id="gradient-zbox-${zpodId}" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" style="stop-color:#10b981;stop-opacity:1" />
                <stop offset="100%" style="stop-color:#059669;stop-opacity:1" />
            </linearGradient>
            <filter id="shadow-${zpodId}">
                <feDropShadow dx="0" dy="2" stdDeviation="4" flood-opacity="0.2"/>
            </filter>
            <marker id="arrowhead-${zpodId}" markerWidth="18" markerHeight="18" refX="9" refY="5" orient="auto">
                <polygon points="0 0, 18 5, 0 10" fill="var(--primary-color)"/>
            </marker>
        </defs>
        
        <!-- Background -->
        <rect width="1000" height="${totalHeight}" fill="var(--bg-card)" rx="12"/>
        
        <!-- Title -->
        <text x="500" y="40" text-anchor="middle" font-size="24" font-weight="700" fill="var(--text-primary)">zPod Network Diagram</text>
        
        <!-- NSX T0 -->
        <g id="nsxt0-${zpodId}">
            <rect x="350" y="80" width="300" height="90" rx="8" fill="url(#gradient-nsxt0-${zpodId})" filter="url(#shadow-${zpodId})"/>
            <text x="500" y="110" text-anchor="middle" font-size="16" font-weight="700" fill="white">NSX T0</text>
            <text x="500" y="135" text-anchor="middle" font-size="12" fill="rgba(255,255,255,0.9)">${endpoint ? escapeHtml(endpoint.name.length > 20 ? endpoint.name.substring(0, 17) + '...' : endpoint.name) : 'Endpoint'}</text>
            <text x="500" y="155" text-anchor="middle" font-size="10" fill="rgba(255,255,255,0.8)">${endpoint && endpoint.name && endpoint.name.length > 20 ? escapeHtml(endpoint.name.substring(20)) : ''}</text>
        </g>
        
        <!-- Connection line T0 to T1 -->
        <line x1="500" y1="170" x2="500" y2="230" stroke="var(--primary-color)" stroke-width="2" marker-end="url(#arrowhead-${zpodId})"/>
        <text x="530" y="195" font-size="11" fill="var(--text-secondary)">NSX T0/T1 Auto-plumbing</text>
        <text x="530" y="210" font-size="10" fill="var(--text-secondary)">(100.64.0.0/10 CGNAT)</text>
        
        <!-- NSX T1 -->
        <g id="nsxt1-${zpodId}">
            <rect x="300" y="230" width="400" height="110" rx="8" fill="url(#gradient-nsxt1-${zpodId})" filter="url(#shadow-${zpodId})"/>
            <text x="500" y="260" text-anchor="middle" font-size="16" font-weight="700" fill="white">NSX T1</text>
            <text x="500" y="285" text-anchor="middle" font-size="12" fill="rgba(255,255,255,0.9)">zPod-${escapeHtml(zpod.profile.length > 15 ? zpod.profile.substring(0, 12) + '...' : zpod.profile)}-tier1</text>
            <text x="500" y="305" text-anchor="middle" font-size="11" fill="rgba(255,255,255,0.8)">Edge Cluster:</text>
            <text x="500" y="320" text-anchor="middle" font-size="11" fill="rgba(255,255,255,0.8)">edge206-999</text>
        </g>
        
        <!-- Calculer la position de zbox en fonction des routes -->
        ${(() => {
            const routesCount = Math.min(networks.length - 1, 3);
            const routesHeight = routesCount * 18;
            const segmentHeight = 38;
            const totalInfoHeight = 25 + routesHeight + 20 + segmentHeight; // Management + routes + segment
            const zboxStartY = 340 + totalInfoHeight + 20; // Après NSX T1 + espace + infos
            const zboxHeight = 140 + routesCount * 18;
            
            return `
        <!-- Connection line T1 to zbox -->
        <line x1="500" y1="340" x2="500" y2="${zboxStartY - 10}" stroke="var(--primary-color)" stroke-width="2" marker-end="url(#arrowhead-${zpodId})"/>
        <text x="530" y="360" font-size="10" fill="var(--text-secondary)">${subnetBase}.1/26 (Management)</text>
        
        <!-- NSX T1 Static Routes Info - à côté de la flèche -->
        <g id="nsxt1-routes-${zpodId}">
            <text x="530" y="385" font-size="11" font-weight="600" fill="var(--text-secondary)">NSX-T1 Static routes to zbox (eth0):</text>
            ${networks.slice(1, 4).map((net, idx) => {
                const netCidr = net.cidr || `${subnetBase}.${64 + idx * 64}/26`;
                return `<text x="550" y="${405 + idx * 18}" font-size="10" fill="var(--text-secondary)">- ${escapeHtml(netCidr)} to ${escapeHtml(zboxIp)} (zbox)</text>`;
            }).join('')}
        </g>
        
        <!-- NSX Segment Info - à gauche de la flèche, juste sous le carré NSX T1 -->
        <g id="nsxt1-segment-${zpodId}">
            <text x="470" y="355" text-anchor="end" font-size="11" font-weight="600" fill="var(--text-secondary)">zPod-${escapeHtml(zpod.profile)}-segment (ovh-tz-overlay)</text>
            <text x="470" y="373" text-anchor="end" font-size="10" fill="var(--text-secondary)">- This NSX Segment carries VLANs [0-4094] (802.1Q Trunk)</text>
        </g>
        
        <!-- zbox -->
        <g id="zbox-${zpodId}">
            <rect x="400" y="${zboxStartY}" width="200" height="${zboxHeight}" rx="8" fill="url(#gradient-zbox-${zpodId})" filter="url(#shadow-${zpodId})"/>
            <text x="500" y="${zboxStartY + 30}" text-anchor="middle" font-size="16" font-weight="700" fill="white">zbox</text>
            <text x="500" y="${zboxStartY + 55}" text-anchor="middle" font-size="11" fill="rgba(255,255,255,0.9)">${zbox ? escapeHtml((zbox.hostname || 'zbox').length > 15 ? (zbox.hostname || 'zbox').substring(0, 12) + '...' : (zbox.hostname || 'zbox')) : 'zbox'}</text>
            <text x="500" y="${zboxStartY + 75}" text-anchor="middle" font-size="10" fill="rgba(255,255,255,0.8)">eth0: ${escapeHtml(zboxIp.length > 18 ? zboxIp.substring(0, 15) + '...' : zboxIp)}/26</text>
            ${networks.slice(1, 4).map((net, idx) => {
                const ipParts = net.cidr ? net.cidr.split('/')[0].split('.') : [];
                const vlan = ipParts.length > 0 ? ipParts[3] : (64 + idx * 64);
                const ip = net.cidr ? net.cidr.split('/')[0] : `${subnetBase}.${64 + idx * 64}`;
                const ipDisplay = ip.length > 18 ? ip.substring(0, 15) + '...' : ip;
                return `<text x="500" y="${zboxStartY + 95 + idx * 18}" text-anchor="middle" font-size="10" fill="rgba(255,255,255,0.8)">eth1.${vlan}: ${escapeHtml(ipDisplay)}/26</text>`;
            }).join('')}
        </g>
            `;
        })()}
    `;
    
    container.innerHTML = '';
    container.appendChild(svg);
}

// Navigation vers la page de détail d'un zPod
function navigateToZpodDetail(zpodId) {
    currentZpodId = zpodId;
    currentPage = 'zpod-detail';
    
    // Réinitialiser le bouton de suppression
    resetDeleteButton();
    
    // Cacher toutes les pages
    document.querySelectorAll('.page-content').forEach(p => p.classList.add('hidden'));
    
    // Show detail page
    const detailPage = document.getElementById('page-zpod-detail');
    if (detailPage) {
        detailPage.classList.remove('hidden');
    }
    
    // Update title
    if (pageTitle) pageTitle.textContent = '📦 zPod Detail';
    if (pageSubtitle) pageSubtitle.textContent = 'Detailed information';
    
    // Close sidebar if open
    closeSidebarHandler();
    
    // Load details
    fetchZpodDetail(zpodId);
}

// Retour à la liste des zPods
function backToZpods() {
    currentZpodId = null;
    navigateToPage('zpods');
}

// Fonction pour obtenir la classe CSS du statut
function getStatusClass(status) {
    const statusUpper = (status || '').toUpperCase();
    if (statusUpper === 'ACTIVE') {
        return 'status-active';
    } else if (statusUpper === 'INACTIVE' || statusUpper === 'STOPPED') {
        return 'status-inactive';
    } else {
        return 'status-pending';
    }
}

// Function to get status label
function getStatusLabel(status) {
    const statusUpper = (status || '').toUpperCase();
    const statusMap = {
        'ACTIVE': 'Active',
        'INACTIVE': 'Inactive',
        'STOPPED': 'Stopped',
        'PENDING': 'Pending',
        'CREATING': 'Creating',
        'DELETING': 'Deleting'
    };
    return statusMap[statusUpper] || status;
}

// Function to format a date
function formatDate(dateString) {
    if (!dateString) return 'N/A';
    try {
        const date = new Date(dateString);
        return date.toLocaleString('en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch (error) {
        return dateString;
    }
}

// Function to escape HTML
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Utility functions for UI
function showLoading(show, text = 'Loading...') {
    if (show) {
        if (loadingText) loadingText.textContent = text;
        loadingElement.classList.remove('hidden');
    } else {
        loadingElement.classList.add('hidden');
    }
}

function showError(message) {
    errorElement.textContent = `❌ ${message}`;
    errorElement.classList.remove('hidden');
}

function hideError() {
    errorElement.classList.add('hidden');
}

function updateStatus(text, isSuccess) {
    statusText.textContent = text;
    if (isSuccess) {
        statusIndicator.classList.remove('error');
    } else {
        statusIndicator.classList.add('error');
    }
}

// Gestion du thème
const themeToggle = document.getElementById('themeToggle');
const themeIcon = document.getElementById('themeIcon');

function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcon(newTheme);
}

function updateThemeIcon(theme) {
    themeIcon.textContent = theme === 'dark' ? '🌙' : '☀️';
}

// Gestion du modal de configuration
function openConfigModal() {
    loadConfigIntoForm();
    configModal.classList.remove('hidden');
}

function closeConfigModalHandler() {
    configModal.classList.add('hidden');
}

// Gestion du menu burger
function toggleSidebar() {
    sidebar.classList.toggle('open');
    sidebarOverlay.classList.toggle('active');
    menuToggle.classList.toggle('active');
}

function closeSidebarHandler() {
    sidebar.classList.remove('open');
    sidebarOverlay.classList.remove('active');
    menuToggle.classList.remove('active');
}


// Événements
refreshBtn?.addEventListener('click', () => {
    fetchZpods();
});

// Filtre de recherche zPod
const zpodSearchFilter = document.getElementById('zpodSearchFilter');
if (zpodSearchFilter) {
    zpodSearchFilter.addEventListener('input', applyZpodFilter);
}

document.getElementById('refreshProfilesBtn')?.addEventListener('click', fetchProfiles);
document.getElementById('refreshComponentsBtn')?.addEventListener('click', fetchComponents);
document.getElementById('refreshEndpointsBtn')?.addEventListener('click', fetchEndpointsList);
document.getElementById('refreshLibrariesBtn')?.addEventListener('click', fetchLibraries);

// Boutons de la page de détail zPod
if (backToZpodsBtn) {
    backToZpodsBtn.addEventListener('click', backToZpods);
}
if (refreshZpodDetailBtn) {
    refreshZpodDetailBtn.addEventListener('click', () => {
        if (currentZpodId) {
            fetchZpodDetail(currentZpodId);
        }
    });
}
if (deleteZpodBtn) {
    deleteZpodBtn.addEventListener('click', async () => {
        if (!currentZpodId) {
            alert('No zPod selected');
            return;
        }

        // Demander confirmation
        const zpodName = document.querySelector('.zpod-detail-name')?.textContent || currentZpodId;
        if (!confirm(`Are you sure you want to delete the zPod "${zpodName}"?\n\nThis action is irreversible.`)) {
            return;
        }

        // Désactiver le bouton pendant la suppression
        deleteZpodBtn.disabled = true;
        const originalText = deleteZpodBtn.innerHTML;
        deleteZpodBtn.innerHTML = '<span class="icon">⏳</span> Suppression...';

        try {
            await deleteZpod(currentZpodId);
            
            // Show success message
            alert('The zPod has been deleted successfully.');
            
            // Retourner à la page des zPods
            navigateToPage('zpods');
        } catch (error) {
            alert(`Error deleting zPod: ${error.message}`);
            deleteZpodBtn.disabled = false;
            deleteZpodBtn.innerHTML = originalText;
        }
    });
}

// Filtre des composants
if (componentFilter) {
    componentFilter.addEventListener('change', applyComponentFilter);
}

themeToggle.addEventListener('click', toggleTheme);

configBtn.addEventListener('click', openConfigModal);
closeConfigModal.addEventListener('click', closeConfigModalHandler);
cancelConfig.addEventListener('click', closeConfigModalHandler);

// Profile details modal
if (closeProfileDetailModal) {
    closeProfileDetailModal.addEventListener('click', () => {
        profileDetailModal.classList.add('hidden');
    });
}

if (profileDetailModal) {
    profileDetailModal.addEventListener('click', (e) => {
        if (e.target === profileDetailModal) {
            profileDetailModal.classList.add('hidden');
        }
    });
}

// Modal d'ajout DNS
if (closeAddDnsModalBtn) {
    closeAddDnsModalBtn.addEventListener('click', closeAddDnsModal);
}
if (cancelAddDnsBtn) {
    cancelAddDnsBtn.addEventListener('click', closeAddDnsModal);
}
if (addDnsModal) {
    addDnsModal.addEventListener('click', (e) => {
        if (e.target === addDnsModal) {
            closeAddDnsModal();
        }
    });
}
if (addDnsForm) {
    addDnsForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const zpodId = addDnsForm.dataset.zpodId;
        const hostname = document.getElementById('dnsHostname').value.trim();
        const ip = document.getElementById('dnsIp').value.trim();
        
        if (!hostname || !ip) {
            alert('Please fill in all fields');
            return;
        }
        
        // IP validation
        const ipRegex = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/;
        if (!ipRegex.test(ip)) {
            alert('Adresse IP invalide. Format attendu: XXX.XXX.XXX.XXX');
            return;
        }
        
        try {
            // Désactiver le bouton pendant la requête
            const submitBtn = addDnsForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.disabled = true;
            submitBtn.textContent = 'Adding...';
            
            await addDnsEntry(zpodId, hostname, ip);
            
            // Close modal
            closeAddDnsModal();
            
            // Reload zPod details
            if (currentZpodId) {
                await fetchZpodDetail(currentZpodId);
            }
            
            // Re-enable button
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        } catch (error) {
            alert(`Error adding DNS entry: ${error.message}`);
            const submitBtn = addDnsForm.querySelector('button[type="submit"]');
            submitBtn.disabled = false;
            submitBtn.textContent = 'Add';
        }
    });
}

// Menu burger
if (menuToggle) {
    menuToggle.addEventListener('click', toggleSidebar);
}
if (closeSidebar) {
    closeSidebar.addEventListener('click', closeSidebarHandler);
}
if (sidebarOverlay) {
    sidebarOverlay.addEventListener('click', closeSidebarHandler);
}

// Navigation
navItems.forEach(item => {
    item.addEventListener('click', (e) => {
        // Ne pas intercepter les liens externes (comme le dashboard)
        if (item.classList.contains('nav-item-external')) {
            // Laisser le comportement par défaut (ouvrir le lien dans un nouvel onglet)
            closeSidebarHandler();
            return;
        }
        
        e.preventDefault();
        const page = item.dataset.page;
        if (page) {
            navigateToPage(page);
            closeSidebarHandler();
        }
    });
});

// Close modal by clicking outside
configModal.addEventListener('click', (e) => {
    if (e.target === configModal) {
        closeConfigModalHandler();
    }
});

// Gestion du formulaire de configuration
configForm.addEventListener('submit', (e) => {
    e.preventDefault();
    saveConfigFromForm();
});

// Function to manage disk section display based on selected component
function toggleDisksSection() {
    const disksGroup = document.getElementById('componentDisksGroup');
    if (!disksGroup || !componentUidSelect) return;
    
    const selectedOption = componentUidSelect.options[componentUidSelect.selectedIndex];
    if (!selectedOption || !selectedOption.value) {
        // No component selected, hide section
        disksGroup.style.display = 'none';
        return;
    }
    
    // Vérifier si le composant est de type ESXi
    const componentName = selectedOption.dataset.componentName || '';
    const isEsxi = componentName === 'esxi' || componentName.includes('esxi');
    
    // Show or hide disk section
    disksGroup.style.display = isEsxi ? 'block' : 'none';
}

// Gestionnaires d'événements pour le modal d'ajout de composant
if (closeAddComponentModalBtn) {
    closeAddComponentModalBtn.addEventListener('click', closeAddComponentModal);
}
if (cancelAddComponentBtn) {
    cancelAddComponentBtn.addEventListener('click', closeAddComponentModal);
}
if (addComponentModal) {
    addComponentModal.addEventListener('click', (e) => {
        if (e.target === addComponentModal) {
            closeAddComponentModal();
        }
    });
}

// Add event handler for component select
if (componentUidSelect) {
    componentUidSelect.addEventListener('change', toggleDisksSection);
}

// Gestionnaires d'événements pour le modal d'ajout de zPod
if (closeAddZpodModalBtn) {
    closeAddZpodModalBtn.addEventListener('click', closeAddZpodModal);
}
if (cancelAddZpodBtn) {
    cancelAddZpodBtn.addEventListener('click', closeAddZpodModal);
}
if (addZpodModal) {
    addZpodModal.addEventListener('click', (e) => {
        if (e.target === addZpodModal) {
            closeAddZpodModal();
        }
    });
}

// Gestionnaire de soumission du formulaire d'ajout de zPod
if (addZpodForm) {
    addZpodForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = zpodNameInput ? zpodNameInput.value.trim() : '';
        const profile = zpodProfileSelect ? zpodProfileSelect.value : '';
        const endpointId = zpodEndpointSelect ? parseInt(zpodEndpointSelect.value) : null;
        
        if (!name) {
            alert('Please enter a name for the zPod');
            return;
        }
        
        if (!profile) {
            alert('Veuillez sélectionner un profile');
            return;
        }
        
        if (!endpointId) {
            alert('Veuillez sélectionner un endpoint');
            return;
        }
        
        const zpodData = {
            name: name,
            profile: profile,
            endpoint_id: endpointId
        };
        
        const submitBtn = addZpodForm.querySelector('button[type="submit"]');
        const originalText = submitBtn ? submitBtn.textContent : 'Create';
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = 'Creating...';
        }
        
        try {
            await createZpod(zpodData);
            
            // Close add modal
            closeAddZpodModal();
            
            // Re-enable submit button
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = originalText;
            }
            
            // Show success modal
            if (zpodSuccessModal) {
                zpodSuccessModal.classList.remove('hidden');
            }
        } catch (error) {
            alert(`Error creating zPod: ${error.message}`);
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = originalText;
            }
        }
    });
}

// Gestionnaires d'événements pour le modal de succès zPod
if (goToDashboardZpodBtn) {
    goToDashboardZpodBtn.addEventListener('click', () => {
        // Build dashboard URL from API endpoint if dashboardLink is not set
        let dashboardUrl;
        if (dashboardLink && dashboardLink.href) {
            dashboardUrl = dashboardLink.href;
        } else {
            // Try to build from API endpoint
            try {
                const apiUrl = new URL(config.apiEndpoint || '');
                dashboardUrl = `${apiUrl.protocol}//${apiUrl.hostname}:8060`;
            } catch (error) {
                console.error('Cannot build dashboard URL:', error);
                return; // Cannot open dashboard without valid URL
            }
        }
        window.open(dashboardUrl, '_blank', 'noopener,noreferrer');
        if (zpodSuccessModal) {
            zpodSuccessModal.classList.add('hidden');
        }
        // Reload zPod list
        fetchZpods();
    });
}

if (stayOnZpodPageBtn) {
    stayOnZpodPageBtn.addEventListener('click', () => {
        if (zpodSuccessModal) {
            zpodSuccessModal.classList.add('hidden');
        }
        // Reload zPod list to see the new zPod
        fetchZpods();
    });
}

if (zpodSuccessModal) {
    zpodSuccessModal.addEventListener('click', (e) => {
        if (e.target === zpodSuccessModal) {
            zpodSuccessModal.classList.add('hidden');
            // Reload zPod list
            fetchZpods();
        }
    });
}

// Gestionnaires d'événements pour le modal de succès composant
if (goToDashboardBtn) {
    goToDashboardBtn.addEventListener('click', () => {
        // Build dashboard URL from API endpoint if dashboardLink is not set
        let dashboardUrl;
        if (dashboardLink && dashboardLink.href) {
            dashboardUrl = dashboardLink.href;
        } else {
            // Try to build from API endpoint
            try {
                const apiUrl = new URL(config.apiEndpoint || '');
                dashboardUrl = `${apiUrl.protocol}//${apiUrl.hostname}:8060`;
            } catch (error) {
                console.error('Cannot build dashboard URL:', error);
                return; // Cannot open dashboard without valid URL
            }
        }
        window.open(dashboardUrl, '_blank', 'noopener,noreferrer');
        if (componentSuccessModal) {
            componentSuccessModal.classList.add('hidden');
        }
        // Reload zPod details in background
        if (currentZpodId) {
            fetchZpodDetail(currentZpodId);
        }
    });
}

if (stayOnPageBtn) {
    stayOnPageBtn.addEventListener('click', () => {
        if (componentSuccessModal) {
            componentSuccessModal.classList.add('hidden');
        }
        // Reload zPod details to see the new component
        if (currentZpodId) {
            fetchZpodDetail(currentZpodId);
        }
    });
}

if (componentSuccessModal) {
    componentSuccessModal.addEventListener('click', (e) => {
        if (e.target === componentSuccessModal) {
            componentSuccessModal.classList.add('hidden');
            // Reload zPod details
            if (currentZpodId) {
                fetchZpodDetail(currentZpodId);
            }
        }
    });
}

// Handler to add a disk
if (addDiskBtn) {
    addDiskBtn.addEventListener('click', () => {
        if (!componentDisksContainer) return;
        const diskRows = componentDisksContainer.querySelectorAll('.disk-input-row');
        if (diskRows.length >= 15) {
            alert('You can only add a maximum of 15 disks');
            return;
        }
        const newRow = document.createElement('div');
        newRow.className = 'disk-input-row';
        newRow.style.cssText = 'display: flex; gap: 8px; margin-bottom: 8px; align-items: center;';
        newRow.innerHTML = `
            <input 
                type="number" 
                class="disk-size-input" 
                placeholder="Taille en GB"
                min="1"
                style="flex: 1;"
            />
            <button type="button" class="btn-remove-disk" style="background: #ef4444; color: white; border: none; border-radius: 4px; width: 32px; height: 32px; cursor: pointer;">×</button>
        `;
        componentDisksContainer.appendChild(newRow);
        updateRemoveDiskButtons();
        const removeBtn = newRow.querySelector('.btn-remove-disk');
        if (removeBtn) {
            removeBtn.addEventListener('click', () => {
                newRow.remove();
                updateRemoveDiskButtons();
            });
        }
    });
}

// Function to update visibility of disk delete buttons
function updateRemoveDiskButtons() {
    if (!componentDisksContainer) return;
    const diskRows = componentDisksContainer.querySelectorAll('.disk-input-row');
    diskRows.forEach((row) => {
        const removeBtn = row.querySelector('.btn-remove-disk');
        if (removeBtn) {
            removeBtn.style.display = diskRows.length > 1 ? 'inline-flex' : 'none';
        }
    });
}

// Gestionnaire pour les boutons de suppression de disques existants
if (componentDisksContainer) {
    componentDisksContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('btn-remove-disk')) {
            e.target.closest('.disk-input-row').remove();
            updateRemoveDiskButtons();
        }
    });
}

// Gestionnaire de soumission du formulaire d'ajout de composant
if (addComponentForm) {
    addComponentForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const zpodId = addComponentForm.dataset.zpodId;
        const componentUid = componentUidSelect ? componentUidSelect.value : '';
        const hostname = document.getElementById('componentHostname') ? document.getElementById('componentHostname').value.trim() : '';
        const ipLastOctet = document.getElementById('componentIpLastOctet') ? parseInt(document.getElementById('componentIpLastOctet').value) : null;
        const vcpu = document.getElementById('componentVcpu') ? parseInt(document.getElementById('componentVcpu').value) : null;
        const vmem = document.getElementById('componentVmem') ? parseInt(document.getElementById('componentVmem').value) : null;
        
        if (!componentUid) {
            alert('Veuillez sélectionner un composant');
            return;
        }
        
        if (!ipLastOctet || ipLastOctet < 1 || ipLastOctet > 254) {
            alert('Please enter a valid IP last octet (1-254)');
            return;
        }
        
        const diskInputs = componentDisksContainer ? componentDisksContainer.querySelectorAll('.disk-size-input') : [];
        const vdisks = [];
        diskInputs.forEach(input => {
            const size = parseInt(input.value);
            if (size && size > 0) {
                vdisks.push(size);
            }
        });
        
        const componentData = {
            component_uid: componentUid,
            host_id: ipLastOctet
        };
        
        if (hostname) {
            componentData.hostname = hostname;
        }
        if (vcpu) {
            componentData.vcpu = vcpu;
        }
        if (vmem) {
            componentData.vmem = vmem;
        }
        if (vdisks.length > 0) {
            componentData.vdisks = vdisks;
        }
        
        const submitBtn = addComponentForm.querySelector('button[type="submit"]');
        const originalText = submitBtn ? submitBtn.textContent : 'Add';
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = 'Adding...';
        }
        
        try {
            await addComponentToZpod(zpodId, componentData);
            
            // Close add modal
            closeAddComponentModal();
            
            // Re-enable submit button
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = originalText;
            }
            
            // Update modal title and message for addition
            if (componentSuccessTitle) {
                componentSuccessTitle.textContent = '✅ Component added successfully!';
            }
            if (componentSuccessMessage) {
                componentSuccessMessage.textContent = 'The component has been added to the zPod successfully.';
            }
            
            // Show success modal
            if (componentSuccessModal) {
                componentSuccessModal.classList.remove('hidden');
            }
        } catch (error) {
            alert(`Error adding component: ${error.message}`);
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = originalText;
            }
        }
    });
}

// Close with Escape
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        if (!configModal.classList.contains('hidden')) {
            closeConfigModalHandler();
        }
        if (profileDetailModal && !profileDetailModal.classList.contains('hidden')) {
            profileDetailModal.classList.add('hidden');
        }
        if (addComponentModal && !addComponentModal.classList.contains('hidden')) {
            closeAddComponentModal();
        }
        if (addZpodModal && !addZpodModal.classList.contains('hidden')) {
            closeAddZpodModal();
        }
        if (componentSuccessModal && !componentSuccessModal.classList.contains('hidden')) {
            componentSuccessModal.classList.add('hidden');
            // Reload zPod details
            if (currentZpodId) {
                fetchZpodDetail(currentZpodId);
            }
        }
        if (zpodSuccessModal && !zpodSuccessModal.classList.contains('hidden')) {
            zpodSuccessModal.classList.add('hidden');
            // Reload zPod list
            fetchZpods();
        }
        if (sidebar && sidebar.classList.contains('open')) {
            closeSidebarHandler();
        }
    }
});

// Initialisation
(() => {
    initTheme();
    
    // Load configuration first and check if it's complete
    loadConfig();
    
    // Double check configuration after loadConfig
    // If configuration is incomplete, loadConfig() should have redirected
    // But we check again here as a safety measure
    // Note: token is server-side only, we only check endpoint
    const endpointValid = config.apiEndpoint && typeof config.apiEndpoint === 'string' && config.apiEndpoint.trim().length > 0;
    
    if (!endpointValid) {
        // Configuration still invalid, force redirect
        console.error('Configuration invalid after loadConfig, forcing redirect');
        window.location.replace('/proxy.php?action=configure');
        return;
    }
    
    // Configuration is valid, continue with initialization
    loadConfigIntoForm();
    updateDashboardLink();
    initAddZpodButton();
    initAddProfileButton();
    
    // Load default page (zpods)
    navigateToPage('zpods');
    
    // Auto-refresh every 30 seconds
    setInterval(() => {
        loadPageData(currentPage);
    }, 30000);
})();

// Store components for new profile (before creation)
let newProfileComponents = [];

// Function to load active components into the select dropdown
async function loadActiveComponentsIntoSelect() {
    if (!addProfileComponentSelect) return;
    
    try {
        const apiUrl = getApiUrl('/components');
        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error(`Error ${response.status}`);
        }
        
        const allComponents = await response.json();
        // Filter only active components
        const activeComponents = allComponents.filter(comp => {
            const status = (comp.status || '').toUpperCase();
            return status === 'ACTIVE';
        });
        
        // Sort alphabetically by component_name
        activeComponents.sort((a, b) => {
            const nameA = (a.component_name || '').toLowerCase();
            const nameB = (b.component_name || '').toLowerCase();
            return nameA.localeCompare(nameB);
        });
        
        // Clear existing options
        addProfileComponentSelect.innerHTML = '<option value="">Select a component...</option>';
        
        // Add components to select
        activeComponents.forEach(comp => {
            const option = document.createElement('option');
            option.value = comp.component_uid;
            const componentName = comp.component_name || comp.component_uid;
            option.textContent = `${componentName} (${comp.component_uid})`;
            addProfileComponentSelect.appendChild(option);
        });
    } catch (error) {
        console.error('Error loading components:', error);
        addProfileComponentSelect.innerHTML = '<option value="">Error loading components</option>';
    }
}

// Function to update the components list display in add profile modal
function updateNewProfileComponentsList(components) {
    const componentsList = document.getElementById('addProfileComponentsList');
    if (!componentsList) return;
    
    if (components.length === 0) {
        componentsList.innerHTML = '<p style="color: var(--text-secondary); margin: 0;">No components added yet. Click the button below to add components.</p>';
    } else {
        componentsList.innerHTML = components.map((comp, index) => {
            const isEsxi = comp.uid && (comp.uid.toLowerCase().includes('esxi') || comp.uid.toLowerCase().startsWith('esxi'));
            
            // Build specs display
            const specsParts = [];
            if (comp.vcpu) {
                specsParts.push(`<span style="color: var(--text-primary);"><strong>CPU:</strong> ${comp.vcpu}</span>`);
            }
            if (comp.vmem) {
                specsParts.push(`<span style="color: var(--text-primary);"><strong>RAM:</strong> ${comp.vmem} GB</span>`);
            }
            if (isEsxi && comp.vdisks && Array.isArray(comp.vdisks) && comp.vdisks.length > 0) {
                specsParts.push(`<span style="color: var(--text-primary);"><strong>Disks:</strong> ${comp.vdisks.join(', ')} GB</span>`);
            }
            
            const specsHtml = specsParts.length > 0 
                ? `<div style="margin-top: 4px; display: flex; flex-wrap: wrap; gap: 12px; font-size: 0.9em;">${specsParts.join('')}</div>`
                : '';
            
            return `
            <div style="display: flex; justify-content: space-between; align-items: flex-start; padding: 12px; background: var(--bg-primary); border: 1px solid var(--border-color); border-radius: 4px; margin-bottom: 8px;">
                <div style="flex: 1;">
                    <div>
                        <strong style="color: var(--text-primary);">${escapeHtml(comp.name || comp.uid)}</strong>
                        <span style="color: var(--text-secondary); font-size: 0.9em; margin-left: 4px;">(${escapeHtml(comp.uid)})</span>
                    </div>
                    ${specsHtml}
                </div>
                <button type="button" class="btn-remove-component" data-index="${index}" style="background: #ef4444; color: white; border: none; border-radius: 4px; width: 28px; height: 28px; cursor: pointer; font-size: 18px; font-weight: bold; line-height: 1; margin-left: 12px; flex-shrink: 0; transition: background 0.2s;" onmouseover="this.style.background='#dc2626'" onmouseout="this.style.background='#ef4444'">×</button>
            </div>
        `;
        }).join('');
        
        // Add event listeners to remove buttons
        componentsList.querySelectorAll('.btn-remove-component').forEach(btn => {
            btn.addEventListener('click', () => {
                const index = parseInt(btn.dataset.index);
                removeComponentFromNewProfile(index);
            });
        });
    }
}

// Function to open add component with specs modal (for new profile creation or edit)
function openAddComponentWithSpecsModal() {
    // Get component UID from the appropriate select based on context
    let componentUid = null;
    let componentName = '';
    
    if (isAddingComponentForEdit && editProfileComponentSelect) {
        componentUid = editProfileComponentSelect.value;
        if (editProfileComponentSelect.selectedIndex >= 0) {
            componentName = editProfileComponentSelect.options[editProfileComponentSelect.selectedIndex].text;
        }
    } else if (addProfileComponentSelect) {
        componentUid = addProfileComponentSelect.value;
        if (addProfileComponentSelect.selectedIndex >= 0) {
            componentName = addProfileComponentSelect.options[addProfileComponentSelect.selectedIndex].text;
        }
    }
    
    if (!componentUid) {
        alert('Please select a component');
        return;
    }
    
    // Allow adding the same component multiple times (with different specs if needed)
    
    // Set component info in modal
    if (componentSpecName) {
        componentSpecName.value = componentName;
    }
    if (componentSpecUid) {
        componentSpecUid.value = componentUid;
    }
    
    // Reset CPU and RAM fields
    if (componentSpecVcpu) {
        componentSpecVcpu.value = '';
    }
    if (componentSpecVmem) {
        componentSpecVmem.value = '';
    }
    
    // Check if component is ESXi and show/hide disks section
    const isEsxi = componentUid && (componentUid.toLowerCase().includes('esxi') || componentUid.toLowerCase().startsWith('esxi'));
    if (componentSpecDisksGroup) {
        componentSpecDisksGroup.style.display = isEsxi ? 'block' : 'none';
    }
    
    // Reset disks container
    if (componentSpecDisksContainer) {
        componentSpecDisksContainer.innerHTML = `
            <div class="disk-input-row" style="display: flex; gap: 8px; margin-bottom: 8px; align-items: center;">
                <input 
                    type="number" 
                    class="disk-size-input" 
                    placeholder="Size in GB"
                    min="1"
                    style="flex: 1; padding: 8px; border: 1px solid var(--border-color); border-radius: 4px; background: var(--bg-primary); color: var(--text-primary);"
                />
                <button type="button" class="btn-remove-disk" style="background: #ef4444; color: white; border: none; border-radius: 4px; width: 36px; height: 36px; cursor: pointer; display: none; font-size: 18px; font-weight: bold; line-height: 1; transition: background 0.2s;" onmouseover="this.style.background='#dc2626'" onmouseout="this.style.background='#ef4444'">×</button>
            </div>
        `;
        updateSpecRemoveDiskButtons();
    }
    
    // Show modal
    if (addComponentWithSpecsModal) {
        addComponentWithSpecsModal.classList.remove('hidden');
    }
}

// Function to close add component with specs modal
function closeAddComponentWithSpecsModal() {
    if (addComponentWithSpecsModal) {
        addComponentWithSpecsModal.classList.add('hidden');
    }
    if (addComponentWithSpecsForm) {
        addComponentWithSpecsForm.reset();
    }
    // Reset disks container
    if (componentSpecDisksContainer) {
        componentSpecDisksContainer.innerHTML = `
            <div class="disk-input-row" style="display: flex; gap: 8px; margin-bottom: 8px; align-items: center;">
                <input 
                    type="number" 
                    class="disk-size-input" 
                    placeholder="Size in GB"
                    min="1"
                    style="flex: 1; padding: 8px; border: 1px solid var(--border-color); border-radius: 4px; background: var(--bg-primary); color: var(--text-primary);"
                />
                <button type="button" class="btn-remove-disk" style="background: #ef4444; color: white; border: none; border-radius: 4px; width: 36px; height: 36px; cursor: pointer; display: none; font-size: 18px; font-weight: bold; line-height: 1; transition: background 0.2s;" onmouseover="this.style.background='#dc2626'" onmouseout="this.style.background='#ef4444'">×</button>
            </div>
        `;
    }
}

// Function to update visibility of disk delete buttons in spec modal
function updateSpecRemoveDiskButtons() {
    if (!componentSpecDisksContainer) return;
    const diskRows = componentSpecDisksContainer.querySelectorAll('.disk-input-row');
    diskRows.forEach((row) => {
        const removeBtn = row.querySelector('.btn-remove-disk');
        if (removeBtn) {
            removeBtn.style.display = diskRows.length > 1 ? 'inline-flex' : 'none';
        }
    });
}

// Function to open add component with specs modal for edit profile
async function openAddComponentWithSpecsModalForEdit() {
    // Set context to edit mode
    isAddingComponentForEdit = true;
    
    // Load active components into a temporary select (we'll reuse the same modal)
    try {
        const activeComponents = await fetchActiveComponents();
        
        // Create a temporary select element or use existing one
        // We'll use the same select but check context when submitting
        if (addProfileComponentSelect) {
            addProfileComponentSelect.innerHTML = '<option value="">Select a component...</option>';
            
            const sortedComponents = activeComponents.sort((a, b) => {
                const nameA = (a.component_name || a.uid || '').toLowerCase();
                const nameB = (b.component_name || b.uid || '').toLowerCase();
                return nameA.localeCompare(nameB);
            });
            
            sortedComponents.forEach(comp => {
                const option = document.createElement('option');
                option.value = comp.uid || comp.component_uid || '';
                option.textContent = `${comp.component_name || comp.uid || comp.component_uid || 'Unknown'} (${comp.uid || comp.component_uid || ''})`;
                addProfileComponentSelect.appendChild(option);
            });
        }
        
        // Show the component selection first (we'll need to modify the flow)
        // For now, let's show the modal directly and let user select
        if (addComponentWithSpecsModal) {
            // We'll need to show a select first, then the specs modal
            // Let's create a simpler flow: show select in edit modal, then specs modal
        }
    } catch (error) {
        alert(`Error loading components: ${error.message}`);
    }
}

// Function to add component to profile (handles both new and edit)
function addComponentToProfile() {
    if (!componentSpecUid || !componentSpecUid.value) {
        return;
    }
    
    const componentUid = componentSpecUid.value;
    const componentName = componentSpecName ? componentSpecName.value : componentUid;
    const vcpu = componentSpecVcpu && componentSpecVcpu.value ? parseInt(componentSpecVcpu.value) : null;
    const vmem = componentSpecVmem && componentSpecVmem.value ? parseInt(componentSpecVmem.value) : null;
    
    // Get disk sizes if ESXi
    const vdisks = [];
    if (componentSpecDisksContainer) {
        const diskInputs = componentSpecDisksContainer.querySelectorAll('.disk-size-input');
        diskInputs.forEach(input => {
            const size = parseInt(input.value);
            if (size && size > 0) {
                vdisks.push(size);
            }
        });
    }
    
    // Build component data
    const componentData = {
        uid: componentUid,
        name: componentName,
        component_uid: componentUid  // For edit mode compatibility
    };
    
    if (vcpu) {
        componentData.vcpu = vcpu;
    }
    if (vmem) {
        componentData.vmem = vmem;
    }
    if (vdisks.length > 0) {
        componentData.vdisks = vdisks;
    }
    
    if (isAddingComponentForEdit) {
        // Add to edit profile components list
        // Allow adding the same component multiple times (with different specs if needed)
        editProfileComponents.push(componentData);
        updateEditProfileComponentsList();
    } else {
        // Add to new profile components list
        // Allow adding the same component multiple times (with different specs if needed)
        newProfileComponents.push(componentData);
        updateNewProfileComponentsList(newProfileComponents);
    }
    
    // Close modal
    closeAddComponentWithSpecsModal();
    
    // Reset select based on context
    if (isAddingComponentForEdit && editProfileComponentSelect) {
        editProfileComponentSelect.value = '';
        editProfileComponentSelect.style.display = 'none';
    } else if (addProfileComponentSelect) {
        addProfileComponentSelect.value = '';
    }
}

// Function to add component to edit profile list
function addComponentToEditProfile() {
    isAddingComponentForEdit = true;
    addComponentToProfile();
}

// Function to add component to new profile list (kept for backward compatibility)
function addComponentToNewProfile() {
    isAddingComponentForEdit = false;
    addComponentToProfile();
}

// Function to remove component from new profile list
function removeComponentFromNewProfile(index) {
    newProfileComponents.splice(index, 1);
    updateNewProfileComponentsList(newProfileComponents);
}

// Event handlers for profile modals
if (closeAddProfileModalBtn) {
    closeAddProfileModalBtn.addEventListener('click', closeAddProfileModal);
}
if (cancelAddProfileBtn) {
    cancelAddProfileBtn.addEventListener('click', closeAddProfileModal);
}
if (addProfileModal) {
    addProfileModal.addEventListener('click', (e) => {
        if (e.target === addProfileModal) {
            closeAddProfileModal();
        }
    });
}

if (addProfileForm) {
    addProfileForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = profileNameInput ? profileNameInput.value.trim() : '';
        
        if (!name) {
            alert('Please enter a name for the profile');
            return;
        }
        
        const submitBtn = addProfileForm.querySelector('button[type="submit"]');
        const originalText = submitBtn ? submitBtn.textContent : 'Create Profile';
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = 'Creating...';
        }
        
        try {
            // Create profile with all components (including specs)
            const componentsCount = newProfileComponents.length;
            const profile = await createProfile(name, newProfileComponents);
            
            // Reset form and components list
            if (addProfileForm) {
                addProfileForm.reset();
            }
            newProfileComponents = [];
            updateNewProfileComponentsList([]);
            
            // Close modal
            closeAddProfileModal();
            
            // Refresh profiles list
            if (currentPage === 'profiles') {
                await fetchProfiles();
            }
            
            alert(`Profile "${name}" created successfully with ${componentsCount} component(s)!`);
        } catch (error) {
            alert(`Error creating profile: ${error.message}`);
        } finally {
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = originalText;
            }
        }
    });
}

// Event listener for add component button in new profile modal
if (addComponentToNewProfileBtn) {
    addComponentToNewProfileBtn.addEventListener('click', openAddComponentWithSpecsModal);
}

// Event handlers for add component with specs modal
if (closeAddComponentWithSpecsModalBtn) {
    closeAddComponentWithSpecsModalBtn.addEventListener('click', closeAddComponentWithSpecsModal);
}
if (cancelAddComponentWithSpecsBtn) {
    cancelAddComponentWithSpecsBtn.addEventListener('click', closeAddComponentWithSpecsModal);
}
if (addComponentWithSpecsModal) {
    addComponentWithSpecsModal.addEventListener('click', (e) => {
        if (e.target === addComponentWithSpecsModal) {
            closeAddComponentWithSpecsModal();
        }
    });
}
if (addComponentWithSpecsForm) {
    addComponentWithSpecsForm.addEventListener('submit', (e) => {
        e.preventDefault();
        if (isAddingComponentForEdit) {
            addComponentToEditProfile();
        } else {
            addComponentToNewProfile();
        }
    });
}

// Event handler for add disk button in spec modal
if (addSpecDiskBtn) {
    addSpecDiskBtn.addEventListener('click', () => {
        if (!componentSpecDisksContainer) return;
        const diskRows = componentSpecDisksContainer.querySelectorAll('.disk-input-row');
        
        if (diskRows.length >= 15) {
            alert('Maximum 15 disks allowed');
            return;
        }
        
        const newRow = document.createElement('div');
        newRow.className = 'disk-input-row';
        newRow.style.cssText = 'display: flex; gap: 8px; margin-bottom: 8px; align-items: center;';
        newRow.innerHTML = `
            <input 
                type="number" 
                class="disk-size-input" 
                placeholder="Size in GB"
                min="1"
                style="flex: 1; padding: 8px; border: 1px solid var(--border-color); border-radius: 4px; background: var(--bg-primary); color: var(--text-primary);"
            />
            <button type="button" class="btn-remove-disk" style="background: #ef4444; color: white; border: none; border-radius: 4px; width: 36px; height: 36px; cursor: pointer; font-size: 18px; font-weight: bold; line-height: 1; transition: background 0.2s;" onmouseover="this.style.background='#dc2626'" onmouseout="this.style.background='#ef4444'">×</button>
        `;
        
        componentSpecDisksContainer.appendChild(newRow);
        updateSpecRemoveDiskButtons();
    });
}

// Event handler for remove disk buttons in spec modal
if (componentSpecDisksContainer) {
    componentSpecDisksContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('btn-remove-disk')) {
            e.target.closest('.disk-input-row').remove();
            updateSpecRemoveDiskButtons();
        }
    });
}

// Function to update the components list in add profile modal
async function updateAddProfileComponentsList(profileId) {
    const componentsList = document.getElementById('addProfileComponentsList');
    if (!componentsList) return;
    
    try {
        const apiUrl = getApiUrl(`/profiles/${profileId}`);
        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error(`Error ${response.status}`);
        }
        
        const profile = await response.json();
        const components = extractProfileComponents(profile.profile || []);
        
        if (components.length === 0) {
            componentsList.innerHTML = '<p style="color: var(--text-secondary);">No components added yet.</p>';
        } else {
            componentsList.innerHTML = components.map(comp => `
                <div style="padding: 8px; background: var(--bg-secondary); border-radius: 4px; margin-bottom: 4px;">
                    <strong>${escapeHtml(comp.uid)}</strong>
                </div>
            `).join('');
        }
    } catch (error) {
        console.error('Error updating components list:', error);
    }
}

// Event handlers for add component to profile modal
if (closeAddComponentToProfileModalBtn) {
    closeAddComponentToProfileModalBtn.addEventListener('click', closeAddComponentToProfileModal);
}
if (cancelAddComponentToProfileBtn) {
    cancelAddComponentToProfileBtn.addEventListener('click', closeAddComponentToProfileModal);
}
if (addComponentToProfileModal) {
    addComponentToProfileModal.addEventListener('click', (e) => {
        if (e.target === addComponentToProfileModal) {
            closeAddComponentToProfileModal();
        }
    });
}

if (addComponentToProfileBtn) {
    addComponentToProfileBtn.addEventListener('click', async () => {
        const profileId = addProfileForm ? addProfileForm.dataset.profileId : null;
        if (!profileId) {
            alert('Please create the profile first');
            return;
        }
        
        // Fetch active components
        try {
            const activeComponents = await fetchActiveComponents();
            
            if (profileComponentUidSelect) {
                profileComponentUidSelect.innerHTML = '<option value="">Select a component...</option>';
                
                const sortedComponents = activeComponents.sort((a, b) => {
                    const nameA = (a.component_name || a.uid || '').toLowerCase();
                    const nameB = (b.component_name || b.uid || '').toLowerCase();
                    return nameA.localeCompare(nameB);
                });
                
                sortedComponents.forEach(comp => {
                    const option = document.createElement('option');
                    option.value = comp.uid || comp.component_uid || '';
                    option.textContent = comp.component_name || comp.uid || comp.component_uid || 'Unknown';
                    profileComponentUidSelect.appendChild(option);
                });
            }
            
            // Show modal
            if (addComponentToProfileModal) {
                addComponentToProfileModal.classList.remove('hidden');
            }
        } catch (error) {
            alert(`Error loading components: ${error.message}`);
        }
    });
}


// Update add component to profile form to handle both new and existing profiles
if (addComponentToProfileForm) {
    // Remove the old submit handler and add a new one that checks context
    const existingHandler = addComponentToProfileForm.onsubmit;
    addComponentToProfileForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const componentUid = profileComponentUidSelect ? profileComponentUidSelect.value : '';
        let profileId = addComponentToProfileForm.dataset.profileId || (addProfileForm ? addProfileForm.dataset.profileId : null);
        
        if (!componentUid) {
            alert('Please select a component');
            return;
        }
        
        if (!profileId) {
            alert('Profile ID not found');
            return;
        }
        
        const submitBtn = addComponentToProfileForm.querySelector('button[type="submit"]');
        const originalText = submitBtn ? submitBtn.textContent : 'Add Component';
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = 'Adding...';
        }
        
        try {
            await addComponentToProfile(profileId, componentUid);
            
            // Close modal
            closeAddComponentToProfileModal();
            
            // Reset form
            if (addComponentToProfileForm) {
                addComponentToProfileForm.reset();
            }
            
            // Update add profile components list
            await updateAddProfileComponentsList(profileId);
            
            // Re-enable submit button
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = originalText;
            }
        } catch (error) {
            alert(`Error adding component: ${error.message}`);
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = originalText;
            }
        }
    });
}

// Event handlers for edit profile modal
if (closeEditProfileModalBtn) {
    closeEditProfileModalBtn.addEventListener('click', closeEditProfileModal);
}
if (cancelEditProfileBtn) {
    cancelEditProfileBtn.addEventListener('click', closeEditProfileModal);
}
if (editProfileModal) {
    editProfileModal.addEventListener('click', (e) => {
        if (e.target === editProfileModal) {
            closeEditProfileModal();
        }
    });
}

// Handler for edit profile form submission (Save Changes)
if (editProfileForm) {
    editProfileForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const profileId = editProfileIdInput ? editProfileIdInput.value : null;
        const profileName = editProfileNameInput ? editProfileNameInput.value.trim() : '';
        
        if (!profileId) {
            alert('Profile ID not found');
            return;
        }
        
        if (!profileName) {
            alert('Please enter a profile name');
            return;
        }
        
        const submitBtn = editProfileForm.querySelector('button[type="submit"]');
        const originalText = submitBtn ? submitBtn.textContent : 'Save Changes';
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = 'Saving...';
        }
        
        try {
            // Build components array in the same format as createProfile
            const componentsArray = editProfileComponents.map(comp => {
                const componentData = {
                    component_uid: comp.component_uid
                };
                if (comp.vcpu) {
                    componentData.vcpu = comp.vcpu;
                }
                if (comp.vmem) {
                    componentData.vmem = comp.vmem;
                }
                if (comp.vdisks && Array.isArray(comp.vdisks) && comp.vdisks.length > 0) {
                    componentData.vdisks = comp.vdisks;
                }
                return componentData;
            });
            
            // Step 1: DELETE the profile
            const deleteUrl = getApiUrl(`/profiles/${profileId}`);
            const deleteResponse = await fetch(deleteUrl, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            if (!deleteResponse.ok) {
                const errorText = await deleteResponse.text();
                throw new Error(`Error deleting profile: ${deleteResponse.status} - ${errorText}`);
            }
            
            // Step 2: POST a new profile with the same name and all remaining components
            const createUrl = getApiUrl('/profiles');
            const createResponse = await fetch(createUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: profileName,
                    profile: componentsArray
                })
            });
            
            if (!createResponse.ok) {
                const errorText = await createResponse.text();
                throw new Error(`Error creating profile: ${createResponse.status} - ${errorText}`);
            }
            
            // Close modal and reload profiles
            closeEditProfileModal();
            await fetchProfiles();
            
            alert(`Profile "${profileName}" saved successfully!`);
        } catch (error) {
            alert(`Error saving profile: ${error.message}`);
        } finally {
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = originalText;
            }
        }
    });
}

// Event handler for add component button in edit profile modal
if (addComponentToEditProfileBtn) {
    addComponentToEditProfileBtn.addEventListener('click', async () => {
        await openAddComponentForEditProfile();
    });
}

// Auto-open specs modal when component is selected in edit mode
if (editProfileComponentSelect) {
    editProfileComponentSelect.addEventListener('change', () => {
        if (isAddingComponentForEdit && editProfileComponentSelect.value) {
            // Auto-open specs modal when component is selected in edit mode
            openAddComponentWithSpecsModal();
        }
    });
}


