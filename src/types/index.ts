export interface Organization {
  id: string;
  name: string;
  domain: string;
  theme: {
    primaryColor: string;
    logoUrl: string;
  };
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string | null;
  organizationId?: string;
  role: 'employee' | 'coordinator' | 'superadmin';
  profession?: string;
  sector?: string; // <-- NOVO CAMPO
  profileCompleted: boolean;
  gamification: {
    points: number;
    badges: string[];
  };
}

export interface SignInData {
  email: string;
  password: string;
}

export interface SignUpData extends SignInData {
  displayName: string;
}
