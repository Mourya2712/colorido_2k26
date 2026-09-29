import React, { useState } from 'react';
import { Phone, Mail, MapPin, Send, HelpCircle, MessageSquare, ChevronDown, ChevronUp } from 'lucide-react';
import toast from 'react-hot-toast';

interface FAQ {
  q: string;
  a: string;
}

const FAQS: FAQ[] = [
  {
    q: 'Who is eligible to participate in COLORIDO 2K26?',
    a: 'Any bonafide undergraduate or postgraduate student from recognized Engineering, Arts & Science, or Management colleges across India holding a valid college ID card is eligible.',
  },
  {
    q: 'Is spot registration available during festival days?',
    a: 'Spot registrations will be available on Day 1 between 8:00 AM and 10:00 AM at the central registration counters, strictly subject to slot availability. Prior online registration is strongly recommended to guarantee participation.',
  },
  {
    q: 'Will accommodation and food be provided for outstation teams?',
    a: 'Yes, complimentary hostel accommodation and subsidized meals are provided for registered outstation teams traveling from distances exceeding 100 km. Please inform the hospitality team 48 hours in advance.',
  },
  {
    q: 'Can a student participate in multiple cultural and sports events?',
    a: 'Yes, as long as schedules do not clash. Please consult the Schedule page when selecting your competitive events.',
  },
  {
    q: 'Are music tracks/costumes provided by the college?',
    a: 'Participants must bring their own backing tracks in MP3/WAV format on a pendrive to the audio control console at least 45 minutes prior to their event.',
  },
];

const ContactPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    college: '',
    subject: 'General Query',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      toast.error('Please fill in all mandatory fields.');
      return;
    }
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      toast.success('Your message has been received! Our coordinators will contact you shortly.');
      setFormData({
        name: '',
        email: '',
        phone: '',
        college: '',
        subject: 'General Query',
        message: '',
      });
    }, 800);
  };

  return (
    <div className="min-h-screen bg-[#07070a] pt-24 pb-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center py-8 space-y-4">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-xs font-bold uppercase tracking-widest text-purple-300">
            <Phone className="w-3.5 h-3.5" />
            <span>Connect & Support</span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white uppercase font-['Outfit'] tracking-tight">
            Contact <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400">Festival Desk</span>
          </h1>
          <p className="max-w-2xl mx-auto text-slate-400 text-sm sm:text-base">
            Have questions regarding events, rules, team lodging, or registration? Get in touch with our faculty and student conveners.
          </p>
        </div>

        {/* Contact Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-14">
          <div className="rounded-2xl border border-white/10 bg-[#0f0c1b]/80 p-6 backdrop-blur-md">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 mb-4">
              <MapPin className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">Venue Location</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              R.V.R. & J.C. College of Engineering (Autonomous)<br />
              Chandramoulipuram, Chowdavaram,<br />
              Guntur, Andhra Pradesh — 522019
            </p>
            <div className="mt-3">
              <a
                href="https://maps.google.com/?q=R.V.R.+%26+J.C.+College+of+Engineering+Chowdavaram+Guntur"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-purple-600/20 hover:bg-purple-600/40 border border-purple-500/30 text-purple-300 hover:text-white text-xs font-semibold transition-all cursor-pointer"
              >
                <span>View on Google Maps</span>
                <span className="text-[10px]">↗</span>
              </a>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#0f0c1b]/80 p-6 backdrop-blur-md">
            <div className="w-10 h-10 rounded-xl bg-pink-500/10 border border-pink-500/30 flex items-center justify-center text-pink-400 mb-4">
              <Phone className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">Helpline Numbers</h3>
            <div className="text-xs text-slate-300 space-y-1 leading-relaxed">
              <p><strong className="text-white">Cultural Conveners:</strong> +91 98480 12345 / 94401 23456</p>
              <p><strong className="text-white">Sports Incharge:</strong> +91 98492 78901 / 93902 45678</p>
              <p><strong className="text-white">Hospitality Desk:</strong> +91 86322 88201</p>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#0f0c1b]/80 p-6 backdrop-blur-md">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mb-4">
              <Mail className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">Email Addresses</h3>
            <div className="text-xs text-slate-300 space-y-1.5 leading-relaxed">
              <p><strong className="text-white">Festival Office:</strong> colorido2k26@rvrjc.ac.in</p>
              <p><strong className="text-white">Registrations:</strong> registrations.colorido@rvrjc.ac.in</p>
              <p><strong className="text-white">Sponsorship:</strong> partners.colorido@rvrjc.ac.in</p>
            </div>
          </div>
        </div>

        {/* Form and FAQ Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-14">
          {/* Inquiry Form */}
          <div className="lg:col-span-6 rounded-3xl border border-white/10 bg-[#0f0c1b]/90 p-6 sm:p-8 backdrop-blur-md">
            <div className="flex items-center space-x-2 text-xs font-bold text-purple-400 uppercase tracking-wider mb-2">
              <MessageSquare className="w-4 h-4" />
              <span>Direct Query Desk</span>
            </div>
            <h3 className="text-2xl font-black text-white font-['Outfit'] mb-6">Send Us a Message</h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">Your Full Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Rahul Sharma"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="you@college.edu"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">Mobile Number</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+91 9876543210"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">College / Institution</label>
                  <input
                    type="text"
                    value={formData.college}
                    onChange={(e) => setFormData({ ...formData, college: e.target.value })}
                    placeholder="College Name"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">Inquiry Topic</label>
                <select
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#141026] border border-white/10 text-xs text-white focus:outline-none focus:border-purple-500"
                >
                  <option value="General Query">General Query</option>
                  <option value="Cultural Competitions">Cultural Competitions</option>
                  <option value="Sports Fixtures & Rules">Sports Fixtures & Rules</option>
                  <option value="Registration Issues">Registration Issues</option>
                  <option value="Hostel Accommodation">Hostel Accommodation & Transport</option>
                  <option value="Sponsorship & Stalls">Sponsorship & Stalls</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">Message / Inquiry *</label>
                <textarea
                  required
                  rows={4}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Tell us what you'd like assistance with..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center space-x-2 shadow-lg shadow-purple-500/20 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span>Sending Message...</span>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Submit Query</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* FAQs Accordion */}
          <div className="lg:col-span-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center space-x-2 text-xs font-bold text-indigo-400 uppercase tracking-wider mb-2">
                <HelpCircle className="w-4 h-4" />
                <span>Frequently Asked Questions</span>
              </div>
              <h3 className="text-2xl font-black text-white font-['Outfit'] mb-6">Quick Answers</h3>

              <div className="space-y-3">
                {FAQS.map((faq, i) => (
                  <div
                    key={i}
                    className="rounded-2xl border border-white/10 bg-[#0f0c1b]/60 overflow-hidden transition-colors"
                  >
                    <button
                      onClick={() => setOpenFaq(openFaq === i ? null : i)}
                      className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-white/[0.02]"
                    >
                      <span className="text-xs sm:text-sm font-bold text-white pr-4">{faq.q}</span>
                      {openFaq === i ? (
                        <ChevronUp className="w-4 h-4 text-purple-400 shrink-0" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                      )}
                    </button>
                    {openFaq === i && (
                      <div className="px-5 pb-4 text-xs text-slate-300 leading-relaxed border-t border-white/5 pt-3">
                        {faq.a}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Travel Directions Note */}
            <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.02] p-4 text-xs text-slate-400 flex items-start space-x-3">
              <MapPin className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-200">How to reach RVR&JC:</strong> 14 km from Guntur RTC Central Bus Station & Railway Station along NH16 (Chilakaluripet highway). Regular city buses and auto shuttles operate directly to the college main arch gate.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
