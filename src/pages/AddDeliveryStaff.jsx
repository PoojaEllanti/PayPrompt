import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../config/firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

export default function AddDeliveryStaff() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");

  async function createStaff() {
    const cred = await createUserWithEmailAndPassword(auth, email, password);

    await setDoc(doc(db, "users", cred.user.uid), {
      name,
      email,
      role: "delivery",
      createdAt: serverTimestamp(),
    });

    await setDoc(doc(db, "delivery_staff", cred.user.uid), {
      name,
      phone,
      active: true,
      createdAt: serverTimestamp(),
    });

    alert("Delivery staff created");
    setName(""); setEmail(""); setPassword(""); setPhone("");
  }

  return (
    <div className="p-6 text-white">
      <h1 className="text-xl font-bold mb-4">Add Delivery Staff</h1>

      <input className="input" placeholder="Name" onChange={e => setName(e.target.value)} />
      <input className="input" placeholder="Email" onChange={e => setEmail(e.target.value)} />
      <input className="input" placeholder="Password" onChange={e => setPassword(e.target.value)} />
      <input className="input" placeholder="Phone" onChange={e => setPhone(e.target.value)} />

      <button onClick={createStaff} className="bg-blue-600 px-4 py-2 rounded mt-3">
        Create Staff
      </button>
    </div>
  );
}
