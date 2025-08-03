import { X, AlertTriangle } from 'lucide-react';

interface DeactivateConfirmationModalProps {
  userName: string;
  onConfirm: () => void;
  onClose: () => void;
}

const DeactivateConfirmationModal = ({ userName, onConfirm, onClose }: DeactivateConfirmationModalProps) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
          <X size={24} />
        </button>
        <div className="flex items-start">
          <div className="mr-4 flex-shrink-0">
            <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-orange-100">
              <AlertTriangle className="h-6 w-6 text-orange-600" aria-hidden="true" />
            </div>
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Desativar Usuário</h2>
            <p className="mt-2 text-gray-600">
              Tem a certeza que deseja desativar <strong>{userName}</strong>? O usuário não poderá mais acessar a plataforma, mas seus dados serão mantidos.
            </p>
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-4">
          <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">
            Cancelar
          </button>
          <button type="button" onClick={onConfirm} className="px-4 py-2 bg-orange-500 text-white font-semibold rounded-md hover:bg-orange-600">
            Sim, Desativar
          </button>
        </div>
      </div>
    </div>
  );
};

// A linha mais importante que corrige o erro:
export default DeactivateConfirmationModal;
