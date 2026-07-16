import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { addDoc, collection } from "firebase/firestore";
import { db } from "../config/firebase";

const defaultForm = {
  firstName: "",
  lastName: "",
  rank: "",
  cadetId: "",
  phone: "",
  email: "",
  address: "",
  stateOfOrigin: "",
  bloodGroup: "",
  allergies: "",
  dateOfBirth: "",
  nextOfKin: "",
  nokPhone: "",
  batch: "",
};

export default function RegisterCadet() {
  const [form, setForm] = useState(defaultForm);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const update = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccess("");
    try {
      const docRef = await addDoc(collection(db, "cadets"), {
        ...form,
        createdAt: new Date().toISOString(),
      });
      setSuccess(`Cadet registered! ID: ${docRef.id}`);
      setForm(defaultForm);
    } catch {
      alert("Failed to save. Check your Firebase connection.");
    } finally {
      setSaving(false);
    }
  };

  const inputClass =
    "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-green-600 focus:ring-1 focus:ring-green-600";

  return (
    <div>
      <h2 className="mb-6 text-2xl font-bold text-gray-800">
        Register New Cadet
      </h2>

      {success && (
        <div className="mb-4 rounded bg-green-100 p-3 text-sm text-green-800">
          {success}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="grid gap-4 rounded-xl border bg-white p-6 sm:grid-cols-2"
      >
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            First Name *
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
            Last Name *
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
            Rank *
          </label>
          <input
            required
            value={form.rank}
            onChange={update("rank")}
            className={inputClass}
            placeholder="e.g. Cadet, Officer"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Cadet ID *
          </label>
          <input
            required
            value={form.cadetId}
            onChange={update("cadetId")}
            className={inputClass}
            placeholder="e.g. CI-2024-001"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Phone *
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
            value={form.email}
            onChange={update("email")}
            className={inputClass}
          />
        </div>
        <div className="sm:col-span-2">
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Address
          </label>
          <input
            value={form.address}
            onChange={update("address")}
            className={inputClass}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            State of Origin
          </label>
          <input
            value={form.stateOfOrigin}
            onChange={update("stateOfOrigin")}
            className={inputClass}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Blood Group
          </label>
          <input
            value={form.bloodGroup}
            onChange={update("bloodGroup")}
            className={inputClass}
            placeholder="A+, B-, O+"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Date of Birth
          </label>
          <input
            type="date"
            value={form.dateOfBirth}
            onChange={update("dateOfBirth")}
            className={inputClass}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Allergies / Medical Notes
          </label>
          <input
            value={form.allergies}
            onChange={update("allergies")}
            className={inputClass}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Next of Kin
          </label>
          <input
            value={form.nextOfKin}
            onChange={update("nextOfKin")}
            className={inputClass}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Next of Kin Phone
          </label>
          <input
            value={form.nokPhone}
            onChange={update("nokPhone")}
            className={inputClass}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Batch / Intake *
          </label>
          <input
            required
            value={form.batch}
            onChange={update("batch")}
            className={inputClass}
            placeholder="e.g. 2024 Batch A"
          />
        </div>

        <div className="flex gap-3 sm:col-span-2">
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-green-700 px-6 py-2.5 font-semibold text-white transition hover:bg-green-600 disabled:opacity-50"
          >
            {saving ? "Saving..." : "Register Cadet"}
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
