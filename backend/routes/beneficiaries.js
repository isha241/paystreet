const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken } = require('../middleware/auth');
const { validateBeneficiary, handleValidationErrors } = require('../utils/validation');

const router = express.Router();
const prisma = new PrismaClient();

// Get user's beneficiaries
router.get('/', authenticateToken, async (req, res) => {
  try {
    const beneficiaries = await prisma.beneficiary.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ beneficiaries });
  } catch (error) {
    console.error('Get beneficiaries error:', error);
    res.status(500).json({ error: 'Failed to fetch beneficiaries' });
  }
});

// Get beneficiary by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const beneficiary = await prisma.beneficiary.findFirst({
      where: { 
        id,
        userId: req.user.id 
      }
    });

    if (!beneficiary) {
      return res.status(404).json({ error: 'Beneficiary not found' });
    }

    res.json({ beneficiary });
  } catch (error) {
    console.error('Get beneficiary error:', error);
    res.status(500).json({ error: 'Failed to fetch beneficiary' });
  }
});

// Create new beneficiary
router.post('/', authenticateToken, validateBeneficiary, handleValidationErrors, async (req, res) => {
  try {
    const { name, bankAccountNumber, country, currency } = req.body;

    // Check if beneficiary with same bank account already exists for this user
    const existingBeneficiary = await prisma.beneficiary.findFirst({
      where: {
        userId: req.user.id,
        bankAccountNumber
      }
    });

    if (existingBeneficiary) {
      return res.status(400).json({ error: 'Beneficiary with this bank account number already exists' });
    }

    const beneficiary = await prisma.beneficiary.create({
      data: {
        name: name.trim(),
        bankAccountNumber: bankAccountNumber.trim(),
        country: country.trim(),
        currency: currency.trim().toUpperCase(),
        userId: req.user.id
      }
    });

    res.status(201).json({
      message: 'Beneficiary created successfully',
      beneficiary
    });
  } catch (error) {
    console.error('Create beneficiary error:', error);
    res.status(500).json({ error: 'Failed to create beneficiary' });
  }
});

// Update beneficiary
router.put('/:id', authenticateToken, validateBeneficiary, handleValidationErrors, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, bankAccountNumber, country, currency } = req.body;

    // Check if beneficiary exists and belongs to user
    const existingBeneficiary = await prisma.beneficiary.findFirst({
      where: { 
        id,
        userId: req.user.id 
      }
    });

    if (!existingBeneficiary) {
      return res.status(404).json({ error: 'Beneficiary not found' });
    }

    // Check if bank account number is already used by another beneficiary
    if (bankAccountNumber !== existingBeneficiary.bankAccountNumber) {
      const duplicateBeneficiary = await prisma.beneficiary.findFirst({
        where: {
          userId: req.user.id,
          bankAccountNumber,
          id: { not: id }
        }
      });

      if (duplicateBeneficiary) {
        return res.status(400).json({ error: 'Beneficiary with this bank account number already exists' });
      }
    }

    const updatedBeneficiary = await prisma.beneficiary.update({
      where: { id },
      data: {
        name: name.trim(),
        bankAccountNumber: bankAccountNumber.trim(),
        country: country.trim(),
        currency: currency.trim().toUpperCase()
      }
    });

    res.json({
      message: 'Beneficiary updated successfully',
      beneficiary: updatedBeneficiary
    });
  } catch (error) {
    console.error('Update beneficiary error:', error);
    res.status(500).json({ error: 'Failed to update beneficiary' });
  }
});

// Delete beneficiary
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if beneficiary exists and belongs to user
    const beneficiary = await prisma.beneficiary.findFirst({
      where: { 
        id,
        userId: req.user.id 
      }
    });

    if (!beneficiary) {
      return res.status(404).json({ error: 'Beneficiary not found' });
    }

    // Check if beneficiary has any transactions
    const transactionCount = await prisma.transaction.count({
      where: { beneficiaryId: id }
    });

    if (transactionCount > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete beneficiary with existing transactions' 
      });
    }

    await prisma.beneficiary.delete({
      where: { id }
    });

    res.json({ message: 'Beneficiary deleted successfully' });
  } catch (error) {
    console.error('Delete beneficiary error:', error);
    res.status(500).json({ error: 'Failed to delete beneficiary' });
  }
});

module.exports = router;
