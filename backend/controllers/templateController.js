const EmailTemplate = require('../models/EmailTemplate');

exports.getTemplates = async (req, res) => {
  try {
    const { category, search } = req.query;
    const query = {};
    if (category) query.category = category;
    if (search) query.name = { $regex: search, $options: 'i' };
    const templates = await EmailTemplate.find(query).populate('createdBy', 'name').sort({ createdAt: -1 });
    res.json({ templates });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getTemplate = async (req, res) => {
  try {
    const template = await EmailTemplate.findById(req.params.id);
    if (!template) return res.status(404).json({ message: 'Modèle introuvable' });
    res.json({ template });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createTemplate = async (req, res) => {
  try {
    const template = await EmailTemplate.create({ ...req.body, createdBy: req.user._id });
    res.status(201).json({ template });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateTemplate = async (req, res) => {
  try {
    const template = await EmailTemplate.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!template) return res.status(404).json({ message: 'Modèle introuvable' });
    res.json({ template });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteTemplate = async (req, res) => {
  try {
    const template = await EmailTemplate.findByIdAndDelete(req.params.id);
    if (!template) return res.status(404).json({ message: 'Modèle introuvable' });
    res.json({ message: 'Modèle supprimé' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
