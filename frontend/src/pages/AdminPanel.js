import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Shield, Users, Home, FileText, TrendingUp, Ban, Check, X, Search, User as UserIcon, AlertTriangle, Eye, Edit, Trash2, Activity, DollarSign, Calendar, Clock, CheckCircle, Menu, BarChart3, Settings, LogOut } from 'lucide-react';
import { Fragment } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

const AdminPanel = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [stats, setStats] = useState({});
  const [users, setUsers] = useState([]);
  const [verifications, setVerifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // all, active, inactive
  const [activeTab, setActiveTab] = useState('overview'); // overview, users, listings, requests, settings

  // Handle URL parameters for filtering
  useEffect(() => {
    const statusFilter = searchParams.get('filter');
    if (statusFilter === 'blocked') {
      setFilterStatus('inactive');
      setActiveTab('users');
    }
  }, [searchParams]);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      const [statsRes, usersRes, verificationsRes] = await Promise.all([
        axios.get('/api/admin/statistics'),
        axios.get('/api/admin/users'),
        axios.get('/api/admin/verifications')
      ]);
      
      setStats(statsRes.data);
      setUsers(usersRes.data);
      setVerifications(verificationsRes.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching admin data:', error);
      toast.error('Failed to fetch admin data');
      setLoading(false);
    }
  };

  const toggleUserStatus = async (userId, currentStatus, userName) => {
    const action = currentStatus ? 'block' : 'unblock';
    const confirmMessage = `Are you sure you want to ${action} ${userName}?`;
    
    if (!window.confirm(confirmMessage)) {
      return;
    }
    
    try {
      await axios.put(`/api/admin/users/${userId}`, {
        is_active: !currentStatus
      });
      toast.success(`User ${action}ed successfully`);
      fetchAdminData(); // Refresh data
    } catch (error) {
      toast.error(`Failed to ${action} user`);
    }
  };

  const deleteUser = async (userId, userName) => {
    const confirmMessage = `Are you sure you want to delete ${userName}? This action cannot be undone!`;
    
    if (!window.confirm(confirmMessage)) {
      return;
    }
    
    try {
      await axios.delete(`/api/admin/users/${userId}`);
      toast.success(`User ${userName} deleted successfully`);
      fetchAdminData(); // Refresh data
    } catch (error) {
      toast.error(`Failed to delete user ${userName}`);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = !searchTerm || 
                         user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.full_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = !filterRole || user.role === filterRole;
    const matchesStatus = filterStatus === 'all' || 
                          (filterStatus === 'active' && user.is_active) || 
                          (filterStatus === 'inactive' && !user.is_active);
    return matchesSearch && matchesRole && matchesStatus;
  });

  // Debug: Log users data
  console.log('Users data:', users);
  console.log('Filtered users:', filteredUsers);
  console.log('Filter status:', filterStatus);
  console.log('Filter role:', filterRole);
  console.log('Loading state:', loading);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      {/* Sidebar */}
      <div className="w-64 bg-white dark:bg-gray-800 shadow-lg">
        <div className="p-6">
          <div className="flex items-center mb-6">
            <Shield className="h-8 w-8 text-primary-600 mr-3" />
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">{t('adminPanel.title')}</h1>
          </div>
          
          {/* Navigation Menu */}
          <nav className="space-y-2">
            <button
              onClick={() => setActiveTab('overview')}
              className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                activeTab === 'overview' 
                  ? 'bg-primary-600 text-white' 
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <BarChart3 className="h-5 w-5 mr-3" />
              {t('adminPanel.dashboard')}
            </button>
            
            <button
              onClick={() => setActiveTab('users')}
              className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                activeTab === 'users' 
                  ? 'bg-primary-600 text-white' 
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <Users className="h-5 w-5 mr-3" />
              {t('adminPanel.users')}
            </button>
            
            <button
              onClick={() => setActiveTab('listings')}
              className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                activeTab === 'listings' 
                  ? 'bg-primary-600 text-white' 
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <Home className="h-5 w-5 mr-3" />
              {t('adminPanel.properties')}
            </button>
            
            <button
              onClick={() => setActiveTab('requests')}
              className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                activeTab === 'requests' 
                  ? 'bg-primary-600 text-white' 
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <FileText className="h-5 w-5 mr-3" />
              {t('adminPanel.verifications')}
            </button>
            
            <button
              onClick={() => setActiveTab('settings')}
              className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                activeTab === 'settings' 
                  ? 'bg-primary-600 text-white' 
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <Settings className="h-5 w-5 mr-3" />
              {t('adminPanel.settings')}
            </button>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full overflow-y-auto">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
          ) : (
            <Fragment>
              {activeTab === 'overview' && (
                <div className="p-6">
                  <div className="flex items-center mb-6">
                    <Shield className="h-8 w-8 text-primary-600 mr-3" />
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t('adminPanel.title')}</h1>
                  </div>

                  {/* Statistics Overview */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="card cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/admin/users')}>
                      <div className="flex items-center">
                        <div className="p-3 bg-blue-100 rounded-full">
                          <Users className="h-6 w-6 text-blue-600" />
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-600">{t('adminPanel.totalUsers')}</p>
                          <p className="text-2xl font-bold text-gray-900">
                            {stats.users?.reduce((sum, user) => sum + user.count, 0) || 0}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="card cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/admin/users?filter=blocked')}>
                      <div className="flex items-center">
                        <div className="p-3 bg-red-100 rounded-full">
                          <Ban className="h-6 w-6 text-red-600" />
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-600">{t('adminPanel.blockedUsers')}</p>
                          <p className="text-2xl font-bold text-gray-900">{stats.active?.blocked_users || 0}</p>
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

                    <div className="card cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/admin/requests')}>
                      <div className="flex items-center">
                        <div className="p-3 bg-yellow-100 rounded-full">
                          <FileText className="h-6 w-6 text-yellow-600" />
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-600">{t('adminPanel.pendingRequests')}</p>
                          <p className="text-2xl font-bold text-gray-900">{stats.requests?.filter(r => r.status === 'pending').length || 0}</p>
                        </div>
                      </div>
                    </div>

                    <div className="card">
                      <div className="flex items-center">
                        <div className="p-3 bg-purple-100 rounded-full">
                          <TrendingUp className="h-6 w-6 text-purple-600" />
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-600">Avg. House Price</p>
                          <p className="text-2xl font-bold text-gray-900">
                            ${Math.round(stats.houses?.avg_price || 0)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'users' && (
                <div className="p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold">{t('adminPanel.userManagement')}</h2>
                    <div className="flex items-center space-x-4">
                      <div className="relative">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <input
                          type="text"
                          placeholder={t('adminPanel.searchUsers')}
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                      </div>
                      <select
                        value={filterRole}
                        onChange={(e) => setFilterRole(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      >
                        <option value="">{t('adminPanel.allRoles')}</option>
                        <option value="admin">Admin</option>
                        <option value="landlord">Landlord</option>
                        <option value="tenant">Tenant</option>
                      </select>
                      <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      >
                        <option value="all">{t('adminPanel.allStatus')}</option>
                        <option value="active">{t('adminPanel.active')}</option>
                        <option value="inactive">{t('adminPanel.blocked')}</option>
                      </select>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            {t('adminPanel.user')}
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            {t('adminPanel.role')}
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            {t('adminPanel.status')}
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            {t('adminPanel.joined')}
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            {t('adminPanel.actions')}
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {filteredUsers.map((user) => (
                          <tr key={user.id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div>
                                <div className="text-sm font-medium text-gray-900">{user.full_name}</div>
                                <div className="text-sm text-gray-500">{user.email}</div>
                                <div className="text-sm text-gray-500">@{user.username}</div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                user.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                                user.role === 'landlord' ? 'bg-blue-100 text-blue-800' :
                                'bg-green-100 text-green-800'
                              }`}>
                                {user.role}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                              }`}>
                                {user.is_active ? (
                                  <>
                                    <Check className="h-3 w-3 mr-1" />
                                    {t('adminPanel.active')}
                                  </>
                                ) : (
                                  <>
                                    <X className="h-3 w-3 mr-1" />
                                    {t('adminPanel.blocked')}
                                  </>
                                )}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {new Date(user.created_at).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <button
                                onClick={() => toggleUserStatus(user.id, user.is_active, user.username)}
                                className={`inline-flex items-center px-3 py-1 rounded-md text-xs font-medium ${
                                  user.is_active 
                                    ? 'bg-red-100 text-red-800 hover:bg-red-200' 
                                    : 'bg-green-100 text-green-800 hover:bg-green-200'
                                }`}
                              >
                                {user.is_active ? (
                                  <>
                                    <Ban className="h-3 w-3 mr-1" />
                                    {t('adminPanel.block')}
                                  </>
                                ) : (
                                  <>
                                    <Check className="h-3 w-3 mr-1" />
                                    {t('adminPanel.unblock')}
                                  </>
                                )}
                              </button>
                              {user.role !== 'admin' && (
                                <button
                                  onClick={() => deleteUser(user.id, user.username)}
                                  className="ml-2 inline-flex items-center px-3 py-1 rounded-md text-xs font-medium bg-red-600 text-white hover:bg-red-700"
                                >
                                  <Trash2 className="h-3 w-3 mr-1" />
                                  {t('adminPanel.delete')}
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {filteredUsers.length === 0 && (
                    <div className="text-center py-8">
                      <UserIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">{t('adminPanel.noUsersFound')}</h3>
                      <p className="text-gray-500 dark:text-gray-400">{t('adminPanel.tryDifferentFilters')}</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'listings' && (
                <div className="p-6">
                  <h2 className="text-xl font-semibold mb-4">{t('adminPanel.properties')}</h2>
                  <div className="text-center py-8">
                    <Home className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">{t('adminPanel.noListings')}</h3>
                    <p className="text-gray-500 dark:text-gray-400">{t('adminPanel.addProperty')}</p>
                  </div>
                </div>
              )}

              {activeTab === 'requests' && (
                <div className="p-6">
                  <h2 className="text-xl font-semibold mb-4">{t('adminPanel.verifications')}</h2>
                  <div className="text-center py-8">
                    <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">{t('adminPanel.noRequests')}</h3>
                    <p className="text-gray-500 dark:text-gray-400">{t('adminPanel.checkLater')}</p>
                  </div>
                </div>
              )}

              {activeTab === 'settings' && (
                <div className="p-6">
                  <h2 className="text-xl font-semibold mb-4">{t('adminPanel.settings')}</h2>
                  <div className="text-center py-8">
                    <Settings className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">{t('adminPanel.comingSoon')}</h3>
                    <p className="text-gray-500 dark:text-gray-400">{t('adminPanel.settingsDesc')}</p>
                  </div>
                </div>
              )}
      </div>
      <select
        value={filterRole}
        onChange={(e) => setFilterRole(e.target.value)}
        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
      >
        <option value="">{t('adminPanel.allRoles')}</option>
        <option value="admin">Admin</option>
        <option value="landlord">Landlord</option>
        <option value="tenant">Tenant</option>
      </select>
      <select
        value={filterStatus}
        onChange={(e) => setFilterStatus(e.target.value)}
        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
      >
        <option value="all">{t('adminPanel.allStatus')}</option>
        <option value="active">{t('adminPanel.active')}</option>
        <option value="inactive">{t('adminPanel.blocked')}</option>
      </select>
    </div>
  </div>

  <div className="overflow-x-auto">
    <table className="min-w-full divide-y divide-gray-200">
      <thead className="bg-gray-50">
        <tr>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            {t('adminPanel.user')}
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            {t('adminPanel.role')}
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            {t('adminPanel.status')}
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            {t('adminPanel.joined')}
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            {t('adminPanel.actions')}
          </th>
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-200">
        {filteredUsers.map((user) => (
          <tr key={user.id}>
            <td className="px-6 py-4 whitespace-nowrap">
              <div>
                <div className="text-sm font-medium text-gray-900">{user.full_name}</div>
                <div className="text-sm text-gray-500">{user.email}</div>
                <div className="text-sm text-gray-500">@{user.username}</div>
              </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                user.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                user.role === 'landlord' ? 'bg-blue-100 text-blue-800' :
                'bg-green-100 text-green-800'
              }`}>
                {user.role}
              </span>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {user.is_active ? (
                  <>
                    <Check className="h-3 w-3 mr-1" />
                    {t('adminPanel.active')}
                  </>
                ) : (
                  <>
                    <X className="h-3 w-3 mr-1" />
                    {t('adminPanel.blocked')}
                  </>
                )}
              </span>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {new Date(user.created_at).toLocaleDateString()}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
              <button
                onClick={() => toggleUserStatus(user.id, user.is_active, user.username)}
                className={`inline-flex items-center px-3 py-1 rounded-md text-xs font-medium ${
                  user.is_active 
                    ? 'bg-red-100 text-red-800 hover:bg-red-200' 
                    : 'bg-green-100 text-green-800 hover:bg-green-200'
                }`}
              >
                {user.is_active ? (
                  <>
                    <Ban className="h-3 w-3 mr-1" />
                    {t('adminPanel.block')}
                  </>
                ) : (
                  <>
                    <Check className="h-3 w-3 mr-1" />
                    {t('adminPanel.unblock')}
                  </>
                )}
              </button>
              {user.role !== 'admin' && (
                <button
                  onClick={() => deleteUser(user.id, user.username)}
                  className="ml-2 inline-flex items-center px-3 py-1 rounded-md text-xs font-medium bg-red-600 text-white hover:bg-red-700"
                >
                  <Trash2 className="h-3 w-3 mr-1" />
                  {t('adminPanel.delete')}
                </button>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>

  {filteredUsers.length === 0 && (
    <div className="text-center py-8">
      <UserIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">{t('adminPanel.noUsersFound')}</h3>
      <p className="text-gray-500 dark:text-gray-400">{t('adminPanel.tryDifferentFilters')}</p>
    </div>
  )}
</div>
)}

{activeTab === 'listings' && (
<div className="p-6">
  <h2 className="text-xl font-semibold mb-4">{t('adminPanel.properties')}</h2>
  <div className="text-center py-8">
    <Home className="mx-auto h-12 w-12 text-gray-400 mb-4" />
    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">{t('adminPanel.noListings')}</h3>
    <p className="text-gray-500 dark:text-gray-400">{t('adminPanel.addProperty')}</p>
  </div>
</div>
)}

{activeTab === 'requests' && (
<div className="p-6">
  <h2 className="text-xl font-semibold mb-4">{t('adminPanel.verifications')}</h2>
  <div className="text-center py-8">
    <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">{t('adminPanel.noRequests')}</h3>
    <p className="text-gray-500 dark:text-gray-400">{t('adminPanel.checkLater')}</p>
  </div>
</div>
)}

{activeTab === 'settings' && (
<div className="p-6">
  <h2 className="text-xl font-semibold mb-4">{t('adminPanel.settings')}</h2>
  <div className="text-center py-8">
    <Settings className="mx-auto h-12 w-12 text-gray-400 mb-4" />
    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">{t('adminPanel.comingSoon')}</h3>
    <p className="text-gray-500 dark:text-gray-400">{t('adminPanel.settingsDesc')}</p>
  </div>
</div>
)}
</>
)}

</div>
</div>
</div>
)};

export default AdminPanel;