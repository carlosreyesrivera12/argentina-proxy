const PROXY_URL = "https://argentina-proxy.vercel.app/proxy?url=";

let isEnabled = true;

// Solo intercepta flow.com.ar
chrome.webRequest.onBeforeRequest.addListener(
  (details) => {
    if (!isEnabled || details.url.includes("vercel.app")) {
      return;
    }

    // Solo main_frame de flow
    if (details.type === 'main_frame' && details.url.includes('flow.com.ar')) {
      const targetUrl = encodeURIComponent(details.url);
      const proxyUrl = PROXY_URL + targetUrl;
      return { redirectUrl: proxyUrl };
    }
  },
  { urls: ["https://*.flow.com.ar/*"] },
  ["blocking"]
);

// Listener para activar/desactivar
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "toggle") {
    isEnabled = !isEnabled;
    sendResponse({ enabled: isEnabled });
  } else if (request.action === "status") {
    sendResponse({ enabled: isEnabled });
  }
});
