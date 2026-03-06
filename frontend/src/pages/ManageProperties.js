import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { Home, Edit, Trash2, Eye, EyeOff, Plus, MapPin, Bed, Bath, DollarSign, Calendar, Users, Star, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import BackButton from '../components/BackButton';

const ManageProperties = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/houses/all', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      const myProperties = response.data.filter(property => property.landlord_id === user.id);
      setProperties(myProperties);
    } catch (error) {
      setError('Failed to fetch properties');
      console.error('Error fetching properties:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProperty = async (propertyId) => {
    const property = properties.find(p => p.id === propertyId);
    
    if (!property.available) {
      setError('Cannot delete unavailable property. Please make it available first.');
      setTimeout(() => setError(''), 3000);
      return;
    }
    
    if (!window.confirm('Are you sure you want to delete this property? This action cannot be undone.')) {
      return;
    }

    try {
      await axios.delete(`http://localhost:5000/api/houses/${propertyId}`);
      setProperties(properties.filter(p => p.id !== propertyId));
      setSuccess('Property deleted successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError('Failed to delete property');
      console.error('Error deleting property:', error);
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleToggleAvailability = async (propertyId, currentAvailability) => {
    try {
      await axios.put(`http://localhost:5000/api/houses/${propertyId}/availability`, {
        available: !currentAvailability
      });
      setProperties(properties.map(p => 
        p.id === propertyId ? { ...p, available: !currentAvailability } : p
      ));
      setSuccess(`Property marked as ${!currentAvailability ? 'available' : 'unavailable'}`);
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError('Failed to update property availability');
      console.error('Error updating availability:', error);
      setTimeout(() => setError(''), 3000);
    }
  };

  const parseImages = (property) => {
    try {
      if (!property.images) return [];
      const images = typeof property.images === 'string' ? JSON.parse(property.images) : property.images;
      
      // Check if images are base64 data URLs
      if (images.length > 0 && images[0].startsWith('data:')) {
        return images; // Return base64 URLs directly
      }
      
      return images; // Return file paths (for backward compatibility)
    } catch (error) {
      console.error('Error parsing images:', error);
      return [];
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
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <BackButton to="/dashboard" className="mr-4" />
          <h1 className="text-3xl font-bold text-gray-900">Manage Properties</h1>
        </div>
        <Link to="/add-house" className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors flex items-center">
          <Plus className="h-5 w-5 mr-2" />
          Add New Property
        </Link>
      </div>

      {/* Alerts */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center">
          <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
          <span className="text-red-800">{error}</span>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center">
          <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
          <span className="text-green-800">{success}</span>
        </div>
      )}

      {/* Properties Grid */}
      {properties.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <Home className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Properties Yet</h3>
          <p className="text-gray-600 mb-4">Start by adding your first property to the platform.</p>
          <Link to="/add-house" className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors inline-flex items-center">
            <Plus className="h-5 w-5 mr-2" />
            Add Your First Property
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map((property) => (
            <div key={property.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              {/* Property Image */}
              <div className="relative h-48 bg-gray-200">
                {(() => {
                  const images = parseImages(property);
                  return images && images.length > 0 ? (
                    <img
                      src={images[0].startsWith('data:') ? images[0] : `http://localhost:5000${images[0]}`}
                      alt={property.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <Home className="h-12 w-12 text-gray-400" />
                    </div>
                  );
                })()}
                
                {/* Availability Badge */}
                <div className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-medium ${
                  property.available 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {property.available ? 'Available' : 'Unavailable'}
                </div>
              </div>

              {/* Property Details */}
              <div className="p-4">
                <h3 className="font-semibold text-lg text-gray-900 mb-2">{property.title}</h3>
                
                <div className="space-y-2 text-sm text-gray-600 mb-4">
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-2" />
                    {property.city}, {property.state}
                  </div>
                  <div className="flex items-center">
                    <DollarSign className="h-4 w-4 mr-2" />
                    ${property.price}/month
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center">
                      <Bed className="h-4 w-4 mr-1" />
                      {property.bedrooms} beds
                    </div>
                    <div className="flex items-center">
                      <Bath className="h-4 w-4 mr-1" />
                      {property.bathrooms} baths
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-2">
                  <Link
                    to={`/edit-house/${property.id}`}
                    className="flex-1 bg-primary-600 text-white px-3 py-2 rounded hover:bg-primary-700 transition-colors flex items-center justify-center text-sm"
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Link>
                  
                  <button
                    onClick={() => handleToggleAvailability(property.id, property.available)}
                    className={`flex-1 px-3 py-2 rounded transition-colors flex items-center justify-center text-sm ${
                      property.available
                        ? 'bg-yellow-600 text-white hover:bg-yellow-700'
                        : 'bg-green-600 text-white hover:bg-green-700'
                    }`}
                  >
                    {property.available ? (
                      <>
                        <EyeOff className="h-4 w-4 mr-1" />
                        Unavailable
                      </>
                    ) : (
                      <>
                        <Eye className="h-4 w-4 mr-1" />
                        Available
                      </>
                    )}
                  </button>
                  
                  <button
                    onClick={() => handleDeleteProperty(property.id)}
                    disabled={!property.available}
                    className={`px-3 py-2 rounded transition-colors flex items-center justify-center text-sm ${
                      !property.available
                        ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                        : 'bg-red-600 text-white hover:bg-red-700'
                    }`}
                    title={property.available ? 'Delete Property' : 'Cannot delete unavailable property'}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Statistics */}
      {properties.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Property Statistics</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary-600">{properties.length}</div>
              <div className="text-sm text-gray-600">Total Properties</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {properties.filter(p => p.available).length}
              </div>
              <div className="text-sm text-gray-600">Available</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {properties.filter(p => !p.available).length}
              </div>
              <div className="text-sm text-gray-600">Unavailable</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                ${properties.reduce((sum, p) => sum + parseFloat(p.price), 0).toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">Total Monthly Value</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageProperties;
