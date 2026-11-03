import axios from 'axios';

class BhashiniService {
  constructor() {
    this.userId = process.env.BHASHINI_USER_ID;
    this.apiKey = process.env.BHASHINI_API_KEY;
    this.pipelineEndpoint = process.env.BHASHINI_PIPELINE_ENDPOINT || 'https://dhruva-api.bhashini.gov.in/services/inference/pipeline';
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
      status: this.isConfigured() ? 'Connected with live credentials' : 'Not configured (Local fallback enabled)'
    };
  }

  /**
   * Translate text between supported languages (e.g. hi -> en, mr -> en, en -> hi, en -> mr)
   */
  async translateText({ sourceText, sourceLanguage, targetLanguage = 'en' }) {
    if (!sourceText || sourceText.trim() === '') {
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
            headers: {
              'Content-Type': 'application/json',
              'userID': this.userId,
              'ulcaApiKey': this.apiKey,
            },
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
    // Maintain documentation integrity: Never claim this is live Bhashini
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

    if (this.isConfigured()) {
      try {
        const response = await axios.post(
          this.pipelineEndpoint,
          {
            pipelineTasks: [
              {
                taskType: 'asr',
                config: {
                  language: {
                    sourceLanguage: language,
                  },
                  audioFormat,
                },
              },
            ],
            inputData: {
              audio: [{ audioContent: base64Audio }],
            },
          },
          {
            headers: {
              'Content-Type': 'application/json',
              'userID': this.userId,
              'ulcaApiKey': this.apiKey,
            },
            timeout: 15000,
          }
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
      } catch (err) {
        console.warn(`[BhashiniService] Live Bhashini ASR failed: ${err.message}.`);
      }
    }

    // Fallback notice
    return {
      transcription: language === 'hi' ? 'सत्र बहुत अच्छा और जानकारीपूर्ण था।' : language === 'mr' ? 'सत्र अतिशय माहितीपूर्ण आणि उपयुक्त होते.' : 'The session was well organized and very informative.',
      language,
      provider: 'local-fallback',
      isBhashiniLive: false,
      notice: 'Bhashini API credentials not configured in environment. Please provide BHASHINI_USER_ID and BHASHINI_API_KEY in .env for live ASR.',
    };
  }

  _localFallbackTranslate(text, sourceLang, targetLang) {
    // Basic dictionary map for common multilingual feedback words
    const hiToEn = {
      'बहुत अच्छा': 'Very good',
      'सत्र': 'session',
      'उत्कृष्ट': 'excellent',
      'खाना अच्छा था': 'The food was good',
      'आवाज साफ नहीं थी': 'Audio was not clear',
      'समय की कमी': 'Lack of time',
      'धन्यवाद': 'Thank you',
      'सुझाव': 'suggestion',
      'कार्यशाला': 'workshop',
    };

    const mrToEn = {
      'छान': 'nice',
      'खूप छान': 'very good',
      'उत्कृष्ट': 'excellent',
      'माहितीपूर्ण': 'informative',
      'जेवण चांगले होते': 'Food was good',
      'आवाज नीट येत नव्हता': 'Audio was inaudible',
      'वेळेवर सुरू करा': 'Start on time',
      'धन्यवाद': 'Thank you',
    };

    let result = text;
    const dict = sourceLang === 'hi' ? hiToEn : sourceLang === 'mr' ? mrToEn : null;

    if (dict && targetLang === 'en') {
      for (const [key, val] of Object.entries(dict)) {
        result = result.replace(new RegExp(key, 'g'), val);
      }
      return result;
    }

    return text;
  }
}

export const bhashiniService = new BhashiniService();
