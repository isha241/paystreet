import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  ArrowPathIcon,
  CurrencyDollarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';

const Transfer = () => {
  const navigate = useNavigate();
  const [beneficiaries, setBeneficiaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [transferring, setTransferring] = useState(false);
  const [formData, setFormData] = useState({
    beneficiaryId: '',
    sourceAmount: '',
    sourceCurrency: 'USD',
  });
  const [fxData, setFxData] = useState(null);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchBeneficiaries();
  }, []);

  const fetchBeneficiaries = async () => {
    try {
      const response = await axios.get('/api/beneficiaries');
      setBeneficiaries(response.data.beneficiaries);
    } catch (error) {
      console.error('Error fetching beneficiaries:', error);
      toast.error('Failed to fetch beneficiaries');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.beneficiaryId) {
      newErrors.beneficiaryId = 'Please select a beneficiary';
    }

    if (!formData.sourceAmount) {
      newErrors.sourceAmount = 'Amount is required';
    } else if (parseFloat(formData.sourceAmount) <= 0) {
      newErrors.sourceAmount = 'Amount must be greater than 0';
    } else if (parseFloat(formData.sourceAmount) > 50000) {
      newErrors.sourceAmount = 'Amount cannot exceed $50,000';
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

    // Clear FX data when form changes
    if (fxData) {
      setFxData(null);
    }
  };

  const handleCalculateFx = async () => {
    if (!validateForm()) {
      return;
    }

    const selectedBeneficiary = beneficiaries.find(b => b.id === formData.beneficiaryId);
    if (!selectedBeneficiary) {
      toast.error('Invalid beneficiary selected');
      return;
    }

    try {
      const response = await axios.post('/api/fx-rates/convert', {
        from: formData.sourceCurrency,
        to: selectedBeneficiary.currency,
        amount: parseFloat(formData.sourceAmount),
      });

      setFxData(response.data);
    } catch (error) {
      console.error('Error calculating FX:', error);
      toast.error('Failed to calculate exchange rate');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    if (!fxData) {
      toast.error('Please calculate the exchange rate first');
      return;
    }

    setTransferring(true);

    try {
      const response = await axios.post('/api/transactions', {
        beneficiaryId: formData.beneficiaryId,
        sourceAmount: parseFloat(formData.sourceAmount),
        sourceCurrency: formData.sourceCurrency,
      });

      toast.success('Transfer initiated successfully!');
      navigate('/transactions');
    } catch (error) {
      const message = error.response?.data?.error || 'Failed to initiate transfer';
      toast.error(message);
    } finally {
      setTransferring(false);
    }
  };

  const selectedBeneficiary = beneficiaries.find(b => b.id === formData.beneficiaryId);
  const isHighRisk = parseFloat(formData.sourceAmount) > 10000;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (beneficiaries.length === 0) {
    return (
      <div className="text-center py-12">
        <ArrowPathIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-xl font-medium text-gray-900 mb-2">
          No beneficiaries found
        </h2>
        <p className="text-gray-600 mb-6">
          You need to add beneficiaries before you can send money transfers
        </p>
        <button
          onClick={() => navigate('/beneficiaries')}
          className="btn-primary"
        >
          Add Beneficiary
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900">Send Money</h1>
        <p className="text-gray-600 mt-1">
          Transfer money to your beneficiaries with competitive exchange rates
        </p>
      </div>

      {/* Transfer Form */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Beneficiary Selection */}
          <div>
            <label htmlFor="beneficiaryId" className="block text-sm font-medium text-gray-700">
              Select Beneficiary
            </label>
            <select
              id="beneficiaryId"
              name="beneficiaryId"
              value={formData.beneficiaryId}
              onChange={handleChange}
              className={`input-field mt-1 ${errors.beneficiaryId ? 'border-danger-500' : ''}`}
            >
              <option value="">Choose a beneficiary</option>
              {beneficiaries.map((beneficiary) => (
                <option key={beneficiary.id} value={beneficiary.id}>
                  {beneficiary.name} - {beneficiary.country} ({beneficiary.currency})
                </option>
              ))}
            </select>
            {errors.beneficiaryId && (
              <p className="mt-1 text-sm text-danger-600">{errors.beneficiaryId}</p>
            )}
          </div>

          {/* Amount and Currency */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="sourceAmount" className="block text-sm font-medium text-gray-700">
                Amount
              </label>
              <div className="relative mt-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">$</span>
                </div>
                <input
                  type="number"
                  id="sourceAmount"
                  name="sourceAmount"
                  value={formData.sourceAmount}
                  onChange={handleChange}
                  step="0.01"
                  min="0.01"
                  max="50000"
                  className={`input-field pl-7 ${errors.sourceAmount ? 'border-danger-500' : ''}`}
                  placeholder="0.00"
                />
              </div>
              {errors.sourceAmount && (
                <p className="mt-1 text-sm text-danger-600">{errors.sourceAmount}</p>
              )}
            </div>

            <div>
              <label htmlFor="sourceCurrency" className="block text-sm font-medium text-gray-700">
                Source Currency
              </label>
              <select
                id="sourceCurrency"
                name="sourceCurrency"
                value={formData.sourceCurrency}
                onChange={handleChange}
                className="input-field mt-1"
              >
                <option value="USD">USD - US Dollar</option>
                <option value="EUR">EUR - Euro</option>
                <option value="GBP">GBP - British Pound</option>
              </select>
            </div>
          </div>

          {/* High Risk Warning */}
          {isHighRisk && (
            <div className="bg-warning-50 border border-warning-200 rounded-lg p-4">
              <div className="flex items-center">
                <ExclamationTriangleIcon className="h-5 w-5 text-warning-600 mr-2" />
                <div>
                  <h3 className="text-sm font-medium text-warning-800">
                    High-Risk Transaction
                  </h3>
                  <p className="text-sm text-warning-700 mt-1">
                    This transaction exceeds $10,000 and will be flagged for additional review.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Calculate FX Button */}
          <div className="text-center">
            <button
              type="button"
              onClick={handleCalculateFx}
              disabled={!formData.beneficiaryId || !formData.sourceAmount}
              className="btn-secondary px-8 py-3"
            >
              <ArrowPathIcon className="h-5 w-5 mr-2" />
              Calculate Exchange Rate
            </button>
          </div>

          {/* FX Rate Display */}
          {fxData && (
            <div className="bg-gray-50 rounded-lg p-6 space-y-4">
              <h3 className="text-lg font-medium text-gray-900 text-center">
                Transfer Summary
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="text-center">
                  <p className="text-sm text-gray-600">You Send</p>
                  <p className="text-2xl font-bold text-gray-900">
                    ${fxData.conversion.from.amount.toFixed(2)} {fxData.conversion.from.currency}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600">They Receive</p>
                  <p className="text-2xl font-bold text-success-600">
                    {fxData.conversion.to.amount.toFixed(2)} {fxData.conversion.to.currency}
                  </p>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Exchange Rate:</span>
                    <span className="font-medium">1 {fxData.conversion.from.currency} = {fxData.conversion.fxRate.toFixed(4)} {fxData.conversion.to.currency}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Fixed Fee:</span>
                    <span className="font-medium">${fxData.conversion.fees.fixed.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Percentage Fee ({((fxData.conversion.fees.percentage / fxData.conversion.from.amount) * 100).toFixed(2)}%):</span>
                    <span className="font-medium">${fxData.conversion.fees.percentage.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm font-medium border-t border-gray-200 pt-2">
                    <span>Total Fees:</span>
                    <span>${fxData.conversion.fees.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="text-center pt-4">
                <button
                  type="submit"
                  disabled={transferring}
                  className="btn-primary w-full py-3"
                >
                  {transferring ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Processing...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      <CheckCircleIcon className="h-5 w-5 mr-2" />
                      Confirm Transfer
                    </div>
                  )}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-blue-900 mb-2">
            <CurrencyDollarIcon className="h-4 w-4 inline mr-1" />
            Competitive Rates
          </h3>
          <p className="text-sm text-blue-800">
            Get real-time exchange rates with transparent fee structure
          </p>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-green-900 mb-2">
            <CheckCircleIcon className="h-4 w-4 inline mr-1" />
            Secure Transfers
          </h3>
          <p className="text-sm text-green-800">
            All transactions are encrypted and monitored for security
          </p>
        </div>
      </div>
    </div>
  );
};

export default Transfer;
