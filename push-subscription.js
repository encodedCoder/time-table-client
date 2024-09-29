const serverUrl = "https://time-table-server-ixc6.onrender.com";
// const serverUrl = "http://localhost:3000";

// Fetch the public key from the server
fetch(`${serverUrl}/vapidPublicKey`)
  .then(function (response) {
    if (!response.ok) {
      throw new Error("Failed to fetch VAPID public key.");
    }
    return response.json();
  })
  .then(function (responseData) {
    if (!(responseData && responseData.publicKey)) {
      throw new Error("Bad response from server.");
    }
    const publicKey = responseData.publicKey;
    console.log("Public Key:", publicKey);

    // Initialize push notifications after the public key is fetched
    if ("serviceWorker" in navigator && "PushManager" in window) {
      navigator.serviceWorker
        .register("/service-worker.js")
        .then(function (swReg) {
          console.log("Service Worker is registered", swReg);
          initializePushNotifications(swReg, publicKey);
        })
        .catch(function (error) {
          console.error("Service Worker Error", error);
        });
    }
  })
  .catch(function (error) {
    console.error("Error fetching public key:", error);
  });

function initializePushNotifications(swReg, publicKey) {
  // Request notification permission
  if (Notification.permission !== "granted") {
    Notification.requestPermission().then(function (permission) {
      if (permission === "granted") {
        subscribeUser(swReg, publicKey);
      }
    });
  } else {
    subscribeUser(swReg, publicKey);
  }
}

function subscribeUser(swReg, publicKey) {
  const applicationServerKey = urlB64ToUint8Array(publicKey);
  swReg.pushManager
    .subscribe({
      userVisibleOnly: true,
      applicationServerKey: applicationServerKey,
    })
    .then((subscription) => {
      console.log("User is subscribed:", subscription);
      // Send subscription to the server
      fetch(`${serverUrl}/subscribe`, {
        method: "POST",
        body: JSON.stringify(subscription),
        headers: {
          "Content-Type": "application/json",
        },
      });
    })
    .catch((error) => {
      console.error("Failed to subscribe the user: ", error);
    });
}

function urlB64ToUint8Array(base64String) {
  if (!base64String) {
    throw new Error("Invalid base64 string");
  }

  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, "+")
    .replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
