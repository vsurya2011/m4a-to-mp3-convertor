const express = require("express");
const multer = require("multer");
const { exec } = require("child_process");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 10000;

app.use(express.static("public"));

const upload = multer({ dest: "uploads/" });

app.post("/convert", upload.single("audio"), (req, res) => {
    const inputFile = req.file.path;
    const outputFile = inputFile + ".mp3";
    
    exec(`ffmpeg -i ${inputFile} ${outputFile}`, (err) => {
        if (err) return res.status(500).send("❌ Conversion Failed!");

        res.download(outputFile, "converted.mp3", () => {
            fs.unlinkSync(inputFile);
            fs.unlinkSync(outputFile);
        });
    });
});

app.listen(PORT, () =>
    console.log(`🚀 Server running on port ${PORT}`)
);
