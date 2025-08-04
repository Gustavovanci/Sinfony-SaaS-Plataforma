import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  getNotificationsForUser, 
  markNotificationsAsReadForUser, 
  deleteNotificationForUser 
} from '../services/notificationService';
import type { Notification } from '../services/notificationService';
import { Bell, X, Trash2 } from 'lucide-react';

const NotificationBell = () => {
  const { userProfile } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!userProfile) return;
    const unsubscribe = getNotificationsForUser(userProfile, setNotifications);
    return () => unsubscribe();
  }, [userProfile]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleOpenNotifications = () => {
    const newIsOpen = !isOpen;
    setIsOpen(newIsOpen);
    if (newIsOpen && unreadCount > 0 && userProfile) {
      const unreadIds = notifications.filter(n => !n.read).map(n => n.id);
      markNotificationsAsReadForUser(userProfile.uid, unreadIds);
    }
  };
  
  const handleDelete = async (e: React.MouseEvent, notificationId: string) => {
    e.stopPropagation();
    if (!userProfile) return;
    
    // Otimização: remove da lista local imediatamente para feedback visual
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
    
    // Chama o serviço para apagar no backend
    await deleteNotificationForUser(userProfile.uid, notificationId);
  };

  if (userProfile?.role === 'superadmin' || userProfile?.role === 'csm') {
    return null;
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button onClick={handleOpenNotifications} className="relative text-gray-500 hover:text-gray-700">
        <Bell size={24} />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border z-50">
          <div className="p-4 border-b flex justify-between items-center">
            <h3 className="font-semibold">Notificações</h3>
            <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={18}/></button>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {notifications.length > 0 ? (
              notifications.map(notif => (
                <div key={notif.id} className={`group p-4 border-b flex justify-between items-start gap-2 hover:bg-gray-50 ${!notif.read ? 'bg-blue-50' : ''}`}>
                  <div className="flex-1">
                    <p className="text-sm text-gray-700">{notif.message}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {notif.createdAt.toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <button 
                    onClick={(e) => handleDelete(e, notif.id)} 
                    className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-opacity"
                    title="Apagar notificação"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))
            ) : (
              <p className="p-4 text-sm text-gray-500">Nenhuma notificação.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;