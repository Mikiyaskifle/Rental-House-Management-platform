import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Home, Plus, Upload, X } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

const AddHouse = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const newImages = [...images, ...files];
    
    if (newImages.length > 5) {
      toast.error('Maximum 5 images allowed');
      return;
    }

    setImages(newImages);

    // Create previews
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setImagePreviews([...imagePreviews, ...newPreviews]);
  };

  const removeImage = (index) => {
    const newImages = images.filter((_, i) => i !== index);
    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    
    setImages(newImages);
    setImagePreviews(newPreviews);
  };

  const onSubmit = async (data) => {
    setLoading(true);
    
    const formData = new FormData();
    
    // Append form fields
    Object.keys(data).forEach(key => {
      formData.append(key, data[key]);
    });

    // Append images
    images.forEach((image, index) => {
      formData.append(`images`, image);
    });

    try {
      await axios.post('http://localhost:5000/api/houses', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      toast.success('House listed successfully!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to list house');
    }
    setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center mb-6">
        <Home className="h-8 w-8 text-primary-600 mr-3" />
        <h1 className="text-3xl font-bold text-gray-900">{t('addHouse.title')}</h1>
      </div>

      <div className="card">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Information */}
          <div>
            <h2 className="text-xl font-semibold mb-4">{t('addHouse.basicInfo')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('addHouse.propertyTitle')} *
                </label>
                <input
                  {...register('title', { required: t('addHouse.propertyTitleRequired') })}
                  type="text"
                  className="input"
                  placeholder="Beautiful 2BR Apartment in Downtown"
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  {...register('description')}
                  rows={3}
                  className="input"
                  placeholder={t('addHouse.descriptionPlaceholder')}
                />
              </div>
            </div>
          </div>

          {/* Location */}
          <div>
            <h2 className="text-xl font-semibold mb-4">{t('addHouse.location')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Street Address *
                </label>
                <input
                  {...register('address', { required: 'Address is required' })}
                  type="text"
                  className="input"
                  placeholder="123 Main Street"
                />
                {errors.address && (
                  <p className="mt-1 text-sm text-red-600">{errors.address.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  City *
                </label>
                <input
                  {...register('city', { required: 'City is required' })}
                  type="text"
                  className="input"
                  placeholder="New York"
                />
                {errors.city && (
                  <p className="mt-1 text-sm text-red-600">{errors.city.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  State
                </label>
                <input
                  {...register('state')}
                  type="text"
                  className="input"
                  placeholder="NY"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Postal Code
                </label>
                <input
                  {...register('postal_code')}
                  type="text"
                  className="input"
                  placeholder="10001"
                />
              </div>
            </div>
          </div>

          {/* Property Details */}
          <div>
            <h2 className="text-xl font-semibold mb-4">{t('addHouse.propertyDetails')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Monthly Rent ($) *
                </label>
                <input
                  {...register('price', { 
                    required: 'Price is required',
                    min: { value: 0, message: 'Price must be positive' }
                  })}
                  type="number"
                  className="input"
                  placeholder="1500"
                />
                {errors.price && (
                  <p className="mt-1 text-sm text-red-600">{errors.price.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bedrooms *
                </label>
                <input
                  {...register('bedrooms', { 
                    required: 'Bedrooms is required',
                    min: { value: 1, message: 'At least 1 bedroom' }
                  })}
                  type="number"
                  className="input"
                  placeholder="2"
                />
                {errors.bedrooms && (
                  <p className="mt-1 text-sm text-red-600">{errors.bedrooms.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bathrooms *
                </label>
                <input
                  {...register('bathrooms', { 
                    required: 'Bathrooms is required',
                    min: { value: 1, message: 'At least 1 bathroom' }
                  })}
                  type="number"
                  className="input"
                  placeholder="2"
                />
                {errors.bathrooms && (
                  <p className="mt-1 text-sm text-red-600">{errors.bathrooms.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Area (sq ft)
                </label>
                <input
                  {...register('area_sqft')}
                  type="number"
                  className="input"
                  placeholder="800"
                />
              </div>
            </div>
          </div>

          {/* Amenities */}
          <div>
            <h2 className="text-xl font-semibold mb-4">{t('addHouse.amenities')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <label className="flex items-center">
                <input
                  {...register('furnished')}
                  type="checkbox"
                  className="mr-2"
                />
                <span>Furnished</span>
              </label>

              <label className="flex items-center">
                <input
                  {...register('parking')}
                  type="checkbox"
                  className="mr-2"
                />
                <span>Parking Available</span>
              </label>

              <label className="flex items-center">
                <input
                  {...register('pet_friendly')}
                  type="checkbox"
                  className="mr-2"
                />
                <span>Pet Friendly</span>
              </label>
            </div>
          </div>

          {/* Images */}
          <div>
            <h2 className="text-xl font-semibold mb-4">{t('addHouse.propertyImages')}</h2>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
              <div className="text-center">
                <Upload className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                <label className="cursor-pointer">
                  <span className="btn btn-secondary">
                    <Plus className="h-5 w-5 mr-2" />
                    Add Images
                  </span>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
                <p className="text-sm text-gray-500 mt-2">
                  Upload up to 5 images (JPG, PNG, GIF - Max 5MB each)
                </p>
                <p className="text-xs text-green-600 mt-1">
                  ✅ Images will be uploaded and displayed immediately
                </p>
              </div>

              {/* Image Previews */}
              {imagePreviews.length > 0 && (
                <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-4">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="relative">
                      <img
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg border border-gray-200"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="btn btn-secondary"
            >
              {t('addHouse.cancel')}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
            >
              {loading ? t('addHouse.listingProperty') : t('addHouse.listProperty')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddHouse;