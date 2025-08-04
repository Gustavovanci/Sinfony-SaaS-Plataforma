// src/types/index.ts

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


// src/types/index.ts

// ... (mantenha os tipos que já existem)

// Adicione estes novos tipos no final do arquivo
export interface CSMHospital {
    id: string;
    name: string;
    domain: string;
    status: 'active' | 'inactive' | 'setup';
    userCount: number;
    orchestraConnected: boolean;
    lastSync: Date;
}

export interface ModuleTemplate {
    id: string;
    title: string;
    description: string;
    category: 'uti' | 'centro_cirurgico' | 'enfermagem' | 'tecnologia' | 'geral';
    isActive: boolean;
    estimatedDuration: number;
    uploadedAt: Date;
}

export interface SystemLog {
    id: string;
    timestamp: Date;
    level: 'info' | 'warning' | 'error' | 'critical';
    type: 'user_action' | 'system_error' | 'integration_sync' | 'module_upload' | 'hospital_added';
    message: string;
    resolved: boolean;
}

export interface CSMAlert {
    id: string;
    title: string;
    message: string;
    severity: 'critical' | 'high' | 'medium' | 'low';
    acknowledged: boolean;
    createdAt: Date;
}

export interface SystemHealth {
    activeUsers: number;
    uptime: number;
    components: {
        database: 'healthy' | 'degraded' | 'down';
        authentication: 'healthy' | 'degraded' | 'down';
        storage: 'healthy' | 'degraded' | 'down';
        functions: 'healthy' | 'degraded' | 'down';
        hosting: 'healthy' | 'degraded' | 'down';
    };
}