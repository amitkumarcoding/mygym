importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js')
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js')

const config = new URL(self.location.href).searchParams.get('config')
if (!config) throw new Error('Firebase configuration is missing from the service worker URL.')

firebase.initializeApp(JSON.parse(config))
const messaging = firebase.messaging()

messaging.onBackgroundMessage(({ data = {} }) => {
  if (!data.title || !data.body) return
  self.registration.showNotification(data.title, {
    body: data.body,
    tag: data.tag,
  })
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  event.waitUntil(clients.openWindow('/#reminders'))
})
