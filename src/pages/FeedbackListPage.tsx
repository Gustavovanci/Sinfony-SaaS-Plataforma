import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
// --- CORREÇÃO AQUI ---
import { getFeedbackByOrganization } from '../services/feedbackService';
import type { EnrichedFeedback } from '../services/feedbackService';
// --- FIM DA CORREÇÃO ---
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const FeedbackListPage = () => {
  const { userProfile } = useAuth();
  const [feedbacks, setFeedbacks] = useState<EnrichedFeedback[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userProfile?.organizationId) {
      setLoading(true);
      getFeedbackByOrganization(userProfile.organizationId)
        .then(data => setFeedbacks(data))
        .catch(err => console.error("Erro ao buscar feedbacks:", err))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [userProfile]);

  if (loading) {
    return <div className="p-8">Carregando feedbacks...</div>;
  }

  return (
    <div className="p-8">
      <Link to="/coordinator" className="flex items-center text-sm text-gray-600 hover:text-blue-600 mb-4">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Voltar ao Painel
      </Link>
      <h1 className="text-3xl font-bold">Feedbacks da Equipe</h1>
      <p className="mt-2 text-gray-600">Veja a opinião dos funcionários sobre os treinamentos.</p>
      
      <div className="mt-8 bg-white rounded-lg shadow">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="p-4 font-semibold">Funcionário</th>
                <th className="p-4 font-semibold">Treinamento</th>
                <th className="p-4 font-semibold text-center">NPS</th>
                <th className="p-4 font-semibold text-center">CSAT</th>
                <th className="p-4 font-semibold">Comentário</th>
              </tr>
            </thead>
            <tbody>
              {feedbacks.map(fb => (
                <tr key={fb.id} className="border-b">
                  <td className="p-4">{fb.userName}</td>
                  <td className="p-4">{fb.moduleTitle}</td>
                  <td className="p-4 text-center font-medium">{fb.nps}</td>
                  <td className="p-4 text-center text-2xl">
                    {['😠', '😕', '😐', '🙂', '😄'][fb.csat - 1]}
                  </td>
                  <td className="p-4 text-sm text-gray-600 max-w-xs break-words">{fb.comment || '-'}</td>
                </tr>
              ))}
              {feedbacks.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-4 text-center text-gray-500">
                    Nenhum feedback foi enviado pela equipe ainda.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default FeedbackListPage;
