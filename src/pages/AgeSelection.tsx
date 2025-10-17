import { useNavigate } from 'react-router-dom';
import { AgeGroupSelector } from '@/components/AgeGroupSelector';
import type { AgeGroup } from '@/types/ageGroups';

export default function AgeSelection() {
  const navigate = useNavigate();

  const handleAgeGroupSelect = (ageGroup: AgeGroup, age: number) => {
    // Store age group selection in localStorage
    localStorage.setItem('userAgeGroup', ageGroup.id);
    localStorage.setItem('userAge', age.toString());
    
    // Navigate to dashboard
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-background">
      <AgeGroupSelector onSelect={handleAgeGroupSelect} />
    </div>
  );
}

