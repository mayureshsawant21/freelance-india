const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const User = sequelize.define('User', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  email: { type: DataTypes.STRING, unique: true, allowNull: false },
  password_hash: { type: DataTypes.STRING, allowNull: false },
  role: { type: DataTypes.ENUM('freelancer', 'employer', 'admin'), allowNull: false },
  full_name: { type: DataTypes.STRING, allowNull: false },
  mobile: DataTypes.STRING,
  city: DataTypes.STRING,
  state: DataTypes.STRING,
  avatar_url: DataTypes.TEXT,
  is_email_verified: { type: DataTypes.BOOLEAN, defaultValue: false },
  is_mobile_verified: { type: DataTypes.BOOLEAN, defaultValue: false },
  google_id: DataTypes.STRING,
}, { timestamps: true, underscored: true });

const Freelancer = sequelize.define('Freelancer', {
  user_id: { type: DataTypes.UUID, primaryKey: true },
  primary_skill: DataTypes.STRING,
  years_of_experience: DataTypes.INTEGER,
  linkedin_url: DataTypes.TEXT,
  portfolio_website: DataTypes.TEXT,
  headline: DataTypes.STRING,
  about_me: DataTypes.TEXT,
  skills: { type: DataTypes.ARRAY(DataTypes.STRING), defaultValue: [] },
  connect_credits: { type: DataTypes.INTEGER, defaultValue: 100 },
  profile_views: { type: DataTypes.INTEGER, defaultValue: 0 },
}, { timestamps: true, underscored: true });

const Employer = sequelize.define('Employer', {
  user_id: { type: DataTypes.UUID, primaryKey: true },
  company_name: DataTypes.STRING,
  industry: DataTypes.STRING,
  company_website: DataTypes.TEXT,
  connect_credits: { type: DataTypes.INTEGER, defaultValue: 100 },
}, { timestamps: true, underscored: true });

const Job = sequelize.define('Job', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  employer_id: { type: DataTypes.UUID, allowNull: false },
  title: { type: DataTypes.STRING, allowNull: false },
  category: DataTypes.STRING,
  description: DataTypes.TEXT,
  required_skills: { type: DataTypes.ARRAY(DataTypes.STRING), defaultValue: [] },
  budget_min: DataTypes.INTEGER,
  budget_max: DataTypes.INTEGER,
  budget_type: DataTypes.ENUM('hourly', 'monthly', 'fixed'),
  hours_per_day: DataTypes.INTEGER,
  days_per_week: DataTypes.INTEGER,
  experience_level: DataTypes.STRING,
  location_type: DataTypes.ENUM('remote', 'hybrid', 'on-site'),
  project_duration: DataTypes.STRING,
  status: { type: DataTypes.ENUM('active', 'closed', 'draft'), defaultValue: 'active' },
}, { timestamps: true, underscored: true });

const CreditPackage = sequelize.define('CreditPackage', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false },
  credits: { type: DataTypes.INTEGER, allowNull: false },
  price_inr: { type: DataTypes.DECIMAL(10,2), allowNull: false },
  is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
}, { timestamps: true, underscored: true });

const Order = sequelize.define('Order', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  user_id: { type: DataTypes.UUID, allowNull: false },
  package_id: { type: DataTypes.UUID, allowNull: false },
  razorpay_order_id: { type: DataTypes.STRING, unique: true, allowNull: false },
  razorpay_payment_id: DataTypes.STRING,
  amount: { type: DataTypes.DECIMAL(10,2), allowNull: false },
  currency: { type: DataTypes.STRING, defaultValue: 'INR' },
  status: { type: DataTypes.ENUM('created', 'paid', 'failed'), defaultValue: 'created' },
  credits_awarded: DataTypes.INTEGER,
}, { timestamps: true, underscored: true });

const Connection = sequelize.define('Connection', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  freelancer_id: { type: DataTypes.UUID, allowNull: false },
  employer_id: { type: DataTypes.UUID, allowNull: false },
  job_id: DataTypes.UUID,
  initiated_by: { type: DataTypes.ENUM('freelancer', 'employer'), allowNull: false },
  status: { type: DataTypes.ENUM('pending', 'accepted', 'rejected'), defaultValue: 'pending' },
  credits_spent: { type: DataTypes.INTEGER, defaultValue: 5 },
}, { timestamps: true, underscored: true });

const Message = sequelize.define('Message', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  connection_id: { type: DataTypes.UUID, allowNull: false },
  sender_id: { type: DataTypes.UUID, allowNull: false },
  message_type: { type: DataTypes.ENUM('text', 'image', 'file'), defaultValue: 'text' },
  content: DataTypes.TEXT,
  file_url: DataTypes.TEXT,
  is_read: { type: DataTypes.BOOLEAN, defaultValue: false },
}, { timestamps: true, underscored: true });

const Review = sequelize.define('Review', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  connection_id: { type: DataTypes.UUID, allowNull: false },
  reviewer_id: { type: DataTypes.UUID, allowNull: false },
  reviewee_id: { type: DataTypes.UUID, allowNull: false },
  communication_rating: { type: DataTypes.INTEGER, validate: { min: 1, max: 5 } },
  quality_rating: { type: DataTypes.INTEGER, validate: { min: 1, max: 5 } },
  timeliness_rating: { type: DataTypes.INTEGER, validate: { min: 1, max: 5 } },
  comment: DataTypes.TEXT,
}, { timestamps: true, underscored: true });

const SavedJob = sequelize.define('SavedJob', {
  freelancer_id: { type: DataTypes.UUID, primaryKey: true },
  job_id: { type: DataTypes.UUID, primaryKey: true },
}, { timestamps: true, underscored: true });

const SavedFreelancer = sequelize.define('SavedFreelancer', {
  employer_id: { type: DataTypes.UUID, primaryKey: true },
  freelancer_id: { type: DataTypes.UUID, primaryKey: true },
}, { timestamps: true, underscored: true });

const Notification = sequelize.define('Notification', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  user_id: { type: DataTypes.UUID, allowNull: false },
  type: DataTypes.STRING,
  message: DataTypes.TEXT,
  is_read: { type: DataTypes.BOOLEAN, defaultValue: false },
  metadata: DataTypes.JSONB,
}, { timestamps: true, underscored: true });

// Associations
User.hasOne(Freelancer, { foreignKey: 'user_id' });
Freelancer.belongsTo(User, { foreignKey: 'user_id' });

User.hasOne(Employer, { foreignKey: 'user_id' });
Employer.belongsTo(User, { foreignKey: 'user_id' });

Employer.hasMany(Job, { foreignKey: 'employer_id' });
Job.belongsTo(Employer, { foreignKey: 'employer_id' });

Connection.belongsTo(Freelancer, { foreignKey: 'freelancer_id' });
Connection.belongsTo(Employer, { foreignKey: 'employer_id' });
Connection.hasMany(Message, { foreignKey: 'connection_id' });
Message.belongsTo(Connection, { foreignKey: 'connection_id' });

User.hasMany(Order, { foreignKey: 'user_id' });
Order.belongsTo(User, { foreignKey: 'user_id' });
Order.belongsTo(CreditPackage, { foreignKey: 'package_id' });

Connection.hasMany(Review, { foreignKey: 'connection_id' });
Review.belongsTo(Connection, { foreignKey: 'connection_id' });

module.exports = {
  sequelize,
  User,
  Freelancer,
  Employer,
  Job,
  CreditPackage,
  Order,
  Connection,
  Message,
  Review,
  SavedJob,
  SavedFreelancer,
  Notification,
};