const express = require("express");
const multer = require("multer");
const { exec } = require("child_process");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 10000;

// FIX 1: Serve static files from the root directory (__dirname). 
// This resolves the "Cannot GET /" error.
app.use(express.static(__dirname)); 

// Create 'uploads' directory if it doesn't exist (needed for multer)
const UPLOADS_DIR = path.join(__dirname, 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR);
}

// Configure multer to store files temporarily in the 'uploads' directory
const upload = multer({ dest: UPLOADS_DIR });

app.post("/convert", upload.single("audio"), (req, res) => {
    if (!req.file) {
        return res.status(400).send("No file uploaded.");
    }

    const inputFile = req.file.path;
    const outputFile = inputFile + ".mp3";
    
    // Function to clean up both files
    const cleanup = () => {
        if (fs.existsSync(inputFile)) fs.unlinkSync(inputFile);
        // The output file might not exist if conversion failed, check first
        if (fs.existsSync(outputFile)) fs.unlinkSync(outputFile);
    };

    // FIX 2: Execute the local './ffmpeg' binary
    // -q:a 0 sets the highest quality VBR MP3 encoding
    exec(`./ffmpeg -i ${inputFile} -q:a 0 -map a ${outputFile}`, (err) => {
        if (err) {
            console.error("FFmpeg Error:", err);
            cleanup();
            return res.status(500).send("❌ Conversion Failed! Check that the file is a valid M4A.");
        }

        // Send the converted file back to the client
        res.download(outputFile, "converted.mp3", (downloadErr) => {
            cleanup(); // Clean up both files after download is complete
            if (downloadErr) console.error("Download Error:", downloadErr);
        });
    });
});

app.listen(PORT, () =>
    console.log(`🚀 Server running on port ${PORT}`)
);