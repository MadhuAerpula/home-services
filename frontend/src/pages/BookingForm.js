import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import axios from 'axios';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

function BookingForm({ user }) {
  const { categoryId } = useParams();
  const navigate = useNavigate();
  const [service, setService] = useState(null);
  const [formData, setFormData] = useState({
    address: '',
    scheduled_date: '',
    scheduled_time: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchService();
  }, [categoryId]);

  const fetchService = async () => {
    try {
      const response = await axios.get(`${API}/services/${categoryId}`);
      setService(response.data);
    } catch (error) {
      console.error('Failed to fetch service:', error);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(
        `${API}/bookings`,
        {
          service_category_id: categoryId,
          address: formData.address,
          scheduled_date: formData.scheduled_date,
          scheduled_time: formData.scheduled_time
        },
        { withCredentials: true }
      );

      toast.success('Booking created successfully! We will notify you via SMS.');
      navigate('/dashboard/customer');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to create booking');
    } finally {
      setLoading(false);
    }
  };

  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  if (!service) {
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
      
      <div className="max-w-3xl mx-auto px-6 py-12">
        <Card className="border-slate-200 shadow-lg" data-testid="booking-form-card">
          <CardHeader>
            <CardTitle className="text-3xl">Book {service.name}</CardTitle>
            <p className="text-slate-600 mt-2">Fill in the details to schedule your service</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="bg-slate-100 rounded-lg p-6">
                <h3 className="font-semibold text-slate-900 mb-2">Service Details</h3>
                <p className="text-sm text-slate-600 mb-1">Price: {service.price_range}</p>
                <p className="text-sm text-slate-600">Duration: {service.estimated_time}</p>
              </div>

              <div>
                <Label htmlFor="address">Service Address *</Label>
                <Textarea
                  id="address"
                  name="address"
                  placeholder="Enter your complete address"
                  value={formData.address}
                  onChange={handleChange}
                  required
                  className="mt-1 h-24"
                  data-testid="address-input"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="scheduled_date">Preferred Date *</Label>
                  <Input
                    id="scheduled_date"
                    name="scheduled_date"
                    type="date"
                    value={formData.scheduled_date}
                    onChange={handleChange}
                    min={getMinDate()}
                    required
                    className="mt-1"
                    data-testid="date-input"
                  />
                </div>

                <div>
                  <Label htmlFor="scheduled_time">Preferred Time *</Label>
                  <Input
                    id="scheduled_time"
                    name="scheduled_time"
                    type="time"
                    value={formData.scheduled_time}
                    onChange={handleChange}
                    required
                    className="mt-1"
                    data-testid="time-input"
                  />
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-900">
                  <strong>Note:</strong> You will receive SMS notifications about your booking status.
                  {user?.phone ? ` Notifications will be sent to ${user.phone}` : ' Please add your phone number in your profile to receive SMS updates.'}
                </p>
              </div>

              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(-1)}
                  className="flex-1"
                  data-testid="cancel-btn"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                  disabled={loading}
                  data-testid="submit-booking-btn"
                >
                  {loading ? 'Creating Booking...' : 'Confirm Booking'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default BookingForm;