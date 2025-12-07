// script.js

const dropArea = document.getElementById('drop-area');
const fileInput = document.getElementById('fileInput');
const selectFileBtn = document.getElementById('selectFileBtn');
const convertBtn = document.getElementById('convertBtn');
const fileNameDisplay = document.getElementById('fileName');
const statusMessage = document.getElementById('statusMessage');

let selectedFile = null;

// Utility functions
const updateUI = (file, message, isError = false) => {
    selectedFile = file;
    fileNameDisplay.textContent = file ? `File: ${file.name}` : '';
    convertBtn.disabled = !file;
    statusMessage.textContent = message || '';
    statusMessage.className = 'status-message';
    if (isError) {
        statusMessage.classList.add('error');
    } else if (message) {
        statusMessage.classList.add('success');
    }
};

const preventDefaults = (e) => {
    e.preventDefault();
    e.stopPropagation();
};

// --- Drag and Drop Handlers ---
['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    dropArea.addEventListener(eventName, preventDefaults, false);
    document.body.addEventListener(eventName, preventDefaults, false); // Prevent file opening in browser
});

// Highlight drop area when file is dragged over it
dropArea.addEventListener('dragenter', () => dropArea.classList.add('drag-over'), false);
dropArea.addEventListener('dragover', () => dropArea.classList.add('drag-over'), false);
dropArea.addEventListener('dragleave', () => dropArea.classList.remove('drag-over'), false);
dropArea.addEventListener('drop', () => dropArea.classList.remove('drag-over'), false);

// Handle dropped files
dropArea.addEventListener('drop', (e) => {
    const dt = e.dataTransfer;
    const files = dt.files;
    
    if (files.length > 0) {
        const file = files[0];
        if (file.type === 'audio/mp4' || file.name.toLowerCase().endsWith('.m4a')) {
            updateUI(file, 'Ready for conversion.');
        } else {
            updateUI(null, 'Please drop an M4A file.', true);
        }
    }
}, false);

// --- File Input Handlers ---
selectFileBtn.addEventListener('click', () => {
    fileInput.click();
});

fileInput.addEventListener('change', (e) => {
    const files = e.target.files;
    if (files.length > 0) {
        updateUI(files[0], 'Ready for conversion.');
    }
});

// --- Conversion Logic ---
convertBtn.addEventListener('click', async () => {
    if (!selectedFile) return;

    updateUI(selectedFile, 'Converting... Please wait.', false);
    convertBtn.disabled = true;

    const formData = new FormData();
    formData.append('audioFile', selectedFile);

    try {
        const response = await fetch(`${BACKEND_URL}/convert`, {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            throw new Error(`Server responded with status: ${response.statusText}`);
        }

        // Get file name from response headers (Content-Disposition)
        const contentDisposition = response.headers.get('Content-Disposition');
        let filename = 'converted.mp3';
        if (contentDisposition) {
            const match = contentDisposition.match(/filename="(.+?)"/);
            if (match && match[1]) {
                filename = match[1];
            }
        }
        
        // Get the converted file data as a Blob
        const blob = await response.blob();
        
        // Create a temporary URL for the Blob
        const url = window.URL.createObjectURL(blob);
        
        // Create a hidden link element to trigger download
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        
        // Clean up
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);

        updateUI(null, 'Conversion successful! File is downloading.', false);

    } catch (error) {
        console.error('Conversion Error:', error);
        updateUI(null, `Conversion failed: ${error.message}`, true);
    } finally {
        convertBtn.disabled = false;
        // Clear the file input for security/reuse
        fileInput.value = ''; 
    }
});