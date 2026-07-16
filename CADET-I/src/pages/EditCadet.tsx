import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../config/firebase";
import type { Cadet } from "../types";

export default function EditCadet() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [form, setForm] = useState<Cadet | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!id) return;
    getDoc(doc(db, "cadets", id)).then((snap) => {
      if (snap.exists()) {
        setForm({ id: snap.id, ...snap.data() } as Cadet);
      } else {
        navigate("/admin/dashboard");
      }
      setLoading(false);
    });
  }, [id, navigate]);

  const update = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => (prev ? { ...prev, [field]: e.target.value } : prev));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !form) return;
    setSaving(true);
    try {
      const { id: _id, createdAt, ...data } = form;
      await updateDoc(doc(db, "cadets", id), data);
      navigate("/admin/dashboard");
    } catch {
      alert("Failed to update.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-green-700 border-t-transparent" />
      </div>
    );
  }

  if (!form) return null;

  const inputClass =
    "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-green-600 focus:ring-1 focus:ring-green-600";

  return (
    <div>
      <h2 className="mb-6 text-2xl font-bold text-gray-800">Edit Cadet</h2>
      <form
        onSubmit={handleSubmit}
        className="grid gap-4 rounded-xl border bg-white p-6 sm:grid-cols-2"
      >
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            First Name
          </label>
          <input
            required
            value={form.firstName}
            onChange={update("firstName")}
            className={inputClass}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Last Name
          </label>
          <input
            required
            value={form.lastName}
            onChange={update("lastName")}
            className={inputClass}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Rank
          </label>
          <input
            required
            value={form.rank}
            onChange={update("rank")}
            className={inputClass}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Cadet ID
          </label>
          <input
            required
            value={form.cadetId ?? ""}
            onChange={update("cadetId")}
            className={inputClass}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Phone
          </label>
          <input
            required
            value={form.phone}
            onChange={update("phone")}
            className={inputClass}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            type="email"
            value={form.email ?? ""}
            onChange={update("email")}
            className={inputClass}
          />
        </div>
        <div className="sm:col-span-2">
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Address
          </label>
          <input
            value={form.address ?? ""}
            onChange={update("address")}
            className={inputClass}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            State of Origin
          </label>
          <input
            value={form.stateOfOrigin ?? ""}
            onChange={update("stateOfOrigin")}
            className={inputClass}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Blood Group
          </label>
          <input
            value={form.bloodGroup ?? ""}
            onChange={update("bloodGroup")}
            className={inputClass}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Date of Birth
          </label>
          <input
            type="date"
            value={form.dateOfBirth ?? ""}
            onChange={update("dateOfBirth")}
            className={inputClass}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Allergies
          </label>
          <input
            value={form.allergies ?? ""}
            onChange={update("allergies")}
            className={inputClass}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Next of Kin
          </label>
          <input
            value={form.nextOfKin ?? ""}
            onChange={update("nextOfKin")}
            className={inputClass}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Next of Kin Phone
          </label>
          <input
            value={form.nokPhone ?? ""}
            onChange={update("nokPhone")}
            className={inputClass}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Batch
          </label>
          <input
            required
            value={form.batch}
            onChange={update("batch")}
            className={inputClass}
          />
        </div>
        <div className="flex gap-3 sm:col-span-2">
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-green-700 px-6 py-2.5 font-semibold text-white transition hover:bg-green-600 disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
          <button
            type="button"
            onClick={() => navigate("/admin/dashboard")}
            className="rounded-lg border border-gray-300 px-6 py-2.5 font-semibold text-gray-700 transition hover:bg-gray-100"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
