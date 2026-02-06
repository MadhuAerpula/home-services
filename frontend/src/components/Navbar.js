import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

function Navbar({ transparent = false }) {
  return (
    <nav className={`sticky top-0 z-50 w-full border-b ${transparent ? 'bg-white/80 backdrop-blur-xl' : 'bg-white'} border-slate-200`}>
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-2" data-testid="home-link">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xl">H</span>
          </div>
          <span className="text-xl font-bold text-slate-900">HomePros</span>
        </Link>
        
        <div className="hidden md:flex items-center space-x-8">
          <Link to="/services" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors" data-testid="services-nav-link">
            Services
          </Link>
          <Link to="/login" data-testid="login-nav-link">
            <Button variant="ghost" className="text-slate-700">Login</Button>
          </Link>
          <Link to="/register" data-testid="register-nav-link">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-6">Get Started</Button>
          </Link>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;