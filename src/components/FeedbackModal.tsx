import { useState } from 'react';
import { X } from 'lucide-react';

// Define as "props" que o modal precisa receber para funcionar
interface FeedbackModalProps {
  moduleTitle: string; // O título do módulo para exibir no modal
  onSubmit: (feedback: { nps: number; csat: number; comment: string }) => void; // A função a ser chamada ao enviar
  onClose: () => void; // A função a ser chamada ao fechar
}

const FeedbackModal = ({ moduleTitle, onSubmit, onClose }: FeedbackModalProps) => {
  // Estados para guardar as respostas do usuário
  const [nps, setNps] = useState<number | null>(null);
  const [csat, setCsat] = useState<number | null>(null);
  const [comment, setComment] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (nps === null || csat === null) {
      alert("Por favor, responda às duas primeiras perguntas.");
      return;
    }
    // Chama a função 'onSubmit' que foi passada como prop, enviando os dados
    onSubmit({ nps, csat, comment });
  };

  return (
    // Fundo escuro semi-transparente
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      {/* O card do modal */}
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-lg relative animate-fade-in-up">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
          <X size={24} />
        </button>
        <h2 className="text-2xl font-bold mb-2">Feedback sobre "{moduleTitle}"</h2>
        <p className="text-gray-600 mb-6">Sua opinião é muito importante para nós!</p>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Pergunta NPS (Net Promoter Score) */}
          <div>
            <label className="block font-semibold text-gray-700">Em uma escala de 0 a 10, o quanto você recomendaria este treinamento a um colega?</label>
            <div className="flex flex-wrap justify-center gap-2 mt-2">
              {Array.from({ length: 11 }, (_, i) => (
                <button type="button" key={i} onClick={() => setNps(i)}
                  className={`w-10 h-10 rounded-full border-2 font-semibold transition-transform hover:scale-110 ${nps === i ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-blue-600 border-blue-200'}`}>
                  {i}
                </button>
              ))}
            </div>
          </div>

          {/* Pergunta CSAT (Customer Satisfaction) */}
          <div>
            <label className="block font-semibold text-gray-700">Qual seu nível de satisfação com o conteúdo apresentado?</label>
            <div className="flex justify-center gap-4 mt-3 text-4xl">
              {['😠', '😕', '😐', '🙂', '😄'].map((emoji, i) => (
                <button type="button" key={i} onClick={() => setCsat(i + 1)}
                  className={`p-2 rounded-full transition-transform hover:scale-125 ${csat === i + 1 ? 'bg-yellow-300' : 'bg-transparent'}`}>
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          {/* Comentário Aberto */}
          <div>
            <label htmlFor="comment" className="block font-semibold text-gray-700">Deixe um comentário (opcional):</label>
            <textarea id="comment" value={comment} onChange={(e) => setComment(e.target.value)}
              className="w-full mt-2 p-2 border border-gray-300 rounded-md h-24"
              placeholder="O que você mais gostou? O que podemos melhorar?"
            />
          </div>

          <button type="submit" disabled={nps === null || csat === null}
            className="w-full px-6 py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 disabled:bg-gray-400">
            Enviar Feedback
          </button>
        </form>
      </div>
    </div>
  );
};

// A linha mais importante que corrige o erro:
export default FeedbackModal;
