import { useEffect, useState } from "react";
import { getAddresses, addAddress, setDefaultAddress } from "../../services/addressService";
import { useAuth } from "../../context/AuthContext";

export default function AddressManager() {
  const { user } = useAuth();
  const [list, setList] = useState([]);
  const [text, setText] = useState("");

  async function load() {
    setList(await getAddresses(user.uid));
  }

  useEffect(() => { load(); }, []);

  return (
    <div className="bg-slate-800 p-4 rounded-xl">
      <h2 className="font-semibold mb-3">Saved Addresses</h2>

      {list.map(a => (
        <div key={a.id} className="flex justify-between mb-2">
          <p>{a.text}</p>
          {!a.isDefault && (
            <button onClick={() => setDefaultAddress(user.uid, a.id)} className="text-xs text-blue-400">
              Set Default
            </button>
          )}
        </div>
      ))}

      <input
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder="New address"
        className="w-full p-2 mt-2 bg-slate-700 rounded"
      />

      <button
        onClick={async () => {
          await addAddress(user.uid, { text, isDefault: false });
          setText("");
          load();
        }}
        className="bg-blue-600 px-3 py-2 rounded mt-2"
      >
        Add Address
      </button>
    </div>
  );
}
