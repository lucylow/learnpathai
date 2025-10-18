import { motion } from 'framer-motion';

// Shimmer animation for skeleton loaders
const shimmer = {
  animate: {
    backgroundPosition: ['200% 0', '-200% 0'],
  },
  transition: {
    duration: 2,
    repeat: Infinity,
    ease: 'linear' as const,
  },
};

const skeletonClass =
  'bg-gradient-to-r from-muted via-muted/60 to-muted animate-shimmer';

// Dashboard Skeleton
export const DashboardSkeleton = () => (
  <div className="max-w-7xl mx-auto p-6 space-y-8">
    {/* Header skeleton */}
    <div className="space-y-3">
      <motion.div
        className={`h-10 w-64 ${skeletonClass} rounded-lg`}
        style={{ backgroundSize: '200% 100%' }}
        {...shimmer}
      />
      <motion.div
        className={`h-6 w-96 ${skeletonClass} rounded-lg`}
        style={{ backgroundSize: '200% 100%' }}
        {...shimmer}
      />
    </div>

    {/* Metrics grid skeleton */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {[1, 2, 3, 4].map((i) => (
        <motion.div
          key={i}
          className={`h-32 ${skeletonClass} rounded-2xl`}
          style={{ backgroundSize: '200% 100%' }}
          {...shimmer}
        />
      ))}
    </div>

    {/* Charts skeleton */}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <motion.div
        className={`lg:col-span-2 h-80 ${skeletonClass} rounded-2xl`}
        style={{ backgroundSize: '200% 100%' }}
        {...shimmer}
      />
      <motion.div
        className={`h-80 ${skeletonClass} rounded-2xl`}
        style={{ backgroundSize: '200% 100%' }}
        {...shimmer}
      />
    </div>

    {/* Learning path skeleton */}
    <motion.div
      className={`h-96 ${skeletonClass} rounded-2xl`}
      style={{ backgroundSize: '200% 100%' }}
      {...shimmer}
    />
  </div>
);

// Path Step Skeleton
export const PathStepSkeleton = () => (
  <div className="space-y-4">
    {[1, 2, 3, 4].map((i) => (
      <motion.div
        key={i}
        className={`h-32 ${skeletonClass} rounded-xl`}
        style={{ backgroundSize: '200% 100%' }}
        {...shimmer}
      />
    ))}
  </div>
);

// Course Card Skeleton
export const CourseCardSkeleton = () => (
  <div className="space-y-4">
    <div className="grid md:grid-cols-2 gap-6">
      {[1, 2, 3, 4].map((i) => (
        <motion.div
          key={i}
          className={`h-64 ${skeletonClass} rounded-2xl`}
          style={{ backgroundSize: '200% 100%' }}
          {...shimmer}
        />
      ))}
    </div>
  </div>
);

// Knowledge Graph Skeleton
export const GraphSkeleton = () => (
  <div className="relative w-full h-[600px] bg-gradient-to-br from-primary/5 to-accent/5 rounded-xl border border-border overflow-hidden">
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="space-y-4 text-center">
        <motion.div
          className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full mx-auto"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        />
        <p className="text-sm text-muted-foreground">Loading knowledge graph...</p>
      </div>
    </div>

    {/* Decorative circles */}
    {[1, 2, 3, 4, 5].map((i) => (
      <motion.div
        key={i}
        className={`absolute w-20 h-20 ${skeletonClass} rounded-full opacity-30`}
        style={{
          top: `${Math.random() * 80 + 10}%`,
          left: `${Math.random() * 80 + 10}%`,
          backgroundSize: '200% 100%',
        }}
        {...shimmer}
      />
    ))}
  </div>
);

// Table Skeleton
export const TableSkeleton = ({ rows = 5 }: { rows?: number }) => (
  <div className="space-y-3">
    {/* Header */}
    <motion.div
      className={`h-12 ${skeletonClass} rounded-lg`}
      style={{ backgroundSize: '200% 100%' }}
      {...shimmer}
    />

    {/* Rows */}
    {Array.from({ length: rows }).map((_, i) => (
      <motion.div
        key={i}
        className={`h-16 ${skeletonClass} rounded-lg`}
        style={{ backgroundSize: '200% 100%' }}
        {...shimmer}
      />
    ))}
  </div>
);

// Text Block Skeleton
export const TextSkeleton = ({ lines = 3 }: { lines?: number }) => (
  <div className="space-y-2">
    {Array.from({ length: lines }).map((_, i) => (
      <motion.div
        key={i}
        className={`h-4 ${skeletonClass} rounded`}
        style={{
          width: i === lines - 1 ? '80%' : '100%',
          backgroundSize: '200% 100%',
        }}
        {...shimmer}
      />
    ))}
  </div>
);

// Avatar Skeleton
export const AvatarSkeleton = ({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' | 'xl' }) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24',
  };

  return (
    <motion.div
      className={`${sizeClasses[size]} ${skeletonClass} rounded-full`}
      style={{ backgroundSize: '200% 100%' }}
      {...shimmer}
    />
  );
};

// Button Skeleton
export const ButtonSkeleton = ({ width = 'w-32' }: { width?: string }) => (
  <motion.div
    className={`h-10 ${width} ${skeletonClass} rounded-lg`}
    style={{ backgroundSize: '200% 100%' }}
    {...shimmer}
  />
);

// Card Skeleton
export const CardSkeleton = () => (
  <div className="bg-background rounded-xl p-6 shadow-sm border border-border space-y-4">
    {/* Header */}
    <div className="flex items-center gap-4">
      <AvatarSkeleton size="lg" />
      <div className="flex-1 space-y-2">
        <motion.div
          className={`h-6 w-3/4 ${skeletonClass} rounded`}
          style={{ backgroundSize: '200% 100%' }}
          {...shimmer}
        />
        <motion.div
          className={`h-4 w-1/2 ${skeletonClass} rounded`}
          style={{ backgroundSize: '200% 100%' }}
          {...shimmer}
        />
      </div>
    </div>

    {/* Content */}
    <TextSkeleton lines={3} />

    {/* Footer */}
    <div className="flex gap-2">
      <ButtonSkeleton width="w-24" />
      <ButtonSkeleton width="w-32" />
    </div>
  </div>
);

// Loading Spinner (for fallback)
export const LoadingSpinner = ({ size = 'md', label = 'Loading...' }: { size?: 'sm' | 'md' | 'lg' | 'xl'; label?: string }) => {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
    xl: 'w-16 h-16 border-4',
  };

  return (
    <div className="flex flex-col items-center justify-center gap-3 p-8">
      <motion.div
        className={`${sizeClasses[size]} border-primary border-t-transparent rounded-full`}
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      />
      {label && (
        <p className="text-sm text-muted-foreground font-medium">{label}</p>
      )}
    </div>
  );
};

