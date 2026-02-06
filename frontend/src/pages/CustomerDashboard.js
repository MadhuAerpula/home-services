import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import axios from 'axios';
import { toast } from 'sonner';
import { Calendar, Clock, MapPin, LogOut, Star } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

function CustomerDashboard({ user: propUser }) {
  const navigate = useNavigate();
  const [user, setUser] = useState(propUser);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      fetchUser();
    }
    fetchBookings();
  }, []);

  const fetchUser = async () => {
    try {
      const response = await axios.get(`${API}/auth/me`, { withCredentials: true });
      setUser(response.data);
    } catch (error) {
      navigate('/login');
    }
  };

  const fetchBookings = async () => {
    try {
      const response = await axios.get(`${API}/bookings`, { withCredentials: true });
      setBookings(response.data);
    } catch (error) {
      console.error('Failed to fetch bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await axios.post(`${API}/auth/logout`, {}, { withCredentials: true });
      toast.success('Logged out successfully');
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const getStatusBadgeClass = (status) => {
    const classes = {
      'pending': 'status-pending',
      'accepted': 'status-accepted',
      'in_progress': 'status-in_progress',
      'completed': 'status-completed',
      'cancelled': 'status-cancelled'
    };
    return `status-badge ${classes[status] || ''}`;
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2" data-testid="home-link">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">H</span>
            </div>
            <span className="text-xl font-bold text-slate-900">HomePros</span>
          </div>
          <div className="flex items-center space-x-4">
            <Link to="/profile" className="text-right hover:opacity-80 transition-opacity" data-testid="user-profile-link">
              <p className="text-sm font-medium text-slate-900 cursor-pointer hover:text-blue-600">{user?.name}</p>
              <p className="text-xs text-slate-500">{user?.email}</p>
            </Link>
            <Button onClick={handleLogout} variant="ghost" size="sm" data-testid="logout-btn">
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2" data-testid="dashboard-title">My Dashboard</h1>
          <p className="text-slate-600">Manage your bookings and profile</p>
        </div>

        <div className="grid md:grid-cols-4 gap-6 mb-12">
          <Card className="border-slate-200" data-testid="total-bookings-card">
            <CardContent className="p-6">
              <p className="text-sm text-slate-500 mb-1">Total Bookings</p>
              <p className="text-3xl font-bold text-slate-900">{bookings.length}</p>
            </CardContent>
          </Card>

          <Card className="border-slate-200" data-testid="pending-bookings-card">
            <CardContent className="p-6">
              <p className="text-sm text-slate-500 mb-1">Pending</p>
              <p className="text-3xl font-bold text-yellow-600">
                {bookings.filter(b => b.status === 'pending').length}
              </p>
            </CardContent>
          </Card>

          <Card className="border-slate-200" data-testid="active-bookings-card">
            <CardContent className="p-6">
              <p className="text-sm text-slate-500 mb-1">Active</p>
              <p className="text-3xl font-bold text-blue-600">
                {bookings.filter(b => b.status === 'accepted' || b.status === 'in_progress').length}
              </p>
            </CardContent>
          </Card>

          <Card className="border-slate-200" data-testid="completed-bookings-card">
            <CardContent className="p-6">
              <p className="text-sm text-slate-500 mb-1">Completed</p>
              <p className="text-3xl font-bold text-green-600">
                {bookings.filter(b => b.status === 'completed').length}
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="mb-8">
          <Link to="/services">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-8" data-testid="book-new-service-btn">
              Book New Service
            </Button>
          </Link>
        </div>

        <Card className="border-slate-200" data-testid="bookings-list-card">
          <CardHeader>
            <CardTitle>My Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : bookings.length === 0 ? (
              <div className="text-center py-12" data-testid="no-bookings-message">
                <p className="text-slate-600 mb-4">No bookings yet</p>
                <Link to="/services">
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-full">Book Your First Service</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {bookings.map((booking) => (
                  <div key={booking.booking_id} className="border border-slate-200 rounded-lg p-6 hover:shadow-md transition-shadow" data-testid={`booking-${booking.booking_id}`}>
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-semibold text-slate-900 mb-1" data-testid={`booking-service-${booking.booking_id}`}>{booking.service_name}</h3>
                        <span className={getStatusBadgeClass(booking.status)} data-testid={`booking-status-${booking.booking_id}`}>
                          {booking.status.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-sm text-slate-500">ID: {booking.booking_id}</p>
                    </div>

                    <div className="space-y-2 text-sm text-slate-600">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-2" />
                        <span>{booking.scheduled_date}</span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-2" />
                        <span>{booking.scheduled_time}</span>
                      </div>
                      <div className="flex items-start">
                        <MapPin className="w-4 h-4 mr-2 mt-0.5" />
                        <span>{booking.address}</span>
                      </div>
                      {booking.professional_name && (
                        <div className="mt-2 pt-2 border-t border-slate-200">
                          <p className="font-medium">Professional: {booking.professional_name}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default CustomerDashboard;