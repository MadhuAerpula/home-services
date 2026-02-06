import React from 'react';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Wrench, Clock, Shield, Star } from 'lucide-react';

function Home() {
  const services = [
    { id: 'electrician', name: 'Electrician', icon: '⚡', image: 'https://images.unsplash.com/photo-1751486289947-4f5f5961b3aa?crop=entropy&cs=srgb&fm=jpg&q=85' },
    { id: 'plumber', name: 'Plumber', icon: '🔧', image: 'https://images.pexels.com/photos/8488058/pexels-photo-8488058.jpeg' },
    { id: 'carpenter', name: 'Carpenter', icon: '🪚', image: 'https://images.unsplash.com/photo-1676250747209-eee2d728da64?crop=entropy&cs=srgb&fm=jpg&q=85' },
    { id: 'ac_repair', name: 'AC Repair', icon: '❄️', image: 'https://images.unsplash.com/photo-1755127761410-0c00c398c308?crop=entropy&cs=srgb&fm=jpg&q=85' },
    { id: 'washing_machine', name: 'Washing Machine', icon: '🧺', image: 'https://images.unsplash.com/photo-1755127761410-0c00c398c308?crop=entropy&cs=srgb&fm=jpg&q=85' },
    { id: 'refrigerator', name: 'Refrigerator', icon: '🧊', image: 'https://images.unsplash.com/photo-1755127761410-0c00c398c308?crop=entropy&cs=srgb&fm=jpg&q=85' },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar transparent />
      
      <section className="py-24 px-6 bg-white" data-testid="hero-section">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-5xl md:text-6xl font-bold text-slate-900 mb-6 leading-tight">
              Professional Home Services at Your Doorstep
            </h1>
            <p className="text-lg text-slate-600 mb-8 leading-relaxed">
              Book trusted professionals for all your home repair and maintenance needs. Fast, reliable, and hassle-free service.
            </p>
            <div className="flex gap-4">
              <Link to="/services" data-testid="browse-services-btn">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-8 py-6 text-lg font-semibold shadow-lg hover:shadow-xl transition-all">
                  Browse Services
                </Button>
              </Link>
              <Link to="/register" data-testid="become-professional-btn">
                <Button variant="outline" className="border-slate-200 hover:bg-slate-50 rounded-full px-8 py-6 text-lg font-medium">
                  Become a Professional
                </Button>
              </Link>
            </div>
          </div>
          <div className="relative">
            <img 
              src="https://images.unsplash.com/photo-1597665863042-47e00964d899?crop=entropy&cs=srgb&fm=jpg&q=85" 
              alt="Modern living room" 
              className="rounded-2xl shadow-2xl w-full h-[500px] object-cover"
            />
          </div>
        </div>
      </section>

      <section className="py-24 px-6" data-testid="services-section">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">Our Services</h2>
            <p className="text-lg text-slate-600">Expert professionals for every home need</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service) => (
              <Link to="/services" key={service.id} data-testid={`service-card-${service.id}`}>
                <div className="service-card group cursor-pointer">
                  <div className="w-full h-48 mb-6 rounded-xl overflow-hidden">
                    <img 
                      src={service.image} 
                      alt={service.name} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="text-center">
                    <div className="text-4xl mb-3">{service.icon}</div>
                    <h3 className="text-xl font-semibold text-slate-900">{service.name}</h3>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 px-6 bg-white" data-testid="features-section">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">Why Choose HomePros?</h2>
            <p className="text-lg text-slate-600">Trusted by thousands of homeowners</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center" data-testid="feature-verified">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Verified Professionals</h3>
              <p className="text-slate-600">All service providers are background checked and verified</p>
            </div>
            
            <div className="text-center" data-testid="feature-booking">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Easy Booking</h3>
              <p className="text-slate-600">Book services in just a few clicks with instant confirmation</p>
            </div>
            
            <div className="text-center" data-testid="feature-quality">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Wrench className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Quality Service</h3>
              <p className="text-slate-600">Professional-grade tools and guaranteed quality work</p>
            </div>
            
            <div className="text-center" data-testid="feature-rated">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Top Rated</h3>
              <p className="text-slate-600">4.8+ average rating from satisfied customers</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 px-6 bg-blue-600" data-testid="cta-section">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Ready to Get Started?</h2>
          <p className="text-xl text-blue-100 mb-8">Book your first service today and experience the difference</p>
          <Link to="/register" data-testid="cta-register-btn">
            <Button className="bg-white text-blue-600 hover:bg-slate-50 rounded-full px-10 py-6 text-lg font-semibold shadow-lg">
              Create Account
            </Button>
          </Link>
        </div>
      </section>

      <footer className="py-12 px-6 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-slate-400">&copy; 2025 HomePros. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default Home;