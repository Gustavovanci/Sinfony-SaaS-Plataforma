import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDzTmMtHmDAY2QddkdKdZBDxOJAToxD4GQ",
  authDomain: "carenet-saas.firebaseapp.com",
  projectId: "carenet-saas",
  storageBucket: "carenet-saas.firebasestorage.app",
  messagingSenderId: "659603756725",
  appId: "1:659603756725:web:299abad36746a79f1550fc"
};

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);

// Exporta os serviços que vamos usar
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);