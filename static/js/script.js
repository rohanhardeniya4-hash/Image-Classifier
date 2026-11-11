const imageInput = document.getElementById("imageInput");
const browseButton = document.getElementById("browseButton");
const dropArea = document.getElementById("dropArea");
const dropZone = document.getElementById("dropZone");
const previewWrap = document.getElementById("previewWrap");
const previewImage = document.getElementById("previewImage");
const fileName = document.getElementById("fileName");
const fileSize = document.getElementById("fileSize");
const removeButton = document.getElementById("removeButton");
const classifyButton = document.getElementById("classifyButton");

const emptyState = document.getElementById("emptyState");
const loadingState = document.getElementById("loadingState");
const results = document.getElementById("results");
const errorState = document.getElementById("errorState");
const errorMessage = document.getElementById("errorMessage");
const resultStatus = document.getElementById("resultStatus");

let selectedFile = null;
let previewUrl = null;

browseButton.addEventListener("click", () => imageInput.click());
dropArea.addEventListener("click", () => imageInput.click());
dropArea.addEventListener("keydown", (event) => {
  if (event.key === "Enter" || event.key === " ") imageInput.click();
});
imageInput.addEventListener("change", (event) => handleFile(event.target.files[0]));

["dragenter", "dragover"].forEach((name) => {
  dropZone.addEventListener(name, (event) => {
    event.preventDefault();
    dropArea.classList.add("dragging");
  });
});
["dragleave", "drop"].forEach((name) => {
  dropZone.addEventListener(name, (event) => {
    event.preventDefault();
    dropArea.classList.remove("dragging");
  });
});
dropZone.addEventListener("drop", (event) => handleFile(event.dataTransfer.files[0]));

function handleFile(file) {
  if (!file) return;
  const validTypes = ["image/jpeg", "image/png", "image/webp"];
  if (!validTypes.includes(file.type)) {
    showError("Please select a JPG, PNG, or WEBP image.");
    return;
  }
  if (file.size > 10 * 1024 * 1024) {
    showError("Image is too large. Maximum size is 10 MB.");
    return;
  }

  selectedFile = file;
  if (previewUrl) URL.revokeObjectURL(previewUrl);
  previewUrl = URL.createObjectURL(file);
  previewImage.src = previewUrl;
  fileName.textContent = file.name;
  fileSize.textContent = formatSize(file.size);

  dropArea.classList.add("hidden");
  previewWrap.classList.remove("hidden");
  classifyButton.disabled = false;
  resetResult();
}

function formatSize(bytes) {
  return bytes < 1024 * 1024
    ? `${(bytes / 1024).toFixed(0)} KB`
    : `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

removeButton.addEventListener("click", () => {
  selectedFile = null;
  imageInput.value = "";
  if (previewUrl) URL.revokeObjectURL(previewUrl);
  previewUrl = null;
  previewWrap.classList.add("hidden");
  dropArea.classList.remove("hidden");
  classifyButton.disabled = true;
  resetResult();
});

function resetResult() {
  emptyState.classList.remove("hidden");
  loadingState.classList.add("hidden");
  results.classList.add("hidden");
  errorState.classList.add("hidden");
  resultStatus.textContent = "WAITING";
  resultStatus.classList.remove("done");
}

function showError(message) {
  emptyState.classList.add("hidden");
  loadingState.classList.add("hidden");
  results.classList.add("hidden");
  errorState.classList.remove("hidden");
  errorMessage.textContent = message;
  resultStatus.textContent = "ERROR";
  resultStatus.classList.remove("done");
}

classifyButton.addEventListener("click", async () => {
  if (!selectedFile) return;

  emptyState.classList.add("hidden");
  results.classList.add("hidden");
  errorState.classList.add("hidden");
  loadingState.classList.remove("hidden");
  classifyButton.disabled = true;
  resultStatus.textContent = "PROCESSING";
  resultStatus.classList.remove("done");

  const formData = new FormData();
  formData.append("image", selectedFile);

  try {
    const response = await fetch("/predict", { method: "POST", body: formData });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Could not classify this image.");
    renderResults(data);
  } catch (error) {
    showError(error.message || "Could not connect to the server. Is Flask running?");
  } finally {
    classifyButton.disabled = !selectedFile;
  }
});

function renderResults(data) {
  loadingState.classList.add("hidden");
  results.classList.remove("hidden");
  resultStatus.textContent = "COMPLETE";
  resultStatus.classList.add("done");

  document.getElementById("topLabel").textContent = data.prediction.label;
  document.getElementById("topConfidence").textContent = `${data.prediction.confidence}%`;
  document.getElementById("topProgress").style.width = `${data.prediction.confidence}%`;

  const list = document.getElementById("predictionList");
  list.innerHTML = "";
  data.results.slice(1).forEach((item) => {
    const row = document.createElement("div");
    row.className = "prediction-row";

    const details = document.createElement("div");
    const name = document.createElement("div");
    name.className = "prediction-name";
    name.textContent = item.label;
    const track = document.createElement("div");
    track.className = "bar-track";
    const fill = document.createElement("div");
    fill.className = "bar-fill";
    fill.style.width = `${item.confidence}%`;
    track.appendChild(fill);
    details.append(name, track);

    const score = document.createElement("span");
    score.className = "prediction-score";
    score.textContent = `${item.confidence}%`;
    row.append(details, score);
    list.appendChild(row);
  });
}
