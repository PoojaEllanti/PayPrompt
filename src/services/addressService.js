import { collection, addDoc, getDocs, doc, updateDoc } from "firebase/firestore";
import { db } from "../config/firebase";

export async function getAddresses(uid) {
  const snap = await getDocs(collection(db, "users", uid, "addresses"));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function addAddress(uid, data) {
  await addDoc(collection(db, "users", uid, "addresses"), data);
}

export async function setDefaultAddress(uid, addressId) {
  const snap = await getDocs(collection(db, "users", uid, "addresses"));
  snap.docs.forEach(d => {
    updateDoc(doc(db, "users", uid, "addresses", d.id), {
      isDefault: d.id === addressId,
    });
  });
}
