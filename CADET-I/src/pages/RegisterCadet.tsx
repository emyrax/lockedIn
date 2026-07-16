import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { addDoc, collection, updateDoc, doc } from "firebase/firestore";
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

const resizeToSquare = (file: File, size: number): Promise<Blob> =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const c = document.createElement("canvas");
      c.width = c.height = size;
      c.getContext("2d")!.drawImage(img, 0, 0, size, size);
      c.toBlob((b) => (b ? resolve(b) : reject()), "image/jpeg", 0.9);
    };
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });

export default function RegisterCadet() {
  const [form, setForm] = useState(defaultForm);
  const [saving, setSaving] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const update = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const validatePhoto = (file: File): string | null => {
    if (file.size > 2 * 1024 * 1024) return "File must be under 2MB.";
    return null;
  };

  const checkRatio = (file: File): Promise<string | null> =>
    new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        URL.revokeObjectURL(img.src);
        resolve(
          img.naturalWidth === img.naturalHeight
            ? null
            : "Image must be 1:1 (square)."
        );
      };
      img.onerror = () => resolve("Could not read image.");
      img.src = URL.createObjectURL(file);
    });

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setPhotoError("");
    if (!file) {
      setPhotoFile(null);
      setPhotoPreview(null);
      return;
    }
    const sizeErr = validatePhoto(file);
    if (sizeErr) {
      setPhotoError(sizeErr);
      setPhotoFile(null);
      setPhotoPreview(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }
    const ratioErr = await checkRatio(file);
    if (ratioErr) {
      setPhotoError(ratioErr);
      setPhotoFile(null);
      setPhotoPreview(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!photoFile) {
      setPhotoError("A passport photo is required.");
      return;
    }
    setSaving(true);
    try {
      const docRef = await addDoc(collection(db, "cadets"), {
        ...form,
        createdAt: new Date().toISOString(),
      });
      const resized = await resizeToSquare(photoFile, 500);
      const formData = new FormData();
      formData.append("file", resized);
      formData.append("upload_preset", import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);
      const uploadRes = await fetch(
        `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`,
        { method: "POST", body: formData }
      );
      const { secure_url } = await uploadRes.json();
      await updateDoc(doc(db, "cadets", docRef.id), { photoURL: secure_url });
      navigate("/admin/dashboard");
    } catch {
      alert("Failed to save. Check your connection.");
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
      <form
        onSubmit={handleSubmit}
        className="grid gap-4 rounded-xl border bg-white p-6 sm:grid-cols-2"
      >
        <div className="sm:col-span-2">
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Passport Photo *
          </label>
          <div className="flex items-center gap-6">
            <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg border-2 border-dashed border-gray-300 bg-gray-50">
              {photoPreview ? (
                <img
                  src={photoPreview}
                  alt="Preview"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-3xl text-gray-300">
                  +
                </div>
              )}
            </div>
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="text-sm text-gray-600 file:mr-3 file:cursor-pointer file:rounded file:border-0 file:bg-green-700 file:px-3 file:py-1.5 file:text-sm file:text-white file:hover:bg-green-600"
              />
              {photoError && (
                <p className="mt-1 text-xs text-red-600">{photoError}</p>
              )}
              <p className="mt-1 text-xs text-gray-400">
                Square (1:1) image, max 2MB.
              </p>
            </div>
          </div>
        </div>
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
