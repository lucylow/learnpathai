import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge as BadgeUI } from '@/components/ui/badge';
import { Trophy, Award, Star, Sparkles, Crown } from 'lucide-react';

interface Badge {
  id: string;
  name: string;
  description: string;
  earnedAt: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

interface BadgesByRarity {
  common?: Badge[];
  rare?: Badge[];
  epic?: Badge[];
  legendary?: Badge[];
}

interface BadgeDisplayProps {
  userId: string;
  compact?: boolean;
}

const BadgeDisplay: React.FC<BadgeDisplayProps> = ({ userId, compact = false }) => {
  const [badges, setBadges] = useState<Badge[]>([]);
  const [badgesByRarity, setBadgesByRarity] = useState<BadgesByRarity>({});
  const [loading, setLoading] = useState(true);
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);

  useEffect(() => {
    fetchBadges();
  }, [userId]);

  const fetchBadges = async () => {
    try {
      const response = await fetch(`/api/gamify/badges/${userId}`);
      const data = await response.json();
      setBadges(data.badges || []);
      setBadgesByRarity(data.badgesByRarity || {});
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch badges:', error);
      setLoading(false);
    }
  };

  const getRarityColor = (rarity: string) => {
    const colors = {
      common: 'from-gray-400 to-gray-500',
      rare: 'from-blue-400 to-blue-600',
      epic: 'from-purple-400 to-purple-600',
      legendary: 'from-yellow-400 to-yellow-600'
    };
    return colors[rarity as keyof typeof colors] || colors.common;
  };

  const getRarityIcon = (rarity: string) => {
    const icons = {
      common: Award,
      rare: Star,
      epic: Trophy,
      legendary: Crown
    };
    const Icon = icons[rarity as keyof typeof icons] || Award;
    return Icon;
  };

  const getRarityLabel = (rarity: string) => {
    return rarity.charAt(0).toUpperCase() + rarity.slice(1);
  };

  if (loading) {
    return (
      <Card className="w-full">
        <CardContent className="p-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (badges.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Badges
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Trophy className="h-16 w-16 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">No badges earned yet</p>
            <p className="text-sm text-gray-400 mt-2">
              Complete challenges to earn your first badge!
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (compact) {
    return (
      <div className="flex flex-wrap gap-2">
        {badges.slice(0, 5).map((badge) => {
          const Icon = getRarityIcon(badge.rarity);
          return (
            <div
              key={badge.id}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-full bg-gradient-to-r ${getRarityColor(badge.rarity)} text-white text-sm font-medium shadow-md cursor-pointer hover:scale-105 transition-transform`}
              onClick={() => setSelectedBadge(badge)}
              title={badge.description}
            >
              <Icon className="h-3 w-3" />
              <span>{badge.name}</span>
            </div>
          );
        })}
        {badges.length > 5 && (
          <div className="flex items-center px-3 py-1.5 rounded-full bg-gray-200 text-gray-700 text-sm font-medium">
            +{badges.length - 5} more
          </div>
        )}
      </div>
    );
  }

  return (
    <>
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Badges Collection ({badges.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Legendary Badges */}
            {badgesByRarity.legendary && badgesByRarity.legendary.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-yellow-700 mb-3 flex items-center gap-2">
                  <Crown className="h-4 w-4" />
                  Legendary
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {badgesByRarity.legendary.map((badge) => (
                    <BadgeCard
                      key={badge.id}
                      badge={badge}
                      onClick={() => setSelectedBadge(badge)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Epic Badges */}
            {badgesByRarity.epic && badgesByRarity.epic.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-purple-700 mb-3 flex items-center gap-2">
                  <Trophy className="h-4 w-4" />
                  Epic
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {badgesByRarity.epic.map((badge) => (
                    <BadgeCard
                      key={badge.id}
                      badge={badge}
                      onClick={() => setSelectedBadge(badge)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Rare Badges */}
            {badgesByRarity.rare && badgesByRarity.rare.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-blue-700 mb-3 flex items-center gap-2">
                  <Star className="h-4 w-4" />
                  Rare
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {badgesByRarity.rare.map((badge) => (
                    <BadgeCard
                      key={badge.id}
                      badge={badge}
                      onClick={() => setSelectedBadge(badge)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Common Badges */}
            {badgesByRarity.common && badgesByRarity.common.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <Award className="h-4 w-4" />
                  Common
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {badgesByRarity.common.map((badge) => (
                    <BadgeCard
                      key={badge.id}
                      badge={badge}
                      onClick={() => setSelectedBadge(badge)}
                      compact
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Badge Detail Modal */}
      {selectedBadge && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedBadge(null)}
        >
          <div 
            className="bg-white rounded-lg p-8 max-w-md w-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center space-y-4">
              <div className={`inline-flex p-6 rounded-full bg-gradient-to-r ${getRarityColor(selectedBadge.rarity)} shadow-lg`}>
                {React.createElement(getRarityIcon(selectedBadge.rarity), {
                  className: "h-12 w-12 text-white"
                })}
              </div>
              <div>
                <BadgeUI 
                  variant="outline" 
                  className={`mb-2 ${
                    selectedBadge.rarity === 'legendary' ? 'border-yellow-500 text-yellow-700' :
                    selectedBadge.rarity === 'epic' ? 'border-purple-500 text-purple-700' :
                    selectedBadge.rarity === 'rare' ? 'border-blue-500 text-blue-700' :
                    'border-gray-500 text-gray-700'
                  }`}
                >
                  {getRarityLabel(selectedBadge.rarity)}
                </BadgeUI>
                <h3 className="text-2xl font-bold text-gray-900">
                  {selectedBadge.name}
                </h3>
              </div>
              <p className="text-gray-600">{selectedBadge.description}</p>
              <p className="text-sm text-gray-500">
                Earned {new Date(selectedBadge.earnedAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

interface BadgeCardProps {
  badge: Badge;
  onClick: () => void;
  compact?: boolean;
}

const BadgeCard: React.FC<BadgeCardProps> = ({ badge, onClick, compact = false }) => {
  const getRarityColor = (rarity: string) => {
    const colors = {
      common: 'from-gray-400 to-gray-500',
      rare: 'from-blue-400 to-blue-600',
      epic: 'from-purple-400 to-purple-600',
      legendary: 'from-yellow-400 to-yellow-600'
    };
    return colors[rarity as keyof typeof colors] || colors.common;
  };

  const getRarityIcon = (rarity: string) => {
    const icons = {
      common: Award,
      rare: Star,
      epic: Trophy,
      legendary: Crown
    };
    const Icon = icons[rarity as keyof typeof icons] || Award;
    return Icon;
  };

  const Icon = getRarityIcon(badge.rarity);

  if (compact) {
    return (
      <button
        onClick={onClick}
        className={`p-3 rounded-lg bg-gradient-to-br ${getRarityColor(badge.rarity)} text-white shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200 text-center`}
      >
        <Icon className="h-6 w-6 mx-auto mb-1" />
        <div className="text-xs font-medium truncate">{badge.name}</div>
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      className={`p-4 rounded-lg bg-gradient-to-br ${getRarityColor(badge.rarity)} text-white shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200 text-left`}
    >
      <div className="flex items-start gap-3">
        <Icon className="h-8 w-8 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-sm mb-1 truncate">{badge.name}</h4>
          <p className="text-xs opacity-90 line-clamp-2">{badge.description}</p>
          <p className="text-xs opacity-75 mt-2">
            {new Date(badge.earnedAt).toLocaleDateString()}
          </p>
        </div>
      </div>
    </button>
  );
};

export default BadgeDisplay;


