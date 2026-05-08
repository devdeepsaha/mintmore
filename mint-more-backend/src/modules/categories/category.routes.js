const { Router } = require('express');
const { getCategories, getMarketRange } = require('./category.controller');

const router = Router();

// GET /api/v1/categories — public, no auth required
router.get('/', getCategories);

// GET /api/v1/categories/:categoryId/market-range?pricing_mode=budget
router.get('/:categoryId/market-range', getMarketRange);

module.exports = router;