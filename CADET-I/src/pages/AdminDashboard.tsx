import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
} from "firebase/firestore";
import { QRCodeSVG } from "qrcode.react";
import { db } from "../config/firebase";
import type { Cadet } from "../types";
import QRCodeModal from "../components/QRCodeModal";

export default function AdminDashboard() {
  const [cadets, setCadets] = useState<Cadet[]>([]);
  const [search, setSearch] = useState("");
  const [qrTarget, setQrTarget] = useState<Cadet | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    const q = query(collection(db, "cadets"), orderBy("createdAt", "desc"));
    return onSnapshot(q, (snap) => {
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Cadet));
      setCadets(data);
    });
  }, []);

  const getDetailsUrl = (cadetId: string) =>
    `${window.location.origin}/cadet/${cadetId}`;

  const copyLink = async (cadetId: string) => {
    await navigator.clipboard.writeText(getDetailsUrl(cadetId));
    setCopiedId(cadetId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Delete this cadet record?")) {
      await deleteDoc(doc(db, "cadets", id));
    }
  };

  const filtered = cadets.filter(
    (c) =>
      c.firstName.toLowerCase().includes(search.toLowerCase()) ||
      c.lastName.toLowerCase().includes(search.toLowerCase()) ||
      c.cadetId?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <h2 className="mb-4 text-2xl font-bold text-gray-800">Cadet Records</h2>

      <div className="mb-4 flex items-center gap-4">
        <input
          type="text"
          placeholder="Search by name or ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 rounded-lg border border-gray-300 px-4 py-2 outline-none focus:border-green-600"
        />
        <Link
          to="/admin/register"
          className="rounded-lg bg-green-700 px-4 py-2 text-white transition hover:bg-green-600"
        >
          + New Cadet
        </Link>
      </div>

      {filtered.length === 0 && (
        <p className="mt-10 text-center text-gray-400">
          No cadet records yet.
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((cadet) => (
          <div
            key={cadet.id}
            className="rounded-xl border bg-white p-4 shadow-sm"
          >
            <div className="mb-3 flex items-center gap-3">
              <div className="h-12 w-12 overflow-hidden rounded-full bg-green-700">
                {cadet.photoURL ? (
                  <img
                    src={cadet.photoURL}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-lg font-bold text-white">
                    {cadet.firstName[0]}
                    {cadet.lastName[0]}
                  </div>
                )}
              </div>
              <div>
                <p className="font-semibold text-gray-800">
                  {cadet.firstName} {cadet.lastName}
                </p>
                <p className="text-xs text-gray-400">
                  {cadet.rank} &middot; {cadet.cadetId}
                </p>
              </div>
            </div>

            <div className="mb-3 space-y-1 text-sm text-gray-600">
              <p>Batch: {cadet.batch}</p>
              <p>Phone: {cadet.phone}</p>
            </div>

            <div className="flex flex-wrap gap-2 border-t pt-3">
              <button
                onClick={() => copyLink(cadet.id!)}
                className="rounded bg-blue-100 px-3 py-1 text-xs text-blue-700 transition hover:bg-blue-200"
              >
                {copiedId === cadet.id ? "Copied!" : "Copy Link"}
              </button>
              <button
                onClick={() => setQrTarget(cadet)}
                className="rounded bg-purple-100 px-3 py-1 text-xs text-purple-700 transition hover:bg-purple-200"
              >
                Print QR
              </button>
              <Link
                to={`/admin/edit/${cadet.id}`}
                className="rounded bg-yellow-100 px-3 py-1 text-xs text-yellow-700 transition hover:bg-yellow-200"
              >
                Edit
              </Link>
              <button
                onClick={() => handleDelete(cadet.id!)}
                className="rounded bg-red-100 px-3 py-1 text-xs text-red-700 transition hover:bg-red-200"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {qrTarget && (
        <QRCodeModal
          cadet={qrTarget}
          url={getDetailsUrl(qrTarget.id!)}
          onClose={() => setQrTarget(null)}
        />
      )}
    </div>
  );
}
