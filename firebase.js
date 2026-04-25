import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyD4W1t6cvyZYUxx-DoAkOJb0baGpoB6wxU",
  authDomain: "p-e-samira.firebaseapp.com",
  projectId: "p-e-samira",
  storageBucket: "p-e-samira.firebasestorage.app",
  messagingSenderId: "794266507841",
  appId: "1:794266507841:web:15be3af01d1ee244e584c0"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);