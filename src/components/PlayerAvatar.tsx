import { getInitials } from '@/lib/imageUtils';

interface PlayerAvatarProps {
  name: string;
  avatar?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeClasses = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-12 h-12 text-sm',
  lg: 'w-24 h-24 text-2xl',
  xl: 'w-32 h-32 text-3xl',
};

export default function PlayerAvatar({ name, avatar, size = 'md', className = '' }: PlayerAvatarProps) {
  const initials = getInitials(name);
  
  return (
    <div className={`${sizeClasses[size]} border-2 border-foreground flex items-center justify-center font-semibold ${className}`}>
      {avatar ? (
        <img src={avatar} alt={name} className="w-full h-full object-cover" />
      ) : (
        <span>{initials}</span>
      )}
    </div>
  );
}