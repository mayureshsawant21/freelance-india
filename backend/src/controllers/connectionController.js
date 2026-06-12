const { Freelancer, Employer, Connection } = require('../models');
const { sequelize } = require('../config/db');

exports.initiateConnection = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const user = req.user;
    const { targetId, jobId } = req.body;
    let freelancerId, employerId, initiatedBy;

    if (user.role === 'freelancer') {
      freelancerId = user.id;
      employerId = targetId;
      initiatedBy = 'freelancer';
    } else {
      freelancerId = targetId;
      employerId = user.id;
      initiatedBy = 'employer';
    }

    // Deduct credits from initiator
    const profile = user.role === 'freelancer'
      ? await Freelancer.findByPk(user.id, { transaction })
      : await Employer.findByPk(user.id, { transaction });

    if (profile.connect_credits < 5) throw new Error('Insufficient credits');
    profile.connect_credits -= 5;
    await profile.save({ transaction });

    // Create connection
    const connection = await Connection.create({
      freelancer_id: freelancerId,
      employer_id: employerId,
      job_id: jobId || null,
      initiated_by: initiatedBy,
      credits_spent: 5,
      status: 'pending'
    }, { transaction });

    await transaction.commit();

    // Emit socket event to target user
    const io = req.app.get('io');
    io.to(targetId).emit('new_connection', { connectionId: connection.id, from: user.id });

    res.json({ success: true, connectionId: connection.id, credits_remaining: profile.connect_credits });
  } catch (error) {
    await transaction.rollback();
    res.status(400).json({ error: error.message });
  }
};