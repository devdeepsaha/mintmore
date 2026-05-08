const adminService = require('../admin/admin.service');
const { sendSuccess } = require('../../utils/apiResponse');

/**
 * Public endpoint — no auth required.
 * Used by frontend for job posting dropdowns.
 */
const getCategories = async (req, res, next) => {
  try {
    const categories = await adminService.getCategories(false); // active only
    return sendSuccess(res, { data: { categories } });
  } catch (err) {
    next(err);
  }
};

const { getMarketRangeForClient } = require('../matching/pricing.service');

// Add this controller:
const getMarketRange = async (req, res, next) => {
  try {
    const { pricing_mode = 'budget' } = req.query;
    const range = await getMarketRangeForClient(req.params.categoryId, pricing_mode);

    if (!range) {
      return sendSuccess(res, {
        data: { range: null },
        message: 'No pricing data available for this category yet',
      });
    }

    return sendSuccess(res, { data: { range } });
  } catch (err) { next(err); }
};

module.exports = { getCategories, getMarketRange };