import React from 'react';
import { useOutletContext } from 'react-router-dom';
import { CulturalSection } from '../../components/cultural/CulturalSection';
import type { BaseEvent } from '../../types';

interface OutletCtx { onOpenRegister: (event?: BaseEvent | null) => void; }

const CulturalPage: React.FC = () => {
  const { onOpenRegister } = useOutletContext<OutletCtx>();
  return (
    <div className="animate-section-enter">
      <CulturalSection
        onRegisterEvent={(event) => onOpenRegister(event)}
        onOpenRegister={() => onOpenRegister()}
      />
    </div>
  );
};

export default CulturalPage;
