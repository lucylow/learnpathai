import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ageGroups, getAgeGroupByAge } from '@/config/ageGroups';
import type { AgeGroup, AgeGroupId } from '@/types/ageGroups';
import { track } from '@/utils/telemetry';

interface AgeGroupSelectorProps {
  onSelect: (ageGroup: AgeGroup, age: number) => void;
  initialAge?: number;
}

export const AgeGroupSelector: React.FC<AgeGroupSelectorProps> = ({ 
  onSelect, 
  initialAge 
}) => {
  const [selectedAgeGroup, setSelectedAgeGroup] = useState<AgeGroupId | null>(
    initialAge ? getAgeGroupByAge(initialAge).id : null
  );
  const [age, setAge] = useState<number>(initialAge || 0);
  const [showAgeInput, setShowAgeInput] = useState<boolean>(false);

  const handleAgeGroupClick = (ageGroup: AgeGroup) => {
    setSelectedAgeGroup(ageGroup.id);
    const midpointAge = Math.floor((ageGroup.minAge + ageGroup.maxAge) / 2);
    setAge(midpointAge);
    
    track('age_group_selected', {
      ageGroupId: ageGroup.id,
      ageGroupLabel: ageGroup.label,
    });
  };

  const handleAgeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newAge = parseInt(e.target.value, 10);
    if (!isNaN(newAge) && newAge > 0 && newAge < 100) {
      setAge(newAge);
      const matchedGroup = getAgeGroupByAge(newAge);
      setSelectedAgeGroup(matchedGroup.id);
    }
  };

  const handleContinue = () => {
    if (selectedAgeGroup && age > 0) {
      const ageGroup = ageGroups.find(ag => ag.id === selectedAgeGroup);
      if (ageGroup) {
        track('age_selection_confirmed', {
          ageGroupId: ageGroup.id,
          age,
        });
        onSelect(ageGroup, age);
      }
    }
  };

  return (
    <div className="container mx-auto px-6 py-12 max-w-6xl">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-foreground mb-3">
          Choose Your Learning Level
        </h1>
        <p className="text-xl text-muted-foreground">
          Select your age group to get personalized learning content
        </p>
      </div>

      {/* Age Group Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {ageGroups.map((ageGroup) => (
          <Card
            key={ageGroup.id}
            className={`cursor-pointer transition-all hover:shadow-lg ${
              selectedAgeGroup === ageGroup.id
                ? 'ring-2 ring-primary shadow-lg'
                : ''
            }`}
            onClick={() => handleAgeGroupClick(ageGroup)}
            style={{
              borderColor: selectedAgeGroup === ageGroup.id ? ageGroup.color : undefined,
            }}
          >
            <CardHeader>
              <div className="flex items-center justify-between mb-2">
                <span className="text-4xl" role="img" aria-label={ageGroup.label}>
                  {ageGroup.icon}
                </span>
                {selectedAgeGroup === ageGroup.id && (
                  <Badge className="ml-2">Selected</Badge>
                )}
              </div>
              <CardTitle className="text-xl">{ageGroup.label}</CardTitle>
              <CardDescription>
                Ages {ageGroup.minAge}-{ageGroup.maxAge}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                {ageGroup.description}
              </p>
              <div className="space-y-2">
                <div className="text-xs font-semibold text-foreground">
                  Key Features:
                </div>
                <div className="flex flex-wrap gap-1">
                  <Badge variant="secondary" className="text-xs">
                    {ageGroup.uiPreferences.interactionStyle}
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    {ageGroup.contentRestrictions.maxVideoDuration}min lessons
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Age Input Option */}
      <div className="flex justify-center mb-8">
        <Button
          variant="outline"
          onClick={() => setShowAgeInput(!showAgeInput)}
        >
          {showAgeInput ? 'Hide' : 'Or enter'} your exact age
        </Button>
      </div>

      {showAgeInput && (
        <Card className="max-w-md mx-auto mb-8">
          <CardHeader>
            <CardTitle className="text-lg">Enter Your Age</CardTitle>
            <CardDescription>
              We'll automatically match you to the right level
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="age">Age</Label>
                <Input
                  id="age"
                  type="number"
                  min="3"
                  max="99"
                  value={age || ''}
                  onChange={handleAgeChange}
                  placeholder="Enter your age"
                  className="mt-2"
                />
              </div>
              {age > 0 && selectedAgeGroup && (
                <div className="p-3 bg-primary/10 rounded-lg">
                  <p className="text-sm">
                    Based on your age ({age}), we recommend:{' '}
                    <span className="font-semibold">
                      {ageGroups.find(ag => ag.id === selectedAgeGroup)?.label}
                    </span>
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Continue Button */}
      {selectedAgeGroup && age > 0 && (
        <div className="flex justify-center">
          <Button
            size="lg"
            onClick={handleContinue}
            className="px-8"
          >
            Continue to Learning Dashboard
          </Button>
        </div>
      )}

      {/* Learning Objectives Preview */}
      {selectedAgeGroup && (
        <Card className="mt-8 max-w-4xl mx-auto bg-gradient-to-r from-primary/5 to-accent/5">
          <CardHeader>
            <CardTitle>What You'll Learn</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {ageGroups
                .find(ag => ag.id === selectedAgeGroup)
                ?.learningObjectives.map((objective, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-primary mt-1">✓</span>
                    <span className="text-muted-foreground">{objective}</span>
                  </li>
                ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

