const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE });
};

exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Email déjà utilisé' });
    const user = await User.create({ name, email, password, role });
    res.status(201).json({ token: generateToken(user._id), user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
    }
    user.lastLogin = new Date();
    await user.save();
    res.json({ token: generateToken(user._id), user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getMe = async (req, res) => {
  res.json({ user: req.user });
};

exports.updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select('+password');
    if (!(await user.matchPassword(currentPassword))) {
      return res.status(400).json({ message: 'Mot de passe actuel incorrect' });
    }
    user.password = newPassword;
    await user.save();
    res.json({ message: 'Mot de passe mis à jour' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
