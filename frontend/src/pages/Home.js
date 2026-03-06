import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, MapPin, Bed, Bath, DollarSign, Home as HomeIcon, Filter, Calendar, Users, Star, Facebook, Twitter, Instagram, Linkedin, Phone, Mail, Shield, TrendingUp, Award, Clock } from 'lucide-react';
import axios from 'axios';

const Home = () => {
  const [houses, setHouses] = useState([]);
  const [filteredHouses, setFilteredHouses] = useState([]);
  const [houseRatings, setHouseRatings] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    city: '',
    min_price: '',
    max_price: '',
    bedrooms: '',
    sort_by: 'price'
  });
  const [showFilters, setShowFilters] = useState(false);

  // Helper function to safely parse images
  const parseImages = (house) => {
    try {
      if (!house.images) return [];
      const images = typeof house.images === 'string' ? JSON.parse(house.images) : house.images;
      
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

  useEffect(() => {
    fetchHouses();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [houses, filters, searchTerm]);

  const fetchHouses = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/houses'); // ✅ UPDATED
      setHouses(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching houses:', error);
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = houses;

    // Apply search term
    if (searchTerm) {
      filtered = filtered.filter(house =>
        house.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        house.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
        house.address.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply filters
    if (filters.city) {
      filtered = filtered.filter(house =>
        house.city.toLowerCase().includes(filters.city.toLowerCase())
      );
    }

    if (filters.min_price) {
      filtered = filtered.filter(house => house.price >= parseFloat(filters.min_price));
    }

    if (filters.max_price) {
      filtered = filtered.filter(house => house.price <= parseFloat(filters.max_price));
    }

    if (filters.bedrooms) {
      filtered = filtered.filter(house => house.bedrooms === parseInt(filters.bedrooms));
    }

    // Apply sorting
    if (filters.sort_by === 'price') {
      filtered.sort((a, b) => a.price - b.price);
    } else if (filters.sort_by === 'price_desc') {
      filtered.sort((a, b) => b.price - a.price);
    } else if (filters.sort_by === 'newest') {
      filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }

    setFilteredHouses(filtered);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      city: '',
      min_price: '',
      max_price: '',
      bedrooms: '',
      sort_by: 'price'
    });
    setSearchTerm('');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Professional Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            {/* Logo and Brand */}
            <div className="flex items-center">
              <HomeIcon className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">RentalHub</h1>
                <p className="text-sm text-gray-600">Find Your Perfect Home</p>
              </div>
            </div>

            {/* Navigation */}
            <nav className="hidden md:flex space-x-8">
              <Link to="/" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                Home
              </Link>
              <Link to="/dashboard" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                Dashboard
              </Link>
              {false && (
                <>
                  <Link to="/rental-requests" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                    Requests
                  </Link>
                  <Link to="/rental-history" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                    History
                  </Link>
                  {false && (
                    <Link to="/add-house" className="bg-blue-600 text-white hover:bg-blue-700 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                      Add Property
                    </Link>
                  )}
                </>
              )}
              {!false && (
                <>
                  <Link to="/login" className="bg-blue-600 text-white hover:bg-blue-700 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                    Login
                  </Link>
                  <Link to="/register" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                    Register
                  </Link>
                </>
              )}
            </nav>

            {/* CTA Button */}
            <div className="hidden md:block">
              {!false ? (
                <Link to="/register" className="bg-green-600 text-white hover:bg-green-700 px-4 py-2 rounded-lg text-sm font-semibold transition-colors">
                  List Your Property
                </Link>
              ) : (
                <Link to="/dashboard" className="bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-lg text-sm font-semibold transition-colors">
                  Welcome Back
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h2 className="text-4xl font-bold mb-4">Find Your Dream Rental Home</h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto">
              Discover the perfect place to call home with our extensive collection of verified rental properties
            </p>
            <div className="flex justify-center space-x-4">
              <Link to="/" className="bg-white text-blue-600 hover:bg-gray-100 px-6 py-3 rounded-lg text-lg font-semibold transition-colors">
                Browse Properties
              </Link>
              <Link to="/register" className="border-2 border-white text-white hover:bg-white hover:text-blue-600 px-6 py-3 rounded-lg text-lg font-semibold transition-colors">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose RentalHub?</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              We make renting simple, safe, and transparent for everyone involved
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 rounded-full p-4 w-16 h-16 mx-auto mb-4">
                <Shield className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Verified Properties</h3>
              <p className="text-gray-600">All listings are verified by our team for authenticity</p>
            </div>
            
            <div className="text-center">
              <div className="bg-green-100 rounded-full p-4 w-16 h-16 mx-auto mb-4">
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Best Prices</h3>
              <p className="text-gray-600">Compare prices from multiple landlords in one place</p>
            </div>
            
            <div className="text-center">
              <div className="bg-purple-100 rounded-full p-4 w-16 h-16 mx-auto mb-4">
                <Users className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Direct Communication</h3>
              <p className="text-gray-600">Connect directly with property owners</p>
            </div>
            
            <div className="text-center">
              <div className="bg-yellow-100 rounded-full p-4 w-16 h-16 mx-auto mb-4">
                <Award className="h-8 w-8 text-yellow-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Secure Process</h3>
              <p className="text-gray-600">Safe and secure rental process from start to finish</p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-800 text-white rounded-lg p-8">
          <h1 className="text-4xl font-bold mb-4">Find Your Perfect Rental Home</h1>
          <p className="text-xl mb-6">Discover the best rental properties in your area</p>
          
          {/* Search Bar */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
          <h3 className="text-lg font-semibold mb-4">Filters</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
              <input
                type="text"
                name="city"
                value={filters.city}
                onChange={handleFilterChange}
                placeholder="Enter city"
                className="input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Min Price</label>
              <input
                type="number"
                name="min_price"
                value={filters.min_price}
                onChange={handleFilterChange}
                placeholder="0"
                className="input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Max Price</label>
              <input
                type="number"
                name="max_price"
                value={filters.max_price}
                onChange={handleFilterChange}
                placeholder="10000"
                className="input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bedrooms</label>
              <select
                name="bedrooms"
                value={filters.bedrooms}
                onChange={handleFilterChange}
                className="input"
              >
                <option value="">Any</option>
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4+</option>
              </select>
            </div>
          </div>
          <div className="flex justify-between items-center mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
              <select
                name="sort_by"
                value={filters.sort_by}
                onChange={handleFilterChange}
                className="input"
              >
                <option value="price">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="newest">Newest First</option>
              </select>
            </div>
            <button
              onClick={clearFilters}
              className="btn btn-secondary"
            >
              Clear Filters
            </button>
          </div>
        </div>
      )}

      {/* Results Summary */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">
          {filteredHouses.length} Properties Found
        </h2>
      </div>

      {/* House Listings */}
      {filteredHouses.length === 0 ? (
        <div className="text-center py-12">
          <HomeIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No properties found</h3>
          <p className="text-gray-500">Try adjusting your search criteria or filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredHouses.map((house) => (
            <div key={house.id} className="card hover:shadow-lg transition-shadow duration-300">
              {/* House Image */}
              <div className="relative h-48 bg-gray-200 rounded-t-lg overflow-hidden group">
                {(() => {
                  const images = parseImages(house);
                  return images && images.length > 0;
                })() ? (
                  <img
                    src={`http://localhost:5000${parseImages(house)[0]}`}
                    alt={house.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <HomeIcon className="h-12 w-12 text-gray-400" />
                  </div>
                )}
                <div className="absolute top-2 right-2 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold shadow-lg">
                  Available
                </div>
                <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg text-xs font-medium text-gray-700">
                  {house.bedrooms} bed • {house.bathrooms} bath
                </div>
              </div>

              {/* House Details */}
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-bold text-gray-900 hover:text-blue-600 transition-colors cursor-pointer">
                    {house.title}
                  </h3>
                  <div className="flex items-center text-yellow-500">
                    <Star className="h-4 w-4 fill-current" />
                    <span className="text-sm ml-1">4.8</span>
                  </div>
                </div>
                
                <div className="flex items-center text-gray-600 mb-2">
                  <MapPin className="h-4 w-4 mr-1 text-blue-500" />
                  <span className="text-sm font-medium">{house.city}, {house.state}</span>
                </div>

                <div className="flex items-center text-gray-500 mb-3">
                  <MapPin className="h-3 w-3 mr-1" />
                  <span className="text-xs truncate">{house.address}</span>
                </div>

                <div className="flex justify-between items-center mb-3">
                  <div className="flex gap-4">
                    <div className="flex items-center text-gray-600">
                      <Bed className="h-4 w-4 mr-1 text-purple-500" />
                      <span className="text-sm font-medium">{house.bedrooms} beds</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Bath className="h-4 w-4 mr-1 text-cyan-500" />
                      <span className="text-sm font-medium">{house.bathrooms} baths</span>
                    </div>
                  </div>
                  {house.area_sqft && (
                    <div className="text-gray-600">
                      <span className="text-sm font-medium">{house.area_sqft} sqft</span>
                    </div>
                  )}
                </div>

                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center">
                    <DollarSign className="h-6 w-6 text-green-600 mr-1" />
                    <span className="text-2xl font-bold text-green-600">${house.price}</span>
                    <span className="text-sm text-gray-500 ml-1">/month</span>
                  </div>
                  <div className="text-xs text-gray-500">
                    Listed {new Date(house.created_at).toLocaleDateString()}
                  </div>
                </div>

                {/* Amenities */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {house.furnished && (
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full font-medium">Furnished</span>
                  )}
                  {house.parking && (
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full font-medium">Parking</span>
                  )}
                  {house.pet_friendly && (
                    <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full font-medium">Pet Friendly</span>
                  )}
                </div>

                <div className="flex gap-2">
                  <Link
                    to={`/house/${house.id}`}
                    className="flex-1 btn btn-primary text-center"
                  >
                    View Details
                  </Link>
                  <button className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                    <Star className="h-4 w-4 text-gray-400" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Home;