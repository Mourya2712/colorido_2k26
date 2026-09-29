import React from 'react';
import { HomeHero } from '../../components/home/HomeHero';
import { AboutSection } from '../../components/home/AboutSection';
import { useNavigate } from 'react-router-dom';
import { useOutletContext } from 'react-router-dom';

interface OutletCtx { onOpenRegister: (event?: null) => void; }

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { onOpenRegister } = useOutletContext<OutletCtx>();

  return (
    <div className="animate-section-enter">
      <HomeHero
        onNavigate={(section) => navigate(`/${section}`)}
        onOpenRegister={() => onOpenRegister()}
      />
      <AboutSection
        onNavigate={(section) => navigate(`/${section}`)}
        onOpenRegister={() => onOpenRegister()}
      />
    </div>
  );
};

export default HomePage;
