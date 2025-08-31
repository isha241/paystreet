const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { validateTransaction, handleValidationErrors } = require('../utils/validation');
const { generateReceipt } = require('../utils/receiptGenerator');

const router = express.Router();
const prisma = new PrismaClient();

// Get user's transactions
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 10, status, search = '', startDate, endDate } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build filter conditions
    const where = {
      userId: req.user.id
    };

    if (status) {
      where.status = status;
    }

    if (search) {
      where.beneficiary = {
        name: { contains: search, mode: 'insensitive' }
      };
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    // Get transactions with pagination
    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        include: {
          beneficiary: {
            select: {
              id: true,
              name: true,
              country: true,
              currency: true
            }
          }
        },
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' }
      }),
      prisma.transaction.count({ where })
    ]);

    res.json({
      transactions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

// Get all transactions (admin only)
router.get('/all', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 10, status, search = '', startDate, endDate, highRisk } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build filter conditions
    const where = {};

    if (status) {
      where.status = status;
    }

    if (highRisk === 'true') {
      where.isHighRisk = true;
    }

    if (search) {
      where.OR = [
        { beneficiary: { name: { contains: search, mode: 'insensitive' } } },
        { user: { fullName: { contains: search, mode: 'insensitive' } } },
        { user: { email: { contains: search, mode: 'insensitive' } } }
      ];
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    // Get transactions with pagination
    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        include: {
          beneficiary: {
            select: {
              id: true,
              name: true,
              country: true,
              currency: true
            }
          },
          user: {
            select: {
              id: true,
              fullName: true,
              email: true,
              accountNumber: true
            }
          }
        },
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' }
      }),
      prisma.transaction.count({ where })
    ]);

    res.json({
      transactions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get all transactions error:', error);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

// Get transaction by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const transaction = await prisma.transaction.findFirst({
      where: { 
        id,
        userId: req.user.id 
      },
      include: {
        beneficiary: {
          select: {
            id: true,
            name: true,
            country: true,
            currency: true
          }
        }
      }
    });

    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    res.json({ transaction });
  } catch (error) {
    console.error('Get transaction error:', error);
    res.status(500).json({ error: 'Failed to fetch transaction' });
  }
});

// Create new transaction
router.post('/', authenticateToken, validateTransaction, handleValidationErrors, async (req, res) => {
  try {
    const { beneficiaryId, sourceAmount, sourceCurrency } = req.body;

    // Verify beneficiary exists and belongs to user
    const beneficiary = await prisma.beneficiary.findFirst({
      where: { 
        id: beneficiaryId,
        userId: req.user.id 
      }
    });

    if (!beneficiary) {
      return res.status(404).json({ error: 'Beneficiary not found' });
    }

    // Calculate fees (mock calculation)
    const fixedFee = 10; // $10 fixed fee
    const percentageFee = sourceAmount * 0.025; // 2.5% fee
    const totalFees = fixedFee + percentageFee;

    // Calculate target amount (this would normally come from FX API)
    // For now, we'll use a mock rate
    const mockFxRate = 82.45; // Mock USD to INR rate
    const targetAmount = (sourceAmount - totalFees) * mockFxRate;

    // Check if transaction is high risk (>$10,000)
    const isHighRisk = sourceAmount > 10000;

    const transaction = await prisma.transaction.create({
      data: {
        sourceAmount,
        sourceCurrency: sourceCurrency.toUpperCase(),
        targetAmount: Math.round(targetAmount * 100) / 100, // Round to 2 decimal places
        targetCurrency: beneficiary.currency,
        fxRate: mockFxRate,
        fees: totalFees,
        status: 'PENDING',
        isHighRisk,
        userId: req.user.id,
        beneficiaryId
      },
      include: {
        beneficiary: {
          select: {
            id: true,
            name: true,
            country: true,
            currency: true
          }
        }
      }
    });

    res.status(201).json({
      message: 'Transaction created successfully',
      transaction
    });
  } catch (error) {
    console.error('Create transaction error:', error);
    res.status(500).json({ error: 'Failed to create transaction' });
  }
});

// Update transaction status (admin only)
router.patch('/:id/status', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['PENDING', 'COMPLETED', 'FAILED', 'CANCELLED'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const transaction = await prisma.transaction.update({
      where: { id },
      data: { status },
      include: {
        beneficiary: {
          select: {
            id: true,
            name: true,
            country: true,
            currency: true
          }
        },
        user: {
          select: {
            id: true,
            fullName: true,
            email: true
          }
        }
      }
    });

    res.json({
      message: 'Transaction status updated successfully',
      transaction
    });
  } catch (error) {
    console.error('Update transaction status error:', error);
    res.status(500).json({ error: 'Failed to update transaction status' });
  }
});

// Generate transaction receipt
router.get('/:id/receipt', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { format = 'pdf' } = req.query;
    
    // Get transaction with user and beneficiary details
    const transaction = await prisma.transaction.findUnique({
      where: { id },
      include: {
        beneficiary: {
          select: {
            id: true,
            name: true,
            country: true,
            currency: true
          }
        },
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            accountNumber: true
          }
        }
      }
    });

    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    // Check if user owns this transaction or is admin
    if (transaction.userId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Generate receipt
    const receipt = await generateReceipt(transaction, transaction.user, transaction.beneficiary, format);
    
    if (format.toLowerCase() === 'pdf') {
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="receipt_${id}.pdf"`);
      res.send(receipt);
    } else {
      res.json(receipt);
    }
  } catch (error) {
    console.error('Generate receipt error:', error);
    res.status(500).json({ error: 'Failed to generate receipt' });
  }
});

// Export transactions as CSV (admin only)
router.get('/export/csv', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { startDate, endDate, status } = req.query;
    
    // Build filter conditions
    const where = {};
    if (status) where.status = status;
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    const transactions = await prisma.transaction.findMany({
      where,
      include: {
        beneficiary: {
          select: {
            name: true,
            country: true,
            currency: true
          }
        },
        user: {
          select: {
            fullName: true,
            email: true,
            accountNumber: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Generate CSV
    const csvData = transactions.map(t => ({
      transactionId: t.id,
      date: new Date(t.createdAt).toLocaleString(),
      senderName: t.user.fullName,
      senderAccount: t.user.accountNumber,
      recipientName: t.beneficiary.name,
      recipientCountry: t.beneficiary.country,
      sourceAmount: `${t.sourceAmount} ${t.sourceCurrency}`,
      targetAmount: `${t.targetAmount} ${t.targetCurrency}`,
      exchangeRate: t.fxRate,
      fees: `$${t.fees}`,
      status: t.status,
      isHighRisk: t.isHighRisk ? 'Yes' : 'No'
    }));

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="transactions_export.csv"');
    
    // Convert to CSV format
    const csvHeaders = Object.keys(csvData[0]).join(',');
    const csvRows = csvData.map(row => Object.values(row).map(value => `"${value}"`).join(','));
    const csvContent = [csvHeaders, ...csvRows].join('\n');
    
    res.send(csvContent);
  } catch (error) {
    console.error('Export CSV error:', error);
    res.status(500).json({ error: 'Failed to export transactions' });
  }
});

module.exports = router;
