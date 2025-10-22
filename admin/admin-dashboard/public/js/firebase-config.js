// Firebase configuration settings for IDLab
// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBd5UbqhPNZnLAXY2rrDZczjTtsT39CpaM",
    authDomain: "idlab-d9000.firebaseapp.com",
    databaseURL: "https://idlab-d9000-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "idlab-d9000",
    storageBucket: "idlab-d9000.firebasestorage.app",
    messagingSenderId: "617570786597",
    appId: "1:617570786597:web:5460d103a8ae39b90e4ecc",
    measurementId: "G-Y6RHW461TW"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize Firebase services
const db = firebase.firestore();
const auth = firebase.auth();
const storage = firebase.storage();

console.log('✅ Firebase initialized successfully');