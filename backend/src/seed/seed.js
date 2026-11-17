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
import { getDefaultQuestionsForCategory } from '../config/eventCategories.js';

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
      name: 'Chaitali (Admin)',
      email: 'admin@insightloop.io',
      passwordHash,
      role: 'admin',
      phone: '+91 98220 11223',
      preferences: { language: 'en', theme: 'light', emailNotifications: true },
    });

    const hostUser = await User.create({
      name: 'Yash Dhawale',
      email: 'organizer@vitpune.edu',
      passwordHash,
      role: 'host',
      phone: '+91 98450 44556',
      preferences: { language: 'en', theme: 'light', emailNotifications: true },
    });

    const cohostUser = await User.create({
      name: 'Sanika Dhone',
      email: 'coordinator@vitpune.edu',
      passwordHash,
      role: 'host',
      phone: '+91 97300 77889',
      preferences: { language: 'mr', theme: 'light', emailNotifications: true },
    });

    console.log('[Seed] Creating organizations & memberships...');
    const organization = await Organization.create({
      name: 'VIT Pune Tech & Innovation Council',
      slug: 'vit-pune-tech',
      description: 'Universal event host council organizing state and national level marathons, sports championships, hackathons, AI workshops, and cultural festivals.',
      category: 'college',
      website: 'https://vitpune.edu',
      createdBy: hostUser._id,
      isVerified: true,
    });

    await OrganizationMember.create([
      { organizationId: organization._id, userId: hostUser._id, role: 'owner', status: 'active' },
      { organizationId: organization._id, userId: cohostUser._id, role: 'admin', status: 'active', invitedBy: hostUser._id },
    ]);

    console.log('[Seed] Creating universal events across all categories...');

    // 1. Collegiate Hackathon
    const event1 = await Event.create({
      organizationId: organization._id,
      title: 'National AI Hackathon & Sprint 2026',
      code: 'HACK-2026',
      category: 'College',
      subcategory: 'Hackathon & Coding Sprint',
      subcategories: ['Hackathon & Coding Sprint', 'Tech Fest & Project Expo'],
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

    // 2. Workshop
    const event2 = await Event.create({
      organizationId: organization._id,
      title: 'Hands-on Workshop: Full-Stack React & AI Agents',
      code: 'WORK-2026',
      category: 'Workshop',
      subcategory: 'AI, Machine Learning & Data Science',
      subcategories: ['AI, Machine Learning & Data Science', 'Coding & Web Development'],
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

    // 3. Conference
    const event3 = await Event.create({
      organizationId: organization._id,
      title: 'Annual Leadership & Technology Summit',
      code: 'LEAD-2026',
      category: 'Conference',
      subcategory: 'Technical & Engineering Summit',
      subcategories: ['Technical & Engineering Summit', 'Business & Entrepreneurship'],
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

    // 4. Universal Event: Marathon & Running
    const event4 = await Event.create({
      organizationId: organization._id,
      title: 'Pune Heritage City Marathon 2026',
      code: 'RUN-2026',
      category: 'Marathon',
      subcategory: 'Half Marathon (21.1K)',
      subcategories: ['Half Marathon (21.1K)', '10K Challenge', '5K Fun Run'],
      description: 'Annual city marathon spanning historical landmarks of Pune with 3,500+ runners across 21K, 10K, and 5K categories.',
      venueType: 'in-person',
      location: 'Shree Shiv Chhatrapati Sports Complex & Baner Route, Pune',
      startDate: new Date(Date.now() - 3 * 24 * 3600 * 1000),
      endDate: new Date(Date.now() - 3 * 24 * 3600 * 1000 + 6 * 3600 * 1000),
      status: 'completed',
      isFeedbackOpen: true,
      targetResponses: 80,
      tags: ['Marathon', 'Running', 'Fitness', 'Heritage'],
      createdBy: hostUser._id,
    });

    // 5. Universal Event: Concert & Music Festival
    const event5 = await Event.create({
      organizationId: organization._id,
      title: 'Sunwave Arena Indie Rock & Fusion Live',
      code: 'LIVE-2026',
      category: 'Concert',
      subcategory: 'Live Band Concert',
      subcategories: ['Live Band Concert', 'EDM / DJ Night', 'Classical & Fusion Recital'],
      description: 'High-energy outdoor music festival featuring leading Indian Indie bands, acoustic fusion, and synchronized light spectacles.',
      venueType: 'in-person',
      location: 'Mahalaxmi Lawns & Amphitheatre, Pune',
      startDate: new Date(Date.now() - 1 * 24 * 3600 * 1000),
      endDate: new Date(Date.now() - 1 * 24 * 3600 * 1000 + 8 * 3600 * 1000),
      status: 'completed',
      isFeedbackOpen: true,
      targetResponses: 60,
      tags: ['Music', 'Concert', 'Indie', 'LiveBand'],
      createdBy: hostUser._id,
    });

    // 6. Universal Event: Sports Tournament
    const event6 = await Event.create({
      organizationId: organization._id,
      title: 'Maharashtra Inter-Collegiate Cricket Championship',
      code: 'PLAY-2026',
      category: 'Sports',
      subcategory: 'Cricket Championship',
      subcategories: ['Cricket Championship', 'Football Tournament'],
      description: 'State-level cricket knockout championship featuring top university teams competing over 4 days.',
      venueType: 'in-person',
      location: 'University Sports Ground & Stadium, Pune',
      startDate: new Date(Date.now() - 4 * 24 * 3600 * 1000),
      endDate: new Date(Date.now() - 1 * 24 * 3600 * 1000),
      status: 'completed',
      isFeedbackOpen: true,
      targetResponses: 50,
      tags: ['Sports', 'Cricket', 'Athletics', 'Championship'],
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

    // Sessions for Marathon
    await EventSession.create({
      eventId: event4._id,
      title: '21K Flag-off & Elite Wave',
      speakerName: 'Race Director & Chief Marshal',
      startTime: new Date(Date.now() - 3 * 24 * 3600 * 1000 + 5 * 3600 * 1000),
      endTime: new Date(Date.now() - 3 * 24 * 3600 * 1000 + 9 * 3600 * 1000),
      roomOrLink: 'Start Holding Area Corral A',
    });

    console.log('[Seed] Creating forms and questions tailored to each category...');

    // Helper to seed form & questions
    const seedEventForm = async (event) => {
      const form = await FeedbackForm.create({
        eventId: event._id,
        title: `${event.title} Feedback Form`,
        description: `We appreciate your valuable feedback for ${event.title}. Help us continuously enhance future editions.`,
        isAnonymousAllowed: true,
        supportedLanguages: ['en', 'hi', 'mr'],
        allowVoiceFeedback: true,
        templateType: event.category.toLowerCase(),
      });

      const templateQuestions = getDefaultQuestionsForCategory(event.category, event.subcategory);
      const questionsToInsert = templateQuestions.map((q, idx) => ({
        formId: form._id,
        order: idx + 1,
        type: q.type,
        category: q.category || 'overall',
        isRequired: Boolean(q.isRequired),
        prompt: {
          en: (q.prompt?.en || '').replace(/\$\{title\}/g, event.title),
          hi: (q.prompt?.hi || '').replace(/\$\{title\}/g, event.title),
          mr: (q.prompt?.mr || '').replace(/\$\{title\}/g, event.title),
        },
        description: q.description || { en: '', hi: '', mr: '' },
        options: q.options || [],
      }));

      const createdQuestions = await Question.insertMany(questionsToInsert);
      return { form, questions: createdQuestions };
    };

    const form1Data = await seedEventForm(event1);
    const form2Data = await seedEventForm(event2);
    const form3Data = await seedEventForm(event3);
    const form4Data = await seedEventForm(event4); // Marathon
    const form5Data = await seedEventForm(event5); // Concert
    const form6Data = await seedEventForm(event6); // Sports

    console.log('[Seed] Populating realistic multilingual feedback responses...');

    // Responses for Event 1 (Hackathon)
    const hackathonResponses = [
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

    for (const item of hackathonResponses) {
      await FeedbackResponse.create({
        eventId: event1._id,
        formId: form1Data.form._id,
        sessionId: session1._id,
        isAnonymous: item.isAnonymous,
        participantName: item.name,
        participantEmail: item.email,
        submissionLanguage: item.lang,
        answers: [
          {
            questionId: form1Data.questions[0]._id,
            questionType: 'star_rating',
            questionPrompt: form1Data.questions[0].prompt.en,
            ratingValue: item.rating,
          },
          {
            questionId: form1Data.questions[1]._id,
            questionType: 'nps',
            questionPrompt: form1Data.questions[1].prompt.en,
            ratingValue: item.nps,
          },
          {
            questionId: form1Data.questions[form1Data.questions.length - 1]._id,
            questionType: 'long_text',
            questionPrompt: form1Data.questions[form1Data.questions.length - 1].prompt.en,
            textResponseOriginal: item.textOriginal,
            textResponseTranslated: item.textTranslated,
          },
        ],
        sentimentScore: item.score,
        sentimentLabel: item.sentiment,
        processedByAI: true,
      });
    }

    // Responses for Event 4 (Marathon)
    const marathonResponses = [
      {
        isAnonymous: false,
        name: 'Vikram Joshi',
        email: 'vikram.runner@gmail.com',
        lang: 'en',
        rating: 5,
        nps: 10,
        textOriginal: 'Superbly planned race route! The scenic morning course along the bypass was clean, and traffic management by Pune Police was exceptional.',
        textTranslated: 'Superbly planned race route! The scenic morning course along the bypass was clean, and traffic management by Pune Police was exceptional.',
        sentiment: 'positive',
        score: 0.9,
      },
      {
        isAnonymous: false,
        name: 'Aditi Deshmukh',
        email: 'aditi.d@sports.org',
        lang: 'mr',
        rating: 4,
        nps: 8,
        textOriginal: 'धावण्याचा मार्ग आणि पाण्याची सोय उत्तम होती. पण १५ किलोमीटरच्या स्टॉलवर इलेक्ट्रोलाइट्स संपले होते. मेडलचे डिझाईन अप्रतिम आहे!',
        textTranslated: 'The running route and water facilities were great. However, electrolytes ran out at the 15km stall. The finisher medal design is magnificent!',
        sentiment: 'positive',
        score: 0.6,
      },
      {
        isAnonymous: true,
        name: 'Anonymous Runner',
        email: '',
        lang: 'hi',
        rating: 3,
        nps: 6,
        textOriginal: 'रूट बहुत अच्छा था, लेकिन फिनिश लाइन पर नाश्ते के काउंटर पर बहुत ज्यादा भीड़ हो गई थी। टोकन सिस्टम होना चाहिए।',
        textTranslated: 'The route was very good, but the breakfast counter at the finish line was extremely overcrowded. A token system should be implemented.',
        sentiment: 'neutral',
        score: -0.1,
      },
      {
        isAnonymous: false,
        name: 'Suresh Patil',
        email: 'suresh.p@marathoners.in',
        lang: 'mr',
        rating: 5,
        nps: 10,
        textOriginal: 'टायमिंग चिप अतिशय अचूक होती. फिनिश लाईन ओलांडताच लगेच एसएमएस आला. स्वयंसेवकांचा उत्साह वाखाणण्याजोगा होता.',
        textTranslated: 'Timing chip was extremely accurate. Received SMS immediately upon crossing the finish line. Volunteer enthusiasm was commendable.',
        sentiment: 'positive',
        score: 0.95,
      },
    ];

    for (const item of marathonResponses) {
      await FeedbackResponse.create({
        eventId: event4._id,
        formId: form4Data.form._id,
        isAnonymous: item.isAnonymous,
        participantName: item.name,
        participantEmail: item.email,
        submissionLanguage: item.lang,
        answers: [
          {
            questionId: form4Data.questions[0]._id,
            questionType: form4Data.questions[0].type,
            questionPrompt: form4Data.questions[0].prompt.en,
            ratingValue: item.rating,
          },
          {
            questionId: form4Data.questions[form4Data.questions.length - 1]._id,
            questionType: 'long_text',
            questionPrompt: form4Data.questions[form4Data.questions.length - 1].prompt.en,
            textResponseOriginal: item.textOriginal,
            textResponseTranslated: item.textTranslated,
          },
        ],
        sentimentScore: item.score,
        sentimentLabel: item.sentiment,
        processedByAI: true,
      });
    }

    // Responses for Event 5 (Concert)
    const concertResponses = [
      {
        isAnonymous: false,
        name: 'Riya Sen',
        email: 'riya.sen@musicfan.com',
        lang: 'en',
        rating: 5,
        nps: 10,
        textOriginal: 'Unbelievable energy! The audio bass and visual laser lights were top-notch. Headliner gave an unforgettable 2-hour set.',
        textTranslated: 'Unbelievable energy! The audio bass and visual laser lights were top-notch. Headliner gave an unforgettable 2-hour set.',
        sentiment: 'positive',
        score: 0.95,
      },
      {
        isAnonymous: true,
        name: 'Concert Goer',
        email: '',
        lang: 'mr',
        rating: 3,
        nps: 6,
        textOriginal: 'गाणी आणि कलाकारांचे सादरीकरण अप्रतिम होते, पण गेट २ वर प्रवेशासाठी ४० मिनिटे रांगेत उभे राहावे लागले. गर्दीचे नियोजन हवे होते.',
        textTranslated: 'Songs and artist performance was superb, but had to stand in queue for 40 minutes for entry at Gate 2. Crowd management was needed.',
        sentiment: 'neutral',
        score: 0.1,
      },
      {
        isAnonymous: false,
        name: 'Manish Kumar',
        email: 'manish.k@live.in',
        lang: 'hi',
        rating: 4,
        nps: 8,
        textOriginal: 'ध्वनि की गुणवत्ता बहुत शानदार थी, स्टेज और विजुअल बहुत खूबसूरत लगे। वॉशरूम की संख्या बढ़ाई जानी चाहिए।',
        textTranslated: 'The sound quality was superb, stage and visuals looked very beautiful. Number of restrooms should be increased.',
        sentiment: 'positive',
        score: 0.65,
      },
    ];

    for (const item of concertResponses) {
      await FeedbackResponse.create({
        eventId: event5._id,
        formId: form5Data.form._id,
        isAnonymous: item.isAnonymous,
        participantName: item.name,
        participantEmail: item.email,
        submissionLanguage: item.lang,
        answers: [
          {
            questionId: form5Data.questions[0]._id,
            questionType: form5Data.questions[0].type,
            questionPrompt: form5Data.questions[0].prompt.en,
            ratingValue: item.rating,
          },
          {
            questionId: form5Data.questions[form5Data.questions.length - 1]._id,
            questionType: 'long_text',
            questionPrompt: form5Data.questions[form5Data.questions.length - 1].prompt.en,
            textResponseOriginal: item.textOriginal,
            textResponseTranslated: item.textTranslated,
          },
        ],
        sentimentScore: item.score,
        sentimentLabel: item.sentiment,
        processedByAI: true,
      });
    }

    console.log('[Seed] Generating AI analyses and category-tailored recommendations...');

    // AI Analysis for Hackathon
    await AIAnalysis.create({
      eventId: event1._id,
      organizationId: organization._id,
      analyzedAt: new Date(),
      totalResponsesAnalyzed: hackathonResponses.length,
      sentimentSummary: {
        positive: 4,
        neutral: 1,
        negative: 1,
        averageScore: 0.48,
      },
      themes: [
        {
          name: 'Mentorship & Problem Quality',
          sentiment: 'positive',
          responseCount: 5,
          representativeQuotes: ['Outstanding mentorship from industry leaders! Problem statements were pragmatic.'],
          keywords: ['mentors', 'evaluation', 'guidance', 'problems'],
        },
        {
          name: 'Audio & Visual Setup',
          sentiment: 'negative',
          responseCount: 2,
          representativeQuotes: ['The audio system in the auditorium was very poor. Back rows could barely hear.'],
          keywords: ['audio', 'mic', 'echo', 'volume'],
        },
      ],
      recurringIssues: [
        {
          issue: 'Auditorium audio echo and low audibility in rear seating rows.',
          severity: 'high',
          frequency: 2,
          category: 'Audio & Visual',
          evidence: ['Audio system in auditorium was very poor. Those in back rows could barely hear.'],
        },
      ],
      positiveHighlights: [
        {
          highlight: 'Participant NPS is exceptional (Average rating 4.2/5 with high willingness to return).',
          frequency: 4,
          category: 'Mentorship',
          evidence: ['Outstanding mentorship and transparent project rubrics.'],
        },
      ],
    });

    // AI Analysis for Marathon
    await AIAnalysis.create({
      eventId: event4._id,
      organizationId: organization._id,
      analyzedAt: new Date(),
      totalResponsesAnalyzed: marathonResponses.length,
      sentimentSummary: {
        positive: 3,
        neutral: 1,
        negative: 0,
        averageScore: 0.59,
      },
      themes: [
        {
          name: 'Route Demarcation & Safety',
          sentiment: 'positive',
          responseCount: 4,
          representativeQuotes: ['Superbly planned race route along the bypass; clean and well-barricaded.'],
          keywords: ['route', 'traffic', 'safety', 'police'],
        },
        {
          name: 'Hydration & Post-Race Logistics',
          sentiment: 'neutral',
          responseCount: 2,
          representativeQuotes: ['Electrolytes ran out at 15km; finish line breakfast had crowd congestion.'],
          keywords: ['hydration', 'electrolytes', 'breakfast', 'crowd'],
        },
      ],
      recurringIssues: [
        {
          issue: 'Electrolyte supply depleted at 15km checkpoint for mid-pack runners.',
          severity: 'medium',
          frequency: 1,
          category: 'Hydration & Medical',
          evidence: ['15km stall ran out of electrolytes'],
        },
      ],
      positiveHighlights: [
        {
          highlight: 'Chip timing accuracy and instantaneous SMS result delivery received 100% acclaim.',
          frequency: 3,
          category: 'Race Timing',
          evidence: ['Received SMS immediately upon crossing finish line.'],
        },
      ],
    });

    // Recommendations for Marathon
    await Recommendation.create([
      {
        eventId: event4._id,
        organizationId: organization._id,
        title: 'Buffer 15km and 18km aid station electrolyte stock by 35%',
        description: 'Mid-pack half-marathon runners experienced shortages of electrolyte drinks during the later stages.',
        category: 'Hydration & Medical',
        priority: 'high',
        impact: 'Guarantees optimal replenishment for all runner paces and prevents fatigue injuries.',
        suggestedAction: 'Deploy a dedicated replenishment vehicle with 1,500 extra sealed electrolyte bottles.',
        supportingEvidence: ['Electrolytes ran out at 15km checkpoint'],
        isConvertedToTask: false,
      },
      {
        eventId: event4._id,
        organizationId: organization._id,
        title: 'Implement segregated breakfast queue corridors by distance bib color',
        description: 'Finish line congestion peaked when 10K and 21K runners finished simultaneously.',
        category: 'Finish Line Operations',
        priority: 'medium',
        impact: 'Reduces finish area wait times from 15 minutes to under 2 minutes.',
        suggestedAction: 'Set up 4 separate food distribution tents mapped to bib color codes.',
        supportingEvidence: ['Breakfast counter at finish line was overcrowded'],
        isConvertedToTask: false,
      },
    ]);

    // AI Analysis for Concert
    await AIAnalysis.create({
      eventId: event5._id,
      organizationId: organization._id,
      analyzedAt: new Date(),
      totalResponsesAnalyzed: concertResponses.length,
      sentimentSummary: {
        positive: 2,
        neutral: 1,
        negative: 0,
        averageScore: 0.57,
      },
      themes: [
        {
          name: 'Acoustics & Lighting Show',
          sentiment: 'positive',
          responseCount: 3,
          representativeQuotes: ['Mind-blowing bass, laser visuals, and exceptional headline set.'],
          keywords: ['audio', 'bass', 'lights', 'band'],
        },
        {
          name: 'Entry Queue & Crowd Flow',
          sentiment: 'neutral',
          responseCount: 1,
          representativeQuotes: ['40-minute queue delay at Gate 2 security check during peak entry.'],
          keywords: ['queue', 'gate', 'security', 'delay'],
        },
      ],
      recurringIssues: [
        {
          issue: 'Gate 2 security baggage screening caused 40-minute entrance queues.',
          severity: 'high',
          frequency: 1,
          category: 'Crowd Management',
          evidence: ['Had to stand in queue for 40 minutes at Gate 2'],
        },
      ],
      positiveHighlights: [
        {
          highlight: 'World-class sound balance and stunning synchronized lighting production.',
          frequency: 2,
          category: 'Production Quality',
          evidence: ['Unbelievable energy and top-notch audio bass.'],
        },
      ],
    });

    // Recommendations for Hackathon
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
        title: 'Universal AI Analysis Ready',
        message: 'InsightLoop AI synthesized Marathon, Concert, and Hackathon responses across all languages.',
        type: 'ai_ready',
        link: `/events/${event1._id}/ai`,
      },
    ]);

    await AuditLog.create([
      {
        organizationId: organization._id,
        userId: hostUser._id,
        action: 'UNIVERSAL_SYSTEM_INITIALIZED',
        resourceType: 'System',
        resourceId: organization._id.toString(),
        details: { seededCategories: ['College', 'Workshop', 'Conference', 'Marathon', 'Concert', 'Sports'] },
      },
    ]);

    console.log('===========================================================');
    console.log(' UNIVERSAL SEED COMPLETED SUCCESSFULLY!');
    console.log(' Universal Events Seeded:');
    console.log(' 1. HACK-2026: College AI Hackathon');
    console.log(' 2. WORK-2026: Hands-on AI Workshop');
    console.log(' 3. LEAD-2026: Leadership Conference');
    console.log(' 4. RUN-2026:  Pune City Marathon (Half Marathon 21K)');
    console.log(' 5. LIVE-2026: Sunwave Indie Rock Concert');
    console.log(' 6. PLAY-2026: Cricket Sports Championship');
    console.log('===========================================================');

    await disconnectDB();
    process.exit(0);
  } catch (err) {
    console.error('[Seed] Critical failure during seeding:', err);
    process.exit(1);
  }
};

seedDatabase();
