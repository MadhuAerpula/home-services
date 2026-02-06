import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import axios from 'axios';
import { Clock, DollarSign, ArrowLeft } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

function ServiceDetail() {
  const { categoryId } = useParams();
  const navigate = useNavigate();
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchService();
  }, [categoryId]);

  const fetchService = async () => {
    try {
      const response = await axios.get(`${API}/services/${categoryId}`);
      setService(response.data);
    } catch (error) {
      console.error('Failed to fetch service:', error);
    } finally {
      setLoading(false);
    }
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

  if (!service) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-6 py-12">
          <p className="text-center text-slate-600">Service not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      
      <div className="max-w-5xl mx-auto px-6 py-12">
        <Link to="/services" className="inline-flex items-center text-blue-600 hover:underline mb-6" data-testid="back-to-services">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Services
        </Link>

        <Card className="border-slate-200 shadow-lg" data-testid="service-detail-card">
          <CardContent className="p-8">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <div className="text-6xl mb-6">{service.icon}</div>
                <h1 className="text-4xl font-bold text-slate-900 mb-4" data-testid="service-name">{service.name}</h1>
                <p className="text-lg text-slate-600 mb-6" data-testid="service-description">{service.description}</p>
                
                <div className="space-y-4 mb-8">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <DollarSign className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Price Range</p>
                      <p className="text-lg font-semibold text-slate-900" data-testid="service-price">{service.price_range}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <Clock className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Estimated Time</p>
                      <p className="text-lg font-semibold text-slate-900" data-testid="service-time">{service.estimated_time}</p>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={() => navigate(`/book/${categoryId}`)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-full py-6 text-lg font-semibold"
                  data-testid="book-now-btn"
                >
                  Book Now
                </Button>
              </div>

              <div>
                <div className="bg-slate-100 rounded-2xl p-8">
                  <h3 className="text-xl font-semibold text-slate-900 mb-4">What's Included</h3>
                  <ul className="space-y-3">
                    <li className="flex items-start">
                      <span className="text-blue-600 mr-2">✓</span>
                      <span className="text-slate-700">Professional service by verified technicians</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-600 mr-2">✓</span>
                      <span className="text-slate-700">All necessary tools and equipment</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-600 mr-2">✓</span>
                      <span className="text-slate-700">30-day service guarantee</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-600 mr-2">✓</span>
                      <span className="text-slate-700">Transparent pricing with no hidden charges</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-600 mr-2">✓</span>
                      <span className="text-slate-700">SMS notifications for booking updates</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default ServiceDetail;