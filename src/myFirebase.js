import firebase from 'firebase'
const config = {
  apiKey: "AIzaSyAivuocdoQVZYS5CYCitvDAiDV7Jh2uwEg",
  authDomain: "douzi-d45bc.firebaseapp.com",
  databaseURL: "https://douzi-d45bc.firebaseio.com",
  projectId: "douzi-d45bc",
  storageBucket: "douzi-d45bc.appspot.com",
  messagingSenderId: "796630894603"
};
firebase.initializeApp(config);
export default firebase;