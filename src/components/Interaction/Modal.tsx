import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '../../store/useStore';
import { db } from '../../db/client';
import { id } from '@instantdb/react';
import { X, Send, Trash2, MessageSquare } from 'lucide-react';
import { Avatar } from '../Shared/Avatar';
import EmojiPicker, { Theme } from 'emoji-picker-react';

export const Modal: React.FC = () => {
  const store = useStore();
  const imageId = store.selectedImageId;
  const details = store.selectedImageDetails;
  const username = store.username;
  const userColor = store.userColor;

  const [commentText, setCommentText] = useState('');
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const commentsEndRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

 
  const { data, isLoading } = db.useQuery(
    imageId
      ? {
        comments: {
          $: {
            where: { imageId },
          },
        },
        reactions: {
          $: {
            where: { imageId },
          },
        },
      }
      : null
  );

  const comments = data?.comments || [];
  const reactions = data?.reactions || [];

  
  const reactionCounts = reactions.reduce((acc: { [emoji: string]: number }, r: any) => {
    acc[r.emoji] = (acc[r.emoji] || 0) + 1;
    return acc;
  }, {});

  
  const userReactions = reactions.filter((r: any) => r.username === username);

  const activeEmojis = Array.from(
    new Set([
      '❤️',
      '👍',
      '🔥',
      '😂',
      ...reactions.map((r: any) => r.emoji),
    ])
  );

  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        store.setSelectedImageId(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [store]);


  useEffect(() => {
    if (imageId && modalRef.current) {
      modalRef.current.focus();
    }
  }, [imageId]);


  useEffect(() => {
    commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [comments.length]);

  if (!imageId || !details) return null;

  const handlePostComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    db.transact(
      db.tx.comments[id()].update({
        imageId,
        text: commentText.trim(),
        username,
        userColor,
        createdAt: Date.now(),
        imageThumb: details.url,
        imageUrl: details.url,
        imageAuthor: details.author,
        imageDesc: details.description,
      })
    );

    setCommentText('');
  };

  const handleDeleteComment = (commentId: string) => {
    if (confirm('Are you sure you want to delete your comment?')) {
      db.transact(db.tx.comments[commentId].delete());
    }
  };

  const handleEmojiReact = (emoji: string) => {
    const existing = userReactions.find((r: any) => r.emoji === emoji);

    if (existing) {
      db.transact(db.tx.reactions[existing.id].delete());
    } else {
      db.transact(
        db.tx.reactions[id()].update({
          imageId,
          emoji,
          username,
          userColor,
          createdAt: Date.now(),
          imageThumb: details.url,
          imageUrl: details.url,
          imageAuthor: details.author,
          imageDesc: details.description,
        })
      );
    }
  };

 
  const formatDate = (timestamp: number) => {
    const d = new Date(timestamp);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' · ' + d.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };


  const sortedComments = [...comments].sort((a, b) => a.createdAt - b.createdAt);

  return (
    <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-0 md:p-6 select-none">
      <div className="absolute inset-0 hidden md:block" onClick={() => store.setSelectedImageId(null)} />

      
      <div
        ref={modalRef}
        className="relative bg-brand-surface-muted border-0 md:border border-neutral-900/80 rounded-none md:rounded-brand-sm w-full h-[100dvh] md:h-[85vh] max-w-5xl flex flex-col md:flex-row overflow-hidden shadow-none md:shadow-2xl animate-slide-in outline-none"
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
      >
        
        <div className="w-full bg-black flex items-center justify-center relative p-0 shrink-0 h-[40vh] md:h-auto md:flex-1 md:min-h-0">
          
          <button
            onClick={() => store.setSelectedImageId(null)}
            className="absolute top-4 right-4 bg-black/60 hover:bg-neutral-900 backdrop-blur text-white hover:text-white p-2.5 rounded-full border border-neutral-800/80 hover:border-neutral-700 transition-all z-20 focus-visible-ring hover:scale-105 active:scale-95"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4" />
          </button>

          <img
            src={details.url}
            alt={details.description}
            className="max-w-full max-h-full object-contain pointer-events-none select-none rounded-brand-xs md:rounded-none"
          />
        </div>

        
        <div className="w-full md:w-[400px] bg-brand-surface-muted border-t md:border-t-0 md:border-l border-neutral-900/40 flex flex-col flex-1 min-h-0 min-w-0">

          {/* Header Info */}
          <div className="p-6 pb-4 shrink-0">
            <span className="text-[10px] tracking-widest font-semibold text-neutral-500 uppercase mb-1 block">Artist</span>
            <div className="flex items-center justify-between mt-1">
              <h3 className="text-xl font-bold text-white leading-none truncate pr-4">{details.author}</h3>
            </div>
            <p className="text-sm text-neutral-400 mt-3 line-clamp-3 leading-relaxed font-normal">
              {details.description}
            </p>
          </div>

          {/* Emoji Reaction Station */}
          <div className="px-6 py-4 shrink-0 flex flex-col gap-4">
            <div>
              <label className="text-[10px] tracking-widest font-semibold text-neutral-500 uppercase mb-3 block">
                Reactions
              </label>
              <div className="flex flex-wrap gap-2 items-center">
                {activeEmojis.map((emoji) => {
                  const totalReacts = reactionCounts[emoji] || 0;
                  const hasReacted = userReactions.some((r: any) => r.emoji === emoji);

                  return (
                    <button
                      key={emoji}
                      onClick={() => handleEmojiReact(emoji)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm transition-all duration-300 active:scale-95 ${hasReacted
                          ? 'bg-neutral-800 text-white font-bold ring-1 ring-neutral-700'
                          : 'bg-neutral-900/50 hover:bg-neutral-800 text-neutral-400 hover:text-white'
                        }`}
                    >
                      <span>{emoji}</span>
                      {totalReacts > 0 && <span className="text-[11px] font-bold opacity-90">{totalReacts}</span>}
                    </button>
                  );
                })}

                {/* Emoji Picker Trigger */}
                <button
                  type="button"
                  onClick={() => setIsPickerOpen(!isPickerOpen)}
                  className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-lg transition-all duration-300 active:scale-95 ${isPickerOpen
                      ? 'bg-neutral-800 text-white'
                      : 'bg-neutral-900/50 hover:bg-neutral-800 text-neutral-400 hover:text-white'
                    }`}
                  title="Add reaction"
                >
                  +
                </button>
              </div>
            </div>

            {/* Inline Emoji Picker */}
            {isPickerOpen && (
              <div className="w-full animate-slide-in select-none border border-neutral-800 rounded-2xl overflow-hidden bg-neutral-950">
                <EmojiPicker
                  theme={Theme.DARK}
                  onEmojiClick={(emojiData) => {
                    handleEmojiReact(emojiData.emoji);
                    setIsPickerOpen(false);
                  }}
                  width="100%"
                  height={320}
                  skinTonesDisabled
                  lazyLoadEmojis
                  searchPlaceHolder="Search emojis..."
                />
              </div>
            )}
          </div>

          {/* Comments Stream */}
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-5 min-h-0 scrollbar-thin scrollbar-thumb-neutral-800 scrollbar-track-transparent">
            <div className="flex items-center gap-2 text-neutral-500 pb-2 border-b border-neutral-900/50">
              <span className="text-[10px] tracking-widest font-semibold uppercase">
                Discussion <span className="ml-1 opacity-70">({comments.length})</span>
              </span>
            </div>

            {isLoading ? (
              <div className="text-center py-8 text-sm text-neutral-500">
                Loading...
              </div>
            ) : sortedComments.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center opacity-60">
                <MessageSquare className="w-8 h-8 text-neutral-600 stroke-[1.5] mb-4" />
                <p className="text-sm font-medium text-neutral-400">No comments yet</p>
                <p className="text-xs text-neutral-500 mt-1 max-w-[200px] leading-relaxed">
                  Start the conversation.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {sortedComments.map((comment) => {
                  const isOwnComment = comment.username === username;
                  return (
                    <div
                      key={comment.id}
                      className="flex gap-3 group animate-slide-in relative"
                    >
                      <div className="relative shrink-0 pt-0.5">
                        <Avatar username={comment.username} color={comment.userColor} size="sm" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-neutral-200">
                            {comment.username}
                          </span>
                          <span className="text-[10px] text-neutral-600 font-medium">
                            {formatDate(comment.createdAt)}
                          </span>
                        </div>
                        <p className="text-sm text-neutral-400 mt-0.5 whitespace-pre-wrap leading-relaxed">
                          {comment.text}
                        </p>
                      </div>

                      {isOwnComment && (
                        <button
                          onClick={() => handleDeleteComment(comment.id)}
                          className="text-neutral-600 hover:text-red-400 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity p-1.5 self-start -mt-1 -mr-1 rounded-md hover:bg-neutral-800/40"
                          title="Delete comment"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
            <div ref={commentsEndRef} />
          </div>

          {/* Comment Form */}
          <form onSubmit={handlePostComment} className="p-4 pb-8 md:pb-4 shrink-0 bg-brand-surface-muted border-t border-neutral-900/50">
            <div className="flex items-center gap-2 bg-neutral-900 rounded-full p-1 pl-4 focus-within:ring-1 focus-within:ring-neutral-700 transition-all">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Write a comment..."
                className="flex-1 bg-transparent text-white border-0 text-sm focus:outline-none focus:ring-0 p-2 placeholder-neutral-500"
                required
              />
              <button
                type="submit"
                disabled={!commentText.trim()}
                className="bg-white hover:bg-neutral-200 disabled:bg-neutral-800 text-black disabled:text-neutral-600 w-10 h-10 rounded-full transition-all duration-300 shrink-0 flex items-center justify-center active:scale-95 disabled:active:scale-100"
                aria-label="Post comment"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
