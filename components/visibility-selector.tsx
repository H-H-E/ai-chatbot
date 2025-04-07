'use client';

import { useMemo } from 'react';
import { cn } from '@/lib/utils';
import { GlobeIcon, LockIcon } from './icons';
import { useChatVisibility } from '@/hooks/use-chat-visibility';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export type VisibilityType = 'private' | 'public';

const visibilities = [
  {
    id: 'private' as const,
    label: 'Private',
    description: 'Only you can access this chat',
    icon: <LockIcon />,
  },
  {
    id: 'public' as const,
    label: 'Public',
    description: 'Anyone with the link can access this chat',
    icon: <GlobeIcon />,
  },
];

export function VisibilitySelector({
  chatId,
  className,
  selectedVisibilityType,
}: {
  chatId: string;
  className?: string;
  selectedVisibilityType: VisibilityType;
}) {
  const { visibilityType, setVisibilityType } = useChatVisibility({
    chatId,
    initialVisibility: selectedVisibilityType,
  });

  const selectedVisibility = useMemo(
    () => visibilities.find((visibility) => visibility.id === visibilityType),
    [visibilityType],
  );

  const isPublic = visibilityType === 'public';

  const toggleVisibility = () => {
    setVisibilityType(isPublic ? 'private' : 'public');
  };

  return (
    <div className={cn('flex items-center space-x-2', className)}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            onClick={toggleVisibility}
            className="flex items-center space-x-2 rounded-md px-2 py-1 hover:bg-accent/50"
          >
            {selectedVisibility?.icon}
          </button>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          {selectedVisibility?.description}
        </TooltipContent>
      </Tooltip>
    </div>
  );
}
