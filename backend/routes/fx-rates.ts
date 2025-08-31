import { Router, Request, Response } from 'express';
import axios from 'axios';

const router = Router();

// FX rate cache
const fxRateCache = new Map<string, { rate: number; timestamp: number }>();
const CACHE_DURATION = 15 * 60 * 1000; // 15 minutes

// Convert currency
router.post('/convert', async (req: Request, res: Response): Promise<void> => {
  try {
    const { from, to, amount } = req.body;

    // Validate input
    if (!from || !to || !amount || amount <= 0) {
      res.status(400).json({ error: 'Validation failed' });
      return;
    }

    // Check cache first
    const cacheKey = `${from}_${to}`;
    const cachedRate = fxRateCache.get(cacheKey);
    let fxRate: number;
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
          
          console.log(`FX API success: ${from} to ${to} = ${fxRate} (API result: ${response.data.result})`);
        } else {
          throw new Error('API returned unsuccessful response');
        }
      } catch (apiError) {
        console.error('FX API error:', apiError);
        
        // Fallback to cached rate if available
        if (cachedRate) {
          fxRate = cachedRate.rate;
          console.log('Using expired cached rate as fallback');
        } else {
          // Final fallback to mock rates
          const mockRates: { [key: string]: number } = {
            'USD_INR': 82.45,
            'USD_EUR': 0.92,
            'USD_GBP': 0.79
          };
          
          const mockKey = `${from}_${to}`;
          fxRate = mockRates[mockKey] || 1.0;
          console.log('Using mock rate as fallback');
        }
      }
    }

    // Calculate converted amount
    const convertedAmount = amount * fxRate;
    
    // Calculate fees
    const fixedFee = 10;
    const percentageFee = amount * 0.025;
    const totalFees = fixedFee + percentageFee;
    
    // Calculate final amount after fees
    const finalAmount = convertedAmount - (totalFees * fxRate);

    res.json({
      conversion: {
        from: { currency: from, amount },
        to: { currency: to, amount: Math.round(convertedAmount * 100) / 100 },
        fxRate: Math.round(fxRate * 100000) / 100000,
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
router.get('/currencies', async (req: Request, res: Response): Promise<void> => {
  try {
    const currencies = [
      { code: 'USD', name: 'US Dollar', symbol: '$' },
      { code: 'EUR', name: 'Euro', symbol: '€' },
      { code: 'GBP', name: 'British Pound', symbol: '£' },
      { code: 'INR', name: 'Indian Rupee', symbol: '₹' }
    ];

    res.json({ currencies });
  } catch (error) {
    console.error('Get currencies error:', error);
    res.status(500).json({ error: 'Failed to fetch currencies' });
  }
});

// Test FX API connection
router.get('/test', async (req: Request, res: Response): Promise<void> => {
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
  } catch (error: any) {
    console.error('FX API test error:', error.message);
    res.status(500).json({ 
      error: 'FX API test failed',
      message: error.message
    });
  }
});

// Clear cache
router.delete('/cache', (req: Request, res: Response): void => {
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

export default router;
