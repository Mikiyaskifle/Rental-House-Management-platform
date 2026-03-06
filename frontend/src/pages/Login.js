import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../contexts/AuthContext';
import { Eye, EyeOff, LogIn } from 'lucide-react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

const Login = () => {
  const { login } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    setLoading(true);
    const result = await login(data.username, data.password);
    if (result.success) {
      // Redirect based on user role
      if (result.user.role === 'tenant') {
        navigate('/'); // Redirect tenants to home page
      } else {
        navigate('/dashboard'); // Admin and landlord go to dashboard
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
            {t('auth.loginToAccount')}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            {t('auth.dontHaveAccount')}{' '}
            <Link
              to="/register"
              className="font-medium text-primary-600 hover:text-primary-500"
            >
              {t('auth.createAccount')}
            </Link>
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="bg-white dark:bg-dark-800 shadow-xl dark:shadow-2xl rounded-lg p-6 border border-gray-200 dark:border-dark-700 transition-all duration-300">
            <div>
              <label htmlFor="username" className="sr-only">
                {t('auth.username')} or {t('auth.email')}
              </label>
              <input
                {...register('username', {
                  required: t('auth.username') + ' ' + t('validation.required'),
                })}
                type="text"
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 dark:border-dark-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white bg-white dark:bg-dark-700 rounded-t-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:focus:ring-primary-400 dark:focus:border-primary-400 focus:z-10 sm:text-sm transition-colors duration-200"
                placeholder={t('auth.username') + ' or ' + t('auth.email')}
              />
              {errors.username && (
                <p className="mt-1 text-sm text-red-600">{errors.username.message}</p>
              )}
            </div>
            <div className="relative">
              <label htmlFor="password" className="sr-only">
                {t('auth.password')}
              </label>
              <input
                {...register('password', {
                  required: t('auth.password') + ' ' + t('validation.required'),
                })}
                type={showPassword ? 'text' : 'password'}
                className="appearance-none rounded-none relative block w-full px-3 py-2 pr-10 border border-gray-300 dark:border-dark-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white bg-white dark:bg-dark-700 rounded-b-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:focus:ring-primary-400 dark:focus:border-primary-400 focus:z-10 sm:text-sm transition-colors duration-200"
                placeholder={t('auth.password')}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                )}
              </button>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:focus:ring-primary-400 disabled:opacity-50 transition-all duration-200 transform hover:scale-[1.02]"
            >
              <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                <LogIn className="h-5 w-5 text-primary-500 group-hover:text-primary-400" />
              </span>
              {loading ? t('forms.loading') : t('auth.signIn')}
            </button>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              Demo Accounts:
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Admin: mikkifle / miki12
            </p>
            <p className="text-xs text-gray-500">
              Tenant: miki@gmail.com/ miki12
            </p>
            <p className="text-xs text-gray-500">
              Landlord: kifle@gmail.com / kifle12
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
