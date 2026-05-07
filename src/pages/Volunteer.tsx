import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Send, CheckCircle2, Loader2, Sparkles, Heart } from 'lucide-react';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '@/src/lib/firebase';
import { Link } from 'react-router-dom';

export default function Volunteer() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    skills: '',
    availability: '',
    motivation: '',
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await addDoc(collection(db, 'volunteers'), {
        ...formData,
        status: 'pending',
        createdAt: serverTimestamp(),
      });
      setSubmitted(true);
    } catch (err) {
      console.error(err);
      setError('Failed to submit application. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  if (submitted) {
    return (
      <div className="pt-40 pb-20 container-custom flex flex-col items-center justify-center text-center">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="space-y-8 max-w-lg">
          <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-8 border border-primary/20">
            <CheckCircle2 className="text-primary w-12 h-12" />
          </div>
          <h1 className="text-5xl font-black text-dark tracking-tight leading-tight">Civic Duty Registered.</h1>
          <p className="text-slate-500 text-lg leading-relaxed font-medium">
            Your application to join our cohort of change-makers has been received. Our clinical coordinators will review your profile within 48 business hours.
          </p>
          <div className="pt-6">
             <Link to="/" className="btn-primary">Return to Community</Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="pt-20 min-h-screen bg-white">
      <div className="flex flex-col lg:flex-row min-h-[calc(100vh-80px)]">
        {/* Visual Column */}
        <div className="lg:w-1/2 bg-dark p-12 md:p-24 flex flex-col justify-between relative overflow-hidden">
           <div className="relative z-10 space-y-10">
              <div className="badge-green">Join the Cohort</div>
              <h1 className="text-6xl md:text-7xl font-black text-white leading-tight tracking-tight">Deploy Your <br/>Skills for Good.</h1>
              <p className="text-slate-400 text-lg max-w-sm leading-relaxed font-medium">We require dedicated professionals and community members to scale our mental health interventions.</p>
           </div>

           <div className="relative z-10 space-y-6 pt-12">
             {[
               'Resource Logistics',
               'Clinical Support assistant',
               'Community Navigator',
               'Technical Operations'
             ].map((role, idx) => (
                <div key={idx} className="flex items-center gap-4">
                  <div className="w-2 h-2 bg-primary rounded-full group-hover:scale-150 transition-transform" />
                  <span className="text-xs font-black uppercase text-slate-300 tracking-[0.2em]">{role}</span>
                </div>
             ))}
           </div>

           {/* Background Graphic */}
           <div className="absolute -bottom-20 -left-20 text-white font-serif italic text-[15rem] opacity-5 select-none rotate-12">
              VOLUNTEER
           </div>
        </div>

        {/* Form Column */}
        <div className="lg:w-1/2 p-8 md:p-16 lg:p-24 bg-slate-50 flex items-center justify-center border-l border-slate-100">
          <div className="max-w-xl w-full space-y-12">
            <div className="space-y-4">
               <h2 className="text-3xl font-black text-dark tracking-tight uppercase">Operational Intake Form</h2>
               <div className="h-1 w-12 bg-primary" />
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Full Name</label>
                  <input
                    required
                    name="fullName"
                    placeholder="e.g. Thandiwe Zulu"
                    value={formData.fullName}
                    onChange={handleChange}
                    className="w-full px-6 py-4 bg-white border border-slate-100 rounded-xl focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none font-bold text-dark transition-all"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Digital Contact (Email)</label>
                  <input
                    required
                    type="email"
                    name="email"
                    placeholder="name@provider.com"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-6 py-4 bg-white border border-slate-100 rounded-xl focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none font-bold text-dark transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Phone Number</label>
                  <input
                    required
                    name="phone"
                    placeholder="+27 (0) 12 345 6789"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-6 py-4 bg-white border border-slate-100 rounded-xl focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none font-bold text-dark transition-all"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Operational Role</label>
                   <select
                    name="availability"
                    value={formData.availability}
                    onChange={handleChange}
                    className="w-full px-6 py-4 bg-white border border-slate-100 rounded-xl focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none font-bold text-dark transition-all appearance-none"
                  >
                    <option value="">Select Capacity</option>
                    <option value="weekdays">Weekdays (Full Capacity)</option>
                    <option value="weekends">Weekends Only</option>
                    <option value="flexible">Flexible / Remote</option>
                  </select>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Specialized Skillset</label>
                <input
                  placeholder="e.g. Clinical Social Work, Web Architecture, Data Entry"
                  name="skills"
                  value={formData.skills}
                  onChange={handleChange}
                  className="w-full px-6 py-4 bg-white border border-slate-100 rounded-xl focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none font-bold text-dark transition-all"
                />
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Strategic Motivation</label>
                <textarea
                  required
                  name="motivation"
                  rows={4}
                  value={formData.motivation}
                  onChange={handleChange}
                  className="w-full px-6 py-4 bg-white border border-slate-100 rounded-xl focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none font-bold text-dark transition-all resize-none"
                  placeholder="Briefly state why you wish to join this clinical mission..."
                />
              </div>

              {error && <p className="text-red-500 text-xs font-black uppercase tracking-tight">{error}</p>}

              <button
                disabled={loading}
                type="submit"
                className="w-full btn-primary py-6 flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin text-white" />
                ) : (
                  <>
                    <span>Submit Strategic Profile</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
