import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { MapPin, Bed, Bath, Square, DollarSign, Home, Phone, Mail, Calendar, Send, ArrowLeft, Star, Shield, Check, X, Heart, Share2 } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import RatingSystem from '../components/RatingSystem';

const HouseDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [house, setHouse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [requestMessage, setRequestMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    fetchHouseDetails();
  }, [id]);

  const fetchHouseDetails = async () => {
    try {
      const response = await axios.get(`/api/houses/${id}`);
      setHouse(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching house details:', error);
      toast.error('Failed to load house details');
      setLoading(false);
    }
  };

  const handleRentalRequest = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please login to send a rental request');
      navigate('/login');
      return;
    }

    if (user.role !== 'tenant') {
      toast.error('Only tenants can send rental requests');
      return;
    }

    setSubmitting(true);
    try {
      await axios.post('http://localhost:5000/api/rental-requests', {
        house_id: parseInt(id),
        message: requestMessage
      });
      toast.success('Rental request sent successfully!');
      setRequestMessage('');
      setShowRequestForm(false);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send request');
    }
    setSubmitting(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!house) {
    return (
      <div className="text-center py-12">
        <Home className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Property not found</h3>
        <p className="text-gray-500 mb-4">The property you're looking for doesn't exist.</p>
        <button onClick={() => navigate('/')} className="btn btn-primary">
          Back to Properties
        </button>
      </div>
    );
  }

  const images = house.images ? (() => {
    try {
      return typeof house.images === 'string' ? JSON.parse(house.images) : house.images;
    } catch (e) {
      console.error('Error parsing images:', e);
      return [];
    }
  })() : [];

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft className="h-5 w-5 mr-2" />
        Back
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Image Gallery */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {images.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 p-4">
                {images.map((image, index) => (
                  <img
                    key={index}
                    src={image.startsWith('data:') ? image : `http://localhost:5000${image}`}
                    alt={`${house.title} - Image ${index + 1}`}
                    className="w-full h-64 object-cover rounded-lg"
                  />
                ))}
              </div>
            ) : (
              <div className="h-64 bg-gray-200 flex items-center justify-center">
                <Home className="h-12 w-12 text-gray-400" />
              </div>
            )}
          </div>

          {/* Property Details */}
          <div className="card">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{house.title}</h1>
                <div className="flex items-center text-gray-600 mb-2">
                  <MapPin className="h-5 w-5 mr-2" />
                  <span>{house.address}, {house.city}, {house.state} {house.postal_code}</span>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center justify-end">
                  <DollarSign className="h-6 w-6 text-green-600 mr-1" />
                  <span className="text-3xl font-bold text-green-600">${house.price}</span>
                </div>
                <p className="text-gray-500">per month</p>
              </div>
            </div>

            {/* Property Features */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="flex items-center">
                <Bed className="h-5 w-5 text-gray-600 mr-2" />
                <span>{house.bedrooms} Bedrooms</span>
              </div>
              <div className="flex items-center">
                <Bath className="h-5 w-5 text-gray-600 mr-2" />
                <span>{house.bathrooms} Bathrooms</span>
              </div>
              {house.area_sqft && (
                <div className="flex items-center">
                  <Square className="h-5 w-5 text-gray-600 mr-2" />
                  <span>{house.area_sqft} sqft</span>
                </div>
              )}
            </div>

            {/* Amenities */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3">Amenities</h3>
              <div className="flex flex-wrap gap-2">
                {house.furnished && (
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">Furnished</span>
                )}
                {house.parking && (
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">Parking Available</span>
                )}
                {house.pet_friendly && (
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">Pet Friendly</span>
                )}
              </div>
            </div>

            {/* Description */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Description</h3>
              <p className="text-gray-700 leading-relaxed">
                {house.description || 'No description available for this property.'}
              </p>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Landlord Info */}
          <div className="card">
            <h3 className="text-lg font-semibold mb-4">Landlord Information</h3>
            <div className="space-y-3">
              <div>
                <p className="font-medium">{house.landlord_name}</p>
                <p className="text-sm text-gray-600">Property Owner</p>
              </div>
              {house.landlord_email && (
                <div className="flex items-center text-gray-600">
                  <Mail className="h-4 w-4 mr-2" />
                  <span className="text-sm">{house.landlord_email}</span>
                </div>
              )}
            </div>
          </div>

          {/* Availability Status */}
          <div className="card">
            <h3 className="text-lg font-semibold mb-4">Availability</h3>
            <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
              house.available 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {house.available ? 'Available' : 'Not Available'}
            </div>
            <p className="text-sm text-gray-600 mt-2">
              {house.available 
                ? 'This property is currently available for rent.'
                : 'This property is currently not available.'}
            </p>
          </div>

          {/* Rental Request */}
          {house.available && user && user.role === 'tenant' && (
            <div className="card">
              <h3 className="text-lg font-semibold mb-4">Send Rental Request</h3>
              {!showRequestForm ? (
                <button
                  onClick={() => setShowRequestForm(true)}
                  className="w-full btn btn-primary flex items-center justify-center"
                >
                  <Send className="h-5 w-5 mr-2" />
                  Send Request
                </button>
              ) : (
                <form onSubmit={handleRentalRequest}>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Message to Landlord (Optional)
                    </label>
                    <textarea
                      value={requestMessage}
                      onChange={(e) => setRequestMessage(e.target.value)}
                      rows={4}
                      className="input"
                      placeholder="Introduce yourself and mention why you're interested in this property..."
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="flex-1 btn btn-primary"
                    >
                      {submitting ? 'Sending...' : 'Send Request'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowRequestForm(false)}
                      className="flex-1 btn btn-secondary"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* Rating System */}
          <RatingSystem houseId={house.id} landlordId={house.landlord_id} />

          {/* Login Prompt */}
          {!user && (
            <div className="card">
              <h3 className="text-lg font-semibold mb-4">Interested in this property?</h3>
              <p className="text-gray-600 mb-4">
                Login to your account to send a rental request to the landlord.
              </p>
              <button
                onClick={() => navigate('/login')}
                className="w-full btn btn-primary"
              >
                Login to Send Request
              </button>
            </div>
          )}

          {/* Listed Date */}
          <div className="card">
            <h3 className="text-lg font-semibold mb-4">Property Information</h3>
            <div className="flex items-center text-gray-600">
              <Calendar className="h-4 w-4 mr-2" />
              <span className="text-sm">
                Listed on {new Date(house.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HouseDetails;