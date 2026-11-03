import { test, describe, before, after } from 'node:test';
import assert from 'node:assert';
import request from 'supertest';
import app from '../src/app.js';
import { connectDB, disconnectDB } from '../src/config/db.js';

describe('InsightLoop Backend API Suite', () => {
  let authToken = '';
  let eventId = '';
  let formId = '';

  before(async () => {
    await connectDB();
  });

  after(async () => {
    await disconnectDB();
  });

  test('GET /api/health returns 200 and healthy status', async () => {
    const res = await request(app).get('/api/health');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.status, 'healthy');
  });

  test('POST /api/auth/login succeeds with valid credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'organizer@mitpune.edu',
        password: 'Password123!',
      });

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.ok(res.body.token);
    assert.strictEqual(res.body.user.role, 'host');
    authToken = res.body.token;
  });

  test('GET /api/events returns seeded events', async () => {
    const res = await request(app)
      .get('/api/events')
      .set('Authorization', `Bearer ${authToken}`);

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.ok(res.body.events.length > 0);
    eventId = res.body.events[0]._id;
  });

  test('GET /api/events/code/HACK-2026 allows public access without token', async () => {
    const res = await request(app).get('/api/events/code/HACK-2026');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.strictEqual(res.body.event.code, 'HACK-2026');
    assert.ok(res.body.form);
    assert.ok(res.body.questions.length > 0);
  });

  test('POST /api/feedback/submit processes multilingual participant response', async () => {
    const publicEvent = await request(app).get('/api/events/code/HACK-2026');
    const questions = publicEvent.body.questions;

    const res = await request(app)
      .post('/api/feedback/submit')
      .send({
        eventCode: 'HACK-2026',
        submissionLanguage: 'mr',
        isAnonymous: false,
        participantName: 'Test Participant',
        participantEmail: 'test@example.com',
        answers: [
          {
            questionId: questions[0]._id,
            ratingValue: 5,
          },
          {
            questionId: questions[1]._id,
            ratingValue: 10,
          },
          {
            questionId: questions[3]._id,
            textResponse: 'उत्कृष्ट आयोजन! सर्व काही वेळेवर होते.',
          },
        ],
      });

    assert.strictEqual(res.status, 201);
    assert.strictEqual(res.body.success, true);
    assert.ok(res.body.responseId);
  });

  test('GET /api/bhashini/status returns provider info and configured state', async () => {
    const res = await request(app).get('/api/bhashini/status');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.ok(res.body.integration);
    assert.ok(Array.isArray(res.body.integration.supportedLanguages));
  });

  test('GET /api/ai/events/:eventId/analysis returns synthesized intelligence', async () => {
    const res = await request(app)
      .get(`/api/ai/events/${eventId}/analysis`)
      .set('Authorization', `Bearer ${authToken}`);

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    if (res.body.analysis) {
      assert.ok(res.body.analysis.sentimentSummary);
      assert.ok(Array.isArray(res.body.analysis.themes));
    }
  });

  test('GET /api/tasks lists organization improvement tasks', async () => {
    const res = await request(app)
      .get('/api/tasks')
      .set('Authorization', `Bearer ${authToken}`);

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.ok(Array.isArray(res.body.tasks));
  });
});
