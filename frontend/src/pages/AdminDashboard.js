import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import axios from 'axios';
import { toast } from 'sonner';
import { Users, Briefcase, Calendar, DollarSign, LogOut, CheckCircle, XCircle } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

function AdminDashboard({ user: propUser }) {
  const navigate = useNavigate();
  const [user, setUser] = useState(propUser);
  const [analytics, setAnalytics] = useState(null);
  const [professionals, setProfessionals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newService, setNewService] = useState({
    name: '',
    description: '',
    price_range: '',
    estimated_time: '',
    icon: ''
  });

  useEffect(() => {
    if (!user) {
      fetchUser();
    }
    fetchData();
  }, []);

  const fetchUser = async () => {
    try {
      const response = await axios.get(`${API}/auth/me`, { withCredentials: true });
      if (response.data.role !== 'admin') {
        navigate('/');
        return;
      }
      setUser(response.data);
    } catch (error) {
      navigate('/login');
    }
  };

  const fetchData = async () => {
    try {
      const [analyticsRes, professionalsRes] = await Promise.all([
        axios.get(`${API}/admin/analytics`, { withCredentials: true }),
        axios.get(`${API}/admin/professionals`, { withCredentials: true })
      ]);
      
      setAnalytics(analyticsRes.data);
      setProfessionals(professionalsRes.data);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      if (error.response?.status === 403) {
        navigate('/');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyProfessional = async (userId, verified) => {
    try {
      await axios.put(`${API}/admin/professionals/${userId}/verify?verified=${verified}`, {}, { withCredentials: true });
      toast.success(`Professional ${verified ? 'verified' : 'unverified'} successfully`);
      fetchData();
    } catch (error) {
      toast.error('Failed to update verification status');
    }
  };

  const handleCreateService = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/admin/services`, newService, { withCredentials: true });
      toast.success('Service created successfully');
      setNewService({ name: '', description: '', price_range: '', estimated_time: '', icon: '' });
    } catch (error) {
      toast.error('Failed to create service');
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
              <p className="text-xs text-slate-500">Administrator</p>
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
          <h1 className="text-4xl font-bold text-slate-900 mb-2" data-testid="admin-dashboard-title">Admin Dashboard</h1>
          <p className="text-slate-600">Manage platform operations</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-24">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <>
            <div className="grid md:grid-cols-4 gap-6 mb-12">
              <Card className="border-slate-200" data-testid="total-users-card">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-slate-500">Total Users</p>
                    <Users className="w-5 h-5 text-blue-600" />
                  </div>
                  <p className="text-3xl font-bold text-slate-900">{analytics?.total_users || 0}</p>
                  <p className="text-xs text-slate-500 mt-1">
                    {analytics?.total_customers || 0} customers, {analytics?.total_professionals || 0} pros
                  </p>
                </CardContent>
              </Card>

              <Card className="border-slate-200" data-testid="total-bookings-card">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-slate-500">Total Bookings</p>
                    <Calendar className="w-5 h-5 text-green-600" />
                  </div>
                  <p className="text-3xl font-bold text-slate-900">{analytics?.total_bookings || 0}</p>
                  <p className="text-xs text-slate-500 mt-1">
                    {analytics?.completed_bookings || 0} completed
                  </p>
                </CardContent>
              </Card>

              <Card className="border-slate-200" data-testid="pending-bookings-card">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-slate-500">Pending</p>
                    <Briefcase className="w-5 h-5 text-yellow-600" />
                  </div>
                  <p className="text-3xl font-bold text-yellow-600">{analytics?.pending_bookings || 0}</p>
                </CardContent>
              </Card>

              <Card className="border-slate-200" data-testid="total-services-card">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-slate-500">Active Services</p>
                    <DollarSign className="w-5 h-5 text-purple-600" />
                  </div>
                  <p className="text-3xl font-bold text-slate-900">{analytics?.total_services || 0}</p>
                </CardContent>
              </Card>
            </div>

            <Tabs defaultValue="professionals" className="space-y-6">
              <TabsList>
                <TabsTrigger value="professionals" data-testid="professionals-tab">Professionals</TabsTrigger>
                <TabsTrigger value="services" data-testid="services-tab">Services</TabsTrigger>
              </TabsList>

              <TabsContent value="professionals">
                <Card className="border-slate-200">
                  <CardHeader>
                    <CardTitle>Professional Verification</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {professionals.length === 0 ? (
                      <div className="text-center py-12" data-testid="no-professionals">
                        <p className="text-slate-600">No professionals registered yet</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {professionals.map((prof) => (
                          <div key={prof.user_id} className="border border-slate-200 rounded-lg p-6" data-testid={`professional-${prof.user_id}`}>
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <h3 className="text-lg font-semibold text-slate-900">{prof.user_info?.name || 'N/A'}</h3>
                                  {prof.verified ? (
                                    <span className="status-badge status-completed" data-testid={`verified-badge-${prof.user_id}`}>Verified</span>
                                  ) : (
                                    <span className="status-badge status-pending" data-testid={`pending-badge-${prof.user_id}`}>Pending</span>
                                  )}
                                </div>
                                <p className="text-sm text-slate-600 mb-1">{prof.user_info?.email}</p>
                                <p className="text-sm text-slate-600">Rating: {prof.rating?.toFixed(1) || '0.0'} ⭐ ({prof.total_reviews || 0} reviews)</p>
                                <p className="text-sm text-slate-600">Completed Jobs: {prof.earnings_total || 0}</p>
                              </div>
                              <div className="flex gap-2">
                                {!prof.verified ? (
                                  <Button
                                    onClick={() => handleVerifyProfessional(prof.user_id, true)}
                                    className="bg-green-600 hover:bg-green-700 text-white"
                                    data-testid={`verify-btn-${prof.user_id}`}
                                  >
                                    <CheckCircle className="w-4 h-4 mr-2" />
                                    Verify
                                  </Button>
                                ) : (
                                  <Button
                                    onClick={() => handleVerifyProfessional(prof.user_id, false)}
                                    variant="outline"
                                    className="border-red-200 text-red-600 hover:bg-red-50"
                                    data-testid={`unverify-btn-${prof.user_id}`}
                                  >
                                    <XCircle className="w-4 h-4 mr-2" />
                                    Unverify
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="services">
                <Card className="border-slate-200">
                  <CardHeader>
                    <CardTitle>Add New Service</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleCreateService} className="space-y-4" data-testid="add-service-form">
                      <div>
                        <Label htmlFor="name">Service Name</Label>
                        <Input
                          id="name"
                          value={newService.name}
                          onChange={(e) => setNewService({ ...newService, name: e.target.value })}
                          required
                          placeholder="e.g., Electrician"
                          data-testid="service-name-input"
                        />
                      </div>

                      <div>
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                          id="description"
                          value={newService.description}
                          onChange={(e) => setNewService({ ...newService, description: e.target.value })}
                          required
                          placeholder="Service description"
                          data-testid="service-description-input"
                        />
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="price_range">Price Range</Label>
                          <Input
                            id="price_range"
                            value={newService.price_range}
                            onChange={(e) => setNewService({ ...newService, price_range: e.target.value })}
                            required
                            placeholder="e.g., $50 - $150"
                            data-testid="service-price-input"
                          />
                        </div>

                        <div>
                          <Label htmlFor="estimated_time">Estimated Time</Label>
                          <Input
                            id="estimated_time"
                            value={newService.estimated_time}
                            onChange={(e) => setNewService({ ...newService, estimated_time: e.target.value })}
                            required
                            placeholder="e.g., 1-2 hours"
                            data-testid="service-time-input"
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="icon">Icon (Emoji)</Label>
                        <Input
                          id="icon"
                          value={newService.icon}
                          onChange={(e) => setNewService({ ...newService, icon: e.target.value })}
                          required
                          placeholder="e.g., ⚡"
                          data-testid="service-icon-input"
                        />
                      </div>

                      <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white" data-testid="create-service-btn">
                        Create Service
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;