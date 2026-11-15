import { useEffect, useState } from 'react'
import { GoogleAuthProvider, getAuth, onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth'
import { deleteDoc, doc, getFirestore, onSnapshot, setDoc } from 'firebase/firestore'
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

function dueAt(fee) {
  const [y, m, d] = fee.paidOn.split('-').map(Number)
  const [h, min] = fee.time.split(':').map(Number)
  const target = new Date(y, m - 1 + fee.plan, 1)
  const lastDay = new Date(target.getFullYear(), target.getMonth() + 1, 0).getDate()
  return new Date(target.getFullYear(), target.getMonth(), Math.min(d, lastDay), h, min).getTime()
}

export async function saveSubscription(token, water, meals, fee) {
  const ref = doc(getFirestore(getFirebaseApp()), 'reminderSubs', token)
  if (!water.on && !meals.some((meal) => meal.on) && !(fee && fee.on)) return deleteDoc(ref)
  return setDoc(ref, {
    token,
    tz: Intl.DateTimeFormat().resolvedOptions().timeZone,
    water: { on: water.on, mins: water.mins, since: water.since || Date.now() },
    meals: meals.map(({ id, label, time, on }) => ({ id, label, time, on })),
    fee: fee ? { on: fee.on, plan: fee.plan, paidOn: fee.paidOn, time: fee.time, nextDue: fee.nextDue, dueAt: dueAt(fee) } : { on: false },
    updatedAt: Date.now(),
  })
}

// Cross-device sync. Signing in with Google gives every device the same user id, so the data lives under
// users/{uid} and Firestore pushes each change to every signed-in device live. No codes to copy.
const db = () => getFirestore(getFirebaseApp())
const userDoc = (uid, name) => doc(db(), 'users', uid, 'data', name)

export function useUser() {
  const [user, setUser] = useState(undefined)
  useEffect(() => {
    try { return onAuthStateChanged(getAuth(getFirebaseApp()), setUser) } catch { setUser(null); return undefined }
  }, [])
  return user
}

export const signInWithGoogle = () => signInWithPopup(getAuth(getFirebaseApp()), new GoogleAuthProvider())
export const signOutUser = () => signOut(getAuth(getFirebaseApp()))

// Calls onData(data | null) now and again every time any device saves a change.
export function watchUserData(uid, name, onData, onError) {
  return onSnapshot(userDoc(uid, name), (snap) => onData(snap.exists() ? snap.data() : null), onError)
}

export function saveFee(uid, fee) {
  const { on, plan, paidOn, time, nextDue, history, updatedAt } = fee
  return setDoc(userDoc(uid, 'fee'), { on, plan, paidOn, time, nextDue, history: history || [], updatedAt: updatedAt || Date.now() })
}

export const saveReminders = (uid, { water, meals, updatedAt }) => setDoc(userDoc(uid, 'reminders'), { water, meals, updatedAt })

export const savePrs = (uid, { logs, targets, updatedAt }) => setDoc(userDoc(uid, 'prs'), { logs, targets, updatedAt })
