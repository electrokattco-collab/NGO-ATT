import React from 'react';
import { motion } from 'motion/react';
import { Heart, Users, Target, ArrowRight, Shield, Zap, Star, PlayCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/src/utils';
import { Button } from '@/src/components/ui/Button';
import { Card } from '@/src/components/ui/Card';
import { Badge } from '@/src/components/ui/Badge';
import { ROUTES } from '@/src/constants';

const fadeIn = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.8 }
};

const stats = [
  { label: 'Learners Supported', value: '15,000+', icon: Heart, description: 'Direct mental wellness interventions.' },
  { label: 'Scale Factor', value: '120+', icon: Target, description: 'Partnering schools across 3 provinces.' },
  { label: 'Strategic Partners', value: '85+', icon: Star, description: 'High-impact corporate & local sponsors.' },
  { label: 'Corps Strength', value: '2.5k', icon: Users, description: 'Mobilized volunteers in the field.' },
];

export default function Home() {
  return (
    <div className="overflow-hidden bg-white">
      {/* Strategic Hero Section */}
      <section className="relative min-h-[95vh] flex flex-col lg:flex-row items-stretch border-b border-slate-100">
        <div className="lg:w-1/2 p-8 md:p-16 lg:p-24 xl:p-32 flex flex-col justify-center gap-12 relative z-10 pt-40 lg:pt-0">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-3"
          >
            <Badge variant="primary">Operational Directive 2026</Badge>
            <span className="h-px w-8 bg-slate-200" />
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">NPO: IT000123/2026</span>
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-6xl md:text-8xl lg:text-[7.5rem] font-black leading-[0.9] tracking-tighter text-dark uppercase italic font-serif"
          >
            Awaken.<br/>
            Thrive.<br/>
            <span className="text-primary not-italic font-sans">Transform.</span>
          </motion.h1>
          
          <motion.p
            {...fadeIn}
            className="text-xl text-slate-500 max-w-xl leading-relaxed font-medium"
          >
            Engineering high-resilience mental wellness ecosystems for South African learners. We bridge the clinical gap between trauma and potential.
          </motion.p>
          
          <motion.div
            {...fadeIn}
            className="flex flex-col sm:flex-row items-center gap-6 pt-6"
          >
            <Link to={ROUTES.VOLUNTEER} className="w-full sm:w-auto">
              <Button size="xl" className="w-full group">
                Join the Mission
                <ArrowRight className="ml-3 w-5 h-5 group-hover:translate-x-2 transition-transform" />
              </Button>
            </Link>
            <Link to={ROUTES.ABOUT} className="w-full sm:w-auto">
               <button className="flex items-center gap-3 text-sm font-black text-dark uppercase tracking-widest p-5 hover:gap-6 transition-all group">
                 <div className="w-12 h-12 rounded-full border-2 border-slate-100 flex items-center justify-center group-hover:border-primary transition-colors">
                    <PlayCircle className="w-6 h-6 text-primary" />
                 </div>
                 Explore Strategy
               </button>
            </Link>
          </motion.div>
        </div>

        <div className="lg:w-1/2 relative bg-dark overflow-hidden min-h-[500px] lg:min-h-0">
          {/* Kinetic Elements */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
             <motion.div 
               animate={{ rotate: 360 }}
               transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
               className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] aspect-square border border-white/5 rounded-full"
             />
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] aspect-square border border-white/5 rounded-full" />
             <div className="absolute inset-0 bg-gradient-to-tr from-dark via-dark/80 to-transparent" />
          </div>

          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.8, duration: 1 }}
            className="absolute bottom-20 left-10 md:left-20 z-20"
          >
             <Card className="bg-white/10 backdrop-blur-xl border-white/10 p-8 space-y-4 max-w-xs text-white">
                <div className="flex items-center gap-3">
                   <Shield className="w-8 h-8 text-primary" />
                   <p className="font-black uppercase tracking-tight text-xl">Trust Metrics</p>
                </div>
                <p className="text-xs text-white/60 font-medium leading-relaxed">System validated by 42 school districts. 98% intervention success rate in mental resilience cohorts.</p>
                <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden mt-6">
                   <motion.div 
                     initial={{ width: 0 }}
                     whileInView={{ width: '98%' }}
                     transition={{ duration: 1.5, delay: 1 }}
                     className="h-full bg-primary" 
                   />
                </div>
             </Card>
          </motion.div>

          <img
            src="https://images.unsplash.com/photo-1542810634-71277d95dcbb?auto=format&fit=crop&q=80&w=1200"
            alt="Impact"
            className="w-full h-full object-cover mix-blend-luminosity opacity-40 grayscale"
          />
        </div>
      </section>

      {/* Intelligence Grid - Impact Counters */}
      <section className="py-32 bg-white relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
            {stats.map((stat, idx) => (
              <motion.div
                key={idx}
                {...fadeIn}
                transition={{ delay: idx * 0.1 }}
                className="space-y-6"
              >
                <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center border border-slate-100 group">
                   <stat.icon className="w-7 h-7 text-primary transition-transform group-hover:scale-110" />
                </div>
                <div className="space-y-2">
                  <div className="text-5xl font-black text-dark tracking-tighter leading-none italic font-serif group-hover:not-italic transition-all">{stat.value}</div>
                  <div className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">{stat.label}</div>
                  <p className="text-slate-400 text-xs font-medium leading-relaxed">{stat.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Emotional Narrative Section */}
      <section className="py-40 bg-slate-50 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-32 items-center">
           <div className="space-y-12 relative z-10">
              <div className="space-y-6">
                <Badge variant="success">The Problem Statement</Badge>
                <h2 className="text-5xl md:text-7xl font-black text-dark uppercase tracking-tighter leading-none italic font-serif">
                  A Quiet Crisis. <br/><span className="text-primary not-italic font-sans">A Strategic Response.</span>
                </h2>
                <p className="text-slate-500 text-xl leading-relaxed font-medium">
                  In South Africa, 75% of youth requiring mental health support do not receive it. ATT NGO deploys targeted interventions directly into the learning ecosystem to reverse this vector.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                 {[
                   { title: 'Clinical Precision', desc: 'Protocol-driven support cohorts.', icon: Zap },
                   { title: 'Community Trust', desc: 'Indigenous-led delivery systems.', icon: Shield },
                 ].map((item, idx) => (
                   <div key={idx} className="space-y-4">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                         <item.icon className="w-5 h-5 text-primary" />
                      </div>
                      <h4 className="font-black text-dark uppercase tracking-tight">{item.title}</h4>
                      <p className="text-slate-500 text-xs font-medium leading-relaxed">{item.desc}</p>
                   </div>
                 ))}
              </div>

              <div className="pt-8">
                <Link to={ROUTES.PROGRAMS}>
                  <Button variant="outline" size="xl">Examine our blueprints</Button>
                </Link>
              </div>
           </div>

           <div className="relative">
              <div className="aspect-[4/5] rounded-[4rem] overflow-hidden shadow-3xl shadow-slate-200/50 relative border-8 border-white group">
                 <img 
                   src="https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&q=80&w=1000" 
                   alt="Mission" 
                   className="w-full h-full object-cover grayscale brightness-90 group-hover:grayscale-0 group-hover:brightness-100 transition-all duration-1000"
                 />
                 <div className="absolute inset-0 bg-primary/10 mix-blend-overlay" />
              </div>
              <div className="absolute -bottom-16 -right-16 w-64 h-64 bg-primary rounded-full blur-[100px] opacity-20 pointer-events-none" />
           </div>
        </div>
      </section>

      {/* Dynamic CTAs */}
      <section className="py-32 bg-white">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-12">
            <Card className="bg-dark p-16 space-y-8 group relative overflow-hidden">
               <div className="relative z-10 space-y-6">
                  <Badge variant="primary" className="bg-white/10 border-white/20 text-white">Corps Deployment</Badge>
                  <h3 className="text-4xl font-black text-white uppercase tracking-tighter italic font-serif leading-none">Become a <br/>Strategic Ally.</h3>
                  <p className="text-slate-400 font-medium">Join our field operators in delivering critical care to underprivileged cohorts.</p>
                  <Link to={ROUTES.VOLUNTEER} className="inline-block pt-6">
                    <Button variant="primary" size="lg" className="px-12">Apply Now</Button>
                  </Link>
               </div>
               <div className="absolute top-0 right-0 p-10 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Users className="w-40 h-40 text-white rotate-12" />
               </div>
            </Card>

            <Card className="bg-primary p-16 space-y-8 group relative overflow-hidden">
               <div className="relative z-10 space-y-6">
                  <Badge variant="primary" className="bg-white/20 border-white/30 text-white">Capital Infusion</Badge>
                  <h3 className="text-4xl font-black text-white uppercase tracking-tighter italic font-serif leading-none">Invest in <br/>Strategic Future.</h3>
                  <p className="text-white/80 font-medium">Scalable funding models for long-term clinical interventions and school programs.</p>
                  <Link to={ROUTES.DONATIONS} className="inline-block pt-6">
                    <Button variant="outline" size="lg" className="px-12 bg-white text-primary border-white hover:bg-white/90">Donate Capital</Button>
                  </Link>
               </div>
               <div className="absolute top-0 right-0 p-10 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Heart className="w-40 h-40 text-white -rotate-12" />
               </div>
            </Card>
        </div>
      </section>
    </div>
  );
}
