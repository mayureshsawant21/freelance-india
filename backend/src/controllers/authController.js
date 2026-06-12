const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User, Freelancer, Employer } = require('../models');

exports.signup = async (req, res) => {
  try {
    const { role, fullName, email, password, mobile, city, state, ...rest } = req.body;
    const existing = await User.findOne({ where: { email } });
    if (existing) return res.status(400).json({ error: 'Email already registered' });

    const password_hash = await bcrypt.hash(password, 12);
    const user = await User.create({
      email,
      password_hash,
      role,
      full_name: fullName,
      mobile,
      city,
      state,
    });

    if (role === 'freelancer') {
      await Freelancer.create({
        user_id: user.id,
        primary_skill: rest.primarySkill,
        years_of_experience: rest.yearsOfExperience,
        linkedin_url: rest.linkedin,
        portfolio_website: rest.portfolio,
        connect_credits: 100,
      });
    } else if (role === 'employer') {
      await Employer.create({
        user_id: user.id,
        company_name: rest.companyName,
        industry: rest.industry,
        company_website: rest.companyWebsite,
        connect_credits: 100,
      });
    }

    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    });

    res.status(201).json({ token, user: { id: user.id, role: user.role, full_name: user.full_name } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(400).json({ error: 'Invalid credentials' });

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(400).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    });
    res.json({ token, user: { id: user.id, role: user.role, full_name: user.full_name } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};