const express = require('express');
const router = express.Router();
const {
  getCampaigns, getCampaign, createCampaign, updateCampaign,
  deleteCampaign, launchCampaign, pauseCampaign, recordEvent, getDashboardStats
} = require('../controllers/campaignController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.get('/stats/dashboard', getDashboardStats);
router.get('/', getCampaigns);
router.post('/', authorize('admin', 'operator'), createCampaign);
router.get('/:id', getCampaign);
router.put('/:id', authorize('admin', 'operator'), updateCampaign);
router.delete('/:id', authorize('admin'), deleteCampaign);
router.post('/:id/launch', authorize('admin', 'operator'), launchCampaign);
router.post('/:id/pause', authorize('admin', 'operator'), pauseCampaign);
router.post('/event', recordEvent);

module.exports = router;
