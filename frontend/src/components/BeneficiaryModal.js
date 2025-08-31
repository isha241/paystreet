import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { XMarkIcon } from '@heroicons/react/24/outline';

const BeneficiaryModal = ({ beneficiary, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    bankAccountNumber: '',
    country: '',
    currency: '',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const isEditing = !!beneficiary;

  useEffect(() => {
    if (beneficiary) {
      setFormData({
        name: beneficiary.name,
        bankAccountNumber: beneficiary.bankAccountNumber,
        country: beneficiary.country,
        currency: beneficiary.currency,
      });
    }
  }, [beneficiary]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    if (!formData.bankAccountNumber.trim()) {
      newErrors.bankAccountNumber = 'Bank account number is required';
    } else if (formData.bankAccountNumber.trim().length < 5) {
      newErrors.bankAccountNumber = 'Bank account number must be at least 5 characters';
    }

    if (!formData.country.trim()) {
      newErrors.country = 'Country is required';
    }

    if (!formData.currency.trim()) {
      newErrors.currency = 'Currency is required';
    } else if (formData.currency.trim().length !== 3) {
      newErrors.currency = 'Currency must be a 3-letter code (e.g., USD, EUR)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      if (isEditing) {
        await axios.put(`/api/beneficiaries/${beneficiary.id}`, formData);
        toast.success('Beneficiary updated successfully');
      } else {
        await axios.post('/api/beneficiaries', formData);
        toast.success('Beneficiary added successfully');
      }
      onSuccess();
    } catch (error) {
      const message = error.response?.data?.error || `Failed to ${isEditing ? 'update' : 'add'} beneficiary`;
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose} />

        {/* Modal panel */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                {isEditing ? 'Edit Beneficiary' : 'Add New Beneficiary'}
              </h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`input-field mt-1 ${errors.name ? 'border-danger-500' : ''}`}
                  placeholder="Enter beneficiary's full name"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-danger-600">{errors.name}</p>
                )}
              </div>

              <div>
                <label htmlFor="bankAccountNumber" className="block text-sm font-medium text-gray-700">
                  Bank Account Number
                </label>
                <input
                  type="text"
                  id="bankAccountNumber"
                  name="bankAccountNumber"
                  value={formData.bankAccountNumber}
                  onChange={handleChange}
                  className={`input-field mt-1 ${errors.bankAccountNumber ? 'border-danger-500' : ''}`}
                  placeholder="Enter bank account number"
                />
                {errors.bankAccountNumber && (
                  <p className="mt-1 text-sm text-danger-600">{errors.bankAccountNumber}</p>
                )}
              </div>

              <div>
                <label htmlFor="country" className="block text-sm font-medium text-gray-700">
                  Country
                </label>
                <input
                  type="text"
                  id="country"
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  className={`input-field mt-1 ${errors.country ? 'border-danger-500' : ''}`}
                  placeholder="Enter country name"
                />
                {errors.country && (
                  <p className="mt-1 text-sm text-danger-600">{errors.country}</p>
                )}
              </div>

              <div>
                <label htmlFor="currency" className="block text-sm font-medium text-gray-700">
                  Currency
                </label>
                <select
                  id="currency"
                  name="currency"
                  value={formData.currency}
                  onChange={handleChange}
                  className={`input-field mt-1 ${errors.currency ? 'border-danger-500' : ''}`}
                >
                  <option value="">Select currency</option>
                  <option value="USD">USD - US Dollar</option>
                  <option value="EUR">EUR - Euro</option>
                  <option value="GBP">GBP - British Pound</option>
                  <option value="INR">INR - Indian Rupee</option>
                  <option value="MXN">MXN - Mexican Peso</option>
                  <option value="CAD">CAD - Canadian Dollar</option>
                  <option value="AUD">AUD - Australian Dollar</option>
                  <option value="JPY">JPY - Japanese Yen</option>
                  <option value="CHF">CHF - Swiss Franc</option>
                  <option value="CNY">CNY - Chinese Yuan</option>
                </select>
                {errors.currency && (
                  <p className="mt-1 text-sm text-danger-600">{errors.currency}</p>
                )}
              </div>
            </form>
          </div>

          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="submit"
              onClick={handleSubmit}
              disabled={loading}
              className="btn-primary w-full sm:w-auto sm:ml-3"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mx-auto"></div>
              ) : (
                isEditing ? 'Update Beneficiary' : 'Add Beneficiary'
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary w-full sm:w-auto mt-3 sm:mt-0"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BeneficiaryModal;
