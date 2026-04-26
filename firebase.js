// firebase.js

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-app.js";

import {
  getDatabase,
  ref,
  set,
  get,
  remove
} from "https://www.gstatic.com/firebasejs/12.12.1/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyCLazNQWxGpafpAJSA3h958fxwjtU2xp3g",
  authDomain: "studyflow-web-a3a50.firebaseapp.com",
  databaseURL: "https://studyflow-web-a3a50-default-rtdb.firebaseio.com",
  projectId: "studyflow-web-a3a50",
  storageBucket: "studyflow-web-a3a50.firebasestorage.app",
  messagingSenderId: "517903306485",
  appId: "1:517903306485:web:117b1e774299fb29247fbc"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

export {
  db,
  ref,
  set,
  get,
  remove
};