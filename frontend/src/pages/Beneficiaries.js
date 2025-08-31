import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';
import BeneficiaryModal from '../components/BeneficiaryModal';

const Beneficiaries = () => {
  const [beneficiaries, setBeneficiaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingBeneficiary, setEditingBeneficiary] = useState(null);

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

  const handleAddBeneficiary = () => {
    setEditingBeneficiary(null);
    setShowModal(true);
  };

  const handleEditBeneficiary = (beneficiary) => {
    setEditingBeneficiary(beneficiary);
    setShowModal(true);
  };

  const handleDeleteBeneficiary = async (id) => {
    if (!window.confirm('Are you sure you want to delete this beneficiary?')) {
      return;
    }

    try {
      await axios.delete(`/api/beneficiaries/${id}`);
      toast.success('Beneficiary deleted successfully');
      fetchBeneficiaries();
    } catch (error) {
      const message = error.response?.data?.error || 'Failed to delete beneficiary';
      toast.error(message);
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
    setEditingBeneficiary(null);
  };

  const handleModalSuccess = () => {
    fetchBeneficiaries();
    handleModalClose();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Beneficiaries</h1>
          <p className="text-gray-600 mt-1">
            Manage your money transfer recipients
          </p>
        </div>
        <button
          onClick={handleAddBeneficiary}
          className="btn-primary flex items-center"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Add Beneficiary
        </button>
      </div>

      {/* Beneficiaries List */}
      {beneficiaries.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <UserGroupIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No beneficiaries yet
          </h3>
          <p className="text-gray-600 mb-6">
            Add your first beneficiary to start sending money transfers
          </p>
          <button
            onClick={handleAddBeneficiary}
            className="btn-primary"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Add First Beneficiary
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">
              Your Beneficiaries ({beneficiaries.length})
            </h2>
          </div>
          <div className="divide-y divide-gray-200">
            {beneficiaries.map((beneficiary) => (
              <div
                key={beneficiary.id}
                className="px-6 py-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="h-12 w-12 bg-primary-100 rounded-full flex items-center justify-center">
                      <span className="text-lg font-semibold text-primary-600">
                        {beneficiary.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-900">
                        {beneficiary.name}
                      </h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>Account: {beneficiary.bankAccountNumber}</span>
                        <span>Country: {beneficiary.country}</span>
                        <span>Currency: {beneficiary.currency}</span>
                      </div>
                      <p className="text-xs text-gray-400 mt-1">
                        Added on {new Date(beneficiary.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleEditBeneficiary(beneficiary)}
                      className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                      title="Edit beneficiary"
                    >
                      <PencilIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDeleteBeneficiary(beneficiary.id)}
                      className="p-2 text-gray-400 hover:text-danger-600 hover:bg-danger-50 rounded-lg transition-colors"
                      title="Delete beneficiary"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <BeneficiaryModal
          beneficiary={editingBeneficiary}
          onClose={handleModalClose}
          onSuccess={handleModalSuccess}
        />
      )}
    </div>
  );
};

export default Beneficiaries;
