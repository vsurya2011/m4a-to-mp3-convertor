const input = document.getElementById("fileInput");
const dropArea = document.getElementById("drop-area");
const fileList = document.getElementById("fileList");
const btn = document.getElementById("convertBtn");
const progress = document.getElementById("progressBar");
const percent = document.getElementById("percent");
const msg = document.getElementById("msg");
const bitrate = document.getElementById("bitrate");

let files = [];

dropArea.onclick = () => input.click();

dropArea.addEventListener("dragover", e => {
  e.preventDefault();
  dropArea.classList.add("hover");
});

dropArea.addEventListener("dragleave", () => {
  dropArea.classList.remove("hover");
});

dropArea.addEventListener("drop", e => {
  e.preventDefault();
  dropArea.classList.remove("hover");
  files = [...e.dataTransfer.files];
  showFiles();
});

input.onchange = () => {
  files = [...input.files];
  showFiles();
};

function showFiles() {
  fileList.innerHTML = files.map(f => f.name).join("<br>");
}

btn.onclick = () => {
  if (!files.length) {
    alert("Please select files first");
    return;
  }

  const fd = new FormData();
  files.forEach(f => fd.append("files", f));
  fd.append("bitrate", bitrate.value);

  const xhr = new XMLHttpRequest();
  xhr.open("POST", "/convert");

  xhr.upload.onprogress = e => {
    if (e.lengthComputable) {
      let p = Math.round((e.loaded / e.total) * 100);
      progress.style.width = p + "%";
      percent.innerText = p + "%";
    }
  };

  xhr.onload = () => {
    if (xhr.status === 200) {
      const blob = xhr.response;
      const cd = xhr.getResponseHeader("Content-Disposition");
      let filename = "download.mp3";

      if (cd && cd.includes("filename=")) {
        filename = cd.split("filename=")[1].replace(/"/g, "");
      }

      const a = document.createElement("a");
      a.href = window.URL.createObjectURL(blob);
      a.download = filename;
      a.click();

      msg.innerText = "Conversion Successful!";
    } else {
      msg.innerText = "Conversion Failed!";
    }

    progress.style.width = "0%";
    percent.innerText = "";
  };

  xhr.responseType = "blob";
  xhr.send(fd);
};
