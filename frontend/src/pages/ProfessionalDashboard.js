import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import axios from 'axios';
import { toast } from 'sonner';
import { Calendar, Clock, MapPin, LogOut, DollarSign, CheckCircle, XCircle } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

function ProfessionalDashboard({ user: propUser }) {
  const navigate = useNavigate();
  const [user, setUser] = useState(propUser);
  const [bookings, setBookings] = useState([]);
  const [availableBookings, setAvailableBookings] = useState([]);
  const [earnings, setEarnings] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      fetchUser();
    }
    fetchData();
  }, []);

  const fetchUser = async () => {
    try {
      const response = await axios.get(`${API}/auth/me`, { withCredentials: true });
      setUser(response.data);
    } catch (error) {
      navigate('/login');
    }
  };

  const fetchData = async () => {
    try {
      const [bookingsRes, availableRes, earningsRes] = await Promise.all([
        axios.get(`${API}/bookings`, { withCredentials: true }),
        axios.get(`${API}/professionals/available-bookings`, { withCredentials: true }),
        axios.get(`${API}/professionals/earnings`, { withCredentials: true })
      ]);
      
      setBookings(bookingsRes.data);
      setAvailableBookings(availableRes.data);
      setEarnings(earningsRes.data);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (bookingId) => {
    try {
      await axios.put(`${API}/bookings/${bookingId}/accept`, {}, { withCredentials: true });
      toast.success('Booking accepted! Customer will be notified via SMS.');
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to accept booking');
    }
  };

  const handleReject = async (bookingId) => {
    try {
      await axios.put(`${API}/bookings/${bookingId}/reject`, {}, { withCredentials: true });
      toast.success('Booking rejected');
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to reject booking');
    }
  };

  const handleStatusUpdate = async (bookingId, newStatus) => {
    try {
      await axios.put(`${API}/bookings/${bookingId}/status?status=${newStatus}`, {}, { withCredentials: true });
      toast.success(`Booking status updated to ${newStatus}`);
      fetchData();
    } catch (error) {
      toast.error('Failed to update status');
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
              <p className="text-xs text-slate-500">Professional</p>
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
          <h1 className="text-4xl font-bold text-slate-900 mb-2" data-testid="dashboard-title">Professional Dashboard</h1>
          <p className="text-slate-600">Manage your jobs and earnings</p>
        </div>

        <div className="grid md:grid-cols-4 gap-6 mb-12">
          <Card className="border-slate-200" data-testid="total-earnings-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-slate-500">Total Earnings</p>
                <DollarSign className="w-5 h-5 text-green-600" />
              </div>
              <p className="text-3xl font-bold text-slate-900">${earnings?.total_earnings || 0}</p>
            </CardContent>
          </Card>

          <Card className="border-slate-200" data-testid="completed-jobs-card">
            <CardContent className="p-6">
              <p className="text-sm text-slate-500 mb-1">Completed Jobs</p>
              <p className="text-3xl font-bold text-green-600">{earnings?.completed_jobs || 0}</p>
            </CardContent>
          </Card>

          <Card className="border-slate-200" data-testid="rating-card">
            <CardContent className="p-6">
              <p className="text-sm text-slate-500 mb-1">Rating</p>
              <p className="text-3xl font-bold text-slate-900">{earnings?.rating?.toFixed(1) || '0.0'} ⭐</p>
            </CardContent>
          </Card>

          <Card className="border-slate-200" data-testid="reviews-card">
            <CardContent className="p-6">
              <p className="text-sm text-slate-500 mb-1">Total Reviews</p>
              <p className="text-3xl font-bold text-slate-900">{earnings?.total_reviews || 0}</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="available" className="space-y-6">
          <TabsList>
            <TabsTrigger value="available" data-testid="available-tab">Available Requests ({availableBookings.length})</TabsTrigger>
            <TabsTrigger value="my-jobs" data-testid="my-jobs-tab">My Jobs ({bookings.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="available">
            <Card className="border-slate-200">
              <CardHeader>
                <CardTitle>Available Booking Requests</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                  </div>
                ) : availableBookings.length === 0 ? (
                  <div className="text-center py-12" data-testid="no-available-bookings">
                    <p className="text-slate-600">No available bookings at the moment</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {availableBookings.map((booking) => (
                      <div key={booking.booking_id} className="border border-slate-200 rounded-lg p-6" data-testid={`available-booking-${booking.booking_id}`}>
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="text-xl font-semibold text-slate-900 mb-2">{booking.service_name}</h3>
                            <p className="text-sm text-slate-600">Customer: {booking.customer_name}</p>
                          </div>
                          <span className={getStatusBadgeClass(booking.status)}>{booking.status}</span>
                        </div>

                        <div className="space-y-2 text-sm text-slate-600 mb-4">
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
                        </div>

                        <div className="flex gap-3">
                          <Button
                            onClick={() => handleAccept(booking.booking_id)}
                            className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                            data-testid={`accept-btn-${booking.booking_id}`}
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Accept
                          </Button>
                          <Button
                            onClick={() => handleReject(booking.booking_id)}
                            variant="outline"
                            className="flex-1 border-red-200 text-red-600 hover:bg-red-50"
                            data-testid={`reject-btn-${booking.booking_id}`}
                          >
                            <XCircle className="w-4 h-4 mr-2" />
                            Reject
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="my-jobs">
            <Card className="border-slate-200">
              <CardHeader>
                <CardTitle>My Jobs</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                  </div>
                ) : bookings.length === 0 ? (
                  <div className="text-center py-12" data-testid="no-jobs-message">
                    <p className="text-slate-600">No jobs yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {bookings.map((booking) => (
                      <div key={booking.booking_id} className="border border-slate-200 rounded-lg p-6" data-testid={`job-${booking.booking_id}`}>
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="text-xl font-semibold text-slate-900 mb-2">{booking.service_name}</h3>
                            <p className="text-sm text-slate-600">Customer: {booking.customer_name}</p>
                          </div>
                          <span className={getStatusBadgeClass(booking.status)} data-testid={`job-status-${booking.booking_id}`}>{booking.status.replace('_', ' ')}</span>
                        </div>

                        <div className="space-y-2 text-sm text-slate-600 mb-4">
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
                        </div>

                        {booking.status === 'accepted' && (
                          <Button
                            onClick={() => handleStatusUpdate(booking.booking_id, 'in_progress')}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                            data-testid={`start-job-btn-${booking.booking_id}`}
                          >
                            Start Job
                          </Button>
                        )}

                        {booking.status === 'in_progress' && (
                          <Button
                            onClick={() => handleStatusUpdate(booking.booking_id, 'completed')}
                            className="w-full bg-green-600 hover:bg-green-700 text-white"
                            data-testid={`complete-job-btn-${booking.booking_id}`}
                          >
                            Mark as Completed
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default ProfessionalDashboard;