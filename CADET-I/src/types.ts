export interface Cadet {
  id?: string;
  firstName: string;
  lastName: string;
  rank: string;
  cadetId?: string;
  phone: string;
  email?: string;
  address?: string;
  stateOfOrigin?: string;
  bloodGroup?: string;
  allergies?: string;
  dateOfBirth?: string;
  nextOfKin?: string;
  nokPhone?: string;
  batch: string;
  photoURL?: string;
  platoon?: string;
  squad?: string;
  zone?: string;
  commandingOfficer?: string;
  createdAt?: string;
}

export interface OfficerUser {
  userId: string;
  firstName: string;
  surname: string;
  otherName?: string;
  address?: string;
  occupation?: string;
  employer?: string;
  gender?: string;
  phone: string;
  email: string;
  serviceNumber: string;
  rank: string;
  department?: string;
  postHeld?: string;
  appointment?: string;
  state?: string;
  area?: string;
  lga?: string;
  dateOfBirth?: string;
  bloodGroup?: string;
  genotype?: string;
  allergies?: string;
  medicalConditions?: string;
  emergencyPhone?: string;
  maritalStatus?: string;
  education?: string;
  nokName?: string;
  nokRelation?: string;
  nokPhone?: string;
  nokAddress?: string;
  passportUrl?: string;
  signatureUrl?: string;
  pdfUrl?: string;
  uniqueID?: string;
  activatedAt?: string;
}

export interface Publication {
  id: string;
  title: string;
  content: string;
  category: string;
  author?: string;
  coverUrl?: string;
  publishDate?: any;
  status?: string;
  isPinned?: boolean;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  badgeUrl?: string;
  minRankLevel?: number;
  eligibleDepts?: string[];
  eligibleStates?: string[];
}

export interface Enrollment {
  id: string;
  officerUID: string;
  courseID: string;
  courseTitle: string;
  status: string;
  certificateUrl?: string;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  state?: string;
  assignedStates?: string[];
  status: string;
}
