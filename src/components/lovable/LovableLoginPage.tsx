/**
 * Lovable Login Page Component
 * Uses Lovable's built-in authentication UI
 */

import React from 'react';
import { lovable } from '../../lib/lovable';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';

export const LovableLoginPage: React.FC = () => {
  const navigate = useNavigate();

  const handleSuccess = () => {
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            LearnPath AI
          </CardTitle>
          <CardDescription className="text-lg mt-2">
            Personalized STEM Learning Pathways
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Lovable built-in auth UI */}
          <lovable.auth.SignIn
            onSuccess={handleSuccess}
            providers={['google', 'github', 'email']}
            appearance={{
              theme: 'light',
              variables: {
                colorPrimary: '#4F46E5',
              },
            }}
          />
          
          <div className="mt-6 text-center text-sm text-gray-600">
            <p>✨ AI-powered learning paths</p>
            <p>📊 Adaptive knowledge tracing</p>
            <p>🎯 Personalized recommendations</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};


