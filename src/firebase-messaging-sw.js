// Must be served from the site root: /firebase-messaging-sw.js
importScripts("https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js");

// Same values as your web app's Firebase config.
firebase.initializeApp({
  apiKey: "YOUR_API_KEY",
  projectId: "YOUR_PROJECT_ID",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID",
});

const messaging = firebase.messaging();

// Reminders are sent as data-only messages, so we draw the notification ourselves.
messaging.onBackgroundMessage(({ data }) => {
  self.registration.showNotification(data.title, {
    body: data.body,
    tag: data.tag,
    icon: "/icon-192.png",
  });
});

self.addEventListener("notificationclick", (e) => {
  e.notification.close();
  e.waitUntil(clients.openWindow("/#reminders"));
});
