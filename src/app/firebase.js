// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBcmoVc5XmQRfagQF1Ls30wfyCaziv4Bdc",
  authDomain: "personal-project-61eb7.firebaseapp.com",
  projectId: "personal-project-61eb7",
  storageBucket: "personal-project-61eb7.firebasestorage.app",
  messagingSenderId: "922860742722",
  appId: "1:922860742722:web:be3d9ae2376166761c65db",
  measurementId: "G-86PZW47YLV"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);