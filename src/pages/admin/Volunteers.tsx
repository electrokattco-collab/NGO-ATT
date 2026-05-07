import React from 'react';
import { Mail, Phone, Trash2, Check, X, Search, Filter } from 'lucide-react';
import { firebaseService } from '@/src/services/firebaseService';
import { COLLECTIONS } from '@/src/constants';
import { formatDate, cn } from '@/src/utils';
import { useCollection } from '@/src/hooks/useCollection';
import { Card } from '@/src/components/ui/Card';
import { Badge } from '@/src/components/ui/Badge';
import { Button } from '@/src/components/ui/Button';
import { Input } from '@/src/components/ui/Input';
import { Volunteer } from '@/src/types';
import { orderBy } from 'firebase/firestore';

export default function AdminVolunteers() {
  const { data: volunteers, loading, error } = useCollection<Volunteer>(COLLECTIONS.VOLUNTEERS, {
    constraints: [orderBy('createdAt', 'desc')],
    realtime: true
  });

  const [searchTerm, setSearchTerm] = React.useState('');

  const updateStatus = async (id: string, status: Volunteer['status']) => {
    try {
      await firebaseService.updateDoc(COLLECTIONS.VOLUNTEERS, id, { status });
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const deleteVolunteer = async (id: string) => {
    // In production we should use a custom modal
    if (window.confirm('IRREVERSIBLE: Are you sure you want to delete this operational profile?')) {
      try {
        await firebaseService.deleteDoc(COLLECTIONS.VOLUNTEERS, id);
      } catch (error) {
        console.error('Error deleting volunteer:', error);
      }
    }
  };

  const filteredVolunteers = volunteers.filter(vol => 
    vol.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vol.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vol.skills?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (error) return <div className="p-20 text-center text-red-500 font-black">CRITICAL SYSTEM ERROR: {error.message}</div>;

  return (
    <div className="space-y-12 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div className="space-y-4">
          <Badge variant="info">Human Capital</Badge>
          <h1 className="text-4xl font-black text-dark tracking-tight uppercase">Operational <br/>Deployments</h1>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <div className="relative w-full sm:w-80 group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary transition-colors" />
            <Input 
              placeholder="Search by name, email or skills..." 
              className="pl-14"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="outline" size="sm" className="w-full sm:w-auto h-[58px]">
             <Filter className="w-4 h-4 mr-2" />
             Filters
          </Button>
        </div>
      </div>

      <Card className="p-0 overflow-hidden border-b-4 border-b-primary/10">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-slate-400 font-black uppercase text-[10px] tracking-widest border-b border-slate-100">
                <th className="px-10 py-6">Operator identity</th>
                <th className="px-10 py-6">Digital contact</th>
                <th className="px-10 py-6">Capabilities</th>
                <th className="px-10 py-6">Status</th>
                <th className="px-10 py-6 text-right">Strategic Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={5} className="px-10 py-8"><div className="h-4 bg-slate-100 rounded w-full" /></td>
                  </tr>
                ))
              ) : filteredVolunteers.map((vol) => (
                <tr key={vol.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-10 py-8">
                    <div className="space-y-1">
                      <p className="font-black text-dark text-sm uppercase tracking-tight">{vol.fullName}</p>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">
                        Registered {formatDate(vol.createdAt, 'MMM dd, yyyy')}
                      </p>
                    </div>
                  </td>
                  <td className="px-10 py-8">
                    <div className="flex flex-col space-y-2">
                      <a href={`mailto:${vol.email}`} className="flex items-center space-x-2 text-primary font-bold text-xs hover:underline decoration-2 underline-offset-4">
                        <Mail className="w-3.5 h-3.5" />
                        <span>{vol.email}</span>
                      </a>
                      <a href={`tel:${vol.phone}`} className="flex items-center space-x-2 text-slate-400 font-bold text-xs">
                        <Phone className="w-3.5 h-3.5" />
                        <span>{vol.phone}</span>
                      </a>
                    </div>
                  </td>
                  <td className="px-10 py-8">
                    <div className="space-y-2 max-w-xs">
                      <p className="font-bold text-dark text-xs truncate uppercase tracking-tight" title={vol.skills}>{vol.skills || 'GENERAL_OPS'}</p>
                      <Badge variant="primary" className="bg-slate-100 border-none text-slate-500">{vol.availability || 'FLEXIBLE'}</Badge>
                    </div>
                  </td>
                  <td className="px-10 py-8">
                    <Badge variant={
                      vol.status === 'pending' ? 'warning' : 
                      vol.status === 'accepted' ? 'success' : 'error'
                    }>
                      {vol.status}
                    </Badge>
                  </td>
                  <td className="px-10 py-8 text-right">
                    <div className="flex items-center justify-end space-x-3">
                      {vol.status === 'pending' && (
                        <>
                          <button 
                            onClick={() => updateStatus(vol.id, 'accepted')}
                            className="p-3 bg-green-50 text-green-600 rounded-xl hover:bg-green-600 hover:text-white transition-all shadow-sm border border-green-100"
                            title="Authorize"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => updateStatus(vol.id, 'rejected')}
                            className="p-3 bg-amber-50 text-amber-600 rounded-xl hover:bg-amber-600 hover:text-white transition-all shadow-sm border border-amber-100"
                            title="Decline"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </>
                      )}
                      <button 
                        onClick={() => deleteVolunteer(vol.id)}
                        className="p-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition-all shadow-sm border border-red-100"
                        title="Purge"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!loading && filteredVolunteers.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-10 py-24 text-center text-slate-400 font-black uppercase tracking-[0.2em] italic">No active deployments match the search query.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
