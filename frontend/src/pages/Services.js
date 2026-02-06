import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import axios from 'axios';
import { Search } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

function Services() {
  const [services, setServices] = useState([]);
  const [filteredServices, setFilteredServices] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchServices();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = services.filter(service =>
        service.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredServices(filtered);
    } else {
      setFilteredServices(services);
    }
  }, [searchTerm, services]);

  const fetchServices = async () => {
    try {
      const response = await axios.get(`${API}/services`);
      setServices(response.data);
      setFilteredServices(response.data);
    } catch (error) {
      console.error('Failed to fetch services:', error);
    } finally {
      setLoading(false);
    }
  };

  const getServiceIcon = (name) => {
    const icons = {
      'Electrician': '⚡',
      'Plumber': '🔧',
      'Carpenter': '🪚',
      'AC Repair': '❄️',
      'Washing Machine': '🧺',
      'Refrigerator': '🧊',
      'RO / Water Purifier': '💧',
      'Microwave': '🍳',
      'Geyser': '🔥',
      'Chimney & Hob': '🍳',
      'Mobile Repair': '📱'
    };
    return icons[name] || '🔧';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="flex items-center justify-center py-24">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4" data-testid="services-page-title">Our Services</h1>
          <p className="text-lg text-slate-600 mb-8">Browse all available home services</p>
          
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
            <Input
              type="text"
              placeholder="Search services..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
              data-testid="search-services-input"
            />
          </div>
        </div>

        {filteredServices.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-600">No services found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" data-testid="services-grid">
            {filteredServices.map((service) => (
              <div key={service.category_id} className="service-card" data-testid={`service-item-${service.category_id}`}>
                <div className="text-5xl mb-4">{service.icon || getServiceIcon(service.name)}</div>
                <h3 className="text-2xl font-semibold text-slate-900 mb-2">{service.name}</h3>
                <p className="text-slate-600 mb-4">{service.description}</p>
                <div className="space-y-2 mb-6">
                  <p className="text-sm text-slate-700">
                    <span className="font-semibold">Price:</span> {service.price_range}
                  </p>
                  <p className="text-sm text-slate-700">
                    <span className="font-semibold">Duration:</span> {service.estimated_time}
                  </p>
                </div>
                <Link to={`/services/${service.category_id}`} data-testid={`view-details-${service.category_id}`}>
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-full">
                    View Details
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Services;