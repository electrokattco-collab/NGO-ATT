import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { motion, AnimatePresence } from 'motion/react';
import { auth } from '@/src/lib/firebase';
import { useAuth } from '@/src/context/AuthContext';
import { cn } from '@/src/utils';
import { ROUTES } from '@/src/constants';
import { Button } from '@/src/components/ui/Button';

const navLinks = [
  { name: 'Home', path: ROUTES.HOME },
  { name: 'About', path: ROUTES.ABOUT },
  { name: 'Programs', path: ROUTES.PROGRAMS },
  { name: 'Volunteer', path: ROUTES.VOLUNTEER },
  { name: 'Donations', path: ROUTES.DONATIONS },
  { name: 'Contact', path: ROUTES.CONTACT },
];

export const Navbar = () => {
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
            'text-xl font-black uppercase tracking-tight',
            scrolled ? 'text-dark' : 'text-white lg:text-white text-dark'
          )}>
            ATT <span className={cn(scrolled ? 'text-primary' : 'text-white')}>NGO</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden lg:flex items-center space-x-8">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={cn(
                'text-xs font-black transition-colors uppercase tracking-widest',
                scrolled ? 'text-slate-600 hover:text-primary' : 'text-white/80 hover:text-white',
                location.pathname === link.path && (scrolled ? 'text-primary' : 'text-white underline decoration-2 underline-offset-8')
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
                  to={ROUTES.ADMIN.DASHBOARD}
                  className="text-[10px] font-black uppercase tracking-[0.2em] text-primary hover:text-primary/80"
                >
                  Systems
                </Link>
              )}
              <button
                onClick={handleLogout}
                className={cn(
                  'text-[10px] font-black uppercase tracking-[0.2em]',
                  scrolled ? 'text-slate-400 hover:text-dark' : 'text-white/50 hover:text-white'
                )}
              >
                Logout
              </button>
            </div>
          ) : (
            <button
              onClick={handleLogin}
              className={cn(
                'text-[10px] font-black uppercase tracking-[0.2em] transition-colors',
                scrolled ? 'text-slate-600 hover:text-primary' : 'text-white/70 hover:text-white'
              )}
            >
              Access
            </button>
          )}

          <Link to={ROUTES.DONATIONS}>
            <Button size="sm">Donate</Button>
          </Link>
        </div>

        {/* Mobile Toggle */}
        <button
          className="lg:hidden text-primary"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Open menu"
          data-testid="mobile-menu" 
        >
          {isOpen ? <X className="text-dark" /> : <Menu className={cn(scrolled ? 'text-dark' : 'text-dark lg:text-white')} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="lg:hidden fixed inset-0 bg-white z-[100] pointer-events-auto py-24 px-8 flex flex-col"
            style={{ visibility: isOpen ? 'visible' : 'hidden' }}
          >
            <button 
              onClick={() => setIsOpen(false)} 
              className="absolute top-6 right-6 z-[110] pointer-events-auto"
              aria-label="Close menu"
            >
              <X className="w-8 h-8 text-primary" />
            </button>
            <nav className="flex flex-col space-y-6 pointer-events-auto">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className="text-4xl font-black text-dark hover:text-primary uppercase tracking-tighter pointer-events-auto relative z-[110]"
                  tabIndex={0}
                >
                  {link.name}
                </Link>
              ))}
            </nav>
            <div className="pt-8 pointer-events-auto">
              <Link 
                to={ROUTES.DONATIONS} 
                onClick={() => setIsOpen(false)}
                className="pointer-events-auto relative z-[110] block"
              >
                <Button className="w-full py-6 text-xl">DONATE</Button>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};