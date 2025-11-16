const dropArea = document.getElementById("drop-area");
const fileInput = document.getElementById("fileInput");
const uploadBtn = document.getElementById("uploadBtn");
let selectedFile;

dropArea.onclick = () => fileInput.click();
fileInput.onchange = () => selectedFile = fileInput.files[0];

uploadBtn.onclick = async () => {
    if (!selectedFile) return alert("Upload M4A file!");
    
    let formData = new FormData();
    formData.append("audio", selectedFile);

    let response = await fetch("/convert", {
        method: "POST",
        body: formData
    });

    let blob = await response.blob();
    let url = window.URL.createObjectURL(blob);
    let a = document.createElement("a");
    a.href = url;
    a.download = "converted.mp3";
    a.click();
};
