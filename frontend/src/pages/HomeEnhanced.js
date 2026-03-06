import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, MapPin, Home as HomeIcon, DollarSign, Bed, Bath, Square, Calendar, Star, Filter, Heart, Eye, Users, Facebook, Twitter, Instagram, Linkedin, Phone, Mail, Shield, TrendingUp, Award, Clock, LogIn, UserPlus } from 'lucide-react';
import axios from 'axios';
import Footer from '../components/Footer';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from 'react-i18next';

const Home = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
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
      const response = await axios.get('/api/houses');
      setHouses(response.data);
      
      // Fetch ratings for each house
      const ratingsPromises = response.data.map(async (house) => {
        try {
          const ratingResponse = await axios.get(`/api/houses/${house.id}/ratings`);
          return {
            houseId: house.id,
            averageRating: ratingResponse.data.average_rating || 0,
            totalRatings: ratingResponse.data.total_ratings || 0
          };
        } catch (error) {
          console.error(`Error fetching ratings for house ${house.id}:`, error);
          return {
            houseId: house.id,
            averageRating: 0,
            totalRatings: 0
          };
        }
      });
      
      const ratingsData = await Promise.all(ratingsPromises);
      const ratingsMap = {};
      ratingsData.forEach(rating => {
        ratingsMap[rating.houseId] = rating;
      });
      setHouseRatings(ratingsMap);
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching houses:', error);
      setLoading(false);
    }
  };

  const refreshRatings = async () => {
    // Refresh ratings for all houses
    if (houses.length > 0) {
      const ratingsPromises = houses.map(async (house) => {
        try {
          const ratingResponse = await axios.get(`/api/houses/${house.id}/ratings`);
          return {
            houseId: house.id,
            averageRating: ratingResponse.data.average_rating || 0,
            totalRatings: ratingResponse.data.total_ratings || 0
          };
        } catch (error) {
          return {
            houseId: house.id,
            averageRating: 0,
            totalRatings: 0
          };
        }
      });
      
      const ratingsData = await Promise.all(ratingsPromises);
      const ratingsMap = {};
      ratingsData.forEach(rating => {
        ratingsMap[rating.houseId] = rating;
      });
      setHouseRatings(ratingsMap);
    }
  };

  // Refresh ratings every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      refreshRatings();
    }, 30000);
    
    return () => clearInterval(interval);
  }, [houses]);

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
      filtered = filtered.filter(house => house.city.toLowerCase().includes(filters.city.toLowerCase()));
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

    // Sort
    filtered.sort((a, b) => {
      if (filters.sort_by === 'price') {
        return a.price - b.price;
      } else if (filters.sort_by === 'price_desc') {
        return b.price - a.price;
      } else {
        return new Date(b.created_at) - new Date(a.created_at);
      }
    });

    setFilteredHouses(filtered);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
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

  const renderStars = (rating) => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating
                ? 'text-yellow-500 fill-current'
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  const renderRating = (houseId) => {
    const rating = houseRatings[houseId];
    if (!rating || rating.totalRatings === 0) {
      return (
        <div className="flex items-center text-gray-500">
          <Star className="h-4 w-4" />
          <span className="text-sm ml-1">No ratings</span>
        </div>
      );
    }
    
    return (
      <div className="flex items-center text-yellow-500 dark:text-yellow-400">
        {renderStars(Math.round(rating.averageRating))}
        <span className="text-sm ml-1">{rating.averageRating.toFixed(1)}</span>
        <span className="text-xs text-gray-500 ml-1">({rating.totalRatings})</span>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-900 transition-colors duration-300">
      {/* Professional Header - Only show to non-logged-in users */}
      {!user && (
        <header className="bg-white dark:bg-dark-800 shadow-sm border-b border-gray-200 dark:border-dark-700 transition-colors duration-300">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              {/* Logo and Brand */}
              <div className="flex items-center">
                <HomeIcon className="h-8 w-8 text-primary-600 dark:text-primary-400 mr-3" />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">RentalHub</h1>
                  <p className="text-sm text-gray-600 dark:text-gray-300">{t('home.findYourDream')}</p>
                </div>
              </div>

              {/* Navigation */}
              <nav className="hidden md:flex space-x-8">
                <Link to="/" className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                  {t('navigation.home')}
                </Link>
                <Link to="/dashboard" className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                  {t('navigation.dashboard')}
                </Link>
                <Link to="/rental-requests" className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                  {t('navigation.requests')}
                </Link>
                <Link to="/rental-history" className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                  {t('navigation.history')}
                </Link>
                <Link to="/add-house" className="bg-primary-600 text-white hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                  {t('navigation.addProperty')}
                </Link>
              </nav>

              {/* CTA Button */}
              <div className="hidden md:block">
                <Link to="/register" className="bg-green-600 text-white hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 px-4 py-2 rounded-lg text-sm font-semibold transition-colors">
                  {t('navigation.listYourProperty')}
                </Link>
              </div>
            </div>
          </div>
        </header>
      )}

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 dark:from-dark-800 dark:to-dark-900 text-white transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h2 className="text-4xl font-bold mb-4 text-white">{t('home.title')}</h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto text-blue-100 dark:text-gray-300">
              {t('home.subtitle')}
            </p>
            <div className="flex justify-center space-x-4">
              <Link to="/" className="bg-white text-blue-600 dark:bg-dark-700 dark:text-white hover:bg-gray-100 dark:hover:bg-dark-600 px-6 py-3 rounded-lg text-lg font-semibold transition-all duration-200 transform hover:scale-105">
                {t('home.browseProperties')}
              </Link>
              <Link to="/register" className="border-2 border-white text-white hover:bg-white hover:text-blue-600 dark:border-gray-300 dark:text-gray-300 dark:hover:bg-dark-700 dark:hover:text-white px-6 py-3 rounded-lg text-lg font-semibold transition-all duration-200 transform hover:scale-105">
                {t('home.getStarted')}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white dark:bg-dark-800 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">{t('home.whyChooseRentalHub')}</h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              {t('home.weMakeRentingSimple')}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 dark:bg-blue-900/30 rounded-full p-4 w-16 h-16 mx-auto mb-4 transition-colors duration-300">
                <Shield className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{t('home.verifiedProperties')}</h3>
              <p className="text-gray-600 dark:text-gray-300">{t('home.verifiedDescription')}</p>
            </div>
            
            <div className="text-center">
              <div className="bg-green-100 dark:bg-green-900/30 rounded-full p-4 w-16 h-16 mx-auto mb-4 transition-colors duration-300">
                <TrendingUp className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{t('home.bestPrices')}</h3>
              <p className="text-gray-600 dark:text-gray-300">{t('home.bestPricesDescription')}</p>
            </div>
            
            <div className="text-center">
              <div className="bg-purple-100 dark:bg-purple-900/30 rounded-full p-4 w-16 h-16 mx-auto mb-4 transition-colors duration-300">
                <Users className="h-8 w-8 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{t('home.directCommunication')}</h3>
              <p className="text-gray-600 dark:text-gray-300">{t('home.directCommunicationDescription')}</p>
            </div>
            
            <div className="text-center">
              <div className="bg-yellow-100 dark:bg-yellow-900/30 rounded-full p-4 w-16 h-16 mx-auto mb-4 transition-colors duration-300">
                <Award className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{t('home.secureProcess')}</h3>
              <p className="text-gray-600 dark:text-gray-300">{t('home.secureProcessDescription')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Section - Only show to non-logged-in users */}
        {!user && (
          <div className="mb-8">
            <div className="bg-white dark:bg-dark-800 rounded-lg shadow-md dark:shadow-xl p-6 border border-gray-200 dark:border-dark-700 transition-colors duration-300">
            <div className="flex items-center gap-4 mb-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search by location, property name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input pl-10 w-full"
                />
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="btn bg-white text-blue-600 hover:bg-gray-100 flex items-center gap-2"
              >
                <Filter className="h-5 w-5" />
                Filters
              </button>
            </div>

            {/* Filters Section */}
            {showFilters && (
              <div className="bg-gray-50 rounded-lg p-6 mt-4">
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
          </div>
          </div>
        )}

        {/* About Section */}
        <div className="mb-8 xs:mb-10 sm:mb-12 animate-fade-in">
          <div className="about-section bg-gradient-to-br from-primary-500 via-primary-600 to-secondary-600 rounded-2xl xs:rounded-3xl p-4 xs:p-6 sm:p-8 text-black shadow-large hover-glow">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-2xl xs:text-3xl sm:text-4xl font-bold mb-4 xs:mb-6">
                About RentalHub
              </h2>
              <p className="text-sm xs:text-base sm:text-lg mb-6 xs:mb-8 leading-relaxed text-black/90">
                RentalHub is your trusted platform for finding the perfect rental property. 
                We connect tenants with landlords through a secure, transparent, and user-friendly 
                system that makes renting simple and stress-free.
              </p>
              
              <div className="grid grid-cols-1 xs:grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 xs:gap-6 sm:gap-8 mb-6 xs:mb-8">
                <div className="bg-white/20 backdrop-blur-sm rounded-xl xs:rounded-2xl p-4 xs:p-6 hover-lift hover-glow">
                  <div className="bg-white/30 backdrop-blur-sm rounded-full w-12 xs:w-14 sm:w-16 h-12 xs:h-14 sm:h-16 flex items-center justify-center mx-auto mb-3 xs:mb-4">
                    <Shield className="h-6 xs:h-7 sm:h-8 w-6 xs:w-7 sm:w-8 text-black" />
                  </div>
                  <h3 className="text-lg xs:text-xl font-semibold mb-2">Verified Listings</h3>
                  <p className="text-xs xs:text-sm text-black/80">
                    All properties and users are verified through our ID verification system 
                    to ensure safety and authenticity.
                  </p>
                </div>
                
                <div className="bg-white/20 backdrop-blur-sm rounded-xl xs:rounded-2xl p-4 xs:p-6 hover-lift hover-glow-purple">
                  <div className="bg-white/30 backdrop-blur-sm rounded-full w-12 xs:w-14 sm:w-16 h-12 xs:h-14 sm:h-16 flex items-center justify-center mx-auto mb-3 xs:mb-4">
                    <Star className="h-6 xs:h-7 sm:h-8 w-6 xs:w-7 sm:w-8 text-black" />
                  </div>
                  <h3 className="text-lg xs:text-xl font-semibold mb-2">Real Reviews</h3>
                  <p className="text-xs xs:text-sm text-black/80">
                    Read authentic reviews from tenants who have actually lived in the properties. 
                    No fake ratings, only genuine feedback.
                  </p>
                </div>
                
                <div className="bg-white/20 backdrop-blur-sm rounded-xl xs:rounded-2xl p-4 xs:p-6 hover-lift hover-glow">
                  <div className="bg-white/30 backdrop-blur-sm rounded-full w-12 xs:w-14 sm:w-16 h-12 xs:h-14 sm:h-16 flex items-center justify-center mx-auto mb-3 xs:mb-4">
                    <Users className="h-6 xs:h-7 sm:h-8 w-6 xs:w-7 sm:w-8 text-black" />
                  </div>
                  <h3 className="text-lg xs:text-xl font-semibold mb-2">Direct Communication</h3>
                  <p className="text-xs xs:text-sm text-black/80">
                    Connect directly with property owners. No middlemen, no hidden fees, 
                    just transparent rental processes.
                  </p>
                </div>
              </div>
              
              <div className="bg-white/20 backdrop-blur-sm rounded-xl xs:rounded-2xl p-4 xs:p-6">
                <h3 className="text-lg xs:text-xl font-semibold mb-3 xs:mb-4">How It Works</h3>
                <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 xs:gap-4 text-left">
                  <div className="text-center group">
                    <div className="bg-white/30 backdrop-blur-sm rounded-full w-10 xs:w-12 sm:w-12 h-10 xs:h-12 sm:h-12 flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
                      <span className="text-sm xs:text-base font-bold">1</span>
                    </div>
                    <p className="text-xs xs:text-sm font-medium">Sign Up & Verify</p>
                    <p className="text-xs text-black/70">Create account and verify your ID</p>
                  </div>
                  <div className="text-center group">
                    <div className="bg-white/30 backdrop-blur-sm rounded-full w-10 xs:w-12 sm:w-12 h-10 xs:h-12 sm:h-12 flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
                      <span className="text-sm xs:text-base font-bold">2</span>
                    </div>
                    <p className="text-xs xs:text-sm font-medium">Browse Properties</p>
                    <p className="text-xs text-black/70">Find your perfect rental home</p>
                  </div>
                  <div className="text-center group">
                    <div className="bg-white/30 backdrop-blur-sm rounded-full w-10 xs:w-12 sm:w-12 h-10 xs:h-12 sm:h-12 flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
                      <span className="text-sm xs:text-base font-bold">3</span>
                    </div>
                    <p className="text-xs xs:text-sm font-medium">Request Rental</p>
                    <p className="text-xs text-black/70">Contact landlord and finalize</p>
                  </div>
                  <div className="text-center group">
                    <div className="bg-white/30 backdrop-blur-sm rounded-full w-10 xs:w-12 sm:w-12 h-10 xs:h-12 sm:h-12 flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
                      <span className="text-sm xs:text-base font-bold">4</span>
                    </div>
                    <p className="text-xs xs:text-sm font-medium">Rate & Review</p>
                    <p className="text-xs text-black/70">Share your experience</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Results Summary - Only show to non-logged-in users */}
        {!user && (
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold">
              {filteredHouses.length} Properties Found
            </h2>
          </div>
        )}

        {/* Property Listings - Show to all users */}
        {filteredHouses.length === 0 ? (
          <div className="text-center py-12">
            <HomeIcon className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No properties found</h3>
            <p className="text-gray-500 dark:text-gray-400">Try adjusting your search criteria or filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 xs:grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 xs:gap-6">
            {filteredHouses.map((house) => (
              <div key={house.id} className="card hover:shadow-lg dark:hover:shadow-xl transition-all duration-300 bg-white dark:bg-dark-800 border border-gray-200 dark:border-dark-700">
                {/* House Image */}
                <div className="relative h-40 xs:h-44 sm:h-48 bg-gray-200 rounded-t-lg overflow-hidden group">
                  {(() => {
                    const images = parseImages(house);
                    return images && images.length > 0;
                  })() ? (
                    <img
                      src={parseImages(house)[0].startsWith('data:') ? parseImages(house)[0] : `http://localhost:5000${parseImages(house)[0]}`}
                      alt={house.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <HomeIcon className="h-10 xs:h-12 w-10 xs:w-12 text-gray-400" />
                    </div>
                  )}
                  <div className={`absolute top-2 right-2 px-2 xs:px-3 py-1 rounded-full text-xs font-semibold shadow-lg ${
                    house.available 
                      ? 'bg-green-500 text-white' 
                      : 'bg-red-500 text-white'
                  }`}>
                    {house.available ? 'Available' : 'Unavailable'}
                  </div>
                  <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg text-xs font-medium text-gray-700">
                    {house.bedrooms} bed • {house.bathrooms} bath
                  </div>
                </div>

                {/* House Details */}
                <div className="p-3 xs:p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-base xs:text-lg font-bold text-gray-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400 transition-colors cursor-pointer line-clamp-2">
                      {house.title}
                    </h3>
                    {renderRating(house.id)}
                  </div>
                  
                  <div className="flex items-center text-gray-600 dark:text-gray-300 mb-2">
                    <MapPin className="h-3 xs:h-4 w-3 xs:w-4 mr-1 text-primary-500 dark:text-primary-400" />
                    <span className="text-xs xs:text-sm font-medium">{house.city}, {house.state}</span>
                  </div>

                  <div className="flex items-center text-gray-500 dark:text-gray-400 mb-3">
                    <MapPin className="h-3 w-3 mr-1" />
                    <span className="text-xs truncate">{house.address}</span>
                  </div>

                  <div className="flex justify-between items-center mb-3">
                    <div className="flex gap-2 xs:gap-4">
                      <div className="flex items-center text-gray-600 dark:text-gray-300">
                        <Bed className="h-3 xs:h-4 w-3 xs:w-4 mr-1 text-purple-500 dark:text-purple-400" />
                        <span className="text-xs xs:text-sm font-medium">{house.bedrooms} beds</span>
                      </div>
                      <div className="flex items-center text-gray-600 dark:text-gray-300">
                        <Bath className="h-3 xs:h-4 w-3 xs:w-4 mr-1 text-cyan-500 dark:text-cyan-400" />
                        <span className="text-xs xs:text-sm font-medium">{house.bathrooms} baths</span>
                      </div>
                    </div>
                    {house.area_sqft && (
                      <div className="text-gray-600 dark:text-gray-300">
                        <span className="text-xs xs:text-sm font-medium">{house.area_sqft} sqft</span>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center">
                      <DollarSign className="h-5 xs:h-6 w-5 xs:w-6 text-green-600 dark:text-green-400 mr-1" />
                      <span className="text-lg xs:text-2xl font-bold text-green-600 dark:text-green-400">${house.price}</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">/month</span>
                    </div>
                    <div className="text-xs text-gray-500 hidden xs:block">
                      Listed {new Date(house.created_at).toLocaleDateString()}
                    </div>
                  </div>

                  {/* Amenities */}
                  <div className="flex flex-wrap gap-1 xs:gap-2 mb-4">
                    {house.furnished && (
                      <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-xs rounded-full font-medium transition-colors duration-300">Furnished</span>
                    )}
                    {house.parking && (
                      <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 text-xs rounded-full font-medium transition-colors duration-300">Parking</span>
                    )}
                    {house.pet_friendly && (
                      <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 text-xs rounded-full font-medium transition-colors duration-300">Pet Friendly</span>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Link
                      to={`/house/${house.id}`}
                      className="flex-1 btn btn-primary text-center bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 text-white transition-all duration-200 transform hover:scale-105 text-xs xs:text-sm px-3 xs:px-4 py-2"
                    >
                      View Details
                    </Link>
                    <button className="px-2 xs:px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-dark-700 text-gray-700 dark:text-gray-300 transition-all duration-200">
                      <Heart className="h-4 xs:h-5 w-4 xs:w-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Professional Footer */}
      <Footer />
    </div>
  );
};

export default Home;
