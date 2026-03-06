import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { History, Home, User, Calendar, DollarSign, CheckCircle, Clock, XCircle, X, AlertTriangle } from 'lucide-react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

const RentalHistory = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRentalHistory();
  }, [user]);

  const fetchRentalHistory = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/rental-history');
      setHistory(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching rental history:', error);
      setLoading(false);
    }
  };

  const terminateRental = async (rentalId) => {
    if (!window.confirm('Are you sure you want to terminate this rental agreement? This action cannot be undone.')) {
      return;
    }

    try {
      await axios.put(`http://localhost:5000/api/rental-requests/${rentalId}/terminate`);
      
      // Update local state
      setHistory(prev => prev.map(rental => 
        rental.id === rentalId 
          ? { ...rental, status: 'terminated', end_date: new Date().toISOString() }
          : rental
      ));
      
      alert('Rental agreement terminated successfully');
    } catch (error) {
      console.error('Error terminating rental:', error);
      alert('Failed to terminate rental agreement');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'terminated':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-3 w-3" />;
      case 'completed':
        return <Clock className="h-3 w-3" />;
      case 'terminated':
        return <XCircle className="h-3 w-3" />;
      default:
        return <AlertTriangle className="h-3 w-3" />;
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
        <h1 className="text-3xl font-bold text-gray-900">{t('rentalHistory.myHistory')}</h1>
      </div>

      {history.length === 0 ? (
        <div className="text-center py-12">
          <History className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">{t('rentalHistory.noHistory')}</h3>
          <p className="text-gray-500 mb-4">{t('rentalHistory.noRentalHistory')}</p>
          <a href="/" className="btn btn-primary">
            Browse Properties
          </a>
        </div>
      ) : (
        <div className="space-y-4">
          {history.map((rental) => (
            <div key={rental.id} className="card">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <Home className="h-5 w-5 text-gray-600 mr-2" />
                    <h3 className="text-lg font-semibold">{rental.house_title}</h3>
                    <span className={`ml-3 px-2 py-1 rounded-full text-xs font-medium flex items-center ${getStatusColor(rental.status)}`}>
                      {getStatusIcon(rental.status)}
                      <span className="ml-1">{rental.status}</span>
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                    <div className="flex items-center text-gray-600">
                      <User className="h-4 w-4 mr-2" />
                      <span>Landlord: {rental.landlord_name}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <DollarSign className="h-4 w-4 mr-2" />
                      <span>Monthly Rent: ${rental.monthly_rent}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                    <div className="flex items-center text-gray-600">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span>Start Date: {new Date(rental.start_date).toLocaleDateString()}</span>
                    </div>
                    {rental.end_date && (
                      <div className="flex items-center text-gray-600">
                        <Calendar className="h-4 w-4 mr-2" />
                        <span>End Date: {new Date(rental.end_date).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>

                  {rental.security_deposit && (
                    <div className="flex items-center text-gray-600 mb-3">
                      <DollarSign className="h-4 w-4 mr-2" />
                      <span>Security Deposit: ${rental.security_deposit}</span>
                    </div>
                  )}

                  <div className="flex items-center text-gray-500 text-sm">
                    <Calendar className="h-4 w-4 mr-1" />
                    <span>Created: {new Date(rental.created_at).toLocaleDateString()}</span>
                  </div>
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
        <h1 className="text-3xl font-bold text-gray-900">{t('rentalHistory.title')}</h1>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-600">
            {history.filter(h => h.status === 'active').length} active rentals
          </span>
        </div>
      </div>

      {history.length === 0 ? (
        <div className="text-center py-12">
          <History className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">{t('rentalHistory.noHistory')}</h3>
          <p className="text-gray-500">No rental history available for your properties.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {history.map((rental) => (
            <div key={rental.id} className="card">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <Home className="h-5 w-5 text-gray-600 mr-2" />
                    <h3 className="text-lg font-semibold">{rental.house_title}</h3>
                    <span className={`ml-3 px-2 py-1 rounded-full text-xs font-medium flex items-center ${getStatusColor(rental.status)}`}>
                      {getStatusIcon(rental.status)}
                      <span className="ml-1">{rental.status}</span>
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                    <div className="flex items-center text-gray-600">
                      <User className="h-4 w-4 mr-2" />
                      <span>Tenant: {rental.tenant_name}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <DollarSign className="h-4 w-4 mr-2" />
                      <span>Monthly Rent: ${rental.monthly_rent}</span>
                    </div>
                  </div>

                  {rental.tenant_email && (
                    <div className="flex items-center text-gray-600 mb-3">
                      <User className="h-4 w-4 mr-2" />
                      <span>Email: {rental.tenant_email}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                    <div className="flex items-center text-gray-600">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span>Start Date: {new Date(rental.start_date).toLocaleDateString()}</span>
                    </div>
                    {rental.end_date && (
                      <div className="flex items-center text-gray-600">
                        <Calendar className="h-4 w-4 mr-2" />
                        <span>End Date: {new Date(rental.end_date).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>

                  {rental.security_deposit && (
                    <div className="flex items-center text-gray-600 mb-3">
                      <DollarSign className="h-4 w-4 mr-2" />
                      <span>Security Deposit: ${rental.security_deposit}</span>
                    </div>
                  )}

                  <div className="flex items-center text-gray-500 text-sm">
                    <Calendar className="h-4 w-4 mr-1" />
                    <span>Created: {new Date(rental.created_at).toLocaleDateString()}</span>
                  </div>
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
        <h1 className="text-3xl font-bold text-gray-900">All {t('rentalHistory.title')}</h1>
      </div>

      {history.length === 0 ? (
        <div className="text-center py-12">
          <History className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">{t('rentalHistory.noHistory')}</h3>
          <p className="text-gray-500">No rental history available on the platform.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {history.map((rental) => (
            <div key={rental.id} className="card">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <Home className="h-5 w-5 text-gray-600 mr-2" />
                    <h3 className="text-lg font-semibold">{rental.house_title}</h3>
                    <span className={`ml-3 px-2 py-1 rounded-full text-xs font-medium flex items-center ${getStatusColor(rental.status)}`}>
                      {getStatusIcon(rental.status)}
                      <span className="ml-1">{rental.status}</span>
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                    <div className="flex items-center text-gray-600">
                      <User className="h-4 w-4 mr-2" />
                      <span>Tenant: {rental.tenant_name}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <User className="h-4 w-4 mr-2" />
                      <span>Landlord: {rental.landlord_name}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <DollarSign className="h-4 w-4 mr-2" />
                      <span>Monthly Rent: ${rental.monthly_rent}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                    <div className="flex items-center text-gray-600">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span>Start Date: {new Date(rental.start_date).toLocaleDateString()}</span>
                    </div>
                    {rental.end_date && (
                      <div className="flex items-center text-gray-600">
                        <Calendar className="h-4 w-4 mr-2" />
                        <span>End Date: {new Date(rental.end_date).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>

                  {rental.security_deposit && (
                    <div className="flex items-center text-gray-600 mb-3">
                      <DollarSign className="h-4 w-4 mr-2" />
                      <span>Security Deposit: ${rental.security_deposit}</span>
                    </div>
                  )}

                  <div className="flex items-center text-gray-500 text-sm">
                    <Calendar className="h-4 w-4 mr-1" />
                    <span>Created: {new Date(rental.created_at).toLocaleDateString()}</span>
                  </div>
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

export default RentalHistory;