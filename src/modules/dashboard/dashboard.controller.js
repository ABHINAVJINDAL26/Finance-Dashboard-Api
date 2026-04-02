const dashboardService = require('./dashboard.service');
const { success } = require('../../utils/response');

const summary = async (req, res, next) => {
  try { return success(res, await dashboardService.getSummary()); } catch (e) { next(e); }
};

const byCategory = async (req, res, next) => {
  try { return success(res, await dashboardService.getByCategory()); } catch (e) { next(e); }
};

const trends = async (req, res, next) => {
  try { return success(res, await dashboardService.getTrends(req.query.year)); } catch (e) { next(e); }
};

const recent = async (req, res, next) => {
  try { return success(res, await dashboardService.getRecent()); } catch (e) { next(e); }
};

module.exports = { summary, byCategory, trends, recent };
