import { useEffect, useState } from 'react';
import {
  Building,
  Users,
  Activity,
  AlertTriangle,
  Plus,
  Upload,
  Bell,
  Settings,
  FileText,
  TrendingUp,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import {
  getHospitals,
  getModuleTemplates,
  getSystemLogs,
  getCSMAlerts,
  getSystemHealth
} from '../services/csmService';
import AddHospitalModal from '../components/AddHospitalModal';
import UploadModuleModal from '../components/UploadModuleModal';
import ModuleLibraryModal from '../components/ModuleLibraryModal';

import type {
  CSMHospital,
  ModuleTemplate,
  SystemLog,
  CSMAlert,
  SystemHealth
} from '../types';

const CSMDashboardPage = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [hospitals, setHospitals] = useState<CSMHospital[]>([]);
  const [modules, setModules] = useState<ModuleTemplate[]>([]);
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [alerts, setAlerts] = useState<CSMAlert[]>([]);
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);
  const [loading, setLoading] = useState(true);

  // Modals
  const [showAddHospital, setShowAddHospital] = useState(false);
  const [showUploadModule, setShowUploadModule] = useState(false);
  const [showSendNotification, setShowSendNotification] = useState(false);
  const [showModuleLibrary, setShowModuleLibrary] = useState<{category: string, label: string} | null>(null);

  const refreshData = async () => {
     try {
        setLoading(true);
        const [hospitalsData, modulesData, logsData, healthData] = await Promise.all([
          getHospitals(),
          getModuleTemplates(),
          getSystemLogs(50),
          getSystemHealth()
        ]);
        setHospitals(hospitalsData);
        setModules(modulesData);
        setLogs(logsData);
        setSystemHealth(healthData);
      } catch (error) {
        console.error('Erro ao recarregar dados do CSM:', error);
      } finally {
        setLoading(false);
      }
  };

  useEffect(() => {
    refreshData();
    const unsubscribeAlerts = getCSMAlerts(setAlerts);
    return () => {
      unsubscribeAlerts();
    };
  }, []);

  const OverviewTab = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-gray-900">Visão Geral do Sistema</h2>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <Building className="h-8 w-8 text-blue-600 mr-4" />
            <div>
              <p className="text-sm text-gray-600">Hospitais Ativos</p>
              <p className="text-2xl font-bold">{hospitals.filter(h => h.status === 'active').length}</p>
              <p className="text-xs text-gray-500">de {hospitals.length} total</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-green-600 mr-4" />
            <div>
              <p className="text-sm text-gray-600">Usuários Ativos</p>
              <p className="text-2xl font-bold">{systemHealth?.activeUsers || 0}</p>
              <p className="text-xs text-gray-500">em {hospitals.length} hospitais</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <FileText className="h-8 w-8 text-purple-600 mr-4" />
            <div>
              <p className="text-sm text-gray-600">Módulos Disponíveis</p>
              <p className="text-2xl font-bold">{modules.filter(m => m.isActive).length}</p>
              <p className="text-xs text-gray-500">de {modules.length} total</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <Activity className="h-8 w-8 text-orange-600 mr-4" />
            <div>
              <p className="text-sm text-gray-600">Uptime Sistema</p>
              <p className="text-2xl font-bold">{systemHealth?.uptime.toFixed(1)}%</p>
              <p className="text-xs text-gray-500">últimos 30 dias</p>
            </div>
          </div>
        </div>
      </div>
      {systemHealth && (
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold mb-4">Status dos Componentes</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {Object.entries(systemHealth.components).map(([component, status]) => (
              <div key={component} className="flex items-center">
                {status === 'healthy' ? <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" /> : <XCircle className="h-5 w-5 text-red-500 mr-2" />}
                <span className="text-sm capitalize">{component.replace('_', ' ')}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold">Alertas Críticos</h3>
        </div>
        <div className="p-6">
          {alerts.filter(a => a.severity === 'critical' && !a.acknowledged).length === 0 ? (
            <p className="text-gray-500 text-center py-4">Nenhum alerta crítico pendente</p>
          ) : (
            <div className="space-y-3">
              {alerts.filter(a => a.severity === 'critical' && !a.acknowledged).slice(0, 5).map(alert => (
                <div key={alert.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                  <div className="flex items-center">
                    <AlertTriangle className="h-5 w-5 text-red-600 mr-3" />
                    <div>
                      <p className="font-medium text-red-800">{alert.title}</p>
                      <p className="text-sm text-red-600">{alert.message}</p>
                    </div>
                  </div>
                  <button className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700">Ação</button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const HospitalsTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-gray-900">Gestão de Hospitais</h2>
        <button onClick={() => setShowAddHospital(true)} className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" /> Adicionar Hospital
        </button>
      </div>
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hospital</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Usuários</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Orchestra</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Última Sync</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ações</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {hospitals.map(hospital => (
              <tr key={hospital.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <Building className="h-8 w-8 text-gray-400 mr-3" />
                    <div>
                      <div className="text-sm font-medium text-gray-900">{hospital.name}</div>
                      <div className="text-sm text-gray-500">{hospital.domain}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${hospital.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {hospital.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{hospital.userCount}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className={`h-2 w-2 rounded-full mr-2 ${hospital.orchestraConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <span className="text-sm text-gray-900">{hospital.orchestraConnected ? 'Conectado' : 'Desconectado'}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{hospital.lastSync.toLocaleDateString('pt-BR')}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button className="text-blue-600 hover:text-blue-900 mr-3">Detalhes</button>
                  <button className="text-gray-600 hover:text-gray-900">Configurar</button>
                </td>
              </tr>
            ))}
          </tbody> {/* ✅ ESTA É A TAG DE FECHAMENTO QUE FALTAVA */}
        </table> {/* ✅ E ESTA TAMBÉM */}
      </div>
    </div>
  );

  const ModulesTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-gray-900">Biblioteca de Módulos</h2>
        <button onClick={() => setShowUploadModule(true)} className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          <Upload className="h-4 w-4 mr-2" /> Criar Novo Módulo
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { value: 'uti', label: 'UTI' },
          { value: 'centro_cirurgico', label: 'Centro Cirúrgico' },
          { value: 'enfermagem', label: 'Enfermagem' },
          { value: 'tecnologia', label: 'Tecnologia' },
          { value: 'geral', label: 'Geral' }
        ].map(category => {
          const categoryModules = modules.filter(m => m.category === category.value);
          const activeModules = categoryModules.filter(m => m.isActive);
          return (
            <div key={category.value} className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
              <h3 className="font-semibold mb-4">{category.label}</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm"><span>Total de módulos:</span><span className="font-medium">{categoryModules.length}</span></div>
                <div className="flex justify-between text-sm"><span>Ativos:</span><span className="font-medium text-green-600">{activeModules.length}</span></div>
                <div className="flex justify-between text-sm"><span>Inativos:</span><span className="font-medium text-red-600">{categoryModules.length - activeModules.length}</span></div>
              </div>
              <button onClick={() => setShowModuleLibrary({ category: category.value, label: category.label })} className="mt-4 w-full px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors">
                Ver Módulos ({categoryModules.length})
              </button>
            </div>
          );
        })}
      </div>
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200"><h3 className="text-lg font-semibold">Módulos Recentes</h3></div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Módulo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Categoria</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Duração</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Upload</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ações</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {modules.slice(0, 10).map(module => (
                <tr key={module.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{module.title}</div>
                      <div className="text-sm text-gray-500">{module.description.substring(0, 50)}...</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap"><span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">{module.category.replace('_', ' ')}</span></td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{module.estimatedDuration}min</td>
                  <td className="px-6 py-4 whitespace-nowrap"><span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${module.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{module.isActive ? 'Ativo' : 'Inativo'}</span></td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{module.uploadedAt.toLocaleDateString('pt-BR')}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium"><button onClick={() => setShowModuleLibrary({ category: module.category, label: module.category.replace('_', ' ') })} className="text-blue-600 hover:text-blue-900 mr-3">Ver Detalhes</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const LogsTab = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-gray-900">Logs do Sistema</h2>
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="flex flex-wrap gap-4">
          <select className="px-3 py-2 border border-gray-300 rounded-md text-sm"><option>Todos os tipos</option></select>
          <select className="px-3 py-2 border border-gray-300 rounded-md text-sm"><option>Todos os níveis</option></select>
          <input type="date" className="px-3 py-2 border border-gray-300 rounded-md text-sm" />
        </div>
      </div>
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Timestamp</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nível</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mensagem</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {logs.map(log => (
                <tr key={log.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{log.timestamp.toLocaleString('pt-BR')}</td>
                  <td className="px-6 py-4 whitespace-nowrap"><span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${log.level === 'critical' || log.level === 'error' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>{log.level}</span></td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{log.type.replace('_', ' ')}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{log.message}</td>
                  <td className="px-6 py-4 whitespace-nowrap"><span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${log.resolved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>{log.resolved ? 'Resolvido' : 'Pendente'}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const AlertsTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-gray-900">Sistema de Alertas</h2>
        <button onClick={() => setShowSendNotification(true)} className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          <Bell className="h-4 w-4 mr-2" /> Enviar Notificação
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {(['critical', 'high', 'medium', 'low'] as const).map(severity => {
          const count = alerts.filter(a => a.severity === severity && !a.acknowledged).length;
          return (
            <div key={severity} className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="flex items-center">
                <div className={`h-8 w-8 rounded-full flex items-center justify-center mr-4 ${severity === 'critical' ? 'bg-red-100' : severity === 'high' ? 'bg-orange-100' : severity === 'medium' ? 'bg-yellow-100' : 'bg-blue-100'}`}>
                  <AlertTriangle className={`h-5 w-5 ${severity === 'critical' ? 'text-red-600' : severity === 'high' ? 'text-orange-600' : severity === 'medium' ? 'text-yellow-600' : 'text-blue-600'}`} />
                </div>
                <div>
                  <p className="text-sm text-gray-600 capitalize">{severity}</p>
                  <p className="text-2xl font-bold">{count}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200"><h3 className="text-lg font-semibold">Alertas Recentes</h3></div>
        <div className="divide-y divide-gray-200">
          {alerts.slice(0, 20).map(alert => (
            <div key={alert.id} className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start">
                  <div className={`h-2 w-2 rounded-full mt-2 mr-4 ${alert.severity === 'critical' ? 'bg-red-500' : alert.severity === 'high' ? 'bg-orange-500' : alert.severity === 'medium' ? 'bg-yellow-500' : 'bg-blue-500'}`}></div>
                  <div className="flex-1">
                    <div className="flex items-center">
                      <h4 className="text-sm font-medium text-gray-900">{alert.title}</h4>
                      <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${alert.severity === 'critical' ? 'bg-red-100 text-red-800' : 'bg-orange-100 text-orange-800'}`}>{alert.severity}</span>
                    </div>
                    <p className="mt-1 text-sm text-gray-600">{alert.message}</p>
                    <p className="mt-1 text-xs text-gray-500">{alert.createdAt.toLocaleString('pt-BR')}</p>
                  </div>
                </div>
                {!alert.acknowledged && (<button className="ml-4 px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700">Reconhecer</button>)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  if (loading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="text-gray-600">Carregando dashboard CSM...</div></div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Sinfony CSM</h1>
              <p className="text-sm text-gray-600">Customer Success Management Dashboard</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                <CheckCircle2 className="h-4 w-4 mr-2" /> Sistema Operacional
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="border-b border-gray-200 mb-6">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', name: 'Visão Geral', icon: TrendingUp },
              { id: 'hospitals', name: 'Hospitais', icon: Building },
              { id: 'modules', name: 'Módulos', icon: FileText },
              { id: 'logs', name: 'Logs', icon: Activity },
              { id: 'alerts', name: 'Alertas', icon: AlertTriangle },
              { id: 'settings', name: 'Configurações', icon: Settings }
            ].map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center px-3 py-2 border-b-2 text-sm font-medium ${activeTab === tab.id ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
                <tab.icon className="h-4 w-4 mr-2" /> {tab.name}
              </button>
            ))}
          </nav>
        </div>
        <div>
          {activeTab === 'overview' && <OverviewTab />}
          {activeTab === 'hospitals' && <HospitalsTab />}
          {activeTab === 'modules' && <ModulesTab />}
          {activeTab === 'logs' && <LogsTab />}
          {activeTab === 'alerts' && <AlertsTab />}
          {activeTab === 'settings' && <div>Configurações em desenvolvimento...</div>}
        </div>
      </div>
      <AddHospitalModal isOpen={showAddHospital} onClose={() => setShowAddHospital(false)} onSuccess={refreshData} />
      <UploadModuleModal isOpen={showUploadModule} onClose={() => setShowUploadModule(false)} onSuccess={refreshData} />
      {showModuleLibrary && <ModuleLibraryModal isOpen={true} category={showModuleLibrary.category} categoryLabel={showModuleLibrary.label} onClose={() => setShowModuleLibrary(null)} onModuleUpdated={refreshData} />}
      {showSendNotification && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-semibold mb-4">Enviar Notificação</h3>
            <p className="text-gray-600 mb-4">Funcionalidade em desenvolvimento...</p>
            <button onClick={() => setShowSendNotification(false)} className="w-full px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700">Fechar</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CSMDashboardPage;