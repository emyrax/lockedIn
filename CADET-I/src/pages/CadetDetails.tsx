import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../config/firebase";
import type { Cadet } from "../types";

export default function CadetDetails() {
  const { cadetId } = useParams<{ cadetId: string }>();
  const [cadet, setCadet] = useState<Cadet | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!cadetId) {
      setLoading(false);
      return;
    }
    getDoc(doc(db, "cadets", cadetId))
      .then((snap) => {
        if (snap.exists()) {
          setCadet({ id: snap.id, ...snap.data() } as Cadet);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [cadetId]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-green-700 border-t-transparent" />
      </div>
    );
  }

  if (!cadet) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="rounded-xl bg-white p-8 text-center shadow">
          <h2 className="text-xl font-bold text-gray-800">Not Found</h2>
          <p className="mt-2 text-gray-500">
            No cadet record matches this link.
          </p>
        </div>
      </div>
    );
  }

  const Field = ({ label, value }: { label: string; value?: string }) =>
    value ? (
      <div className="rounded-lg bg-gray-50 p-3">
        <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
          {label}
        </p>
        <p className="mt-0.5 font-medium text-gray-800">{value}</p>
      </div>
    ) : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 p-6">
      <div className="mx-auto max-w-2xl">
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold text-green-800">CADET I</h1>
          <p className="text-sm text-green-600">Enugu Nsukka Chapter</p>
        </div>

        <div className="overflow-hidden rounded-2xl bg-white shadow-lg">
          <div className="bg-green-800 px-6 py-8 text-center text-white">
            <div className="mx-auto mb-3 h-20 w-20 overflow-hidden rounded-full bg-white/20">
              {cadet.photoURL ? (
                <img
                  src={cadet.photoURL}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-3xl font-bold text-white">
                  {cadet.firstName[0]}
                  {cadet.lastName[0]}
                </div>
              )}
            </div>
            <h2 className="text-2xl font-bold">
              {cadet.firstName} {cadet.lastName}
            </h2>
            <p className="mt-1 text-green-200">
              {cadet.rank} &middot; {cadet.cadetId}
            </p>
          </div>

          <div className="grid gap-3 p-6 sm:grid-cols-2">
            <Field label="First Name" value={cadet.firstName} />
            <Field label="Last Name" value={cadet.lastName} />
            <Field label="Rank" value={cadet.rank} />
            <Field label="Cadet ID" value={cadet.cadetId} />
            <Field label="Phone" value={cadet.phone} />
            <Field label="Email" value={cadet.email} />
            <Field label="Address" value={cadet.address} />
            <Field label="State of Origin" value={cadet.stateOfOrigin} />
            <Field label="Blood Group" value={cadet.bloodGroup} />
            <Field label="Date of Birth" value={cadet.dateOfBirth} />
            <Field label="Allergies" value={cadet.allergies} />
            <Field label="Next of Kin" value={cadet.nextOfKin} />
            <Field label="Next of Kin Phone" value={cadet.nokPhone} />
            <Field label="Batch" value={cadet.batch} />
            <Field label="Platoon" value={cadet.platoon} />
            <Field label="Squad" value={cadet.squad} />
            <Field label="Zone" value={cadet.zone} />
            <Field label="Commanding Officer" value={cadet.commandingOfficer} />
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-gray-400">
          CADET I &mdash; Enugu Nsukka Chapter &middot; Official Record
        </p>
      </div>
    </div>
  );
}
