import { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../config/firebase";
import type { Cadet } from "../types";

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

export default function EditCadet() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [form, setForm] = useState<Cadet | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!id) return;
    getDoc(doc(db, "cadets", id)).then((snap) => {
      if (snap.exists()) {
        const data = { id: snap.id, ...snap.data() } as Cadet;
        setForm(data);
        setPhotoPreview(data.photoURL ?? null);
      } else {
        navigate("/admin/dashboard");
      }
      setLoading(false);
    });
  }, [id, navigate]);

  const update = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => (prev ? { ...prev, [field]: e.target.value } : prev));

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
      setPhotoPreview(form?.photoURL ?? null);
      return;
    }
    const sizeErr = validatePhoto(file);
    if (sizeErr) {
      setPhotoError(sizeErr);
      setPhotoFile(null);
      setPhotoPreview(form?.photoURL ?? null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }
    const ratioErr = await checkRatio(file);
    if (ratioErr) {
      setPhotoError(ratioErr);
      setPhotoFile(null);
      setPhotoPreview(form?.photoURL ?? null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !form) return;
    setSaving(true);
    try {
      let photoURL = form.photoURL;
      if (photoFile) {
        const resized = await resizeToSquare(photoFile, 500);
        const formData = new FormData();
        formData.append("file", resized);
        formData.append("upload_preset", import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);
        const uploadRes = await fetch(
          `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`,
          { method: "POST", body: formData }
        );
        const { secure_url } = await uploadRes.json();
        photoURL = secure_url;
      }
      const { id: _id, createdAt, ...data } = form;
      await updateDoc(doc(db, "cadets", id), { ...data, photoURL });
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
        <div className="sm:col-span-2">
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Passport Photo
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
                Square (1:1) image, max 2MB. Leave empty to keep current photo.
              </p>
            </div>
          </div>
        </div>
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
