const Campaign = require('../models/Campaign');
const TargetGroup = require('../models/TargetGroup');

exports.getCampaigns = async (req, res) => {
  try {
    const { status, search, page = 1, limit = 10 } = req.query;
    const query = {};
    if (status && status !== 'all') query.status = status;
    if (search) query.name = { $regex: search, $options: 'i' };

    const total = await Campaign.countDocuments(query);
    const campaigns = await Campaign.find(query)
      .populate('template', 'name')
      .populate('group', 'name targets')
      .populate('landingPage', 'name')
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({ campaigns, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getCampaign = async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id)
      .populate('template')
      .populate('group')
      .populate('landingPage')
      .populate('createdBy', 'name');
    if (!campaign) return res.status(404).json({ message: 'Campagne introuvable' });
    res.json({ campaign });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createCampaign = async (req, res) => {
  try {
    const campaign = await Campaign.create({ ...req.body, createdBy: req.user._id });
    res.status(201).json({ campaign });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateCampaign = async (req, res) => {
  try {
    const campaign = await Campaign.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!campaign) return res.status(404).json({ message: 'Campagne introuvable' });
    res.json({ campaign });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteCampaign = async (req, res) => {
  try {
    const campaign = await Campaign.findByIdAndDelete(req.params.id);
    if (!campaign) return res.status(404).json({ message: 'Campagne introuvable' });
    res.json({ message: 'Campagne supprimée' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.launchCampaign = async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id).populate('group');
    if (!campaign) return res.status(404).json({ message: 'Campagne introuvable' });
    if (!campaign.group) return res.status(400).json({ message: 'Groupe cible manquant' });

    // Simulate sending emails by creating result entries
    const results = campaign.group.targets.map(target => ({
      targetEmail: target.email,
      targetName: `${target.firstName} ${target.lastName}`,
      department: target.department,
      events: [{ type: 'email_sent', timestamp: new Date() }],
      riskLevel: 'low',
    }));

    campaign.results = results;
    campaign.status = 'active';
    campaign.launchDate = new Date();
    await campaign.save();

    res.json({ campaign, message: `Campagne lancée - ${results.length} emails envoyés` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.pauseCampaign = async (req, res) => {
  try {
    const campaign = await Campaign.findByIdAndUpdate(
      req.params.id,
      { status: 'paused' },
      { new: true }
    );
    if (!campaign) return res.status(404).json({ message: 'Campagne introuvable' });
    res.json({ campaign });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.recordEvent = async (req, res) => {
  try {
    const { campaignId, targetEmail, eventType, ipAddress, userAgent } = req.body;
    const campaign = await Campaign.findById(campaignId);
    if (!campaign) return res.status(404).json({ message: 'Campagne introuvable' });

    const result = campaign.results.find(r => r.targetEmail === targetEmail);
    if (!result) return res.status(404).json({ message: 'Cible introuvable' });

    result.events.push({ type: eventType, timestamp: new Date(), ipAddress, userAgent });

    // Update risk level
    const hasSubmit = result.events.some(e => e.type === 'data_submitted');
    const hasClick = result.events.some(e => e.type === 'link_clicked');
    result.riskLevel = hasSubmit ? 'high' : hasClick ? 'medium' : 'low';

    await campaign.save();
    res.json({ message: 'Événement enregistré' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getDashboardStats = async (req, res) => {
  try {
    const totalCampaigns = await Campaign.countDocuments();
    const activeCampaigns = await Campaign.countDocuments({ status: 'active' });
    const campaigns = await Campaign.find().select('results status name createdAt');

    let totalSent = 0, totalClicked = 0, totalSubmitted = 0, totalReported = 0;
    const campaignStats = campaigns.map(c => {
      const stats = c.stats;
      totalSent += stats.sent;
      totalClicked += stats.clicked;
      totalSubmitted += stats.submitted;
      totalReported += stats.reported;
      return { name: c.name, status: c.status, ...stats };
    });

    const phishRate = totalSent > 0 ? Math.round((totalClicked / totalSent) * 100) : 0;

    res.json({
      totalCampaigns,
      activeCampaigns,
      totalSent,
      totalClicked,
      totalSubmitted,
      totalReported,
      phishRate,
      campaignStats,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
