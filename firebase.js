import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getFunctions } from 'firebase/functions';

const firebaseConfig = {
  apiKey: 'AIzaSyCizmEStDfg5vRRJbZejFgY3N4iCdihXHE',
  authDomain: 'bloggenerator-ed7ed.firebaseapp.com',
  projectId: 'bloggenerator-ed7ed',
  storageBucket: 'bloggenerator-ed7ed.appspot.com',
  messagingSenderId: '465064074857',
  appId: '1:465064074857:web:4f5a972a5137ba6ea48cf8',
  measurementId: 'G-J7YVMFPKYW',
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const firestore = getFirestore(app);
const functions = getFunctions(app);

export { auth, firestore, functions };
