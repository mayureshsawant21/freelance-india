/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import fs from 'fs';
import path from 'path';
import { 
  UserProfile, 
  Job, 
  Proposal, 
  Connection, 
  Message, 
  UserReview, 
  PaymentLog, 
  ReportItem, 
  UserNotification 
} from '../src/types.js';

const DB_FILE = path.join(process.cwd(), 'database.json');

interface DatabaseSchema {
  users: UserProfile[];
  passwords: Record<string, string>; // Maps userId -> password hash/plain
  jobs: Job[];
  proposals: Proposal[];
  connections: Connection[];
  messages: Message[];
  reviews: UserReview[];
  payments: PaymentLog[];
  reports: ReportItem[];
  notifications: UserNotification[];
}

const initialSchema: DatabaseSchema = {
  users: [],
  passwords: {},
  jobs: [],
  proposals: [],
  connections: [],
  messages: [],
  reviews: [],
  payments: [],
  reports: [],
  notifications: []
};

// Seed Data
const seedUsers: { user: UserProfile; secret: string }[] = [
  {
    secret: "password123",
    user: {
      id: "fl-ankit",
      name: "Ankit Sharma",
      email: "ankit.sharma@gmail.com",
      role: "freelancer",
      mobile: "+91 98765 43210",
      city: "Bangalore",
      state: "Karnataka",
      connects: 100,
      isEmailVerified: true,
      isMobileVerified: true,
      registeredAt: "2026-05-15T10:00:00Z",
      headline: "Performance Marketer & Meta Ads Expert | 3.5x average ROAS",
      primarySkill: "Meta Ads Experts",
      yearsOfExperience: 5,
      linkedin: "https://linkedin.com/in/seed-ankit-sharma",
      portfolioUrl: "https://ankitmarketing.cc",
      bio: "Highly analytical Digital Marketer specializing in high-ROAS Meta and Google search campaigns for Indian D2C brands. Managed over 50 Lakhs INR in media spend. Strong focus on Conversion Rate Optimization (CRO), custom events tracking, and landing page wireframing.",
      skills: ["Meta Ads Experts", "Google Ads Specialists", "Performance Marketer", "Analytics Experts", "Email Marketers"],
      certifications: ["Meta Certified Media Buying Professional", "Google Ads Search Certified"],
      averageRating: 4.85,
      completedJobsCount: 14,
      savedJobs: [],
      portfolioItems: [
        {
          id: "p1-1",
          title: "Slashed CAC by 42% for D2C Cosmetic Brand",
          description: "Overhauled the pixel events structure, re-engineered creative assets with Hooks, and set up custom lookalikes. Achieved 3.8x purchase ROAS within 45 days.",
          imageUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=400",
          category: "Performance Marketer"
        },
        {
          id: "p1-2",
          title: "Google Ads Scale Campaign for EdTech Startup",
          description: "Configured target CPA search scripts generating 1,200 leads/month at competitive bid caps.",
          imageUrl: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&q=80&w=400",
          category: "Google Ads Specialists"
        }
      ]
    }
  },
  {
    secret: "password123",
    user: {
      id: "fl-riya",
      name: "Riya Verma",
      email: "riya.verma@gmail.com",
      role: "freelancer",
      mobile: "+91 91234 56789",
      city: "Mumbai",
      state: "Maharashtra",
      connects: 85,
      isEmailVerified: true,
      isMobileVerified: true,
      registeredAt: "2026-05-18T14:30:00Z",
      headline: "SEO Specialist & Content Strategist | SaaS & FinTech Expert",
      primarySkill: "SEO Specialists",
      yearsOfExperience: 4,
      linkedin: "https://linkedin.com/in/seed-riya-seo",
      portfolioUrl: "https://riya-organic.in",
      bio: "I help modern technical brands capture zero-click searches and scale organic signups. From exhaustive technical audits (schema markup, Core Web Vitals) to content calendars that secure topical authority, I rank websites on high-intent intent queries.",
      skills: ["SEO Specialists", "Content Writers", "Wordpress Developers", "Analytics Experts"],
      certifications: ["Semrush SEO Academy Graduate", "Ahrefs Advanced Keyword Research Certificate"],
      averageRating: 4.9,
      completedJobsCount: 8,
      savedJobs: [],
      portfolioItems: [
        {
          id: "p2-1",
          title: "0 to 120k Organic Traffic in 9 Months",
          description: "Implemented standard high-quality hub-and-spoke content architecture for a premium Indian FinTech app. Secured featured snippets on 100+ highly valuable banking terms.",
          imageUrl: "https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?auto=format&fit=crop&q=80&w=400",
          category: "SEO Specialists"
        }
      ]
    }
  },
  {
    secret: "password123",
    user: {
      id: "fl-rohan",
      name: "Rohan Das",
      email: "rohan.das@gmail.com",
      role: "freelancer",
      mobile: "+91 88888 77777",
      city: "Gurgaon",
      state: "Haryana",
      connects: 120,
      isEmailVerified: true,
      isMobileVerified: false,
      registeredAt: "2026-05-20T09:12:00Z",
      headline: "Professional Video Editor & YouTube Growth Manager",
      primarySkill: "Video Editors",
      yearsOfExperience: 3,
      linkedin: "https://linkedin.com/in/seed-rohan-videos",
      portfolioUrl: "https://behance.net/rohan-edits",
      bio: "Crafting highly engaging direct-response video creative for Instagram Reels, YouTube Shorts, and high-CTR marketing ads. Expert in rapid storytelling, visual hooks, sound design, and color grading that maximizes user retention on mobile timelines.",
      skills: ["Video Editors", "Graphic Designers", "Social Media Managers", "Influencer Marketing Specialists"],
      certifications: ["Premiere Pro Certified Associate"],
      averageRating: 5.0,
      completedJobsCount: 22,
      savedJobs: [],
      portfolioItems: [
        {
          id: "p3-1",
          title: "Viral Instagram Reel Campaign for Lifestyle Brand",
          description: "Edited 12 short-form dynamic reels generating 4.2 Million total impressions, driving massive affiliate conversions.",
          imageUrl: "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&q=80&w=400",
          category: "Video Editors"
        }
      ]
    }
  },
  {
    secret: "password123",
    user: {
      id: "emp-zepto",
      name: "Varun Malhotra",
      email: "varun@boldd2c.com",
      role: "employer",
      mobile: "+91 99911 22233",
      city: "Delhi",
      state: "Delhi",
      connects: 90,
      isEmailVerified: true,
      isMobileVerified: true,
      registeredAt: "2026-05-10T11:00:00Z",
      companyName: "Bold Wear D2C",
      industry: "E-commerce Companies",
      companyWebsite: "https://boldwear.co.in",
      savedFreelancers: []
    }
  },
  {
    secret: "password123",
    user: {
      id: "emp-agency",
      name: "Sanjana Mehta",
      email: "sanjana@pixelspark.in",
      role: "employer",
      mobile: "+91 88822 33344",
      city: "Mumbai",
      state: "Maharashtra",
      connects: 140,
      isEmailVerified: true,
      isMobileVerified: true,
      registeredAt: "2026-05-12T16:00:00Z",
      companyName: "Pixel Spark Agency",
      industry: "Agencies",
      companyWebsite: "https://pixelspark.in",
      savedFreelancers: []
    }
  },
  {
    secret: "adminpass",
    user: {
      id: "admin-user",
      name: "Freelance India Administrator",
      email: "admin@freelanceindia.com",
      role: "admin",
      mobile: "+91 99999 99999",
      city: "New Delhi",
      state: "Delhi",
      connects: 10000,
      isEmailVerified: true,
      isMobileVerified: true,
      registeredAt: "2026-01-01T00:00:00Z",
    }
  }
];

const seedJobs: Job[] = [
  {
    id: "job-1",
    employerId: "emp-zepto",
    employerName: "Varun Malhotra",
    companyName: "Bold Wear D2C",
    title: "Meta Ads Performance Marketer to Scale Apparel Brand",
    category: "Meta Ads Experts",
    description: "We are an apparel brand launching our dynamic Summer collection. We are looking for a rigorous Meta Ads expert who has proven experience scaling Indian fashion/D2C stores from a 1.5x ROAS to 3x+. Custom tracking, instant experience setups, and creative-led testing frameworks are a MUST. Experience with catalog sales and Advantage+ shopping campaigns is highly valued. Project has strong potential to become a monthly retainer contract.",
    requiredSkills: ["Meta Ads Experts", "Performance Marketer", "Analytics Experts"],
    budgetMin: 35000,
    budgetMax: 70000,
    payType: "monthly",
    hoursPerDay: 4,
    daysPerWeek: 5,
    experienceLevel: "expert",
    locationType: "remote",
    duration: "3 Months",
    active: true,
    postedAt: "2026-06-08T11:00:00Z"
  },
  {
    id: "job-2",
    employerId: "emp-zepto",
    employerName: "Varun Malhotra",
    companyName: "Bold Wear D2C",
    title: "Dynamic short-form Video Editor for Instagram Reels",
    category: "Video Editors",
    description: "Looking for an energetic, creative visual storyteller to edit 15 reels per month for our fashion ecommerce handles. You will work with raw files supplied by our content team and add responsive animations, sound highlights, visual fast cuts, and text styles in trend with Indian lifestyle creators. Must understand mobile safe-zones and high-CTR thumbnail hooks.",
    requiredSkills: ["Video Editors", "Graphic Designers", "Social Media Managers"],
    budgetMin: 15000,
    budgetMax: 25000,
    payType: "monthly",
    hoursPerDay: 2,
    daysPerWeek: 3,
    experienceLevel: "intermediate",
    locationType: "remote",
    duration: "Ongoing",
    active: true,
    postedAt: "2026-06-10T12:00:00Z"
  },
  {
    id: "job-3",
    employerId: "emp-agency",
    employerName: "Sanjana Mehta",
    companyName: "Pixel Spark Agency",
    title: "SaaS SEO Lead - Complete Keyword Overhaul & Technical Audit",
    category: "SEO Specialists",
    description: "We handle marketing operations for an international HR CRM expansion into Mumbai and Bangalore. We require an advanced technical and content SEO champion to audit the legacy directory structures, correct schema errors, index dynamic links, and perform complete competitor keyword mapping. You will deliver a solid, execution-ready blueprint for our content writers.",
    requiredSkills: ["SEO Specialists", "Analytics Experts", "Wordpress Developers"],
    budgetMin: 45000,
    budgetMax: 90000,
    payType: "monthly",
    hoursPerDay: 5,
    daysPerWeek: 5,
    experienceLevel: "expert",
    locationType: "hybrid",
    duration: "2 Months",
    active: true,
    postedAt: "2026-06-11T09:00:00Z"
  },
  {
    id: "job-4",
    employerId: "emp-agency",
    employerName: "Sanjana Mehta",
    companyName: "Pixel Spark Agency",
    title: "Content Writer for Healthcare & Wellness Blog (English)",
    category: "Content Writers",
    description: "Need a skilled and empathetic content writer to produce 8 highly researched, SEO-optimized articles (1,500 words each) on holistic physical therapy and Indian Ayurveda trends. Must be plag-free, highly engaging, and clear from any dry AI-filler structure. Detailed content briefs and target keyphrases will be provided.",
    requiredSkills: ["Content Writers", "SEO Specialists"],
    budgetMin: 12000,
    budgetMax: 20000,
    payType: "monthly",
    hoursPerDay: 2,
    daysPerWeek: 4,
    experienceLevel: "intermediate",
    locationType: "remote",
    duration: "1 Month",
    active: true,
    postedAt: "2026-06-12T01:30:00Z"
  }
];

const seedConnections: Connection[] = [
  {
    id: "c-1",
    freelancerId: "fl-ankit",
    employerId: "emp-zepto",
    jobId: "job-1",
    connectedAt: "2026-06-09T14:00:00Z",
    initiatedBy: "freelancer"
  },
  {
    id: "c-2",
    freelancerId: "fl-riya",
    employerId: "emp-agency",
    jobId: "job-3",
    connectedAt: "2026-06-11T17:00:00Z",
    initiatedBy: "employer"
  }
];

const seedMessages: Message[] = [
  {
    id: "m-1",
    connectionId: "c-1",
    senderId: "fl-ankit",
    text: "Hi Varun! I applied for your Bold Wear Meta Ads position. I scaled a similar apparel D2C brand in Pune from 110 orders a day to 430 with 3.4x average ROAS.",
    sentAt: "2026-06-09T14:05:00Z",
    read: true
  },
  {
    id: "m-2",
    connectionId: "c-1",
    senderId: "emp-zepto",
    text: "Hey Ankit, thanks for connecting! Intrigued by your ROAS numbers. Creative Fatigue is our biggest blocker right now. How do you structure your testing arrays?",
    sentAt: "2026-06-09T14:20:00Z",
    read: true
  },
  {
    id: "m-3",
    connectionId: "c-1",
    senderId: "fl-ankit",
    text: "Awesome question, Varun. I decouple our product-benefit angles and run them in static Advantage Adsets alongside dynamic catalogs. Let me upload our recent testing breakdown!",
    sentAt: "2026-06-09T14:35:00Z",
    read: true
  },
  {
    id: "m-4",
    connectionId: "c-1",
    senderId: "fl-ankit",
    text: "Here is the PDF case study file.",
    fileName: "D2C_Apparel_Scale_Framework_Ankit.pdf",
    fileUrl: "#",
    fileType: "application/pdf",
    sentAt: "2026-06-09T14:36:00Z",
    read: true
  },
  {
    id: "m-5",
    connectionId: "c-2",
    senderId: "emp-agency",
    text: "Hi Riya, I reviewed your SaaS SEO organic stats on LinkedIn and would love to talk about our Technical SEO Audit lead role. Can we connect?",
    sentAt: "2026-06-11T17:02:00Z",
    read: true
  },
  {
    id: "m-6",
    connectionId: "c-2",
    senderId: "fl-riya",
    text: "Hello Sanjana, absolute pleasure to connect! I would love to look into your CRM product targets and help rank it for high-converting query structures.",
    sentAt: "2026-06-11T17:15:00Z",
    read: true
  }
];

const seedProposals: Proposal[] = [
  {
    id: "prop-1",
    jobId: "job-1",
    jobTitle: "Meta Ads Performance Marketer to Scale Apparel Brand",
    freelancerId: "fl-ankit",
    freelancerName: "Ankit Sharma",
    freelancerHeadline: "Performance Marketer & Meta Ads Expert | 3.5x average ROAS",
    coverLetter: "I'd love to help you scale Bold Wear. Having managed high volumes in the lifestyle niche in India, I know how to design clean retargeting pipelines and counter creative fatigue using dynamic overlays. Let's build a durable system.",
    bidAmount: 50000,
    status: "accepted",
    submittedAt: "2026-06-09T11:45:00Z"
  },
  {
    id: "prop-2",
    jobId: "job-1",
    jobTitle: "Meta Ads Performance Marketer to Scale Apparel Brand",
    freelancerId: "fl-rohan",
    freelancerName: "Rohan Das",
    freelancerHeadline: "Professional Video Editor & YouTube Growth Manager",
    coverLetter: "While I am mainly a video specialist, I design high-retaining digital marketing video hooks specifically for Meta Advantage campaigns that secure extremely high click-through ratios. Happy to pitch to you!",
    bidAmount: 38000,
    status: "pending",
    submittedAt: "2026-06-11T15:20:00Z"
  }
];

const seedReviews: UserReview[] = [
  {
    id: "rev-1",
    reviewerId: "emp-zepto",
    reviewerName: "Varun Malhotra",
    reviewerCompany: "Bold Wear D2C",
    freelancerId: "fl-ankit",
    jobId: "job-1",
    jobTitle: "Meta Ads Performance Marketer to Scale Apparel Brand",
    ratingCommunication: 5,
    ratingQuality: 5,
    ratingTimeliness: 4,
    averageRating: 4.67,
    feedback: "Ankit is exceptionally logical. He laid out our conversion funnels perfectly on Meta Ads. Our CPA dropped by almost 30% inside the first month itself! Will definitely continue working with him.",
    createdAt: "2026-06-10T11:00:00Z"
  }
];

const seedPayments: PaymentLog[] = [
  {
    id: "pay-1",
    userId: "emp-zepto",
    planName: "Starter Pack",
    amount: 999,
    paymentId: "pay_RzpSim941824",
    status: "success",
    date: "2026-05-12T11:30:00Z"
  },
  {
    id: "pay-2",
    userId: "fl-ankit",
    planName: "Growth Pack",
    amount: 2499,
    paymentId: "pay_RzpSim472819",
    status: "success",
    date: "2026-05-16T15:20:00Z"
  }
];

const seedNotifications: UserNotification[] = [
  {
    id: "n-1",
    userId: "fl-ankit",
    title: "Connection Request Accepted",
    message: "Bold Wear D2C has accepted your connection request for the 'Meta Ads Performance Marketer' position. Chat is now unlocked!",
    type: "connection",
    read: true,
    createdAt: "2026-06-09T14:00:00Z"
  },
  {
    id: "n-2",
    userId: "emp-zepto",
    title: "New Job Proposal",
    message: "Rohan Das submitted a new bid for your job 'Meta Ads Performance Marketer to Scale Apparel Brand'.",
    type: "job",
    read: false,
    createdAt: "2026-06-11T15:20:00Z"
  },
  {
    id: "n-3",
    userId: "fl-riya",
    title: "Incoming Connection Offer",
    message: "Sanjana Mehta from Pixel Spark Agency connected with you! Go check out your direct messages.",
    type: "connection",
    read: false,
    createdAt: "2026-06-11T17:00:00Z"
  }
];

// Initialize and Read/Write database
export function loadDatabase(): DatabaseSchema {
  try {
    if (!fs.existsSync(DB_FILE)) {
      console.log('Database file does not exist, creating with realistic seed data values...');
      saveDatabase({
        users: seedUsers.map(u => u.user),
        passwords: seedUsers.reduce((acc, current) => {
          acc[current.user.id] = current.secret;
          return acc;
        }, {} as Record<string, string>),
        jobs: seedJobs,
        proposals: seedProposals,
        connections: seedConnections,
        messages: seedMessages,
        reviews: seedReviews,
        payments: seedPayments,
        reports: [],
        notifications: seedNotifications
      });
    }
    const data = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading DB_FILE, resetting to initialSchema:', err);
    return initialSchema;
  }
}

export function saveDatabase(data: DatabaseSchema): void {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing DB_FILE:', err);
  }
}
