import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Facebook, Instagram, Twitter, ChevronRight } from 'lucide-react';
import { ROUTES, APP_SHORT_NAME } from '@/src/constants';

const footerLinks = [
  { name: 'Home', path: ROUTES.HOME },
  { name: 'About', path: ROUTES.ABOUT },
  { name: 'Programs', path: ROUTES.PROGRAMS },
  { name: 'Volunteer', path: ROUTES.VOLUNTEER },
  { name: 'Donations', path: ROUTES.DONATIONS },
  { name: 'Contact', path: ROUTES.CONTACT },
];

export const Footer = () => {
  return (
    <footer className="bg-dark text-white pt-32 pb-16">
      <div className="max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-20">
        <div className="space-y-10">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
              <Heart className="text-white w-7 h-7" />
            </div>
            <span className="text-2xl font-black tracking-tight">{APP_SHORT_NAME}</span>
          </div>
          <p className="text-slate-400 text-sm leading-relaxed font-medium">
            "Awaken. Thrive. Transform."<br />
            Empowering South African learners through mental wellness initiatives and strategic community engagement.
          </p>
          <div className="flex space-x-6">
            {[Facebook, Instagram, Twitter].map((Icon, idx) => (
              <Icon key={idx} className="w-5 h-5 cursor-pointer hover:text-primary transition-colors text-slate-500" />
            ))}
          </div>
        </div>

        <div>
           <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mb-10">Quick Links</p>
          <ul className="space-y-4">
            {footerLinks.map((link) => (
              <li key={link.path}>
                <Link to={link.path} className="text-sm font-bold text-slate-400 hover:text-white transition-colors">{link.name}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mb-10">Intelligence</p>
          <ul className="space-y-4">
            <li><Link to={ROUTES.PROGRAMS} className="text-sm font-bold text-slate-400 hover:text-white">Mental Wellness</Link></li>
            <li><Link to={ROUTES.PROGRAMS} className="text-sm font-bold text-slate-400 hover:text-white">Clinical Interventions</Link></li>
            <li><Link to={ROUTES.PROGRAMS} className="text-sm font-bold text-slate-400 hover:text-white">Educator Empowerment</Link></li>
            <li><Link to={ROUTES.PROGRAMS} className="text-sm font-bold text-slate-400 hover:text-white">Resource Logistics</Link></li>
          </ul>
        </div>

        <div className="space-y-8">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mb-10">Transmissions</p>
          <p className="text-sm text-slate-400 font-medium">Join our strategic distribution list for cohort updates.</p>
          <form className="flex group">
            <input
              type="email"
              placeholder="Email address"
              className="bg-slate-900 border border-slate-800 rounded-l-xl px-6 py-4 text-sm w-full focus:outline-none focus:border-primary transition-colors"
            />
            <button className="bg-primary rounded-r-xl px-6 py-4 hover:bg-primary/90 transition-all flex items-center justify-center">
              <ChevronRight className="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-6 md:px-12 mt-32 pt-10 border-t border-slate-900 text-center">
        <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest leading-loose">
          &copy; {new Date().getFullYear()} Awaken Thrive Transform NGO. Operational data encrypted. <br/>
          NPO Reg: IT000123/2026/ZA
        </p>
      </div>
    </footer>
  );
}
