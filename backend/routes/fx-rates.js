const express = require('express');
const axios = require('axios');
const { validateFxConversion, handleValidationErrors } = require('../utils/validation');

const router = express.Router();

// Simple in-memory cache for FX rates (in production, use Redis)
const fxRateCache = new Map();
const CACHE_DURATION = 15 * 60 * 1000; // 15 minutes

// Get FX rate and convert amount
router.post('/convert', validateFxConversion, handleValidationErrors, async (req, res) => {
  try {
    const { from, to, amount } = req.body;

    // Check cache first
    const cacheKey = `${from}_${to}`;
    const cachedRate = fxRateCache.get(cacheKey);
    
    let fxRate;
    let cacheHit = false;

    if (cachedRate && (Date.now() - cachedRate.timestamp) < CACHE_DURATION) {
      fxRate = cachedRate.rate;
      cacheHit = true;
    } else {
              // Fetch live rate from API
        try {
          const response = await axios.get(`${process.env.EXCHANGE_RATE_API_URL}/convert`, {
            params: { from, to, amount: 1 },
            timeout: 10000 // 10 second timeout
          });

          if (response.data.success) {
            fxRate = response.data.info.rate;
            
            // Cache the rate
            fxRateCache.set(cacheKey, {
              rate: fxRate,
              timestamp: Date.now()
            });
            
            console.log(`FX API success: ${from} to ${to} = ${fxRate} (API result: ${response.data.result})`);
          } else {
            throw new Error('API returned unsuccessful response');
          }
      } catch (apiError) {
        console.error('FX API error:', apiError.message);
        
        // Fallback to cached rate if available (even if expired)
        if (cachedRate) {
          fxRate = cachedRate.rate;
          console.log('Using expired cached rate as fallback');
        } else {
          // Final fallback to mock rates for common pairs
          const mockRates = {
            'USD_INR': 82.45,
            'USD_EUR': 0.92,
            'USD_GBP': 0.79,
            'USD_MXN': 17.0,
            'USD_CAD': 1.35,
            'EUR_USD': 1.09,
            'GBP_USD': 1.27,
            'INR_USD': 0.012,
            'MXN_USD': 0.059
          };
          
          const mockKey = `${from}_${to}`;
          fxRate = mockRates[mockKey];
          
          if (!fxRate) {
            return res.status(503).json({ 
              error: 'FX rate service unavailable and no fallback rate available',
              suggestion: 'Please try again later or contact support'
            });
          }
          
          console.log('Using mock rate as fallback');
        }
      }
    }

    // Calculate converted amount
    const convertedAmount = amount * fxRate;
    
    // Calculate fees (mock calculation)
    const fixedFee = 10; // $10 fixed fee
    const percentageFee = amount * 0.025; // 2.5% fee
    const totalFees = fixedFee + percentageFee;
    
    // Calculate final amount after fees
    const finalAmount = convertedAmount - (totalFees * fxRate);

    res.json({
      conversion: {
        from: { currency: from, amount },
        to: { currency: to, amount: Math.round(convertedAmount * 100) / 100 },
        fxRate: Math.round(fxRate * 100000) / 100000, // 5 decimal places
        fees: {
          fixed: fixedFee,
          percentage: Math.round(percentageFee * 100) / 100,
          total: Math.round(totalFees * 100) / 100,
          totalInTargetCurrency: Math.round(totalFees * fxRate * 100) / 100
        },
        finalAmount: Math.round(finalAmount * 100) / 100
      },
      metadata: {
        cacheHit,
        timestamp: new Date().toISOString(),
        source: cacheHit ? 'cache' : 'live-api'
      }
    });
  } catch (error) {
    console.error('FX conversion error:', error);
    res.status(500).json({ error: 'Failed to convert currency' });
  }
});

// Get available currencies
router.get('/currencies', async (req, res) => {
  try {
    // Common currencies with their names
    const currencies = [
      { code: 'USD', name: 'US Dollar', symbol: '$' },
      { code: 'EUR', name: 'Euro', symbol: '€' },
      { code: 'GBP', name: 'British Pound', symbol: '£' },
      { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
      { code: 'MXN', name: 'Mexican Peso', symbol: '$' },
      { code: 'CAD', name: 'Canadian Dollar', symbol: '$' },
      { code: 'AUD', name: 'Australian Dollar', symbol: '$' },
      { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
      { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF' },
      { code: 'CNY', name: 'Chinese Yuan', symbol: '¥' }
    ];

    res.json({ currencies });
  } catch (error) {
    console.error('Get currencies error:', error);
    res.status(500).json({ error: 'Failed to fetch currencies' });
  }
});

// Get FX rate only (without conversion)
router.get('/rate/:from/:to', async (req, res) => {
  try {
    const { from, to } = req.params;

    // Validate currency codes
    if (!/^[A-Z]{3}$/.test(from) || !/^[A-Z]{3}$/.test(to)) {
      return res.status(400).json({ error: 'Invalid currency code format' });
    }

    // Check cache first
    const cacheKey = `${from}_${to}`;
    const cachedRate = fxRateCache.get(cacheKey);
    
    let fxRate;
    let cacheHit = false;

    if (cachedRate && (Date.now() - cachedRate.timestamp) < CACHE_DURATION) {
      fxRate = cachedRate.rate;
      cacheHit = true;
    } else {
      // Fetch live rate from API
      try {
        const response = await axios.get(`${process.env.EXCHANGE_RATE_API_URL}/convert`, {
          params: { from, to, amount: 1 },
          timeout: 10000
        });

        if (response.data.success) {
          fxRate = response.data.info.rate;
          
          // Cache the rate
          fxRateCache.set(cacheKey, {
            rate: fxRate,
            timestamp: Date.now()
          });
        } else {
          throw new Error('API returned unsuccessful response');
        }
      } catch (apiError) {
        console.error('FX API error:', apiError.message);
        
        // Fallback to cached rate if available
        if (cachedRate) {
          fxRate = cachedRate.rate;
        } else {
          return res.status(503).json({ 
            error: 'FX rate service unavailable',
            suggestion: 'Please try again later'
          });
        }
      }
    }

    res.json({
      from,
      to,
      rate: Math.round(fxRate * 100000) / 100000,
      timestamp: new Date().toISOString(),
      cacheHit
    });
  } catch (error) {
    console.error('Get FX rate error:', error);
    res.status(500).json({ error: 'Failed to fetch FX rate' });
  }
});

// Test FX API connection
router.get('/test', async (req, res) => {
  try {
    const response = await axios.get(`${process.env.EXCHANGE_RATE_API_URL}/convert`, {
      params: { from: 'USD', to: 'INR', amount: 100 },
      timeout: 10000
    });
    
    res.json({
      message: 'FX API test successful',
      apiResponse: response.data,
      parsed: {
        success: response.data.success,
        rate: response.data.info?.rate,
        result: response.data.result,
        query: response.data.query
      }
    });
  } catch (error) {
    console.error('FX API test error:', error.message);
    res.status(500).json({ 
      error: 'FX API test failed',
      message: error.message
    });
  }
});

// Clear cache (for testing/admin purposes)
router.delete('/cache', (req, res) => {
  try {
    const cacheSize = fxRateCache.size;
    fxRateCache.clear();
    
    res.json({
      message: 'FX rate cache cleared successfully',
      clearedEntries: cacheSize
    });
  } catch (error) {
    console.error('Clear cache error:', error);
    res.status(500).json({ error: 'Failed to clear cache' });
  }
});

module.exports = router;
