import { CitizenApplication, VaultDocument, AppNotification, UserProfileData } from '../types';

const APPS_KEY = 'sahayak_citizen_applications';
const VAULT_KEY = 'sahayak_vault_documents';
const NOTIFS_KEY = 'sahayak_notifications';
const PROFILE_KEY = 'sahayak_user_profile';

// Initial default data seed if local storage is empty
const INITIAL_APPLICATIONS: CitizenApplication[] = [
  {
    id: 'APP-2026-8941',
    schemeId: 'national-means-cum-merit-scholarship',
    schemeName: 'National Means-cum-Merit Scholarship Scheme (NMMSS)',
    category: 'Education & Scholarship',
    applicantName: 'Sahayak Citizen',
    submissionDate: '2026-02-01',
    status: 'under_review',
    documentsAttached: ['Aadhaar Card', 'Class 8 Marksheet', 'Income Certificate'],
    referenceNumber: 'NMMSS-MH-2026-09182',
    timelineSteps: [
      { title: 'Application Drafted', date: '2026-01-28', completed: true, description: 'Pre-filled from citizen profile' },
      { title: 'Documents Verified via OCR', date: '2026-01-30', completed: true, description: 'Aadhaar & Income Verified' },
      { title: 'Submitted to Portal', date: '2026-02-01', completed: true, description: 'Sent to National Scholarship Portal' },
      { title: 'District Officer Verification', date: 'In Progress', completed: false, active: true, description: 'Under verification by Pune District Nodal Officer' },
      { title: 'Disbursement Approved', date: 'Pending', completed: false, description: 'Direct Benefit Transfer (DBT)' },
    ],
    notes: 'Submitted for Academic Year 2026-27.',
  },
  {
    id: 'APP-2026-4412',
    schemeId: 'post-matric-scholarship',
    schemeName: 'Post-Matric Scholarship Scheme for Higher Education',
    category: 'Higher Education',
    applicantName: 'Sahayak Citizen',
    submissionDate: '2026-01-15',
    status: 'approved',
    documentsAttached: ['Aadhaar Card', 'College Admission Receipt', 'Income Certificate', 'Caste Certificate'],
    referenceNumber: 'MAHADBT-2026-77821',
    timelineSteps: [
      { title: 'Application Drafted', date: '2026-01-10', completed: true },
      { title: 'College Verification', date: '2026-01-12', completed: true },
      { title: 'MahaDBT Approval', date: '2026-01-15', completed: true },
      { title: 'Disbursed to Bank Account', date: '2026-01-20', completed: true, description: '₹12,000 credited to Aadhaar linked bank account' },
    ],
    notes: 'Sanctioned under MahaDBT Tuition Waiver scheme.',
  },
];

const INITIAL_VAULT: VaultDocument[] = [
  {
    id: 'doc-001',
    name: 'Aadhaar Card (UIDAI Verified)',
    type: 'aadhaar',
    fileSize: '1.2 MB',
    uploadDate: '2026-01-10',
    verificationStatus: 'verified',
    documentNumber: 'XXXX-XXXX-4892',
    issuingAuthority: 'UIDAI',
  },
  {
    id: 'doc-002',
    name: 'Tehsildar Income Certificate (FY 2025-26)',
    type: 'income',
    fileSize: '840 KB',
    uploadDate: '2026-01-12',
    verificationStatus: 'verified',
    documentNumber: 'INC/2025/99104',
    issuingAuthority: 'Revenue Dept, Govt of Maharashtra',
  },
  {
    id: 'doc-003',
    name: 'SSC / Class 10 Marksheet & Passing Certificate',
    type: 'marksheet',
    fileSize: '2.1 MB',
    uploadDate: '2026-01-14',
    verificationStatus: 'verified',
    documentNumber: 'MH-SSC-2024-88402',
    issuingAuthority: 'Maharashtra State Board',
  },
  {
    id: 'doc-004',
    name: 'Caste Validity Certificate (OBC/EWS)',
    type: 'caste',
    fileSize: '1.8 MB',
    uploadDate: '2026-01-18',
    verificationStatus: 'verified',
    documentNumber: 'CC/2024/7741',
    issuingAuthority: 'District Caste Certificate Scrutiny Committee',
  },
  {
    id: 'doc-005',
    name: 'State Domicile Certificate',
    type: 'domicile',
    fileSize: '950 KB',
    uploadDate: '2026-01-22',
    verificationStatus: 'verified',
    documentNumber: 'DOM/MH/2023/110',
    issuingAuthority: 'Sub-Divisional Magistrate',
  },
];

const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif-1',
    title: 'Application Under Review',
    message: 'Your application for NMMSS (APP-2026-8941) is currently being verified by District Officer.',
    timestamp: '2 hours ago',
    read: false,
    type: 'application',
    actionTab: 'applications',
  },
  {
    id: 'notif-2',
    title: 'New Scheme Eligibility Alert',
    message: 'You match 98% eligibility for "PM Kisan Samman Nidhi". Check requirements now.',
    timestamp: '1 day ago',
    read: false,
    type: 'scheme',
    actionTab: 'explorer',
    schemeId: 'pm-kisan',
  },
  {
    id: 'notif-3',
    title: 'Document Expiry Warning',
    message: 'Your Income Certificate validity is set for renewal on March 31, 2026.',
    timestamp: '3 days ago',
    read: true,
    type: 'document',
    actionTab: 'vault',
  },
];

const INITIAL_PROFILE: UserProfileData = {
  age: '20',
  state: 'Maharashtra',
  occupation: 'Student',
  education: 'Undergraduate',
  income: '₹1.5 Lakhs/year',
  category: 'OBC',
  gender: 'Male',
  district: 'Pune',
};

// Storage Utilities
export const getApplications = (): CitizenApplication[] => {
  try {
    const data = localStorage.getItem(APPS_KEY);
    return data ? JSON.parse(data) : INITIAL_APPLICATIONS;
  } catch {
    return INITIAL_APPLICATIONS;
  }
};

export const saveApplications = (apps: CitizenApplication[]) => {
  localStorage.setItem(APPS_KEY, JSON.stringify(apps));
};

export const addApplication = (app: Omit<CitizenApplication, 'id' | 'submissionDate' | 'referenceNumber' | 'status' | 'timelineSteps'>): CitizenApplication => {
  const apps = getApplications();
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const newApp: CitizenApplication = {
    ...app,
    id: `APP-2026-${randomSuffix}`,
    referenceNumber: `${app.schemeId.toUpperCase().slice(0, 6)}-2026-${randomSuffix}`,
    submissionDate: new Date().toISOString().split('T')[0],
    status: 'submitted',
    timelineSteps: [
      { title: 'Application Drafted', date: new Date().toISOString().split('T')[0], completed: true, description: 'Created via Sahayak AI' },
      { title: 'Submitted to Portal', date: new Date().toISOString().split('T')[0], completed: true, description: 'Transmitted to official portal API' },
      { title: 'Department Scrutiny', date: 'In Progress', completed: false, active: true, description: 'Pending verification' },
      { title: 'Final Approval & DBT', date: 'Pending', completed: false, description: 'Direct Benefit Transfer' },
    ],
  };
  const updated = [newApp, ...apps];
  saveApplications(updated);
  
  // Create notification
  addNotification({
    title: 'Application Submitted Successfully',
    message: `Application ${newApp.id} for ${newApp.schemeName} has been submitted.`,
    type: 'application',
    actionTab: 'applications',
  });
  
  return newApp;
};

export const getVaultDocuments = (): VaultDocument[] => {
  try {
    const data = localStorage.getItem(VAULT_KEY);
    return data ? JSON.parse(data) : INITIAL_VAULT;
  } catch {
    return INITIAL_VAULT;
  }
};

export const saveVaultDocuments = (docs: VaultDocument[]) => {
  localStorage.setItem(VAULT_KEY, JSON.stringify(docs));
};

export const addVaultDocument = (doc: Omit<VaultDocument, 'id' | 'uploadDate' | 'verificationStatus'>): VaultDocument => {
  const docs = getVaultDocuments();
  const newDoc: VaultDocument = {
    ...doc,
    id: `doc-${Date.now().toString().slice(-4)}`,
    uploadDate: new Date().toISOString().split('T')[0],
    verificationStatus: 'verified',
  };
  const updated = [newDoc, ...docs];
  saveVaultDocuments(updated);
  return newDoc;
};

export const deleteVaultDocument = (id: string) => {
  const docs = getVaultDocuments().filter((d) => d.id !== id);
  saveVaultDocuments(docs);
};

export const getNotifications = (): AppNotification[] => {
  try {
    const data = localStorage.getItem(NOTIFS_KEY);
    return data ? JSON.parse(data) : INITIAL_NOTIFICATIONS;
  } catch {
    return INITIAL_NOTIFICATIONS;
  }
};

export const saveNotifications = (notifs: AppNotification[]) => {
  localStorage.setItem(NOTIFS_KEY, JSON.stringify(notifs));
};

export const addNotification = (notif: Omit<AppNotification, 'id' | 'timestamp' | 'read'>) => {
  const notifs = getNotifications();
  const newNotif: AppNotification = {
    ...notif,
    id: `notif-${Date.now()}`,
    timestamp: 'Just now',
    read: false,
  };
  saveNotifications([newNotif, ...notifs]);
};

export const getStoredProfile = (): UserProfileData => {
  try {
    const data = localStorage.getItem(PROFILE_KEY);
    return data ? JSON.parse(data) : INITIAL_PROFILE;
  } catch {
    return INITIAL_PROFILE;
  }
};

export const saveStoredProfile = (profile: UserProfileData) => {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
};
