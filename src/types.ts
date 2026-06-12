/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole = 'freelancer' | 'employer' | 'admin';

export interface PortfolioItem {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  linkUrl?: string;
  category?: string;
}

export interface ReviewRating {
  communication: number;
  quality: number;
  timeliness: number;
  average: number;
}

export interface UserReview {
  id: string;
  reviewerId: string;
  reviewerName: string;
  reviewerCompany?: string;
  freelancerId: string;
  jobId: string;
  jobTitle: string;
  ratingCommunication: number;
  ratingQuality: number;
  ratingTimeliness: number;
  averageRating: number;
  feedback: string;
  createdAt: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  mobile: string;
  city: string;
  state: string;
  // Common
  connects: number;
  isEmailVerified: boolean;
  isMobileVerified: boolean;
  registeredAt: string;
  bio?: string;
  
  // Employer Profile
  companyName?: string;
  industry?: string;
  companyWebsite?: string;
  savedFreelancers?: string[]; // IDs of freelancers

  // Freelancer Profile
  headline?: string;
  primarySkill?: string;
  yearsOfExperience?: number;
  linkedin?: string;
  portfolioUrl?: string;
  skills?: string[];
  certifications?: string[];
  portfolioItems?: PortfolioItem[];
  averageRating?: number; // Overall combined review average
  completedJobsCount?: number;
  savedJobs?: string[]; // IDs of jobs
}

export interface Job {
  id: string;
  employerId: string;
  employerName: string;
  companyName?: string;
  title: string;
  category: string;
  description: string;
  requiredSkills: string[];
  budgetMin: number;
  budgetMax: number;
  payType: 'hourly' | 'monthly';
  hoursPerDay?: number;
  daysPerWeek?: number;
  experienceLevel: 'beginner' | 'intermediate' | 'expert';
  locationType: 'remote' | 'hybrid' | 'on-site';
  duration: string; // e.g. "1 Month", "3 Months", "Ongoing"
  active: boolean;
  postedAt: string;
}

export interface Proposal {
  id: string;
  jobId: string;
  jobTitle: string;
  freelancerId: string;
  freelancerName: string;
  freelancerHeadline?: string;
  coverLetter: string;
  bidAmount: number;
  status: 'pending' | 'accepted' | 'declined';
  submittedAt: string;
}

export interface Connection {
  id: string;
  freelancerId: string;
  employerId: string;
  jobId?: string; // If initiated from a specific job application
  connectedAt: string;
  initiatedBy: UserRole;
}

export interface Message {
  id: string;
  connectionId: string;
  senderId: string;
  text: string;
  fileUrl?: string;
  fileName?: string;
  fileType?: string;
  sentAt: string;
  read: boolean;
}

export interface PaymentPlan {
  id: string;
  name: string;
  credits: number;
  priceINR: number;
  badge?: string;
  description: string;
}

export interface PaymentLog {
  id: string;
  userId: string;
  planName: string;
  amount: number;
  paymentId: string;
  status: 'success' | 'failed';
  date: string;
}

export interface PaymentReceipt {
  id: string;
  userId: string;
  userName: string;
  creditsPurchased: number;
  amountINR: number;
  paymentMethod: string;
  createdAt: string;
  status: 'success' | 'failed' | 'pending';
}

export interface ReportItem {
  id: string;
  reporterId: string;
  reporterName: string;
  targetType: 'user' | 'job';
  targetId: string;
  targetName: string;
  reason: string;
  status: 'pending' | 'resolved';
  createdAt: string;
}

export interface UserNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'message' | 'connection' | 'job' | 'system' | 'credits';
  read: boolean;
  createdAt: string;
  link?: string;
}
