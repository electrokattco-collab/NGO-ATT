import React, { useEffect, useState } from 'react';
import { 
  Users, 
  Heart, 
  MessageSquare, 
  TrendingUp, 
  Calendar,
  AlertCircle,
  ArrowUpRight,
  TrendingDown,
} from 'lucide-react';
import { orderBy, limit } from 'firebase/firestore';
import { firebaseService } from '@/src/services/firebaseService';
import { COLLECTIONS } from '@/src/constants';
import { formatDate, cn } from '@/src/utils';
import { Card } from '@/src/components/ui/Card';
import { Badge } from '@/src/components/ui/Badge';
import { Volunteer } from '@/src/types';

export default function AdminOverview() {
  const [stats, setStats] = useState({
    volunteers: 0,
    donations: 0,
    totalDonated: 0,
    messages: 0,
  });
  const [recentVolunteers, setRecentVolunteers] = useState<Volunteer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        // In a real app, these would be cached or aggregated via cloud functions
        const [volunteers, donations, messages] = await Promise.all([
          firebaseService.getCollection(COLLECTIONS.VOLUNTEERS),
          firebaseService.getCollection<any>(COLLECTIONS.DONATIONS),
          firebaseService.getCollection(COLLECTIONS.CONTACT_MESSAGES),
        ]);

        const totalD = donations.reduce((acc, doc) => acc + (doc.amount || 0), 0);

        setStats({
          volunteers: volunteers.length,
          donations: donations.length,
          totalDonated: totalD,
          messages: messages.length,
        });

        // Fetch recent applicants
        const recent = await firebaseService.getCollection<Volunteer>(COLLECTIONS.VOLUNTEERS, [
          orderBy('createdAt', 'desc'),
          limit(5)
        ]);
        setRecentVolunteers(recent);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const cards = [
    { label: 'Active Corps', value: stats.volunteers, icon: Users, color: 'text-primary', bg: 'bg-primary/5', trend: '+12%' },
    { label: 'Pending Inquiries', value: stats.messages, icon: MessageSquare, color: 'text-indigo-600', bg: 'bg-indigo-50', trend: '+5' },
    { label: 'Transaction Count', value: stats.donations, icon: Heart, color: 'text-rose-600', bg: 'bg-rose-50', trend: '+18%' },
    { label: 'Strategic Capital', value: `R${stats.totalDonated.toLocaleString()}`, icon: TrendingUp, color: 'text-amber-600', bg: 'bg-amber-50', trend: '+24%' },
  ];

  if (loading) {
    return (
      <div className="space-y-16 animate-pulse">
        <div className="h-20 bg-slate-100 rounded-3xl w-1/3" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-40 bg-slate-50 rounded-[2.5rem]" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 h-96 bg-slate-50 rounded-[3rem]" />
          <div className="h-96 bg-slate-50 rounded-[3rem]" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-16 pb-20">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8">
        <div className="space-y-4">
          <Badge variant="success">Operational Dashboard</Badge>
          <h1 className="text-5xl font-black text-dark tracking-tight leading-tight uppercase">
            Intelligence <br/>Overview
          </h1>
        </div>
        <div className="flex items-center space-x-3 text-[10px] font-black uppercase tracking-widest bg-slate-50 px-6 py-3 rounded-full border border-slate-100 text-slate-400">
          <Calendar className="w-4 h-4 text-primary" />
          <span>{formatDate(new Date(), 'eeee, dd MMMM')}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, idx) => (
          <Card key={idx} hoverable className="space-y-6">
            <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 shadow-sm", card.bg, card.color)}>
              <card.icon className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center justify-between">
                <p className="text-slate-400 text-[10px] font-black tracking-[0.2em] uppercase">{card.label}</p>
                <span className="text-[10px] font-bold text-green-500 bg-green-50 px-2 py-0.5 rounded-full">{card.trend}</span>
              </div>
              <h3 className="text-3xl font-black text-dark mt-2 tracking-tight">{card.value}</h3>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
               <h3 className="text-2xl font-black text-dark uppercase tracking-tight">Recent Deployments</h3>
               <div className="h-1 w-8 bg-primary rounded-full" />
            </div>
            <button className="text-[10px] font-black uppercase tracking-widest text-primary hover:tracking-[0.2em] transition-all">Audit All</button>
          </div>
          
          <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden border-b-4 border-b-primary/10">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50 text-slate-400 font-black uppercase text-[10px] tracking-widest border-b border-slate-100">
                    <th className="px-10 py-6">Operator</th>
                    <th className="px-10 py-6">Capability</th>
                    <th className="px-10 py-6">Status</th>
                    <th className="px-10 py-6 text-right">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {recentVolunteers.map((vol) => (
                    <tr key={vol.id} className="hover:bg-slate-50/50 transition-colors group cursor-pointer">
                      <td className="px-10 py-8">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-dark rounded-xl flex items-center justify-center font-black text-white text-xs group-hover:bg-primary transition-all shadow-lg">
                            {vol.fullName.charAt(0)}
                          </div>
                          <span className="font-bold text-dark text-sm">{vol.fullName}</span>
                        </div>
                      </td>
                      <td className="px-10 py-8 text-slate-500 font-bold text-xs uppercase tracking-tight">{vol.skills || 'GENERALIST'}</td>
                      <td className="px-10 py-8">
                        <Badge variant={vol.status === 'pending' ? 'warning' : 'success'}>
                          {vol.status}
                        </Badge>
                      </td>
                      <td className="px-10 py-8 text-right text-slate-400 font-black text-[10px] uppercase tracking-widest leading-none">
                        {formatDate(vol.createdAt)}
                      </td>
                    </tr>
                  ))}
                  {recentVolunteers.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-10 py-24 text-center text-slate-400 font-bold italic">Operational records empty.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="space-y-10">
          <div className="flex items-center gap-4">
             <h3 className="text-2xl font-black text-dark uppercase tracking-tight">Intelligence</h3>
             <div className="h-1 w-8 bg-primary rounded-full" />
          </div>
          
          <div className="space-y-6">
            <Card className="bg-dark border-slate-800 flex flex-col gap-6 relative overflow-hidden group p-8">
              <AlertCircle className="w-10 h-10 text-primary mb-2 transition-transform group-hover:scale-110" />
              <div className="space-y-3 relative z-10">
                <p className="font-black text-white uppercase tracking-tight text-xl">Unresolved Intercepts</p>
                <p className="text-slate-400 text-xs font-medium leading-relaxed">System has flagged {stats.messages} inbound messages requiring strategic response.</p>
                <button className="flex items-center space-x-2 text-[10px] font-black text-primary uppercase tracking-widest pt-4 group-hover:gap-4 transition-all focus:outline-none">
                  <span>Execute Review</span>
                  <ArrowUpRight className="w-4 h-4" />
                </button>
              </div>
              <div className="absolute -bottom-10 -right-10 text-white/5 font-serif italic text-9xl select-none">!</div>
            </Card>
            
            <Card hoverable className="flex flex-col gap-6 p-8">
              <TrendingUp className="w-10 h-10 text-green-600 mb-2 transition-transform group-hover:scale-110" />
              <div className="space-y-3">
                <p className="font-black text-dark uppercase tracking-tight text-xl">Growth Vector</p>
                <p className="text-slate-500 text-xs font-medium leading-relaxed">Donation velocity has accelerated by 15% in this epoch.</p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
