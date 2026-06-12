const { User, Job, Order, sequelize } = require('../models');

exports.getStats = async (req, res) => {
  const totalUsers = await User.count();
  const activeJobs = await Job.count({ where: { status: 'active' } });
  const revenue = await Order.sum('amount', { where: { status: 'paid' } });
  res.json({ totalUsers, activeJobs, revenue: revenue || 0 });
};

exports.getUsers = async (req, res) => {
  const users = await User.findAll({ attributes: { exclude: ['password_hash'] } });
  res.json(users);
};