import React from 'react';
import { Sparkles } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  actionLabel,
  onAction,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-card border border-dashed border-border rounded-2xl shadow-sm max-w-lg mx-auto">
      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-6 animate-pulse">
        <Sparkles size={28} />
      </div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-muted-foreground mb-6 text-sm leading-relaxed">{description}</p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="px-5 py-2.5 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/95 shadow-md hover:shadow-lg transition-all"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};
