/* Firebase Cloud Messaging background handler.
   Shows notifications when a push arrives while the app is closed / in the background. */
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyAYYYWvM7ZE1cCjiisDhTVmqkleCv7mUZE",
  authDomain: "tac-coach.firebaseapp.com",
  projectId: "tac-coach",
  storageBucket: "tac-coach.firebasestorage.app",
  messagingSenderId: "458764699381",
  appId: "1:458764699381:web:48fa254e87af3651a927bc"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const n = (payload && payload.notification) || {};
  const data = (payload && payload.data) || {};
  const title = n.title || data.title || 'Tour Against Cancer';
  const body = n.body || data.body || '';
  self.registration.showNotification(title, {
    body,
    icon: './icons/logo.svg',
    badge: './icons/logo.svg',
    data: { url: './index.html' }
  });
});

self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  e.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
      for (const c of list) { if ('focus' in c) return c.focus(); }
      if (self.clients.openWindow) return self.clients.openWindow('./index.html');
    })
  );
});
