import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAjgpmIlQmvTbYhyUTbHPWAPyHGxY6niUY",
  authDomain: "dam-ai-guardian.firebaseapp.com",
  projectId: "dam-ai-guardian",
  storageBucket: "dam-ai-guardian.firebasestorage.app",
  messagingSenderId: "516300696995",
  appId: "1:516300696995:web:fd6c12be31e133cd113e16",
  measurementId: "G-1BMETKT0WN"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export { app, analytics, auth, googleProvider };
