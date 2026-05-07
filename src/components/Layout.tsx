import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Heart, Facebook, Instagram, Twitter, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/src/lib/utils';
import { useAuth } from '@/src/context/AuthContext';
import { auth } from '@/src/lib/firebase';
import { signOut, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

const navLinks = [
  { name: 'Home', path: '/' },
  { name: 'About', path: '/about' },
  { name: 'Programs', path: '/programs' },
  { name: 'Events', path: '/events' },
  { name: 'Gallery', path: '/gallery' },
  { name: 'Contact', path: '/contact' },
];

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, isAdmin } = useAuth();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <nav className={cn(
      'fixed top-0 left-0 right-0 z-50 transition-all duration-300 h-20 flex items-center border-b',
      scrolled ? 'bg-white border-slate-200 shadow-sm' : 'bg-white lg:bg-transparent border-transparent'
    )}>
      <div className="max-w-7xl mx-auto px-6 md:px-10 flex items-center justify-between w-full">
        <Link to="/" className="flex items-center space-x-3 group">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center transition-transform group-hover:rotate-12">
            <div className="w-5 h-5 border-2 border-white rotate-45" />
          </div>
          <span className={cn(
            'text-xl font-heading font-bold uppercase tracking-tight',
            scrolled ? 'text-dark' : 'text-white lg:text-white text-dark'
          )}>
            ATT <span className="text-primary lg:text-white">NGO</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden lg:flex items-center space-x-8">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={cn(
                'text-sm font-bold transition-colors uppercase tracking-tight',
                scrolled ? 'text-slate-600 hover:text-primary' : 'text-white/80 hover:text-white',
                location.pathname === link.path && (scrolled ? 'text-primary' : 'text-white font-black underline decoration-2 underline-offset-8')
              )}
            >
              {link.name}
            </Link>
          ))}
          <div className="h-4 w-px bg-slate-300/30" />
          {user ? (
            <div className="flex items-center space-x-6">
              {isAdmin && (
                <Link
                  to="/admin"
                  className="text-xs font-black uppercase tracking-widest text-primary hover:text-primary/80"
                >
                  Admin
                </Link>
              )}
              <button
                onClick={handleLogout}
                className={cn(
                  'text-xs font-black uppercase tracking-widest',
                  scrolled ? 'text-slate-500 hover:text-dark' : 'text-white/70 hover:text-white'
                )}
              >
                Logout
              </button>
            </div>
          ) : (
            <button
              onClick={handleLogin}
              className={cn(
                'text-xs font-black uppercase tracking-widest px-4 py-2 rounded border transition-all',
                scrolled ? 'text-slate-600 border-slate-200 hover:bg-slate-50' : 'text-white border-white/20 hover:bg-white/10'
              )}
            >
              Login
            </button>
          )}
          <Link
            to="/donate"
            className="px-6 py-2 bg-primary text-white rounded shadow-md hover:bg-primary-hover transition-all text-sm font-bold"
          >
            Donate
          </Link>
        </div>

        {/* Mobile Toggle */}
        <button
          className="lg:hidden text-primary"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X className={scrolled ? 'text-dark' : 'text-dark lg:text-white'} /> : <Menu className={scrolled ? 'text-dark' : 'text-dark lg:text-white'} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            className="lg:hidden fixed inset-0 bg-white z-[60] py-24 px-8 flex flex-col space-y-6"
          >
            <button onClick={() => setIsOpen(false)} className="absolute top-6 right-6">
              <X className="w-8 h-8 text-primary" />
            </button>
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className="text-3xl font-black text-dark hover:text-primary"
              >
                {link.name}
              </Link>
            ))}
            <div className="pt-8">
              <Link
                to="/donate"
                onClick={() => setIsOpen(false)}
                className="grid place-items-center w-full py-5 rounded-lg bg-primary text-white font-black text-xl"
              >
                DONATE
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

export function Footer() {
  return (
    <footer className="bg-dark text-white pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
        <div className="space-y-6">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
              <Heart className="text-white w-6 h-6" />
            </div>
            <span className="text-xl font-heading font-bold">ATT NGO</span>
          </div>
          <p className="text-gray-400 text-sm leading-relaxed">
            "Awaken. Thrive. Transform."<br />
            Empowering South African learners through mental wellness initiatives and community engagement.
          </p>
          <div className="flex space-x-4">
            <Facebook className="w-5 h-5 cursor-pointer hover:text-accent" />
            <Instagram className="w-5 h-5 cursor-pointer hover:text-accent" />
            <Twitter className="w-5 h-5 cursor-pointer hover:text-accent" />
          </div>
        </div>

        <div>
          <h4 className="text-lg font-heading font-semibold mb-6">Quick Links</h4>
          <ul className="space-y-4 text-sm text-gray-400">
            {navLinks.map((link) => (
              <li key={link.path}>
                <Link to={link.path} className="hover:text-accent transition-colors">{link.name}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-lg font-heading font-semibold mb-6">Programs</h4>
          <ul className="space-y-4 text-sm text-gray-400">
            <li><Link to="/programs" className="hover:text-accent">Mental Wellness</Link></li>
            <li><Link to="/programs" className="hover:text-accent">School Interventions</Link></li>
            <li><Link to="/programs" className="hover:text-accent">Educator Empowerment</Link></li>
            <li><Link to="/programs" className="hover:text-accent">Family Engagement</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-lg font-heading font-semibold mb-6">Newsletter</h4>
          <p className="text-sm text-gray-400 mb-4">Stay updated with our latest news and events.</p>
          <form className="flex">
            <input
              type="email"
              placeholder="Email address"
              className="bg-gray-800 border-none rounded-l-lg px-4 py-2 text-sm w-full focus:ring-1 focus:ring-accent"
            />
            <button className="bg-primary rounded-r-lg px-4 py-2">
              <ChevronRight className="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-6 md:px-12 mt-20 pt-8 border-t border-gray-800 text-center text-xs text-gray-500">
        <p>&copy; {new Date().getFullYear()} Awaken Thrive Transform NGO. All rights reserved. NPO Reg: [Registration Number]</p>
      </div>
    </footer>
  );
}
