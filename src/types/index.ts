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
  role: 'employee' | 'coordinator' | 'superadmin' | 'csm';
  status: 'active' | 'inactive';
  profession?: string;
  sector?: string;
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
    createdBy: string;
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

// ✅ NOVOS TIPOS PARA CRIAÇÃO DE MÓDULOS E QUIZZES

export interface QuestionData {
  questionText: string;
  options: string[];
  correctAnswerIndex: number;
}

export interface QuizData {
  title: string;
  moduleId: string;
  questions: QuestionData[];
}

export interface ModuleTopic {
  id: string;
  title: string;
  type: 'video' | 'text' | 'image' | 'quiz';
  content?: string;
  videoUrl?: string;
  imageUrl?: string;
  quizId?: string;
  quizData?: { // Usado apenas durante a criação
    questions: QuestionData[];
  };
}

export interface NewModuleData {
  title: string;
  description: string;
  category: string;
  estimatedDuration: number;
  coverImageUrl: string;
  isActive: boolean;
  createdBy: string;
  topics: ModuleTopic[];
}