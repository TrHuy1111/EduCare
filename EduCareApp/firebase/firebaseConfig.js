import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBVjBWgPtfrN48Cga7jzmMQN97-4OCmziE",
  authDomain: "educare-3dd1b.firebaseapp.com",
  projectId: "educare-3dd1b",
  storageBucket: "educare-3dd1b.firebasestorage.app",
  messagingSenderId: "989081587739",
  appId: "1:989081587739:android:90ca2484fd25371c3a68be",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);