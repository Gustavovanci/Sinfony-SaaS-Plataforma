import { useState } from 'react';
// ... outras importações
import { addModuleWithQuiz } from '../services/moduleService';
// ✅ Importa a função correta
import { sendBroadcastNotification } from '../services/notificationService'; 
import { uploadModuleCoverImage } from '../services/storageService';
import type { NewModuleData, ModuleTopic, QuestionData } from '../types';

// ... (interface e início do componente)
const UploadModuleModal = ({ isOpen, onClose, onSuccess }: UploadModuleModalProps) => {
    // ... (todos os states)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            let coverImageUrl = '';
            if (coverImageFile) {
                coverImageUrl = await uploadModuleCoverImage(coverImageFile);
            }
          
            const modulePayload: NewModuleData = {
                ...formData,
                coverImageUrl,
                topics,
                isActive: true,
                createdBy: 'csm'
            };

            await addModuleWithQuiz(modulePayload);
          
            // ✅ USA A FUNÇÃO DE BROADCAST CORRETA
            await sendBroadcastNotification({
                senderId: 'system', // ou ID do CSM logado
                message: `Novo treinamento disponível: "${formData.title}"`,
            });

            onSuccess();
            onClose();
        } catch (err: any) {
            setError(err.message || 'Erro ao fazer upload do módulo.');
        } finally {
            setLoading(false);
        }
    };

    // ... (resto do JSX do componente)
}

export default UploadModuleModal;