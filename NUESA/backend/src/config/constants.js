export const ROLES = {
  STUDENT: 'student',
  ALUMNUS: 'alumnus',
  ELECTO: 'electo',
  SUPER_ADMIN: 'super_admin',
  STAFF: 'staff',
};

export const ROLE_HIERARCHY = {
  [ROLES.SUPER_ADMIN]: 100,
  [ROLES.ELECTO]: 80,
  [ROLES.STAFF]: 60,
  [ROLES.ALUMNUS]: 40,
  [ROLES.STUDENT]: 20,
};

export const DEPARTMENTS = [
  { code: 'ABE', name: 'Agricultural & Bioresources Engineering' },
  { code: 'CVE', name: 'Civil Engineering' },
  { code: 'EEE', name: 'Electrical Engineering' },
  { code: 'ELE', name: 'Electronic Engineering' },
  { code: 'MCE', name: 'Mechanical Engineering' },
  { code: 'MME', name: 'Metallurgical & Materials Engineering' },
  { code: 'MTE', name: 'Mechatronics Engineering' },
  { code: 'BME', name: 'Biomedical Engineering' },
  { code: 'PEE', name: 'Polymer & Textile Engineering' },
  { code: 'FWT', name: 'Forestry & Wood Technology' },
];

export const DEPT_CODES = DEPARTMENTS.map(d => d.code);

export const ELECTION_STATUS = {
  DRAFT: 'draft',
  PENDING: 'pending',
  NOMINATION: 'nomination',
  VOTING: 'voting',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
};

export const PROJECT_STATUS = {
  SUBMITTED: 'submitted',
  APPROVED: 'approved',
  FEATURED: 'featured',
  ARCHIVED: 'archived',
};

export const CANDIDATE_STATUS = {
  PENDING: 'pending',
  VERIFIED: 'verified',
  APPROVED: 'approved',
  REJECTED: 'rejected',
};

export const NEWS_EVENT_TYPES = {
  NEWS: 'news',
  EVENT: 'event',
};

export const SECTION_TYPES = [
  'hero',
  'text',
  'gallery',
  'cards',
  'counters',
  'alumni',
  'companies',
  'cta',
  'footer',
];

export const LEVELS = ['100', '200', '300', '400', '500', 'PG'];

export const MATRIC_REGEX = /^\d{4}\/\d+$/;

export const UNN_EMAIL_SUFFIX = '@unn.edu.ng';
