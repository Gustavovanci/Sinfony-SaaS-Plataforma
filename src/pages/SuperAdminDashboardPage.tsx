import { useEffect, useState } from 'react';
import { getSuperAdminDashboardData } from '../services/adminService';
import type { BusinessIntelligenceData } from '../services/adminService';
import { 
  Building, 
  Users, 
  TrendingUp, 
  Zap, 
  Download, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  TrendingDown,
  Award,
  Target,
  Filter,
  ChevronDown
} from 'lucide-react';
import { exportToExcel } from '../services/exportService';
import InsightModal from '../components/InsightModal';

const SuperAdminDashboardPage = () => {
  const [data, setData] = useState<BusinessIntelligenceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewingInsight, setViewingInsight] = useState<string | null>(null);
  const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null); // null = todas as empresas
  const [showOrgFilter, setShowOrgFilter] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const biData = await getSuperAdminDashboardData();
        setData(biData);
      } catch (error) {
        console.error("❌ Erro ao buscar dados de admin:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // 🔍 FILTROS POR EMPRESA
  const getFilteredData = () => {
    if (!data) return null;

    if (!selectedOrgId) {
      // Mostrar dados globais
      return {
        totalUsers: data.totalUsers,
        totalOrgs: data.totalOrgs,
        orgsWithDetails: data.orgsWithDetails,
        allUsers: data.allUsers,
        allOrganizations: data.allOrganizations,
        selectedOrgName: 'Todas as Empresas'
      };
    } else {
      // Mostrar dados da empresa específica
      const selectedOrg = data.orgsWithDetails.find(org => org.id === selectedOrgId);
      const orgUsers = data.allUsers.filter(user => user.organizationId === selectedOrgId);
      
      return {
        totalUsers: orgUsers.length,
        totalOrgs: 1,
        orgsWithDetails: selectedOrg ? [selectedOrg] : [],
        allUsers: orgUsers,
        allOrganizations: selectedOrg ? [selectedOrg] : [],
        selectedOrgName: selectedOrg?.name || 'Empresa não encontrada'
      };
    }
  };

  // 🧠 FUNÇÕES DE ANÁLISE INTELIGENTE (adaptadas para filtro)
  const getEngagementInsights = () => {
    const filtered = getFilteredData();
    if (!filtered) return null;
    
    const avgEngagement = filtered.orgsWithDetails.length > 0 
      ? filtered.orgsWithDetails.reduce((acc, org) => acc + org.avgEngagement, 0) / filtered.orgsWithDetails.length
      : 0;
    
    const highPerformers = filtered.orgsWithDetails.filter(org => org.avgEngagement > avgEngagement);
    const lowPerformers = filtered.orgsWithDetails.filter(org => org.avgEngagement < avgEngagement);
    const zeroEngagement = filtered.orgsWithDetails.filter(org => org.avgEngagement === 0);
    
    return {
      avgEngagement: avgEngagement.toFixed(2),
      highPerformers,
      lowPerformers,
      zeroEngagement,
      totalCompanies: filtered.totalOrgs
    };
  };

  const getUserDistributionInsights = () => {
    const filtered = getFilteredData();
    if (!filtered) return null;
    
    const usersPerOrg = filtered.orgsWithDetails.map(org => org.userCount);
    const avgUsersPerOrg = usersPerOrg.length > 0 
      ? usersPerOrg.reduce((acc, count) => acc + count, 0) / filtered.orgsWithDetails.length
      : 0;
    const maxUsers = usersPerOrg.length > 0 ? Math.max(...usersPerOrg) : 0;
    const minUsers = usersPerOrg.length > 0 ? Math.min(...usersPerOrg) : 0;
    
    return {
      avgUsersPerOrg: avgUsersPerOrg.toFixed(1),
      maxUsers,
      minUsers,
      distribution: usersPerOrg
    };
  };

  const generateRecommendations = () => {
    const insights = getEngagementInsights();
    if (!insights) return [];
    
    const recommendations = [];
    
    if (insights.zeroEngagement.length > 0) {
      recommendations.push({
        type: 'critical',
        icon: XCircle,
        title: 'Ação Urgente Necessária',
        description: `${insights.zeroEngagement.length} empresa(s) com 0% de engajamento`,
        action: 'Contactar imediatamente para suporte'
      });
    }
    
    if (insights.lowPerformers.length > 0) {
      recommendations.push({
        type: 'warning',
        icon: AlertTriangle,
        title: 'Baixo Engajamento Detectado',
        description: `${insights.lowPerformers.length} empresa(s) abaixo da média`,
        action: 'Implementar estratégias de motivação'
      });
    }
    
    if (insights.highPerformers.length > 0) {
      recommendations.push({
        type: 'success',
        icon: Award,
        title: 'Empresas de Alto Desempenho',
        description: `${insights.highPerformers.length} empresa(s) acima da média`,
        action: 'Estudar suas boas práticas'
      });
    }
    
    return recommendations;
  };

  const handleExport = () => {
    const filtered = getFilteredData();
    if (!filtered) return;
    
    const insights = getEngagementInsights();
    const dataToExport = filtered.orgsWithDetails.map(org => ({
      'Empresa': org.name,
      'Domínio': org.domain,
      'Nº de Utilizadores': org.userCount,
      'Engajamento Médio': org.avgEngagement,
      'Status': org.avgEngagement === 0 ? 'CRÍTICO' : 
                org.avgEngagement < parseFloat(insights?.avgEngagement || '0') ? 'BAIXO' : 'BOM',
      'Recomendação': org.avgEngagement === 0 ? 'Contactar urgentemente' :
                     org.avgEngagement < parseFloat(insights?.avgEngagement || '0') ? 'Implementar motivação' : 'Manter estratégia'
    }));
    
    const fileName = selectedOrgId ? 
      `Relatorio_${filtered.selectedOrgName?.replace(/\s+/g, '_')}` : 
      'Relatorio_Inteligente_Plataforma';
      
    exportToExcel(dataToExport, fileName);
  };

  const renderInsightModal = () => {
    const filtered = getFilteredData();
    if (!viewingInsight || !filtered) return null;

    switch (viewingInsight) {
      case 'orgs':
        return (
          <InsightModal 
            title={`Empresas - ${filtered.selectedOrgName}`}
            data={filtered.allOrganizations || []}
            columns={[
              { header: 'Nome', accessor: 'name' }, 
              { header: 'Domínio', accessor: 'domain' }
            ]}
            onClose={() => setViewingInsight(null)} 
          />
        );
      case 'users':
        return (
          <InsightModal 
            title={`Utilizadores - ${filtered.selectedOrgName}`}
            data={filtered.allUsers || []}
            columns={[
              { header: 'Nome', accessor: 'displayName' }, 
              { header: 'E-mail', accessor: 'email' }, 
              { header: 'Profissão', accessor: 'profession' }
            ]}
            onClose={() => setViewingInsight(null)} 
          />
        );
      default:
        return null;
    }
  };

  if (loading) return <div className="p-8">A carregar painel de gestão...</div>;
  if (!data) return <div className="p-8">Não foi possível carregar os dados.</div>;

  const filtered = getFilteredData();
  const insights = getEngagementInsights();
  const userInsights = getUserDistributionInsights();
  const recommendations = generateRecommendations();

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      {/* Header com Filtro */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Painel SuperAdmin</h1>
          <p className="mt-2 text-gray-600">Análise inteligente da plataforma com insights automatizados</p>
        </div>
        
        {/* Filtro de Empresa */}
        <div className="relative">
          <button
            onClick={() => setShowOrgFilter(!showOrgFilter)}
            className="flex items-center px-4 py-2 bg-white text-gray-700 rounded-lg shadow hover:shadow-md transition-shadow border border-gray-200"
          >
            <Filter className="h-4 w-4 mr-2" />
            <span className="text-sm">{filtered?.selectedOrgName}</span>
            <ChevronDown className="h-4 w-4 ml-2" />
          </button>
          
          {showOrgFilter && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
              <div className="py-1">
                <button
                  onClick={() => {
                    setSelectedOrgId(null);
                    setShowOrgFilter(false);
                  }}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${
                    !selectedOrgId ? 'bg-gray-50 font-medium' : ''
                  }`}
                >
                  Todas as Empresas
                </button>
                {data.orgsWithDetails.map(org => (
                  <button
                    key={org.id}
                    onClick={() => {
                      setSelectedOrgId(org.id);
                      setShowOrgFilter(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${
                      selectedOrgId === org.id ? 'bg-gray-50 font-medium' : ''
                    }`}
                  >
                    {org.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 🚨 ALERTAS E RECOMENDAÇÕES */}
      {recommendations.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <Target className="h-5 w-5 mr-2" />
            Recomendações Inteligentes
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recommendations.map((rec, index) => {
              const Icon = rec.icon;
              const bgColor = rec.type === 'critical' ? 'bg-red-50 border-red-200' :
                             rec.type === 'warning' ? 'bg-yellow-50 border-yellow-200' :
                             'bg-green-50 border-green-200';
              const textColor = rec.type === 'critical' ? 'text-red-800' :
                               rec.type === 'warning' ? 'text-yellow-800' :
                               'text-green-800';
              
              return (
                <div key={index} className={`p-4 rounded-lg border-2 ${bgColor}`}>
                  <div className="flex items-start">
                    <Icon className={`h-5 w-5 mt-0.5 mr-3 ${textColor}`} />
                    <div>
                      <h3 className={`font-semibold ${textColor}`}>{rec.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">{rec.description}</p>
                      <p className="text-xs font-medium mt-2 opacity-75">{rec.action}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* KPIs Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <button onClick={() => setViewingInsight('orgs')} className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow focus:outline-none focus:ring-2 focus:ring-blue-500">
          <div className="flex items-center">
            <div className="bg-blue-100 p-3 rounded-full">
              <Building className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4 text-left">
              <p className="text-gray-500">Total de Empresas</p>
              <p className="text-2xl font-bold">{filtered?.totalOrgs}</p>
            </div>
          </div>
        </button>

        <button onClick={() => setViewingInsight('users')} className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow focus:outline-none focus:ring-2 focus:ring-blue-500">
          <div className="flex items-center">
            <div className="bg-green-100 p-3 rounded-full">
              <Users className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4 text-left">
              <p className="text-gray-500">Total de Utilizadores</p>
              <p className="text-2xl font-bold">{filtered?.totalUsers}</p>
              <p className="text-xs text-gray-500">Média: {userInsights?.avgUsersPerOrg}/empresa</p>
            </div>
          </div>
        </button>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="bg-purple-100 p-3 rounded-full">
              <TrendingUp className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-gray-500">Engajamento Médio</p>
              <p className="text-2xl font-bold">{insights?.avgEngagement}</p>
              <p className="text-xs text-gray-500">
                {insights && insights.highPerformers.length > insights.lowPerformers.length ? 
                  '↗️ Tendência positiva' : '↘️ Precisa atenção'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="bg-yellow-100 p-3 rounded-full">
              <Zap className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4 min-w-0">
              <p className="text-gray-500">Módulo Mais Popular</p>
              <p className="text-xl font-bold truncate" title={data.mostPopularModule?.title || 'N/A'}>
                {data.mostPopularModule?.title || 'N/A'}
              </p>
              <p className="text-xs text-gray-500">
                {data.mostPopularModule?.completions || 0} conclusões
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabela Inteligente com Status */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-4 flex justify-between items-center border-b">
          <h3 className="text-xl font-semibold">Análise Detalhada por Empresa</h3>
          <button onClick={handleExport} className="flex items-center px-3 py-1.5 bg-gray-100 text-gray-700 text-sm font-semibold rounded-md shadow-sm hover:bg-gray-200">
            <Download className="h-4 w-4 mr-2" />
            Exportar com Insights
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="p-4 font-semibold">Empresa</th>
                <th className="p-4 font-semibold">Utilizadores</th>
                <th className="p-4 font-semibold">Engajamento</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold">Recomendação</th>
              </tr>
            </thead>
            <tbody>
              {filtered?.orgsWithDetails.map(org => {
                const avgEng = parseFloat(insights?.avgEngagement || '0');
                const status = org.avgEngagement === 0 ? 'critical' :
                              org.avgEngagement < avgEng ? 'warning' : 'success';
                
                return (
                  <tr key={org.id} className="border-b hover:bg-gray-50">
                    <td className="p-4 font-medium">{org.name}</td>
                    <td className="p-4">{org.userCount}</td>
                    <td className="p-4 font-semibold text-blue-600">{org.avgEngagement}</td>
                    <td className="p-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        status === 'critical' ? 'bg-red-100 text-red-800' :
                        status === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {status === 'critical' ? '🔴 Crítico' :
                         status === 'warning' ? '🟡 Atenção' : '🟢 Bom'}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-gray-600">
                      {org.avgEngagement === 0 ? 'Contactar urgentemente' :
                       org.avgEngagement < avgEng ? 'Implementar motivação' : 'Manter estratégia'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {renderInsightModal()}
    </div>
  );
};

export default SuperAdminDashboardPage;