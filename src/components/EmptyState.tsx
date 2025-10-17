import { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { motion } from 'framer-motion';

interface EmptyStateProps {
  icon?: LucideIcon;
  emoji?: string;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  emoji,
  title,
  description,
  action,
  secondaryAction,
  className = '',
}) => {
  return (
    <Card className={`p-8 sm:p-12 ${className}`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col items-center text-center max-w-md mx-auto"
      >
        {/* Icon/Emoji */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
          className="mb-6"
        >
          {Icon && (
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Icon className="w-8 h-8 text-primary" />
            </div>
          )}
          {emoji && !Icon && (
            <div className="text-6xl mb-2">{emoji}</div>
          )}
        </motion.div>

        {/* Title */}
        <h3 className="text-xl sm:text-2xl font-semibold text-foreground mb-2">
          {title}
        </h3>

        {/* Description */}
        {description && (
          <p className="text-sm sm:text-base text-muted-foreground mb-6 max-w-sm">
            {description}
          </p>
        )}

        {/* Actions */}
        {(action || secondaryAction) && (
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            {action && (
              <Button
                onClick={action.onClick}
                size="lg"
                className="w-full sm:w-auto"
              >
                {action.label}
              </Button>
            )}
            {secondaryAction && (
              <Button
                onClick={secondaryAction.onClick}
                variant="outline"
                size="lg"
                className="w-full sm:w-auto"
              >
                {secondaryAction.label}
              </Button>
            )}
          </div>
        )}
      </motion.div>
    </Card>
  );
};

// Specific empty state variants
export const NoCourses: React.FC<{ onAddCourse: () => void }> = ({ onAddCourse }) => (
  <EmptyState
    emoji="📚"
    title="No courses yet"
    description="Start your learning journey by adding your first course"
    action={{
      label: "Browse Courses",
      onClick: onAddCourse,
    }}
  />
);

export const NoAchievements: React.FC = () => (
  <EmptyState
    emoji="🏆"
    title="No achievements yet"
    description="Complete challenges and earn your first achievement!"
  />
);

export const NoActivity: React.FC = () => (
  <EmptyState
    emoji="📊"
    title="No activity yet"
    description="Your recent learning activity will appear here"
  />
);

export const NoResults: React.FC<{ onReset?: () => void }> = ({ onReset }) => (
  <EmptyState
    emoji="🔍"
    title="No results found"
    description="Try adjusting your search or filters"
    action={onReset ? {
      label: "Clear Filters",
      onClick: onReset,
    } : undefined}
  />
);

