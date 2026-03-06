import React, { useState, useEffect } from 'react';
import { Star, ThumbsUp, MessageSquare, Edit, Trash2 } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';

const RatingSystem = ({ houseId, landlordId }) => {
  const { user } = useAuth();
  const [ratings, setRatings] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [totalRatings, setTotalRatings] = useState(0);
  const [myRating, setMyRating] = useState(null);
  const [showRatingForm, setShowRatingForm] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [hoveredStar, setHoveredStar] = useState(0);

  useEffect(() => {
    fetchRatings();
    if (user && user.role === 'tenant') {
      fetchMyRating();
    }
  }, [houseId, user]);

  const fetchRatings = async () => {
    try {
      const response = await axios.get(`/api/houses/${houseId}/ratings`);
      setRatings(response.data.ratings);
      setAverageRating(response.data.average_rating);
      setTotalRatings(response.data.total_ratings);
    } catch (error) {
      console.error('Error fetching ratings:', error);
    }
  };

  const fetchMyRating = async () => {
    try {
      const response = await axios.get(`/api/houses/${houseId}/my-rating`);
      if (response.data) {
        setMyRating(response.data);
        setRating(response.data.rating);
        setComment(response.data.comment);
      }
    } catch (error) {
      console.error('Error fetching my rating:', error);
    }
  };

  const handleSubmitRating = async (e) => {
    e.preventDefault();
    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }

    setLoading(true);
    try {
      await axios.post(`/api/houses/${houseId}/ratings`, {
        rating,
        comment
      });
      
      toast.success(myRating ? 'Rating updated successfully!' : 'Rating submitted successfully!');
      setShowRatingForm(false);
      fetchRatings();
      fetchMyRating();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit rating');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRating = async () => {
    if (!confirm('Are you sure you want to delete your rating?')) {
      return;
    }

    try {
      await axios.delete(`/api/ratings/${myRating.id}`);
      toast.success('Rating deleted successfully!');
      setMyRating(null);
      setRating(0);
      setComment('');
      fetchRatings();
    } catch (error) {
      toast.error('Failed to delete rating');
    }
  };

  const renderStars = (rating, interactive = false) => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-5 h-5 ${
              star <= (interactive ? hoveredStar || rating : rating)
                ? 'text-yellow-400 fill-current'
                : 'text-gray-300'
            } ${interactive ? 'cursor-pointer hover:text-yellow-400' : ''}`}
            onClick={() => interactive && setRating(star)}
            onMouseEnter={() => interactive && setHoveredStar(star)}
            onMouseLeave={() => interactive && setHoveredStar(0)}
          />
        ))}
      </div>
    );
  };

  const canRate = user && user.role === 'tenant' && landlordId !== user.id;

  return (
    <div className="space-y-6">
      {/* Rating Summary */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Ratings & Reviews</h3>
          <div className="flex items-center space-x-2">
            {totalRatings > 0 ? (
              <>
                {renderStars(Math.round(averageRating))}
                <span className="text-lg font-medium text-gray-900 dark:text-white">
                  {averageRating.toFixed(1)}
                </span>
                <span className="text-gray-500 dark:text-gray-400">
                  ({totalRatings} {totalRatings === 1 ? 'rating' : 'ratings'})
                </span>
              </>
            ) : (
              <span className="text-gray-500 dark:text-gray-400">
                No ratings yet
              </span>
            )}
          </div>
        </div>

        {/* Rating Form for Tenants */}
        {canRate && (
          <div className="border-t pt-4">
            {myRating ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Your Rating:</p>
                    <div className="flex items-center space-x-2">
                      {renderStars(myRating.rating)}
                      <span className="text-sm text-gray-900 dark:text-white">{myRating.rating}/5</span>
                    </div>
                    {myRating.comment && (
                      <p className="text-gray-700 dark:text-gray-300 mt-2">{myRating.comment}</p>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setShowRatingForm(true)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={handleDeleteRating}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowRatingForm(true)}
                className="w-full py-2 px-4 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center"
              >
                Rate this Property
              </button>
            )}
          </div>
        )}
      </div>

      {/* Rating Form Modal */}
      {showRatingForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
              {myRating ? 'Update Your Rating' : 'Rate this Property'}
            </h3>
            <form onSubmit={handleSubmitRating} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Rating
                </label>
                <div className="flex justify-center">
                  {renderStars(rating, true)}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Comment (optional)
                </label>
                <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="Share your experience..."
                  />
              </div>
              <div className="flex space-x-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-2 px-4 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
                >
                  {loading ? 'Submitting...' : (myRating ? 'Update' : 'Submit')}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowRatingForm(false);
                    if (myRating) {
                      setRating(myRating.rating);
                      setComment(myRating.comment);
                    } else {
                      setRating(0);
                      setComment('');
                    }
                  }}
                  className="flex-1 py-2 px-4 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Ratings List */}
      <div className="space-y-4">
        {ratings.length > 0 ? (
          ratings.map((ratingItem) => (
            <div key={ratingItem.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                      <span className="text-primary-600 font-semibold">
                        {ratingItem.full_name?.charAt(0) || ratingItem.username?.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {ratingItem.full_name || ratingItem.username}
                      </p>
                      <div className="flex items-center space-x-2">
                        {renderStars(ratingItem.rating)}
                        <span className="text-sm text-gray-500">
                          {new Date(ratingItem.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  {ratingItem.comment && (
                    <p className="text-gray-700 dark:text-gray-300 mt-3">
                      {ratingItem.comment}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 bg-white dark:bg-gray-800 rounded-lg">
            <MessageSquare className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No ratings yet</h3>
            <p className="text-gray-500 dark:text-gray-400">
              Be the first to rate this property!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RatingSystem;
