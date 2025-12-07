const express = require("express");
const multer = require("multer");
const { exec } = require("child_process");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 10000;

// Serve static files (index.html, style.css, script.js) from the root directory
app.use(express.static(__dirname)); 

// Configure multer to store files temporarily
const upload = multer({ dest: path.join(__dirname, 'uploads/') });

app.post("/convert", upload.single("audio"), (req, res) => {
    // Check if a file was actually uploaded
    if (!req.file) {
        return res.status(400).send("No file uploaded.");
    }

    const inputFile = req.file.path;
    const outputFile = inputFile + ".mp3";
    
    // Command to convert M4A to MP3 using ffmpeg
    // Note: The conversion process may take some time depending on the file size.
    exec(`ffmpeg -i ${inputFile} -q:a 0 -map a ${outputFile}`, (err) => {
        if (err) {
            console.error("FFmpeg Error:", err);
            // Clean up the input file if conversion fails
            if (fs.existsSync(inputFile)) fs.unlinkSync(inputFile);
            return res.status(500).send("❌ Conversion Failed! Check that the file is a valid M4A.");
        }

        // Send the converted file back to the client
        res.download(outputFile, "converted.mp3", (downloadErr) => {
            // Clean up both input and output files after download completes (or fails)
            if (fs.existsSync(inputFile)) fs.unlinkSync(inputFile);
            if (fs.existsSync(outputFile)) fs.unlinkSync(outputFile);
            if (downloadErr) console.error("Download Error:", downloadErr);
        });
    });
});

app.listen(PORT, () =>
    console.log(`🚀 Server running on port ${PORT}`)
);