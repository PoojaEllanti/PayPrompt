// src/services/customerService.js

import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";

import { db } from "../config/firebase";

const customerRef = collection(db, "customers");

// ----------------------------
// GET ALL CUSTOMERS (admin use)
// ----------------------------
export async function getAllCustomers() {
  const snap = await getDocs(customerRef);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

// ----------------------------
// GET CUSTOMER BY UID
// ----------------------------
export async function getCustomerById(id) {
  const snap = await getDoc(doc(db, "customers", id));
  return snap.exists() ? snap.data() : null;
}

// ----------------------------
// SAVE CUSTOMER
// ----------------------------
export async function saveCustomer(customer) {
  await addDoc(customerRef, {
    ...customer,
    createdAt: serverTimestamp(),
    totalOrders: 0,
    balance: 0,
  });
}

// ----------------------------
// UPDATE CUSTOMER
// ----------------------------
export async function updateCustomer(id, data) {
  await updateDoc(doc(db, "customers", id), data);
}

// ----------------------------
// DELETE CUSTOMER
// ----------------------------
export async function deleteCustomer(id) {
  await deleteDoc(doc(db, "customers", id));
}
