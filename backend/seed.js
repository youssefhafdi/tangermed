require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const EmailTemplate = require('./models/EmailTemplate');
const TargetGroup = require('./models/TargetGroup');
const LandingPage = require('./models/LandingPage');
const Campaign = require('./models/Campaign');

const connectDB = require('./config/db');

const seed = async () => {
  await connectDB();
  await Promise.all([
    User.deleteMany(), EmailTemplate.deleteMany(),
    TargetGroup.deleteMany(), LandingPage.deleteMany(), Campaign.deleteMany()
  ]);

  // Users
  const admin = await User.create({ name: 'Admin Principal', email: 'admin@company.com', password: 'password123', role: 'admin' });
  const operator = await User.create({ name: 'Opérateur Sécurité', email: 'operator@company.com', password: 'password123', role: 'operator' });

  // Templates
  const t1 = await EmailTemplate.create({
    name: 'Réinitialisation mot de passe IT',
    subject: 'Action requise : Réinitialisation de votre mot de passe',
    fromName: 'Support IT',
    fromEmail: 'support-it@company.com',
    htmlContent: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
      <div style="background:#1e3a8a;padding:20px;text-align:center">
        <h1 style="color:white;margin:0">Support IT</h1>
      </div>
      <div style="padding:30px;background:#f9fafb">
        <p>Bonjour {{FirstName}},</p>
        <p>Votre mot de passe expire dans <strong>24 heures</strong>. Veuillez le réinitialiser immédiatement.</p>
        <div style="text-align:center;margin:30px 0">
          <a href="{{PhishingLink}}" style="background:#1e3a8a;color:white;padding:12px 30px;text-decoration:none;border-radius:5px;font-size:16px">
            Réinitialiser mon mot de passe
          </a>
        </div>
        <p style="color:#6b7280;font-size:12px">Si vous n'êtes pas à l'origine de cette demande, ignorez cet email.</p>
      </div>
    </div>`,
    category: 'credential_harvest',
    createdBy: admin._id,
  });

  const t2 = await EmailTemplate.create({
    name: 'Notification RH - Document urgent',
    subject: '⚠️ Document RH à signer avant vendredi',
    fromName: 'Ressources Humaines',
    fromEmail: 'rh@company.com',
    htmlContent: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
      <div style="background:#dc2626;padding:20px;text-align:center">
        <h1 style="color:white;margin:0">Ressources Humaines</h1>
      </div>
      <div style="padding:30px">
        <p>Bonjour {{FirstName}} {{LastName}},</p>
        <p>Un document important nécessite votre signature avant <strong>vendredi 17h</strong>.</p>
        <p>Il s'agit de votre avenant de contrat pour l'année {{Year}}.</p>
        <div style="text-align:center;margin:30px 0">
          <a href="{{PhishingLink}}" style="background:#dc2626;color:white;padding:12px 30px;text-decoration:none;border-radius:5px">
            Accéder au document
          </a>
        </div>
      </div>
    </div>`,
    category: 'hr',
    createdBy: admin._id,
  });

  // Target Groups
  const g1 = await TargetGroup.create({
    name: 'Équipe Finance',
    description: 'Département Finance et Comptabilité',
    targets: [
      { email: 'alice.martin@company.com', firstName: 'Alice', lastName: 'Martin', department: 'Finance', position: 'Comptable' },
      { email: 'bob.dupont@company.com', firstName: 'Bob', lastName: 'Dupont', department: 'Finance', position: 'Analyste' },
      { email: 'claire.petit@company.com', firstName: 'Claire', lastName: 'Petit', department: 'Finance', position: 'Directrice' },
      { email: 'david.moreau@company.com', firstName: 'David', lastName: 'Moreau', department: 'Finance', position: 'Contrôleur' },
      { email: 'emma.leroy@company.com', firstName: 'Emma', lastName: 'Leroy', department: 'Finance', position: 'Trésorière' },
    ],
    createdBy: admin._id,
  });

  const g2 = await TargetGroup.create({
    name: 'Équipe Commerciale',
    description: 'Équipe Ventes et Marketing',
    targets: [
      { email: 'francois.bernard@company.com', firstName: 'François', lastName: 'Bernard', department: 'Commercial', position: 'Commercial' },
      { email: 'gabriel.thomas@company.com', firstName: 'Gabriel', lastName: 'Thomas', department: 'Commercial', position: 'Chef de projet' },
      { email: 'helene.robert@company.com', firstName: 'Hélène', lastName: 'Robert', department: 'Marketing', position: 'Chargée Marketing' },
      { email: 'igor.simon@company.com', firstName: 'Igor', lastName: 'Simon', department: 'Commercial', position: 'Manager' },
    ],
    createdBy: operator._id,
  });

  // Landing Pages
  const lp1 = await LandingPage.create({
    name: 'Portail Login Générique',
    redirectUrl: 'https://www.google.com',
    captureCredentials: true,
    capturePasswords: false,
    htmlContent: `<!DOCTYPE html>
<html>
<head><title>Connexion - Portail Entreprise</title>
<style>
  body { font-family: Arial, sans-serif; background: #f0f4f8; display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; }
  .card { background: white; padding: 40px; border-radius: 10px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); width: 360px; }
  .logo { text-align: center; margin-bottom: 30px; }
  .logo h1 { color: #1e3a8a; font-size: 24px; }
  input { width: 100%; padding: 12px; border: 1px solid #d1d5db; border-radius: 6px; margin: 8px 0; box-sizing: border-box; font-size: 14px; }
  button { width: 100%; padding: 12px; background: #1e3a8a; color: white; border: none; border-radius: 6px; font-size: 16px; cursor: pointer; margin-top: 10px; }
  button:hover { background: #1e40af; }
  .hint { color: #ef4444; font-size: 12px; text-align: center; margin-top: 10px; }
</style>
</head>
<body>
  <div class="card">
    <div class="logo"><h1>🏢 Portail Entreprise</h1></div>
    <form>
      <label style="font-size:14px;color:#374151">Identifiant / Email</label>
      <input type="email" placeholder="votre@email.com" />
      <label style="font-size:14px;color:#374151">Mot de passe</label>
      <input type="password" placeholder="••••••••" />
      <button type="submit">Se connecter</button>
    </form>
    <p class="hint">⚠️ Ceci est une simulation de phishing à des fins de formation</p>
  </div>
</body>
</html>`,
    createdBy: admin._id,
  });

  // Campaigns with results
  const now = new Date();
  const campaign1 = await Campaign.create({
    name: 'Campagne Q1 - Finance',
    description: 'Test de sensibilisation phishing pour l\'équipe Finance',
    status: 'completed',
    launchDate: new Date(now - 30 * 24 * 60 * 60 * 1000),
    endDate: new Date(now - 15 * 24 * 60 * 60 * 1000),
    template: t1._id,
    group: g1._id,
    landingPage: lp1._id,
    createdBy: admin._id,
    results: [
      {
        targetEmail: 'alice.martin@company.com', targetName: 'Alice Martin', department: 'Finance',
        events: [
          { type: 'email_sent', timestamp: new Date(now - 30 * 24 * 60 * 60 * 1000) },
          { type: 'email_opened', timestamp: new Date(now - 30 * 24 * 60 * 60 * 1000 + 900000) },
          { type: 'link_clicked', timestamp: new Date(now - 30 * 24 * 60 * 60 * 1000 + 960000) },
          { type: 'data_submitted', timestamp: new Date(now - 30 * 24 * 60 * 60 * 1000 + 1020000) },
        ],
        riskLevel: 'high',
      },
      {
        targetEmail: 'bob.dupont@company.com', targetName: 'Bob Dupont', department: 'Finance',
        events: [
          { type: 'email_sent', timestamp: new Date(now - 30 * 24 * 60 * 60 * 1000) },
          { type: 'email_opened', timestamp: new Date(now - 29 * 24 * 60 * 60 * 1000) },
          { type: 'link_clicked', timestamp: new Date(now - 29 * 24 * 60 * 60 * 1000 + 300000) },
        ],
        riskLevel: 'medium',
      },
      {
        targetEmail: 'claire.petit@company.com', targetName: 'Claire Petit', department: 'Finance',
        events: [
          { type: 'email_sent', timestamp: new Date(now - 30 * 24 * 60 * 60 * 1000) },
          { type: 'reported', timestamp: new Date(now - 30 * 24 * 60 * 60 * 1000 + 600000) },
        ],
        riskLevel: 'low',
      },
      {
        targetEmail: 'david.moreau@company.com', targetName: 'David Moreau', department: 'Finance',
        events: [
          { type: 'email_sent', timestamp: new Date(now - 30 * 24 * 60 * 60 * 1000) },
          { type: 'email_opened', timestamp: new Date(now - 28 * 24 * 60 * 60 * 1000) },
        ],
        riskLevel: 'low',
      },
      {
        targetEmail: 'emma.leroy@company.com', targetName: 'Emma Leroy', department: 'Finance',
        events: [
          { type: 'email_sent', timestamp: new Date(now - 30 * 24 * 60 * 60 * 1000) },
        ],
        riskLevel: 'low',
      },
    ],
  });

  const campaign2 = await Campaign.create({
    name: 'Campagne Q1 - Commercial',
    description: 'Test phishing équipe commerciale',
    status: 'active',
    launchDate: new Date(now - 7 * 24 * 60 * 60 * 1000),
    template: t2._id,
    group: g2._id,
    landingPage: lp1._id,
    createdBy: operator._id,
    results: [
      {
        targetEmail: 'francois.bernard@company.com', targetName: 'François Bernard', department: 'Commercial',
        events: [
          { type: 'email_sent', timestamp: new Date(now - 7 * 24 * 60 * 60 * 1000) },
          { type: 'email_opened', timestamp: new Date(now - 6 * 24 * 60 * 60 * 1000) },
        ],
        riskLevel: 'low',
      },
      {
        targetEmail: 'gabriel.thomas@company.com', targetName: 'Gabriel Thomas', department: 'Commercial',
        events: [
          { type: 'email_sent', timestamp: new Date(now - 7 * 24 * 60 * 60 * 1000) },
          { type: 'email_opened', timestamp: new Date(now - 7 * 24 * 60 * 60 * 1000 + 3600000) },
          { type: 'link_clicked', timestamp: new Date(now - 7 * 24 * 60 * 60 * 1000 + 3660000) },
          { type: 'data_submitted', timestamp: new Date(now - 7 * 24 * 60 * 60 * 1000 + 3720000) },
        ],
        riskLevel: 'high',
      },
      {
        targetEmail: 'helene.robert@company.com', targetName: 'Hélène Robert', department: 'Marketing',
        events: [
          { type: 'email_sent', timestamp: new Date(now - 7 * 24 * 60 * 60 * 1000) },
        ],
        riskLevel: 'low',
      },
      {
        targetEmail: 'igor.simon@company.com', targetName: 'Igor Simon', department: 'Commercial',
        events: [
          { type: 'email_sent', timestamp: new Date(now - 7 * 24 * 60 * 60 * 1000) },
          { type: 'email_opened', timestamp: new Date(now - 5 * 24 * 60 * 60 * 1000) },
          { type: 'reported', timestamp: new Date(now - 5 * 24 * 60 * 60 * 1000 + 1800000) },
        ],
        riskLevel: 'low',
      },
    ],
  });

  console.log('✅ Base de données initialisée avec succès !');
  console.log('👤 Admin : admin@company.com / password123');
  console.log('👤 Opérateur : operator@company.com / password123');
  process.exit(0);
};

seed().catch(err => { console.error(err); process.exit(1); });
