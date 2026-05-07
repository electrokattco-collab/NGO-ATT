import React, { useState, useEffect } from 'react';
import { Shield, User, Search, Save, AlertCircle, CheckCircle2, History, Loader2, UserPlus, Info } from 'lucide-react';
import { useAuth } from '@/src/context/AuthContext';
import { firebaseService } from '@/src/services/firebaseService';
import { COLLECTIONS } from '@/src/constants';
import { UserProfile } from '@/src/types';
import { Button } from '@/src/components/ui/Button';
import { Card } from '@/src/components/ui/Card';
import { Badge } from '@/src/components/ui/Badge';
import { Input } from '@/src/components/ui/Input';
import { cn } from '@/src/utils';

const ROLES = [
  { id: 'super_admin', label: 'Super Admin', desc: 'Full system access, role management, audit logs.' },
  { id: 'admin', label: 'Admin', desc: 'High-level operational oversight and staff management.' },
  { id: 'editor', label: 'Editor', desc: 'Content strategy, blog management, program updates.' },
  { id: 'volunteer_manager', label: 'Volunteer Manager', desc: 'Recruitment, approval, and field deployment.' },
  { id: 'donor_manager', label: 'Donor Manager', desc: 'Financial tracking, sponsor relations, impact metrics.' },
  { id: 'user', label: 'User', desc: 'Standard stakeholder access with limited visibility.' },
];

export default function RoleManagement() {
  const { user, role: myRole } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [logs, setLogs] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'users' | 'audit'>('users');

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await firebaseService.getCollection<UserProfile>(COLLECTIONS.USERS);
      setUsers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchLogs = async () => {
    try {
      const response = await fetch('/api/admin/audit-logs', {
        headers: {
          'Authorization': `Bearer ${await user?.getIdToken()}`
        }
      });
      const data = await response.json();
      setLogs(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchUsers();
    if (activeTab === 'audit') fetchLogs();
  }, [activeTab]);

  const handleRoleChange = async (targetUid: string, newRole: string) => {
    try {
      setUpdating(targetUid);
      const token = await user?.getIdToken();
      const response = await fetch('/api/admin/assign-role', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ targetUid, role: newRole })
      });

      if (response.ok) {
        setUsers(users.map(u => u.id === targetUid ? { ...u, role: newRole as any } : u));
      } else {
        const err = await response.json();
        alert(err.error || 'Failed to update role');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUpdating(null);
    }
  };

  const filteredUsers = users.filter(u => 
    u.name?.toLowerCase().includes(search.toLowerCase()) || 
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-12 pb-20">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-2">
          <Badge variant="primary">Access Control</Badge>
          <h1 className="text-4xl font-black text-dark tracking-tight uppercase leading-none">Authorization Matrix</h1>
          <p className="text-slate-500 font-medium">Enterprise RBAC management for ATT NGO infrastructure.</p>
        </div>
        <div className="flex bg-slate-100 p-1 rounded-xl">
           <button 
             onClick={() => setActiveTab('users')}
             className={cn("px-6 py-3 rounded-lg text-xs font-black uppercase tracking-widest transition-all", activeTab === 'users' ? "bg-white shadow-sm text-primary" : "text-slate-400 hover:text-slate-600")}
           >
             User Map
           </button>
           <button 
             onClick={() => setActiveTab('audit')}
             className={cn("px-6 py-3 rounded-lg text-xs font-black uppercase tracking-widest transition-all", activeTab === 'audit' ? "bg-white shadow-sm text-primary" : "text-slate-400 hover:text-slate-600")}
           >
             Audit Trail
           </button>
        </div>
      </header>

      {activeTab === 'users' ? (
        <div className="grid lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-8">
             <Card className="p-6">
                <div className="relative">
                  <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                  <input 
                    placeholder="Search by Identity or Digital Address..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-16 pr-8 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:border-primary outline-none font-bold text-dark transition-all placeholder:text-slate-300"
                  />
                </div>
             </Card>

             <div className="space-y-4">
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="h-24 bg-slate-50 rounded-2xl animate-pulse" />
                  ))
                ) : filteredUsers.length === 0 ? (
                  <div className="py-20 text-center space-y-4">
                    <UserPlus className="w-12 h-12 text-slate-200 mx-auto" />
                    <p className="text-slate-400 font-black uppercase tracking-widest text-sm">No identity records found</p>
                  </div>
                ) : (
                  filteredUsers.map((u) => (
                    <Card key={u.id} className="p-6 flex flex-col md:flex-row items-center justify-between gap-6 group hover:border-primary/20 transition-all">
                       <div className="flex items-center gap-6">
                          <div className="w-14 h-14 bg-dark rounded-2xl flex items-center justify-center font-black text-white text-xl shadow-lg">
                            {u.name?.charAt(0) || u.email?.charAt(0).toUpperCase()}
                          </div>
                          <div>
                             <h3 className="font-black text-dark text-lg uppercase tracking-tight">{u.name}</h3>
                             <p className="text-slate-400 text-xs font-medium">{u.email}</p>
                          </div>
                       </div>
                       
                       <div className="flex items-center gap-6">
                          <div className="flex flex-col items-end">
                             <Badge variant={u.role === 'super_admin' ? 'primary' : (u.role === 'user' ? 'info' : 'success')}>
                               {u.role || 'user'}
                             </Badge>
                             <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mt-2">Active Role</p>
                          </div>
                          
                          <select 
                            value={u.role || 'user'}
                            onChange={(e) => handleRoleChange(u.id, e.target.value)}
                            disabled={updating === u.id}
                            className="bg-slate-50 border border-slate-100 px-4 py-3 rounded-xl outline-none font-black text-[10px] uppercase tracking-widest text-dark focus:border-primary transition-all disabled:opacity-50"
                          >
                             {ROLES.map(r => (
                               <option key={r.id} value={r.id}>{r.label}</option>
                             ))}
                          </select>

                          {updating === u.id && <Loader2 className="w-5 h-5 animate-spin text-primary" />}
                       </div>
                    </Card>
                  ))
                )}
             </div>
          </div>

          <aside className="space-y-8">
             <Card className="p-8 space-y-6 bg-slate-900 border-slate-800">
                <div className="flex items-center gap-3 text-white font-black uppercase tracking-tight text-lg">
                   <Shield className="w-6 h-6 text-primary" />
                   <span>RBAC Protocol</span>
                </div>
                <div className="space-y-6">
                   {ROLES.map(r => (
                     <div key={r.id} className="space-y-1">
                        <div className="flex items-center justify-between">
                           <span className="text-primary font-black text-[10px] uppercase tracking-widest">{r.label}</span>
                           <span className="text-[8px] text-slate-500 font-black uppercase">Level {r.id === 'super_admin' ? '0' : '1'}</span>
                        </div>
                        <p className="text-slate-400 text-[10px] font-medium leading-relaxed">{r.desc}</p>
                     </div>
                   ))}
                </div>
             </Card>

             <Card className="p-8 space-y-4">
                <div className="flex items-center gap-3 text-dark font-black uppercase tracking-tight">
                   <Info className="w-5 h-5 text-primary" />
                   <span>Security Notice</span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed font-medium">
                  Role modifications take effect immediately in Firestore, but users may need to force a <span className="text-dark font-black">Token Refresh</span> (Re-login) to update their local Custom Claims session.
                </p>
                <div className="pt-4 border-t border-slate-50 flex items-center gap-3 text-red-500">
                   <AlertCircle className="w-4 h-4" />
                   <span className="text-[10px] font-black uppercase tracking-widest">Permanent Audit Tracking Active</span>
                </div>
             </Card>
          </aside>
        </div>
      ) : (
        <Card className="p-0 overflow-hidden">
           <div className="bg-slate-50 px-10 py-6 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-lg font-black text-dark uppercase tracking-tight flex items-center gap-3">
                 <History className="w-5 h-5 text-primary" />
                 Operational History
              </h2>
              <Badge variant="info">Immutable Chain</Badge>
           </div>
           <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-50 bg-slate-50/50">
                    <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Timestamp</th>
                    <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Operator</th>
                    <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Action</th>
                    <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Target Identity</th>
                    <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">New Protocol</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-20 text-center text-slate-300 font-bold italic uppercase tracking-widest">No audit data captured</td>
                    </tr>
                  ) : logs.map((log) => (
                    <tr key={log.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                      <td className="px-10 py-6 font-mono text-[10px] text-slate-500 whitespace-nowrap">
                        {new Date(log.timestamp?.seconds * 1000).toLocaleString()}
                      </td>
                      <td className="px-10 py-6 font-black text-dark text-[10px] uppercase tracking-tight">{log.changedBy}</td>
                      <td className="px-10 py-6">
                         <Badge variant="primary" className="text-[8px]">{log.action}</Badge>
                      </td>
                      <td className="px-10 py-6 font-medium text-slate-500 text-[10px]">{log.targetUid}</td>
                      <td className="px-10 py-6">
                         <Badge variant="success" className="text-[10px]">{log.newRole}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
           </div>
        </Card>
      )}
    </div>
  );
}
