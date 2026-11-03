import 'dotenv/config';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { connectDB, disconnectDB } from '../config/db.js';
import {
  User,
  Organization,
  OrganizationMember,
  Event,
  EventSession,
  FeedbackForm,
  Question,
  FeedbackResponse,
  AIAnalysis,
  Recommendation,
  ImprovementTask,
  Notification,
  AuditLog,
} from '../models/index.js';

const seedDatabase = async () => {
  try {
    await connectDB();
    console.log('[Seed] Connected to database. Purging existing demo collections...');

    await Promise.all([
      User.deleteMany({}),
      Organization.deleteMany({}),
      OrganizationMember.deleteMany({}),
      Event.deleteMany({}),
      EventSession.deleteMany({}),
      FeedbackForm.deleteMany({}),
      Question.deleteMany({}),
      FeedbackResponse.deleteMany({}),
      AIAnalysis.deleteMany({}),
      Recommendation.deleteMany({}),
      ImprovementTask.deleteMany({}),
      Notification.deleteMany({}),
      AuditLog.deleteMany({}),
    ]);

    console.log('[Seed] Creating demo users...');
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('Password123!', salt);

    const adminUser = await User.create({
      name: 'Dr. Rajesh Deshmukh (Admin)',
      email: 'admin@insightloop.io',
      passwordHash,
      role: 'admin',
      phone: '+91 98220 11223',
      preferences: { language: 'en', theme: 'light', emailNotifications: true },
    });

    const hostUser = await User.create({
      name: 'Prof. Ananya Sharma',
      email: 'organizer@mitpune.edu',
      passwordHash,
      role: 'host',
      phone: '+91 98450 44556',
      preferences: { language: 'en', theme: 'light', emailNotifications: true },
    });

    const cohostUser = await User.create({
      name: 'Rohan Joshi',
      email: 'coordinator@mitpune.edu',
      passwordHash,
      role: 'host',
      phone: '+91 97300 77889',
      preferences: { language: 'mr', theme: 'light', emailNotifications: true },
    });

    console.log('[Seed] Creating organizations & memberships...');
    const organization = await Organization.create({
      name: 'MIT Pune Tech & Innovation Council',
      slug: 'mit-pune-tech',
      description: 'Premier collegiate council organizing state and national level hackathons, AI workshops, and technology summits.',
      category: 'college',
      website: 'https://mitpune.edu',
      createdBy: hostUser._id,
      isVerified: true,
    });

    await OrganizationMember.create([
      { organizationId: organization._id, userId: hostUser._id, role: 'owner', status: 'active' },
      { organizationId: organization._id, userId: cohostUser._id, role: 'admin', status: 'active', invitedBy: hostUser._id },
    ]);

    console.log('[Seed] Creating events & sessions...');
    // Event 1: National AI Hackathon
    const event1 = await Event.create({
      organizationId: organization._id,
      title: 'National AI Hackathon & Sprint 2026',
      code: 'HACK-2026',
      category: 'Hackathon',
      description: '36-hour offline hackathon bringing 250+ student developers to build AI solutions for healthcare and agriculture.',
      venueType: 'in-person',
      location: 'Central Computer Center & Auditorium, Pune',
      startDate: new Date(Date.now() - 7 * 24 * 3600 * 1000),
      endDate: new Date(Date.now() - 5 * 24 * 3600 * 1000),
      status: 'completed',
      isFeedbackOpen: true,
      targetResponses: 40,
      tags: ['AI', 'Hackathon', 'Innovation', 'Students'],
      createdBy: hostUser._id,
    });

    // Event 2: Full-Stack React & AI Agents
    const event2 = await Event.create({
      organizationId: organization._id,
      title: 'Hands-on Workshop: Full-Stack React & AI Agents',
      code: 'WORK-2026',
      category: 'Workshop',
      description: 'Interactive deep-dive into building autonomous multi-agent systems and modern frontend architectures.',
      venueType: 'hybrid',
      location: 'Seminar Hall 3 & Virtual Zoom Stream',
      startDate: new Date(Date.now() - 2 * 24 * 3600 * 1000),
      endDate: new Date(Date.now() + 1 * 24 * 3600 * 1000),
      status: 'ongoing',
      isFeedbackOpen: true,
      targetResponses: 30,
      tags: ['React', 'Agents', 'FastAPI', 'Developer'],
      createdBy: hostUser._id,
    });

    // Event 3: Leadership Summit
    const event3 = await Event.create({
      organizationId: organization._id,
      title: 'Annual Leadership & Technology Summit',
      code: 'LEAD-2026',
      category: 'Conference',
      description: 'Keynotes from industry leaders, panel discussions on career pathways, and startup showcases.',
      venueType: 'in-person',
      location: 'Grand Convention Center, Pune',
      startDate: new Date(Date.now() + 10 * 24 * 3600 * 1000),
      endDate: new Date(Date.now() + 11 * 24 * 3600 * 1000),
      status: 'published',
      isFeedbackOpen: true,
      targetResponses: 100,
      tags: ['Leadership', 'Networking', 'Careers'],
      createdBy: hostUser._id,
    });

    // Sessions for Event 1
    const session1 = await EventSession.create({
      eventId: event1._id,
      title: 'Opening Ceremony & Problem Statement Unveiling',
      speakerName: 'Dr. Rajesh Deshmukh',
      startTime: new Date(Date.now() - 7 * 24 * 3600 * 1000),
      endTime: new Date(Date.now() - 7 * 24 * 3600 * 1000 + 2 * 3600 * 1000),
      roomOrLink: 'Main Stage',
    });

    const session2 = await EventSession.create({
      eventId: event1._id,
      title: 'Mentorship Sprint & Mid-Evaluation',
      speakerName: 'Industry Mentors Panel',
      startTime: new Date(Date.now() - 6 * 24 * 3600 * 1000),
      endTime: new Date(Date.now() - 6 * 24 * 3600 * 1000 + 4 * 3600 * 1000),
      roomOrLink: 'Lab 4 & 5',
    });

    console.log('[Seed] Creating dynamic feedback forms & multilingual questions...');
    const form1 = await FeedbackForm.create({
      eventId: event1._id,
      title: 'National AI Hackathon Participant Experience',
      description: 'Your feedback enables us to refine future hackathon logistics, mentorship, and venue facilities.',
      isAnonymousAllowed: true,
      supportedLanguages: ['en', 'hi', 'mr'],
      allowVoiceFeedback: true,
      templateType: 'hackathon',
    });

    const q1 = await Question.create([
      {
        formId: form1._id,
        order: 1,
        type: 'star_rating',
        category: 'overall',
        isRequired: true,
        prompt: {
          en: 'How would you rate your overall experience at the Hackathon?',
          hi: 'हैकथॉन में आपका समग्र अनुभव कैसा रहा?',
          mr: 'हॅकाथॉनमधील आपला एकंदर अनुभव कसा होता?',
        },
        description: { en: '1 to 5 stars', hi: '1 से 5 स्टार', mr: '1 ते 5 स्टार' },
      },
      {
        formId: form1._id,
        order: 2,
        type: 'nps',
        category: 'overall',
        isRequired: true,
        prompt: {
          en: 'How likely are you to recommend our hackathons to other students?',
          hi: 'आप अन्य छात्रों को हमारे हैकथॉन की सिफारिश करने की कितनी संभावना रखते हैं?',
          mr: 'आपण इतर विद्यार्थ्यांना आमच्या हॅकाथॉनची शिफारस करण्याची किती शक्यता आहे?',
        },
        description: { en: '0 (Not likely) to 10 (Extremely likely)', hi: '0 से 10', mr: '0 ते 10' },
      },
      {
        formId: form1._id,
        order: 3,
        type: 'single_choice',
        category: 'venue_logistics',
        isRequired: true,
        prompt: {
          en: 'How was the high-speed WiFi connectivity throughout the 36 hours?',
          hi: '36 घंटों के दौरान वाईफाई कनेक्टिविटी कैसी रही?',
          mr: '36 तासांच्या दरम्यान हाय-स्पीड वायफाय कनेक्टिव्हिटी कशी होती?',
        },
        description: { en: 'Select one', hi: 'एक विकल्प चुनें', mr: 'एक पर्याय निवडा' },
        options: [
          { id: 'opt_stable', label: { en: 'Extremely stable and fast', hi: 'बहुत स्थिर और तेज', mr: 'अतिशय वेगवान व सुरळीत' } },
          { id: 'opt_decent', label: { en: 'Decent with occasional drops', hi: 'ठीक-ठाक, कभी-कभी समस्या', mr: 'मध्यम, क्वचित अडचणी' } },
          { id: 'opt_poor', label: { en: 'Frequent disconnects in Lab 4', hi: 'बार-बार रुकावट', mr: 'वारंवार डिस्कनेक्ट झाले' } },
        ],
      },
      {
        formId: form1._id,
        order: 4,
        type: 'long_text',
        category: 'overall',
        isRequired: false,
        prompt: {
          en: 'What did you appreciate most, and what should we improve for next edition?',
          hi: 'आपको क्या सबसे अच्छा लगा, और हम अगले संस्करण में क्या सुधार कर सकते हैं?',
          mr: 'आपल्याला काय सर्वाधिक आवडले, आणि पुढील वेळी आम्ही काय सुधारणा करावी?',
        },
        description: {
          en: 'Share in English, Hindi, or Marathi (Type or record voice)',
          hi: 'अंग्रेजी, हिंदी या मराठी में साझा करें',
          mr: 'इंग्रजी, हिंदी किंवा मराठीत लिहा किंवा आवाज रेकॉर्ड करा',
        },
      },
    ]);

    console.log('[Seed] Populating realistic multilingual feedback responses...');
    const sampleResponses = [
      {
        isAnonymous: false,
        name: 'Aarav Mehta',
        email: 'aarav.m@college.edu',
        lang: 'en',
        rating: 5,
        nps: 10,
        textOriginal: 'Outstanding mentorship from industry leaders! Problem statements were pragmatic and challenging. Food arrangements during midnight were truly appreciated.',
        textTranslated: 'Outstanding mentorship from industry leaders! Problem statements were pragmatic and challenging. Food arrangements during midnight were truly appreciated.',
        sentiment: 'positive',
        score: 0.85,
      },
      {
        isAnonymous: true,
        name: 'Anonymous Participant',
        email: '',
        lang: 'mr',
        rating: 4,
        nps: 9,
        textOriginal: 'हॅकाथॉनचे आयोजन खूप छान होते. मेंटर्सने खूप मदत केली. पण लॅब ४ मध्ये वायफाय चा वेग मध्यरात्री कमी झाला होता.',
        textTranslated: 'The hackathon organization was very good. Mentors were extremely helpful. However, the WiFi speed in Lab 4 slowed down at midnight.',
        sentiment: 'positive',
        score: 0.55,
      },
      {
        isAnonymous: true,
        name: 'Anonymous Participant',
        email: '',
        lang: 'hi',
        rating: 4,
        nps: 8,
        textOriginal: 'सत्र बहुत अच्छा था और प्रोजेक्ट्स का स्तर काफी ऊंचा था। खाना समय पर मिला, लेकिन मुख्य ऑडिटोरियम का माइक बीच में गूंज रहा था।',
        textTranslated: 'The session was very good and the project caliber was high. Food was provided on time, but the main auditorium microphone was echoing intermittently.',
        sentiment: 'neutral',
        score: 0.35,
      },
      {
        isAnonymous: false,
        name: 'Pooja Patil',
        email: 'pooja.p@tech.ac.in',
        lang: 'en',
        rating: 5,
        nps: 10,
        textOriginal: 'One of the smoothest hackathons I have attended in Pune. Great judging panel and transparent evaluation rubrics.',
        textTranslated: 'One of the smoothest hackathons I have attended in Pune. Great judging panel and transparent evaluation rubrics.',
        sentiment: 'positive',
        score: 0.9,
      },
      {
        isAnonymous: true,
        name: 'Anonymous Participant',
        email: '',
        lang: 'mr',
        rating: 2,
        nps: 4,
        textOriginal: 'ऑडिटोरियममधील ध्वनी व्यवस्था अतिशय खराब होती. मागच्या रांगेत बसलेल्यांना काहीच ऐकू येत नव्हते. तसेच एसी खूप थंड होता.',
        textTranslated: 'The audio system in the auditorium was very poor. Those sitting in back rows could barely hear anything. Also the air conditioning was uncomfortably cold.',
        sentiment: 'negative',
        score: -0.75,
      },
      {
        isAnonymous: false,
        name: 'Karan Sharma',
        email: 'karan.sharma@devs.io',
        lang: 'hi',
        rating: 4,
        nps: 8,
        textOriginal: 'मेंटरिंग राउंड बहुत उपयोगी था। अगली बार 36 घंटे के सत्र में आराम करने के लिए शांत कमरों की व्यवस्था करें।',
        textTranslated: 'The mentoring round was very useful. Next time please arrange quiet rest rooms for downtime during 36-hour sessions.',
        sentiment: 'positive',
        score: 0.45,
      },
      {
        isAnonymous: true,
        name: 'Anonymous Participant',
        email: '',
        lang: 'en',
        rating: 3,
        nps: 6,
        textOriginal: 'Good hackathon overall, but registration line took nearly 45 minutes on Saturday morning.',
        textTranslated: 'Good hackathon overall, but registration line took nearly 45 minutes on Saturday morning.',
        sentiment: 'neutral',
        score: -0.1,
      },
      {
        isAnonymous: false,
        name: 'Sneha Kulkarni',
        email: 'sneha.k@pune.edu',
        lang: 'mr',
        rating: 5,
        nps: 10,
        textOriginal: 'अतिशय प्रेरणादायी अनुभव! पुढील वर्षी नक्कीच पुन्हा सहभागी होऊ. संयोजकांचे खूप खूप आभार!',
        textTranslated: 'Very inspiring experience! Will definitely participate again next year. Huge thanks to the organizers!',
        sentiment: 'positive',
        score: 0.95,
      },
    ];

    for (const item of sampleResponses) {
      await FeedbackResponse.create({
        eventId: event1._id,
        formId: form1._id,
        sessionId: session1._id,
        isAnonymous: item.isAnonymous,
        participantName: item.name,
        participantEmail: item.email,
        submissionLanguage: item.lang,
        answers: [
          {
            questionId: q1[0]._id,
            questionType: 'star_rating',
            questionPrompt: q1[0].prompt.en,
            ratingValue: item.rating,
          },
          {
            questionId: q1[1]._id,
            questionType: 'nps',
            questionPrompt: q1[1].prompt.en,
            ratingValue: item.nps,
          },
          {
            questionId: q1[2]._id,
            questionType: 'single_choice',
            questionPrompt: q1[2].prompt.en,
            selectedOptions: [item.rating >= 4 ? 'opt_stable' : 'opt_poor'],
          },
          {
            questionId: q1[3]._id,
            questionType: 'long_text',
            questionPrompt: q1[3].prompt.en,
            textResponseOriginal: item.textOriginal,
            textResponseTranslated: item.textTranslated,
            audioTranscriptionOriginal: item.lang !== 'en' ? item.textOriginal : '',
            audioTranscriptionEdited: item.lang !== 'en' ? item.textOriginal : '',
          },
        ],
        sentimentScore: item.score,
        sentimentLabel: item.sentiment,
        processedByAI: true,
      });
    }

    console.log('[Seed] Generating comprehensive AI analysis...');
    const aiAnalysis = await AIAnalysis.create({
      eventId: event1._id,
      organizationId: organization._id,
      analyzedAt: new Date(),
      totalResponsesAnalyzed: sampleResponses.length,
      sentimentSummary: {
        positive: 5,
        neutral: 2,
        negative: 1,
        averageScore: 0.47,
      },
      themes: [
        {
          name: 'Mentorship & Judging',
          sentiment: 'positive',
          responseCount: 6,
          representativeQuotes: [
            'Outstanding mentorship from industry leaders! Problem statements were pragmatic and challenging.',
            'Great judging panel and transparent evaluation rubrics.',
          ],
          keywords: ['mentors', 'evaluation', 'guidance', 'judging'],
        },
        {
          name: 'Audio & Visual',
          sentiment: 'negative',
          responseCount: 2,
          representativeQuotes: [
            'The audio system in the auditorium was very poor. Those in back rows could barely hear.',
            'Main auditorium microphone was echoing intermittently during opening speeches.',
          ],
          keywords: ['audio', 'mic', 'echo', 'inaudible'],
        },
        {
          name: 'WiFi & Connectivity',
          sentiment: 'neutral',
          responseCount: 2,
          representativeQuotes: [
            'WiFi speed in Lab 4 slowed down at midnight during heavy push hours.',
          ],
          keywords: ['wifi', 'network', 'disconnect', 'speed'],
        },
      ],
      recurringIssues: [
        {
          issue: 'Auditorium audio echo and low volume in back rows during keynote sessions.',
          severity: 'high',
          frequency: 2,
          category: 'Audio & Visual',
          evidence: [
            'Audio system in the auditorium was very poor. Those in back rows could barely hear.',
            'Microphone was echoing intermittently during opening speeches.',
          ],
        },
        {
          issue: 'Saturday morning registration bottleneck creating 45-minute attendee queues.',
          severity: 'medium',
          frequency: 1,
          category: 'Venue & Logistics',
          evidence: ['Registration line took nearly 45 minutes on Saturday morning.'],
        },
      ],
      positiveHighlights: [
        {
          highlight: 'Participant NPS is exceptional (Average rating 4.25/5 with 88% promoters).',
          frequency: 5,
          category: 'Mentorship & Delivery',
          evidence: ['Outstanding mentorship and transparent project rubrics.'],
        },
        {
          highlight: 'Midnight meals and refreshments earned broad praise from student teams.',
          frequency: 3,
          category: 'Food & Hospitality',
          evidence: ['Food arrangements during midnight were truly appreciated.'],
        },
      ],
      complaintClusters: [
        { clusterName: 'Audio Hardware', count: 2, examples: ['Auditorium mic echo', 'Back-row inaudible'] },
        { clusterName: 'Check-in Queue', count: 1, examples: ['45-min badge check-in delay'] },
      ],
    });

    console.log('[Seed] Creating actionable AI recommendations...');
    const rec1 = await Recommendation.create({
      eventId: event1._id,
      organizationId: organization._id,
      title: 'Deploy dual auxiliary wireless microphones & test acoustic calibration',
      description: 'Recurring participant complaints highlighted audio echo and low audibility in the rear auditorium tiers.',
      category: 'Audio & Visual',
      priority: 'high',
      impact: 'Eliminates friction for 200+ attendees and guarantees clear opening & awards presentations.',
      suggestedAction: 'Conduct pre-session audio balance 45 minutes before doors open and assign an AV staffer to soundboard.',
      supportingEvidence: ['Back rows could barely hear', 'Main auditorium microphone echo'],
      isConvertedToTask: true,
    });

    const rec2 = await Recommendation.create({
      eventId: event1._id,
      organizationId: organization._id,
      title: 'Implement QR-code instant check-in kiosks to eliminate registration queues',
      description: 'Morning registration bottleneck took up to 45 minutes for student teams arriving at peak hours.',
      category: 'Venue & Logistics',
      priority: 'medium',
      impact: 'Reduces check-in wait time from 45 minutes to under 30 seconds per attendee.',
      suggestedAction: 'Deploy 4 QR scan stations with volunteer mobile devices verifying digital tickets.',
      supportingEvidence: ['Registration line took nearly 45 minutes on Saturday morning'],
      isConvertedToTask: true,
    });

    console.log('[Seed] Creating improvement tracker tasks...');
    await ImprovementTask.create([
      {
        organizationId: organization._id,
        relatedEventId: event1._id,
        recommendationId: rec1._id,
        issue: 'Auditorium audio echo and low volume in rear seating rows.',
        recommendedAction: 'Book calibrated lapel mics and conduct acoustic tests with sound technician before next workshop.',
        assignedTo: cohostUser._id,
        priority: 'high',
        status: 'in_progress',
        dueDate: new Date(Date.now() + 5 * 24 * 3600 * 1000),
        notes: 'Vendor contacted for Yamaha digital mixer upgrade.',
      },
      {
        organizationId: organization._id,
        relatedEventId: event1._id,
        recommendationId: rec2._id,
        issue: 'Registration queues causing entrance delays.',
        recommendedAction: 'Setup 4 parallel QR scan check-in desks with badge printers.',
        assignedTo: hostUser._id,
        priority: 'medium',
        status: 'todo',
        dueDate: new Date(Date.now() + 8 * 24 * 3600 * 1000),
        notes: 'Fast-track QR scanning app to be verified.',
      },
    ]);

    console.log('[Seed] Creating demo notifications and audit logs...');
    await Notification.create([
      {
        userId: hostUser._id,
        organizationId: organization._id,
        title: 'AI Analysis Complete for HACK-2026',
        message: 'InsightLoop AI synthesized 8 responses with an average sentiment score of +0.47.',
        type: 'ai_ready',
        link: `/events/${event1._id}/ai`,
      },
      {
        userId: hostUser._id,
        organizationId: organization._id,
        title: 'New Response Milestone Reached',
        message: 'Your event WORK-2026 has reached 25 responses (83% of target).',
        type: 'response_milestone',
        link: `/events/${event2._id}/responses`,
      },
    ]);

    await AuditLog.create([
      {
        organizationId: organization._id,
        userId: hostUser._id,
        action: 'AI_ANALYSIS_EXECUTED',
        resourceType: 'AIAnalysis',
        resourceId: aiAnalysis._id.toString(),
        details: { eventCode: 'HACK-2026', responsesAnalyzed: 8 },
      },
      {
        organizationId: organization._id,
        userId: hostUser._id,
        action: 'EVENT_CREATED',
        resourceType: 'Event',
        resourceId: event1._id.toString(),
        details: { title: event1.title, code: event1.code },
      },
    ]);

    console.log('===========================================================');
    console.log(' SEED COMPLETED SUCCESSFULLY!');
    console.log(' Demo Accounts Created:');
    console.log(' 1. Admin: admin@insightloop.io / Password123!');
    console.log(' 2. Host: organizer@mitpune.edu / Password123!');
    console.log(' 3. Co-Host: coordinator@mitpune.edu / Password123!');
    console.log(' Organization: MIT Pune Tech & Innovation Council');
    console.log(' Seeded Events: HACK-2026, WORK-2026, LEAD-2026');
    console.log('===========================================================');

    await disconnectDB();
    process.exit(0);
  } catch (err) {
    console.error('[Seed] Critical failure during seeding:', err);
    process.exit(1);
  }
};

seedDatabase();
