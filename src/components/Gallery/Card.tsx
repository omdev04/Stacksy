import React from 'react';
import { useStore } from '../../store/useStore';
import { db } from '../../db/client';
import { id } from '@instantdb/react';
import { MessageSquare, ExternalLink } from 'lucide-react';
import { UnsplashPhoto } from '../../hooks/useUnsplash';

interface CardProps {
  photo: UnsplashPhoto;
}

const QUICK_EMOJIS = ['❤️', '👍', '🔥', '😂'];

export const Card: React.FC<CardProps> = ({ photo }) => {
  const store = useStore();
  const username = store.username;
  const userColor = store.userColor;

  // Real-time query for this image's reactions and comments count
  const { data } = db.useQuery({
    reactions: {
      $: {
        where: { imageId: photo.id },
      },
    },
    comments: {
      $: {
        where: { imageId: photo.id },
      },
    },
  });

  const reactions = data?.reactions || [];
  const comments = data?.comments || [];

  // Group reactions by emoji to calculate counts
  const reactionCounts = reactions.reduce((acc: { [emoji: string]: number }, r: any) => {
    acc[r.emoji] = (acc[r.emoji] || 0) + 1;
    return acc;
  }, {});

  // Check if current user has reacted with specific emoji
  const userReactions = reactions.filter((r: any) => r.username === username);

  const handleQuickReact = (emoji: string, e: React.MouseEvent) => {
    e.stopPropagation(); // prevent opening the focused modal

    const existingReaction = userReactions.find((r: any) => r.emoji === emoji);

    if (existingReaction) {
      // Delete existing reaction (toggle behavior)
      db.transact(db.tx.reactions[existingReaction.id].delete());
    } else {
      // Add new reaction
      db.transact(
        db.tx.reactions[id()].update({
          imageId: photo.id,
          emoji,
          username,
          userColor,
          createdAt: Date.now(),
          imageThumb: photo.urls.thumb,
          imageUrl: photo.urls.regular,
          imageAuthor: photo.user.name,
          imageDesc: photo.description || photo.alt_description || 'Artwork',
        })
      );
    }
  };

  const handleCardClick = () => {
    store.setSelectedImageId(photo.id);
    store.setSelectedImageDetails({
      url: photo.urls.regular,
      description: photo.description || photo.alt_description || 'Artwork',
      author: photo.user.name,
      authorUrl: photo.user.portfolio_url || `https://unsplash.com/@${photo.user.username}`,
      downloadUrl: photo.urls.regular,
    });
  };

  return (
    <div
      onClick={handleCardClick}
      className="group relative bg-brand-surface-base rounded-brand-sm overflow-hidden w-full h-auto cursor-pointer border border-neutral-900 hover:border-neutral-700 transition-all duration-brand-fast hover:-translate-y-1 shadow-md select-none focus-visible-ring mb-brand-3 break-inside-avoid inline-block"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleCardClick();
        }
      }}
    >
      {/* Background Image */}
      <img
        src={photo.urls.small}
        alt={photo.alt_description || 'gallery image'}
        className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-500 ease-out block"
        loading="lazy"
      />

      {/* Grid Hover Overlay UI */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/60 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity duration-brand-instant flex flex-col justify-between p-brand-3">
        {/* Top: Quick Emoji Picker bar */}
        <div className="flex items-center justify-center gap-brand-2 bg-neutral-950/60 backdrop-blur-md py-1.5 px-3 rounded-brand-md border border-white/5 mx-auto animate-slide-in">
          {QUICK_EMOJIS.map((emoji) => {
            const hasReacted = userReactions.some((r: any) => r.emoji === emoji);
            return (
              <button
                key={emoji}
                onClick={(e) => handleQuickReact(emoji, e)}
                className={`text-brand-md transform hover:scale-125 hover:rotate-6 active:scale-95 transition-all p-1 rounded-brand-md ${hasReacted ? 'bg-white/20 border border-white/20' : 'hover:bg-white/10'
                  }`}
                title={`${hasReacted ? 'Remove' : 'React'} ${emoji}`}
              >
                {emoji}
              </button>
            );
          })}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleCardClick();
            }}
            className="text-neutral-400 hover:text-white text-xs font-black p-1 hover:bg-white/10 rounded-brand-md transition-all flex items-center justify-center w-6 h-6 leading-none shrink-0"
            title="More Reactions"
          >
            +
          </button>
        </div>

        {/* Bottom: Info, Comments and Aggregated Live Counts */}
        <div className="space-y-brand-2">
          {/* Active Reaction Badges (Live sync update) */}
          {Object.keys(reactionCounts).length > 0 && (
            <div className="flex flex-wrap gap-brand-1">
              {(Object.entries(reactionCounts) as [string, number][]).map(([emoji, count]) => {
                const userHasReacted = userReactions.some((r: any) => r.emoji === emoji);
                return (
                  <span
                    key={emoji}
                    className={`inline-flex items-center gap-1 text-[10px] py-0.5 px-2 rounded-brand-md backdrop-blur border ${userHasReacted
                        ? 'bg-white/20 text-white border-white/20 font-bold'
                        : 'bg-black/40 text-brand-text-tertiary border-transparent'
                      }`}
                  >
                    <span>{emoji}</span>
                    <span>{count}</span>
                  </span>
                );
              })}
            </div>
          )}

          {/* Author credit & comments count */}
          <div className="flex items-center justify-between">
            <div className="min-w-0">
              <p className="text-[10px] text-brand-text-tertiary leading-none uppercase tracking-wider">Artist</p>
              <p className="text-brand-xs font-bold text-white truncate mt-0.5">{photo.user.name}</p>
            </div>

            <div className="flex items-center gap-2 text-brand-text-tertiary text-brand-xs">
              {comments.length > 0 && (
                <div className="flex items-center gap-1" title={`${comments.length} comments`}>
                  <MessageSquare className="w-3.5 h-3.5 text-white" />
                  <span className="text-[10px] font-bold text-white">{comments.length}</span>
                </div>
              )}
              <div className="bg-white/10 hover:bg-white text-white hover:text-black p-1 rounded-brand-xs transition-colors">
                <ExternalLink className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
