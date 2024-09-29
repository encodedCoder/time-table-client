self.addEventListener("push", function (event) {
  const data = event.data.json();
  const options = {
    body: data.body,
    icon: "images/encodedcoder.png", // Path to your icon
    badge: "images/encodedcoder.png", // Path to your icon
  };

  event.waitUntil(self.registration.showNotification(data.title, options));
});
