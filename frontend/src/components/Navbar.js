import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { Home, User, LogOut, Plus, History, FileText, Shield, Star, Settings, Sun, Moon, Menu, X } from 'lucide-react';
import Notifications from './Notifications';
import LanguageSwitcher from './LanguageSwitcher';
import { useTranslation } from 'react-i18next';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme, isDark } = useTheme();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <nav className="bg-white/90 dark:bg-dark-card/90 backdrop-blur-lg shadow-soft dark:shadow-medium sticky top-0 z-50 transition-all duration-300 border-b border-gray-100 dark:border-dark-tertiary">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 hover-lift">
            <div className="p-2 bg-gradient-to-br from-primary-500 to-secondary-600 rounded-xl shadow-soft">
              <Home className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold text-gradient hidden xs:block sm:block">RentalHub</span>
            <span className="text-lg font-bold text-gradient xs:hidden sm:hidden">RH</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4 lg:space-x-6">
            <Link
              to="/"
              className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                isActive('/') 
                  ? 'text-primary-600 bg-primary-50 dark:text-primary-400 dark:bg-primary-900/20' 
                  : 'text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-100 dark:hover:bg-dark-700'
              }`}
            >
              <Home className="h-4 w-4" />
              <span className="hidden lg:block">Home</span>
            </Link>

            {user && (
              <>
                <Link
                  to="/dashboard"
                  className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                    isActive('/dashboard') 
                      ? 'text-primary-600 bg-primary-50 dark:text-primary-400 dark:bg-primary-900/20' 
                      : 'text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-100 dark:hover:bg-dark-700'
                  }`}
                >
                  <User className="h-4 w-4" />
                  <span className="hidden lg:block">Dashboard</span>
                </Link>

                {user.role === 'landlord' && (
                  <Link
                    to="/add-house"
                    className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                      isActive('/add-house') 
                        ? 'text-primary-600 bg-primary-50 dark:text-primary-400 dark:bg-primary-900/20' 
                        : 'text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-100 dark:hover:bg-dark-700'
                    }`}
                  >
                    <Plus className="h-4 w-4" />
                    <span className="hidden lg:block">Add Property</span>
                  </Link>
                )}

                <Link
                  to="/rental-history"
                  className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                    isActive('/rental-history') 
                      ? 'text-primary-600 bg-primary-50 dark:text-primary-400 dark:bg-primary-900/20' 
                      : 'text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-100 dark:hover:bg-dark-700'
                  }`}
                >
                  <History className="h-4 w-4" />
                  <span className="hidden lg:block">History</span>
                </Link>

                <Link
                  to="/update-account"
                  className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                    isActive('/update-account') 
                      ? 'text-primary-600 bg-primary-50 dark:text-primary-400 dark:bg-primary-900/20' 
                      : 'text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-100 dark:hover:bg-dark-700'
                  }`}
                >
                  <Settings className="h-4 w-4" />
                  <span className="hidden lg:block">Profile</span>
                </Link>

                {user.role === 'tenant' && (
                  <Link
                    to="/rating-system"
                    className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                      isActive('/rating-system') 
                        ? 'text-primary-600 bg-primary-50 dark:text-primary-400 dark:bg-primary-900/20' 
                        : 'text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-100 dark:hover:bg-dark-700'
                    }`}
                  >
                    <Star className="h-4 w-4" />
                    <span className="hidden lg:block">Rate</span>
                  </Link>
                )}

                {user.role === 'admin' && (
                  <Link
                    to="/admin"
                    className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                      isActive('/admin') 
                        ? 'text-primary-600 bg-primary-50 dark:text-primary-400 dark:bg-primary-900/20' 
                        : 'text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-100 dark:hover:bg-dark-700'
                    }`}
                  >
                    <Shield className="h-4 w-4" />
                    <span className="hidden lg:block">Admin</span>
                  </Link>
                )}
              </>
            )}
          </div>

          {/* Desktop Right Side */}
          <div className="hidden md:flex items-center space-x-3">
            {user ? (
              <>
                <Notifications />
                <LanguageSwitcher />
                <button
                  onClick={toggleTheme}
                  className="p-2 rounded-lg bg-gray-100 dark:bg-dark-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-dark-600 transition-all duration-200"
                  title="Toggle theme"
                >
                  {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                </button>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-red-600"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden lg:block">Logout</span>
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={toggleTheme}
                  className="p-2 rounded-lg bg-gray-100 dark:bg-dark-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-dark-600 transition-all duration-200"
                  title="Toggle theme"
                >
                  {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                </button>
                <LanguageSwitcher />
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-primary-600 hover:text-primary-700"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-primary-500 to-secondary-600 rounded-lg hover:from-primary-600 hover:to-secondary-700 transition-all duration-200"
                >
                  Register
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-2">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-gray-100 dark:bg-dark-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-dark-600 transition-all duration-200"
              title="Toggle theme"
            >
              {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
            <button
              onClick={toggleMobileMenu}
              className="p-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-700 transition-all duration-200"
              title="Toggle menu"
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 dark:border-dark-tertiary">
            <div className="px-4 py-2 space-y-1">
              <Link
                to="/"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium transition-all duration-200 ${
                  isActive('/') 
                    ? 'text-primary-600 bg-primary-50 dark:text-primary-400 dark:bg-primary-900/20' 
                    : 'text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-100 dark:hover:bg-dark-700'
                }`}
              >
                <Home className="h-5 w-5" />
                <span>Home</span>
              </Link>

              {user && (
                <>
                  <Link
                    to="/dashboard"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium transition-all duration-200 ${
                      isActive('/dashboard') 
                        ? 'text-primary-600 bg-primary-50 dark:text-primary-400 dark:bg-primary-900/20' 
                        : 'text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-100 dark:hover:bg-dark-700'
                    }`}
                  >
                    <User className="h-5 w-5" />
                    <span>Dashboard</span>
                  </Link>

                  {user.role === 'landlord' && (
                    <Link
                      to="/add-house"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium transition-all duration-200 ${
                        isActive('/add-house') 
                          ? 'text-primary-600 bg-primary-50 dark:text-primary-400 dark:bg-primary-900/20' 
                          : 'text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-100 dark:hover:bg-dark-700'
                      }`}
                    >
                      <Plus className="h-5 w-5" />
                      <span>Add Property</span>
                    </Link>
                  )}

                  <Link
                    to="/rental-history"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium transition-all duration-200 ${
                      isActive('/rental-history') 
                        ? 'text-primary-600 bg-primary-50 dark:text-primary-400 dark:bg-primary-900/20' 
                        : 'text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-100 dark:hover:bg-dark-700'
                    }`}
                  >
                    <History className="h-5 w-5" />
                    <span>History</span>
                  </Link>

                  <Link
                    to="/update-account"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium transition-all duration-200 ${
                      isActive('/update-account') 
                        ? 'text-primary-600 bg-primary-50 dark:text-primary-400 dark:bg-primary-900/20' 
                        : 'text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-100 dark:hover:bg-dark-700'
                    }`}
                  >
                    <Settings className="h-5 w-5" />
                    <span>Profile</span>
                  </Link>

                  {user.role === 'tenant' && (
                    <Link
                      to="/rating-system"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium transition-all duration-200 ${
                        isActive('/rating-system') 
                          ? 'text-primary-600 bg-primary-50 dark:text-primary-400 dark:bg-primary-900/20' 
                          : 'text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-100 dark:hover:bg-dark-700'
                      }`}
                    >
                      <Star className="h-5 w-5" />
                      <span>Rate</span>
                    </Link>
                  )}

                  {user.role === 'admin' && (
                    <Link
                      to="/admin"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium transition-all duration-200 ${
                        isActive('/admin') 
                          ? 'text-primary-600 bg-primary-50 dark:text-primary-400 dark:bg-primary-900/20' 
                          : 'text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-100 dark:hover:bg-dark-700'
                      }`}
                    >
                      <Shield className="h-5 w-5" />
                      <span>Admin</span>
                    </Link>
                  )}

                  <div className="border-t border-gray-200 dark:border-dark-tertiary pt-2">
                    <button
                      onClick={() => {
                        handleLogout();
                        setIsMobileMenuOpen(false);
                      }}
                      className="flex items-center space-x-2 w-full px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200"
                    >
                      <LogOut className="h-5 w-5" />
                      <span>Logout</span>
                    </button>
                  </div>
                </>
              )}

              {!user && (
                <div className="border-t border-gray-200 dark:border-dark-tertiary pt-2 space-y-2">
                  <Link
                    to="/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block w-full px-4 py-2 text-center text-sm font-medium text-primary-600 hover:text-primary-700 border border-primary-300 rounded-lg hover:bg-primary-50 transition-all duration-200"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block w-full px-4 py-2 text-center text-sm font-medium text-white bg-gradient-to-r from-primary-500 to-secondary-600 rounded-lg hover:from-primary-600 hover:to-secondary-700 transition-all duration-200"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
