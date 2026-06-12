/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express, { Request, Response } from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { loadDatabase, saveDatabase } from "./server/db.js";
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
} from "./src/types.js";

// Basic Token Generator/Parser for robust authentication without complex bcrypt dependencies in container
function generateAuthToken(userId: string, role: string): string {
  const expiry = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 days
  const tokenPayload = { userId, role, expiry };
  return Buffer.from(JSON.stringify(tokenPayload)).toString("base64");
}

function parseAuthToken(token: string): { userId: string; role: string } | null {
  try {
    const decoded = JSON.parse(Buffer.from(token, "base64").toString("utf-8"));
    if (decoded.expiry < Date.now()) return null;
    return { userId: decoded.userId, role: decoded.role };
  } catch (err) {
    return null;
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Middleware to authenticate Bearer tokens
  const authenticateUser = (req: Request & { user?: { userId: string; role: string } }, res: Response, next: any) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(411).json({ message: "Authentication token missing" });
    }
    const token = authHeader.split(" ")[1];
    const decoded = parseAuthToken(token);
    if (!decoded) {
      return res.status(401).json({ message: "Invalid or expired session token" });
    }
    req.user = decoded;
    next();
  };

  // --- API ROUTES ---

  // Auth: Register
  app.post("/api/auth/register", (req: Request, res: Response) => {
    const { email, password, role, name, mobile, city, state, companyName, industry, companyWebsite, headline, primarySkill, yearsOfExperience, linkedin, portfolioUrl } = req.body;

    if (!email || !password || !role || !name || !mobile || !city || !state) {
      return res.status(400).json({ message: "Required registration fields are missing." });
    }

    const db = loadDatabase();
    const existing = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      return res.status(400).json({ message: "Email is already registered. Please sign in." });
    }

    const userId = "user-" + Math.random().toString(36).substr(2, 9);
    
    const newUser: UserProfile = {
      id: userId,
      name,
      email: email.toLowerCase(),
      role: role as any,
      mobile,
      city,
      state,
      connects: 100, // 100 FREE connects on signup!
      isEmailVerified: false,
      isMobileVerified: false,
      registeredAt: new Date().toISOString(),
      savedJobs: [],
      savedFreelancers: []
    };

    if (role === "employer") {
      newUser.companyName = companyName || "Independent Business Owner";
      newUser.industry = industry || "Other";
      newUser.companyWebsite = companyWebsite || "";
    } else if (role === "freelancer") {
      newUser.headline = headline || "Digital Marketing Consultant";
      newUser.primarySkill = primarySkill || "Performance Marketer";
      newUser.yearsOfExperience = Number(yearsOfExperience) || 1;
      newUser.linkedin = linkedin || "";
      newUser.portfolioUrl = portfolioUrl || "";
      newUser.skills = [primarySkill].filter(Boolean);
      newUser.certifications = [];
      newUser.portfolioItems = [];
      newUser.averageRating = 0;
      newUser.completedJobsCount = 0;
    }

    db.users.push(newUser);
    db.passwords[userId] = password; // store simple text password
    saveDatabase(db);

    const token = generateAuthToken(userId, role);
    res.status(201).json({ token, user: newUser });
  });

  // Auth: Login
  app.post("/api/auth/login", (req: Request, res: Response) => {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }

    const db = loadDatabase();
    const user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      return res.status(422).json({ message: "Invalid email or password." });
    }

    const storedPass = db.passwords[user.id];
    if (storedPass !== password) {
      return res.status(422).json({ message: "Invalid email or password." });
    }

    const token = generateAuthToken(user.id, user.role);
    res.json({ token, user });
  });

  // Google Sign-In Simulator
  app.post("/api/auth/google", (req: Request, res: Response) => {
    const { email, name, role } = req.body;
    if (!email || !name) {
      return res.status(400).json({ message: "Authentication payload invalid." });
    }

    const db = loadDatabase();
    let user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    
    // If user is brand new, sign up on the fly in appropriate role
    if (!user) {
      const selectedRole = role || 'freelancer';
      const userId = "google-" + Math.random().toString(36).substr(2, 9);
      user = {
        id: userId,
        name,
        email: email.toLowerCase(),
        role: selectedRole,
        mobile: "+91 99999 55555",
        city: "Mumbai",
        state: "Maharashtra",
        connects: 100, // 100 Free Connect Credits
        isEmailVerified: true,
        isMobileVerified: false,
        registeredAt: new Date().toISOString(),
        savedJobs: [],
        savedFreelancers: []
      };

      if (selectedRole === "employer") {
        user.companyName = "My Google Enterprise";
        user.industry = "Startups";
      } else {
        user.headline = "Freelance Digital Marketer";
        user.primarySkill = "Meta Ads Experts";
        user.yearsOfExperience = 2;
        user.skills = ["Meta Ads Experts"];
        user.portfolioItems = [];
        user.certifications = [];
        user.averageRating = 0;
        user.completedJobsCount = 0;
      }

      db.users.push(user);
      db.passwords[userId] = "google-sso-bypass";
      saveDatabase(db);
    }

    const token = generateAuthToken(user.id, user.role);
    res.json({ token, user });
  });

  // Auth: Get Current Profile
  app.get("/api/auth/me", authenticateUser, (req: any, res: Response) => {
    const db = loadDatabase();
    const user = db.users.find(u => u.id === req.user.userId);
    if (!user) {
      return res.status(404).json({ message: "User session not found." });
    }
    res.json(user);
  });

  // Profile: Update Details
  app.put("/api/profile/update", authenticateUser, (req: any, res: Response) => {
    const db = loadDatabase();
    const userIndex = db.users.findIndex(u => u.id === req.user.userId);
    if (userIndex === -1) {
      return res.status(404).json({ message: "User not found." });
    }

    const currentUser = db.users[userIndex];
    const updateData = req.body;

    // Merge allowed portfolio, skills, etc.
    const updatedUser = {
      ...currentUser,
      ...updateData,
      // Protect sensitive fields to secure accounts
      id: currentUser.id,
      email: currentUser.email,
      role: currentUser.role,
      connects: currentUser.connects,
      registeredAt: currentUser.registeredAt
    };

    db.users[userIndex] = updatedUser;
    saveDatabase(db);
    res.json(updatedUser);
  });

  // Profile Toggle Save Freelancer for clients
  app.post("/api/profile/save-freelancer", authenticateUser, (req: any, res: Response) => {
    const { freelancerId } = req.body;
    if (!freelancerId) return res.status(400).json({ message: "Freelancer ID is required." });

    const db = loadDatabase();
    const client = db.users.find(u => u.id === req.user.userId);
    if (!client) return res.status(404).json({ message: "Client not found." });

    if (!client.savedFreelancers) client.savedFreelancers = [];
    const idx = client.savedFreelancers.indexOf(freelancerId);
    if (idx > -1) {
      client.savedFreelancers.splice(idx, 1); // remove
    } else {
      client.savedFreelancers.push(freelancerId); // add
    }
    saveDatabase(db);
    res.json({ savedFreelancers: client.savedFreelancers });
  });

  // Profile Toggle Save Job for freelancers
  app.post("/api/jobs/save-job", authenticateUser, (req: any, res: Response) => {
    const { jobId } = req.body;
    if (!jobId) return res.status(400).json({ message: "Job ID is required." });

    const db = loadDatabase();
    const freelancer = db.users.find(u => u.id === req.user.userId);
    if (!freelancer) return res.status(404).json({ message: "Freelancer not found." });

    if (!freelancer.savedJobs) freelancer.savedJobs = [];
    const idx = freelancer.savedJobs.indexOf(jobId);
    if (idx > -1) {
      freelancer.savedJobs.splice(idx, 1);
    } else {
      freelancer.savedJobs.push(jobId);
    }
    saveDatabase(db);
    res.json({ savedJobs: freelancer.savedJobs });
  });

  // Browse Directory of Freelancers for clients
  app.get("/api/freelancers", (req: Request, res: Response) => {
    const { skill, experience, location, query } = req.query;
    const db = loadDatabase();
    
    let freelancers = db.users.filter(u => u.role === "freelancer");

    if (skill) {
      const skillStr = String(skill).toLowerCase();
      freelancers = freelancers.filter(u => 
        u.primarySkill?.toLowerCase() === skillStr || 
        u.skills?.some(s => s.toLowerCase().includes(skillStr))
      );
    }
    if (experience) {
      const expNum = Number(experience);
      freelancers = freelancers.filter(u => (u.yearsOfExperience || 0) >= expNum);
    }
    if (location) {
      const locStr = String(location).toLowerCase();
      freelancers = freelancers.filter(u => 
        u.city.toLowerCase().includes(locStr) || 
        u.state.toLowerCase().includes(locStr)
      );
    }
    if (query) {
      const q = String(query).toLowerCase();
      freelancers = freelancers.filter(u => 
        u.name.toLowerCase().includes(q) || 
        u.headline?.toLowerCase().includes(q) || 
        u.bio?.toLowerCase().includes(q) || 
        u.skills?.some(s => s.toLowerCase().includes(q))
      );
    }

    // Hide private info (email, mobile) before sending to untracked browsers 
    // until connection is bought for 5 credits
    const sanitized = freelancers.map(f => ({
      ...f,
      mobile: "[Hidden - Unlock Connect to View]",
      email: "[Hidden - Unlock Connect to View]",
      linkedin: f.linkedin ? "#" : undefined // obscured preview
    }));

    res.json(sanitized);
  });

  // Get single freelancer Profile
  app.get("/api/freelancers/:id", (req: Request, res: Response) => {
    const db = loadDatabase();
    const freelancer = db.users.find(u => u.id === req.params.id && u.role === "freelancer");
    if (!freelancer) {
      return res.status(404).json({ message: "Freelancer profile not found." });
    }

    // Return sanitized profile with reviewer details if reviews exist
    const freelancerReviews = db.reviews.filter(r => r.freelancerId === freelancer.id);

    // Sanitize contact info
    res.json({
      profile: {
        ...freelancer,
        mobile: "[Hidden - Unlock Connect to View]",
        email: "[Hidden - Unlock Connect to View]",
      },
      reviews: freelancerReviews
    });
  });

  // Browse Directory of Jobs
  app.get("/api/jobs", (req: Request, res: Response) => {
    const { skill, budgetMin, budgetMax, experience, locationType, query } = req.query;
    const db = loadDatabase();

    let matched = db.jobs.filter(j => j.active);

    if (skill) {
      const s = String(skill).toLowerCase();
      matched = matched.filter(j => 
        j.category.toLowerCase() === s || 
        j.requiredSkills.some(skillName => skillName.toLowerCase().includes(s))
      );
    }
    if (budgetMin) {
      matched = matched.filter(j => j.budgetMax >= Number(budgetMin));
    }
    if (budgetMax) {
      matched = matched.filter(j => j.budgetMin <= Number(budgetMax));
    }
    if (experience) {
      const expLevel = String(experience).toLowerCase();
      matched = matched.filter(j => j.experienceLevel === expLevel);
    }
    if (locationType) {
      const loc = String(locationType).toLowerCase();
      matched = matched.filter(j => j.locationType === loc);
    }
    if (query) {
      const q = String(query).toLowerCase();
      matched = matched.filter(j => 
        j.title.toLowerCase().includes(q) || 
        j.description.toLowerCase().includes(q) || 
        j.companyName?.toLowerCase().includes(q) || 
        j.requiredSkills.some(s => s.toLowerCase().includes(q))
      );
    }

    res.json(matched);
  });

  // Job Details
  app.get("/api/jobs/:id", (req: Request, res: Response) => {
    const db = loadDatabase();
    const job = db.jobs.find(j => j.id === req.params.id);
    if (!job) {
      return res.status(404).json({ message: "Job not found." });
    }

    // Include details of the poster (but sanitize contact info)
    const emp = db.users.find(u => u.id === job.employerId);
    res.json({
      ...job,
      employer: emp ? {
        id: emp.id,
        name: emp.name,
        companyName: emp.companyName || "Private Client",
        industry: emp.industry || "N/A",
        companyWebsite: emp.companyWebsite || ""
      } : null
    });
  });

  // Employer posts a new job
  app.post("/api/jobs/post", authenticateUser, (req: any, res: Response) => {
    if (req.user.role !== "employer" && req.user.role !== "admin") {
      return res.status(403).json({ message: "Only employers can list jobs." });
    }

    const { title, category, description, requiredSkills, budgetMin, budgetMax, payType, hoursPerDay, daysPerWeek, experienceLevel, locationType, duration } = req.body;

    if (!title || !category || !description || !requiredSkills || !budgetMin || !budgetMax) {
      return res.status(400).json({ message: "Missing required job outline fields." });
    }

    const db = loadDatabase();
    const employerProfile = db.users.find(u => u.id === req.user.userId);
    if (!employerProfile) {
      return res.status(404).json({ message: "Employer profile not found." });
    }

    const jobId = "job-" + Math.random().toString(36).substr(2, 9);
    const newJob: Job = {
      id: jobId,
      employerId: employerProfile.id,
      employerName: employerProfile.name,
      companyName: employerProfile.companyName || "Independent Business",
      title,
      category,
      description,
      requiredSkills: Array.isArray(requiredSkills) ? requiredSkills : [requiredSkills],
      budgetMin: Number(budgetMin),
      budgetMax: Number(budgetMax),
      payType: payType || 'monthly',
      hoursPerDay: Number(hoursPerDay) || 4,
      daysPerWeek: Number(daysPerWeek) || 5,
      experienceLevel: experienceLevel || 'intermediate',
      locationType: locationType || 'remote',
      duration: duration || '1 Month',
      active: true,
      postedAt: new Date().toISOString()
    };

    db.jobs.push(newJob);

    // Create system notification
    const adminNotification: UserNotification = {
      id: "notif-" + Math.random().toString(36).substr(2, 9),
      userId: employerProfile.id,
      title: "Job Listed Successfully",
      message: `Your job listing '${title}' is now live and browseable!`,
      type: "job",
      read: false,
      createdAt: new Date().toISOString()
    };
    db.notifications.push(adminNotification);

    saveDatabase(db);
    res.status(201).json(newJob);
  });

  // Job Proposals: Freelancer applies
  app.post("/api/proposals/apply", authenticateUser, (req: any, res: Response) => {
    if (req.user.role !== "freelancer") {
      return res.status(403).json({ message: "Only freelancers can submit proposals." });
    }

    const { jobId, coverLetter, bidAmount } = req.body;
    if (!jobId || !coverLetter || !bidAmount) {
      return res.status(400).json({ message: "Campaign application fields are required." });
    }

    const db = loadDatabase();
    const job = db.jobs.find(j => j.id === jobId);
    if (!job) return res.status(404).json({ message: "Job campaign not found." });

    const freelancer = db.users.find(u => u.id === req.user.userId);
    if (!freelancer) return res.status(404).json({ message: "Freelancer not found." });

    // Check if already applied
    const alreadyApplied = db.proposals.some(p => p.jobId === jobId && p.freelancerId === freelancer.id);
    if (alreadyApplied) {
      return res.status(422).json({ message: "You have already applied for this campaign." });
    }

    const proposalId = "prop-" + Math.random().toString(36).substr(2, 9);
    const newProposal: Proposal = {
      id: proposalId,
      jobId,
      jobTitle: job.title,
      freelancerId: freelancer.id,
      freelancerName: freelancer.name,
      freelancerHeadline: freelancer.headline,
      coverLetter,
      bidAmount: Number(bidAmount),
      status: 'pending',
      submittedAt: new Date().toISOString()
    };

    db.proposals.push(newProposal);

    // Send notification to Client
    const employerNotification: UserNotification = {
      id: "notif-" + Math.random().toString(36).substr(2, 9),
      userId: job.employerId,
      title: "New Job Proposal",
      message: `${freelancer.name} has submitted a bid of ₹${Number(bidAmount).toLocaleString()} for your listing '${job.title}'.`,
      type: "job",
      read: false,
      createdAt: new Date().toISOString()
    };
    db.notifications.push(employerNotification);

    saveDatabase(db);
    res.status(201).json(newProposal);
  });

  // Get proposals for employer jobs or freelancer bids
  app.get("/api/proposals", authenticateUser, (req: any, res: Response) => {
    const db = loadDatabase();
    if (req.user.role === "freelancer") {
      const freelancerProposals = db.proposals.filter(p => p.freelancerId === req.user.userId);
      res.json(freelancerProposals);
    } else {
      // Employer: get proposals on all their posted jobs
      const employerJobs = db.jobs.filter(j => j.employerId === req.user.userId).map(j => j.id);
      const filtered = db.proposals.filter(p => employerJobs.includes(p.jobId));
      res.json(filtered);
    }
  });

  // Connect Credit System: Connect With Freelancer or Employer of Job
  // Connect Action rules: spending 5 connect credits to initiate dialog channel
  app.post("/api/connections/connect", authenticateUser, (req: any, res: Response) => {
    const { targetUserId, jobId } = req.body;
    if (!targetUserId) {
      return res.status(400).json({ message: "Target user ID is required to connect." });
    }

    const db = loadDatabase();
    const currentUserId = req.user.userId;

    if (currentUserId === targetUserId) {
      return res.status(400).json({ message: "You cannot spend connect credits on yourself!" });
    }

    const initiator = db.users.find(u => u.id === currentUserId);
    const receiver = db.users.find(u => u.id === targetUserId);

    if (!initiator || !receiver) {
      return res.status(404).json({ message: "One of the participant accounts does not exist." });
    }

    // Check if already connected
    const existingConnection = db.connections.find(c => 
      (c.freelancerId === currentUserId && c.employerId === targetUserId) ||
      (c.freelancerId === targetUserId && c.employerId === currentUserId)
    );

    if (existingConnection) {
      return res.json({ 
        message: "You are already connected!", 
        connection: existingConnection 
      });
    }

    // Verify connects
    if (initiator.connects < 5) {
      return res.status(403).json({ 
        message: "Insufficient Connect Credits! You need 5 connects to start this dialog.",
        needsCredits: true
      });
    }

    // Charge 5 connect credits
    initiator.connects -= 5;

    // Create Connection Record
    const connId = "c-" + Math.random().toString(36).substr(2, 9);
    
    // Assign fields based on who is who
    const freelancerId = initiator.role === "freelancer" ? initiator.id : receiver.id;
    const employerId = initiator.role === "employer" ? initiator.id : receiver.id;

    const newConnection: Connection = {
      id: connId,
      freelancerId,
      employerId,
      jobId,
      connectedAt: new Date().toISOString(),
      initiatedBy: initiator.role as any
    };

    db.connections.push(newConnection);

    // Seed automatic first welcome chat message
    const welcomeMsg: Message = {
      id: "m-" + Math.random().toString(36).substr(2, 9),
      connectionId: connId,
      senderId: initiator.id,
      text: initiator.role === "freelancer" 
        ? "Hello! I am excited to connect regarding your marketing listings and discuss potential alignment. Let me know when you'd like to talk." 
        : `Hello! I observed your profile on the Freelance India market and would love to discuss a digital marketing campaign.`,
      sentAt: new Date().toISOString(),
      read: false
    };
    db.messages.push(welcomeMsg);

    // Send notifications to both
    const notifA: UserNotification = {
      id: "notif-" + Math.random().toString(36).substr(2, 9),
      userId: initiator.id,
      title: "Connection Unlocked! (-5 Credits)",
      message: `You connected with ${receiver.name}. 5 connects have been used. Chat is now live.`,
      type: "credits",
      read: false,
      createdAt: new Date().toISOString()
    };
    const notifB: UserNotification = {
      id: "notif-" + Math.random().toString(36).substr(2, 9),
      userId: receiver.id,
      title: `New Connection from ${initiator.name}`,
      message: `${initiator.name} has spent connects to unlock secure chat with you!`,
      type: "connection",
      read: false,
      createdAt: new Date().toISOString()
    };

    db.notifications.push(notifA, notifB);
    saveDatabase(db);

    res.status(201).json({
      message: "Connection successfully registered! Chat unlocked.",
      connection: newConnection,
      remainingConnects: initiator.connects
    });
  });

  // Get Active Connections List for current logged-in user
  app.get("/api/connections", authenticateUser, (req: any, res: Response) => {
    const db = loadDatabase();
    const userId = req.user.userId;

    const userConnections = db.connections.filter(c => 
      c.freelancerId === userId || c.employerId === userId
    );

    // Map other user accounts to make frontend render simple
    const hydrated = userConnections.map(c => {
      const otherId = c.freelancerId === userId ? c.employerId : c.freelancerId;
      const otherUser = db.users.find(u => u.id === otherId);
      
      // Get last message in conversation
      const conversationMsgs = db.messages.filter(m => m.connectionId === c.id);
      const lastMsg = conversationMsgs.length > 0
        ? conversationMsgs[conversationMsgs.length - 1]
        : null;

      return {
        id: c.id,
        connectedAt: c.connectedAt,
        initiatedBy: c.initiatedBy,
        otherUser: otherUser ? {
          id: otherUser.id,
          name: otherUser.name,
          role: otherUser.role,
          primarySkill: otherUser.primarySkill || null,
          headline: otherUser.headline || null,
          companyName: otherUser.companyName || null,
          mobile: otherUser.mobile, // Connection enables real contact info viewing!
          email: otherUser.email,
          linkedin: otherUser.linkedin,
          city: otherUser.city,
          state: otherUser.state,
        } : null,
        lastMessage: lastMsg
      };
    });

    res.json(hydrated);
  });

  // Chat: Get Communication logs
  app.get("/api/messages/:connectionId", authenticateUser, (req: any, res: Response) => {
    const db = loadDatabase();
    
    // Authorization check: Make sure user is a member of this active connection
    const connection = db.connections.find(c => c.id === req.params.connectionId);
    if (!connection) return res.status(404).json({ message: "Connection path not found." });
    
    if (connection.freelancerId !== req.user.userId && connection.employerId !== req.user.userId) {
      return res.status(403).json({ message: "Access forbidden. Inactive connection credentials." });
    }

    const conversation = db.messages.filter(m => m.connectionId === req.params.connectionId);

    // Mark other person's messages as read
    let altered = false;
    conversation.forEach(m => {
      if (m.senderId !== req.user.userId && !m.read) {
        m.read = true;
        altered = true;
      }
    });

    if (altered) {
      saveDatabase(db);
    }

    res.json(conversation);
  });

  // Chat: Send short messaging
  app.post("/api/messages/:connectionId/send", authenticateUser, (req: any, res: Response) => {
    const { text, fileUrl, fileName, fileType } = req.body;
    if (!text && !fileUrl) {
      return res.status(400).json({ message: "Empty messages are discarded." });
    }

    const db = loadDatabase();
    const conn = db.connections.find(c => c.id === req.params.connectionId);
    if (!conn) return res.status(404).json({ message: "Connection channel not found." });

    if (conn.freelancerId !== req.user.userId && conn.employerId !== req.user.userId) {
      return res.status(403).json({ message: "Unauthorized communication bridge." });
    }

    const newMsg: Message = {
      id: "m-" + Math.random().toString(36).substr(2, 9),
      connectionId: conn.id,
      senderId: req.user.userId,
      text: text || "",
      fileUrl,
      fileName,
      fileType,
      sentAt: new Date().toISOString(),
      read: false
    };

    db.messages.push(newMsg);

    // Push tiny alert notification to receiver
    const receiverId = conn.freelancerId === req.user.userId ? conn.employerId : conn.freelancerId;
    const sender = db.users.find(u => u.id === req.user.userId);
    
    const chatAlertNotif: UserNotification = {
      id: "notif-" + Math.random().toString(36).substr(2, 9),
      userId: receiverId,
      title: `New Message from ${sender?.name}`,
      message: text ? (text.length > 50 ? text.substring(0, 47) + "..." : text) : "Shared a file attachments",
      type: "message",
      read: false,
      createdAt: new Date().toISOString()
    };
    db.notifications.push(chatAlertNotif);

    saveDatabase(db);
    res.status(201).json(newMsg);
  });

  // Razorpay Credit Purchase Simulator
  app.post("/api/payments/pay", authenticateUser, (req: any, res: Response) => {
    const { packName, connectsAdded, amountPaid, paymentId } = req.body;
    const planName = packName || req.body.planName;
    const amount = amountPaid || req.body.amount;

    if (!planName || !amount) {
      return res.status(400).json({ message: "Selected bundle features are missing." });
    }

    const db = loadDatabase();
    const user = db.users.find(u => u.id === req.user.userId);
    if (!user) return res.status(404).json({ message: "User profile not found." });

    let creditsToAward = Number(connectsAdded) || 0;
    if (creditsToAward === 0) {
      if (planName.toLowerCase().includes("starter")) creditsToAward = 100;
      else if (planName.toLowerCase().includes("growth")) creditsToAward = 300;
      else if (planName.toLowerCase().includes("pro")) creditsToAward = 1000;
    }

    if (creditsToAward === 0) {
      return res.status(400).json({ message: "Invalid credit plans selection." });
    }

    // Award Credits
    user.connects += creditsToAward;

    // Log simulated transaction
    const logId = "pay-" + Math.random().toString(36).substr(2, 9);
    const newTx: PaymentLog = {
      id: logId,
      userId: user.id,
      planName,
      amount: Number(amount),
      paymentId: paymentId || `pay_RzpSim${Math.floor(Math.random() * 1000000)}`,
      status: "success",
      date: new Date().toISOString()
    };

    db.payments.push(newTx);

    // Send notifications
    const receiptNotif: UserNotification = {
      id: "notif-" + Math.random().toString(36).substr(2, 9),
      userId: user.id,
      title: "Invoice Settlement Successful",
      message: `Your payment of ₹${Number(amount).toLocaleString()} was settled via Razorpay simulator! Added ${creditsToAward} connect credits.`,
      type: "credits",
      read: false,
      createdAt: new Date().toISOString()
    };
    db.notifications.push(receiptNotif);

    saveDatabase(db);
    res.json({
      message: "Payment successfully captured! Credits unlocked.",
      newConnectsBalance: user.connects,
      receipt: newTx
    });
  });

  app.post("/api/payments/purchase", authenticateUser, (req: any, res: Response) => {
    const { planName, amount, paymentId } = req.body;
    if (!planName || !amount) {
      return res.status(400).json({ message: "Selected bundle features are missing." });
    }

    const db = loadDatabase();
    const user = db.users.find(u => u.id === req.user.userId);
    if (!user) return res.status(404).json({ message: "User profile not found." });

    let creditsToAward = 0;
    if (planName.toLowerCase().includes("starter")) creditsToAward = 100;
    else if (planName.toLowerCase().includes("growth")) creditsToAward = 300;
    else if (planName.toLowerCase().includes("pro")) creditsToAward = 1000;

    if (creditsToAward === 0) {
      return res.status(400).json({ message: "Invalid credit plans selection." });
    }

    // Award Credits
    user.connects += creditsToAward;

    // Log simulated transaction
    const logId = "pay-" + Math.random().toString(36).substr(2, 9);
    const newTx: PaymentLog = {
      id: logId,
      userId: user.id,
      planName,
      amount: Number(amount),
      paymentId: paymentId || `pay_RzpSim${Math.floor(Math.random() * 1000000)}`,
      status: "success",
      date: new Date().toISOString()
    };

    db.payments.push(newTx);

    // Send notifications
    const receiptNotif: UserNotification = {
      id: "notif-" + Math.random().toString(36).substr(2, 9),
      userId: user.id,
      title: "Invoice Settlement Successful",
      message: `Your payment of ₹${Number(amount).toLocaleString()} was settled via Razorpay simulator! Added ${creditsToAward} connect credits.`,
      type: "credits",
      read: false,
      createdAt: new Date().toISOString()
    };
    db.notifications.push(receiptNotif);

    saveDatabase(db);
    res.json({
      message: "Payment successfully captured! Credits unlocked.",
      newConnectsBalance: user.connects,
      receipt: newTx
    });
  });

  // Mobile App Verification Codes
  app.post("/api/verification/verify-phone", authenticateUser, (req: any, res: Response) => {
    const { otpCode } = req.body;
    if (!otpCode || otpCode.length < 4) {
      return res.status(400).json({ message: "Please supply a valid OTP code matrix." });
    }

    const db = loadDatabase();
    const user = db.users.find(u => u.id === req.user.userId);
    if (!user) return res.status(404).json({ message: "User not found." });

    user.isMobileVerified = true;
    saveDatabase(db);
    res.json({ message: "Mobile validation credentials captured. Badge enabled!", user });
  });

  // Email App Verification Simulator 
  app.post("/api/verification/verify-email", authenticateUser, (req: any, res: Response) => {
    const db = loadDatabase();
    const user = db.users.find(u => u.id === req.user.userId);
    if (!user) return res.status(404).json({ message: "User not found." });

    user.isEmailVerified = true;
    saveDatabase(db);
    res.json({ message: "Email successfully validated! Verification Badge enabled.", user });
  });

  // Reviews: After project complete ratings
  app.post("/api/reviews/rate", authenticateUser, (req: any, res: Response) => {
    if (req.user.role !== "employer") {
      return res.status(403).json({ message: "Only employers can leave talent reviews." });
    }

    const { freelancerId, jobId, ratingComm, ratingQual, ratingTime, feedback } = req.body;
    if (!freelancerId || !jobId || !ratingComm || !ratingQual || !ratingTime || !feedback) {
      return res.status(400).json({ message: "All detailed parameters are required." });
    }

    const db = loadDatabase();
    const freelancer = db.users.find(u => u.id === freelancerId && u.role === "freelancer");
    const employer = db.users.find(u => u.id === req.user.userId);

    if (!freelancer || !employer) {
      return res.status(404).json({ message: "Associated profiles are missing." });
    }

    const avg = Number(((ratingComm + ratingQual + ratingTime) / 3).toFixed(2));
    const revId = "rev-" + Math.random().toString(36).substr(2, 9);
    
    // Create Review
    const newRating: UserReview = {
      id: revId,
      reviewerId: employer.id,
      reviewerName: employer.name,
      reviewerCompany: employer.companyName,
      freelancerId,
      jobId,
      jobTitle: db.jobs.find(j => j.id === jobId)?.title || "Freelance Consultation",
      ratingCommunication: Number(ratingComm),
      ratingQuality: Number(ratingQual),
      ratingTimeliness: Number(ratingTime),
      averageRating: avg,
      feedback,
      createdAt: new Date().toISOString()
    };

    db.reviews.push(newRating);

    // Recompute Freelancer Overall Stats
    const freelancerReviews = db.reviews.filter(r => r.freelancerId === freelancer.id);
    const sumRatings = freelancerReviews.reduce((acc, curr) => acc + curr.averageRating, 0);
    freelancer.averageRating = Number((sumRatings / freelancerReviews.length).toFixed(2));
    freelancer.completedJobsCount = (freelancer.completedJobsCount || 0) + 1;

    // Send Notification to Freelancer
    const awardNotification: UserNotification = {
      id: "notif-" + Math.random().toString(36).substr(2, 9),
      userId: freelancerId,
      title: "New Review Received ⭐",
      message: `${employer.name} rated you ${avg}/5 for your contract work!`,
      type: "system",
      read: false,
      createdAt: new Date().toISOString()
    };
    db.notifications.push(awardNotification);

    saveDatabase(db);
    res.status(201).json({ message: "Review posted successfully!", review: newRating });
  });

  // Client logs reports
  app.post("/api/reports/submit", authenticateUser, (req: any, res: Response) => {
    const { targetType, targetId, reason } = req.body;
    if (!targetType || !targetId || !reason) {
      return res.status(400).json({ message: "Incomplete listing flag parameters." });
    }

    const db = loadDatabase();
    const reporter = db.users.find(u => u.id === req.user.userId);
    if (!reporter) return res.status(404).json({ message: "Reporter account missing." });

    let targetName = "Unknown Content";
    if (targetType === "user") {
      targetName = db.users.find(u => u.id === targetId)?.name || "User ID: " + targetId;
    } else {
      targetName = db.jobs.find(j => j.id === targetId)?.title || "Job ID: " + targetId;
    }

    const reportId = "rep-" + Math.random().toString(36).substr(2, 9);
    const newReport: ReportItem = {
      id: reportId,
      reporterId: reporter.id,
      reporterName: reporter.name,
      targetType: targetType as any,
      targetId,
      targetName,
      reason,
      status: "pending",
      createdAt: new Date().toISOString()
    };

    db.reports.push(newReport);
    saveDatabase(db);
    res.status(201).json({ message: "Flag received, moderator review scheduled.", report: newReport });
  });

  // Notifications
  app.get("/api/notifications", authenticateUser, (req: any, res: Response) => {
    const db = loadDatabase();
    const filtered = db.notifications.filter(n => n.userId === req.user.userId);
    res.json(filtered);
  });

  app.post("/api/notifications/:id/read", authenticateUser, (req: any, res: Response) => {
    const db = loadDatabase();
    const notif = db.notifications.find(n => n.id === req.params.id && n.userId === req.user.userId);
    if (notif) {
      notif.read = true;
      saveDatabase(db);
    }
    res.json({ success: true });
  });

  // --- MODERATOR ADMIN CONTROL CHANNELS ---

  // Admin access gatekeeper
  const verifyAdmin = (req: any, res: Response, next: any) => {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Forbidden. Access restricted to System Admins." });
    }
    next();
  };

  // Metrics Dashboard aggregates
  app.get("/api/admin/metrics", authenticateUser, verifyAdmin, (req: any, res: Response) => {
    const db = loadDatabase();
    
    const totalUsers = db.users.length;
    const activeJobs = db.jobs.filter(j => j.active).length;
    const totalConnections = db.connections.length;
    
    // Financial revenue simulated logs
    const revenueInr = db.payments.reduce((acc, curr) => acc + curr.amount, 0);

    // Signups distribution data charts
    const freelancerCount = db.users.filter(u => u.role === "freelancer").length;
    const employerCount = db.users.filter(u => u.role === "employer").length;

    res.json({
      aggregations: {
        totalUsers,
        activeJobs,
        totalConnections,
        revenueInr,
        freelancers: freelancerCount,
        employers: employerCount
      },
      recentReports: db.reports,
      recentPayments: db.payments.slice(-8),
      recentSignups: db.users.slice(-10).map(u => ({ id: u.id, name: u.name, role: u.role, registeredAt: u.registeredAt }))
    });
  });

  // Users modification logs
  app.get("/api/admin/users", authenticateUser, verifyAdmin, (req: any, res: Response) => {
    const db = loadDatabase();
    res.json(db.users.map(u => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      city: u.city,
      connects: u.connects,
      isEmailVerified: u.isEmailVerified,
      isMobileVerified: u.isMobileVerified
    })));
  });

  app.put("/api/admin/users/:id/connects", authenticateUser, verifyAdmin, (req: any, res: Response) => {
    const { amount } = req.body;
    if (amount === undefined) return res.status(400).json({ message: "Please supply direct connects count." });

    const db = loadDatabase();
    const user = db.users.find(u => u.id === req.params.id);
    if (!user) return res.status(404).json({ message: "User not found." });

    user.connects = Number(amount);
    saveDatabase(db);
    res.json({ success: true, user });
  });

  app.delete("/api/admin/users/:id", authenticateUser, verifyAdmin, (req: any, res: Response) => {
    const db = loadDatabase();
    const idx = db.users.findIndex(u => u.id === req.params.id);
    if (idx === -1) return res.status(404).json({ message: "User account missing." });

    db.users.splice(idx, 1);
    saveDatabase(db);
    res.json({ success: true, message: "Account expunged from system directories." });
  });

  // Jobs moderation
  app.get("/api/admin/jobs", authenticateUser, verifyAdmin, (req: any, res: Response) => {
    const db = loadDatabase();
    res.json(db.jobs);
  });

  app.put("/api/admin/jobs/:id/toggle", authenticateUser, verifyAdmin, (req: any, res: Response) => {
    const db = loadDatabase();
    const job = db.jobs.find(j => j.id === req.params.id);
    if (!job) return res.status(404).json({ message: "Job campaign not found." });

    job.active = !job.active;
    saveDatabase(db);
    res.json({ success: true, job });
  });

  // Reports resolutions
  app.put("/api/admin/reports/:id/resolve", authenticateUser, verifyAdmin, (req: any, res: Response) => {
    const db = loadDatabase();
    const rep = db.reports.find(r => r.id === req.params.id);
    if (!rep) return res.status(404).json({ message: "Flag record not found." });

    rep.status = "resolved";
    saveDatabase(db);
    res.json({ success: true, report: rep });
  });


  // --- VITE AND FRONTEND ROUTING HANDLING ---

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Production statics files fallback
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Freelance India engine running on port ${PORT}`);
  });
}

startServer();
