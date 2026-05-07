import React from 'react';
import { motion } from 'motion/react';
import { Target, Heart, Eye, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const values = [
  {
    title: 'Trust',
    description: 'Building honest relationships with our beneficiaries and partners.',
    icon: CheckCircle2,
  },
  {
    title: 'Hope',
    description: 'Instilling a positive outlook for a brighter mental wellness future.',
    icon: Heart,
  },
  {
    title: 'Inclusivity',
    description: 'Ensuring our programs are accessible to all learners.',
    icon: Eye,
  },
  {
    title: 'Innovation',
    description: 'Adopting modern techniques for community engagement.',
    icon: Target,
  },
];

export default function About() {
  return (
    <div className="pt-20 min-h-screen">
      {/* Intro Header */}
      <section className="bg-dark text-white py-32 relative overflow-hidden">
        <div className="container-custom relative z-10 text-center space-y-8">
           <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="badge-green mx-auto">
             Established 2018
           </motion.div>
          <motion.h1
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-6xl md:text-7xl lg:text-8xl font-black text-white leading-tight tracking-tight"
          >
            The <span className="text-primary italic font-serif secondary-font">Story</span> <br/>Behind The Impact.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-slate-400 max-w-2xl mx-auto text-lg leading-relaxed font-medium"
          >
            We bridge the gap in mental health support for learners in South Africa's most underserved communities through radical empathy and professional clinical design.
          </motion.p>
        </div>
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[100px]" />
      </section>

      {/* Story Section */}
      <section className="section-padding bg-white">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
            <div className="space-y-10">
              <div className="space-y-4">
                <div className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Our Genesis</div>
                <h2 className="text-4xl md:text-5xl font-black text-dark leading-tight">Bridging the Gap Between Learning and Wellness.</h2>
                <div className="h-1.5 w-16 bg-primary" />
              </div>
              <p className="text-slate-500 leading-relaxed text-lg font-medium">
                Awaken Thrive Transform (ATT) NGO was founded with a singular vision: to address the often-overlooked emotional barriers that prevent learners from reaching their full potential.
              </p>
              <p className="text-slate-500 leading-relaxed font-medium">
                We recognized that academic certificates mean little if a learner is mentally exhausted or traumatized. Our objective is to provide the "emotional infrastructure" that supports sustainable growth in every partner school we serve.
              </p>
              
              <div className="grid grid-cols-2 gap-12 pt-6">
                <div className="space-y-2">
                  <h4 className="text-4xl font-black text-dark tracking-tighter">42+</h4>
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Partner Schools</p>
                </div>
                <div className="space-y-2">
                  <h4 className="text-4xl font-black text-dark tracking-tighter">1.5k</h4>
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Direct Beneficiaries</p>
                </div>
              </div>
            </div>
            
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative p-4 bg-slate-50 rounded-[2.5rem]"
            >
              <div className="rounded-3xl overflow-hidden shadow-2xl border-4 border-white">
                <img
                  src="https://images.unsplash.com/photo-1517048676732-d65bc937f902?auto=format&fit=crop&q=80&w=1000"
                  alt="Team collaborating"
                  className="w-full aspect-square object-cover"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-32 bg-slate-50 border-y border-slate-100">
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
            <motion.div
              whileHover={{ y: -5 }}
              className="bg-white p-14 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-start space-y-8"
            >
              <div className="w-16 h-16 bg-primary/5 rounded-2xl flex items-center justify-center">
                <Target className="text-primary w-8 h-8" />
              </div>
              <div className="space-y-4">
                <h3 className="text-3xl font-black text-dark uppercase tracking-tight">Our Mission</h3>
                <p className="text-slate-500 font-medium leading-relaxed">
                  To provide holistic mental wellness interventions that empower learners to overcome systemic challenges, build professional resilience, and transform their local communities.
                </p>
              </div>
            </motion.div>
            
            <motion.div
              whileHover={{ y: -5 }}
              className="bg-white p-14 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-start space-y-8"
            >
              <div className="w-16 h-16 bg-primary/5 rounded-2xl flex items-center justify-center">
                <Heart className="text-primary w-8 h-8" />
              </div>
              <div className="space-y-4">
                <h3 className="text-3xl font-black text-dark uppercase tracking-tight">Our Vision</h3>
                <p className="text-slate-500 font-medium leading-relaxed">
                  A generation of resilient, emotionally healthy South African leaders who are equipped to thrive in hyper-competitive academic, personal, and professional global spaces.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="section-padding bg-white">
        <div className="container-custom">
          <div className="mb-20 space-y-4 text-center">
            <div className="badge-green mx-auto">Core Architecture</div>
            <h2 className="text-4xl md:text-5xl font-black text-dark tracking-tight">The Pillars of Our Operations</h2>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {values.map((value, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                viewport={{ once: true }}
                className="p-10 rounded-2xl bg-slate-50 border border-transparent hover:border-primary/20 hover:bg-white hover:shadow-xl transition-all group flex flex-col gap-6"
              >
                <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center shadow-sm text-primary group-hover:bg-primary group-hover:text-white transition-all">
                  <value.icon className="w-6 h-6" />
                </div>
                <div className="space-y-2">
                  <h4 className="text-lg font-black text-dark uppercase tracking-tight">{value.title}</h4>
                  <p className="text-xs text-slate-500 leading-relaxed font-medium">{value.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Preview */}
      <section className="section-padding bg-dark text-white border-t border-slate-800">
        <div className="container-custom">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-20 gap-8">
            <div className="space-y-4">
              <div className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Leadership</div>
              <h2 className="text-5xl font-black tracking-tight">Meet the Architects.</h2>
              <p className="text-slate-400 max-w-xl font-medium leading-relaxed">A dedicated cohort of professionals bridging clinicial psychiatry, social work, and digital NGO management.</p>
            </div>
            
            <Link to="/contact" className="btn-secondary text-white border-white/20 hover:bg-white/10 shrink-0">
               Join our Team
            </Link>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="group cursor-pointer">
                <div className="relative aspect-[3/4] overflow-hidden rounded-2xl mb-6 bg-slate-800">
                  <img
                    src={`https://i.pravatar.cc/400?img=${i + 20}`}
                    alt="Team member"
                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700 opacity-60 group-hover:opacity-100"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-dark/90 via-transparent to-transparent opacity-60 group-hover:opacity-100 transition-opacity" />
                  <div className="absolute inset-x-0 bottom-0 p-8">
                    <p className="text-primary text-[10px] font-black tracking-[0.2em] uppercase mb-1">Directorate</p>
                    <h4 className="text-xl font-black text-white tracking-tight uppercase">Thandiwe Zulu</h4>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
