import React, { useState, useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Navbar } from '../components/common/Navbar';
import { Footer } from '../components/common/Footer';
import { AnnouncementTicker } from '../components/common/AnnouncementTicker';
import { RegistrationModal } from '../components/common/RegistrationModal';
import type { BaseEvent, SportsEvent, SectionId } from '../types';

const PublicLayout: React.FC = () => {
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<BaseEvent | SportsEvent | null>(null);
  const location = useLocation();
  const navigate = useNavigate();

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location.pathname]);

  const activeSection: SectionId = location.pathname.startsWith('/cultural')
    ? 'cultural'
    : location.pathname.startsWith('/sports')
    ? 'sports'
    : 'home';

  const handleNavigate = (section: SectionId) => {
    navigate(section === 'home' ? '/' : `/${section}`);
  };

  const handleOpenRegister = (event?: any) => {
    if (event && (event.slug || event.id)) {
      navigate(`/register/${event.slug || event.id}`);
    } else {
      navigate('/register');
    }
  };

  const handleCloseRegister = () => {
    setIsRegisterModalOpen(false);
    setSelectedEvent(null);
  };

  return (
    <div className="min-h-screen bg-[#07070a] text-slate-100 flex flex-col overflow-x-hidden">
      <AnnouncementTicker onRegisterClick={() => handleOpenRegister()} />
      <Navbar
        activeSection={activeSection}
        onNavigate={handleNavigate}
        onOpenRegister={() => handleOpenRegister()}
      />

      <main className="flex-1 w-full">
        <Outlet context={{ onOpenRegister: handleOpenRegister }} />
      </main>

      <Footer
        onNavigate={handleNavigate}
        onOpenRegister={() => handleOpenRegister()}
      />

      <RegistrationModal
        isOpen={isRegisterModalOpen}
        onClose={handleCloseRegister}
        selectedEvent={selectedEvent}
      />
    </div>
  );
};

export default PublicLayout;
