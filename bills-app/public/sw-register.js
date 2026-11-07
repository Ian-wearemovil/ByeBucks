if ("serviceWorker" in navigator) {
  navigator.serviceWorker
    .register("/sw.js")
    .then((registration) => {
      console.log("Service Worker registered:", registration);
    })
    .catch((error) => {
      console.log("Service Worker registration failed:", error);
    });
}

let deferredPrompt;

window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  deferredPrompt = e;
  const installButton = document.getElementById("install-button");
  if (installButton) {
    installButton.style.display = "block";
    installButton.addEventListener("click", () => {
      installButton.style.display = "none";
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === "accepted") {
          console.log("User accepted the install prompt");
        }
        deferredPrompt = null;
      });
    });
  }
});

if ("Notification" in window && Notification.permission === "default") {
  setTimeout(() => {
    Notification.requestPermission().then((permission) => {
      console.log("Notification permission:", permission);
    });
  }, 5000);
}
