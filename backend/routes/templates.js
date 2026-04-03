const express = require('express');
const router = express.Router();
const { getTemplates, getTemplate, createTemplate, updateTemplate, deleteTemplate } = require('../controllers/templateController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.get('/', getTemplates);
router.post('/', authorize('admin', 'operator'), createTemplate);
router.get('/:id', getTemplate);
router.put('/:id', authorize('admin', 'operator'), updateTemplate);
router.delete('/:id', authorize('admin'), deleteTemplate);

module.exports = router;
