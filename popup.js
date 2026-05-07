const toggleBtn = document.getElementById("toggleBtn");
const statusDot = document.getElementById("statusDot");
const statusText = document.getElementById("statusText");

// Carga estado inicial
chrome.runtime.sendMessage({ action: "status" }, (response) => {
  updateUI(response.enabled);
});

// Listener para cambios
toggleBtn.addEventListener("click", () => {
  chrome.runtime.sendMessage({ action: "toggle" }, (response) => {
    updateUI(response.enabled);
  });
});

function updateUI(enabled) {
  if (enabled) {
    statusDot.classList.add("active");
    statusText.textContent = "Activo - Emulando Argentina";
    toggleBtn.textContent = "Desactivar Emulación";
    toggleBtn.classList.remove("off");
  } else {
    statusDot.classList.remove("active");
    statusText.textContent = "Desactivado";
    toggleBtn.textContent = "Activar Emulación";
    toggleBtn.classList.add("off");
  }
}
