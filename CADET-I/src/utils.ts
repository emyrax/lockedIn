export function escapeHtml(str: string) {
  return String(str).replace(/[&<>"']/g, (ch: string) => {
    const map: Record<string, string> = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" };
    return map[ch] || ch;
  });
}

export function formatDate(date: any) {
  if (!date) return "";
  const d = typeof date.toDate === "function" ? date.toDate() : new Date(date);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

export function truncate(text: string, max = 130) {
  const clean = stripHtml(text).replace(/\s+/g, " ").trim();
  return clean.length <= max ? clean : clean.substring(0, max).trim() + "...";
}

function stripHtml(html: string) {
  const div = document.createElement("div");
  div.innerHTML = String(html);
  return div.textContent || div.innerText || "";
}

export function getGoogleDriveUrl(url: string) {
  const id = extractDriveId(url);
  return id ? `https://drive.google.com/thumbnail?id=${id}&sz=w1600` : url;
}

function extractDriveId(url: string) {
  const patterns = [/\/file\/d\/([^/]+)/i, /[?&]id=([^&]+)/i, /\/d\/([^/]+)/i];
  for (const p of patterns) {
    const m = String(url).match(p);
    if (m?.[1]) return m[1];
  }
  return "";
}

export const RANKS = [
  "Brigade Commander", "Deputy Brigade Commander", "Assistant Brigade Commander",
  "Commander", "Deputy Commander", "Assistant Commander",
  "Chief Superintendent", "Superintendent", "Deputy Superintendent",
  "Assistant Superintendent I", "Assistant Superintendent II",
  "Inspector", "Deputy Inspector", "Assistant Inspector",
  "Staff Sergeant", "Sergeant", "Corporal", "Lance Corporal", "Private"
];

export const DEPARTMENTS = [
  "Training & Doctrine", "Cadet Police", "Lion Striker Squad",
  "Cadet Special Squad", "Media & Publications", "Admin and Finance",
  "Band", "Medical", "Regular"
];

export const RANK_LEVELS: Record<string, number> = {
  Private: 1, "Lance Corporal": 2, Corporal: 3, Sergeant: 4,
  "Staff Sergeant": 5, "Assistant Inspector": 6, "Deputy Inspector": 7,
  Inspector: 8, "Assistant Superintendent II": 9, "Assistant Superintendent I": 10,
  "Deputy Superintendent": 11, Superintendent: 12, "Chief Superintendent": 13,
  "Assistant Commander": 14, "Deputy Commander": 15, Commander: 16,
  "Assistant Brigade Commander": 17, "Deputy Brigade Commander": 18, "Brigade Commander": 19
};

export const APPOINTMENTS: Record<string, string[]> = {
  None: ["None"],
  National: [
    "General Commander in Council (GCC)", "Deputy General Commander (General Review)",
    "Deputy General Commander - Administration & Finance", "Deputy General Commander - Zone A Command",
    "Deputy General Commander - Zone B Command", "Deputy General Commander - Zone C Command",
    "Deputy General Commander - Training, Doctrine & Operations", "Deputy General Commander - Signals & Public Relations",
    "Deputy General Commander - Supply, Stores & General Duties", "Deputy General Commander - Medical & Personnel Welfare",
    "Deputy General Commander - Discipline & Intelligence", "National Director of Training",
    "Deputy National Director of Training", "Chief Instructor", "Training Coordinators",
    "National Director, Cadet Police", "Deputy National Director, Cadet Police", "Provost Marshal",
    "National Director, Cadet Special Squad", "Deputy National Director, Cadet Special Squad",
    "National Director, Lion Striker Squad", "Deputy National Director, Lion Striker Squad",
    "National Director General, Medical Corps", "Deputy National Director General, Medical Corps",
    "National Band Commandant", "Deputy National Band Commandant",
    "National Director, Media & Publications", "Deputy National Director, Media & Publications"
  ],
  Zone: [
    "Deputy General Commander (DGC - Zone A/B/C)", "Zonal Adjutant", "Zonal Chief Training Officer",
    "Zonal Finance Officer", "Zonal Provost Marshal", "Zonal Public Relations Officer (ZPRO)",
    "Zonal Logistics & Welfare Officer", "Zonal Legal Adviser", "Zonal Auditor",
    "Zonal Medical Officer", "Zonal Gender Officer", "Director of Discipline & Intelligence",
    "Deputy Director (Operations)", "Deputy Director (Intelligence & Surveillance)",
    "Director of Training & Doctrine", "Deputy Director (Training & Implementation)",
    "Deputy Director (Doctrine & Curriculum Development)", "Director of HRDE",
    "Deputy Director (Personnel Management & Welfare)", "Deputy Director (Development & Empowerment)",
    "Director of ACO", "Deputy Director (Academics & Training)", "Deputy Director (Counseling & Orientation)",
    "Director of 4P", "Deputy Director (Projects & Infrastructure)", "Deputy Director (Programs & Events)",
    "Deputy Director (Policy & Planning)", "Director of Operations",
    "Deputy Director (Field Operations & Tactical Response)", "Deputy Director (Logistics & Resource Management)",
    "Director of Media & Public Relations", "Deputy Director (Media & Digital Communications)",
    "Deputy Director (Public Relations & Community Engagement)"
  ],
  State: [
    "Commander in Council", "Second In Command", "Adjutant General", "Chief Intelligence Officer",
    "Chief Training Officer", "Academic Counseling Officer", "Director of Cadet Police",
    "Director of Finance", "Director of Medical/Welfare", "Public Relations Officer",
    "Quarter Master", "Deputy Medical Officer", "Regimental Sergeant Major", "Coy Clerk"
  ],
  Region: [
    "Regional Officer in Charge (R OC)", "Deputy Regional Officer in Charge (DROC)",
    "Regional Adjutant", "Regional Finance Officer", "Regional Training Officer",
    "Regional Director of Operation", "Regional Relation Officer"
  ],
  Area: [
    "Area Officer in Charge (A OC)", "Deputy Area Officer in Charge", "Area Adjutant",
    "Area Finance Officer", "Area Training Officer", "Area Relation Officer"
  ],
  Unit: ["Unit Leader", "Assistant Unit Leader", "Unit Secretary"]
};
