import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
// const firebaseConfig = {
//   apiKey: "YOUR_API_KEY",
//   authDomain: "YOUR_AUTH_DOMAIN",
//   projectId: "YOUR_PROJECT_ID",
//   storageBucket: "YOUR_STORAGE_BUCKET",
//   messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
//   appId: "YOUR_APP_ID",
//   measurementId: "YOUR_MEASUREMENT_ID"
// };
const firebaseConfig = {
  apiKey: "AIzaSyChixrJpbHtTzEtpXNMXz27gPs1KHR6rS0",
  authDomain: "school-manegement-2.firebaseapp.com",
  projectId: "school-manegement-2",
  storageBucket: "school-manegement-2.firebasestorage.app",
  messagingSenderId: "176724383157",
  appId: "1:176724383157:web:afa47fc61452f11862b5fc"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };