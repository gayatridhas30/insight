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
import { useTranslation } from 'react-i18next';

const TARGET_SAMPLE_RATE = 16000;

/**
 * Convert a recorded blob into a 16-bit mono PCM WAV and return base64.
 * Downsampling to 16 kHz keeps the payload small and matches what ASR engines expect.
 */
async function blobToWavBase64(blob) {
  const arrayBuffer = await blob.arrayBuffer();
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  const ctx = new AudioCtx();
  try {
    const decoded = await ctx.decodeAudioData(arrayBuffer);
    const ratio = decoded.sampleRate / TARGET_SAMPLE_RATE;
    const numFrames = Math.max(1, Math.ceil(decoded.length / ratio));
    const numCh = 1;
    const rate = TARGET_SAMPLE_RATE;
    const dataSize = numFrames * numCh * 2;
    const buffer = new ArrayBuffer(44 + dataSize);
    const v = new DataView(buffer);
    const ws = (o, s) => {
      for (let i = 0; i < s.length; i++) v.setUint8(o + i, s.charCodeAt(i));
    };
    ws(0, 'RIFF');
    v.setUint32(4, 36 + dataSize, true);
    ws(8, 'WAVE');
    ws(12, 'fmt ');
    v.setUint32(16, 16, true);
    v.setUint16(20, 1, true);
    v.setUint16(22, numCh, true);
    v.setUint32(24, rate, true);
    v.setUint32(28, rate * numCh * 2, true);
    v.setUint16(32, numCh * 2, true);
    v.setUint16(34, 16, true);
    ws(36, 'data');
    v.setUint32(40, dataSize, true);

    const ch0 = decoded.getChannelData(0);
    let offset = 44;
    for (let i = 0; i < numFrames; i++) {
      const src = Math.min(Math.floor(i * ratio), ch0.length - 1);
      const s = Math.max(-1, Math.min(1, ch0[src]));
      v.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
      offset += 2;
    }

    const bytes = new Uint8Array(buffer);
    let binary = '';
    const CHUNK = 0x8000;
    for (let i = 0; i < bytes.length; i += CHUNK) {
      binary += String.fromCharCode.apply(null, bytes.subarray(i, i + CHUNK));
    }
    return btoa(binary);
  } finally {
    try {
      await ctx.close();
    } catch {
      /* ignore */
    }
  }
}

export const VoiceRecorder = ({ language = 'en', onTranscriptionChange, currentText = '' }) => {
  const { t } = useTranslation();
  const [isRecording, setIsRecording] = useState(false);
  const [recordDuration, setRecordDuration] = useState(0);
  const [transcription, setTranscription] = useState(currentText);
  const [audioUrl, setAudioUrl] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeLang, setActiveLang] = useState(language);
  const [statusNotice, setStatusNotice] = useState(null);
  const [bhashiniTranslation, setBhashiniTranslation] = useState(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  // idle | starting | active | unavailable | error
  const [liveStatus, setLiveStatus] = useState('idle');

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef(null);
  const recognitionRef = useRef(null);
  const timerRef = useRef(null);
  const audioPlayerRef = useRef(null);
  const streamRef = useRef(null);
  const speechCapturedRef = useRef(false);
  const audioBlobRef = useRef(null);
  const audioUrlRef = useRef(null);
  const pendingTranscribeRef = useRef(false);
  const isRecordingRef = useRef(false);
  const recognitionActiveRef = useRef(false);
  const restartCountRef = useRef(0);
  // Mirror of `transcription` so async callbacks never read stale state.
  const transcriptionRef = useRef(currentText || '');

  const applyTranscription = (text) => {
    transcriptionRef.current = text;
    setTranscription(text);
  };

  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  /**
   * Chrome hides navigator.mediaDevices on origins that are not "potentially
   * trustworthy" — i.e. anything other than https:// or http://localhost.
   * http://<LAN-IP> (the QR code target) is NOT secure, so the mic API is absent.
   */
  const isInsecureOrigin = () =>
    !window.isSecureContext || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia;

  useEffect(() => {
    if (currentText && currentText !== transcriptionRef.current) {
      applyTranscription(currentText);
    }
  }, [currentText]);

  useEffect(() => {
    setActiveLang(language);
  }, [language]);

  // Surface the problem on load instead of after a failed click.
  useEffect(() => {
    if (isInsecureOrigin()) {
      setStatusNotice({ key: 'voice.insecureOrigin' });
      setLiveStatus('unavailable');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  /**
   * Live browser dictation (Chrome/Edge Web Speech API).
   * Chrome ends a recognition session on silence / its own session limit, so while
   * the user is still recording we transparently restart it instead of dying quietly.
   */
  const startRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition || isInsecureOrigin()) {
      setLiveStatus('unavailable');
      setStatusNotice({ key: 'voice.insecureOrigin' });
      return;
    }
    if (recognitionActiveRef.current) return;
    if (restartCountRef.current > 40) {
      setLiveStatus('error:restart-limit');
      return;
    }

    let recognition;
    try {
      recognition = new SpeechRecognition();
    } catch (e) {
      console.warn('SpeechRecognition ctor notice:', e);
      setLiveStatus('unavailable');
      return;
    }

    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = getLanguageTag(activeLang);

    recognition.onstart = () => {
      recognitionActiveRef.current = true;
      setLiveStatus('active');
    };

    recognition.onresult = (event) => {
      let text = '';
      for (let i = 0; i < event.results.length; i++) {
        text += event.results[i][0].transcript;
      }
      if (text.trim()) {
        speechCapturedRef.current = true;
        restartCountRef.current = 0;
        applyTranscription(text);
        if (onTranscriptionChange) onTranscriptionChange(text, audioUrlRef.current);
      }
    };

    recognition.onerror = (event) => {
      // Recoverable: the recorded audio is still sent to server ASR on stop.
      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        setLiveStatus('unavailable');
        setStatusNotice({ key: 'voice.micBlocked' });
      } else if (event.error === 'network') {
        setLiveStatus('error:network');
        setStatusNotice({ key: 'voice.audioRecordedLocally' });
      } else if (event.error === 'no-speech') {
        setStatusNotice({ key: 'voice.noSpeechDetected' });
      } else if (event.error === 'aborted') {
        /* expected when we stop */
      } else {
        setLiveStatus('error:' + event.error);
        setStatusNotice({ key: 'voice.liveError', params: { code: event.error } });
      }
    };

    recognition.onend = () => {
      recognitionActiveRef.current = false;
      if (isRecordingRef.current) {
        // Session ended but the user is still recording — resume dictation.
        restartCountRef.current += 1;
        setLiveStatus('starting');
        setTimeout(() => {
          if (isRecordingRef.current && !recognitionActiveRef.current) startRecognition();
        }, 250);
      } else {
        setLiveStatus('idle');
      }
    };

    try {
      setLiveStatus('starting');
      recognition.start();
      recognitionRef.current = recognition;
    } catch (e) {
      console.warn('SpeechRecognition start notice:', e);
      recognitionActiveRef.current = false;
      setLiveStatus('unavailable');
    }
  };

  const startRecording = async () => {
    setStatusNotice(null);
    setBhashiniTranslation(null);
    speechCapturedRef.current = false;

    // No mic API at all → recording is impossible; say exactly why and how to fix it.
    if (isInsecureOrigin()) {
      setStatusNotice({ key: 'voice.insecureOrigin' });
      setLiveStatus('unavailable');
      return;
    }

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
          const audioBlob = new Blob(audioChunksRef.current || [], { type: mimeType || 'audio/webm' });
          audioBlobRef.current = audioBlob;
          const url = URL.createObjectURL(audioBlob);
          audioUrlRef.current = url;
          setAudioUrl(url);

          if (streamRef.current) {
            streamRef.current.getTracks().forEach((track) => track.stop());
            streamRef.current = null;
          }

          // Re-check: Chrome delivers the final onresult *after* stop() is called.
          if (pendingTranscribeRef.current && !speechCapturedRef.current) {
            pendingTranscribeRef.current = false;
            runServerTranscription(audioBlob);
          } else {
            pendingTranscribeRef.current = false;
          }
        };

        recorder.start(250);
      }
    } catch (err) {
      console.warn('MediaRecorder notice:', err.message);
      // Insecure origin (http://<lan-ip>), denied permission or no mic support.
      setStatusNotice({ key: 'voice.micBlocked' });
    }

    // 2. Live browser dictation (auto-restarts until recording stops).
    restartCountRef.current = 0;
    startRecognition();

    isRecordingRef.current = true;
    setIsRecording(true);
    setRecordDuration(0);
    timerRef.current = setInterval(() => {
      setRecordDuration((prev) => prev + 1);
    }, 1000);
  };

  /**
   * Server-side ASR. Runs when the browser could not produce text
   * (Firefox, insecure origin, blocked Google speech service, or user retries).
   */
  const runServerTranscription = async (blob) => {
    if (!blob || blob.size === 0) {
      setStatusNotice({ key: 'voice.noAudio' });
      return;
    }

    setIsTranscribing(true);
    setStatusNotice({ key: 'voice.processingAudio' });
    try {
      let base64Audio;
      let audioFormat = 'wav';
      try {
        base64Audio = await blobToWavBase64(blob);
      } catch (convErr) {
        console.warn('WAV conversion notice:', convErr.message);
        const buf = await blob.arrayBuffer();
        const bytes = new Uint8Array(buf);
        let binary = '';
        const CHUNK = 0x8000;
        for (let i = 0; i < bytes.length; i += CHUNK) {
          binary += String.fromCharCode.apply(null, bytes.subarray(i, i + CHUNK));
        }
        base64Audio = btoa(binary);
        audioFormat = (blob.type || '').includes('mp4') ? 'mp4' : 'webm';
      }

      const res = await bhashiniService.transcribeAudio({
        base64Audio,
        language: activeLang,
        audioFormat,
      });
      const data = res.data || {};
      const text = (data.transcription || '').trim();

      // Never clobber text that arrived while the request was in flight.
      if (speechCapturedRef.current || transcriptionRef.current.trim()) {
        return;
      }

      if (text) {
        applyTranscription(text);
        if (onTranscriptionChange) onTranscriptionChange(text, audioUrlRef.current);
        setStatusNotice({
          key: data.isBhashiniLive ? 'voice.transcribedServer' : 'voice.transcribedFallback',
        });
        await translateToEnglish(text);
      } else {
        // Server refused to fabricate a transcript - show the real reason.
        setStatusNotice({ key: 'voice.transcribeFailed', detail: data.notice || null });
      }
    } catch (err) {
      console.warn('Server ASR notice:', err.message);
      setStatusNotice({ key: 'voice.transcribeFailed', detail: err.message });
    } finally {
      setIsTranscribing(false);
    }
  };

  const stopRecording = async () => {
    isRecordingRef.current = false;
    setIsRecording(false);
    if (timerRef.current) clearInterval(timerRef.current);

    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (e) {}
    }

    // Chrome flushes the final onresult *after* stop() — give it a moment so the
    // user's real words are not overwritten by the server fallback.
    const hadLiveText = speechCapturedRef.current;
    if (!hadLiveText) await sleep(700);

    const hasLiveText =
      speechCapturedRef.current || transcriptionRef.current.trim().length > 0;

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      // Defer ASR until recorder.onstop has produced the blob.
      pendingTranscribeRef.current = !hasLiveText;
      try { mediaRecorderRef.current.stop(); } catch (e) {}
    } else if (!hasLiveText && audioBlobRef.current) {
      runServerTranscription(audioBlobRef.current);
    }

    // If user spoke in Hindi or Marathi and text exists, run Bhashini translation
    await translateToEnglish(transcriptionRef.current);
  };

  /** Show the English rendering of non-English feedback (live or server transcribed). */
  const translateToEnglish = async (text) => {
    const sourceText = (text || '').trim();
    if (!sourceText || activeLang === 'en') return;
    try {
      setIsTranslating(true);
      const res = await bhashiniService.translateText({
        sourceText,
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
  };

  const stopAll = () => {
    isRecordingRef.current = false;
    recognitionActiveRef.current = false;
    setIsRecording(false);
    setLiveStatus('idle');
    if (timerRef.current) clearInterval(timerRef.current);
    if (recognitionRef.current) {
      try { recognitionRef.current.abort(); } catch (e) {}
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try { mediaRecorderRef.current.stop(); } catch (e) {}
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
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
    pendingTranscribeRef.current = false;
    speechCapturedRef.current = false;
    applyTranscription(sampleText);
    if (onTranscriptionChange) {
      onTranscriptionChange(sampleText, audioUrlRef.current);
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
      setStatusNotice({ key: 'voice.sampleAppliedProcessed', params: { lang: sampleLang.toUpperCase() } });
    } catch (e) {
      setStatusNotice({ key: 'voice.sampleApplied', params: { lang: sampleLang.toUpperCase() } });
    } finally {
      setIsTranslating(false);
    }
  };

  const handleClear = () => {
    stopAll();
    applyTranscription('');
    setAudioUrl(null);
    audioUrlRef.current = null;
    audioBlobRef.current = null;
    pendingTranscribeRef.current = false;
    speechCapturedRef.current = false;
    setBhashiniTranslation(null);
    setStatusNotice(null);
    setIsTranscribing(false);
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
      label: t('voice.sampleLabel', { lang: t('languageSelect.hi') }),
      text: 'सत्र बहुत अच्छा और व्यावहारिक था। वक्ताओं ने सभी प्रश्नों के स्पष्ट उत्तर दिए।',
    },
    {
      lang: 'mr',
      label: t('voice.sampleLabel', { lang: t('languageSelect.mr') }),
      text: 'सत्र अतिशय माहितीपूर्ण आणि उपयुक्त होते. प्रात्यक्षिके उत्तम प्रकारे दाखवण्यात आली.',
    },
    {
      lang: 'en',
      label: t('voice.sampleLabelGlobal', { lang: t('languageSelect.en') }),
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
            <span className="text-xs font-bold text-slate-900 block">{t('voice.title')}</span>
            <span className="text-[11px] text-slate-500">{t('voice.subtitle')}</span>
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
            {t('voice.langCodeEn')}
          </button>
          <button
            type="button"
            onClick={() => setActiveLang('hi')}
            className={`px-2 py-0.5 rounded-lg transition-colors ${
              activeLang === 'hi' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {t('languageSelect.hi')}
          </button>
          <button
            type="button"
            onClick={() => setActiveLang('mr')}
            className={`px-2 py-0.5 rounded-lg transition-colors ${
              activeLang === 'mr' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {t('languageSelect.mr')}
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
            <span>{t('voice.recordButton')}</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={stopRecording}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md transition-all active:scale-95 animate-pulse"
          >
            <Square size={14} className="fill-white" />
            <span>{t('voice.stopRecording', { time: formatTimer(recordDuration) })}</span>
          </button>
        )}

        {/* Live Audio Pulse Equalizer */}
        {isRecording && (
          <div className="flex items-center gap-2 px-3.5 py-2 bg-rose-50 border border-rose-200 rounded-xl">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-ping"></span>
            <span className="text-xs font-bold text-rose-700">
              {t('voice.recordingIn', {
                lang:
                  activeLang === 'mr'
                    ? t('languageSelect.mr')
                    : activeLang === 'hi'
                    ? t('languageSelect.hi')
                    : t('languageSelect.en'),
              })}
            </span>
            <div className="flex items-end gap-1 h-4 ml-1">
              <span className="w-1 bg-rose-500 rounded-full animate-bounce h-2"></span>
              <span className="w-1 bg-rose-600 rounded-full animate-bounce h-4" style={{ animationDelay: '0.12s' }}></span>
              <span className="w-1 bg-rose-500 rounded-full animate-bounce h-3" style={{ animationDelay: '0.24s' }}></span>
              <span className="w-1 bg-rose-400 rounded-full animate-bounce h-2" style={{ animationDelay: '0.36s' }}></span>
            </div>
          </div>
        )}

        {/* Live dictation engine status — makes failures visible instead of silent */}
        {isRecording && (
          <div
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-[11px] font-bold ${
              liveStatus === 'active'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                : liveStatus === 'unavailable' || liveStatus.startsWith('error:')
                ? 'bg-amber-50 border-amber-200 text-amber-800'
                : 'bg-slate-100 border-slate-200 text-slate-600'
            }`}
          >
            {liveStatus === 'active' ? (
              <CheckCircle2 size={12} className="shrink-0" />
            ) : liveStatus === 'unavailable' || liveStatus.startsWith('error:') ? (
              <AlertCircle size={12} className="shrink-0" />
            ) : (
              <Radio size={12} className="shrink-0 animate-pulse" />
            )}
            <span>
              {liveStatus === 'active'
                ? t('voice.liveActive')
                : liveStatus === 'starting'
                ? t('voice.liveStarting')
                : liveStatus === 'unavailable'
                ? t('voice.liveUnavailable')
                : t('voice.liveError', { code: liveStatus.replace('error:', '') })}
            </span>
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
              <span>{isPlaying ? t('voice.pauseAudio') : t('voice.playRecording')}</span>
            </button>
            <button
              type="button"
              onClick={handleClear}
              className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors"
              title={t('voice.deleteRecording')}
            >
              <Trash2 size={14} />
            </button>
          </div>
        )}

        {/* Retry server-side ASR when the browser produced no text */}
        {audioUrl && !isRecording && !transcription.trim() && (
          <button
            type="button"
            onClick={() => runServerTranscription(audioBlobRef.current)}
            disabled={isTranscribing}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold hover:bg-indigo-100 transition-all active:scale-95 disabled:opacity-60"
          >
            {isTranscribing ? (
              <RefreshCw size={13} className="animate-spin" />
            ) : (
              <Radio size={13} />
            )}
            <span>{t('voice.transcribeButton')}</span>
          </button>
        )}
      </div>

      {/* Helpful Status Notice */}
      {statusNotice && (
        <p
          className={`text-[11px] font-medium p-2.5 rounded-xl border flex items-center gap-1.5 ${
            statusNotice.key === 'voice.micBlocked' ||
            statusNotice.key === 'voice.transcribeFailed' ||
            statusNotice.key === 'voice.noAudio'
              ? 'text-rose-700 bg-rose-50 border-rose-200'
              : 'text-slate-600 bg-slate-100 border-slate-200'
          }`}
        >
          {statusNotice.key === 'voice.micBlocked' ||
          statusNotice.key === 'voice.transcribeFailed' ||
          statusNotice.key === 'voice.noAudio' ? (
            <AlertCircle size={13} className="shrink-0 text-rose-600" />
          ) : (
            <Sparkles size={13} className="shrink-0 text-indigo-600" />
          )}
          <span>{t(statusNotice.key, statusNotice.params)}</span>
          {statusNotice.detail && (
            <span className="normal-case font-normal opacity-80">{statusNotice.detail}</span>
          )}
        </p>
      )}

      {/* Server ASR in progress */}
      {isTranscribing && (
        <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 animate-pulse">
          <RefreshCw size={13} className="animate-spin" />
          <span>{t('voice.processingAudio')}</span>
        </div>
      )}

      {/* Real-time / Edited Transcript Review */}
      <div className="space-y-1.5 mt-1">
        <div className="flex items-center justify-between text-xs font-medium text-slate-700">
          <span>{t('voice.reviewLabel')}</span>
          <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
            <CheckCircle2 size={12} />
            <span>{t('voice.editable')}</span>
          </span>
        </div>

        <textarea
          rows={3}
          value={transcription}
          onChange={(e) => {
            applyTranscription(e.target.value);
            if (onTranscriptionChange) {
              onTranscriptionChange(e.target.value, audioUrlRef.current);
            }
          }}
          placeholder={t('voice.textPlaceholder')}
          className="w-full text-xs font-medium rounded-xl p-3 border border-slate-200 bg-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 resize-none transition-all"
        />
      </div>

      {/* Bhashini Live English Translation Badge if submitted in Hindi/Marathi */}
      {isTranslating && (
        <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 animate-pulse">
          <RefreshCw size={13} className="animate-spin" />
          <span>{t('voice.translatingStatus')}</span>
        </div>
      )}

      {bhashiniTranslation && !isTranslating && (
        <div className="p-3 bg-indigo-50/70 border border-indigo-100 rounded-xl space-y-1 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-bold text-indigo-900 text-[11px] uppercase tracking-wider">
              {t('voice.translationTitle')}
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-600 text-white">
              {t('voice.verifiedBadge')}
            </span>
          </div>
          <p className="text-slate-800 font-medium italic">"{bhashiniTranslation}"</p>
        </div>
      )}

      {/* 1-Click Voice Testing Prompts */}
      <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-slate-200/70">
        <span className="text-[11px] font-semibold text-slate-500 mr-1 flex items-center gap-1">
          <Sparkles size={12} className="text-indigo-600" />
          <span>{t('voice.quickSamples')}</span>
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
