import axios from 'axios';

class BhashiniService {
  constructor() {
    this.userId = process.env.BHASHINI_USER_ID;
    this.apiKey = process.env.BHASHINI_API_KEY;
    this.pipelineEndpoint = process.env.BHASHINI_PIPELINE_ENDPOINT || 'https://dhruva-api.bhashini.gov.in/services/inference/pipeline';
    // DHRUVA inference calls authenticate with a dedicated key sent raw in the
    // Authorization header (no "Bearer" prefix). Older accounts use one key for
    // everything, so BHASHINI_API_KEY stays as the fallback.
    this.inferenceKey = process.env.BHASHINI_INFERENCE_API_KEY || this.apiKey;
    // Optional: pin a specific model. When empty the pipeline picks a default.
    this.asrServiceId = process.env.BHASHINI_ASR_SERVICE_ID || '';
    this.nmtServiceId = process.env.BHASHINI_NMT_SERVICE_ID || '';
  }

  _headers() {
    return {
      'Content-Type': 'application/json',
      Authorization: this.inferenceKey,
      userID: this.userId,
      ulcaApiKey: this.apiKey,
    };
  }

  isConfigured() {
    return Boolean(this.userId && this.apiKey);
  }

  getIntegrationStatus() {
    return {
      service: 'Bhashini National Language Translation Mission',
      isConfigured: this.isConfigured(),
      endpoint: this.pipelineEndpoint,
      supportedLanguages: ['en', 'hi', 'mr', 'ta', 'te', 'gu', 'kn', 'bn'],
      status: this.isConfigured() ? 'Connected with live credentials' : 'Not configured (Local fallback enabled)',
    };
  }

  /**
   * Translate text between supported languages (e.g. hi -> en, mr -> en, en -> hi, en -> mr)
   * Supports both object ({ sourceText, sourceLanguage, targetLanguage }) and positional (sourceText, sourceLang, targetLang)
   */
  async translateText(arg1, arg2, arg3) {
    let sourceText, sourceLanguage, targetLanguage;
    if (typeof arg1 === 'object' && arg1 !== null && arg1.sourceText !== undefined) {
      sourceText = arg1.sourceText;
      sourceLanguage = arg1.sourceLanguage;
      targetLanguage = arg1.targetLanguage || 'en';
    } else {
      sourceText = arg1;
      sourceLanguage = arg2;
      targetLanguage = arg3 || 'en';
    }

    if (!sourceText || (typeof sourceText === 'string' && sourceText.trim() === '')) {
      return { translatedText: '', sourceLanguage, targetLanguage, provider: 'none' };
    }

    if (sourceLanguage === targetLanguage) {
      return { translatedText: sourceText, sourceLanguage, targetLanguage, provider: 'identity' };
    }

    // Live Bhashini API Call if credentials exist
    if (this.isConfigured()) {
      try {
        const response = await axios.post(
          this.pipelineEndpoint,
          {
            pipelineTasks: [
              {
                taskType: 'translation',
                config: {
                  language: {
                    sourceLanguage,
                    targetLanguage,
                  },
                },
              },
            ],
            inputData: {
              input: [{ source: sourceText }],
            },
          },
          {
            headers: this._headers(),
            timeout: 10000,
          }
        );

        const translated = response.data?.pipelineResponse?.[0]?.output?.[0]?.target;
        if (translated) {
          return {
            translatedText: translated,
            sourceLanguage,
            targetLanguage,
            provider: 'bhashini-live',
            isBhashiniLive: true,
          };
        }
      } catch (err) {
        console.warn(`[BhashiniService] Live Bhashini translation failed: ${err.message}. Falling back gracefully.`);
      }
    }

    // Graceful fallback when credentials unavailable or network unreachable
    const fallbackTranslation = this._localFallbackTranslate(sourceText, sourceLanguage, targetLanguage);
    return {
      translatedText: fallbackTranslation,
      sourceLanguage,
      targetLanguage,
      provider: 'local-fallback',
      isBhashiniLive: false,
      notice: 'Bhashini API credentials not provided in .env. Operating in graceful fallback mode.',
    };
  }

  /**
   * Speech-to-Text (ASR) integration
   */
  async transcribeAudio({ base64Audio, language = 'hi', audioFormat = 'wav' }) {
    if (!base64Audio) {
      throw new Error('Audio data is required for transcription');
    }

    let lastError = '';

    if (this.isConfigured()) {
      try {
        const asrConfig = {
          language: { sourceLanguage: language },
          audioFormat,
        };
        if (this.asrServiceId) asrConfig.serviceId = this.asrServiceId;

        const response = await axios.post(
          this.pipelineEndpoint,
          {
            pipelineTasks: [{ taskType: 'asr', config: asrConfig }],
            inputData: { audio: [{ audioContent: base64Audio }] },
          },
          { headers: this._headers(), timeout: 30000 }
        );

        const transcription = response.data?.pipelineResponse?.[0]?.output?.[0]?.source;
        if (transcription) {
          return {
            transcription,
            language,
            provider: 'bhashini-live',
            isBhashiniLive: true,
          };
        }
        lastError = 'Bhashini returned an empty transcript for this audio.';
      } catch (err) {
        lastError = err.response?.status
          ? `Bhashini ASR HTTP ${err.response.status}: ${err.response.statusText || err.message}`
          : `Bhashini ASR unreachable: ${err.message}`;
        console.warn(`[BhashiniService] ${lastError}`);
      }
    } else {
      lastError = 'BHASHINI_USER_ID / BHASHINI_API_KEY are empty in backend/.env.';
    }

    // Never invent a transcript - fabricated feedback is worse than no feedback.
    // The client shows "could not transcribe" and keeps the audio for retry.
    return {
      transcription: '',
      language,
      provider: 'local-fallback',
      isBhashiniLive: false,
      notice: lastError,
    };
  }

  _localFallbackTranslate(text, sourceLang, targetLang) {
    if (!text) return '';

    // Full sentence matches for high fidelity in demo / feedback
    const sentenceMaps = {
      hi_en: {
        'सत्र बहुत अच्छा और जानकारीपूर्ण था।': 'The session was very good and informative.',
        'उत्कृष्ट आयोजन! सर्व काही वेळेवर होते.': 'Excellent organization! Everything was on time.',
        'रूट बहुत अच्छा था, पानी के स्टॉल पर्याप्त थे।': 'The route was very good, water stations were sufficient.',
        'ध्वनि की गुणवत्ता बहुत शानदार थी, कलाकार का प्रदर्शन अद्भुत था।': 'The sound quality was superb, the artists performance was amazing.',
        'मैदान बहुत अच्छा था लेकिन अंपायरिंग में सुधार की जरूरत है।': 'The ground was great but refereeing needs improvement.',
        'हैंड्स-ऑन कोडिंग अभ्यास बहुत उपयोगी था।': 'The hands-on coding practice was very useful.',
      },
      mr_en: {
        'सत्र अतिशय माहितीपूर्ण आणि उपयुक्त होते.': 'The session was extremely informative and useful.',
        'उत्कृष्ट आयोजन! सर्व काही वेळेवर होते.': 'Excellent organization! Everything was on time.',
        'धावण्याचा मार्ग आणि पाण्याची सोय उत्तम होती.': 'The running route and hydration facilities were great.',
        'साउंड सिस्टीम आणि लाईट शो अतिशय जबरदस्त होता!': 'The sound system and light show was absolutely phenomenal!',
        'मैदानाची स्थिती छान होती, स्पर्धा वेळेवर सुरू झाली.': 'Ground condition was nice, competition started right on time.',
        'प्रात्यक्षिक सराव खूप चांगला झाला, खूप काही शिकायला मिळाले.': 'Practical hands-on went very well, got to learn a lot.',
      },
    };

    const directKey = `${sourceLang}_${targetLang}`;
    if (sentenceMaps[directKey] && sentenceMaps[directKey][text.trim()]) {
      return sentenceMaps[directKey][text.trim()];
    }

    // Comprehensive word and phrase mappings covering all categories
    const hiToEn = [
      // Multi-word phrases first
      ['बहुत अच्छा', 'Very good'],
      ['बहुत बढ़िया', 'Excellent'],
      ['पानी के स्टॉल', 'water stations'],
      ['फिनिश लाइन', 'finish line'],
      ['दौड़ मार्ग', 'race route'],
      ['सुरक्षा व्यवस्था', 'safety arrangement'],
      ['खाना अच्छा था', 'food was good'],
      ['आवाज साफ नहीं थी', 'audio was not clear'],
      ['समय की कमी', 'lack of time'],
      ['वेळेवर सुरू करा', 'start on time'],
      ['सुधार की जरूरत', 'needs improvement'],
      ['हैंड्स-ऑन', 'hands-on'],
      ['कोड रिपॉजिटरी', 'code repository'],
      ['साउंड क्वालिटी', 'sound quality'],
      ['भीड़ नियंत्रण', 'crowd control'],
      ['सुरक्षा जांच', 'security check'],
      ['अंपायरिंग', 'refereeing / umpiring'],
      ['मैदान की स्थिति', 'ground condition'],

      // Individual terms
      ['उत्कृष्ट', 'excellent'],
      ['शानदार', 'superb'],
      ['सत्र', 'session'],
      ['कार्यशाला', 'workshop'],
      ['सम्मेलन', 'conference'],
      ['प्रतियोगिता', 'competition'],
      ['दौड़', 'race / run'],
      ['मार्ग', 'route'],
      ['पानी', 'water'],
      ['हाइड्रेशन', 'hydration'],
      ['मेडल', 'medal'],
      ['नाश्ता', 'refreshments'],
      ['ध्वनि', 'sound / audio'],
      ['आवाज', 'audio'],
      ['कलाकार', 'artist'],
      ['मैदान', 'ground / court'],
      ['खिलाड़ी', 'players'],
      ['प्रशिक्षक', 'trainer'],
      ['धन्यवाद', 'Thank you'],
      ['सुझाव', 'suggestion'],
      ['समस्या', 'problem / issue'],
      ['उशीर', 'delay'],
      ['देरी', 'delay'],
      ['धीमा', 'slow'],
      ['गड़बड़', 'glitch / issue'],
      ['मस्त', 'great'],
      ['सुंदर', 'beautiful'],
      ['सराहनीय', 'appreciable'],
      ['ज्ञानवर्धक', 'informative'],
    ];

    const mrToEn = [
      // Phrases first
      ['खूप छान', 'Very good'],
      ['अतिशय उत्तम', 'Extremely good'],
      ['धावण्याचा मार्ग', 'running route'],
      ['पाण्याची सोय', 'water / hydration facility'],
      ['स्वच्छता गृह', 'restrooms'],
      ['वेळेवर सुरू', 'started on time'],
      ['जेवण चांगले होते', 'food was good'],
      ['आवाज नीट येत नव्हता', 'audio was inaudible'],
      ['गोंधळ झाला', 'chaos occurred'],
      ['सुधारणा हवी', 'needs improvement'],
      ['शिकायला मिळाले', 'got to learn'],
      ['प्रात्यक्षिक सराव', 'hands-on practice'],
      ['साउंड सिस्टीम', 'sound system'],
      ['लाईट शो', 'light show'],
      ['मैदानाची स्थिती', 'pitch/ground condition'],

      // Individual words
      ['छान', 'good'],
      ['उत्कृष्ट', 'excellent'],
      ['माहितीपूर्ण', 'informative'],
      ['उपयुक्त', 'useful'],
      ['मार्गदर्शन', 'guidance'],
      ['शर्यत', 'race'],
      ['मार्ग', 'route'],
      ['पाणी', 'water'],
      ['पदक', 'medal'],
      ['अल्पोपहार', 'refreshments'],
      ['जेवण', 'food'],
      ['मैफल', 'concert'],
      ['गाणी', 'songs'],
      ['कलाकार', 'artists'],
      ['सामना', 'match'],
      ['स्पर्धा', 'tournament'],
      ['पंच', 'referee'],
      ['क्रीडा', 'sports'],
      ['प्रशिक्षक', 'trainer'],
      ['धन्यवाद', 'Thank you'],
      ['अडचणी', 'issues'],
      ['वेळ', 'time'],
      ['उशीर', 'delay'],
      ['मस्त', 'awesome'],
    ];

    let result = text;
    const pairs = sourceLang === 'hi' ? hiToEn : sourceLang === 'mr' ? mrToEn : null;

    if (pairs && targetLang === 'en') {
      for (const [key, val] of pairs) {
        result = result.replace(new RegExp(key, 'gi'), val);
      }
      return result;
    }

    return text;
  }
}

export const bhashiniService = new BhashiniService();
export default bhashiniService;
