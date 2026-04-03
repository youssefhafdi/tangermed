import { create } from 'zustand';

let notifId = 0;

const useUIStore = create((set, get) => ({
  sidebarOpen: true,
  notifications: [],

  toggleSidebar: () => set(s => ({ sidebarOpen: !s.sidebarOpen })),

  notify: (message, type = 'success') => {
    const id = ++notifId;
    set(s => ({ notifications: [...s.notifications, { id, message, type }] }));
    setTimeout(() => {
      set(s => ({ notifications: s.notifications.filter(n => n.id !== id) }));
    }, 4000);
  },

  dismissNotification: (id) => {
    set(s => ({ notifications: s.notifications.filter(n => n.id !== id) }));
  },
}));

export default useUIStore;
