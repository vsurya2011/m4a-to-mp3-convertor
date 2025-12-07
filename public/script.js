document.addEventListener('DOMContentLoaded', () => {
    const fileInput = document.getElementById('fileInput');
    const uploadBtn = document.getElementById('uploadBtn');
    const dropArea = document.getElementById('drop-area');

    // --- Drag and Drop Handlers (Optional but good UX) ---
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, preventDefaults, false);
    });
    
    function preventDefaults (e) {
        e.preventDefault();
        e.stopPropagation();
    }

    dropArea.addEventListener('drop', handleDrop, false);

    function handleDrop(e) {
        let dt = e.dataTransfer;
        let files = dt.files;
        // Assume the first file is the one to use
        if (files.length > 0) {
            fileInput.files = files; 
            // Optional: trigger conversion right after drop
            // uploadBtn.click();
        }
    }

    // --- Button Click Handler ---
    uploadBtn.addEventListener('click', async () => {
        if (!fileInput.files.length) {
            alert("Please select an M4A file first.");
            return;
        }

        const file = fileInput.files[0];
        const formData = new FormData();
        formData.append('audio', file); // 'audio' must match the multer field name

        uploadBtn.textContent = "Converting... (This may take a moment)";
        uploadBtn.disabled = true;

        try {
            const response = await fetch('/convert', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                const errorText = await response.text();
                alert(`Conversion failed: ${errorText}`);
                console.error("Server Response Error:", errorText);
            } else {
                // Trigger file download
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.style.display = 'none';
                a.href = url;
                a.download = 'converted.mp3'; // Filename from server
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                alert("✅ Conversion Successful! Download initiated.");
            }
        } catch (error) {
            alert("An unknown error occurred during conversion.");
            console.error("Fetch Error:", error);
        } finally {
            uploadBtn.textContent = "Convert";
            uploadBtn.disabled = false;
        }
    });
});