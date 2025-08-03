import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { getNotificationsForUser, markNotificationsAsRead } from '../services/notificationService';
import type { Notification } from '../services/notificationService';
import { Bell, X } from 'lucide-react';

const NotificationBell = () => {
  const { userProfile } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // --- CORREÇÃO AQUI ---
    // Só busca notificações se o usuário tiver um organizationId (ou seja, não é um superadmin).
    if (!userProfile || !userProfile.organizationId) {
      return;
    }

    const unsubscribe = getNotificationsForUser(userProfile, (fetchedNotifications) => {
      setNotifications(fetchedNotifications);
    });

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
    setIsOpen(!isOpen);
    if (!isOpen && unreadCount > 0) {
      const unreadIds = notifications.filter(n => !n.read).map(n => n.id);
      markNotificationsAsRead(unreadIds);
    }
  };

  // Se o usuário for superadmin, não renderiza o sino.
  if (userProfile?.role === 'superadmin') {
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
                <div key={notif.id} className={`p-4 border-b hover:bg-gray-50 ${!notif.read ? 'bg-blue-50' : ''}`}>
                  <p className="text-sm text-gray-700">{notif.message}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {notif.createdAt.toLocaleDateString('pt-BR')} às {notif.createdAt.toLocaleTimeString('pt-BR')}
                  </p>
                </div>
              ))
            ) : (
              <p className="p-4 text-sm text-gray-500">Nenhuma notificação nova.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
