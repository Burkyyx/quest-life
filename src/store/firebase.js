import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth'
import { getFirestore, doc, setDoc, getDoc, collection, query, where, getDocs, updateDoc, arrayUnion, arrayRemove, onSnapshot } from 'firebase/firestore'

// Configure via .env.local — copy .env.local.example and fill in your Firebase values
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "",
}

let app = null
let auth = null
let db = null

function isConfigured() {
  return firebaseConfig.apiKey !== ""
}

function init() {
  if (!isConfigured()) return false
  if (app) return true
  try {
    app = initializeApp(firebaseConfig)
    auth = getAuth(app)
    db = getFirestore(app)
    return true
  } catch (e) {
    console.error('Firebase init error', e)
    return false
  }
}

// Auth
async function loginWithGoogle() {
  if (!init()) return null
  try {
    const provider = new GoogleAuthProvider()
    const result = await signInWithPopup(auth, provider)
    const user = result.user
    // Save/update user profile in Firestore
    await setDoc(doc(db, 'users', user.uid), {
      uid: user.uid,
      displayName: user.displayName,
      email: user.email,
      photoURL: user.photoURL,
      updatedAt: new Date().toISOString(),
    }, { merge: true })
    return user
  } catch (e) {
    console.error('Login error', e)
    return null
  }
}

async function logout() {
  if (!auth) return
  await signOut(auth)
}

function onAuthChange(callback) {
  if (!init()) { callback(null); return () => {} }
  return onAuthStateChanged(auth, callback)
}

// Social
async function searchUsers(emailOrName) {
  if (!db) return []
  const q = query(collection(db, 'users'), where('email', '==', emailOrName))
  const snap = await getDocs(q)
  return snap.docs.map(d => d.data())
}

async function sendFriendRequest(fromUid, toUid) {
  if (!db) return
  await updateDoc(doc(db, 'users', toUid), {
    friendRequests: arrayUnion(fromUid),
  })
}

async function acceptFriend(myUid, friendUid) {
  if (!db) return
  // Add to both friend lists
  await updateDoc(doc(db, 'users', myUid), {
    friends: arrayUnion(friendUid),
    friendRequests: arrayRemove(friendUid),
  })
  await updateDoc(doc(db, 'users', friendUid), {
    friends: arrayUnion(myUid),
  })
}

async function removeFriend(myUid, friendUid) {
  if (!db) return
  await updateDoc(doc(db, 'users', myUid), {
    friends: arrayRemove(friendUid),
  })
  await updateDoc(doc(db, 'users', friendUid), {
    friends: arrayRemove(myUid),
  })
}

async function getUserProfile(uid) {
  if (!db) return null
  const snap = await getDoc(doc(db, 'users', uid))
  return snap.exists() ? snap.data() : null
}

async function syncProgressToCloud(uid, data) {
  if (!db) return
  await setDoc(doc(db, 'progress', uid), {
    level: data.level,
    totalXp: data.totalXp,
    streak: data.streak,
    stats: data.stats,
    updatedAt: new Date().toISOString(),
  }, { merge: true })
}

async function getFriendProgress(friendUid) {
  if (!db) return null
  const snap = await getDoc(doc(db, 'progress', friendUid))
  return snap.exists() ? snap.data() : null
}

export {
  isConfigured, init, loginWithGoogle, logout, onAuthChange,
  searchUsers, sendFriendRequest, acceptFriend, removeFriend,
  getUserProfile, syncProgressToCloud, getFriendProgress,
}
