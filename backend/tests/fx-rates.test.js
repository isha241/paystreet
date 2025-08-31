const request = require('supertest');
const app = require('./test-server');

// Mock axios
jest.mock('axios');
const axios = require('axios');

describe('FX Rates Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/fx-rates/convert', () => {
    it('should convert amount with live FX rate', async () => {
      // Mock successful API response
      axios.get.mockResolvedValue({
        data: {
          success: true,
          info: { rate: 82.45 },
          result: 8245
        }
      });

      const response = await request(app)
        .post('/api/fx-rates/convert')
        .send({
          from: 'USD',
          to: 'INR',
          amount: 100
        })
        .expect(200);

      expect(response.body.conversion.from.currency).toBe('USD');
      expect(response.body.conversion.from.amount).toBe(100);
      expect(response.body.conversion.to.currency).toBe('INR');
      expect(response.body.conversion.to.amount).toBe(8245);
      expect(response.body.conversion.fxRate).toBe(82.45);
      expect(response.body.conversion.fees.fixed).toBe(10);
      expect(response.body.conversion.fees.percentage).toBe(2.5);
    });

    it('should use cached rate when available', async () => {
      // First request to populate cache
      axios.get.mockResolvedValue({
        data: {
          success: true,
          info: { rate: 82.45 },
          result: 8245
        }
      });

      await request(app)
        .post('/api/fx-rates/convert')
        .send({
          from: 'USD',
          to: 'INR',
          amount: 100
        });

      // Second request should use cache
      const response = await request(app)
        .post('/api/fx-rates/convert')
        .send({
          from: 'USD',
          to: 'INR',
          amount: 50
        })
        .expect(200);

      expect(response.body.metadata.cacheHit).toBe(true);
      expect(response.body.conversion.fxRate).toBe(82.45);
    });

    it('should fallback to mock rates when API fails', async () => {
      // Mock API failure
      axios.get.mockRejectedValue(new Error('API Error'));

      const response = await request(app)
        .post('/api/fx-rates/convert')
        .send({
          from: 'USD',
          to: 'INR',
          amount: 100
        })
        .expect(200);

      expect(response.body.conversion.fxRate).toBe(82.45);
      expect(response.body.metadata.source).toBe('live-api');
    });

    it('should reject invalid currency codes', async () => {
      const response = await request(app)
        .post('/api/fx-rates/convert')
        .send({
          from: 'INVALID',
          to: 'INR',
          amount: 100
        })
        .expect(400);

      expect(response.body.error).toBe('Validation failed');
    });

    it('should reject negative amounts', async () => {
      const response = await request(app)
        .post('/api/fx-rates/convert')
        .send({
          from: 'USD',
          to: 'INR',
          amount: -100
        })
        .expect(400);

      expect(response.body.error).toBe('Validation failed');
    });
  });

  describe('GET /api/fx-rates/currencies', () => {
    it('should return available currencies', async () => {
      const response = await request(app)
        .get('/api/fx-rates/currencies')
        .expect(200);

      expect(response.body.currencies).toBeDefined();
      expect(Array.isArray(response.body.currencies)).toBe(true);
      expect(response.body.currencies.length).toBeGreaterThan(0);
    });
  });

  describe('GET /api/fx-rates/rate/:from/:to', () => {
    it('should return specific FX rate', async () => {
      // Mock successful API response
      axios.get.mockResolvedValue({
        data: {
          success: true,
          info: { rate: 82.45 },
          result: 82.45
        }
      });

      const response = await request(app)
        .get('/api/fx-rates/rate/USD/INR')
        .expect(200);

      expect(response.body.from).toBe('USD');
      expect(response.body.to).toBe('INR');
      expect(response.body.rate).toBe(82.45);
      expect(response.body.cacheHit).toBeDefined();
    });

    it('should handle API errors gracefully', async () => {
      // Mock API failure
      axios.get.mockRejectedValue(new Error('API Error'));

      const response = await request(app)
        .get('/api/fx-rates/rate/USD/INR')
        .expect(503);

      expect(response.body.error).toBe('FX rate service unavailable');
    });
  });

  describe('Cache Management', () => {
    it('should clear cache when requested', async () => {
      const response = await request(app)
        .delete('/api/fx-rates/cache')
        .expect(200);

      expect(response.body.message).toBe('FX rate cache cleared successfully');
      expect(response.body.clearedEntries).toBeDefined();
    });
  });

  describe('GET /api/fx-rates/test', () => {
    it('should test FX API connection', async () => {
      // Mock successful API response
      axios.get.mockResolvedValue({
        data: {
          success: true,
          info: { rate: 82.45 },
          result: 8245,
          query: { from: 'USD', to: 'INR', amount: 100 }
        }
      });

      const response = await request(app)
        .get('/api/fx-rates/test')
        .expect(200);

      expect(response.body.message).toBe('FX API test successful');
      expect(response.body.apiResponse.success).toBe(true);
      expect(response.body.parsed.rate).toBe(82.45);
    });

    it('should handle API test failures', async () => {
      // Mock API failure
      axios.get.mockRejectedValue(new Error('API Error'));

      const response = await request(app)
        .get('/api/fx-rates/test')
        .expect(500);

      expect(response.body.error).toBe('FX API test failed');
    });
  });
});
