const input = document.getElementById('fileInput');
const btn = document.getElementById('convertBtn');
const msg = document.getElementById('msg');
const progress = document.getElementById('progressBar');
const dropArea = document.getElementById('drop-area');
const fileList = document.getElementById('fileList');
const bitrate = document.getElementById('bitrate');
const percent = document.getElementById('percent');

dropArea.onclick = () => input.click();

input.onchange = () => {
  let names = [...input.files].map(f => f.name).join("<br>");
  fileList.innerHTML = names;
};

btn.onclick = () => {
  if (!input.files.length) return alert("Select files first");

  const fd = new FormData();
  for (let f of input.files) fd.append('files', f);
  fd.append('bitrate', bitrate.value);

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
      let disposition = xhr.getResponseHeader("Content-Disposition");
      let filename = "download.mp3";

      if (disposition && disposition.includes("filename=")) {
        filename = disposition.split("filename=")[1].replaceAll('"','');
      }

      const blob = xhr.response;
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();

      msg.innerText = "Download completed!";
      progress.style.width = percent.innerText = "0%";
    } else {
      msg.innerText = "Conversion Failed!";
    }
  };

  xhr.responseType = "blob";
  xhr.send(fd);
};

function toggleTheme(){
  document.body.classList.toggle("light");
}
