import React, { useState } from 'react';
import { Upload, X, User, Camera } from 'lucide-react';
import toast from 'react-hot-toast';

const ProfileImageUpload = ({ user, onProfileUpdate }) => {
  const [profileImage, setProfileImage] = useState(null);
  const [profileImagePreview, setProfileImagePreview] = useState('');
  const [loading, setLoading] = useState(false);

  const handleProfileImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }
      // Check file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        return;
      }
      setProfileImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeProfileImage = () => {
    setProfileImage(null);
    setProfileImagePreview('');
  };

  const uploadProfileImage = async () => {
    if (!profileImage) {
      toast.error('Please select a profile image');
      return;
    }

    setLoading(true);
    
    try {
      const formData = new FormData();
      formData.append('profile_image', profileImage);

      const response = await fetch('http://localhost:5000/api/user/profile-image', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(data.message);
        removeProfileImage();
        if (onProfileUpdate) {
          onProfileUpdate();
        }
      } else {
        toast.error(data.message || 'Failed to upload profile image');
      }
    } catch (error) {
      toast.error('Error uploading profile image');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Don't show if user is not approved
  if (user?.verification_status !== 'approved') {
    return (
      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 text-center">
        <Camera className="mx-auto h-8 w-8 text-yellow-600 dark:text-yellow-400 mb-2" />
        <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200 mb-1">
          Profile Image Upload
        </h3>
        <p className="text-xs text-yellow-700 dark:text-yellow-300">
          Your ID must be approved before you can upload a profile image
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-dark-800 rounded-lg shadow-md dark:shadow-lg p-6 border border-gray-200 dark:border-dark-700">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
        <User className="h-5 w-5 mr-2 text-primary-600 dark:text-primary-400" />
        Profile Image
      </h3>
      
      <div className="space-y-4">
        {user?.profile_image ? (
          <div className="flex items-center space-x-4">
            <img
              src={user.profile_image.startsWith('data:') ? user.profile_image : `http://localhost:5000${user.profile_image}`}
              alt="Current profile"
              className="h-20 w-20 rounded-full object-cover border-4 border-gray-200 dark:border-dark-600"
            />
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-300">Current profile image</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Upload a new one to replace it</p>
            </div>
          </div>
        ) : (
          <div className="text-center text-gray-500 dark:text-gray-400">
            <User className="mx-auto h-12 w-12 mb-2" />
            <p className="text-sm">No profile image yet</p>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Upload New Profile Image
          </label>
          <div className="mt-1">
            {profileImagePreview ? (
              <div className="relative">
                <img
                  src={profileImagePreview}
                  alt="Profile preview"
                  className="h-32 w-32 rounded-full object-cover border-4 border-gray-200 dark:border-dark-600 mx-auto"
                />
                <button
                  type="button"
                  onClick={removeProfileImage}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-gray-400 dark:hover:border-gray-500 transition-colors">
                <Upload className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
                <div className="mt-2">
                  <label htmlFor="profile_image_upload" className="cursor-pointer">
                    <span className="text-sm text-gray-600 dark:text-gray-300">Click to upload profile image</span>
                    <input
                      id="profile_image_upload"
                      type="file"
                      accept="image/*"
                      onChange={handleProfileImageChange}
                      className="hidden"
                    />
                  </label>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">PNG, JPG, GIF up to 5MB</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {profileImage && (
          <div className="flex space-x-3">
            <button
              onClick={uploadProfileImage}
              disabled={loading}
              className="flex-1 bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              {loading ? 'Uploading...' : 'Upload Profile Image'}
            </button>
            <button
              onClick={removeProfileImage}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-dark-700 text-gray-700 dark:text-gray-300 font-medium transition-colors"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileImageUpload;
