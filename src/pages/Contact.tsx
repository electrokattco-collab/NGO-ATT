import React, { useState } from 'react';
import { motion } from 'motion/react';
import { MapPin, Phone, Mail, Send, Loader2, CheckCircle2, MessageSquare, HelpCircle } from 'lucide-react';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '@/src/lib/firebase';
import { Link } from 'react-router-dom';

const faqs = [
  {
    q: 'How can a school partner with ATT NGO?',
    a: 'Simply fill out the contact form or email our partnerships team at partnerships@att-ngo.org.za and we will arrange an introductory presentation.'
  },
  {
    q: 'Are donations tax-deductible?',
    a: 'Yes, we are a registered NPO/PBO and can provide section 18A tax certificates for all donations above R500.'
  },
  {
    q: 'Do you offer individual counselling?',
    a: 'Our primary focus is group interventions and community workshops, but we do provide referrals to partner clinics for individual clinical cases.'
  }
];

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addDoc(collection(db, 'contactMessages'), {
        ...formData,
        createdAt: serverTimestamp(),
      });
      setSubmitted(true);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="pt-40 pb-20 container-custom flex flex-col items-center justify-center text-center">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="space-y-8 max-w-lg">
          <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-8 border border-primary/20">
            <CheckCircle2 className="text-primary w-12 h-12" />
          </div>
          <h1 className="text-5xl font-black text-dark tracking-tight leading-tight">Inquiry Logged.</h1>
          <p className="text-slate-500 text-lg leading-relaxed font-medium">
            Your message has been successfully transmitted to our communications hub. Expect a clinical or operational response within 24 business hours.
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
      {/* Hero Header */}
      <section className="bg-slate-50 py-32 border-b border-slate-100">
        <div className="container-custom text-center space-y-8">
           <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="badge-green mx-auto">
             Communications Hub
           </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-6xl md:text-7xl lg:text-8xl font-black text-dark tracking-tight leading-tight"
          >
            Open <span className="text-primary italic font-serif secondary-font">Channels.</span>
          </motion.h1>
          <p className="text-slate-500 max-w-xl mx-auto text-lg leading-relaxed font-medium">Have a strategic inquiry or want to support our mission? We prioritize high-impact collaborations.</p>
        </div>
      </section>

      {/* Main Content */}
      <section className="section-padding bg-white">
        <div className="container-custom">
          <div className="grid lg:grid-cols-3 gap-24 items-start">
            {/* Contact Info */}
            <div className="lg:col-span-1 space-y-12">
              <div className="space-y-10">
                <div className="space-y-4">
                   <h2 className="text-2xl font-black text-dark uppercase tracking-tight">Institutional Registry</h2>
                   <div className="h-1 w-12 bg-primary" />
                </div>
                
                <div className="space-y-8">
                  {[
                    { label: 'Headquarters', value: '123 Community Lane, Sandton,\nJohannesburg, 2196', icon: MapPin },
                    { label: 'Direct Line', value: '+27 11 456 7890', icon: Phone },
                    { label: 'Operational Email', value: 'info@att-ngo.org.za', icon: Mail },
                  ].map((item, idx) => (
                    <div key={idx} className="flex flex-col gap-2">
                      <div className="flex items-center gap-3">
                         <item.icon className="w-4 h-4 text-primary" />
                         <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{item.label}</span>
                      </div>
                      <p className="text-sm font-bold text-dark whitespace-pre-line leading-relaxed">{item.value}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-1 bg-slate-50 rounded-[2rem] overflow-hidden shadow-sm border border-slate-100">
                <div className="aspect-square grayscale rounded-[1.8rem] overflow-hidden opacity-80 hover:opacity-100 transition-opacity">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d114620.15585098314!2d27.940560751319246!3d-26.135402030013915!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x1e950c406086f685%3A0xc6cb1279fd750835!2sSandton%2C%20South%20Africa!5e0!3m2!1sen!2sus!4v1714392439243!5m2!1sen!2sus"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <div className="bg-slate-50 p-8 md:p-16 rounded-[3rem] border border-slate-100">
                <div className="space-y-4 mb-12">
                   <h3 className="text-3xl font-black text-dark tracking-tight uppercase">Transmission Form</h3>
                   <div className="h-1 w-12 bg-primary" />
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sender Identifying Name</label>
                      <input
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-6 py-4 bg-white border border-slate-100 rounded-xl focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none font-bold text-dark transition-all"
                        placeholder="e.g. Thandiwe Zulu"
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Return Digital Address</label>
                      <input
                        required
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-6 py-4 bg-white border border-slate-100 rounded-xl focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none font-bold text-dark transition-all"
                        placeholder="name@organization.com"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Subject Classification</label>
                    <input
                      required
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="w-full px-6 py-4 bg-white border border-slate-100 rounded-xl focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none font-bold text-dark transition-all"
                      placeholder="e.g. Partnership Opportunity"
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Inquiry Context</label>
                    <textarea
                      required
                      rows={6}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="w-full px-6 py-4 bg-white border border-slate-100 rounded-xl focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none font-bold text-dark transition-all resize-none"
                      placeholder="Discuss the details of your inquiry here..."
                    />
                  </div>

                  <button
                    disabled={loading}
                    type="submit"
                    className="w-full btn-primary py-6 flex items-center justify-center gap-3 disabled:opacity-50"
                  >
                    {loading ? (
                      <Loader2 className="w-5 h-5 animate-spin text-white" />
                    ) : (
                      <>
                        <span>Transmit Message</span>
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-32 bg-slate-50 border-t border-slate-100">
        <div className="container-custom">
          <div className="text-center mb-20 space-y-4">
             <div className="badge-green mx-auto">Knowledge base</div>
            <h2 className="text-4xl font-black text-dark tracking-tight">Intelligence Repository</h2>
          </div>
          
          <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4">
            {faqs.map((faq, idx) => (
              <motion.div 
                key={idx}
                whileHover={{ y: -5 }}
                className="bg-white p-10 rounded-2xl border border-slate-100 shadow-sm space-y-4"
              >
                <h4 className="font-black text-dark uppercase tracking-tight leading-relaxed">
                  {faq.q}
                </h4>
                <p className="text-xs text-slate-500 font-medium leading-relaxed">{faq.a}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
