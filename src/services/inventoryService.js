// src/services/inventoryService.js
import {
  doc,
  getDoc,
  updateDoc,
  collection,
  addDoc,
  orderBy,
  query,
  getDocs,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../config/firebase";

const inventoryRef = doc(db, "inventory", "main");
const historyRef = collection(db, "inventoryHistory");

// ---------------- GET INVENTORY ----------------
export async function getInventory() {
  const snap = await getDoc(inventoryRef);
  if (!snap.exists()) throw new Error("Inventory not found");
  return snap.data();
}

// ---------------- HISTORY LOG ----------------
async function logHistory(action, qty, notes = "") {
  await addDoc(historyRef, {
    action,
    quantity: qty,
    notes,
    timestamp: serverTimestamp(),
  });
}

// ---------------- ADD STOCK ----------------
export async function addStock(filled, empty) {
  const inv = await getInventory();

  const newFilled = inv.filledCans + filled;
  const newEmpty = inv.emptyCans + empty;

  const updated = {
    filledCans: newFilled,
    emptyCans: newEmpty,
    totalCans: newFilled + newEmpty,
    lastUpdated: serverTimestamp(),
  };

  await updateDoc(inventoryRef, updated);
  await logHistory("Added Stock", filled + empty);

  return updated;
}

// ---------------- EXCHANGE (EMPTY → FILLED) ----------------
export async function exchangeCans(qty) {
  const inv = await getInventory();

  if (inv.emptyCans < qty) {
    throw new Error("Not enough empty cans to exchange");
  }

  const newFilled = inv.filledCans + qty;
  const newEmpty = inv.emptyCans - qty;

  const updated = {
    filledCans: newFilled,
    emptyCans: newEmpty,
    totalCans: newFilled + newEmpty,
    lastUpdated: serverTimestamp(),
  };

  await updateDoc(inventoryRef, updated);
  await logHistory("Exchanged (Empty → Filled)", qty);

  return updated;
}

// ---------------- RETURN EMPTY ----------------
export async function increaseEmptyStock(qty) {
  const inv = await getInventory();

  const newEmpty = inv.emptyCans + qty;

  const updated = {
    filledCans: inv.filledCans,
    emptyCans: newEmpty,
    totalCans: inv.filledCans + newEmpty,
    lastUpdated: serverTimestamp(),
  };

  await updateDoc(inventoryRef, updated);
  await logHistory("Empty Returned", qty);

  return updated;
}

// ---------------- HISTORY ----------------
export async function getInventoryHistory() {
  const q = query(historyRef, orderBy("timestamp", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}
