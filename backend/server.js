// server.js

const express = require('express');
const multer = require('multer');
const ffmpeg = require('fluent-ffmpeg');
const path = require('path');
const fs = require('fs');
const cors = require('cors');

// FFmpeg setup - necessary if not pre-installed (Render might require a build script)
// If running locally, you must install FFmpeg separately.
// For Render, you may need a Build Command: apt-get update && apt-get install -y ffmpeg

const app = express();
const port = process.env.PORT || 3000;

// Set up temporary storage for uploaded files
const upload = multer({ dest: 'uploads/' });

// Enable CORS for frontend communication
app.use(cors({
    origin: '*', // Be specific in production, e.g., 'https://your-frontend-url.com'
    methods: ['GET', 'POST']
}));

// Route for file conversion
app.post('/convert', upload.single('audioFile'), (req, res) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }

    const inputPath = req.file.path;
    // Create output filename from original, but with .mp3 extension
    const originalName = req.file.originalname.replace(path.extname(req.file.originalname), '');
    const outputPath = path.join(__dirname, 'uploads', originalName + '.mp3');

    ffmpeg(inputPath)
        .noVideo() // Ensures it's treated purely as an audio conversion
        .audioCodec('libmp3lame')
        .on('error', (err) => {
            console.error('An error occurred: ' + err.message);
            // Clean up files on error
            fs.unlinkSync(inputPath);
            // fs.existsSync(outputPath) && fs.unlinkSync(outputPath); // Output file might not exist
            res.status(500).send('Conversion failed.');
        })
        .on('end', () => {
            console.log('Conversion finished, sending file...');

            // Send the converted file
            res.download(outputPath, (err) => {
                // Clean up all files after download completes
                fs.unlinkSync(inputPath);
                fs.unlinkSync(outputPath);
                if (err) {
                    console.error('Error during file download/cleanup:', err.message);
                }
            });
        })
        .save(outputPath);
});

// Basic check route
app.get('/', (req, res) => {
    res.send('Audio Converter Backend is running.');
});

// Ensure 'uploads' directory exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});