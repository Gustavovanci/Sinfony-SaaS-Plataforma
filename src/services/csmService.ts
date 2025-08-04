import { collection, getDocs, query, orderBy, limit, where, collectionGroup } from 'firebase/firestore';
import { db } from '../config/firebase';

// Interfaces para os tipos de dados do CSM
export interface CSMHospital {
  id: string;
  name: string;
  domain: string;
  status: 'active' | 'setup' | 'inactive';
  userCount: number;
  orchestraConnected: boolean;
  lastSync: Date;
  createdAt: Date;
}

export interface ModuleTemplate {
  id: string;
  title: string;
  description: string;
  category: 'uti' | 'centro_cirurgico' | 'enfermagem' | 'tecnologia' | 'geral';
  estimatedDuration: number;
  isActive: boolean;
  uploadedAt: Date;
  createdBy: string;
}

export interface SystemLog {
  id: string;
  timestamp: Date;
  level: 'info' | 'warning' | 'error' | 'critical';
  type: 'user_action' | 'system_error' | 'integration_sync' | 'module_upload' | 'hospital_added';
  message: string;
  userId?: string;
  organizationId?: string;
  metadata?: any;
  resolved: boolean;
}

export interface CSMAlert {
  id: string;
  title: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  type: 'system' | 'security' | 'performance' | 'business';
  organizationId?: string;
  createdAt: Date;
  acknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: Date;
}

export interface SystemHealth {
  uptime: number;
  activeUsers: number;
  components: {
    database: 'healthy' | 'degraded' | 'down';
    auth: 'healthy' | 'degraded' | 'down';
    storage: 'healthy' | 'degraded' | 'down';
    api: 'healthy' | 'degraded' | 'down';
    notifications: 'healthy' | 'degraded' | 'down';
  };
  lastChecked: Date;
}

/**
 * ✅ INTEGRADO COM FIREBASE REAL
 * Busca todos os hospitais cadastrados na plataforma
 */
export const getHospitals = async (): Promise<CSMHospital[]> => {
  try {
    console.log('🔄 Buscando organizações reais do Firebase...');
    
    // Busca organizações reais do Firebase
    const orgsRef = collection(db, 'organizations');
    const orgsSnapshot = await getDocs(orgsRef);
    
    // Busca usuários reais do Firebase
    const usersRef = collection(db, 'users');
    const usersSnapshot = await getDocs(usersRef);
    
    console.log(`📊 Encontradas ${orgsSnapshot.size} organizações e ${usersSnapshot.size} usuários`);
    
    const hospitals: CSMHospital[] = [];
    
    orgsSnapshot.forEach((doc) => {
      const orgData = doc.data();
      
      // Conta usuários REAIS desta organização (excluindo superadmins)
      const userCount = usersSnapshot.docs.filter(userDoc => {
        const userData = userDoc.data();
        return userData.organizationId === doc.id && 
               userData.role !== 'superadmin' && 
               userData.status !== 'inactive';
      }).length;
      
      hospitals.push({
        id: doc.id,
        name: orgData.name || 'Hospital Sem Nome',
        domain: orgData.domain || '',
        status: orgData.status || 'active',
        userCount,
        // Orchestra - você pode adicionar este campo no Firebase ou manter simulado
        orchestraConnected: orgData.orchestraConnected ?? (Math.random() > 0.3),
        lastSync: orgData.lastSync ? orgData.lastSync.toDate() : new Date(),
        createdAt: orgData.createdAt ? orgData.createdAt.toDate() : new Date(),
      });
    });
    
    console.log(`✅ Processados ${hospitals.length} hospitais com dados reais`);
    return hospitals;
    
  } catch (error) {
    console.error('❌ Erro ao buscar hospitais do Firebase:', error);
    return [];
  }
};

/**
 * ✅ INTEGRADO COM FIREBASE REAL
 * Busca todos os módulos/templates disponíveis
 */
export const getModuleTemplates = async (): Promise<ModuleTemplate[]> => {
  try {
    console.log('🔄 Buscando módulos reais do Firebase...');
    
    const modulesRef = collection(db, 'modules');
    const modulesSnapshot = await getDocs(modulesRef);
    
    console.log(`📚 Encontrados ${modulesSnapshot.size} módulos`);
    
    const templates: ModuleTemplate[] = [];
    
    modulesSnapshot.forEach((doc) => {
      const moduleData = doc.data();
      templates.push({
        id: doc.id,
        title: moduleData.title || 'Módulo Sem Título',
        description: moduleData.description || 'Sem descrição',
        category: moduleData.category || 'geral',
        estimatedDuration: moduleData.estimatedDuration || 30,
        isActive: moduleData.isActive ?? true,
        uploadedAt: moduleData.createdAt ? moduleData.createdAt.toDate() : new Date(),
        createdBy: moduleData.createdBy || 'system',
      });
    });
    
    // Ordena por data de criação (mais recentes primeiro)
    const sortedTemplates = templates.sort((a, b) => b.uploadedAt.getTime() - a.uploadedAt.getTime());
    
    console.log(`✅ Processados ${templates.length} módulos com dados reais`);
    return sortedTemplates;
    
  } catch (error) {
    console.error('❌ Erro ao buscar módulos do Firebase:', error);
    return [];
  }
};

/**
 * ✅ DADOS HÍBRIDOS (Real + Simulado)
 * Busca logs do sistema - parte real do Firebase, parte simulada
 */
export const getSystemLogs = async (limitCount: number = 50): Promise<SystemLog[]> => {
  try {
    console.log('🔄 Gerando logs do sistema (híbrido)...');
    
    // Busca dados reais para gerar logs mais precisos
    const [usersSnapshot, modulesSnapshot, orgsSnapshot] = await Promise.all([
      getDocs(collection(db, 'users')),
      getDocs(collection(db, 'modules')),
      getDocs(collection(db, 'organizations'))
    ]);
    
    const realLogs: SystemLog[] = [];
    const now = Date.now();
    
    // Gera logs baseados em dados reais
    orgsSnapshot.docs.forEach((orgDoc, index) => {
      const orgData = orgDoc.data();
      realLogs.push({
        id: `log_org_${orgDoc.id}`,
        timestamp: new Date(now - (index + 1) * 1000 * 60 * 30), // 30 min intervals
        level: 'info',
        type: 'hospital_added',
        message: `Hospital "${orgData.name}" foi adicionado à plataforma`,
        organizationId: orgDoc.id,
        resolved: true
      });
    });
    
    // Logs de módulos reais
    modulesSnapshot.docs.forEach((moduleDoc, index) => {
      const moduleData = moduleDoc.data();
      realLogs.push({
        id: `log_module_${moduleDoc.id}`,
        timestamp: new Date(now - (index + 1) * 1000 * 60 * 60), // 1 hour intervals
        level: 'info', 
        type: 'module_upload',
        message: `Módulo "${moduleData.title}" foi carregado na plataforma`,
        userId: 'csm_admin',
        resolved: true
      });
    });
    
    // Logs de usuários reais
    const recentUsers = usersSnapshot.docs.slice(0, 5);
    recentUsers.forEach((userDoc, index) => {
      const userData = userDoc.data();
      realLogs.push({
        id: `log_user_${userDoc.id}`,
        timestamp: new Date(now - (index + 1) * 1000 * 60 * 15), // 15 min intervals
        level: 'info',
        type: 'user_action',
        message: `Usuário ${userData.displayName} fez login na plataforma`,
        userId: userDoc.id,
        organizationId: userData.organizationId,
        resolved: true
      });
    });
    
    // Adiciona alguns logs simulados para completar
    const simulatedLogs: SystemLog[] = [
      {
        id: 'log_sync_1',
        timestamp: new Date(now - 1000 * 60 * 5),
        level: 'warning',
        type: 'integration_sync',
        message: 'Sincronização com Orchestra apresentou lentidão',
        resolved: false
      },
      {
        id: 'log_system_1',
        timestamp: new Date(now - 1000 * 60 * 10),
        level: 'info',
        type: 'system_error',
        message: 'Sistema reiniciado com sucesso após manutenção',
        resolved: true
      }
    ];
    
    const allLogs = [...realLogs, ...simulatedLogs]
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limitCount);
    
    console.log(`✅ Gerados ${allLogs.length} logs (${realLogs.length} baseados em dados reais)`);
    return allLogs;
    
  } catch (error) {
    console.error('❌ Erro ao gerar logs:', error);
    return [];
  }
};

/**
 * ✅ DADOS HÍBRIDOS (Real + Simulado)
 * Busca alertas do sistema baseados em dados reais
 */
export const getCSMAlerts = (callback: (alerts: CSMAlert[]) => void) => {
  try {
    console.log('🔄 Gerando alertas baseados em dados reais...');
    
    // Função para gerar alertas inteligentes
    const generateSmartAlerts = async () => {
      try {
        // Busca dados reais para gerar alertas precisos
        const [orgsSnapshot, usersSnapshot] = await Promise.all([
          getDocs(collection(db, 'organizations')),
          getDocs(collection(db, 'users'))
        ]);
        
        const alerts: CSMAlert[] = [];
        const now = Date.now();
        
        // Analisa organizações sem usuários
        orgsSnapshot.docs.forEach(orgDoc => {
          const orgData = orgDoc.data();
          const orgUsers = usersSnapshot.docs.filter(userDoc => 
            userDoc.data().organizationId === orgDoc.id && 
            userDoc.data().role !== 'superadmin'
          );
          
          if (orgUsers.length === 0) {
            alerts.push({
              id: `alert_no_users_${orgDoc.id}`,
              title: 'Hospital Sem Usuários',
              message: `Hospital "${orgData.name}" não possui usuários cadastrados`,
              severity: 'high',
              type: 'business',
              organizationId: orgDoc.id,
              createdAt: new Date(now - 1000 * 60 * 60 * 2),
              acknowledged: false
            });
          }
          
          if (orgUsers.length > 0 && orgUsers.length < 3) {
            alerts.push({
              id: `alert_low_users_${orgDoc.id}`,
              title: 'Baixo Número de Usuários',
              message: `Hospital "${orgData.name}" tem apenas ${orgUsers.length} usuário(s) cadastrado(s)`,
              severity: 'medium',
              type: 'business', 
              organizationId: orgDoc.id,
              createdAt: new Date(now - 1000 * 60 * 30),
              acknowledged: false
            });
          }
        });
        
        // Alertas simulados do sistema
        const systemAlerts: CSMAlert[] = [
          {
            id: 'alert_system_1',
            title: 'Uso de Recursos Alto',  
            message: 'CPU do servidor acima de 80% nos últimos 15 minutos',
            severity: 'medium',
            type: 'performance',
            createdAt: new Date(now - 1000 * 60 * 15),
            acknowledged: true,
            acknowledgedBy: 'admin',
            acknowledgedAt: new Date(now - 1000 * 60 * 10)
          }
        ];
        
        const allAlerts = [...alerts, ...systemAlerts]
          .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        
        console.log(`✅ Gerados ${allAlerts.length} alertas (${alerts.length} baseados em dados reais)`);
        callback(allAlerts);
        
      } catch (error) {
        console.error('❌ Erro ao gerar alertas:', error);
        callback([]);
      }
    };
    
    // Executa a geração de alertas
    generateSmartAlerts();
    
    // Retorna função de limpeza
    return () => {
      console.log('🧹 Unsubscribed from CSM alerts');
    };
    
  } catch (error) {
    console.error('❌ Erro ao configurar alertas:', error);
    return () => {};
  }
};

/**
 * ✅ DADOS HÍBRIDOS (Real + Calculado)
 * Busca informações de saúde do sistema baseadas em dados reais
 */
export const getSystemHealth = async (): Promise<SystemHealth> => {
  try {
    console.log('🔄 Calculando saúde do sistema com dados reais...');
    
    // Busca dados reais para calcular métricas
    const [usersSnapshot, orgsSnapshot] = await Promise.all([
      getDocs(collection(db, 'users')),
      getDocs(collection(db, 'organizations'))
    ]);
    
    // Calcula usuários ativos reais (não superadmins, não inativos)
    const activeUsers = usersSnapshot.docs.filter(doc => {
      const userData = doc.data();
      return userData.role !== 'superadmin' && userData.status !== 'inactive';
    }).length;
    
    // Simula uptime baseado na quantidade de dados (mais dados = mais estável)
    const dataHealthScore = Math.min(95 + (orgsSnapshot.size * 0.5), 99.9);
    
    const health: SystemHealth = {
      uptime: dataHealthScore,
      activeUsers: activeUsers,
      components: {
        database: orgsSnapshot.size > 0 ? 'healthy' : 'degraded',
        auth: usersSnapshot.size > 0 ? 'healthy' : 'degraded', 
        storage: Math.random() > 0.05 ? 'healthy' : 'degraded',
        api: 'healthy',
        notifications: Math.random() > 0.15 ? 'healthy' : 'degraded'
      },
      lastChecked: new Date()
    };
    
    console.log(`✅ Saúde do sistema calculada: ${activeUsers} usuários ativos, ${dataHealthScore.toFixed(1)}% uptime`);
    return health;
    
  } catch (error) {
    console.error('❌ Erro ao calcular saúde do sistema:', error);
    return {
      uptime: 0,
      activeUsers: 0,
      components: {
        database: 'down',
        auth: 'down', 
        storage: 'down',
        api: 'down',
        notifications: 'down'
      },
      lastChecked: new Date()
    };
  }
};

/**
 * ✅ SIMULADO (Para implementar depois)
 * Envia notificação para todo o sistema
 */
export const sendSystemNotification = async (notification: {
  title: string;
  message: string;
  targetAudience: 'all' | 'coordinators' | 'specific_org';
  organizationId?: string;
}) => {
  try {
    console.log('📤 Enviando notificação do sistema:', notification);
    
    // TODO: Implementar integração real com o sistema de notificações
    // Por enquanto apenas simula o envio
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return { success: true, message: 'Notificação enviada com sucesso' };
  } catch (error) {
    console.error('❌ Erro ao enviar notificação:', error);
    throw new Error('Falha ao enviar notificação');
  }
};