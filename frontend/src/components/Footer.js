import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Linkedin, Phone, Mail, Home, MapPin } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const Footer = () => {
  const { t } = useTranslation();
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <div className="flex items-center mb-4">
              <Home className="h-8 w-8 text-blue-400 mr-3" />
              <div>
                <h3 className="text-xl font-bold text-white">RentalHub</h3>
                <p className="text-gray-400">{t('footer.tagline')}</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center text-gray-400">
                <Phone className="h-4 w-4 mr-2" />
                <span>+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center text-gray-400">
                <Mail className="h-4 w-4 mr-2" />
                <span>support@rentalhub.com</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-white">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/about" className="text-gray-400 hover:text-white transition-colors flex items-center">
                  <MapPin className="h-4 w-4 mr-2" /> About Us
                </Link>
              </li>
              <li>
                <Link to="/how-it-works" className="text-gray-400 hover:text-white transition-colors flex items-center">
                  <MapPin className="h-4 w-4 mr-2" /> How It Works
                </Link>
              </li>
              <li>
                <Link to="/pricing" className="text-gray-400 hover:text-white transition-colors flex items-center">
                  <MapPin className="h-4 w-4 mr-2" /> Pricing
                </Link>
              </li>
              <li>
                <Link to="/faq" className="text-gray-400 hover:text-white transition-colors flex items-center">
                  <MapPin className="h-4 w-4 mr-2" /> FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Tenants */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-white">For Tenants</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/browse" className="text-gray-400 hover:text-white transition-colors flex items-center">
                  <Home className="h-4 w-4 mr-2" /> Browse Properties
                </Link>
              </li>
              <li>
                <Link to="/saved" className="text-gray-400 hover:text-white transition-colors flex items-center">
                  <Home className="h-4 w-4 mr-2" /> Saved Properties
                </Link>
              </li>
              <li>
                <Link to="/rental-guide" className="text-gray-400 hover:text-white transition-colors flex items-center">
                  <Home className="h-4 w-4 mr-2" /> Rental Guide
                </Link>
              </li>
            </ul>
          </div>

          {/* Landlords + Social Media */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-white">For Landlords</h4>
            <ul className="space-y-2 mb-6">
              <li>
                <Link to="/list-property" className="text-gray-400 hover:text-white transition-colors flex items-center">
                  <Home className="h-4 w-4 mr-2" /> List Property
                </Link>
              </li>
              <li>
                <Link to="/manage" className="text-gray-400 hover:text-white transition-colors flex items-center">
                  <Home className="h-4 w-4 mr-2" /> {t('footer.manageListings')}
                </Link>
              </li>
              <li>
                <Link to="/landlord-guide" className="text-gray-400 hover:text-white transition-colors flex items-center">
                  <Home className="h-4 w-4 mr-2" /> {t('footer.landlordGuide')}
                </Link>
              </li>
            </ul>

            <h4 className="text-lg font-semibold mb-4 text-white">{t('footer.followUs')}</h4>
            <div className="flex space-x-4">
              <a href="https://facebook.com/rentalhub" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-400 transition-colors flex items-center">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="https://twitter.com/rentalhub" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-400 transition-colors flex items-center">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="https://instagram.com/rentalhub" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-pink-400 transition-colors flex items-center">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="https://linkedin.com/company/rentalhub" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-600 transition-colors flex items-center">
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-gray-400 text-sm">
              © 2024 RentalHub. All rights reserved.
            </div>
            <div className="flex space-x-6 text-sm text-gray-400">
              <Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
              <Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
              <Link to="/cookies" className="hover:text-white transition-colors">Cookie Policy</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;   