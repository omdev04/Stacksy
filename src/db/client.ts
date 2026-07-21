import { useState, useEffect } from 'react';
import { init_experimental as init, id } from '@instantdb/react';
import schema from './schema';

// Helper to retrieve the active InstantDB App ID from env or local override
export const getInstantAppId = (): string | null => {
  const envId = import.meta.env.VITE_INSTANT_APP_ID;
  if (envId && envId.trim() !== '' && envId !== 'YOUR_INSTANT_APP_ID') {
    return envId;
  }
  return localStorage.getItem('stacksy_instant_app_id');
};

const appId = getInstantAppId();
export const isConfigured = !!appId;

// Initialize the real client if configured
const realDb = isConfigured
  ? init({
      appId: appId!,
      schema,
      devtool: false,
    })
  : null;

// Mock database simulating the InstantDB SDK over LocalStorage for friction-free testing
class LocalStorageMockDb {
  private listeners = new Set<() => void>();

  constructor() {
    window.addEventListener('storage', (e) => {
      if (e.key === 'stacksy_mock_comments' || e.key === 'stacksy_mock_reactions') {
        this.notify();
      }
    });
    // Listen for events within the same window/tab
    window.addEventListener('local-db-update', () => this.notify());
  }

  private notify() {
    this.listeners.forEach((l) => l());
  }

  private subscribe(l: () => void) {
    this.listeners.add(l);
    return () => this.listeners.delete(l);
  }

  useQuery(query: any) {
    const [state, setState] = useState(() => this.runQuery(query));

    useEffect(() => {
      // Update state when query changes
      setState(this.runQuery(query));

      const unsubscribe = this.subscribe(() => {
        setState(this.runQuery(query));
      });
      return () => {
        unsubscribe();
      };
    }, [JSON.stringify(query)]);

    return { isLoading: false, error: null, data: state };
  }

  private runQuery(query: any) {
    if (!query) {
      return { comments: [], reactions: [] };
    }

    const comments = JSON.parse(localStorage.getItem('stacksy_mock_comments') || '[]');
    const reactions = JSON.parse(localStorage.getItem('stacksy_mock_reactions') || '[]');

    let filteredComments = comments;
    let filteredReactions = reactions;

    // Handle comments query filtering, ordering, and limiting
    if (query.comments) {
      const cQuery = query.comments;
      if (cQuery.$ && cQuery.$.where) {
        const { imageId } = cQuery.$.where;
        if (imageId) {
          filteredComments = comments.filter((c: any) => c.imageId === imageId);
        }
      }
      if (cQuery.$ && cQuery.$.order && cQuery.$.order.serverCreatedAt === 'desc') {
        filteredComments = [...filteredComments].sort((a: any, b: any) => b.createdAt - a.createdAt);
      }
      if (cQuery.$ && cQuery.$.limit) {
        filteredComments = filteredComments.slice(0, cQuery.$.limit);
      }
    } else {
      filteredComments = [];
    }

    // Handle reactions query filtering, ordering, and limiting
    if (query.reactions) {
      const rQuery = query.reactions;
      if (rQuery.$ && rQuery.$.where) {
        const { imageId } = rQuery.$.where;
        if (imageId) {
          filteredReactions = reactions.filter((r: any) => r.imageId === imageId);
        }
      }
      if (rQuery.$ && rQuery.$.order && rQuery.$.order.serverCreatedAt === 'desc') {
        filteredReactions = [...filteredReactions].sort((a: any, b: any) => b.createdAt - a.createdAt);
      }
      if (rQuery.$ && rQuery.$.limit) {
        filteredReactions = filteredReactions.slice(0, rQuery.$.limit);
      }
    } else {
      filteredReactions = [];
    }

    return {
      comments: filteredComments,
      reactions: filteredReactions,
    };
  }

  // Transaction construction syntax: db.tx.comments[id].update(...)
  tx = {
    comments: new Proxy(
      {},
      {
        get: (_target, prop) => {
          const commentId = prop as string;
          return {
            update: (fields: any) => ({
              type: 'comment-update',
              id: commentId,
              fields,
            }),
            delete: () => ({
              type: 'comment-delete',
              id: commentId,
            }),
          };
        },
      }
    ) as any,
    reactions: new Proxy(
      {},
      {
        get: (_target, prop) => {
          const reactionId = prop as string;
          return {
            update: (fields: any) => ({
              type: 'reaction-update',
              id: reactionId,
              fields,
            }),
            delete: () => ({
              type: 'reaction-delete',
              id: reactionId,
            }),
          };
        },
      }
    ) as any,
  };

  transact(txList: any | any[]) {
    const list = Array.isArray(txList) ? txList : [txList];
    const comments = JSON.parse(localStorage.getItem('stacksy_mock_comments') || '[]');
    const reactions = JSON.parse(localStorage.getItem('stacksy_mock_reactions') || '[]');

    let updatedComments = [...comments];
    let updatedReactions = [...reactions];

    for (const action of list) {
      if (!action) continue;

      if (action.type === 'comment-update') {
        const index = updatedComments.findIndex((c: any) => c.id === action.id);
        if (index > -1) {
          updatedComments[index] = { ...updatedComments[index], ...action.fields };
        } else {
          updatedComments.push({ id: action.id, ...action.fields });
        }
      } else if (action.type === 'comment-delete') {
        updatedComments = updatedComments.filter((c: any) => c.id !== action.id);
      } else if (action.type === 'reaction-update') {
        const index = updatedReactions.findIndex((r: any) => r.id === action.id);
        if (index > -1) {
          updatedReactions[index] = { ...updatedReactions[index], ...action.fields };
        } else {
          updatedReactions.push({ id: action.id, ...action.fields });
        }
      } else if (action.type === 'reaction-delete') {
        updatedReactions = updatedReactions.filter((r: any) => r.id !== action.id);
      }
    }

    localStorage.setItem('stacksy_mock_comments', JSON.stringify(updatedComments));
    localStorage.setItem('stacksy_mock_reactions', JSON.stringify(updatedReactions));

    // Dispatch custom event to notify listeners on the active tab
    window.dispatchEvent(new Event('local-db-update'));
  }
}

// Export the active database driver matching the signature
export const db = isConfigured ? realDb! : new LocalStorageMockDb();
export { id };
