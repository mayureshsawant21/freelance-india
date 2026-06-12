const { Freelancer, User } = require('../models');

exports.browseFreelancers = async (req, res) => {
  const { skill, experience, location } = req.query;
  const where = {};
  if (skill) where.skills = { [require('sequelize').Op.contains]: [skill] };
  if (experience) where.years_of_experience = { [require('sequelize').Op.gte]: parseInt(experience) };

  const freelancers = await Freelancer.findAll({
    where,
    include: [{ model: User, attributes: { exclude: ['password_hash'] } }],
  });
  res.json(freelancers);
};

exports.getFreelancerProfile = async (req, res) => {
  const freelancer = await Freelancer.findByPk(req.params.id, {
    include: [{ model: User, attributes: { exclude: ['password_hash', 'email', 'mobile'] } }]
  });
  if (!freelancer) return res.status(404).json({ error: 'Freelancer not found' });
  // Increment profile views
  freelancer.profile_views += 1;
  await freelancer.save();
  res.json(freelancer);
};