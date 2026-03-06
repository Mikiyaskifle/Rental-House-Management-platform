import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { FileText, Check, X, MessageSquare, Calendar, User, Home, Phone, Mail, Clock, AlertCircle, TrendingUp, Users } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

const RentalRequests = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [respondingTo, setRespondingTo] = useState(null);
  const [responseMessage, setResponseMessage] = useState('');
  const [filter, setFilter] = useState('all'); // all, pending, approved, rejected

  useEffect(() => {
    fetchRequests();
  }, [user]);

  const fetchRequests = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/rental-requests');
      setRequests(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching requests:', error);
      toast.error('Failed to fetch rental requests');
      setLoading(false);
    }
  };

  const handleResponse = async (requestId, status) => {
    setRespondingTo(requestId);
    try {
      await axios.put(`http://localhost:5000/api/rental-requests/${requestId}`, {
        status,
        response_message: responseMessage
      });
      toast.success(`Request ${status} successfully`);
      setResponseMessage('');
      fetchRequests(); // Refresh the list
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to respond to request');
    }
    setRespondingTo(null);
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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const renderTenantView = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">{t('requests.myRequests')}</h1>
      </div>

      {requests.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">{t('requests.noRequestsFound')}</h3>
          <p className="text-gray-500 mb-4">{t('requests.noRequestsFound')}</p>
          <a href="/" className="btn btn-primary">
            {t('home.browseProperties')}
          </a>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((request) => (
            <div key={request.id} className="card">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <Home className="h-5 w-5 text-gray-600 mr-2" />
                    <h3 className="text-lg font-semibold">{request.house_title}</h3>
                    <span className={`ml-3 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                      {request.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                    <div className="flex items-center text-gray-600">
                      <User className="h-4 w-4 mr-2" />
                      <span>Landlord: {request.landlord_name}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span>Requested: {new Date(request.requested_at).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {request.message && (
                    <div className="mb-3">
                      <p className="text-sm font-medium text-gray-700 mb-1">Your Message:</p>
                      <p className="text-gray-600">{request.message}</p>
                    </div>
                  )}

                  {request.response_message && (
                    <div className="mb-3">
                      <p className="text-sm font-medium text-gray-700 mb-1">Landlord Response:</p>
                      <p className="text-gray-600">{request.response_message}</p>
                    </div>
                  )}

                  {request.responded_at && (
                    <div className="flex items-center text-gray-500 text-sm">
                      <Calendar className="h-4 w-4 mr-1" />
                      <span>Responded: {new Date(request.responded_at).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderLandlordView = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">{t('requests.requests')}</h1>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">
            {requests.filter(r => r.status === 'pending').length} pending
          </span>
        </div>
      </div>

      {requests.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">{t('requests.noRequestsFound')}</h3>
          <p className="text-gray-500">{t('requests.noLandlordRequests')}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((request) => (
            <div key={request.id} className="card">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <Home className="h-5 w-5 text-gray-600 mr-2" />
                    <h3 className="text-lg font-semibold">{request.house_title}</h3>
                    <span className={`ml-3 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                      {request.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                    <div className="flex items-center text-gray-600">
                      <User className="h-4 w-4 mr-2" />
                      <span>Tenant: {request.tenant_name}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span>Requested: {new Date(request.requested_at).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {request.tenant_email && (
                    <div className="flex items-center text-gray-600 mb-3">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      <span>Email: {request.tenant_email}</span>
                    </div>
                  )}

                  {request.tenant_phone && (
                    <div className="flex items-center text-gray-600 mb-3">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      <span>Phone: {request.tenant_phone}</span>
                    </div>
                  )}

                  {request.message && (
                    <div className="mb-3">
                      <p className="text-sm font-medium text-gray-700 mb-1">Tenant Message:</p>
                      <p className="text-gray-600">{request.message}</p>
                    </div>
                  )}

                  {request.response_message && (
                    <div className="mb-3">
                      <p className="text-sm font-medium text-gray-700 mb-1">Your Response:</p>
                      <p className="text-gray-600">{request.response_message}</p>
                    </div>
                  )}

                  {request.status === 'pending' && (
                    <div className="mt-4 space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Response Message (Optional)
                        </label>
                        <textarea
                          value={responseMessage}
                          onChange={(e) => setResponseMessage(e.target.value)}
                          rows={3}
                          className="input"
                          placeholder="Add a message for the tenant..."
                        />
                      </div>
                      <div className="flex space-x-3">
                        <button
                          onClick={() => handleResponse(request.id, 'approved')}
                          disabled={respondingTo === request.id}
                          className="btn btn-primary flex items-center"
                        >
                          <Check className="h-4 w-4 mr-2" />
                          {respondingTo === request.id ? 'Processing...' : 'Approve'}
                        </button>
                        <button
                          onClick={() => handleResponse(request.id, 'rejected')}
                          disabled={respondingTo === request.id}
                          className="btn btn-danger flex items-center"
                        >
                          <X className="h-4 w-4 mr-2" />
                          {respondingTo === request.id ? 'Processing...' : 'Reject'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderAdminView = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">{t('requests.requests')}</h1>
      </div>

      {requests.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">{t('requests.noRequestsFound')}</h3>
          <p className="text-gray-500">{t('requests.noAdminRequests')}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((request) => (
            <div key={request.id} className="card">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <Home className="h-5 w-5 text-gray-600 mr-2" />
                    <h3 className="text-lg font-semibold">{request.house_title}</h3>
                    <span className={`ml-3 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                      {request.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                    <div className="flex items-center text-gray-600">
                      <User className="h-4 w-4 mr-2" />
                      <span>Tenant: {request.tenant_name}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <User className="h-4 w-4 mr-2" />
                      <span>Landlord: {request.landlord_name}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span>Requested: {new Date(request.requested_at).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {request.message && (
                    <div className="mb-3">
                      <p className="text-sm font-medium text-gray-700 mb-1">Tenant Message:</p>
                      <p className="text-gray-600">{request.message}</p>
                    </div>
                  )}

                  {request.response_message && (
                    <div className="mb-3">
                      <p className="text-sm font-medium text-gray-700 mb-1">Landlord Response:</p>
                      <p className="text-gray-600">{request.response_message}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div>
      {user.role === 'tenant' && renderTenantView()}
      {user.role === 'landlord' && renderLandlordView()}
      {user.role === 'admin' && renderAdminView()}
    </div>
  );
};

export default RentalRequests;