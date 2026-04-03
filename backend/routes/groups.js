const express = require('express');
const router = express.Router();
const { getGroups, getGroup, createGroup, updateGroup, deleteGroup, addTargets, removeTarget } = require('../controllers/groupController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.get('/', getGroups);
router.post('/', authorize('admin', 'operator'), createGroup);
router.get('/:id', getGroup);
router.put('/:id', authorize('admin', 'operator'), updateGroup);
router.delete('/:id', authorize('admin'), deleteGroup);
router.post('/:id/targets', authorize('admin', 'operator'), addTargets);
router.delete('/:id/targets/:targetId', authorize('admin', 'operator'), removeTarget);

module.exports = router;
