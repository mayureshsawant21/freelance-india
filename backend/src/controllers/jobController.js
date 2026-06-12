const { Job, Employer, User } = require('../models');

exports.createJob = async (req, res) => {
  try {
    const employer = await Employer.findByPk(req.user.id);
    if (!employer) return res.status(403).json({ error: 'Only employers can post jobs' });

    const job = await Job.create({
      employer_id: employer.user_id,
      ...req.body
    });
    res.status(201).json(job);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getJobs = async (req, res) => {
  const { skill, budget, experience, location_type, remote } = req.query;
  const where = { status: 'active' };
  if (skill) where.required_skills = { [require('sequelize').Op.contains]: [skill] };
  if (experience) where.experience_level = experience;
  if (location_type) where.location_type = location_type;

  const jobs = await Job.findAll({
    where,
    include: [{ model: Employer, include: [User] }],
    order: [['createdAt', 'DESC']]
  });
  res.json(jobs);
};

exports.getJobById = async (req, res) => {
  const job = await Job.findByPk(req.params.id, {
    include: [{ model: Employer, include: [User] }]
  });
  if (!job) return res.status(404).json({ error: 'Job not found' });
  res.json(job);
};