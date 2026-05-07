import React from 'react';
import { motion } from 'motion/react';
import { 
  LayoutDashboard, 
  FileText, 
  Users, 
  Heart, 
  MessageSquare, 
  Image as ImageIcon,
  Settings,
  LogOut,
  ChevronRight
} from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/src/context/AuthContext';
import { signOut } from 'firebase/auth';
import { auth } from '@/src/lib/firebase';
import { cn } from '@/src/lib/utils';

const adminLinks = [
  { name: 'Dashboard', icon: LayoutDashboard, path: '/admin' },
  { name: 'Blog Posts', icon: FileText, path: '/admin/blog' },
  { name: 'Volunteers', icon: Users, path: '/admin/volunteers' },
  { name: 'Donations', icon: Heart, path: '/admin/donations' },
  { name: 'Contact Submissions', icon: MessageSquare, path: '/admin/messages' },
  { name: 'Gallery', icon: ImageIcon, path: '/admin/gallery' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  if (loading) return null;
  if (!user || !isAdmin) {
    navigate('/');
    return null;
  }

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/');
  };

  return (
    <div className="flex min-h-screen bg-slate-50 pt-20">
      {/* Admin Sidebar */}
      <aside className="w-80 bg-dark hidden lg:flex flex-col fixed top-20 bottom-0 left-0 z-30 border-r border-slate-800">
        <div className="p-10 pb-6">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-10">Systems Command</p>
          <nav className="space-y-2">
            {adminLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={cn(
                  "flex items-center justify-between px-6 py-4 rounded-xl transition-all group",
                  location.pathname === link.path 
                    ? "bg-primary text-white shadow-xl shadow-primary/10" 
                    : "text-slate-400 hover:text-white"
                )}
              >
                <div className="flex items-center space-x-4">
                  <link.icon className="w-5 h-5 flex-shrink-0" />
                  <span className="font-black text-xs uppercase tracking-widest">{link.name}</span>
                </div>
                <ChevronRight className={cn(
                  "w-4 h-4 transition-all",
                  location.pathname === link.path ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0"
                )} />
              </Link>
            ))}
          </nav>
        </div>

        <div className="mt-auto p-10 bg-slate-900/50 border-t border-slate-800 space-y-8">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg">
              {user.email?.charAt(0).toUpperCase() || 'A'}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-black text-white truncate">{user.displayName || 'System Admin'}</p>
              <p className="text-[10px] font-black text-primary uppercase tracking-widest">Level 1 Admin</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-3 px-6 py-4 rounded-xl bg-white/5 border border-white/5 text-white hover:bg-red-500/10 hover:text-red-400 transition-all font-black text-xs uppercase tracking-widest"
          >
            <LogOut className="w-4 h-4" />
            <span>Terminate Session</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-grow lg:ml-80 p-8 md:p-16 lg:p-20 overflow-y-auto bg-white">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
        >
          {children}
        </motion.div>
      </main>
    </div>
  );
}
