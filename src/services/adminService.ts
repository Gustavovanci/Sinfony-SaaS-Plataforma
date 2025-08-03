import { collection, getDocs, collectionGroup } from 'firebase/firestore';
import { db } from '../config/firebase';
import type { Organization, UserProfile } from '../types';
import type { Module } from './moduleService';
import type { ModuleProgress } from './progressService';

// Interface para os dados de negócio que vamos calcular
export interface BusinessIntelligenceData {
  totalOrgs: number;
  totalUsers: number;
  // Adicionamos as listas completas para os modais de insight
  allOrganizations: Organization[];
  allUsers: UserProfile[];
  orgsWithDetails: (Organization & {
    userCount: number;
    avgEngagement: number;
  })[];
  mostPopularModule: {
    title: string;
    completions: number;
  } | null;
}

/**
 * Busca e processa todos os dados da plataforma para gerar métricas de negócio.
 */
export const getSuperAdminDashboardData = async (): Promise<BusinessIntelligenceData> => {
  console.log('🔄 Iniciando getSuperAdminDashboardData...');
  
  try {
    const [orgsSnapshot, usersSnapshot, modulesSnapshot, progressSnapshot] = await Promise.all([
      getDocs(collection(db, 'organizations')),
      getDocs(collection(db, 'users')),
      getDocs(collection(db, 'modules')),
      getDocs(collectionGroup(db, 'progress'))
    ]);

    console.log('📊 Snapshots Firebase:', {
      orgsSnapshot: {
        empty: orgsSnapshot.empty,
        size: orgsSnapshot.size,
        docs: orgsSnapshot.docs.length
      },
      usersSnapshot: {
        empty: usersSnapshot.empty,
        size: usersSnapshot.size,
        docs: usersSnapshot.docs.length
      },
      modulesSnapshot: {
        empty: modulesSnapshot.empty,
        size: modulesSnapshot.size,
        docs: modulesSnapshot.docs.length
      },
      progressSnapshot: {
        empty: progressSnapshot.empty,
        size: progressSnapshot.size,
        docs: progressSnapshot.docs.length
      }
    });

    // Debug: Verificar dados brutos dos documentos
    console.log('🔍 Dados brutos das organizações:');
    orgsSnapshot.docs.forEach((doc, index) => {
      console.log(`Org ${index}:`, { id: doc.id, data: doc.data() });
    });

    console.log('🔍 Dados brutos dos usuários:');
    usersSnapshot.docs.forEach((doc, index) => {
      console.log(`User ${index}:`, { uid: doc.id, data: doc.data() });
    });

    const organizations = orgsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Organization));
    const users = usersSnapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() } as UserProfile));
    const modules = modulesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Module));
    const allProgress = progressSnapshot.docs.map(doc => ({ ...doc.data(), userId: doc.ref.parent.parent?.id }) as ModuleProgress & { userId: string });

    console.log('🧮 Dados processados:', {
      organizations: {
        count: organizations.length,
        sample: organizations[0] || 'Nenhuma organização'
      },
      users: {
        count: users.length,
        sample: users[0] || 'Nenhum usuário'
      },
      modules: {
        count: modules.length,
        sample: modules[0] || 'Nenhum módulo'
      },
      progress: {
        count: allProgress.length,
        sample: allProgress[0] || 'Nenhum progresso'
      }
    });

    const totalOrgs = organizations.length;
    const allNonAdminUsers = users.filter(u => u.role !== 'superadmin');
    const totalUsers = allNonAdminUsers.length;

    console.log('👥 Usuários filtrados:', {
      totalUsers: users.length,
      nonAdminUsers: allNonAdminUsers.length,
      adminUsers: users.length - allNonAdminUsers.length
    });

    const orgsWithDetails = organizations.map(org => {
      const orgUsers = allNonAdminUsers.filter(u => u.organizationId === org.id);
      const userCount = orgUsers.length;
      const completedModulesForOrg = allProgress.filter(p => p.status === 'completed' && orgUsers.some(u => u.uid === p.userId));
      const avgEngagement = userCount > 0 ? (completedModulesForOrg.length / userCount) : 0;
      return { ...org, userCount, avgEngagement: parseFloat(avgEngagement.toFixed(2)) };
    });

    let mostPopularModule: { title: string; completions: number; } | null = null;
    if (allProgress.length > 0) {
      const completionsByModule = allProgress.filter(p => p.status === 'completed').reduce((acc, p) => {
        acc[p.moduleId] = (acc[p.moduleId] || 0) + 1;
        return acc;
      }, {} as { [key: string]: number });
      const sortedModules = Object.entries(completionsByModule).sort((a, b) => b[1] - a[1]);
      if (sortedModules.length > 0) {
        const [mostPopularId, completions] = sortedModules[0];
        const moduleInfo = modules.find(m => m.id === mostPopularId);
        mostPopularModule = { title: moduleInfo?.title || 'Módulo Desconhecido', completions };
      }
    }

    const result = {
      totalOrgs,
      totalUsers,
      allOrganizations: organizations,
      allUsers: allNonAdminUsers,
      orgsWithDetails,
      mostPopularModule,
    };

    console.log('✅ Resultado final:', result);
    
    return result;

  } catch (error) {
    console.error('❌ Erro em getSuperAdminDashboardData:', error);
    throw error;
  }
};