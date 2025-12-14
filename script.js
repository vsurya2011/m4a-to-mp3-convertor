const dropArea = document.getElementById("drop-area");
const fileInput = document.getElementById("fileInput");
const fileList = document.getElementById("file-list");
const form = document.getElementById("upload-form");

dropArea.addEventListener("click", () => fileInput.click());

dropArea.addEventListener("dragover", (e) => {
  e.preventDefault();
  dropArea.classList.add("active");
});

dropArea.addEventListener("dragleave", () => {
  dropArea.classList.remove("active");
});

dropArea.addEventListener("drop", (e) => {
  e.preventDefault();
  dropArea.classList.remove("active");
  fileInput.files = e.dataTransfer.files;
  showFiles();
});

fileInput.addEventListener("change", showFiles);

function showFiles() {
  fileList.innerHTML = "";
  Array.from(fileInput.files).forEach(file => {
    const li = document.createElement("li");
    li.textContent = file.name;
    fileList.appendChild(li);
  });
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const formData = new FormData(form);
  const res = await fetch("/convert", {
    method: "POST",
    body: formData
  });

  if (!res.ok) {
    alert("Conversion failed");
    return;
  }

  const blob = await res.blob();
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "converted";
  a.click();
});
