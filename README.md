# Stacksy — Real-Time Photo Interaction Gallery

![Stacksy Preview](./screenshot/preview.png)

Welcome to **Stacksy**! It's a real-time, multi-user photo gallery where people can browse awesome high-res photos, drop emoji reactions, and leave comments. The coolest part? Everything syncs instantly across all open tabs and devices! This project was built as a fun way to explore modern React patterns with a strong focus on real-time user experiences (UX).

---

## 🛠️ Setup Instructions

Getting Stacksy running on your local machine is super easy.

**Prerequisites:** Make sure you have [Node.js](https://nodejs.org/) installed (version 18 or higher is recommended).

**Installation:**
```bash
# Install all the dependencies
npm install

# Start the local development server
npm run dev
```
Then, just open `http://localhost:5173` in your browser. That's it!

### 🔑 Connecting Real APIs
Out of the box, Stacksy works without any API keys! It uses a curated local photo library and a mock real-time database that still syncs across your local browser tabs. It's perfect for a quick demo.

But when you want to connect the real APIs (Unsplash and InstantDB), you have two choices:
- **Option 1 (Using `.env`):** Rename the `.env.example` file to `.env` and paste your `VITE_UNSPLASH_ACCESS_KEY` and `VITE_INSTANT_APP_ID`.
- **Option 2 (Directly in the App):** Click the settings gear icon at the bottom-right of the app, paste your keys, and hit "Save & Reload". These are safely stored in your browser's `localStorage`.

---

## 🌐 API Handling Strategy

For photos, we use the [Unsplash API](https://unsplash.com/developers). To handle data fetching smartly, I went with `@tanstack/react-query`. 

- **Infinite Scrolling:** Instead of clicking "Next Page", I added an `IntersectionObserver` at the bottom of the grid. As soon as you scroll near the bottom, the next batch of photos loads automatically.
- **Smart Searching:** To avoid hitting Unsplash's rate limits (which can happen fast if we search on every single keystroke), search only triggers when you hit 'Enter' or click the "Find" button.
- **Fallback Mode:** If you don't provide an API key, the app gracefully falls back to a hand-picked local collection of 24 photos, fully paginated. No broken images!

---

## ⚡ InstantDB Schema & Usage

To make everything real-time, Stacksy uses **InstantDB**. It keeps two main things in sync: Comments and Reactions.

Here is what the schema looks like:
```typescript
const schema = i.schema({
  entities: {
    reactions: i.entity({
      imageId: i.string(),
      emoji: i.string(),
      username: i.string(),
      userColor: i.string(),
      createdAt: i.number(),
      imageThumb: i.string().optional(),
      imageUrl: i.string().optional(),
      imageAuthor: i.string().optional(),
      imageDesc: i.string().optional(),
    }),
    comments: i.entity({
      imageId: i.string(),
      text: i.string(),
    }),
  },
});
```
**Why embed image data?** By saving the thumbnail URL and author info directly inside the reaction/comment record, our "Live Activity Feed" can show rich previews instantly without having to make extra API calls back to Unsplash!

---

## 🧠 Key React Decisions

Here are a few technical choices that keep the codebase clean and fast:

- **Zustand for State Management:** Things like the search query, active tabs, and which image modal is currently open are stored in Zustand. It's incredibly lightweight and saves us from messy prop-drilling or Context re-render issues.
- **Persistent User Identities:** When you first open the app, it randomly generates a fun name (like `CosmicFalcon813`) and a color badge for you. These are saved in `localStorage`, so even if you refresh, you keep your identity!
- **Event Propagation Magic:** When you click a quick-reaction emoji on a photo card, we use `e.stopPropagation()`. Without this tiny line of code, clicking an emoji would also click the photo behind it and accidentally open the image modal.
- **Accessible UI:** A custom math formula checks your randomly generated user color. If it's a light color, it gives you dark text. If it's dark, it gives you white text. This ensures everything is always easy to read (WCAG 2.2 AA compliant).
- **Optimized Feed UI:** To prevent infinite scrolling when a user interacts multiple times, consecutive activities by the same user on the same photo are smartly grouped together into a single compact feed item.

---

## 🧗 Challenges Faced & How I Solved Them

### 1. The "No API Key" Crash
**Problem:** Most real-time database SDKs just crash the entire app if you initialize them without an App ID. I didn't want to force users to configure keys just to see the app working.
**Solution:** I built a check in `src/db/client.ts`. If it doesn't find an InstantDB key, it swaps the real DB with a custom "Mock DB" backed by `localStorage`. It listens to browser storage events, meaning you still get a real-time sync experience across different tabs on your computer with zero setup!

### 2. Live Feed Performance Delay
**Problem:** The live feed needs to say "CosmicFalcon reacted ❤️ on [Photo Thumbnail]". Fetching that thumbnail from Unsplash every time someone clicks a feed item requires an extra network request, causing a slight delay.
**Solution:** I chose to embed the necessary image metadata (thumbnail URL, author name) directly into the reaction/comment payload when saving it to the database. Now, the feed has everything it needs instantly. Zero extra API calls!

---

## 🔮 What I Would Improve With More Time

If I had a bit more time to keep building, here are the top three things I'd add:

1. **Explicit Optimistic Rollbacks:** While InstantDB handles optimistic UI updates (showing your comment immediately before it saves), I'd want to write custom logic to cleanly roll it back and notify the user if their internet drops and the save fails.
2. **User Image Uploads:** Right now we rely on Unsplash. It would be awesome to let users upload their own photos. A Supabase storage bucket would fit into this architecture perfectly.
3. **Reaction Confetti 🎉:** I want to use `canvas-confetti` so that whenever you click an emoji, tiny confetti pieces burst out of the button. Is it completely necessary? No. Is it incredibly fun? Absolutely.

---
*Built with ❤️ and React.*
