const express = require('express');
const router = express.Router();
const { getLandingPages, getLandingPage, createLandingPage, updateLandingPage, deleteLandingPage } = require('../controllers/landingPageController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.get('/', getLandingPages);
router.post('/', authorize('admin', 'operator'), createLandingPage);
router.get('/:id', getLandingPage);
router.put('/:id', authorize('admin', 'operator'), updateLandingPage);
router.delete('/:id', authorize('admin'), deleteLandingPage);

module.exports = router;
