import React, { useState, useEffect } from 'react';
import { Shield, FileText, Check, X, Eye, User, AlertCircle, Clock, CheckCircle } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import BackButton from '../components/BackButton';

const AdminVerification = () => {
  const { t } = useTranslation();
  const [verifications, setVerifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'pending', 'approved', 'rejected'

  useEffect(() => {
    fetchVerifications();
  }, []);

  const fetchVerifications = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/admin/verifications');
      setVerifications(response.data);
      setLoading(false);
    } catch (error) {
      toast.error(t('adminVerification.failedToFetch'));
      setLoading(false);
    }
  };

  const getFilteredVerifications = () => {
    if (statusFilter === 'all') {
      return verifications;
    }
    return verifications.filter(v => v.verification_status === statusFilter);
  };

  const handleStatusClick = (status) => {
    setStatusFilter(statusFilter === status ? 'all' : status);
  };

  const viewUserDetails = async (userId) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/admin/verifications/${userId}`);
      setSelectedUser(response.data);
      setShowModal(true);
    } catch (error) {
      toast.error(t('adminVerification.failedToFetchUser'));
    }
  };

  const approveUser = async (userId) => {
    try {
      await axios.put(`http://localhost:5000/api/admin/verifications/${userId}/approve`);
      toast.success(t('adminVerification.userApproved'));
      fetchVerifications();
      setShowModal(false);
    } catch (error) {
      toast.error(t('adminVerification.failedToApprove'));
    }
  };

  const rejectUser = async (userId) => {
    try {
      await axios.put(`http://localhost:5000/api/admin/verifications/${userId}/reject`);
      toast.success(t('adminVerification.userRejected'));
      fetchVerifications();
      setShowModal(false);
    } catch (error) {
      toast.error(t('adminVerification.failedToReject'));
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'approved':
        return <CheckCircle className="h-4 w-4" />;
      case 'rejected':
        return <X className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Shield className="h-8 w-8 text-primary-600 mr-3" />
          <h1 className="text-3xl font-bold text-gray-900">{t('adminVerification.title')}</h1>
        </div>
        <BackButton to="/admin" />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div 
          className={`card cursor-pointer transition-all ${
            statusFilter === 'pending' ? 'ring-2 ring-yellow-500 bg-yellow-50' : 'hover:shadow-lg'
          }`}
          onClick={() => handleStatusClick('pending')}
        >
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 rounded-full">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-gray-900">
                {verifications.filter(v => v.verification_status === 'pending').length}
              </p>
            </div>
          </div>
        </div>

        <div 
          className={`card cursor-pointer transition-all ${
            statusFilter === 'approved' ? 'ring-2 ring-green-500 bg-green-50' : 'hover:shadow-lg'
          }`}
          onClick={() => handleStatusClick('approved')}
        >
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-full">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Approved</p>
              <p className="text-2xl font-bold text-gray-900">
                {verifications.filter(v => v.verification_status === 'approved').length}
              </p>
            </div>
          </div>
        </div>

        <div 
          className={`card cursor-pointer transition-all ${
            statusFilter === 'rejected' ? 'ring-2 ring-red-500 bg-red-50' : 'hover:shadow-lg'
          }`}
          onClick={() => handleStatusClick('rejected')}
        >
          <div className="flex items-center">
            <div className="p-3 bg-red-100 rounded-full">
              <X className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Rejected</p>
              <p className="text-2xl font-bold text-gray-900">
                {verifications.filter(v => v.verification_status === 'rejected').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Verification List */}
      <div className="card">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">{t('adminVerification.verificationRequests')}</h2>
          {statusFilter !== 'all' && (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">
                Filtered by: <span className="font-medium capitalize">{statusFilter}</span>
              </span>
              <button
                onClick={() => setStatusFilter('all')}
                className="text-sm text-primary-600 hover:text-primary-800 font-medium"
              >
                Clear Filter
              </button>
            </div>
          )}
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Registered
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {getFilteredVerifications().map((user) => (
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
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full flex items-center ${getStatusColor(user.verification_status)}`}>
                      {getStatusIcon(user.verification_status)}
                      <span className="ml-1 capitalize">{user.verification_status}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => viewUserDetails(user.id)}
                      className="text-indigo-600 hover:text-indigo-900 mr-3"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    {user.verification_status === 'pending' && (
                      <>
                        <button
                          onClick={() => approveUser(user.id)}
                          className="text-green-600 hover:text-green-900 mr-3"
                        >
                          <Check className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => rejectUser(user.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ID Image Modal */}
      {showModal && selectedUser && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900">{t('adminVerification.title')} - {selectedUser.full_name}</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-700">Username</p>
                  <p className="text-sm text-gray-900">{selectedUser.username}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Email</p>
                  <p className="text-sm text-gray-900">{selectedUser.email}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Role</p>
                  <p className="text-sm text-gray-900 capitalize">{selectedUser.role}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Status</p>
                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(selectedUser.verification_status)}`}>
                    {getStatusIcon(selectedUser.verification_status)}
                    <span className="ml-1 capitalize">{selectedUser.verification_status}</span>
                  </span>
                </div>
              </div>

              {selectedUser.id_image && (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">ID Image</p>
                  <div className="border rounded-lg overflow-hidden">
                    <img
                      src={selectedUser.id_image}
                      alt="ID Image"
                      className="w-full h-auto max-h-96 object-contain"
                    />
                  </div>
                </div>
              )}

              {selectedUser.verification_status === 'pending' && (
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    onClick={() => rejectUser(selectedUser.id)}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Reject
                  </button>
                  <button
                    onClick={() => approveUser(selectedUser.id)}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center"
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Approve
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminVerification;
