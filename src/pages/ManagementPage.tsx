import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getUsersByOrganization, updateUserRole, updateUserStatus } from '../services/userService';
import { sendNotification } from '../services/notificationService';
import type { UserProfile } from '../types';
import { Users, Bell, UserPlus, Trash2, Edit, Crown } from 'lucide-react';
import EditUserModal from '../components/EditUserModal';
import ConfirmationModal from '../components/ConfirmationModal';
import DeactivateConfirmationModal from '../components/DeactivateConfirmationModal';

// --- Subcomponente para a aba de Notificações ---
const NotificationsPanel = ({ employees }: { employees: UserProfile[] }) => {
  const { userProfile } = useAuth();
  const [message, setMessage] = useState('');
  const [recipient, setRecipient] = useState('all'); // 'all' ou o UID do utilizador
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message || !userProfile?.organizationId) return;

    setLoading(true);
    setSuccess('');
    setError('');
    try {
      const notificationData = {
        senderId: userProfile.uid,
        organizationId: userProfile.organizationId,
        message,
        ...(recipient !== 'all' && { 
          recipientId: recipient,
          recipientName: employees.find(emp => emp.uid === recipient)?.displayName
        }),
      };
      await sendNotification(notificationData);
      setSuccess('Notificação enviada com sucesso!');
      setMessage('');
      setRecipient('all');
    } catch (err) {
      setError("Ocorreu um erro ao enviar a notificação.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800">Enviar Notificação</h2>
      <p className="text-gray-500 mt-1">Envie mensagens e avisos para a sua equipa.</p>

      <form onSubmit={handleSend} className="mt-6 bg-white p-6 rounded-lg shadow space-y-4">
        <div>
          <label htmlFor="recipient" className="block text-sm font-medium text-gray-700">Destinatário</label>
          <select id="recipient" value={recipient} onChange={(e) => setRecipient(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm">
            <option value="all">Todos os Funcionários</option>
            {employees.map(emp => (
              <option key={emp.uid} value={emp.uid}>{emp.displayName}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="message" className="block text-sm font-medium text-gray-700">Mensagem</label>
          <textarea id="message" value={message} onChange={(e) => setMessage(e.target.value)} required
            className="w-full mt-1 p-2 border border-gray-300 rounded-md h-28"
            placeholder="Escreva a sua mensagem aqui..."
          />
        </div>
        <div className="flex justify-end items-center gap-4">
          {success && <p className="text-sm text-green-600">{success}</p>}
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button type="submit" disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 disabled:bg-blue-300">
            {loading ? 'A enviar...' : 'Enviar Notificação'}
          </button>
        </div>
      </form>
    </div>
  );
};


// --- Subcomponente para a aba de Contas ---
const AccountsPanel = ({ employees, loading, onEdit, onPromote, onDeactivate }: any) => {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Contas de Utilizadores</h2>
          <p className="text-gray-500 mt-1">Gira os perfis e permissões da sua equipa.</p>
        </div>
        {/* O botão de adicionar foi removido conforme solicitado */}
      </div>
      
      <div className="bg-white rounded-lg shadow">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="p-4 font-semibold">Nome</th>
                <th className="p-4 font-semibold">Função / Setor</th>
                <th className="p-4 font-semibold">Permissão</th>
                <th className="p-4 font-semibold text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={4} className="p-4 text-center">A carregar...</td></tr>
              ) : (
                employees.map((employee: UserProfile) => (
                  <tr key={employee.uid} className="border-b hover:bg-gray-50">
                    <td className="p-4 font-medium">{employee.displayName}</td>
                    <td className="p-4 text-gray-600">{employee.profession || 'N/D'} / {employee.sector || 'N/D'}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        employee.role === 'coordinator' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {employee.role === 'coordinator' ? 'Coordenador' : 'Funcionário'}
                      </span>
                    </td>
                    <td className="p-4 text-right space-x-2">
                      {employee.role === 'employee' && (
                        <button onClick={() => onPromote(employee)} className="p-2 text-gray-500 hover:text-yellow-600" title="Promover a Coordenador"><Crown size={18} /></button>
                      )}
                      <button onClick={() => onEdit(employee)} className="p-2 text-gray-500 hover:text-blue-600" title="Editar Utilizador"><Edit size={18} /></button>
                      <button onClick={() => onDeactivate(employee)} className="p-2 text-gray-500 hover:text-red-600" title="Desativar Utilizador"><Trash2 size={18} /></button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};


// --- Componente Principal da Página de Gestão ---
const ManagementPage = () => {
  const { userProfile } = useAuth();
  const [activeTab, setActiveTab] = useState('accounts');
  const [employees, setEmployees] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [promotingUser, setPromotingUser] = useState<UserProfile | null>(null);
  const [deactivatingUser, setDeactivatingUser] = useState<UserProfile | null>(null);

  const fetchEmployees = () => {
    if (userProfile?.organizationId) {
      setLoading(true);
      getUsersByOrganization(userProfile.organizationId)
        .then(users => {
          const teamMembers = users.filter(u => u.role !== 'superadmin');
          setEmployees(teamMembers);
        })
        .catch(err => console.error("Erro ao buscar funcionários:", err))
        .finally(() => setLoading(false));
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, [userProfile]);
  
  const handleSave = () => {
    setEditingUser(null);
    fetchEmployees();
  };

  const handleConfirmPromotion = async () => {
    if (!promotingUser) return;
    try {
      await updateUserRole(promotingUser.uid, 'coordinator');
      setPromotingUser(null);
      fetchEmployees();
    } catch (error) {
      console.error("Erro ao promover utilizador:", error);
    }
  };

  const handleConfirmDeactivation = async () => {
    if (!deactivatingUser) return;
    try {
      await updateUserStatus(deactivatingUser.uid, 'inactive');
      setDeactivatingUser(null);
      fetchEmployees();
    } catch (error) {
      console.error("Erro ao desativar utilizador:", error);
    }
  };

  const menuItems = [
    { id: 'accounts', label: 'Contas', icon: Users },
    { id: 'notifications', label: 'Notificações', icon: Bell },
  ];

  return (
    <div className="p-8 flex gap-8 bg-gray-50" style={{ height: 'calc(100vh - 4rem)' }}>
      <aside className="w-1/4 flex-shrink-0">
        <div className="mb-6">
          <p className="font-bold text-xl text-gray-800">{userProfile?.displayName}</p>
          <p className="text-sm text-gray-500">{userProfile?.email}</p>
        </div>
        <nav className="space-y-2">
          {menuItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center px-4 py-2.5 text-left rounded-lg transition-colors ${
                activeTab === item.id ? 'bg-gray-200 text-gray-900 font-semibold' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <item.icon className="w-5 h-5 mr-3" />
              {item.label}
            </button>
          ))}
        </nav>
      </aside>

      <main className="w-3/4 overflow-y-auto">
        {activeTab === 'accounts' && <AccountsPanel employees={employees} loading={loading} onEdit={setEditingUser} onPromote={setPromotingUser} onDeactivate={setDeactivatingUser} />}
        {activeTab === 'notifications' && <NotificationsPanel employees={employees} />}
      </main>

      {editingUser && (
        <EditUserModal user={editingUser} onClose={() => setEditingUser(null)} onSave={handleSave} />
      )}
      {promotingUser && (
        <ConfirmationModal
          title="Promover a Coordenador"
          message={`Tem a certeza que deseja dar permissões de coordenador a ${promotingUser.displayName}?`}
          confirmText="Sim, Promover"
          onConfirm={handleConfirmPromotion}
          onClose={() => setPromotingUser(null)}
        />
      )}
      {deactivatingUser && (
        <DeactivateConfirmationModal
          userName={deactivatingUser.displayName || 'este utilizador'}
          onConfirm={handleConfirmDeactivation}
          onClose={() => setDeactivatingUser(null)}
        />
      )}
    </div>
  );
};

export default ManagementPage;
