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
  item: FeedItem;
  onClick: () => void;
}

const ActivityItem: React.FC<ActivityItemProps> = ({ item, onClick }) => {
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

  const isComment = item.type === 'comment';
  const ariaLabel = isComment
    ? `${item.username} commented: "${item.text}" on image by ${item.imageAuthor || 'unknown'}`
    : `${item.username} reacted ${item.emoji} to image by ${item.imageAuthor || 'unknown'}`;

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
      <Avatar username={item.username} color={item.userColor} size="sm" />

      {/* Text Summary */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-brand-2">
          <span className="text-brand-xs font-bold text-white truncate max-w-[120px]">{item.username}</span>
          <span className="text-brand-xs text-brand-text-tertiary font-normal shrink-0">{getRelativeTime(item.createdAt)}</span>
        </div>
        
        <div className="text-brand-xs mt-brand-1 leading-snug flex items-start gap-brand-1">
          {isComment ? (
            <div className="min-w-0 flex-1 flex items-start gap-brand-1">
              <MessageSquare className="w-3.5 h-3.5 text-brand-text-tertiary mt-[1px] shrink-0" />
              <span className="text-brand-text-tertiary">commented: </span>
              <span className="text-white italic font-normal line-clamp-2">
                &quot;{item.text}&quot;
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-brand-1">
              <span className="text-brand-text-tertiary">reacted: </span>
              <span className="text-white font-bold inline-block mx-brand-1">
                {item.emoji}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Mini Image Preview */}
      {item.imageThumb && (
        <div className="w-8 h-8 rounded-brand-xs overflow-hidden shrink-0 border border-neutral-900 group-hover:border-neutral-700 focus:border-neutral-700 transition-colors bg-neutral-950">
          <img
            src={item.imageThumb}
            alt={`Preview image by ${item.imageAuthor || 'Artist'}`}
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
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, 30); // Show top 30 merged interactions

  const handleFeedItemClick = (item: FeedItem) => {
    if (!item.imageUrl) return;
    store.setSelectedImageId(item.imageId);
    store.setSelectedImageDetails({
      url: item.imageUrl,
      description: item.imageDesc || 'Artwork',
      author: item.imageAuthor || 'Artist',
      authorUrl: `https://unsplash.com`,
      downloadUrl: item.imageUrl,
    });
  };

  if (feedItems.length === 0) {
    return <StreamEmpty />;
  }

  return (
    <div className="divide-y divide-neutral-900 select-none">
      {feedItems.map((item) => (
        <ActivityItem
          key={item.id}
          item={item}
          onClick={() => handleFeedItemClick(item)}
        />
      ))}
    </div>
  );
};
