const LandingPage = require('../models/LandingPage');

exports.getLandingPages = async (req, res) => {
  try {
    const pages = await LandingPage.find().populate('createdBy', 'name').sort({ createdAt: -1 });
    res.json({ landingPages: pages });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getLandingPage = async (req, res) => {
  try {
    const page = await LandingPage.findById(req.params.id);
    if (!page) return res.status(404).json({ message: 'Page introuvable' });
    res.json({ landingPage: page });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createLandingPage = async (req, res) => {
  try {
    const page = await LandingPage.create({ ...req.body, createdBy: req.user._id });
    res.status(201).json({ landingPage: page });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateLandingPage = async (req, res) => {
  try {
    const page = await LandingPage.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!page) return res.status(404).json({ message: 'Page introuvable' });
    res.json({ landingPage: page });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteLandingPage = async (req, res) => {
  try {
    const page = await LandingPage.findByIdAndDelete(req.params.id);
    if (!page) return res.status(404).json({ message: 'Page introuvable' });
    res.json({ message: 'Page supprimée' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
