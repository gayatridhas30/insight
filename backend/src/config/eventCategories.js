/**
 * InsightLoop Universal Event Categories and Subcategories Registry
 * Scalable configuration supporting College events, Marathons, Concerts, Sports,
 * Conferences, Workshops, Cultural fests, Corporate events, Charity, and Community events.
 */

export const EVENT_CATEGORIES = {
  Marathon: {
    id: 'Marathon',
    name: 'Marathons & Running Events',
    icon: 'Footprints',
    description: 'Road races, marathons, trail runs, and athletic endurance events.',
    subcategories: [
      '5K Fun Run',
      '10K Challenge',
      'Half Marathon (21.1K)',
      'Full Marathon (42.2K)',
      'Ultra Marathon',
      'Trail & Mountain Run',
      'Corporate Relay Run',
      'Charity Walkathon',
    ],
    defaultQuestions: [
      {
        order: 1,
        type: 'star_rating',
        category: 'venue_logistics',
        isRequired: true,
        prompt: {
          en: 'How would you rate the race route marking and safety management?',
          hi: 'दौड़ मार्ग के चिह्नांकन और सुरक्षा प्रबंधन को आप क्या रेटिंग देंगे?',
          mr: 'धावण्याच्या मार्गाचे दिशा-दर्शन आणि सुरक्षा व्यवस्थेला आपण काय रेटिंग द्याल?',
        },
        description: {
          en: 'Includes barricading, distance markers, and traffic control',
          hi: 'बैरिकेडिंग, दूरी संकेतक और ट्रैफिक नियंत्रण शामिल है',
          mr: 'बॅरिकेडिंग, अंतर फलक आणि वाहतूक नियंत्रण समाविष्ट आहे',
        },
      },
      {
        order: 2,
        type: 'single_choice',
        category: 'venue_logistics',
        isRequired: true,
        prompt: {
          en: 'How was the hydration and medical support along the course?',
          hi: 'मार्ग पर हाइड्रेशन (पानी/इलेक्ट्रोलाइट) और चिकित्सा सहायता कैसी थी?',
          mr: 'मार्गावरील पाणी/इलेक्ट्रोलाइट्स आणि वैद्यकीय मदत कशी होती?',
        },
        description: {
          en: 'Water stations, electrolyte drinks, energy snacks, and first aid',
          hi: 'पानी के स्टॉल, ऊर्जा पेय और प्राथमिक चिकित्सा',
          mr: 'पाण्याचे स्टॉल, ऊर्जा पेये आणि प्रथमोपचार',
        },
        options: [
          { id: 'opt_excellent', label: { en: 'Excellent & Abundant', hi: 'उत्कृष्ट और पर्याप्त', mr: 'अतिशय उत्तम आणि मुबलक' } },
          { id: 'opt_sufficient', label: { en: 'Sufficient but crowded', hi: 'पर्याप्त लेकिन भीड़भाड़', mr: 'पुरेशी पण गर्दी होती' } },
          { id: 'opt_insufficient', label: { en: 'Ran out at later stations', hi: 'बाद के स्टेशनों पर कमी थी', mr: 'पुढील स्टेशन्सवर कमतरता होती' } },
        ],
      },
      {
        order: 3,
        type: 'star_rating',
        category: 'organization',
        isRequired: true,
        prompt: {
          en: 'Rate the bib distribution, timing chip accuracy, and finish line management.',
          hi: 'बिब वितरण, टाइमिंग चिप सटीकता और फिनिश लाइन व्यवस्था को रेट करें।',
          mr: 'बिब वाटप, टायमिंग चिप अचूकता आणि फिनिश लाईन व्यवस्थापनाचे मूल्यांकन करा.',
        },
        description: { en: '1 to 5 stars', hi: '1 से 5 स्टार', mr: '1 ते 5 स्टार' },
      },
      {
        order: 4,
        type: 'nps',
        category: 'overall',
        isRequired: true,
        prompt: {
          en: 'How likely are you to recommend running this race to fellow runners?',
          hi: 'आप साथी धावकों को इस दौड़ में भाग लेने की सिफारिश करने की कितनी संभावना रखते हैं?',
          mr: 'आपण इतर धावपटूंना या शर्यतीत सहभागी होण्याची शिफारस करण्याची किती शक्यता आहे?',
        },
        description: { en: '0 (Not likely) to 10 (Extremely likely)', hi: '0 से 10', mr: '0 ते 10' },
      },
      {
        order: 5,
        type: 'long_text',
        category: 'overall',
        isRequired: false,
        prompt: {
          en: 'Share your suggestions regarding the route, finisher medal, or post-race breakfast:',
          hi: 'रूट, फिनिशर मेडल या दौड़ के बाद के नाश्ते के बारे में अपने सुझाव साझा करें:',
          mr: 'मार्ग, फिनिशर मेडल किंवा शर्यतीनंतरच्या नाश्त्याबद्दल आपल्या प्रतिक्रिया कळवा:',
        },
        description: {
          en: 'Type or record voice feedback in English, Hindi, or Marathi',
          hi: 'अंग्रेजी, हिंदी या मराठी में लिखें या आवाज रिकॉर्ड करें',
          mr: 'इंग्रजी, हिंदी किंवा मराठीत लिहा किंवा आवाज रेकॉर्ड करा',
        },
      },
    ],
  },

  Sports: {
    id: 'Sports',
    name: 'Sports Tournaments & Leagues',
    icon: 'Trophy',
    description: 'Competitive matches, sports leagues, athletics, and collegiate tournaments.',
    subcategories: [
      'Cricket Championship',
      'Football Tournament',
      'Basketball League',
      'Badminton Open',
      'Tennis & Table Tennis',
      'Athletics & Track Meet',
      'Esports Championship',
      'Swimming Gala',
      'Volleyball Cup',
    ],
    defaultQuestions: [
      {
        order: 1,
        type: 'star_rating',
        category: 'venue_logistics',
        isRequired: true,
        prompt: {
          en: 'How would you rate the ground, pitch/court condition, and playing equipment?',
          hi: 'मैदान/पिच/कोर्ट की स्थिति और खेल उपकरणों को आप क्या रेटिंग देंगे?',
          mr: 'मैदान/पिच/कोर्टची गुणवत्ता आणि क्रीडा साहित्याला आपण काय रेटिंग द्याल?',
        },
        description: { en: 'Turf quality, lighting, nets, and boundaries', hi: 'टर्फ, लाइटिंग और बाउंड्री', mr: 'टर्फ, प्रकाशव्यवस्था आणि सीमा' },
      },
      {
        order: 2,
        type: 'single_choice',
        category: 'organization',
        isRequired: true,
        prompt: {
          en: 'How fair and professional was the refereeing and officiating?',
          hi: 'अंपायरिंग और रेफरी का निर्णय कितना निष्पक्ष और पेशेवर था?',
          mr: 'पंच आणि पंचांचे निर्णय किती निष्पक्ष व व्यावसायिक होते?',
        },
        description: { en: 'Match rules adherence and dispute resolution', hi: 'नियमों का पालन और विवाद समाधान', mr: 'नियमांचे पालन व निर्णय अचूकता' },
        options: [
          { id: 'opt_fair', label: { en: 'Impartial & High Standard', hi: 'निष्पक्ष और उच्च स्तरीय', mr: 'पूर्णपणे निष्पक्ष आणि दर्जेदार' } },
          { id: 'opt_acceptable', label: { en: 'Acceptable with minor calls', hi: 'स्वीकार्य, कुछ मामूली गलतियाँ', mr: 'समाधानकारक, किरकोळ त्रुटी' } },
          { id: 'opt_poor', label: { en: 'Inconsistent calls made', hi: 'असंगत और पक्षपातपूर्ण निर्णय', mr: 'अयोग्य व विसंगत निर्णय' } },
        ],
      },
      {
        order: 3,
        type: 'star_rating',
        category: 'organization',
        isRequired: true,
        prompt: {
          en: 'Rate the match schedule adherence, fixture management, and team communication.',
          hi: 'मैच शेड्यूल, फिक्सचर प्रबंधन और टीम समन्वय को रेट करें।',
          mr: 'सामन्यांचे वेळापत्रक, फिक्सचर्स आणि संघ संपर्काचे मूल्यांकन करा.',
        },
        description: { en: '1 to 5 stars', hi: '1 से 5 स्टार', mr: '1 ते 5 स्टार' },
      },
      {
        order: 4,
        type: 'nps',
        category: 'overall',
        isRequired: true,
        prompt: {
          en: 'How likely are you to participate in or attend future editions of this tournament?',
          hi: 'आप इस टूर्नामेंट के आगामी संस्करणों में भाग लेने की कितनी संभावना रखते हैं?',
          mr: 'आपण या स्पर्धेच्या पुढील आवृत्त्यांमध्ये सहभागी होण्याची किती शक्यता आहे?',
        },
        description: { en: '0 to 10 scale', hi: '0 से 10', mr: '0 ते 10' },
      },
      {
        order: 5,
        type: 'long_text',
        category: 'overall',
        isRequired: false,
        prompt: {
          en: 'What did your team appreciate, and what needs improvement in tournament logistics?',
          hi: 'आपकी टीम को क्या पसंद आया, और टूर्नामेंट व्यवस्था में क्या सुधार चाहिए?',
          mr: 'आपल्या संघाला काय आवडले, आणि क्रीडा आयोजनात काय सुधारणा हवी?',
        },
        description: { en: 'Share feedback or record voice', hi: 'फीडबैक साझा करें', mr: 'प्रतिक्रिया कळवा' },
      },
    ],
  },

  Concert: {
    id: 'Concert',
    name: 'Concerts & Music Festivals',
    icon: 'Music',
    description: 'Live musical shows, band performances, DJ nights, and multi-day music festivals.',
    subcategories: [
      'Live Band Concert',
      'EDM / DJ Night',
      'Classical & Fusion Recital',
      'College Fest Pro-Nite',
      'Acoustic Unplugged',
      'Multi-Stage Music Festival',
      'Battle of the Bands',
    ],
    defaultQuestions: [
      {
        order: 1,
        type: 'star_rating',
        category: 'venue_logistics',
        isRequired: true,
        prompt: {
          en: 'How was the audio quality, acoustic balance, and visual light show?',
          hi: 'ध्वनि की गुणवत्ता (साउंड), बास और स्टेज लाइटिंग शो कैसा था?',
          mr: 'ध्वनीचा दर्जा (साउंड सिस्टीम), बास आणि स्टेज लाईट शो कसा होता?',
        },
        description: { en: 'Clarity, bass, speaker coverage, and visual effects', hi: 'स्पष्टता और प्रकाश प्रभाव', mr: 'स्पष्टता आणि प्रकाश प्रभाव' },
      },
      {
        order: 2,
        type: 'single_choice',
        category: 'venue_logistics',
        isRequired: true,
        prompt: {
          en: 'How was the crowd management, entry queues, and security checks?',
          hi: 'भीड़ नियंत्रण, प्रवेश कतार और सुरक्षा जांच व्यवस्था कैसी थी?',
          mr: 'गर्दी नियंत्रण, प्रवेश रांगा आणि सुरक्षा तपासणी कशी होती?',
        },
        description: { en: 'Entry speed, barricades, and exit dispersal', hi: 'प्रवेश गति और सुरक्षा', mr: 'प्रवेश गती आणि सुरक्षितता' },
        options: [
          { id: 'opt_smooth', label: { en: 'Quick & Well Managed', hi: 'तेज और सुव्यवस्थित', mr: 'वेगवान आणि सुव्यवस्थित' } },
          { id: 'opt_moderate', label: { en: 'Moderate waiting time', hi: 'मध्यम प्रतीक्षा समय', mr: 'मध्यम वेळ लागला' } },
          { id: 'opt_crowded', label: { en: 'Chaotic & Overcrowded', hi: 'अव्यवस्थित और अत्यधिक भीड़', mr: 'गोंधळ आणि खूप गर्दी' } },
        ],
      },
      {
        order: 3,
        type: 'star_rating',
        category: 'speaker',
        isRequired: true,
        prompt: {
          en: 'How would you rate the artists headline performance and audience engagement?',
          hi: 'कलाकार के मुख्य प्रदर्शन और दर्शकों के साथ जुड़ाव को आप क्या रेटिंग देंगे?',
          mr: 'कलाकारांचे मुख्य सादरीकरण आणि रसिकांशी संवादाला आपण काय रेटिंग द्याल?',
        },
        description: { en: 'Energy, song selection, and stage presence', hi: 'ऊर्जा और मंच प्रस्तुति', mr: 'ऊर्जा आणि सादरीकरण' },
      },
      {
        order: 4,
        type: 'nps',
        category: 'overall',
        isRequired: true,
        prompt: {
          en: 'How likely are you to attend our next concert or music event?',
          hi: 'आप हमारे अगले संगीत समारोह में शामिल होने की कितनी संभावना रखते हैं?',
          mr: 'आपण आमच्या पुढील संगीत कार्यक्रमास उपस्थित राहण्याची किती शक्यता आहे?',
        },
        description: { en: '0 to 10 scale', hi: '0 से 10', mr: '0 ते 10' },
      },
      {
        order: 5,
        type: 'long_text',
        category: 'overall',
        isRequired: false,
        prompt: {
          en: 'What made this concert special, or what should we improve regarding facilities and restrooms?',
          hi: 'इस कॉन्सर्ट में क्या खास था, या सुविधाओं और वॉशरूम को लेकर क्या सुधार चाहिए?',
          mr: 'या मैफिलीत काय विशेष आवडले, किंवा सुविधा व स्वच्छतागृहांबाबत काय सुधारणा हवी?',
        },
        description: { en: 'Type or record voice feedback', hi: 'लिखें या आवाज रिकॉर्ड करें', mr: 'लिहा किंवा आवाज रेकॉर्ड करा' },
      },
    ],
  },

  Conference: {
    id: 'Conference',
    name: 'Conferences & Seminars',
    icon: 'Presentation',
    description: 'Industry summits, academic symposiums, research conferences, and executive panels.',
    subcategories: [
      'Technical & Engineering Summit',
      'Business & Entrepreneurship',
      'Academic & Research Symposium',
      'Healthcare & Medical Conference',
      'Policy, Law & Governance',
      'Fintech & Banking Forum',
      'Climate & Sustainability Summit',
    ],
    defaultQuestions: [
      {
        order: 1,
        type: 'star_rating',
        category: 'content',
        isRequired: true,
        prompt: {
          en: 'How would you rate the depth and relevance of keynote sessions and panels?',
          hi: 'मुख्य व्याख्यानों और पैनल चर्चा की गहराई व प्रासंगिकता को आप क्या रेटिंग देंगे?',
          mr: 'मुख्य व्याख्याने आणि चर्चासत्रांच्या दर्जा व उपयुक्ततेला आपण काय रेटिंग द्याल?',
        },
        description: { en: 'Insights, research quality, and thought leadership', hi: 'ज्ञान और विचारशीलता', mr: 'सखोल ज्ञान आणि उपयुक्तता' },
      },
      {
        order: 2,
        type: 'single_choice',
        category: 'organization',
        isRequired: true,
        prompt: {
          en: 'Were the networking opportunities and Q&A interactions sufficient?',
          hi: 'क्या नेटवर्किंग के अवसर और प्रश्नोत्तर सत्र पर्याप्त थे?',
          mr: 'नेटवर्किंगच्या संधी आणि प्रश्नोत्तरांचे सत्र पुरेसे होते का?',
        },
        description: { en: 'Engagement with speakers, delegates, and peers', hi: 'सहभागियों से संपर्क', mr: 'प्रतिनिधींशी संवाद' },
        options: [
          { id: 'opt_great', label: { en: 'Excellent Networking Opportunities', hi: 'उत्कृष्ट नेटवर्किंग अवसर', mr: 'उत्तम नेटवर्किंग संधी' } },
          { id: 'opt_fair', label: { en: 'Adequate, wanted more breakout time', hi: 'ठीक-ठाक, और समय चाहिए था', mr: 'समाधानकारक, अधिक वेळ हवा होता' } },
          { id: 'opt_limited', label: { en: 'Limited peer interaction', hi: 'सीमित बातचीत', mr: 'संवादासाठी अत्यंत कमी वेळ' } },
        ],
      },
      {
        order: 3,
        type: 'star_rating',
        category: 'venue_logistics',
        isRequired: true,
        prompt: {
          en: 'Rate the conference venue, AV/projection setup, and catering refreshments.',
          hi: 'सम्मेलन स्थल, ऑडियो-विजुअल सेटअप और खानपान को रेट करें।',
          mr: 'परिषद स्थळ, दृकश्राव्य व्यवस्था आणि अल्पोपहाराचे मूल्यांकन करा.',
        },
        description: { en: '1 to 5 stars', hi: '1 से 5 स्टार', mr: '1 ते 5 स्टार' },
      },
      {
        order: 4,
        type: 'nps',
        category: 'overall',
        isRequired: true,
        prompt: {
          en: 'How likely are you to recommend attending this conference to colleagues?',
          hi: 'आप सहकर्मियों को इस सम्मेलन में भाग लेने की सिफारिश करने की कितनी संभावना रखते हैं?',
          mr: 'आपण सहकाऱ्यांना या परिषदेला उपस्थित राहण्याची शिफारस करण्याची किती शक्यता आहे?',
        },
        description: { en: '0 to 10 scale', hi: '0 से 10', mr: '0 ते 10' },
      },
      {
        order: 5,
        type: 'long_text',
        category: 'overall',
        isRequired: false,
        prompt: {
          en: 'What key takeaway did you find most valuable, and what topics should we cover next year?',
          hi: 'आपको कौन सी सीख सबसे मूल्यवान लगी, और अगले वर्ष हमें किन विषयों को शामिल करना चाहिए?',
          mr: 'आपल्याला सर्वात महत्त्वाची कोणती माहिती मिळाली, आणि पुढील वर्षी कोणते विषय हवेत?',
        },
        description: { en: 'Share thoughts in English, Hindi, or Marathi', hi: 'अपने विचार साझा करें', mr: 'आपले विचार कळवा' },
      },
    ],
  },

  Workshop: {
    id: 'Workshop',
    name: 'Workshops & Training Programs',
    icon: 'Laptop',
    description: 'Hands-on bootcamps, technical training, skill development, and masterclasses.',
    subcategories: [
      'Coding & Web Development',
      'AI, Machine Learning & Data Science',
      'Cybersecurity & Ethical Hacking',
      'UI/UX & Product Design',
      'Cloud Architecture & DevOps',
      'Leadership & Public Speaking',
      'Hardware & Robotics Lab',
    ],
    defaultQuestions: [
      {
        order: 1,
        type: 'star_rating',
        category: 'speaker',
        isRequired: true,
        prompt: {
          en: 'How would you rate the instructor clarity, knowledge, and explanation style?',
          hi: 'प्रशिक्षक की स्पष्टता, ज्ञान और समझाने की शैली को आप क्या रेटिंग देंगे?',
          mr: 'प्रशिक्षकांची शिकवण्याची पद्धत, स्पष्टता आणि ज्ञानाला आपण काय रेटिंग द्याल?',
        },
        description: { en: 'Pace, responsiveness to questions, and clarity', hi: 'सवालों के उत्तर और स्पष्टता', mr: 'प्रश्नांची उत्तरे आणि स्पष्टता' },
      },
      {
        order: 2,
        type: 'single_choice',
        category: 'content',
        isRequired: true,
        prompt: {
          en: 'How was the balance between theoretical concepts and hands-on exercises?',
          hi: 'सैद्धांतिक ज्ञान और व्यावहारिक (हैंड्स-ऑन) अभ्यास का संतुलन कैसा था?',
          mr: 'सैद्धांतिक संकल्पना आणि प्रत्यक्ष प्रात्यक्षिके (हँड्स-ऑन) यांचा ताळमेळ कसा होता?',
        },
        description: { en: 'Practical coding / building exercises', hi: 'व्यावहारिक अभ्यास', mr: 'प्रात्यक्षिक सराव' },
        options: [
          { id: 'opt_balanced', label: { en: 'Perfect balance of theory & practice', hi: 'सिद्धांत और अभ्यास का सटीक संतुलन', mr: 'सिद्धांत व प्रात्यक्षिकांचा योग्य तोल' } },
          { id: 'opt_more_hands_on', label: { en: 'Needed more hands-on coding time', hi: 'और व्यावहारिक अभ्यास की आवश्यकता थी', mr: 'आणखी प्रात्यक्षिक सरावाची गरज होती' } },
          { id: 'opt_too_fast', label: { en: 'Pace was too fast to follow along', hi: 'गति बहुत तेज थी', mr: 'वेग खूप जास्त होता' } },
        ],
      },
      {
        order: 3,
        type: 'star_rating',
        category: 'content',
        isRequired: true,
        prompt: {
          en: 'Rate the quality of learning resources, code repositories, and slide materials.',
          hi: 'अध्ययन सामग्री, कोड रिपॉजिटरी और स्लाइड की गुणवत्ता को रेट करें।',
          mr: 'अभ्यास साहित्य, कोड रेपॉजिटरी आणि सादरीकरणाच्या दर्जाचे मूल्यांकन करा.',
        },
        description: { en: '1 to 5 stars', hi: '1 से 5 स्टार', mr: '1 ते 5 स्टार' },
      },
      {
        order: 4,
        type: 'nps',
        category: 'overall',
        isRequired: true,
        prompt: {
          en: 'How likely are you to recommend our workshops to peers seeking upskilling?',
          hi: 'कौशल्य विकास चाहने वाले साथियों को हमारे कार्यशालाओं की सिफारिश करने की कितनी संभावना है?',
          mr: 'कौशल्य शिकू इच्छिणाऱ्या मित्रांना आमच्या कार्यशाळेची शिफारस करण्याची किती शक्यता आहे?',
        },
        description: { en: '0 to 10 scale', hi: '0 से 10', mr: '0 ते 10' },
      },
      {
        order: 5,
        type: 'long_text',
        category: 'overall',
        isRequired: false,
        prompt: {
          en: 'What specific project or skill did you learn, and what can we improve in future sessions?',
          hi: 'आपने कौन सा प्रोजेक्ट या कौशल सीखा, और भविष्य के सत्रों में हम क्या सुधार कर सकते हैं?',
          mr: 'आपण काय नवीन कौशल्य शिकलात, आणि पुढील सत्रांसाठी काय सुधारणा हवी?',
        },
        description: { en: 'Type or record voice feedback', hi: 'लिखें या आवाज रिकॉर्ड करें', mr: 'लिहा किंवा आवाज रेकॉर्ड करा' },
      },
    ],
  },

  Cultural: {
    id: 'Cultural',
    name: 'Cultural Events & Arts',
    icon: 'Sparkles',
    description: 'Drama, dance fests, fine arts, culinary festivals, and literature exhibitions.',
    subcategories: [
      'Drama & Theatre Production',
      'Classical & Folk Dance Fest',
      'Art & Photography Exhibition',
      'Literature & Poetry Meet',
      'Film Screening & Discussion',
      'Culinary & Food Festival',
      'Fashion & Heritage Show',
    ],
    defaultQuestions: [
      {
        order: 1,
        type: 'star_rating',
        category: 'content',
        isRequired: true,
        prompt: {
          en: 'How would you rate the artistic quality and creative performance?',
          hi: 'कलात्मक गुणवत्ता और रचनात्मक प्रस्तुतियों को आप क्या रेटिंग देंगे?',
          mr: 'कलात्मक दर्जा आणि सर्जनशील सादरीकरणाला आपण काय रेटिंग द्याल?',
        },
        description: { en: 'Stage decor, talent, and expression', hi: 'मंच सज्जा और प्रतिभा', mr: 'रंगमंच सजावट आणि कलागुण' },
      },
      {
        order: 2,
        type: 'star_rating',
        category: 'venue_logistics',
        isRequired: true,
        prompt: {
          en: 'Rate the venue ambience, seating arrangement, and audio/visual presentation.',
          hi: 'स्थल का माहौल, बैठने की व्यवस्था और दृश्य-श्रव्य प्रस्तुति को रेट करें।',
          mr: 'कार्यक्रमाचे वातावरण, आसन व्यवस्था आणि दृकश्राव्य सादरीकरणाचे मूल्यांकन करा.',
        },
        description: { en: '1 to 5 stars', hi: '1 से 5 स्टार', mr: '1 ते 5 स्टार' },
      },
      {
        order: 3,
        type: 'nps',
        category: 'overall',
        isRequired: true,
        prompt: {
          en: 'How likely are you to attend our future cultural events and recommend them?',
          hi: 'आप हमारे भविष्य के सांस्कृतिक कार्यक्रमों में शामिल होने की कितनी संभावना रखते हैं?',
          mr: 'आपण आमच्या पुढील सांस्कृतिक कार्यक्रमांना उपस्थित राहण्याची किती शक्यता आहे?',
        },
        description: { en: '0 to 10 scale', hi: '0 से 10', mr: '0 ते 10' },
      },
      {
        order: 4,
        type: 'long_text',
        category: 'overall',
        isRequired: false,
        prompt: {
          en: 'Which performance touched you most, and what can we do better next edition?',
          hi: 'कौन सी प्रस्तुति आपको सबसे अधिक भायी, और अगले संस्करण में हम क्या बेहतर कर सकते हैं?',
          mr: 'कोणते सादरीकरण सर्वाधिक मनाला भावले, आणि पुढील वेळी काय अधिक चांगले करता येईल?',
        },
        description: { en: 'Type or record voice feedback', hi: 'लिखें या बोलें', mr: 'लिहा किंवा बोला' },
      },
    ],
  },

  Corporate: {
    id: 'Corporate',
    name: 'Corporate & Business Events',
    icon: 'Briefcase',
    description: 'Town halls, annual general meetings, product launches, offsites, and partner meets.',
    subcategories: [
      'Product Launch & Demo Day',
      'Annual General Meeting (AGM)',
      'Company Town Hall & All-Hands',
      'Team Offsite & Retreat',
      'Client & Partner Summit',
      'Leadership Strategy Offsite',
      'Investor Day',
    ],
    defaultQuestions: [
      {
        order: 1,
        type: 'star_rating',
        category: 'content',
        isRequired: true,
        prompt: {
          en: 'How clearly were the key objectives, strategic updates, and roadmap communicated?',
          hi: 'मुख्य उद्देश्य, रणनीतिक अपडेट और रोडमैप कितने स्पष्ट रूप से संप्रेषित किए गए?',
          mr: 'प्रमुख उद्दिष्टे, धोरणात्मक निर्णय आणि पुढील दिशा किती स्पष्टपणे मांडली गेली?',
        },
        description: { en: 'Executive messaging and business clarity', hi: 'व्यावसायिक स्पष्टता', mr: 'स्पष्टता आणि अचूकता' },
      },
      {
        order: 2,
        type: 'star_rating',
        category: 'organization',
        isRequired: true,
        prompt: {
          en: 'How would you rate the event organization, schedule adherence, and venue facilities?',
          hi: 'कार्यक्रम संगठन, समय की पाबंदी और आयोजन स्थल की सुविधाओं को आप क्या रेटिंग देंगे?',
          mr: 'कार्यक्रमाचे नियोजन, वेळेचे पालन आणि आयोजन स्थळाच्या सुविधांना आपण काय रेटिंग द्याल?',
        },
        description: { en: '1 to 5 stars', hi: '1 से 5 स्टार', mr: '1 ते 5 स्टार' },
      },
      {
        order: 3,
        type: 'nps',
        category: 'overall',
        isRequired: true,
        prompt: {
          en: 'How energized and aligned do you feel with the company goals after this event?',
          hi: 'इस कार्यक्रम के बाद आप कंपनी के लक्ष्यों के साथ कितना जुड़ाव और ऊर्जा महसूस करते हैं?',
          mr: 'या कार्यक्रमानंतर आपण संस्थेच्या उद्दिष्टांशी किती प्रेरित व एकरूप वाटते?',
        },
        description: { en: '0 to 10 scale', hi: '0 से 10', mr: '0 ते 10' },
      },
      {
        order: 4,
        type: 'long_text',
        category: 'overall',
        isRequired: false,
        prompt: {
          en: 'What feedback or questions would you like to share with leadership?',
          hi: 'आप नेतृत्व (लीडरशिप) के साथ क्या प्रतिक्रिया या सवाल साझा करना चाहते हैं?',
          mr: 'आपण नेतृत्वासोबत काय प्रतिक्रिया किंवा प्रश्न मांडू इच्छिता?',
        },
        description: { en: 'Confidential feedback allowed', hi: 'गोपनीय सुझाव अनुमत', mr: 'गोपनीय प्रतिक्रिया देऊ शकता' },
      },
    ],
  },

  Charity: {
    id: 'Charity',
    name: 'Charity & Fundraising Events',
    icon: 'HeartHandshake',
    description: 'Benefit galas, donation drives, charity runs, NGO meets, and awareness campaigns.',
    subcategories: [
      'Charity Gala Dinner',
      'Fundraiser Walkathon / Run',
      'Benefit Art Auction',
      'Donation Drive & NGO Fair',
      'Youth Awareness Campaign',
      'Disaster Relief Fundraiser',
    ],
    defaultQuestions: [
      {
        order: 1,
        type: 'star_rating',
        category: 'content',
        isRequired: true,
        prompt: {
          en: 'How effectively was the cause, social impact, and fund utilization conveyed?',
          hi: 'उद्देश्य, सामाजिक प्रभाव और दान के उपयोग को कितने प्रभावी ढंग से प्रस्तुत किया गया?',
          mr: 'सामाजिक उद्दिष्ट, मदतनिधीचा वापर आणि प्रभाव किती प्रभावीपणे समजावून सांगितला?',
        },
        description: { en: 'Transparency and purpose clarity', hi: 'पारदर्शिता और स्पष्टता', mr: 'पारदर्शकता आणि स्पष्टता' },
      },
      {
        order: 2,
        type: 'star_rating',
        category: 'organization',
        isRequired: true,
        prompt: {
          en: 'Rate the volunteer support, donor welcome, and event coordination.',
          hi: 'स्वयंसेवकों का सहयोग, स्वागत और कार्यक्रम समन्वय को रेट करें।',
          mr: 'स्वयंसेवकांचे सहकार्य, स्वागत आणि कार्यक्रमाचे समन्वयाचे मूल्यांकन करा.',
        },
        description: { en: '1 to 5 stars', hi: '1 से 5 स्टार', mr: '1 ते 5 स्टार' },
      },
      {
        order: 3,
        type: 'nps',
        category: 'overall',
        isRequired: true,
        prompt: {
          en: 'How likely are you to continue supporting our foundation and attend future drives?',
          hi: 'आप हमारे फाउंडेशन का समर्थन जारी रखने और भविष्य के अभियानों में शामिल होने की कितनी संभावना रखते हैं?',
          mr: 'आपण आमच्या संस्थेला निरंतर पाठिंबा देण्याची आणि पुढील उपक्रमांत सहभागी होण्याची किती शक्यता आहे?',
        },
        description: { en: '0 to 10 scale', hi: '0 से 10', mr: '0 ते 10' },
      },
      {
        order: 4,
        type: 'long_text',
        category: 'overall',
        isRequired: false,
        prompt: {
          en: 'What inspired you most today, and how can we magnify the positive community impact?',
          hi: 'आज आपको किस बात ने सबसे अधिक प्रेरित किया, और हम समुदाय पर क्या सकारात्मक प्रभाव बढ़ा सकते हैं?',
          mr: 'आज आपल्याला कोणत्या गोष्टीने सर्वाधिक प्रेरणा दिली, आणि आपण समाजहितासाठी आणखी काय करू शकतो?',
        },
        description: { en: 'Type or record voice message', hi: 'संदेश साझा करें', mr: 'संदेश कळवा' },
      },
    ],
  },

  Community: {
    id: 'Community',
    name: 'Community & Public Events',
    icon: 'Users',
    description: 'Civic gatherings, street festivals, farmers markets, book fairs, and neighborhood fests.',
    subcategories: [
      'Street Festival & Carnival',
      'Farmers & Artisan Market',
      'Book Fair & Literature Fest',
      'Civic Town Hall & Public Hearing',
      'Neighborhood Gathering',
      'Eco & Green Earth Fair',
      'Open Mic & Talent Showcase',
    ],
    defaultQuestions: [
      {
        order: 1,
        type: 'star_rating',
        category: 'venue_logistics',
        isRequired: true,
        prompt: {
          en: 'How would you rate the overall accessibility, cleanliness, and public facilities?',
          hi: 'स्थल की पहुंच, स्वच्छता और सार्वजनिक सुविधाओं को आप क्या रेटिंग देंगे?',
          mr: 'कार्यक्रमाची सुलभता, स्वच्छता आणि सार्वजनिक सुविधांना आपण काय रेटिंग द्याल?',
        },
        description: { en: 'Restrooms, waste bins, parking, and transit access', hi: 'पार्किंग, स्वच्छता और सुविधाएं', mr: 'स्वच्छता, पार्किंग आणि सुविधा' },
      },
      {
        order: 2,
        type: 'star_rating',
        category: 'content',
        isRequired: true,
        prompt: {
          en: 'Rate the variety of stalls, community activities, and family-friendly atmosphere.',
          hi: 'स्टॉलों की विविधता, सामुदायिक गतिविधियों और पारिवारिक माहौल को रेट करें।',
          mr: 'स्टॉल्सची विविधता, सामूहिक उपक्रम आणि कौटुंबिक वातावरणाचे मूल्यांकन करा.',
        },
        description: { en: '1 to 5 stars', hi: '1 से 5 स्टार', mr: '1 ते 5 स्टार' },
      },
      {
        order: 3,
        type: 'nps',
        category: 'overall',
        isRequired: true,
        prompt: {
          en: 'How likely are you to return to our future community gatherings with friends and family?',
          hi: 'आप मित्रों और परिवार के साथ भविष्य के सामुदायिक आयोजनों में वापस आने की कितनी संभावना रखते हैं?',
          mr: 'आपण कुटुंब आणि मित्रांसह पुढील समाज मेळाव्यात पुन्हा सहभागी होण्याची किती शक्यता आहे?',
        },
        description: { en: '0 to 10 scale', hi: '0 से 10', mr: '0 ते 10' },
      },
      {
        order: 4,
        type: 'long_text',
        category: 'overall',
        isRequired: false,
        prompt: {
          en: 'What did you enjoy most, and what would make this public event even better next time?',
          hi: 'आपको सबसे ज्यादा क्या पसंद आया, और अगली बार इस आयोजन को और बेहतर बनाने के लिए क्या सुझाव हैं?',
          mr: 'आपल्याला काय सर्वाधिक आवडले, आणि पुढील वेळी हा उपक्रम अधिक चांगला करण्यासाठी काय सुचवाल?',
        },
        description: { en: 'Type or record voice message', hi: 'लिखें या बोलें', mr: 'लिहा किंवा बोला' },
      },
    ],
  },

  College: {
    id: 'College',
    name: 'Colleges & Academic Events',
    icon: 'GraduationCap',
    description: 'Hackathons, tech fests, inter-college competitions, orientations, and academic clubs.',
    subcategories: [
      'Hackathon & Coding Sprint',
      'Tech Fest & Project Expo',
      'Inter-College Cultural Fest',
      'Student Orientation & Induction',
      'Academic Seminar & Workshop',
      'College Annual Sports Meet',
      'Alumni Homecoming & Reunion',
    ],
    defaultQuestions: [
      {
        order: 1,
        type: 'star_rating',
        category: 'overall',
        isRequired: true,
        prompt: {
          en: 'How would you rate your overall experience at this college event?',
          hi: 'इस कॉलेज कार्यक्रम में आपका समग्र अनुभव कैसा रहा?',
          mr: 'या महाविद्यालयीन कार्यक्रमातील आपला एकंदर अनुभव कसा होता?',
        },
        description: { en: '1 to 5 stars', hi: '1 से 5 स्टार', mr: '1 ते 5 स्टार' },
      },
      {
        order: 2,
        type: 'single_choice',
        category: 'venue_logistics',
        isRequired: true,
        prompt: {
          en: 'How was the technical infrastructure, campus Wi-Fi, and power backup?',
          hi: 'तकनीकी बुनियादी ढांचा, कैंपस वाई-फाई और पावर बैकअप कैसा था?',
          mr: 'तांत्रिक सुविधा, कॅम्पस वाय-फाय आणि वीज बॅकअप कसा होता?',
        },
        description: { en: 'Connectivity, outlets, and lab accessibility', hi: 'कनेक्टिविटी और पावर', mr: 'कनेक्टिव्हिटी आणि वीज' },
        options: [
          { id: 'opt_stable', label: { en: 'Fast & uninterrupted connectivity', hi: 'तेज और निर्बाध कनेक्टिविटी', mr: 'वेगवान आणि अखंड कनेक्टिव्हिटी' } },
          { id: 'opt_intermittent', label: { en: 'Occasional network drops', hi: 'कभी-कभी नेटवर्क की रुकावट', mr: 'कधीतरी खंड पडत होता' } },
          { id: 'opt_poor', label: { en: 'Struggled with access & power points', hi: 'पावर और वाई-फाई में समस्या', mr: 'वाय-फाय आणि चार्जिंगमध्ये खूप अडचणी' } },
        ],
      },
      {
        order: 3,
        type: 'star_rating',
        category: 'speaker',
        isRequired: false,
        prompt: {
          en: 'Rate the mentorship support, problem statements, and judging clarity.',
          hi: 'मेंटरशिप सहायता, समस्या विवरण और मूल्यांकन की स्पष्टता को रेट करें।',
          mr: 'मार्गदर्शन, समस्या विधान आणि परीक्षण पारदर्शकतेचे मूल्यांकन करा.',
        },
        description: { en: '1 to 5 stars', hi: '1 से 5 स्टार', mr: '1 ते 5 स्टार' },
      },
      {
        order: 4,
        type: 'nps',
        category: 'overall',
        isRequired: true,
        prompt: {
          en: 'How likely are you to recommend our collegiate initiatives to fellow students?',
          hi: 'आप अन्य छात्रों को हमारे कॉलेज के कार्यक्रमों की सिफारिश करने की कितनी संभावना रखते हैं?',
          mr: 'आपण इतर विद्यार्थ्यांना आमच्या महाविद्यालयीन उपक्रमांची शिफारस करण्याची किती शक्यता आहे?',
        },
        description: { en: '0 to 10 scale', hi: '0 से 10', mr: '0 ते 10' },
      },
      {
        order: 5,
        type: 'long_text',
        category: 'overall',
        isRequired: false,
        prompt: {
          en: 'What did you like most, and what should the organizing committee improve next year?',
          hi: 'आपको क्या सबसे अच्छा लगा, और आयोजन समिति को अगले साल क्या सुधारना चाहिए?',
          mr: 'आपल्याला काय सर्वाधिक आवडले, आणि आयोजन समितीने पुढील वर्षी काय सुधारणा करावी?',
        },
        description: { en: 'Type or record voice feedback', hi: 'अंग्रेजी, हिंदी या मराठी में लिखें', mr: 'इंग्रजी, हिंदी किंवा मराठीत लिहा' },
      },
    ],
  },
};

/**
 * Get category configuration or default to Workshop
 */
export function getCategoryConfig(categoryName) {
  if (!categoryName) return EVENT_CATEGORIES.Workshop;

  // Case-insensitive match or substring match
  const normalized = categoryName.trim().toLowerCase();
  for (const [key, config] of Object.entries(EVENT_CATEGORIES)) {
    if (
      key.toLowerCase() === normalized ||
      config.name.toLowerCase() === normalized ||
      normalized.includes(key.toLowerCase()) ||
      config.name.toLowerCase().includes(normalized)
    ) {
      return config;
    }
  }

  // Fallback
  return EVENT_CATEGORIES.Workshop;
}

/**
 * Validate whether a category exists
 */
export function isValidCategory(categoryName) {
  if (!categoryName) return false;
  const normalized = categoryName.trim().toLowerCase();
  return Object.entries(EVENT_CATEGORIES).some(
    ([key, config]) =>
      key.toLowerCase() === normalized ||
      config.name.toLowerCase() === normalized ||
      normalized.includes(key.toLowerCase()) ||
      config.name.toLowerCase().includes(normalized)
  );
}

/**
 * Get all available subcategories for a category
 */
export function getSubcategoriesForCategory(categoryName) {
  const config = getCategoryConfig(categoryName);
  return config?.subcategories || [];
}

/**
 * Get all registered category names
 */
export function getAllCategoryNames() {
  return Object.values(EVENT_CATEGORIES).map((c) => c.name);
}

/**
 * Get default tailored questions for a category & subcategory
 */
export function getDefaultQuestionsForCategory(categoryName, subcategory = '') {
  const config = getCategoryConfig(categoryName);
  return (config.defaultQuestions || []).map((q, idx) => ({
    ...q,
    order: idx + 1,
  }));
}
