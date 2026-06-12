CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('freelancer','employer','admin')),
  full_name VARCHAR(255) NOT NULL,
  mobile VARCHAR(20),
  city VARCHAR(100),
  state VARCHAR(100),
  avatar_url TEXT,
  is_email_verified BOOLEAN DEFAULT FALSE,
  is_mobile_verified BOOLEAN DEFAULT FALSE,
  google_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE freelancers (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  primary_skill VARCHAR(100),
  years_of_experience INTEGER,
  linkedin_url TEXT,
  portfolio_website TEXT,
  headline VARCHAR(255),
  about_me TEXT,
  skills TEXT[] DEFAULT '{}',
  connect_credits INTEGER DEFAULT 100,
  profile_views INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE employers (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  company_name VARCHAR(255),
  industry VARCHAR(100),
  company_website TEXT,
  connect_credits INTEGER DEFAULT 100,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employer_id UUID NOT NULL REFERENCES employers(user_id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  category VARCHAR(100),
  description TEXT,
  required_skills TEXT[] DEFAULT '{}',
  budget_min INTEGER,
  budget_max INTEGER,
  budget_type VARCHAR(20) CHECK (budget_type IN ('hourly','monthly','fixed')),
  hours_per_day INTEGER,
  days_per_week INTEGER,
  experience_level VARCHAR(50),
  location_type VARCHAR(20) CHECK (location_type IN ('remote','hybrid','on-site')),
  project_duration VARCHAR(50),
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active','closed','draft')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE credit_packages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  credits INTEGER NOT NULL,
  price_inr DECIMAL(10,2) NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id),
  package_id UUID NOT NULL REFERENCES credit_packages(id),
  razorpay_order_id VARCHAR(255) UNIQUE NOT NULL,
  razorpay_payment_id VARCHAR(255),
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'INR',
  status VARCHAR(20) DEFAULT 'created' CHECK (status IN ('created','paid','failed')),
  credits_awarded INTEGER,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE connections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  freelancer_id UUID NOT NULL REFERENCES freelancers(user_id),
  employer_id UUID NOT NULL REFERENCES employers(user_id),
  job_id UUID REFERENCES jobs(id),
  initiated_by VARCHAR(20) NOT NULL CHECK (initiated_by IN ('freelancer','employer')),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending','accepted','rejected')),
  credits_spent INTEGER DEFAULT 5,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  connection_id UUID NOT NULL REFERENCES connections(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES users(id),
  message_type VARCHAR(20) DEFAULT 'text' CHECK (message_type IN ('text','image','file')),
  content TEXT,
  file_url TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  connection_id UUID NOT NULL REFERENCES connections(id),
  reviewer_id UUID NOT NULL REFERENCES users(id),
  reviewee_id UUID NOT NULL REFERENCES users(id),
  communication_rating INTEGER CHECK (communication_rating BETWEEN 1 AND 5),
  quality_rating INTEGER CHECK (quality_rating BETWEEN 1 AND 5),
  timeliness_rating INTEGER CHECK (timeliness_rating BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE saved_jobs (
  freelancer_id UUID NOT NULL REFERENCES freelancers(user_id),
  job_id UUID NOT NULL REFERENCES jobs(id),
  PRIMARY KEY (freelancer_id, job_id),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE saved_freelancers (
  employer_id UUID NOT NULL REFERENCES employers(user_id),
  freelancer_id UUID NOT NULL REFERENCES freelancers(user_id),
  PRIMARY KEY (employer_id, freelancer_id),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id),
  type VARCHAR(50),
  message TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_jobs_employer ON jobs(employer_id);
CREATE INDEX idx_messages_connection ON messages(connection_id);
CREATE INDEX idx_notifications_user ON notifications(user_id);