import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Sliders,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Sparkles,
  Eye,
  Save,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Settings,
  Languages,
  Mic,
  Calendar,
  RefreshCw,
  ArrowLeft,
} from 'lucide-react';
import { formService, eventService } from '../../api/services';
import { StarRating } from '../../components/feedback/StarRating';
import { NPSRating } from '../../components/feedback/NPSRating';

export const FormBuilderPage = () => {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [form, setForm] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState('builder'); // 'builder' | 'preview' | 'settings'
  const [aiGenerating, setAiGenerating] = useState(false);

  useEffect(() => {
    fetchFormData();
  }, [id]);

  const fetchFormData = async () => {
    try {
      setLoading(true);
      const [evtRes, formRes] = await Promise.all([
        eventService.getEventById(id),
        formService.getFormByEventId(id),
      ]);

      if (evtRes.data?.success) setEvent(evtRes.data.event);
      if (formRes.data?.success) {
        setForm(formRes.data.form);
        setQuestions(formRes.data.questions || []);
      }
    } catch (err) {
      console.warn('Form fetch error:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const addQuestion = (type = 'star_rating') => {
    const newQ = {
      _id: `temp_${Date.now()}`,
      order: questions.length + 1,
      type,
      category: 'overall',
      isRequired: true,
      prompt: {
        en: type === 'star_rating' ? 'How would you rate this session?' : type === 'nps' ? 'How likely are you to recommend us?' : 'Please provide your feedback',
        hi: '',
        mr: '',
      },
      description: { en: '', hi: '', mr: '' },
      options:
        type === 'single_choice' || type === 'multi_choice'
          ? [
              { id: 'opt_1', label: { en: 'Option 1', hi: '', mr: '' } },
              { id: 'opt_2', label: { en: 'Option 2', hi: '', mr: '' } },
            ]
          : [],
    };
    setQuestions([...questions, newQ]);
  };

  const removeQuestion = (index) => {
    const updated = questions.filter((_, idx) => idx !== index);
    setQuestions(updated);
  };

  const moveQuestion = (index, direction) => {
    const targetIdx = index + direction;
    if (targetIdx < 0 || targetIdx >= questions.length) return;
    const reordered = [...questions];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(targetIdx, 0, moved);
    setQuestions(reordered);
  };

  const updateQuestionField = (index, field, value) => {
    const updated = [...questions];
    updated[index][field] = value;
    setQuestions(updated);
  };

  const updateQuestionPrompt = (index, lang, value) => {
    const updated = [...questions];
    updated[index].prompt = {
      ...updated[index].prompt,
      [lang]: value,
    };
    setQuestions(updated);
  };

  const addOptionToQuestion = (qIndex) => {
    const updated = [...questions];
    const opts = updated[qIndex].options || [];
    opts.push({
      id: `opt_${Date.now()}`,
      label: { en: `New Option ${opts.length + 1}`, hi: '', mr: '' },
    });
    updated[qIndex].options = opts;
    setQuestions(updated);
  };

  const removeOptionFromQuestion = (qIndex, oIndex) => {
    const updated = [...questions];
    updated[qIndex].options = updated[qIndex].options.filter((_, idx) => idx !== oIndex);
    setQuestions(updated);
  };

  const handleSaveQuestions = async () => {
    setSaving(true);
    setSaveSuccess(false);
    try {
      await formService.saveQuestions(id, questions);
      if (form) {
        await formService.updateSettings(id, form);
      }
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      alert('Failed to save questions');
    } finally {
      setSaving(false);
    }
  };

  const handleAIAssistedGenerate = async () => {
    setAiGenerating(true);
    try {
      const res = await formService.generateAIQuestions(id);
      if (res.data?.suggestedQuestions) {
        setQuestions(res.data.suggestedQuestions);
        setSaveSuccess(true);
      }
    } catch (err) {
      alert('AI Form generation notice: ' + err.message);
    } finally {
      setAiGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-sm font-semibold text-navy">
        <RefreshCw size={20} className="animate-spin text-coral mr-2" />
        <span>Loading dynamic form builder...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn max-w-5xl mx-auto">
      {/* Top Breadcrumb & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <Link
            to={`/events/${id}`}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-charcoal/60 hover:text-navy transition-colors mb-1"
          >
            <ArrowLeft size={14} />
            <span>Back to Event Details</span>
          </Link>
          <h1 className="text-2xl font-heading font-extrabold text-navy">
            Feedback Form Builder
          </h1>
          <p className="text-xs text-charcoal/60">
            {event?.title} ({event?.code})
          </p>
        </div>

        {/* Tab switchers + Save Button */}
        <div className="flex items-center gap-2">
          <div className="bg-white p-1 rounded-xl border border-charcoal/10 flex items-center shadow-subtle">
            <button
              onClick={() => setActiveTab('builder')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'builder' ? 'bg-navy text-white' : 'text-charcoal/70 hover:text-navy'
              }`}
            >
              Builder
            </button>
            <button
              onClick={() => setActiveTab('preview')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                activeTab === 'preview' ? 'bg-navy text-white' : 'text-charcoal/70 hover:text-navy'
              }`}
            >
              <Eye size={13} />
              <span>Preview</span>
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                activeTab === 'settings' ? 'bg-navy text-white' : 'text-charcoal/70 hover:text-navy'
              }`}
            >
              <Settings size={13} />
              <span>Settings</span>
            </button>
          </div>

          <button
            onClick={handleSaveQuestions}
            disabled={saving}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-coral hover:bg-coral-hover text-white text-xs font-bold shadow-coral-glow transition-all active:scale-95 disabled:opacity-50"
          >
            {saving ? <RefreshCw size={14} className="animate-spin" /> : <Save size={14} />}
            <span>{saving ? 'Saving...' : 'Save Form'}</span>
          </button>
        </div>
      </div>

      {saveSuccess && (
        <div className="p-3.5 rounded-2xl bg-sage/20 border border-sage-dark/30 text-sage-dark text-xs font-bold flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 size={16} />
          <span>Form questions and configurations saved successfully!</span>
        </div>
      )}

      {/* AI Assistance Action Card */}
      {activeTab === 'builder' && (
        <div className="bg-gradient-to-r from-navy via-navy-800 to-navy-700 rounded-3xl p-6 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-card">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-coral text-xs font-bold uppercase tracking-wider">
              <Sparkles size={14} />
              <span>AI-Assisted Form Generation</span>
            </div>
            <h3 className="text-base font-bold text-white">Auto-generate category questions</h3>
            <p className="text-xs text-white/70 max-w-xl">
              InsightLoop analyzes your event title ("{event?.title}") and category ({event?.category}) to tailor star ratings, NPS, and trilingual questions.
            </p>
          </div>

          <button
            type="button"
            onClick={handleAIAssistedGenerate}
            disabled={aiGenerating}
            className="px-5 py-2.5 rounded-xl bg-coral hover:bg-coral-hover text-white text-xs font-bold shadow-coral-glow transition-all active:scale-95 shrink-0 flex items-center gap-2"
          >
            {aiGenerating ? <RefreshCw size={14} className="animate-spin" /> : <Sparkles size={14} />}
            <span>{aiGenerating ? 'Synthesizing...' : 'Generate with AI'}</span>
          </button>
        </div>
      )}

      {/* BUILDER TAB */}
      {activeTab === 'builder' && (
        <div className="space-y-4">
          <div className="space-y-4">
            {questions.map((q, idx) => (
              <div
                key={q._id || idx}
                className="bg-white rounded-3xl p-6 border border-charcoal/10 shadow-subtle space-y-4 hover:border-charcoal/20 transition-all"
              >
                {/* Question Toolbar */}
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-charcoal/10">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-coral bg-coral/10 px-2 py-0.5 rounded-lg font-mono">
                      Q{idx + 1}
                    </span>
                    <select
                      value={q.type}
                      onChange={(e) => updateQuestionField(idx, 'type', e.target.value)}
                      className="px-3 py-1 rounded-lg border border-charcoal/15 bg-ivory text-xs font-bold text-navy"
                    >
                      <option value="star_rating">Star Rating (1-5)</option>
                      <option value="nps">NPS Scale (0-10)</option>
                      <option value="single_choice">Single Choice Radio</option>
                      <option value="multi_choice">Multiple Choice Checkboxes</option>
                      <option value="yes_no">Yes / No</option>
                      <option value="short_text">Short Text</option>
                      <option value="long_text">Long Text / Voice Feedback</option>
                    </select>

                    <label className="flex items-center gap-1.5 text-xs text-charcoal/70 cursor-pointer pl-2">
                      <input
                        type="checkbox"
                        checked={q.isRequired}
                        onChange={(e) => updateQuestionField(idx, 'isRequired', e.target.checked)}
                        className="rounded text-coral focus:ring-coral"
                      />
                      <span>Required</span>
                    </label>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => moveQuestion(idx, -1)}
                      className="p-1.5 rounded-lg border border-charcoal/10 text-charcoal/50 hover:text-navy disabled:opacity-30"
                      title="Move Up"
                    >
                      <ArrowUp size={14} />
                    </button>
                    <button
                      type="button"
                      disabled={idx === questions.length - 1}
                      onClick={() => moveQuestion(idx, 1)}
                      className="p-1.5 rounded-lg border border-charcoal/10 text-charcoal/50 hover:text-navy disabled:opacity-30"
                      title="Move Down"
                    >
                      <ArrowDown size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeQuestion(idx)}
                      className="p-1.5 rounded-lg border border-charcoal/10 text-charcoal/50 hover:text-coral hover:border-coral transition-colors ml-2"
                      title="Delete Question"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {/* Multilingual Prompts */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-charcoal/60 uppercase mb-1">
                      English Prompt *
                    </label>
                    <input
                      type="text"
                      value={q.prompt?.en || ''}
                      onChange={(e) => updateQuestionPrompt(idx, 'en', e.target.value)}
                      placeholder="e.g. Rate your overall experience"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-charcoal/15 bg-ivory-50 focus:outline-none focus:border-coral"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-charcoal/60 uppercase mb-1">
                      Hindi (हिन्दी) Prompt
                    </label>
                    <input
                      type="text"
                      value={q.prompt?.hi || ''}
                      onChange={(e) => updateQuestionPrompt(idx, 'hi', e.target.value)}
                      placeholder="समग्र अनुभव को रेट करें"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-charcoal/15 bg-ivory-50 focus:outline-none focus:border-coral"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-charcoal/60 uppercase mb-1">
                      Marathi (मराठी) Prompt
                    </label>
                    <input
                      type="text"
                      value={q.prompt?.mr || ''}
                      onChange={(e) => updateQuestionPrompt(idx, 'mr', e.target.value)}
                      placeholder="एकंदर अनुभव कसा होता?"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-charcoal/15 bg-ivory-50 focus:outline-none focus:border-coral"
                    />
                  </div>
                </div>

                {/* Options Editor (if choice question) */}
                {(q.type === 'single_choice' || q.type === 'multi_choice') && (
                  <div className="pt-2 space-y-2">
                    <span className="text-xs font-bold text-navy block">Options:</span>
                    {q.options?.map((opt, oIdx) => (
                      <div key={opt.id || oIdx} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={opt.label?.en || ''}
                          onChange={(e) => {
                            const updated = [...questions];
                            updated[idx].options[oIdx].label.en = e.target.value;
                            setQuestions(updated);
                          }}
                          placeholder={`Option ${oIdx + 1} text`}
                          className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-charcoal/15 bg-ivory-50"
                        />
                        <button
                          type="button"
                          onClick={() => removeOptionFromQuestion(idx, oIdx)}
                          className="p-1.5 text-charcoal/40 hover:text-coral"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => addOptionToQuestion(idx)}
                      className="text-xs font-bold text-coral hover:underline inline-flex items-center gap-1"
                    >
                      <Plus size={12} />
                      <span>Add Option</span>
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Add Question Quick Buttons */}
          <div className="bg-white rounded-3xl p-5 border border-charcoal/10 shadow-subtle flex flex-wrap items-center justify-between gap-3">
            <span className="text-xs font-bold text-navy">Add Question Component:</span>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => addQuestion('star_rating')}
                className="px-3 py-1.5 rounded-xl bg-ivory hover:bg-coral hover:text-white text-xs font-bold text-charcoal transition-all"
              >
                + Star Rating
              </button>
              <button
                type="button"
                onClick={() => addQuestion('nps')}
                className="px-3 py-1.5 rounded-xl bg-ivory hover:bg-coral hover:text-white text-xs font-bold text-charcoal transition-all"
              >
                + NPS (0-10)
              </button>
              <button
                type="button"
                onClick={() => addQuestion('single_choice')}
                className="px-3 py-1.5 rounded-xl bg-ivory hover:bg-coral hover:text-white text-xs font-bold text-charcoal transition-all"
              >
                + Single Choice
              </button>
              <button
                type="button"
                onClick={() => addQuestion('multi_choice')}
                className="px-3 py-1.5 rounded-xl bg-ivory hover:bg-coral hover:text-white text-xs font-bold text-charcoal transition-all"
              >
                + Multi Choice
              </button>
              <button
                type="button"
                onClick={() => addQuestion('long_text')}
                className="px-3 py-1.5 rounded-xl bg-ivory hover:bg-coral hover:text-white text-xs font-bold text-charcoal transition-all"
              >
                + Voice / Long Text
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PREVIEW TAB */}
      {activeTab === 'preview' && (
        <div className="bg-white rounded-3xl p-8 border border-charcoal/10 shadow-card max-w-2xl mx-auto space-y-6">
          <div className="text-center pb-4 border-b border-charcoal/10">
            <span className="text-[10px] uppercase font-bold tracking-widest text-coral">Participant Preview</span>
            <h2 className="text-xl font-heading font-extrabold text-navy mt-1">{form?.title || 'Event Feedback'}</h2>
            <p className="text-xs text-charcoal/60 mt-0.5">{form?.description}</p>
          </div>

          <div className="space-y-6">
            {questions.map((q, idx) => (
              <div key={q._id || idx} className="space-y-2 p-4 rounded-2xl bg-ivory-50 border border-charcoal/10">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-coral">Q{idx + 1}</span>
                  <span className="text-sm font-bold text-navy">{q.prompt?.en}</span>
                  {q.isRequired && <span className="text-[10px] text-coral font-bold">*Required</span>}
                </div>

                {q.type === 'star_rating' && <StarRating value={4} disabled={true} />}
                {q.type === 'nps' && <NPSRating value={8} disabled={true} />}
                {q.type === 'long_text' && (
                  <textarea
                    rows={2}
                    disabled
                    placeholder="Participant can type or record voice feedback in English, Hindi, or Marathi"
                    className="w-full text-xs p-3 rounded-xl border border-charcoal/15 bg-white resize-none"
                  />
                )}
                {(q.type === 'single_choice' || q.type === 'multi_choice') && (
                  <div className="space-y-1.5 pt-1">
                    {q.options?.map((opt) => (
                      <div key={opt.id} className="p-2.5 rounded-xl border border-charcoal/15 bg-white text-xs font-medium">
                        {opt.label?.en}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SETTINGS TAB */}
      {activeTab === 'settings' && form && (
        <div className="bg-white rounded-3xl p-8 border border-charcoal/10 shadow-card space-y-6 max-w-2xl mx-auto">
          <h3 className="text-lg font-heading font-bold text-navy">Form Configuration & Restrictions</h3>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-2xl bg-ivory border border-charcoal/10">
              <div>
                <span className="text-xs font-bold text-navy block">Anonymous Feedback</span>
                <span className="text-[11px] text-charcoal/60">Allow participants to submit without providing their name or email</span>
              </div>
              <input
                type="checkbox"
                checked={form.isAnonymousAllowed}
                onChange={(e) => setForm({ ...form, isAnonymousAllowed: e.target.checked })}
                className="w-4 h-4 text-coral focus:ring-coral rounded"
              />
            </div>

            <div className="flex items-center justify-between p-4 rounded-2xl bg-ivory border border-charcoal/10">
              <div>
                <span className="text-xs font-bold text-navy block">Bhashini Voice Feedback</span>
                <span className="text-[11px] text-charcoal/60">Enable audio recording and real-time Speech-to-Text ASR</span>
              </div>
              <input
                type="checkbox"
                checked={form.allowVoiceFeedback}
                onChange={(e) => setForm({ ...form, allowVoiceFeedback: e.target.checked })}
                className="w-4 h-4 text-coral focus:ring-coral rounded"
              />
            </div>

            <div className="flex items-center justify-between p-4 rounded-2xl bg-ivory border border-charcoal/10">
              <div>
                <span className="text-xs font-bold text-navy block">Prevent Duplicate Submissions</span>
                <span className="text-[11px] text-charcoal/60">Limit one response per device/browser fingerprint</span>
              </div>
              <input
                type="checkbox"
                checked={!form.allowDuplicateSubmissions}
                onChange={(e) => setForm({ ...form, allowDuplicateSubmissions: !e.target.checked })}
                className="w-4 h-4 text-coral focus:ring-coral rounded"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FormBuilderPage;
