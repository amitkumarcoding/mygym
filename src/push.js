import { deleteDoc, doc, getFirestore, setDoc } from 'firebase/firestore'
import { getMessaging, getToken, isSupported } from 'firebase/messaging'
import { firebaseConfig, getFirebaseApp, vapidKey } from './firebase'

export async function registerPush() {
  if (!('serviceWorker' in navigator)) throw new Error('Service workers are not supported in this browser.')
  if (!vapidKey) throw new Error('Add VITE_FIREBASE_VAPID_KEY to enable push notifications.')
  if (!(await isSupported())) throw new Error('Push is not supported in this browser.')

  const serviceWorkerUrl = new URL('/firebase-messaging-sw.js', window.location.origin)
  serviceWorkerUrl.searchParams.set('config', JSON.stringify(firebaseConfig))
  const registration = await navigator.serviceWorker.register(serviceWorkerUrl)
  const token = await getToken(getMessaging(getFirebaseApp()), {
    vapidKey,
    serviceWorkerRegistration: registration,
  })
  if (!token) throw new Error('No push token received.')
  return token
}

export async function saveSubscription(token, water, meals) {
  const ref = doc(getFirestore(getFirebaseApp()), 'reminderSubs', token)
  if (!water.on && !meals.some((meal) => meal.on)) return deleteDoc(ref)
  return setDoc(ref, {
    token,
    tz: Intl.DateTimeFormat().resolvedOptions().timeZone,
    water: { on: water.on, mins: water.mins },
    meals: meals.map(({ id, label, time, on }) => ({ id, label, time, on })),
    updatedAt: Date.now(),
  })
}
