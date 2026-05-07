import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, Heart, CheckCircle2, ArrowLeft, Zap, Star, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';
import { firebaseService } from '@/src/services/firebaseService';
import { paymentService } from '@/src/services/paymentService';
import { COLLECTIONS, ROUTES } from '@/src/constants';
import { cn } from '@/src/utils';
import { Button } from '@/src/components/ui/Button';
import { Badge } from '@/src/components/ui/Badge';

export default function Donations() {
  const [amount, setAmount] = useState<number | string>(100);
  const [frequency, setFrequency] = useState<'once' | 'monthly'>('monthly');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const predefinedAmounts = [150, 350, 750, 1500];

  const handleDonation = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // In a real production app, we would initiate the gateway here
      const intent = {
        amount: Number(amount),
        currency: 'ZAR',
        metadata: {
          donorEmail: 'pending@user.com', // Would come from form or auth
          donorName: 'Anonymous Supporter',
          donationType: frequency === 'once' ? 'one-time' : 'monthly' as const
        }
      };

      // Tactical simulation of payment gateway redirect
      await new Promise(resolve => setTimeout(resolve, 1500));

      await firebaseService.addDoc(COLLECTIONS.DONATIONS, {
        amount: Number(amount),
        donationType: intent.metadata.donationType,
        transactionReference: `ATT-${Date.now()}`,
        status: 'completed'
      });
      
      setSuccess(true);
    } catch (error) {
      console.error('Strategic transaction failure:', error);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="pt-40 pb-20 container-custom flex flex-col items-center justify-center text-center">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="space-y-10 max-w-xl">
          <div className="w-28 h-28 bg-green-50 rounded-[2rem] flex items-center justify-center mx-auto mb-8 border-4 border-white shadow-xl shadow-green-100">
            <Heart className="text-primary w-12 h-12 fill-primary animate-pulse" />
          </div>
          <h1 className="text-6xl font-black text-dark tracking-tighter uppercase leading-none italic font-serif">Impact Registered.</h1>
          <p className="text-slate-500 text-lg leading-relaxed font-medium">
            Strategic capital deployment confirmed. Your contribution directly funds mental health interventions in high-priority cohorts across 42 partner schools.
          </p>
          <div className="pt-10 flex flex-col sm:flex-row gap-6 justify-center">
             <Link to={ROUTES.HOME}><Button size="lg">Return to Hub</Button></Link>
             <Link to={ROUTES.BLOG}><Button variant="outline" size="lg">View Impact Reports</Button></Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="pt-20 min-h-screen bg-white">
      <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[calc(100vh-80px)]">
        {/* Visual Column - Strategic Narrative */}
        <div className="hidden lg:block relative bg-dark overflow-hidden">
          <div className="absolute inset-0 z-20 p-24 flex flex-col justify-between">
            <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} className="space-y-10">
              <Badge variant="primary" className="bg-white/10 border-white/20 text-white">Strategic Capital Infusion</Badge>
              <h1 className="text-7xl font-black text-white leading-[0.95] tracking-tighter uppercase italic font-serif">
                Invest in the <br/><span className="text-primary not-italic font-sans">Learner mind.</span>
              </h1>
              <p className="text-slate-400 text-xl max-w-sm leading-relaxed font-medium">
                Scaling mental wellness interventions through data-driven resource allocation. 
              </p>
            </motion.div>

            <div className="grid grid-cols-2 gap-12 relative z-20">
               {[
                 { label: 'Tactical ROI', value: '100%', icon: Shield },
                 { label: 'Direct Field Impact', value: '92c/R', icon: Zap }
               ].map((item, idx) => (
                 <div key={idx} className="space-y-4">
                    <item.icon className="w-8 h-8 text-primary" />
                    <div className="flex flex-col">
                      <span className="text-5xl font-black text-white tracking-tighter italic font-serif">{item.value}</span>
                      <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">{item.label}</span>
                    </div>
                 </div>
               ))}
            </div>
          </div>
          
          <div className="absolute -top-20 -right-20 w-96 h-96 bg-primary rounded-full blur-[150px] opacity-20" />
          
          <img 
            src="https://images.unsplash.com/photo-1542810634-71277d95dcbb?auto=format&fit=crop&q=80&w=1200" 
            className="absolute inset-0 w-full h-full object-cover opacity-20 filter grayscale scale-110"
            alt="Impact Visualization"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-dark via-dark/40 to-transparent z-10" />
        </div>

        {/* Form Column - Transaction Engine */}
        <div className="p-8 md:p-16 lg:p-24 xl:p-32 flex flex-col justify-center bg-white border-l border-slate-100 relative">
           <div className="max-w-md w-full mx-auto space-y-16">
              <div className="space-y-4">
                <Link to={ROUTES.HOME} className="inline-flex items-center text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-primary transition-colors gap-3 mb-6 group">
                  <ArrowLeft className="w-4 h-4 group-hover:-translate-x-2 transition-transform" />
                  Abort Operation
                </Link>
                <Badge variant="info">Support Matrix</Badge>
                <h2 className="text-4xl font-black text-dark tracking-tighter uppercase leading-none italic font-serif">Select Support Level</h2>
              </div>

              <form onSubmit={handleDonation} className="space-y-12">
                {/* Frequency - Strategic Selection */}
                <div className="flex p-2 bg-slate-50 rounded-2xl border border-slate-100">
                  <button
                    type="button"
                    onClick={() => setFrequency('monthly')}
                    className={cn(
                      'flex-1 py-4 text-xs font-black uppercase tracking-widest rounded-xl transition-all',
                      frequency === 'monthly' ? 'bg-white shadow-xl text-primary' : 'text-slate-400 hover:text-slate-600'
                    )}
                  >
                    Sustainable Monthly
                  </button>
                  <button
                    type="button"
                    onClick={() => setFrequency('once')}
                    className={cn(
                      'flex-1 py-4 text-xs font-black uppercase tracking-widest rounded-xl transition-all',
                      frequency === 'once' ? 'bg-white shadow-xl text-primary' : 'text-slate-400 hover:text-slate-600'
                    )}
                  >
                    Tactical Once
                  </button>
                </div>

                {/* Amounts Grid */}
                <div className="grid grid-cols-2 gap-6">
                  {predefinedAmounts.map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setAmount(amt)}
                      className={cn(
                        'p-8 rounded-3xl border-2 transition-all flex flex-col items-center justify-center gap-2 relative overflow-hidden group',
                        amount === amt ? 'border-primary bg-primary/5' : 'border-slate-50 hover:border-slate-200 bg-slate-50/50'
                      )}
                    >
                      <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest group-hover:text-primary transition-colors">Amount (ZAR)</span>
                      <span className={cn('text-3xl font-black italic font-serif', amount === amt ? 'text-primary' : 'text-dark')}>R{amt}</span>
                    </button>
                  ))}
                  <div className="col-span-2 relative">
                    <span className="absolute left-8 top-1/2 -translate-y-1/2 font-black text-slate-300 text-xl italic font-serif">R</span>
                    <input
                      type="number"
                      placeholder="Custom Tactical Amount"
                      value={amount === '' ? '' : (predefinedAmounts.includes(Number(amount)) ? '' : amount)}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full pl-14 pr-8 py-6 bg-slate-50 border-2 border-slate-50 rounded-3xl focus:border-primary outline-none font-black text-xl text-dark transition-all placeholder:text-slate-300"
                    />
                  </div>
                </div>

                <div className="space-y-6">
                   <p className="text-[10px] font-black uppercase text-slate-400 text-center tracking-[0.2em] leading-relaxed">
                     SECURE STRATEGIC CLEARANCE VIA GATEWAY (YOCO / PAYFAST) <br/>
                     <span className="text-primary/40">256-BIT ENCRYPTION ACTIVE</span>
                   </p>
                   <Button
                    type="submit"
                    size="xl"
                    className="w-full rounded-3xl py-8 flex items-center justify-center gap-4"
                    isLoading={loading}
                  >
                    <ShieldCheck className="w-6 h-6" />
                    <span>Authorize Transaction</span>
                  </Button>
                </div>
              </form>

              <div className="pt-12 border-t border-slate-50 flex items-start gap-6">
                <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center shrink-0 border border-slate-100">
                  <Star className="text-primary w-6 h-6 fill-primary/20" />
                </div>
                <div className="space-y-2">
                  <p className="text-[11px] text-slate-500 leading-relaxed italic font-medium">
                    "ATT NGO's transparent allocation system ensures our corporate social investment reaches the ground where it matters most."
                  </p>
                  <p className="font-black text-dark uppercase tracking-widest text-[9px]">— Strategic Partner, Gauteng Educational Cohort</p>
                </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
