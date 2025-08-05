import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { getUsersByOrganization, updateUserRole, updateUserStatus } from '../services/userService';
import type { UserProfile } from '../types';
import { Users, Trash2, Edit, Crown } from 'lucide-react';
import EditUserModal from '../components/EditUserModal';
import ConfirmationModal from '../components/ConfirmationModal';
import DeactivateConfirmationModal from '../components/DeactivateConfirmationModal';

// --- Subcomponente para a aba de Contas (sem alterações) ---
const AccountsPanel = ({ employees, loading, onEdit, onPromote, onDeactivate }: any) => {
  const { userProfile } = useAuth();
  const teamMembers = employees.filter((emp: UserProfile) => emp.uid !== userProfile?.uid);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Contas de Utilizadores</h2>
          <p className="text-gray-500 mt-1">Gira os perfis e permissões da sua equipa.</p>
        </div>
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
                teamMembers.map((employee: UserProfile) => (
                  <tr key={employee.uid} className="border-b hover:bg-gray-50">
                    <td className="p-4 font-medium">{employee.displayName}</td>
                    <td className="p-4 text-gray-600">{employee.profession || 'N/D'} / {employee.sector || 'N/D'}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${employee.role === 'coordinator' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'}`}>
                        {employee.role === 'coordinator' ? 'Coordenador' : 'Funcionário'}
                      </span>
                    </td>
                    <td className="p-4 text-right space-x-2">
                      {employee.role === 'employee' && (<button onClick={() => onPromote(employee)} className="p-2 text-gray-500 hover:text-yellow-600" title="Promover a Coordenador"><Crown size={18} /></button>)}
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


// --- Componente Principal da Página de Gestão (SIMPLIFICADO) ---
const ManagementPage = () => {
  const { userProfile } = useAuth();
  const [employees, setEmployees] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [promotingUser, setPromotingUser] = useState<UserProfile | null>(null);
  const [deactivatingUser, setDeactivatingUser] = useState<UserProfile | null>(null);

  const fetchEmployees = useCallback(() => {
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
  }, [userProfile]);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);
  
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

  return (
    <div className="p-8">
        <AccountsPanel 
          employees={employees} 
          loading={loading} 
          onEdit={setEditingUser} 
          onPromote={setPromotingUser} 
          onDeactivate={setDeactivatingUser} 
        />
        {editingUser && <EditUserModal user={editingUser} onClose={() => setEditingUser(null)} onSave={handleSave} />}
        {promotingUser && <ConfirmationModal title="Promover a Coordenador" message={`Tem a certeza que deseja dar permissões de coordenador a ${promotingUser.displayName}?`} confirmText="Sim, Promover" onConfirm={handleConfirmPromotion} onClose={() => setPromotingUser(null)} />}
        {deactivatingUser && <DeactivateConfirmationModal userName={deactivatingUser.displayName || 'este utilizador'} onConfirm={handleConfirmDeactivation} onClose={() => setDeactivatingUser(null)} />}
    </div>
  );
};

export default ManagementPage;