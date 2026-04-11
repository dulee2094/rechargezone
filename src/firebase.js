import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, getDocs } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Initialize Firebase only if the API key is provided
let app, db, storage;
if (firebaseConfig.apiKey && firebaseConfig.apiKey !== 'YOUR_FIREBASE_API_KEY') {
  app = initializeApp(firebaseConfig);
  db = getFirestore(app);
  storage = getStorage(app);
}

// ------------------------------------
// Database Schema and Core Services
// ------------------------------------

/**
 * [Collection 1: stations] 
 * Stores the core metadata of the charging station, including the exact floor/pillar info.
 */
export const getStations = async () => {
  if (!db) return [];
  const querySnapshot = await getDocs(collection(db, "stations"));
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

/**
 * [Collection 2: tips]
 * Stores crowd-sourced tips for specific stations.
 */
export const addTipToStation = async (stationId, tipContent, userId = '익명유저') => {
  if (!db) return null;
  return await addDoc(collection(db, "tips"), {
    stationId,
    content: tipContent,
    user: userId,
    createdAt: new Date().toISOString()
  });
};

/**
 * [Collection 3 / Storage: photos]
 * Uploads user-submitted visual proof of the micro-location to Cloud Storage
 * and records the image metadata in Firestore.
 */
export const uploadStationPhoto = async (stationId, imageFile) => {
  if (!storage || !db) return null;
  
  // 1. Storage Upload
  const imageRef = ref(storage, `stations/${stationId}/${Date.now()}_${imageFile.name}`);
  await uploadBytes(imageRef, imageFile);
  const imageUrl = await getDownloadURL(imageRef);

  // 2. Firestore DB Record
  await addDoc(collection(db, "photos"), {
    stationId,
    url: imageUrl,
    createdAt: new Date().toISOString()
  });

  return imageUrl;
};

export { db, storage };
