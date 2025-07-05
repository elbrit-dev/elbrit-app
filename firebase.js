import { initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: "AIzaSyCY2qR__9xqrzr2OzCO26cFhoqle4gGYYU",
  authDomain: "elbrit-sso.firebaseapp.com",
  projectId: "elbrit-sso",
  storageBucket: "elbrit-sso.firebasestorage.app",
  messagingSenderId: "998910471029",
  appId: "1:998910471029:web:d0982d548891d02b89413c"
};

const app = initializeApp(firebaseConfig);

export default app; 