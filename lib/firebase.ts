// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyA3_1pLJ7tjYGjaSoAXZ_LUUwlaMpRnsqU",
    authDomain: "x-clone-137ac.firebaseapp.com",
    projectId: "x-clone-137ac",
    storageBucket: "x-clone-137ac.appspot.com",
    messagingSenderId: "851522659961",
    appId: "1:851522659961:web:0aaa971eca52d6a145d6a8",
    measurementId: "G-XVTNFX2NZK",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
