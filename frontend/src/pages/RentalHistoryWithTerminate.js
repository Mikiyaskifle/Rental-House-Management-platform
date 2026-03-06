import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { History, Home, User, Calendar, DollarSign, CheckCircle, Clock, XCircle, X, AlertTriangle, Star, MessageSquare } from 'lucide-react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import BackButton from '../components/BackButton';

const RentalHistoryWithTerminate = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showTerminateModal, setShowTerminateModal] = useState(false);
  const [selectedRental, setSelectedRental] = useState(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');

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

  const terminateRental = (rental) => {
    setSelectedRental(rental);
    setRating(0);
    setComment('');
    setShowTerminateModal(true);
  };

  const confirmTermination = async () => {
    if (!window.confirm('Are you sure you want to terminate this rental agreement? This action cannot be undone.')) {
      return;
    }

    try {
      // Terminate the rental
      await axios.put(`http://localhost:5000/api/rental-requests/${selectedRental.id}/terminate`);
      
      // Submit rating and comment if provided
      if (rating > 0 || comment.trim()) {
        try {
          await axios.post('http://localhost:5000/api/ratings', {
            house_id: selectedRental.house_id,
            tenant_id: user.id,
            rating: rating,
            review: comment.trim()
          });
        } catch (ratingError) {
          console.error('Error submitting rating:', ratingError);
          // Don't fail the termination if rating fails
        }
      }
      
      // Update local state
      setHistory(prev => prev.map(rental => 
        rental.id === selectedRental.id 
          ? { ...rental, status: 'terminated', end_date: new Date().toISOString() }
          : rental
      ));
      
      setShowTerminateModal(false);
      alert('Rental agreement terminated successfully' + (rating > 0 ? ' with your rating and feedback' : ''));
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

  const StarRating = ({ value, onChange }) => {
    const [hoveredStar, setHoveredStar] = useState(0);

    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            className="focus:outline-none"
            onMouseEnter={() => setHoveredStar(star)}
            onMouseLeave={() => setHoveredStar(0)}
            onClick={() => onChange(star)}
          >
            <Star
              className={`h-6 w-6 transition-colors ${
                star <= (hoveredStar || value)
                  ? 'text-yellow-400 fill-current'
                  : 'text-gray-300'
              }`}
            />
          </button>
        ))}
      </div>
    );
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
        <h1 className="text-3xl font-bold text-gray-900">My Rental History</h1>
        <BackButton to="/dashboard" />
      </div>

      {history.length === 0 ? (
        <div className="text-center py-12">
          <History className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No rental history</h3>
          <p className="text-gray-500 mb-4">You haven't rented any properties yet.</p>
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
                    {/* Terminate Button for Active Rentals */}
                    {rental.status === 'active' && (
                      <button
                        onClick={() => terminateRental(rental)}
                        className="ml-auto flex items-center px-3 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors"
                      >
                        <X className="h-4 w-4 mr-1" />
                        Terminate
                      </button>
                    )}
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

  // Termination Modal
  const TerminationModal = () => {
    if (!showTerminateModal || !selectedRental) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
          <div className="flex items-center mb-4">
            <X className="h-6 w-6 text-red-600 mr-2" />
            <h2 className="text-xl font-semibold text-gray-900">Terminate Rental Agreement</h2>
          </div>
          
          <div className="mb-4">
            <p className="text-gray-600 mb-2">
              You are about to terminate your rental agreement for:
            </p>
            <div className="bg-gray-50 p-3 rounded">
              <p className="font-medium">{selectedRental.house_title}</p>
              <p className="text-sm text-gray-600">Monthly Rent: ${selectedRental.monthly_rent}</p>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rate Your Experience (Optional)
            </label>
            <StarRating value={rating} onChange={setRating} />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Leave a Comment (Optional)
            </label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              rows="3"
              placeholder="Share your experience with this property..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
          </div>

          <div className="flex justify-end space-x-3">
            <button
              onClick={() => setShowTerminateModal(false)}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={confirmTermination}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center"
            >
              <X className="h-4 w-4 mr-2" />
              Terminate Agreement
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      {renderTenantView()}
      <TerminationModal />
    </>
  );
};

export default RentalHistoryWithTerminate;
