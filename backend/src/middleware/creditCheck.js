const { Freelancer, Employer } = require('../models');

const checkConnectCredits = async (req, res, next) => {
  const user = req.user;
  const profileModel = user.role === 'freelancer' ? Freelancer : Employer;
  const profile = await profileModel.findByPk(user.id);

  if (profile.connect_credits < 5) {
    return res.status(402).json({ error: 'Insufficient connect credits', required: 5 });
  }
  req.profile = profile;
  next();
};

module.exports = checkConnectCredits;