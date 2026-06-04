import { createContext, useContext, useEffect, useState } from "react";
import { auth, db } from "../config/firebase";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null); // admin | customer | delivery
  const [loading, setLoading] = useState(true);

  // 🔥 Listen to auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);

      if (currentUser) {
        try {
          // Fetch role from Firestore
          const userRef = doc(db, "users", currentUser.uid);
          const snap = await getDoc(userRef);

          if (snap.exists()) {
            setRole(snap.data().role);
          } else {
            // Fallback (should not usually happen)
            setRole("customer");
          }
        } catch (err) {
          console.error("Failed to fetch user role:", err);
          setRole("customer");
        }
      } else {
        setRole(null);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // 🔐 Login
  const login = (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  // 📝 Register (generic – role decided by caller)
  const register = async (email, password, role = "customer", extraData = {}) => {
    const userCred = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

    const uid = userCred.user.uid;

    // users collection (common for all roles)
    await setDoc(doc(db, "users", uid), {
      email,
      role,
      ...extraData,
      createdAt: serverTimestamp(),
    });

    return userCred;
  };

  // 🚪 Logout
  const logout = () => {
    return signOut(auth);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        loading,
        login,
        register,
        logout,
      }}
    >
      {/* ⏳ Prevent app from rendering until auth is ready */}
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
