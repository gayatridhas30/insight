import React from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '../../components/layout/Navbar';
import { Footer } from '../../components/layout/Footer';
import {
  Mic,
  Brain,
  QrCode,
  Languages,
  CheckCircle,
  FileSpreadsheet,
  GitCompare,
  Shield,
  Layers,
  Sparkles,
} from 'lucide-react';

export const FeaturesPage = () => {
  return (
    <div className="min-h-screen bg-ivory flex flex-col">
      <Navbar />

      <main className="flex-1 py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <span className="text-xs uppercase font-bold tracking-widest text-coral">Platform Capabilities</span>
            <h1 className="text-4xl sm:text-5xl font-heading font-extrabold text-navy">
              Engineered for Complete Event Intelligence
            </h1>
            <p className="text-base text-charcoal/70">
              InsightLoop couples Indian language processing with vector retrieval and automated post-event resolution tracking.
            </p>
          </div>

          <div className="space-y-12">
            {/* Feature 1 */}
            <div className="bg-white rounded-3xl p-8 sm:p-12 border border-charcoal/10 shadow-subtle grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-navy text-white flex items-center justify-center">
                  <Languages size={24} className="text-coral" />
                </div>
                <h3 className="text-2xl font-heading font-bold text-navy">Bhashini Multilingual Speech & Text</h3>
                <p className="text-sm text-charcoal/70 leading-relaxed">
                  Break language barriers at collegiate and national conferences. Participants can submit audio or text in English, Hindi, or Marathi. Speech is transcribed using Bhashini ASR, allowing attendees to review and refine their transcriptions in real-time. Original feedback is preserved separately from English translations for uncorrupted NLP processing.
                </p>
                <div className="flex items-center gap-3 text-xs font-semibold text-sage-dark">
                  <CheckCircle size={16} />
                  <span>Preserves original dialect & translated text</span>
                </div>
              </div>
              <div className="bg-ivory rounded-2xl p-6 border border-charcoal/10 space-y-3 font-mono text-xs">
                <div className="text-navy font-bold">Input (Marathi Speech Audio):</div>
                <div className="p-3 bg-white rounded-xl border border-charcoal/10 text-charcoal/80">
                  "हॅकाथॉनचे आयोजन खूप छान होते. मेंटर्सने खूप मदत केली."
                </div>
                <div className="text-coral font-bold mt-2">Bhashini Translation Output:</div>
                <div className="p-3 bg-white rounded-xl border border-charcoal/10 text-charcoal/80">
                  "The hackathon organization was very good. Mentors were extremely helpful."
                </div>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="bg-white rounded-3xl p-8 sm:p-12 border border-charcoal/10 shadow-subtle grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div className="space-y-4 md:order-2">
                <div className="w-12 h-12 rounded-2xl bg-navy text-white flex items-center justify-center">
                  <Brain size={24} className="text-coral" />
                </div>
                <h3 className="text-2xl font-heading font-bold text-navy">RAG-Powered AI Knowledge Assistant</h3>
                <p className="text-sm text-charcoal/70 leading-relaxed">
                  Organizers can hold interactive conversations with their event historical data. Using vector semantic retrieval scoped with organization isolation, the AI assistant answers complex queries like: "Did we fix the microphone issues from our March workshop?", "What did students like most about the hackathon problem statements?"
                </p>
                <div className="flex items-center gap-3 text-xs font-semibold text-sage-dark">
                  <CheckCircle size={16} />
                  <span>Evidence-backed answers with direct participant citations</span>
                </div>
              </div>
              <div className="bg-navy rounded-2xl p-6 text-white space-y-3 text-xs md:order-1">
                <div className="flex items-center gap-2 text-coral font-bold">
                  <Sparkles size={14} />
                  <span>Organizer Query:</span>
                </div>
                <p className="p-3 bg-navy-800 rounded-xl border border-white/10 text-white/90">
                  "What were the biggest logistical challenges in the recent AI Hackathon?"
                </p>
                <div className="text-sage font-bold">AI Synthesized Response:</div>
                <p className="p-3 bg-navy-800 rounded-xl border border-white/10 text-white/80 leading-relaxed">
                  "Across 38 responses, the top friction points were: 1) Auditorium audio echo in back rows (2 citations), 2) WiFi slowdown in Lab 4 at midnight. Overall NPS remains high at 88%."
                </p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="bg-white rounded-3xl p-8 sm:p-12 border border-charcoal/10 shadow-subtle grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-navy text-white flex items-center justify-center">
                  <GitCompare size={24} className="text-coral" />
                </div>
                <h3 className="text-2xl font-heading font-bold text-navy">Side-by-Side Event Benchmarking</h3>
                <p className="text-sm text-charcoal/70 leading-relaxed">
                  Stop looking at feedback in isolation. Compare consecutive workshops, hackathons, and symposiums side-by-side. Track whether satisfaction ratings increased, whether response rates improved, and whether previous recurring complaints were resolved.
                </p>
                <div className="flex items-center gap-3 text-xs font-semibold text-sage-dark">
                  <CheckCircle size={16} />
                  <span>Radar charts, sentiment distribution deltas, and task verification</span>
                </div>
              </div>
              <div className="bg-ivory rounded-2xl p-6 border border-charcoal/10 flex flex-col gap-4">
                <div className="flex items-center justify-between text-xs font-bold text-navy">
                  <span>Hackathon 2025 vs. Hackathon 2026</span>
                  <span className="text-sage-dark">+18% Satisfaction Delta</span>
                </div>
                <div className="w-full bg-white rounded-xl p-3 border border-charcoal/10 space-y-2 text-xs">
                  <div className="flex justify-between text-charcoal/70">
                    <span>Average Rating:</span>
                    <span className="font-bold text-navy">3.6 ★ ➔ 4.3 ★</span>
                  </div>
                  <div className="flex justify-between text-charcoal/70">
                    <span>Recurring Audio Complaints:</span>
                    <span className="font-bold text-coral">8 complaints ➔ 1 complaint</span>
                  </div>
                  <div className="flex justify-between text-charcoal/70">
                    <span>Response Rate:</span>
                    <span className="font-bold text-sage-dark">62% ➔ 95%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default FeaturesPage;
