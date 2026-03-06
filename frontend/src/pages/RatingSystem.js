import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Star, MessageSquare, ThumbsUp, ThumbsDown, Calendar, User, Home, MapPin } from 'lucide-react';
import axios from 'axios';
import BackButton from '../components/BackButton';

const RatingSystem = () => {
  const { user } = useAuth();
  const [rentalHistory, setRentalHistory] = useState([]);
  const [ratings, setRatings] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (user && user.role === 'tenant') {
      fetchRentalHistory();
    }
  }, [user]);

  const fetchRentalHistory = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/rental-history');
      const tenantHistory = response.data.filter(history => 
        history.tenant_id === user.id && history.status === 'completed'
      );
      setRentalHistory(tenantHistory);
      
      // Fetch existing ratings
      const ratingsResponse = await axios.get('http://localhost:5000/api/ratings');
      const userRatings = {};
      ratingsResponse.data.forEach(rating => {
        if (rating.tenant_id === user.id) {
          userRatings[rating.house_id] = rating;
        }
      });
      setRatings(userRatings);
    } catch (error) {
      setError('Failed to fetch rental history');
      console.error('Error fetching rental history:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRatingSubmit = async (houseId, rating, review) => {
    try {
      const existingRating = ratings[houseId];
      
      if (existingRating) {
        await axios.put(`http://localhost:5000/api/ratings/${existingRating.id}`, {
          rating,
          review
        });
      } else {
        await axios.post('http://localhost:5000/api/ratings', {
          house_id: houseId,
          tenant_id: user.id,
          rating,
          review
        });
      }

      // Update local state
      setRatings({
        ...ratings,
        [houseId]: {
          ...ratings[houseId],
          rating,
          review,
          tenant_id: user.id,
          house_id: houseId
        }
      });

      setSuccess('Rating submitted successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError('Failed to submit rating');
      console.error('Error submitting rating:', error);
      setTimeout(() => setError(''), 3000);
    }
  };

  const renderStars = (rating) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating
                ? 'text-yellow-400 fill-current'
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  const StarRating = ({ houseId, currentRating = 0, onRatingChange }) => {
    const [hoveredStar, setHoveredStar] = useState(0);
    const [selectedRating, setSelectedRating] = useState(currentRating);

    const handleStarClick = (star) => {
      setSelectedRating(star);
      onRatingChange(star);
    };

    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            className="focus:outline-none"
            onMouseEnter={() => setHoveredStar(star)}
            onMouseLeave={() => setHoveredStar(0)}
            onClick={() => handleStarClick(star)}
          >
            <Star
              className={`h-6 w-6 transition-colors ${
                star <= (hoveredStar || selectedRating)
                  ? 'text-yellow-400 fill-current'
                  : 'text-gray-300'
              }`}
            />
          </button>
        ))}
        <span className="ml-2 text-sm text-gray-600">
          {selectedRating > 0 ? `${selectedRating} stars` : 'Select rating'}
        </span>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (user?.role !== 'tenant') {
    return (
      <div className="text-center py-12">
        <Star className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Access Restricted</h3>
        <p className="text-gray-600">Only tenants can rate properties they have rented.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Rate Your Rental Experience</h1>
          <BackButton to="/dashboard" />
        </div>

        {/* Alerts */}
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center">
            <ThumbsDown className="h-5 w-5 text-red-600 mr-2" />
            <span className="text-red-800">{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-4 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center">
            <ThumbsUp className="h-5 w-5 text-green-600 mr-2" />
            <span className="text-green-800">{success}</span>
          </div>
        )}

        {rentalHistory.length === 0 ? (
          <div className="text-center py-12">
            <Home className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Completed Rentals</h3>
            <p className="text-gray-600">You haven't completed any rentals yet. Once you complete a rental, you can rate the property here.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {rentalHistory.map((rental) => (
              <div key={rental.id} className="border border-gray-200 rounded-lg p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{rental.title}</h3>
                    <div className="flex items-center text-sm text-gray-600 mt-1">
                      <MapPin className="h-4 w-4 mr-1" />
                      {rental.city}, {rental.state}
                    </div>
                    <div className="flex items-center text-sm text-gray-600 mt-1">
                      <Calendar className="h-4 w-4 mr-1" />
                      Rented: {new Date(rental.start_date).toLocaleDateString()} - {new Date(rental.end_date).toLocaleDateString()}
                    </div>
                  </div>
                  
                  {ratings[rental.house_id] && (
                    <div className="flex items-center bg-yellow-50 px-3 py-1 rounded-full">
                      <Star className="h-4 w-4 text-yellow-400 fill-current mr-1" />
                      <span className="text-sm font-medium text-yellow-800">
                        {ratings[rental.house_id].rating} stars
                      </span>
                    </div>
                  )}
                </div>

                {/* Rating Form */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Your Rating
                    </label>
                    {ratings[rental.house_id] ? (
                      renderStars(ratings[rental.house_id]?.rating || 0)
                    ) : (
                      <span className="text-gray-500 text-sm">No rating yet</span>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Your Review (Optional)
                    </label>
                    <textarea
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows="3"
                      placeholder="Share your experience with this property..."
                      defaultValue={ratings[rental.house_id]?.review || ''}
                      id={`review-${rental.house_id}`}
                    />
                  </div>

                  <button
                    onClick={() => {
                      const rating = document.querySelector(`input[name="rating-${rental.house_id}"]:checked`)?.value || 
                                   ratings[rental.house_id]?.rating || 0;
                      const review = document.getElementById(`review-${rental.house_id}`).value;
                      handleRatingSubmit(rental.house_id, rating, review);
                    }}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                  >
                    <Star className="h-4 w-4 mr-2" />
                    {ratings[rental.house_id] ? 'Update Rating' : 'Submit Rating'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RatingSystem;
