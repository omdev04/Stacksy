import React from 'react';
import { db } from '../../db/client';
import { useStore } from '../../store/useStore';
import { Avatar } from '../Shared/Avatar';
import { AlertCircle, Compass, MessageSquare } from 'lucide-react';

interface FeedItem {
  id: string;
  type: 'comment' | 'reaction';
  username: string;
  userColor: string;
  text?: string;
  emoji?: string;
  imageId: string;
  createdAt: number;
  imageThumb?: string;
  imageUrl?: string;
  imageAuthor?: string;
  imageDesc?: string;
}

interface GroupedFeedItem {
  id: string;
  username: string;
  userColor: string;
  imageId: string;
  imageThumb?: string;
  imageUrl?: string;
  imageAuthor?: string;
  imageDesc?: string;
  createdAt: number;
  activities: FeedItem[];
}

// Shimmer Skeleton Loading Component for a premium feel
const StreamSkeleton: React.FC = () => {
  return (
    <div className="divide-y divide-neutral-900/60 select-none animate-pulse">
      {Array.from({ length: 5 }).map((_, index) => (
        <div key={index} className="p-brand-3 px-brand-4 flex items-start gap-brand-3">
          {/* Avatar Skeleton */}
          <div className="w-7 h-7 rounded-brand-md bg-brand-surface-base/30 shrink-0" />
          
          {/* Text Summary Skeleton */}
          <div className="flex-1 min-w-0 py-brand-1">
            <div className="flex items-center justify-between gap-brand-2">
              <div className="h-3 w-16 bg-brand-surface-base/30 rounded-brand-xs" />
              <div className="h-2 w-10 bg-brand-surface-base/30 rounded-brand-xs" />
            </div>
            <div className="h-3 w-full bg-brand-surface-base/30 rounded-brand-xs mt-brand-2" />
          </div>
          
          {/* Mini Image Preview Skeleton */}
          <div className="w-8 h-8 rounded-brand-xs bg-brand-surface-base/30 shrink-0" />
        </div>
      ))}
    </div>
  );
};

// Rich Error Component
interface StreamErrorProps {
  message: string;
}

const StreamError: React.FC<StreamErrorProps> = ({ message }) => {
  return (
    <div className="p-brand-4 flex flex-col items-center justify-center text-center gap-brand-2 select-none min-h-[200px]">
      <AlertCircle className="w-8 h-8 text-red-500 mb-brand-1 shrink-0 animate-bounce" />
      <h3 className="text-brand-xs font-bold text-white uppercase tracking-wider">Feed Sync Failed</h3>
      <p className="text-brand-xs text-brand-text-tertiary max-w-[200px] leading-relaxed">
        {message || 'Unable to establish connections. Please check your network.'}
      </p>
    </div>
  );
};

// Beautiful Empty State Component
const StreamEmpty: React.FC = () => {
  return (
    <div className="p-brand-4 py-8 flex flex-col items-center justify-center text-center gap-brand-2 select-none min-h-[200px]">
      <Compass className="w-8 h-8 text-brand-text-tertiary mb-brand-1 shrink-0" />
      <h3 className="text-brand-xs font-bold text-white uppercase tracking-wider">Stream is quiet</h3>
      <p className="text-brand-xs text-brand-text-tertiary max-w-[200px] leading-relaxed">
        No recent activities yet. Be the first to add a comment or reaction!
      </p>
    </div>
  );
};

// Interactive Feed Item Component
interface ActivityItemProps {
  group: GroupedFeedItem;
  onClick: () => void;
}

const ActivityItem: React.FC<ActivityItemProps> = ({ group, onClick }) => {
  const getRelativeTime = (timestamp: number) => {
    const elapsed = Date.now() - timestamp;
    if (elapsed < 60000) return 'just now';
    const mins = Math.floor(elapsed / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return new Date(timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick();
    }
  };

  const comments = group.activities.filter(a => a.type === 'comment');
  const reactions = group.activities.filter(a => a.type === 'reaction');

  const ariaLabel = `${group.username} interacted with image by ${group.imageAuthor || 'unknown'}`;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      aria-label={ariaLabel}
      className="w-full text-left p-brand-3 px-brand-4 flex items-start gap-brand-3 hover:bg-neutral-900/40 focus:bg-neutral-900/40 active:scale-[0.98] transition-all duration-brand-fast cursor-pointer animate-slide-in group focus-visible-ring outline-none select-none border-b border-neutral-900/40"
    >
      {/* Avatar */}
      <Avatar username={group.username} color={group.userColor} size="sm" />

      {/* Text Summary */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-brand-2">
          <span className="text-brand-xs font-bold text-white truncate max-w-[120px]">{group.username}</span>
          <span className="text-brand-xs text-brand-text-tertiary font-normal shrink-0">{getRelativeTime(group.createdAt)}</span>
        </div>
        
        <div className="mt-brand-1 flex flex-col gap-1.5">
          {comments.map((comment) => (
            <div key={comment.id} className="text-brand-xs leading-snug flex items-start gap-brand-1">
              <MessageSquare className="w-3.5 h-3.5 text-brand-text-tertiary mt-[1px] shrink-0" />
              <div className="min-w-0 flex-1 break-words">
                <span className="text-brand-text-tertiary">commented: </span>
                <span className="text-white italic font-normal line-clamp-2 inline">
                  &quot;{comment.text}&quot;
                </span>
              </div>
            </div>
          ))}
          
          {reactions.length > 0 && (
            <div className="text-brand-xs leading-snug flex items-start gap-brand-1 mt-0.5">
              <span className="text-brand-text-tertiary shrink-0 mt-[1px]">reacted:</span>
              <div className="flex items-center gap-1.5 flex-wrap">
                {reactions.map((reaction) => (
                  <span key={reaction.id} className="text-sm leading-none inline-block hover:scale-125 transition-transform cursor-default">
                    {reaction.emoji}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mini Image Preview */}
      {group.imageThumb && (
        <div className="w-8 h-8 rounded-brand-xs overflow-hidden shrink-0 border border-neutral-900 group-hover:border-neutral-700 focus:border-neutral-700 transition-colors bg-neutral-950">
          <img
            src={group.imageThumb}
            alt={`Preview image by ${group.imageAuthor || 'Artist'}`}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
      )}
    </div>
  );
};

export const Stream: React.FC = () => {
  const store = useStore();

  // Query latest 25 comments and reactions
  const { data, isLoading, error } = db.useQuery({
    comments: {
      $: {
        limit: 25,
        order: { serverCreatedAt: 'desc' },
      },
    },
    reactions: {
      $: {
        limit: 25,
        order: { serverCreatedAt: 'desc' },
      },
    },
  });

  if (isLoading) {
    return <StreamSkeleton />;
  }

  if (error) {
    return <StreamError message={error.message} />;
  }

  const rawComments: FeedItem[] = (data?.comments || []).map((c: any) => ({
    id: c.id,
    type: 'comment',
    username: c.username,
    userColor: c.userColor,
    text: c.text,
    imageId: c.imageId,
    createdAt: c.createdAt,
    imageThumb: c.imageThumb,
    imageUrl: c.imageUrl,
    imageAuthor: c.imageAuthor,
    imageDesc: c.imageDesc,
  }));

  const rawReactions: FeedItem[] = (data?.reactions || []).map((r: any) => ({
    id: r.id,
    type: 'reaction',
    username: r.username,
    userColor: r.userColor,
    emoji: r.emoji,
    imageId: r.imageId,
    createdAt: r.createdAt,
    imageThumb: r.imageThumb,
    imageUrl: r.imageUrl,
    imageAuthor: r.imageAuthor,
    imageDesc: r.imageDesc,
  }));

  // Merge and sort by timestamp descending
  const feedItems = [...rawComments, ...rawReactions]
    .sort((a, b) => b.createdAt - a.createdAt);

  // Group consecutive activities by the same user on the same image
  const groupedFeedItems = feedItems.reduce((acc, item) => {
    const lastGroup = acc[acc.length - 1];
    
    // Group if same user and same image
    if (lastGroup && lastGroup.username === item.username && lastGroup.imageId === item.imageId) {
      // Add to existing group
      lastGroup.activities.push(item);
      // Ensure group takes the most recent timestamp
      lastGroup.createdAt = Math.max(lastGroup.createdAt, item.createdAt);
    } else {
      // Create new group
      acc.push({
        id: `group-${item.id}`,
        username: item.username,
        userColor: item.userColor,
        imageId: item.imageId,
        imageThumb: item.imageThumb,
        imageUrl: item.imageUrl,
        imageAuthor: item.imageAuthor,
        imageDesc: item.imageDesc,
        createdAt: item.createdAt,
        activities: [item],
      });
    }
    return acc;
  }, [] as GroupedFeedItem[]);

  // Limit grouped items for display
  const displayItems = groupedFeedItems.slice(0, 30);

  const handleFeedItemClick = (group: GroupedFeedItem) => {
    if (!group.imageUrl) return;
    store.setSelectedImageId(group.imageId);
    store.setSelectedImageDetails({
      url: group.imageUrl,
      description: group.imageDesc || 'Artwork',
      author: group.imageAuthor || 'Artist',
      authorUrl: `https://unsplash.com`,
      downloadUrl: group.imageUrl,
    });
  };

  if (displayItems.length === 0) {
    return <StreamEmpty />;
  }

  return (
    <div className="divide-y divide-neutral-900 select-none">
      {displayItems.map((group) => (
        <ActivityItem
          key={group.id}
          group={group}
          onClick={() => handleFeedItemClick(group)}
        />
      ))}
    </div>
  );
};
