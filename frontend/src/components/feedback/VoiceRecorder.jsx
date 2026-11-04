import React, { useState, useRef, useEffect } from 'react';
import {
  Mic,
  Square,
  Play,
  Pause,
  Trash2,
  RefreshCw,
  CheckCircle2,
  Volume2,
  Sparkles,
  AlertCircle,
  Radio,
  FileAudio,
} from 'lucide-react';
import { bhashiniService } from '../../api/services';

export const VoiceRecorder = ({ language = 'en', onTranscriptionChange, currentText = '' }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordDuration, setRecordDuration] = useState(0);
  const [transcription, setTranscription] = useState(currentText);
  const [audioUrl, setAudioUrl] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeLang, setActiveLang] = useState(language);
  const [statusNotice, setStatusNotice] = useState('');
  const [bhashiniTranslation, setBhashiniTranslation] = useState(null);
  const [isTranslating, setIsTranslating] = useState(false);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recognitionRef = useRef(null);
  const timerRef = useRef(null);
  const audioPlayerRef = useRef(null);
  const streamRef = useRef(null);
  const speechCapturedRef = useRef(false);

  useEffect(() => {
    if (currentText && currentText !== transcription) {
      setTranscription(currentText);
    }
  }, [currentText]);

  useEffect(() => {
    setActiveLang(language);
  }, [language]);

  useEffect(() => {
    return () => {
      stopAll();
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
  }, [audioUrl]);

  const getLanguageTag = (lang) => {
    if (lang === 'hi') return 'hi-IN';
    if (lang === 'mr') return 'mr-IN';
    return 'en-IN';
  };

  const startRecording = async () => {
    setStatusNotice('');
    setBhashiniTranslation(null);
    speechCapturedRef.current = false;

    // 1. Initialize local Audio Recording (100% offline & local, never blocked by Google API)
    let stream = null;
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        streamRef.current = stream;

        const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
          ? 'audio/webm;codecs=opus'
          : MediaRecorder.isTypeSupported('audio/webm')
          ? 'audio/webm'
          : MediaRecorder.isTypeSupported('audio/mp4')
          ? 'audio/mp4'
          : '';

        const recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
        mediaRecorderRef.current = recorder;
        audioChunksRef.current = [];

        recorder.ondataavailable = (event) => {
          if (event.data && event.data.size > 0) {
            audioChunksRef.current.push(event.data);
          }
        };

        recorder.onstop = () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: mimeType || 'audio/webm' });
          const url = URL.createObjectURL(audioBlob);
          setAudioUrl(url);

          if (streamRef.current) {
            streamRef.current.getTracks().forEach((track) => track.stop());
          }
        };

        recorder.start(250);
      }
    } catch (err) {
      console.warn('MediaRecorder notice:', err.message);
    }

    // 2. Attempt speech recognition (if supported and unblocked)
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = getLanguageTag(activeLang);

        recognition.onresult = (event) => {
          let text = '';
          for (let i = 0; i < event.results.length; i++) {
            text += event.results[i][0].transcript;
          }
          if (text.trim()) {
            speechCapturedRef.current = true;
            setTranscription(text);
            if (onTranscriptionChange) {
              onTranscriptionChange(text, audioUrl);
            }
          }
        };

        recognition.onerror = (event) => {
          // If Google speech cloud is rate-limited on this network, continue recording audio smoothly
          if (event.error === 'network') {
            setStatusNotice(
              'Voice audio is being recorded directly to your device. You can play it back or refine your feedback below.'
            );
          }
        };

        recognition.start();
        recognitionRef.current = recognition;
      } catch (e) {
        console.warn('SpeechRecognition start notice:', e);
      }
    }

    setIsRecording(true);
    setRecordDuration(0);
    timerRef.current = setInterval(() => {
      setRecordDuration((prev) => prev + 1);
    }, 1000);
  };

  const stopRecording = async () => {
    setIsRecording(false);
    if (timerRef.current) clearInterval(timerRef.current);

    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (e) {}
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try { mediaRecorderRef.current.stop(); } catch (e) {}
    }

    // If user spoke in Hindi or Marathi and text exists, run Bhashini translation
    const currentTextToTranslate = transcription.trim();
    if (currentTextToTranslate && activeLang !== 'en') {
      try {
        setIsTranslating(true);
        const res = await bhashiniService.translateText({
          sourceText: currentTextToTranslate,
          sourceLanguage: activeLang,
          targetLanguage: 'en',
        });
        if (res.data?.translatedText) {
          setBhashiniTranslation(res.data.translatedText);
        }
      } catch (err) {
        console.warn('Bhashini translate notice:', err.message);
      } finally {
        setIsTranslating(false);
      }
    }
  };

  const stopAll = () => {
    setIsRecording(false);
    if (timerRef.current) clearInterval(timerRef.current);
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (e) {}
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try { mediaRecorderRef.current.stop(); } catch (e) {}
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }
  };

  const togglePlayback = () => {
    if (!audioPlayerRef.current && audioUrl) {
      audioPlayerRef.current = new Audio(audioUrl);
      audioPlayerRef.current.onended = () => setIsPlaying(false);
    }

    if (audioPlayerRef.current) {
      if (isPlaying) {
        audioPlayerRef.current.pause();
        setIsPlaying(false);
      } else {
        audioPlayerRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  const handleApplySample = async (sampleText, sampleLang) => {
    stopAll();
    setTranscription(sampleText);
    if (onTranscriptionChange) {
      onTranscriptionChange(sampleText, audioUrl);
    }

    try {
      setIsTranslating(true);
      const res = await bhashiniService.translateText({
        sourceText: sampleText,
        sourceLanguage: sampleLang || activeLang,
        targetLanguage: 'en',
      });
      if (res.data?.translatedText) {
        setBhashiniTranslation(res.data.translatedText);
      }
      setStatusNotice(`Applied sample in ${sampleLang.toUpperCase()} → Processed through Bhashini pipeline.`);
    } catch (e) {
      setStatusNotice(`Applied sample in ${sampleLang.toUpperCase()}`);
    } finally {
      setIsTranslating(false);
    }
  };

  const handleClear = () => {
    stopAll();
    setTranscription('');
    setAudioUrl(null);
    setBhashiniTranslation(null);
    setStatusNotice('');
    if (onTranscriptionChange) onTranscriptionChange('', null);
  };

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const sampleVoicePrompts = [
    {
      lang: 'hi',
      label: '🇮🇳 हिन्दी Voice Sample',
      text: 'सत्र बहुत अच्छा और व्यावहारिक था। वक्ताओं ने सभी प्रश्नों के स्पष्ट उत्तर दिए।',
    },
    {
      lang: 'mr',
      label: '🇮🇳 मराठी Voice Sample',
      text: 'सत्र अतिशय माहितीपूर्ण आणि उपयुक्त होते. प्रात्यक्षिके उत्तम प्रकारे दाखवण्यात आली.',
    },
    {
      lang: 'en',
      label: '🌐 English Voice Sample',
      text: 'The workshop was exceptionally structured, but Wi-Fi connectivity in Hall B had dropouts.',
    },
  ];

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-5 flex flex-col gap-3 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600 shadow-2xs">
            <Volume2 size={16} />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-900 block">Bhashini Multilingual Voice Input</span>
            <span className="text-[11px] text-slate-500">Record voice in English, हिन्दी, or मराठी</span>
          </div>
        </div>

        {/* Language selector toggle */}
        <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-xl p-0.5 shadow-2xs text-[11px] font-bold">
          <button
            type="button"
            onClick={() => setActiveLang('en')}
            className={`px-2 py-0.5 rounded-lg transition-colors ${
              activeLang === 'en' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            EN
          </button>
          <button
            type="button"
            onClick={() => setActiveLang('hi')}
            className={`px-2 py-0.5 rounded-lg transition-colors ${
              activeLang === 'hi' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            हिन्दी
          </button>
          <button
            type="button"
            onClick={() => setActiveLang('mr')}
            className={`px-2 py-0.5 rounded-lg transition-colors ${
              activeLang === 'mr' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            मराठी
          </button>
        </div>
      </div>

      {/* Recording Control Button & Audio Indicator */}
      <div className="flex flex-wrap items-center gap-3">
        {!isRecording ? (
          <button
            type="button"
            onClick={startRecording}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm transition-all active:scale-95"
          >
            <Mic size={15} />
            <span>Record Voice Feedback</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={stopRecording}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md transition-all active:scale-95 animate-pulse"
          >
            <Square size={14} className="fill-white" />
            <span>Stop Recording ({formatTimer(recordDuration)})</span>
          </button>
        )}

        {/* Live Audio Pulse Equalizer */}
        {isRecording && (
          <div className="flex items-center gap-2 px-3.5 py-2 bg-rose-50 border border-rose-200 rounded-xl">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-ping"></span>
            <span className="text-xs font-bold text-rose-700">
              Recording Voice ({activeLang === 'mr' ? 'मराठी' : activeLang === 'hi' ? 'हिन्दी' : 'English'})
            </span>
            <div className="flex items-end gap-1 h-4 ml-1">
              <span className="w-1 bg-rose-500 rounded-full animate-bounce h-2"></span>
              <span className="w-1 bg-rose-600 rounded-full animate-bounce h-4" style={{ animationDelay: '0.12s' }}></span>
              <span className="w-1 bg-rose-500 rounded-full animate-bounce h-3" style={{ animationDelay: '0.24s' }}></span>
              <span className="w-1 bg-rose-400 rounded-full animate-bounce h-2" style={{ animationDelay: '0.36s' }}></span>
            </div>
          </div>
        )}

        {/* Audio Playback Controls if recorded */}
        {audioUrl && !isRecording && (
          <div className="flex items-center gap-2 p-1.5 bg-white border border-slate-200 rounded-xl shadow-2xs">
            <button
              type="button"
              onClick={togglePlayback}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors"
            >
              {isPlaying ? <Pause size={13} /> : <Play size={13} />}
              <span>{isPlaying ? 'Pause Audio' : 'Play Voice Recording'}</span>
            </button>
            <button
              type="button"
              onClick={handleClear}
              className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors"
              title="Delete audio recording"
            >
              <Trash2 size={14} />
            </button>
          </div>
        )}
      </div>

      {/* Helpful Status Notice */}
      {statusNotice && (
        <p className="text-[11px] font-medium text-slate-600 bg-slate-100 p-2.5 rounded-xl border border-slate-200 flex items-center gap-1.5">
          <Sparkles size={13} className="shrink-0 text-indigo-600" />
          <span>{statusNotice}</span>
        </p>
      )}

      {/* Real-time / Edited Transcript Review */}
      <div className="space-y-1.5 mt-1">
        <div className="flex items-center justify-between text-xs font-medium text-slate-700">
          <span>Voice Feedback Text (Review & Edit):</span>
          <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
            <CheckCircle2 size={12} />
            <span>Editable</span>
          </span>
        </div>

        <textarea
          rows={3}
          value={transcription}
          onChange={(e) => {
            setTranscription(e.target.value);
            if (onTranscriptionChange) {
              onTranscriptionChange(e.target.value, audioUrl);
            }
          }}
          placeholder="Speak into your microphone or type your thoughts here in English, हिन्दी, or मराठी..."
          className="w-full text-xs font-medium rounded-xl p-3 border border-slate-200 bg-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 resize-none transition-all"
        />
      </div>

      {/* Bhashini Live English Translation Badge if submitted in Hindi/Marathi */}
      {isTranslating && (
        <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 animate-pulse">
          <RefreshCw size={13} className="animate-spin" />
          <span>Translating via Bhashini NMT pipeline...</span>
        </div>
      )}

      {bhashiniTranslation && !isTranslating && (
        <div className="p-3 bg-indigo-50/70 border border-indigo-100 rounded-xl space-y-1 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-bold text-indigo-900 text-[11px] uppercase tracking-wider">
              Bhashini English Translation (For Host Intelligence)
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-600 text-white">
              Bhashini Verified
            </span>
          </div>
          <p className="text-slate-800 font-medium italic">"{bhashiniTranslation}"</p>
        </div>
      )}

      {/* 1-Click Voice Testing Prompts */}
      <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-slate-200/70">
        <span className="text-[11px] font-semibold text-slate-500 mr-1 flex items-center gap-1">
          <Sparkles size={12} className="text-indigo-600" />
          <span>Quick Multilingual Voice Samples:</span>
        </span>
        {sampleVoicePrompts.map((s) => (
          <button
            key={s.lang}
            type="button"
            onClick={() => handleApplySample(s.text, s.lang)}
            className="px-2.5 py-1 text-[11px] font-medium bg-white border border-slate-200 hover:border-indigo-500 hover:text-indigo-600 rounded-lg shadow-2xs transition-all active:scale-95"
          >
            {s.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default VoiceRecorder;
