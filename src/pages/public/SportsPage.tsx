import React from 'react';
import { useOutletContext } from 'react-router-dom';
import { SportsSection } from '../../components/sports/SportsSection';
import type { SportsEvent } from '../../types';

interface OutletCtx { onOpenRegister: (event?: SportsEvent | null) => void; }

const SportsPage: React.FC = () => {
  const { onOpenRegister } = useOutletContext<OutletCtx>();
  return (
    <div className="animate-section-enter">
      <SportsSection
        onRegisterEvent={(event) => onOpenRegister(event)}
        onOpenRegister={() => onOpenRegister()}
      />
    </div>
  );
};

export default SportsPage;
