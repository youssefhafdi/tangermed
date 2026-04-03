const TargetGroup = require('../models/TargetGroup');

exports.getGroups = async (req, res) => {
  try {
    const groups = await TargetGroup.find().populate('createdBy', 'name').sort({ createdAt: -1 });
    res.json({ groups });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getGroup = async (req, res) => {
  try {
    const group = await TargetGroup.findById(req.params.id);
    if (!group) return res.status(404).json({ message: 'Groupe introuvable' });
    res.json({ group });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createGroup = async (req, res) => {
  try {
    const group = await TargetGroup.create({ ...req.body, createdBy: req.user._id });
    res.status(201).json({ group });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateGroup = async (req, res) => {
  try {
    const group = await TargetGroup.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!group) return res.status(404).json({ message: 'Groupe introuvable' });
    res.json({ group });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteGroup = async (req, res) => {
  try {
    const group = await TargetGroup.findByIdAndDelete(req.params.id);
    if (!group) return res.status(404).json({ message: 'Groupe introuvable' });
    res.json({ message: 'Groupe supprimé' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.addTargets = async (req, res) => {
  try {
    const { targets } = req.body;
    const group = await TargetGroup.findById(req.params.id);
    if (!group) return res.status(404).json({ message: 'Groupe introuvable' });
    group.targets.push(...targets);
    await group.save();
    res.json({ group });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.removeTarget = async (req, res) => {
  try {
    const group = await TargetGroup.findById(req.params.id);
    if (!group) return res.status(404).json({ message: 'Groupe introuvable' });
    group.targets = group.targets.filter(t => t._id.toString() !== req.params.targetId);
    await group.save();
    res.json({ group });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
