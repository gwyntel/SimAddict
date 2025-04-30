document.addEventListener('DOMContentLoaded', () => {
    // --- Constants ---
    const APP_NAME = "SimAddict";
    const APP_URL = "https://simaddict.gwyn.tel";
    const OPENROUTER_API_URL = "https://openrouter.ai/api/v1";
    
    // --- DOM Elements ---
    // API Config Section
    const apiConfigSection = document.getElementById('api-config-section');
    const apiConfigContent = document.getElementById('api-config-content');
    const toggleApiConfigBtn = document.getElementById('toggle-api-config-btn');
    const toggleIcon = toggleApiConfigBtn.querySelector('.toggle-icon');
    const profileNameInput = document.getElementById('profile-name');
    const apiEndpointInput = document.getElementById('api-endpoint');
    const apiKeyInput = document.getElementById('api-key');
    const modelIdInput = document.getElementById('model-id');
    const modelIdContainer = document.getElementById('model-id-container');
    const modelSelectContainer = document.getElementById('model-select-container');
    const modelIdSelect = document.getElementById('model-id-select');
    const saveProfileBtn = document.getElementById('save-profile-btn');
    const loadProfileSelect = document.getElementById('load-profile-select');
    const deleteProfileBtn = document.getElementById('delete-profile-btn');
    const openrouterOAuthBtn = document.getElementById('openrouter-oauth-btn');
    
    // Prompt Section Elements
    const promptSection = document.getElementById('prompt-section');
    const userPromptTextarea = document.getElementById('user-prompt');
    const fileUploadInput = document.getElementById('file-upload');
    const attachmentsPreviewDiv = document.getElementById('attachments-preview');
    const generateOutlineBtn = document.getElementById('generate-outline-btn');
    
    // Outline Section Elements
    const outlineSection = document.getElementById('outline-section');
    const outlineDisplayDiv = document.getElementById('outline-display');
    const outlineEditTextarea = document.getElementById('outline-edit');
    const editOutlineBtn = document.getElementById('edit-outline-btn');
    const approveOutlineBtn = document.getElementById('approve-outline-btn');
    
    // Website Display Section Elements
    const websiteDisplaySection = document.getElementById('website-display-section');
    const websiteIframe = document.getElementById('website-iframe');
    const backToOutlineBtn = document.getElementById('back-to-outline-btn');
    const viewFullscreenBtn = document.getElementById('view-fullscreen-btn');
    
    // Action Section Elements
    const actionSection = document.getElementById('action-section');
    const saveWebsiteBtn = document.getElementById('save-website-btn');
    const startOverBtn = document.getElementById('start-over-btn');
    
    // Fullscreen Preview Elements
    const fullscreenPreview = document.getElementById('fullscreen-preview');
    const fullscreenIframe = document.getElementById('fullscreen-iframe');
    const exitFullscreenBtn = document.getElementById('exit-fullscreen-btn');
    const saveFullscreenBtn = document.getElementById('save-fullscreen-btn');


    // Storage Keys
    const PROFILES_STORAGE_KEY = 'simAddictApiProfiles';
    const API_CONFIG_STATE_KEY = 'simAddictApiConfigState';
    const CURRENT_STEP_KEY = 'simAddictCurrentStep';
    const GENERATION_STATE_KEY = 'simAddictGenerationState';

    // Step Tracking
    const STEPS = {
        API_CONFIG: 0,
        PROMPT: 1,
        OUTLINE: 2,
        PREVIEW: 3
    };
    
    let currentStep = parseInt(localStorage.getItem(CURRENT_STEP_KEY) || STEPS.API_CONFIG);
    
    // File Attachments
    let attachments = [];
    
    // --- Functions ---
    
    /**
     * Shows a specific step in the UI flow and hides others
     * @param {number} step - The step to show
     */
    function showStep(step) {
        // Save current step to localStorage
        localStorage.setItem(CURRENT_STEP_KEY, step);
        currentStep = step;
        
        // Hide all sections first
        promptSection.style.display = 'none';
        outlineSection.style.display = 'none';
        websiteDisplaySection.style.display = 'none';
        actionSection.style.display = 'none';
        
        // Show the appropriate section based on step
        switch(step) {
            case STEPS.API_CONFIG:
                // API config is always visible, just make sure prompt is shown
                promptSection.style.display = 'block';
                break;
            case STEPS.PROMPT:
                promptSection.style.display = 'block';
                break;
            case STEPS.OUTLINE:
                promptSection.style.display = 'none';
                outlineSection.style.display = 'block';
                break;
            case STEPS.PREVIEW:
                outlineSection.style.display = 'none';
                websiteDisplaySection.style.display = 'block';
                actionSection.style.display = 'block';
                break;
        }
    }
    
    /**
     * Resets the application to the initial state
     */
    function resetApplication() {
        if (confirm('Are you sure you want to start over? This will clear your current progress.')) {
            // Clear outline and website content
            outlineDisplayDiv.innerHTML = '<p><i>Outline will be generated here...</i></p>';
            outlineEditTextarea.value = '';
            outlineEditTextarea.style.display = 'none';
            websiteIframe.srcdoc = '';
            
            // Reset buttons
            editOutlineBtn.disabled = true;
            approveOutlineBtn.disabled = true;
            saveWebsiteBtn.disabled = true;
            
            // Go back to prompt step
            showStep(STEPS.PROMPT);
        }
    }
    
    /**
     * Shows the fullscreen preview
     */
    function showFullscreenPreview() {
        // Copy content from regular iframe to fullscreen iframe
        fullscreenIframe.srcdoc = websiteIframe.srcdoc;
        fullscreenPreview.style.display = 'block';
    }
    
    /**
     * Hides the fullscreen preview
     */
    function hideFullscreenPreview() {
        fullscreenPreview.style.display = 'none';
    }
    
    /**
     * Saves the website from fullscreen view
     */
    function saveFullscreenWebsite() {
        const websiteContent = fullscreenIframe.srcdoc;
        saveWebsiteContent(websiteContent);
    }
    
    /**
     * Saves website content to a file
     * @param {string} content - The HTML content to save
     */
    function saveWebsiteContent(content) {
        if (!content || content.includes('Generating website...') || content.includes('Error generating website')) {
            alert('No valid website content available to save.');
            return;
        }

        try {
            const blob = new Blob([content], { type: 'text/html' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'generated_website.html'; // Filename for download
            document.body.appendChild(link); // Required for Firefox
            link.click();
            document.body.removeChild(link); // Clean up
            URL.revokeObjectURL(url); // Free up memory
            console.log("Website saved successfully.");
        } catch (error) {
            console.error("Error saving website:", error);
            alert("Failed to save website content.");
        }
    }
    
    /**
     * Toggles the visibility of the API configuration content
     */
    function toggleApiConfig() {
        const isCollapsed = apiConfigContent.style.display === 'none';
        
        if (isCollapsed) {
            // Expand
            apiConfigContent.style.display = 'block';
            toggleIcon.classList.remove('collapsed');
            toggleIcon.textContent = '▼';
            localStorage.setItem(API_CONFIG_STATE_KEY, 'expanded');
        } else {
            // Collapse
            apiConfigContent.style.display = 'none';
            toggleIcon.classList.add('collapsed');
            toggleIcon.textContent = '▶';
            localStorage.setItem(API_CONFIG_STATE_KEY, 'collapsed');
        }
    }
    
    /**
     * Checks if the API config section should be collapsed based on profiles and saved state
     */
    function checkApiConfigState() {
        const profiles = JSON.parse(localStorage.getItem(PROFILES_STORAGE_KEY) || '{}');
        const hasProfiles = Object.keys(profiles).length > 0;
        const savedState = localStorage.getItem(API_CONFIG_STATE_KEY);
        
        // If there are profiles and the state was previously collapsed (or not set and profiles exist)
        if (hasProfiles && (savedState === 'collapsed' || savedState === null)) {
            apiConfigContent.style.display = 'none';
            toggleIcon.classList.add('collapsed');
            toggleIcon.textContent = '▶';
        } else {
            apiConfigContent.style.display = 'block';
            toggleIcon.classList.remove('collapsed');
            toggleIcon.textContent = '▼';
        }
    }

    /**
     * Loads profiles from localStorage and populates the dropdown.
     */
    function loadProfiles() {
        const profiles = JSON.parse(localStorage.getItem(PROFILES_STORAGE_KEY) || '{}');
        // Clear existing options (keep the default placeholder)
        loadProfileSelect.innerHTML = '<option value="">-- Select a Profile --</option>';

        for (const profileName in profiles) {
            if (profiles.hasOwnProperty(profileName)) {
                const option = document.createElement('option');
                option.value = profileName;
                option.textContent = profileName;
                loadProfileSelect.appendChild(option);
            }
        }
        
        // Enable/disable delete button based on selection
        updateDeleteButtonState();
    }
    
    /**
     * Updates the delete button state based on profile selection
     */
    function updateDeleteButtonState() {
        deleteProfileBtn.disabled = !loadProfileSelect.value;
    }

    /**
     * Saves the current profile details to localStorage.
     */
    function saveProfile() {
        const profileName = profileNameInput.value.trim();
        const endpoint = apiEndpointInput.value.trim();
        const apiKey = apiKeyInput.value.trim(); // Note: Stored directly, user warned about localStorage security
        const modelId = modelIdInput.value.trim();

        if (!profileName || !endpoint || !apiKey || !modelId) {
            alert('Please fill in all profile fields (Name, Endpoint, Key, Model ID).');
            return;
        }

        const profiles = JSON.parse(localStorage.getItem(PROFILES_STORAGE_KEY) || '{}');
        profiles[profileName] = { endpoint, apiKey, modelId };

        try {
            localStorage.setItem(PROFILES_STORAGE_KEY, JSON.stringify(profiles));
            alert(`Profile "${profileName}" saved successfully!`);
            loadProfiles(); // Refresh the dropdown
            // Optionally clear fields or select the newly saved profile
            loadProfileSelect.value = profileName;
        } catch (error) {
            console.error("Error saving profile to localStorage:", error);
            alert("Failed to save profile. LocalStorage might be full or disabled.");
        }
    }

    /**
     * Handles selection change in the profile dropdown.
     */
    function handleProfileSelect() {
        const selectedProfileName = loadProfileSelect.value;
        if (!selectedProfileName) {
            // Clear fields if "-- Select --" is chosen
            profileNameInput.value = '';
            apiEndpointInput.value = '';
            apiKeyInput.value = '';
            modelIdInput.value = '';
            modelIdContainer.style.display = 'block';
            modelSelectContainer.style.display = 'none';
            updateDeleteButtonState();
            return;
        }

        const profiles = JSON.parse(localStorage.getItem(PROFILES_STORAGE_KEY) || '{}');
        const selectedProfile = profiles[selectedProfileName];

        if (selectedProfile) {
            profileNameInput.value = selectedProfileName;
            apiEndpointInput.value = selectedProfile.endpoint;
            apiKeyInput.value = selectedProfile.apiKey;
            modelIdInput.value = selectedProfile.modelId;
            updateDeleteButtonState();
            
            // Check if this is an OpenRouter profile
            if (selectedProfile.endpoint.includes('openrouter.ai')) {
                // Show model selection dropdown instead of text input
                modelIdContainer.style.display = 'none';
                modelSelectContainer.style.display = 'block';
                
                // Fetch and populate available models
                fetchOpenRouterModels(selectedProfile.apiKey)
                    .then(() => {
                        // Set the selected model if it exists in the dropdown
                        if (selectedProfile.modelId) {
                            // Find the option with the matching value
                            const options = Array.from(modelIdSelect.options);
                            const matchingOption = options.find(option => option.value === selectedProfile.modelId);
                            
                            if (matchingOption) {
                                modelIdSelect.value = selectedProfile.modelId;
                            } else {
                                // If the model isn't in the dropdown, add it
                                const option = document.createElement('option');
                                option.value = selectedProfile.modelId;
                                option.textContent = selectedProfile.modelId;
                                modelIdSelect.appendChild(option);
                                modelIdSelect.value = selectedProfile.modelId;
                            }
                        }
                    })
                    .catch(error => {
                        console.error('Error fetching OpenRouter models:', error);
                    });
            } else {
                // For non-OpenRouter profiles, show the text input
                modelIdContainer.style.display = 'block';
                modelSelectContainer.style.display = 'none';
            }
        }
    }
    
    /**
     * Deletes the currently selected profile from localStorage.
     */
    function deleteProfile() {
        const selectedProfileName = loadProfileSelect.value;
        if (!selectedProfileName) {
            alert('Please select a profile to delete.');
            return;
        }
        
        if (confirm(`Are you sure you want to delete the profile "${selectedProfileName}"?`)) {
            const profiles = JSON.parse(localStorage.getItem(PROFILES_STORAGE_KEY) || '{}');
            
            if (profiles[selectedProfileName]) {
                delete profiles[selectedProfileName];
                localStorage.setItem(PROFILES_STORAGE_KEY, JSON.stringify(profiles));
                
                // Clear form fields
                profileNameInput.value = '';
                apiEndpointInput.value = '';
                apiKeyInput.value = '';
                modelIdInput.value = '';
                
                // Reload the dropdown
                loadProfiles();
                
                alert(`Profile "${selectedProfileName}" has been deleted.`);
            }
        }
    }

    // --- OpenRouter OAuth PKCE Flow ---
    
    /**
     * Generates a random string for use as a code verifier in PKCE
     * @returns {string} A random string
     */
    function generateCodeVerifier() {
        const array = new Uint8Array(32);
        window.crypto.getRandomValues(array);
        return Array.from(array, byte => ('0' + (byte & 0xFF).toString(16)).slice(-2)).join('');
    }
    
    /**
     * Creates a code challenge from a code verifier using SHA-256
     * @param {string} codeVerifier - The code verifier
     * @returns {Promise<string>} A promise that resolves with the code challenge
     */
    async function createCodeChallenge(codeVerifier) {
        const encoder = new TextEncoder();
        const data = encoder.encode(codeVerifier);
        const digest = await window.crypto.subtle.digest('SHA-256', data);
        
        // Convert the digest to base64url encoding
        return btoa(String.fromCharCode(...new Uint8Array(digest)))
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=+$/, '');
    }
    
    /**
     * Initiates the OpenRouter OAuth flow
     */
    async function initiateOpenRouterOAuth() {
        // Generate and store code verifier
        const codeVerifier = generateCodeVerifier();
        localStorage.setItem('openRouterCodeVerifier', codeVerifier);
        
        // Create code challenge
        const codeChallenge = await createCodeChallenge(codeVerifier);
        
        // Build the authorization URL
        const authUrl = new URL('https://openrouter.ai/auth');
        authUrl.searchParams.append('callback_url', window.location.href);
        authUrl.searchParams.append('code_challenge', codeChallenge);
        authUrl.searchParams.append('code_challenge_method', 'S256');
        
        // Redirect to OpenRouter auth page
        window.location.href = authUrl.toString();
    }
    
    /**
     * Handles the OAuth callback from OpenRouter
     */
    async function handleOpenRouterCallback() {
        // Get the code from URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        
        if (!code) {
            return; // No code in URL, not a callback
        }
        
        // Clear the code from the URL to prevent reuse
        window.history.replaceState({}, document.title, window.location.pathname);
        
        // Get the stored code verifier
        const codeVerifier = localStorage.getItem('openRouterCodeVerifier');
        if (!codeVerifier) {
            alert('Authentication failed: Code verifier not found.');
            return;
        }
        
        try {
            // Exchange the code for an API key
            const response = await fetch('https://openrouter.ai/api/v1/auth/keys', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    code: code,
                    code_verifier: codeVerifier,
                    code_challenge_method: 'S256'
                })
            });
            
            if (!response.ok) {
                throw new Error(`Failed to exchange code: ${response.status} ${response.statusText}`);
            }
            
            const data = await response.json();
            
            if (!data.key) {
                throw new Error('No API key in response');
            }
            
            // Set up the profile with OpenRouter details
            profileNameInput.value = 'OpenRouter';
            apiEndpointInput.value = OPENROUTER_API_URL + '/chat/completions';
            apiKeyInput.value = data.key;
            
            // Show model selection instead of model ID input
            modelIdContainer.style.display = 'none';
            modelSelectContainer.style.display = 'block';
            
            // Fetch and populate available models
            await fetchOpenRouterModels(data.key);
            
            // Save the profile
            saveProfile();
            
            // Clean up
            localStorage.removeItem('openRouterCodeVerifier');
            
            alert('Successfully connected to OpenRouter!');
        } catch (error) {
            console.error('Error exchanging code for API key:', error);
            alert(`Authentication failed: ${error.message}`);
        }
    }
    
    /**
     * Fetches available models from OpenRouter
     * @param {string} apiKey - The OpenRouter API key
     */
    async function fetchOpenRouterModels(apiKey) {
        try {
            const response = await fetch(OPENROUTER_API_URL + '/models', {
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'HTTP-Referer': APP_URL,
                    'X-Title': APP_NAME
                }
            });
            
            if (!response.ok) {
                throw new Error(`Failed to fetch models: ${response.status} ${response.statusText}`);
            }
            
            const data = await response.json();
            
            if (!data.data || !Array.isArray(data.data)) {
                throw new Error('Invalid response format from models API');
            }
            
            populateModelSelect(data.data);
        } catch (error) {
            console.error('Error fetching OpenRouter models:', error);
            modelIdSelect.innerHTML = '<option value="">Error loading models</option>';
        }
    }
    
    /**
     * Populates the model select dropdown with available models
     * @param {Array} models - The array of model objects
     */
    function populateModelSelect(models) {
        // Clear existing options
        modelIdSelect.innerHTML = '';
        
        // Sort models by name
        models.sort((a, b) => a.id.localeCompare(b.id));
        
        // Add each model as an option
        models.forEach(model => {
            const option = document.createElement('option');
            option.value = model.id;
            
            // Format the display name
            let displayName = model.id;
            if (model.context_length) {
                displayName += ` (${Math.round(model.context_length / 1000)}k ctx)`;
            }
            
            option.textContent = displayName;
            modelIdSelect.appendChild(option);
        });
        
        // Select the first model by default
        if (models.length > 0) {
            modelIdSelect.value = models[0].id;
            // Also update the hidden model ID input for compatibility
            modelIdInput.value = models[0].id;
        }
    }
    
    /**
     * Updates the model ID input when a model is selected from the dropdown
     */
    function handleModelSelect() {
        modelIdInput.value = modelIdSelect.value;
    }
    
    // --- Event Listeners ---
    toggleApiConfigBtn.addEventListener('click', toggleApiConfig);
    saveProfileBtn.addEventListener('click', saveProfile);
    loadProfileSelect.addEventListener('change', handleProfileSelect);
    deleteProfileBtn.addEventListener('click', deleteProfile);
    openrouterOAuthBtn.addEventListener('click', initiateOpenRouterOAuth);
    modelIdSelect.addEventListener('change', handleModelSelect);

    // --- Initial Load ---
    loadProfiles();
    checkApiConfigState();
    handleOpenRouterCallback(); // Check if this is a callback from OpenRouter

    // --- API Call Function ---
    /**
     * Makes a call to the configured OpenAI-compatible API endpoint.
     * @param {string} endpoint - The API endpoint URL.
     * @param {string} apiKey - The API key.
     * @param {string} modelId - The model ID to use.
     * @param {Array<object>} messages - The array of message objects for the chat completion.
     * @returns {Promise<string>} - A promise that resolves with the AI's response content.
     */
    async function callOpenAI(endpoint, apiKey, modelId, messages) {
        // Basic validation
        if (!endpoint || !apiKey || !modelId) {
            throw new Error("API configuration (Endpoint, Key, Model ID) is missing.");
        }
        if (!messages || messages.length === 0) {
            throw new Error("Messages array cannot be empty.");
        }

        console.log("Calling API:", { endpoint, modelId, messages }); // Log for debugging (remove API key in production logs)

        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`,
                    'HTTP-Referer': APP_URL,
                    'X-Title': APP_NAME
                },
                body: JSON.stringify({
                    model: modelId,
                    messages: messages,
                    // Add other parameters like temperature, max_tokens if needed
                })
            });

            if (!response.ok) {
                const errorBody = await response.text();
                console.error("API Error Response:", errorBody);
                throw new Error(`API request failed: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            console.log("API Response Data:", data); // Log for debugging

            if (data.choices && data.choices.length > 0 && data.choices[0].message) {
                return data.choices[0].message.content;
            } else {
                throw new Error("Invalid response format from API.");
            }
        } catch (error) {
            console.error("Error calling OpenAI API:", error);
            throw error; // Re-throw the error to be caught by the caller
        }
    }

    /**
     * Renders Markdown content to HTML
     * @param {string} markdownText - The markdown text to render
     * @returns {string} - The rendered HTML
     */
    function renderMarkdown(markdownText) {
        try {
            return marked.parse(markdownText);
        } catch (error) {
            console.error("Error parsing markdown:", error);
            return markdownText; // Fallback to raw text if parsing fails
        }
    }
    
    /**
     * Handles file uploads and creates previews
     */
    function handleFileUpload() {
        const files = fileUploadInput.files;
        if (!files || files.length === 0) return;
        
        // Clear previous attachments if needed
        // attachments = []; // Uncomment if you want to replace rather than add
        
        // Process each file
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            
            // Check file type and size
            if (!file.type.match('image.*') && !file.type.match('application/pdf')) {
                alert('Only images and PDFs are supported.');
                continue;
            }
            
            if (file.size > 10 * 1024 * 1024) { // 10MB limit
                alert(`File ${file.name} is too large. Maximum size is 10MB.`);
                continue;
            }
            
            // Create a preview element
            const previewElement = document.createElement('div');
            previewElement.className = 'attachment-preview';
            
            // Create remove button
            const removeBtn = document.createElement('button');
            removeBtn.className = 'remove-btn';
            removeBtn.textContent = '×';
            removeBtn.addEventListener('click', () => {
                // Remove from DOM
                previewElement.remove();
                
                // Remove from attachments array
                const index = attachments.findIndex(a => a.file.name === file.name);
                if (index !== -1) {
                    attachments.splice(index, 1);
                }
            });
            
            // Add file to attachments array and create preview
            if (file.type.match('image.*')) {
                // For images
                const reader = new FileReader();
                reader.onload = (e) => {
                    const img = document.createElement('img');
                    img.src = e.target.result;
                    previewElement.appendChild(img);
                    previewElement.appendChild(removeBtn);
                    attachmentsPreviewDiv.appendChild(previewElement);
                    
                    // Add to attachments array
                    attachments.push({
                        file: file,
                        dataUrl: e.target.result,
                        type: 'image'
                    });
                };
                reader.readAsDataURL(file);
            } else if (file.type.match('application/pdf')) {
                // For PDFs
                const pdfPreview = document.createElement('div');
                pdfPreview.className = 'pdf-preview';
                pdfPreview.textContent = `PDF: ${file.name}`;
                previewElement.appendChild(pdfPreview);
                previewElement.appendChild(removeBtn);
                attachmentsPreviewDiv.appendChild(previewElement);
                
                // Read PDF as data URL for later use
                const reader = new FileReader();
                reader.onload = (e) => {
                    // Add to attachments array
                    attachments.push({
                        file: file,
                        dataUrl: e.target.result,
                        type: 'pdf'
                    });
                };
                reader.readAsDataURL(file);
            }
        }
        
        // Reset file input to allow selecting the same file again
        fileUploadInput.value = '';
    }
    
    /**
     * Checks if there's an in-progress generation and restores state
     */
    function checkForInProgressGeneration() {
        const generationState = localStorage.getItem(GENERATION_STATE_KEY);
        if (generationState) {
            try {
                const state = JSON.parse(generationState);
                if (state.inProgress && state.step === STEPS.OUTLINE) {
                    // Clear the state since we're handling it now
                    localStorage.removeItem(GENERATION_STATE_KEY);
                    
                    // Show a message to the user
                    alert('Your previous outline generation was interrupted. Please try again.');
                    
                    // Reset to prompt step
                    showStep(STEPS.PROMPT);
                }
            } catch (e) {
                console.error('Error parsing generation state:', e);
                localStorage.removeItem(GENERATION_STATE_KEY);
            }
        }
    }
    
    /**
     * Streams the outline generation with real-time updates
     */
    async function handleGenerateOutline() {
        const endpoint = apiEndpointInput.value.trim();
        const apiKey = apiKeyInput.value.trim();
        const modelId = modelIdInput.value.trim();
        const userPrompt = userPromptTextarea.value.trim();

        if (!endpoint || !apiKey || !modelId) {
            alert('Please select or save a valid API profile first.');
            return;
        }
        if (!userPrompt) {
            alert('Please enter a description for the website you want to generate.');
            return;
        }

        // Save generation state in case of page refresh
        localStorage.setItem(GENERATION_STATE_KEY, JSON.stringify({
            inProgress: true,
            step: STEPS.OUTLINE,
            timestamp: Date.now()
        }));

        // Disable button during processing
        generateOutlineBtn.disabled = true;
        generateOutlineBtn.textContent = 'Generating...';
        outlineDisplayDiv.innerHTML = '<p><i>Generating outline... Please wait.</i></p>';
        outlineSection.style.display = 'block'; // Show the section
        editOutlineBtn.disabled = true;
        approveOutlineBtn.disabled = true;

        // Prepare the user prompt with attachments if any
        let finalUserPrompt = userPrompt;
        
        if (attachments.length > 0) {
            finalUserPrompt += "\n\nI've attached some reference files that should help with the design:";
            attachments.forEach((attachment, index) => {
                if (attachment.type === 'image') {
                    finalUserPrompt += `\n- Reference image ${index + 1}: ${attachment.file.name}`;
                } else if (attachment.type === 'pdf') {
                    finalUserPrompt += `\n- Reference PDF ${index + 1}: ${attachment.file.name}`;
                }
            });
        }

        const systemPrompt = `You are an expert web development assistant. A user wants to create a website based on their description. Your task is to analyze the user's request and generate a detailed set of requirements and a structural outline for the website. The outline should clearly define the sections, content, and basic functionality needed. Present the output using markdown for better readability. Use headings, lists, and other markdown features to structure your response.

IMPORTANT: Keep in mind that the generated website will need to be compatible with basic browser environments. Avoid suggesting features that require server-side processing, database connections, or external APIs that would not work in a simple HTML file opened locally. Focus on client-side functionality that works within the limitations of a single HTML file with embedded CSS and JavaScript.`;
        
        // Prepare messages array with attachments if any
        let messages = [
            { role: "system", content: systemPrompt }
        ];
        
        if (attachments.length > 0) {
            // For models that support multimodal content
            const userMessage = {
                role: "user",
                content: []
            };
            
            // Add text content
            userMessage.content.push({
                type: "text",
                text: finalUserPrompt
            });
            
            // Add image attachments
            attachments.forEach(attachment => {
                if (attachment.type === 'image') {
                    userMessage.content.push({
                        type: "image_url",
                        image_url: {
                            url: attachment.dataUrl
                        }
                    });
                }
                // Note: PDFs aren't directly supported in this format, but we mentioned them in the text
            });
            
            messages.push(userMessage);
        } else {
            // Simple text-only message
            messages.push({ role: "user", content: finalUserPrompt });
        }

        try {
            // For streaming, we'll use a different approach
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`,
                    'HTTP-Referer': APP_URL,
                    'X-Title': APP_NAME
                },
                body: JSON.stringify({
                    model: modelId,
                    messages: messages,
                    stream: true // Enable streaming
                })
            });

            if (!response.ok) {
                const errorBody = await response.text();
                console.error("API Error Response:", errorBody);
                throw new Error(`API request failed: ${response.status} ${response.statusText}`);
            }

            // Clear the display before streaming
            outlineDisplayDiv.innerHTML = '';
            let accumulatedText = '';
            
            // Process the stream
            const reader = response.body.getReader();
            const decoder = new TextDecoder('utf-8');
            
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                
                // Decode the chunk
                const chunk = decoder.decode(value, { stream: true });
                
                // Process the chunk (SSE format)
                const lines = chunk.split('\n');
                for (const line of lines) {
                    if (line.startsWith('data: ') && line !== 'data: [DONE]') {
                        try {
                            const data = JSON.parse(line.substring(6));
                            if (data.choices && data.choices.length > 0) {
                                const delta = data.choices[0].delta;
                                if (delta && delta.content) {
                                    accumulatedText += delta.content;
                                    // Render the accumulated text as markdown
                                    outlineDisplayDiv.innerHTML = renderMarkdown(accumulatedText);
                                    
                                    // Store the raw markdown for future editing
                                    outlineDisplayDiv.dataset.markdown = accumulatedText;
                                }
                            }
                        } catch (e) {
                            console.warn('Error parsing SSE data:', e);
                        }
                    }
                }
            }
            
            // Clear the generation state since we're done
            localStorage.removeItem(GENERATION_STATE_KEY);
            
            // Enable buttons after successful generation
            editOutlineBtn.disabled = false;
            approveOutlineBtn.disabled = false;
            
        } catch (error) {
            console.error("Outline generation failed:", error);
            outlineDisplayDiv.innerHTML = `<p style="color: red;"><b>Error generating outline:</b> ${error.message}</p>`;
            // Keep buttons disabled on error
        } finally {
            // Re-enable button
            generateOutlineBtn.disabled = false;
            generateOutlineBtn.textContent = 'Generate Outline';
        }
    }

    // --- Outline Editing/Approval Logic ---
    function handleEditOutline() {
        // Toggle visibility: show textarea, hide display div
        outlineDisplayDiv.style.display = 'none';
        outlineEditTextarea.style.display = 'block';
        
        // Get the raw markdown text (before it was rendered)
        // We need to get the text content from the display div, but this will include HTML
        // So we'll extract just the text content
        const rawHtml = outlineDisplayDiv.innerHTML;
        
        // Create a temporary div to extract text from HTML
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = rawHtml;
        
        // Get the text content (this removes HTML tags)
        let markdownText = '';
        
        // Try to get the original markdown from a data attribute if we stored it there
        if (outlineDisplayDiv.dataset.markdown) {
            markdownText = outlineDisplayDiv.dataset.markdown;
        } else {
            // Otherwise, make a best effort to get the text content
            markdownText = tempDiv.textContent;
        }
        
        // Populate textarea with the markdown content
        outlineEditTextarea.value = markdownText;
        
        // Change edit button text
        editOutlineBtn.textContent = 'Save Edits';
        editOutlineBtn.removeEventListener('click', handleEditOutline);
        editOutlineBtn.addEventListener('click', handleSaveOutlineEdit);
    }
    
    /**
     * Saves the edited outline and renders it as markdown
     */
    function handleSaveOutlineEdit() {
        // Get the edited markdown text
        const editedMarkdown = outlineEditTextarea.value.trim();
        
        // Store the raw markdown for future editing
        outlineDisplayDiv.dataset.markdown = editedMarkdown;
        
        // Render the markdown
        outlineDisplayDiv.innerHTML = renderMarkdown(editedMarkdown);
        
        // Toggle visibility back
        outlineEditTextarea.style.display = 'none';
        outlineDisplayDiv.style.display = 'block';
        
        // Reset button text and event listener
        editOutlineBtn.textContent = 'Edit Outline';
        editOutlineBtn.removeEventListener('click', handleSaveOutlineEdit);
        editOutlineBtn.addEventListener('click', handleEditOutline);
    }

     async function handleApproveOutline() {
        const endpoint = apiEndpointInput.value.trim();
        const apiKey = apiKeyInput.value.trim();
        const modelId = modelIdInput.value.trim();

        // Determine the final outline content
        let finalOutline;
        if (outlineEditTextarea.style.display === 'block') {
            // If edit textarea is visible, use its content
            finalOutline = outlineEditTextarea.value.trim();
        } else {
            // Otherwise, use the content from the display div
            finalOutline = outlineDisplayDiv.textContent.trim();
        }

        if (!finalOutline || finalOutline === 'Outline will be generated here...') {
            alert('Cannot approve an empty or placeholder outline.');
            return;
        }

        if (!endpoint || !apiKey || !modelId) {
            alert('API configuration is missing. Please select or save a profile.');
            return;
        }

        console.log("Approved Outline:", finalOutline);

        // Disable outline buttons during generation
        editOutlineBtn.disabled = true;
        approveOutlineBtn.disabled = true;
        approveOutlineBtn.textContent = 'Generating Website...';

        // Show the next sections
        websiteDisplaySection.style.display = 'block';
        actionSection.style.display = 'block';
        websiteIframe.srcdoc = '<p><i>Generating website... Please wait.</i></p>'; // Placeholder content
        saveWebsiteBtn.disabled = true; // Keep save disabled until generation is complete

        // --- Call Website Generation Logic ---
        await generateWebsite(endpoint, apiKey, modelId, finalOutline); // Call the next step

        // Re-enable approve button (or handle state differently if needed)
        // approveOutlineBtn.disabled = false; // Might want to keep disabled after generation?
        approveOutlineBtn.textContent = 'Approve & Generate Website'; // Reset text
     }


     // --- Website Generation Logic ---
     async function generateWebsite(endpoint, apiKey, modelId, outline) {
        console.log("Starting website generation...");
        // TODO: Implement the actual API call and iframe update
        const systemPrompt = `You are an expert web developer. Based *strictly* on the following requirements and outline, generate the complete HTML, CSS, and JavaScript code for a functional, single-page website. Combine the CSS within <style> tags in the <head> and the JavaScript within <script> tags at the end of the <body>. Ensure the output is a single, valid HTML document. Do not include any explanations or commentary outside the code itself.

        IMPORTANT LIMITATIONS:
        1. The website will be opened locally as a single HTML file, so avoid features requiring server-side processing.
        2. All code must be contained within the HTML file.
        3. Avoid features that require database connections.
        4. Focus on client-side functionality that works in a local browser environment.
        5. Ensure the design is responsive and works well on both desktop and mobile devices.

        Outline/Requirements:
        ---
        ${outline}
        ---`;

        const messages = [
            { role: "system", content: systemPrompt },
            // No user message needed here as the outline is in the system prompt
        ];

        try {
            const websiteCode = await callOpenAI(endpoint, apiKey, modelId, messages);
            console.log("Received website code from API.");
            // Basic check if code seems valid (very rudimentary)
            if (websiteCode && websiteCode.toLowerCase().includes('<html')) {
                 websiteIframe.srcdoc = websiteCode;
                 saveWebsiteBtn.disabled = false; // Enable save button
                 console.log("Website rendered in iframe.");
            } else {
                 throw new Error("Generated content doesn't appear to be valid HTML.");
            }

        } catch (error) {
            console.error("Website generation failed:", error);
            websiteIframe.srcdoc = `<p style="color: red;"><b>Error generating website:</b> ${error.message}</p>`;
            saveWebsiteBtn.disabled = true; // Keep save disabled on error
        } finally {
             // Optional: Reset button states if needed
        }
     }

     // --- Save Website Logic ---
     function handleSaveWebsite() {
        const websiteContent = websiteIframe.srcdoc;

        if (!websiteContent || websiteContent.includes('Generating website...') || websiteContent.includes('Error generating website')) {
            alert('No valid website content available to save.');
            return;
        }

        try {
            const blob = new Blob([websiteContent], { type: 'text/html' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'generated_website.html'; // Filename for download
            document.body.appendChild(link); // Required for Firefox
            link.click();
            document.body.removeChild(link); // Clean up
            URL.revokeObjectURL(url); // Free up memory
            console.log("Website saved successfully.");
        } catch (error) {
            console.error("Error saving website:", error);
            alert("Failed to save website content.");
        }
     }


    // --- Event Listeners ---
    // API Config & Profile Management
    toggleApiConfigBtn.addEventListener('click', toggleApiConfig);
    saveProfileBtn.addEventListener('click', saveProfile);
    loadProfileSelect.addEventListener('change', handleProfileSelect);
    deleteProfileBtn.addEventListener('click', deleteProfile);
    
    // Step Navigation & Generation
    generateOutlineBtn.addEventListener('click', () => {
        handleGenerateOutline();
        showStep(STEPS.OUTLINE);
    });
    
    editOutlineBtn.addEventListener('click', handleEditOutline);
    
    approveOutlineBtn.addEventListener('click', () => {
        handleApproveOutline();
        showStep(STEPS.PREVIEW);
    });
    
    backToOutlineBtn.addEventListener('click', () => {
        showStep(STEPS.OUTLINE);
    });
    
    viewFullscreenBtn.addEventListener('click', showFullscreenPreview);
    exitFullscreenBtn.addEventListener('click', hideFullscreenPreview);
    
    saveWebsiteBtn.addEventListener('click', () => {
        saveWebsiteContent(websiteIframe.srcdoc);
    });
    
    saveFullscreenBtn.addEventListener('click', saveFullscreenWebsite);
    
    startOverBtn.addEventListener('click', resetApplication);

    // File Upload Handling
    fileUploadInput.addEventListener('change', handleFileUpload);
    
    // --- Initial Load ---
    loadProfiles();
    checkApiConfigState();
    checkForInProgressGeneration();
    showStep(currentStep);

});

// More JavaScript logic will be added here
