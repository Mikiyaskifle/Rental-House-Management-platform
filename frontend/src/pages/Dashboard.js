import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { Home, FileText, History, User, DollarSign, TrendingUp, Eye, Calendar, Clock, AlertCircle, CheckCircle, Users, Activity, Star } from 'lucide-react';
import axios from 'axios';
import ProfileImageUpload from '../components/ProfileImageUpload';
import { useTranslation } from 'react-i18next';

const Dashboard = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [stats, setStats] = useState({});
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      let response;
      
      if (user.role === 'admin') {
        response = await axios.get('/api/admin/statistics');
        setStats(response.data);
      } else if (user.role === 'landlord') {
        // Fetch landlord stats
        const [housesRes, requestsRes, historyRes] = await Promise.all([
          axios.get('/api/houses'),
          axios.get('http://localhost:5000/api/rental-requests'),
          axios.get('http://localhost:5000/api/rental-history')
        ]);
        
        const myHouses = housesRes.data.filter(house => house.landlord_id === user.id);
        const myRequests = requestsRes.data.filter(req => 
          myHouses.some(house => house.id === req.house_id)
        );
        const myHistory = historyRes.data.filter(history => history.landlord_id === user.id);

        setStats({
          totalHouses: myHouses.length,
          availableHouses: myHouses.filter(h => h.available).length,
          pendingRequests: myRequests.filter(r => r.status === 'pending').length,
          activeRentals: myHistory.filter(h => h.status === 'active').length,
          totalIncome: myHistory.reduce((sum, h) => sum + (h.monthly_rent || 0), 0)
        });

        setRecentActivity(myRequests.slice(0, 5));
      } else {
        // Tenant stats
        const [requestsRes, historyRes] = await Promise.all([
          axios.get('http://localhost:5000/api/rental-requests'),
          axios.get('http://localhost:5000/api/rental-history')
        ]);
        
        const myRequests = requestsRes.data.filter(req => req.tenant_id === user.id);
        const myHistory = historyRes.data.filter(history => history.tenant_id === user.id);

        setStats({
          totalRequests: myRequests.length,
          pendingRequests: myRequests.filter(r => r.status === 'pending').length,
          approvedRequests: myRequests.filter(r => r.status === 'approved').length,
          activeRentals: myHistory.filter(h => h.status === 'active').length,
          totalRentPaid: myHistory.reduce((sum, h) => sum + (h.monthly_rent || 0), 0)
        });

        setRecentActivity(myRequests.slice(0, 5));
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const renderAdminDashboard = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <Link to="/update-account" className="flex items-center space-x-4">
            {user.profile_image ? (
              <img
                src={user.profile_image.startsWith('data:') ? user.profile_image : `http://localhost:5000${user.profile_image}`}
                alt="Profile"
                className="w-12 h-12 rounded-full object-cover border-2 border-gray-200 hover:opacity-80 transition-opacity cursor-pointer"
              />
            ) : (
              <User className="h-12 w-12 text-gray-400 bg-gray-100 p-2 rounded-full hover:bg-gray-200 transition-colors cursor-pointer" />
            )}
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">{t('dashboard.welcome')}, {user.username}!</h1>
        </div>
        <div className="space-x-3">
          <Link to="/admin" className="btn btn-primary">
            Manage Platform
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-full">
              <User className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.users?.reduce((sum, user) => sum + user.count, 0) || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-full">
              <Home className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Houses</p>
              <p className="text-2xl font-bold text-gray-900">{stats.houses?.total_houses || 0}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 rounded-full">
              <FileText className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending Requests</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.requests?.find(r => r.status === 'pending')?.count || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Image Upload Section */}
      <ProfileImageUpload user={user} onProfileUpdate={fetchDashboardData} />
      <div className="card">
        <h2 className="text-xl font-semibold mb-4">User Distribution</h2>
        <div className="space-y-3">
          {stats.users?.map((userGroup) => (
            <div key={userGroup.role} className="flex justify-between items-center">
              <span className="capitalize font-medium">{userGroup.role}s</span>
              <span className="text-2xl font-bold text-primary-600">{userGroup.count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderLandlordDashboard = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <Link to="/update-account" className="flex items-center space-x-4">
            {user.profile_image ? (
              <img
                src={user.profile_image.startsWith('data:') ? user.profile_image : `http://localhost:5000${user.profile_image}`}
                alt="Profile"
                className="w-12 h-12 rounded-full object-cover border-2 border-gray-200 hover:opacity-80 transition-opacity cursor-pointer"
              />
            ) : (
              <User className="h-12 w-12 text-gray-400 bg-gray-100 p-2 rounded-full hover:bg-gray-200 transition-colors cursor-pointer" />
            )}
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">{t('dashboard.welcome')}, {user.username}!</h1>
        </div>
        <div className="space-x-3">
          <Link to="/manage-properties" className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors">
            {t('dashboard.manageProperties')}
          </Link>
          <Link to="/add-house" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            {t('dashboard.addNewProperty')}
          </Link>
        </div>
      </div>

      {/* Profile Image Upload Section */}
      <ProfileImageUpload user={user} onProfileUpdate={fetchDashboardData} />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* unchanged UI */}
        ...
      </div>

      {/* Recent Rental Requests */}
      {/* unchanged UI */}
    </div>
  );

  const renderTenantDashboard = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <Link to="/update-account" className="flex items-center space-x-4">
            {user.profile_image ? (
              <img
                src={user.profile_image.startsWith('data:') ? user.profile_image : `http://localhost:5000${user.profile_image}`}
                alt="Profile"
                className="w-12 h-12 rounded-full object-cover border-2 border-gray-200 hover:opacity-80 transition-opacity cursor-pointer"
              />
            ) : (
              <User className="h-12 w-12 text-gray-400 bg-gray-100 p-2 rounded-full hover:bg-gray-200 transition-colors cursor-pointer" />
            )}
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">{t('dashboard.dashboard')}</h1>
        </div>
      </div>

      {/* Profile Image Upload Section */}
      <ProfileImageUpload user={user} onProfileUpdate={fetchDashboardData} />
    </div>
  );

  return (
    <div>
      {user.role === 'admin' && renderAdminDashboard()}
      {user.role === 'landlord' && renderLandlordDashboard()}
      {user.role === 'tenant' && renderTenantDashboard()}
    </div>
  );
};

export default Dashboard;