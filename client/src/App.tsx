import React, { useState } from 'react';
import type { SectionId, BaseEvent, SportsEvent } from './types';

import { AnnouncementTicker } from './components/common/AnnouncementTicker';
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { RegistrationModal } from './components/common/RegistrationModal';
import { HomeHero } from './components/home/HomeHero';
import { AboutSection } from './components/home/AboutSection';
import { CulturalSection } from './components/cultural/CulturalSection';
import { SportsSection } from './components/sports/SportsSection';

export const App: React.FC = () => {
  const [activeSection, setActiveSection] = useState<SectionId>('home');
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [selectedEventForRegistration, setSelectedEventForRegistration] = useState<
    BaseEvent | SportsEvent | null
  >(null);
  const [defaultRegCategory, setDefaultRegCategory] = useState<
    'cultural' | 'boysSports' | 'girlsSports'
  >('cultural');

  // Handle section switching with instant scroll-to-top
  const handleNavigate = (section: SectionId) => {
    setActiveSection(section);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Open registration modal for a specific event
  const handleRegisterEvent = (event: BaseEvent | SportsEvent) => {
    setSelectedEventForRegistration(event);
    setIsRegisterModalOpen(true);
  };

  // Open general registration modal from Nav / Ticker / CTA
  const handleOpenGeneralRegister = () => {
    setSelectedEventForRegistration(null);
    if (activeSection === 'sports') {
      setDefaultRegCategory('boysSports');
    } else {
      setDefaultRegCategory('cultural');
    }
    setIsRegisterModalOpen(true);
  };

  return (
    <div className="min-h-screen w-full flex flex-col bg-[#07070a] text-slate-100 selection:bg-purple-600 selection:text-white font-['Plus_Jakarta_Sans']">
      {/* 1. Global Scrolling Announcement Ticker */}
      <AnnouncementTicker onRegisterClick={handleOpenGeneralRegister} />

      {/* 2. Global Minimal Cinematic Navbar */}
      <Navbar
        activeSection={activeSection}
        onNavigate={handleNavigate}
        onOpenRegister={handleOpenGeneralRegister}
      />

      {/* 3. Main Dynamic Content with Cinematic Page Transitions */}
      <main className="flex-1 w-full transition-opacity duration-300">
        {activeSection === 'home' && (
          <div className="animate-in fade-in duration-300 space-y-0">
            <HomeHero
              onNavigate={handleNavigate}
              onOpenRegister={handleOpenGeneralRegister}
            />
            <AboutSection
              onNavigate={handleNavigate}
              onOpenRegister={handleOpenGeneralRegister}
            />
          </div>
        )}

        {activeSection === 'cultural' && (
          <div className="animate-in fade-in duration-300">
            <CulturalSection
              onRegisterEvent={handleRegisterEvent}
              onOpenRegister={handleOpenGeneralRegister}
            />
          </div>
        )}

        {activeSection === 'sports' && (
          <div className="animate-in fade-in duration-300">
            <SportsSection
              onRegisterEvent={handleRegisterEvent}
              onOpenRegister={handleOpenGeneralRegister}
            />
          </div>
        )}
      </main>

      {/* 4. Global Useful Footer */}
      <Footer
        onNavigate={handleNavigate}
        onOpenRegister={handleOpenGeneralRegister}
      />

      {/* 5. Centralized Confirmation Registration Modal */}
      <RegistrationModal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
        selectedEvent={selectedEventForRegistration}
        defaultCategory={defaultRegCategory}
      />
    </div>
  );
};

export default App;
