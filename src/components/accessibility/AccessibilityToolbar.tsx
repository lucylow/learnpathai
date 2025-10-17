/**
 * Floating Accessibility Toolbar
 * Quick access to accessibility features from anywhere in the app
 */

import React, { useState } from 'react';
import { useAccessibility } from '../../contexts/AccessibilityContext';
import { Button } from '../ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem
} from '../ui/dropdown-menu';
import { Accessibility, Volume2, Type, Eye, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const AccessibilityToolbar: React.FC = () => {
  const { profile, updatePreference, isFeatureEnabled } = useAccessibility();
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <div 
      className="fixed bottom-6 right-6 z-50"
      role="toolbar"
      aria-label="Quick accessibility controls"
    >
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            size="lg"
            className="rounded-full h-14 w-14 shadow-lg"
            aria-label="Open accessibility menu"
            title="Accessibility Options"
          >
            <Accessibility className="h-6 w-6" />
          </Button>
        </DropdownMenuTrigger>
        
        <DropdownMenuContent align="end" className="w-64">
          <DropdownMenuLabel className="text-base">
            Quick Accessibility
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          <DropdownMenuCheckboxItem
            checked={profile.preferences.visual.highContrast}
            onCheckedChange={(checked) =>
              updatePreference('visual', 'highContrast', checked)
            }
          >
            <Eye className="mr-2 h-4 w-4" />
            High Contrast
          </DropdownMenuCheckboxItem>

          <DropdownMenuCheckboxItem
            checked={profile.preferences.cognitive.readingAssistance}
            onCheckedChange={(checked) =>
              updatePreference('cognitive', 'readingAssistance', checked)
            }
          >
            <Volume2 className="mr-2 h-4 w-4" />
            Reading Assistance
          </DropdownMenuCheckboxItem>

          <DropdownMenuCheckboxItem
            checked={profile.preferences.cognitive.simplifiedLayout}
            onCheckedChange={(checked) =>
              updatePreference('cognitive', 'simplifiedLayout', checked)
            }
          >
            <Type className="mr-2 h-4 w-4" />
            Simplified Layout
          </DropdownMenuCheckboxItem>

          <DropdownMenuSeparator />
          
          <DropdownMenuItem onClick={() => navigate('/accessibility-settings')}>
            <Settings className="mr-2 h-4 w-4" />
            All Settings
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default AccessibilityToolbar;

