import { bhashiniService } from '../services/bhashiniService.js';

export const getIntegrationStatus = async (req, res, next) => {
  try {
    const status = bhashiniService.getIntegrationStatus();
    res.json({ success: true, integration: status });
  } catch (err) {
    next(err);
  }
};

export const translateText = async (req, res, next) => {
  try {
    const { sourceText, sourceLanguage, targetLanguage = 'en' } = req.body;
    if (!sourceText) {
      return res.status(400).json({ success: false, message: 'sourceText is required' });
    }

    const result = await bhashiniService.translateText({
      sourceText,
      sourceLanguage: sourceLanguage || 'hi',
      targetLanguage,
    });

    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
};

export const transcribeAudio = async (req, res, next) => {
  try {
    const { base64Audio, language = 'hi', audioFormat = 'wav' } = req.body;
    if (!base64Audio) {
      return res.status(400).json({ success: false, message: 'base64Audio string is required' });
    }

    const result = await bhashiniService.transcribeAudio({
      base64Audio,
      language,
      audioFormat,
    });

    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
};
