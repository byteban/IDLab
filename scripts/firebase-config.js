// Firebase Configuration for IDLab Website
// Replace these values with your actual Firebase project configuration from Firebase Console

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAKGXrno2HzkudsVS3DjLdFKuFjLYwu45E",
  authDomain: "idlab-d9000.firebaseapp.com",
  projectId: "idlab-d9000",
  storageBucket: "idlab-d9000.firebasestorage.app",
  messagingSenderId: "617570786597",
  appId: "1:617570786597:android:1095dd7fb2d3ec660e4ecc"
};

// Initialize Firebase using compatibility SDK
firebase.initializeApp(firebaseConfig);

// Get Firebase services
const db = firebase.firestore();
const storage = firebase.storage();

console.log('Firebase initialized successfully');