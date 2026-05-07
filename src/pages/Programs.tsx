import React from 'react';
import { motion } from 'motion/react';
import { ArrowRight, BookOpen, ShieldCheck, HeartHandshake, Users2, BrainCircuit, GraduationCap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/src/lib/utils';

const programs = [
  {
    id: 'resilience',
    title: 'Supporting Resilience Initiative',
    description: 'A comprehensive mental wellness program focused on trauma-informed care and emotional intelligence training for high-school learners in vulnerable communities.',
    icon: BrainCircuit,
    color: 'bg-primary',
    image: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 'educator',
    title: 'Educator Empowerment',
    description: 'Workshops for teachers and school staff to identify signs of mental distress and establish wellness-first classroom environments.',
    icon: GraduationCap,
    color: 'bg-accent',
    image: 'https://images.unsplash.com/photo-1577896851231-70ef14697593?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 'family',
    title: 'Family Wellness Hub',
    description: 'Engaging parents and guardians in the mental health journey of their children, bridging the gap between home and school support.',
    icon: HeartHandshake,
    color: 'bg-dark',
    image: 'https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 'outreach',
    title: 'Community Mental Health Outreach',
    description: 'Mobile support units providing basic counselling and awareness campaigns in rural and underserved townships.',
    icon: Users2,
    color: 'bg-primary',
    image: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&q=80&w=800'
  }
];

export default function Programs() {
  return (
    <div className="pt-20 min-h-screen">
      {/* Header */}
      <section className="bg-slate-50 py-32 border-b border-slate-100">
        <div className="container-custom text-center space-y-8">
           <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="badge-green mx-auto">
             Interventions
           </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-6xl md:text-7xl lg:text-8xl font-black text-dark tracking-tight leading-tight"
          >
            Tactical <span className="text-primary italic font-serif">Support.</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-slate-500 max-w-2xl mx-auto text-lg leading-relaxed font-medium"
          >
            Evidence-based interventions designed to foster resilience and mental well-being across South African communities through professional clinical design.
          </motion.p>
        </div>
      </section>

      {/* Programs List */}
      <section className="section-padding bg-white">
        <div className="container-custom space-y-48">
          {programs.map((program, idx) => (
            <motion.div
              key={program.id}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className={cn(
                "flex flex-col lg:items-center gap-16 lg:gap-32",
                idx % 2 === 0 ? "lg:flex-row" : "lg:flex-row-reverse"
              )}
            >
              <div className="lg:w-1/2 space-y-12">
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className={cn("px-4 py-2 rounded-lg text-white font-black text-xs uppercase tracking-widest shadow-sm", program.color)}>
                      {program.id}
                    </div>
                    <div className="h-px flex-1 bg-slate-100" />
                  </div>
                  <h2 className="text-4xl md:text-5xl font-black text-dark tracking-tight leading-[1.1]">{program.title}</h2>
                  <p className="text-slate-500 text-lg leading-relaxed font-medium">{program.description}</p>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-12">
                  {['Curriculum Support', 'Impact Analytics', 'Trauma Care'].map((feature, fidx) => (
                    <div key={fidx} className="flex items-center space-x-4 group">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full group-hover:scale-150 transition-transform" />
                      <span className="text-xs font-black uppercase text-dark tracking-tight">{feature}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-6">
                  <Link
                    to="/contact"
                    className="btn-primary"
                  >
                    Program Inquiry
                  </Link>
                </div>
              </div>

              <div className="lg:w-1/2 relative p-6 bg-slate-50 rounded-[3rem]">
                <div className="rounded-[2rem] overflow-hidden shadow-2xl relative z-10 border-4 border-white">
                  <img
                    src={program.image}
                    alt={program.title}
                    className="w-full aspect-[4/5] object-cover"
                  />
                </div>
                {/* Visual accent */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] border-[40px] border-white opacity-20 pointer-events-none rounded-[4rem]" />
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA section for schools */}
      <section className="py-32 bg-dark text-white text-center border-t border-slate-800">
        <div className="container-custom space-y-12">
          <div className="badge-green mx-auto">Scalability</div>
          <h2 className="text-5xl md:text-6xl font-black tracking-tight leading-tight">Partner with the <br/>Intelligence Hub.</h2>
          <p className="text-slate-400 max-w-2xl mx-auto font-medium leading-relaxed">Are you a school administrator or community leader? Let's bring our clinical support framework to your institution.</p>
          <div className="pt-8 flex flex-col sm:flex-row justify-center gap-6">
            <Link
              to="/contact"
              className="btn-secondary text-white border-white/20 hover:bg-white/10"
            >
              Institutional Partnerships
            </Link>
            <Link
              to="/donate"
              className="btn-primary"
            >
              Sponsor Interventions
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}


