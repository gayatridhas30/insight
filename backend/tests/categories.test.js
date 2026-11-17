import { test, describe } from 'node:test';
import assert from 'node:assert';
import {
  EVENT_CATEGORIES,
  getDefaultQuestionsForCategory,
  isValidCategory,
  getSubcategoriesForCategory,
  getAllCategoryNames,
} from '../src/config/eventCategories.js';
import bhashiniService from '../src/services/bhashiniService.js';
import aiService from '../src/services/aiService.js';

describe('Universal Event Categories & Config Tests', () => {
  const categoryKeys = Object.keys(EVENT_CATEGORIES);

  test('All 10 universal event categories are defined with subcategories', () => {
    assert.strictEqual(categoryKeys.length, 10, 'Must define exactly 10 universal event categories');

    categoryKeys.forEach((key) => {
      const catConfig = EVENT_CATEGORIES[key];
      assert.ok(catConfig.name, `Missing name for category ${key}`);
      assert.ok(isValidCategory(key), `isValidCategory failed for key: ${key}`);
      assert.ok(isValidCategory(catConfig.name), `isValidCategory failed for name: ${catConfig.name}`);

      const subs = getSubcategoriesForCategory(catConfig.name);
      assert.ok(Array.isArray(subs) && subs.length > 0, `Subcategories empty for: ${catConfig.name}`);
    });
  });

  test('Dynamic default questions generate trilingual questions for every category', () => {
    categoryKeys.forEach((key) => {
      const catConfig = EVENT_CATEGORIES[key];
      const questions = getDefaultQuestionsForCategory(catConfig.name);
      assert.ok(Array.isArray(questions) && questions.length >= 4, `Questions missing for: ${catConfig.name}`);

      questions.forEach((q) => {
        assert.ok(q.prompt?.en, `Missing English prompt for category ${key}`);
        assert.ok(q.prompt?.hi, `Missing Hindi prompt for category ${key}`);
        assert.ok(q.prompt?.mr, `Missing Marathi prompt for category ${key}`);
        assert.ok(q.type, 'Missing question type');
      });
    });
  });

  test('Subcategory specific tailored questions for Marathons & Concerts', () => {
    const marathonQuestions = getDefaultQuestionsForCategory('Marathons & Running', 'Full Marathon');
    assert.ok(marathonQuestions.length >= 4);
    const marathonText = JSON.stringify(marathonQuestions).toLowerCase();
    assert.ok(
      marathonText.includes('route') || marathonText.includes('hydration') || marathonText.includes('water') || marathonText.includes('safety'),
      'Marathon questions must evaluate race route or safety'
    );

    const concertQuestions = getDefaultQuestionsForCategory('Concerts & Music Festivals', 'DJ Night');
    assert.ok(concertQuestions.length >= 4);
    const concertText = JSON.stringify(concertQuestions).toLowerCase();
    assert.ok(
      concertText.includes('sound') || concertText.includes('audio') || concertText.includes('stage') || concertText.includes('crowd'),
      'Concert questions must evaluate sound or crowd management'
    );
  });

  test('Bhashini Local Fallback handles universal event vocabularies (Hindi & Marathi)', async () => {
    const hindiMarathon = 'दौड़ मार्ग बहुत अच्छा था लेकिन पानी कम था।';
    const res1 = await bhashiniService.translateText(hindiMarathon, 'hi', 'en');
    const translation1 = res1.translatedText;
    assert.ok(
      translation1.toLowerCase().includes('route') || translation1.toLowerCase().includes('water'),
      `Hindi marathon translation missing keywords: "${translation1}"`
    );

    const marathiConcert = 'आवाज आणि संगीत उत्कृष्ट होते!';
    const res2 = await bhashiniService.translateText(marathiConcert, 'mr', 'en');
    const translation2 = res2.translatedText;
    assert.ok(
      translation2.toLowerCase().includes('sound') || translation2.toLowerCase().includes('music') || translation2.toLowerCase().includes('excellent') || translation2.toLowerCase().includes('good'),
      `Marathi concert translation missing keywords: "${translation2}"`
    );
  });

  test('Fallback AI Analyzer generates category-tailored themes and recommendations', async () => {
    const marathonSample = [
      { text: 'Water station at kilometer 7 had run out of hydration drinks.', rating: 2 },
      { text: 'The route was clearly marked and medical support was great.', rating: 5 },
      { text: 'Finish line medal collection was crowded.', rating: 3 },
    ];

    const marathonAnalysis = await aiService._fallbackAnalyze({
      responses: marathonSample,
      eventCategory: 'Marathons & Running',
      eventSubcategory: '10K Run',
    });

    assert.ok(marathonAnalysis.sentimentSummary);
    assert.ok(marathonAnalysis.recommendations.length > 0);
    const recText = JSON.stringify(marathonAnalysis.recommendations).toLowerCase();
    assert.ok(
      recText.includes('hydration') || recText.includes('water') || recText.includes('route') || recText.includes('medical') || recText.includes('finish'),
      `Expected marathon recommendations, got: ${recText}`
    );
  });
});
