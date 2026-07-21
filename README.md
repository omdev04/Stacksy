# Stacksy — Real-Time Photo Interaction Gallery

A modern, responsive, multi-user real-time photo interaction gallery built using **React**, **TypeScript**, **Tailwind CSS**, **Zustand**, **TanStack React Query**, and **InstantDB**. 

---

## 🚀 Getting Started

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed (version 18+ recommended).

### Installation
1. Install the required dependencies:
   ```bash
   npm install
   ```

2. Start the local development server:
   ```bash
   npm run dev
   ```
   Open your browser and navigate to `http://localhost:5173`.

### 🔑 API Key Configuration
The application is fully functional out of the box using **Mock/Fallback Mode**. However, to enable the full power of live global queries, follow these steps:

#### Method A: Environment Variables
Create a `.env` file in the root directory (you can rename `.env.example` to `.env`) and fill in your keys:
```env
VITE_UNSPLASH_ACCESS_KEY=your_real_unsplash_key
VITE_INSTANT_APP_ID=your_real_instant_app_id
```

#### Method B: In-App Settings (Friction-Free)
1. Launch the application.
2. Click the floating **Gear Icon (Settings)** at the bottom-right of the screen.
3. Paste your keys directly into the input fields and click **Save & Reload**.
4. The configurations will persist in your browser's `localStorage`.

---

## 🎨 UI / UX Design Foundations
The styling guidelines adhere strictly to [DESIGN_stacksy.md](DESIGN_stacksy.md):
- **Typography**: Integrated the premium **Outfit** font from Google Fonts (mapped to the spec's `saans` font family).
- **Colors**: Contrast-compliant slate/charcoal styling:
  - Text Primary: `#141414` (for high contrast readability on white cards)
  - Text Secondary: `#707070`
  - Text Tertiary: `#adadad`
  - Surface Raised: `#ffffff`
  - Surface Base: `#404040`
  - Surface Muted: `#000000`
- **Spacing**: Custom semantic increments (`space.1` through `space.4`).
- **Animations**: Subtle `200ms` micro-animations on hover states, and keyframe slide-ins for real-time global feed alerts.

---

## 🔌 API Handling Strategy (Unsplash)
1. **Caching & Infinite Scroll**: Powered by `@tanstack/react-query`'s `useInfiniteQuery`. When scrolling near the bottom of the grid, an `IntersectionObserver` sentinel triggers `fetchNextPage` for a fluid scrolling experience.
2. **Debounced Search**: Searches and filters are processed on form submission (clicking "Find" or pressing Enter). This prevents redundant API requests on every keystroke, preserving Unsplash's rate limit.
3. **Curated Fallback Library**: When no Unsplash API Access Key is provided, the hook switches to a curated database of 24 high-resolution photos categorized by *Minimal*, *Nature*, *Architecture*, and *Technology* with local pagination simulation.

---

## ⚡ Real-Time Layer (InstantDB Schema)
InstantDB synchronizes states instantly across all client sessions. We define two entities:

```typescript
const schema = i.schema({
  entities: {
    reactions: i.entity({
      imageId: i.string(),
      emoji: i.string(),
      username: i.string(),
      userColor: i.string(),
      createdAt: i.number(),
      // Embedded metadata to avoid calling Unsplash on feed item click
      imageThumb: i.string().optional(),
      imageUrl: i.string().optional(),
      imageAuthor: i.string().optional(),
      imageDesc: i.string().optional(),
    }),
    comments: i.entity({
      imageId: i.string(),
      text: i.string(),
      username: i.string(),
      userColor: i.string(),
      createdAt: i.number(),
      imageThumb: i.string().optional(),
      imageUrl: i.string().optional(),
      imageAuthor: i.string().optional(),
      imageDesc: i.string().optional(),
    }),
  },
});
```

---

## 🧠 Key React Decisions
1. **Zustand for UI State**: Used to handle light, volatile UI configurations (category tabs, active search, which image is focused, modal visibility) rather than prop-drilling or context providers.
2. **Persistent User Identity**: On first load, the app generates a randomized, CamelCase username (e.g. `CosmicFalcon813`) and a high-contrast pastel color badge. This identity is saved to `localStorage` and persists on page refreshes.
3. **Event Propagation Safeguards**: Emoji reactions on the Gallery Cards stop event propagation (`e.stopPropagation()`). This ensures clicking a quick reaction does not trigger the card click event (which opens the image detail modal).
4. **Contrast-Compliant Avatars**: A luminance formula automatically detects whether a user's random avatar background color requires light or dark text to meet WCAG 2.2 AA standards.

---

## 💡 Challenges Faced & Solutions

### 1. The Empty API Key Problem
- *Challenge*: Real-time database SDKs and external APIs usually crash the frontend on boot when initialized with null/empty strings.
- *Solution*: Designed a **Universal Database Interface** inside `src/db/client.ts`. If an App ID is missing, the driver seamlessly hooks into a custom client-side Mock DB. This Mock DB stores data in `localStorage` and listens to the browser's `storage` event, meaning **real-time synchronization works across multiple local tabs/devices out-of-the-box without requiring keys!**

### 2. Global Activity Feed Performance
- *Challenge*: The requirements mandate a global feed displaying all user interactions ("X reacted with Heart on image"). When a user clicks a feed alert, the app must focus that image. Typically, this requires executing a network request to Unsplash to fetch the image details.
- *Solution*: Embedded the image metadata (thumbnail, author, description, regular URL) directly inside the reaction and comment database entities when they are saved. Now, the global feed updates instantly and contains all information required to display a preview and focus the modal immediately, requiring zero API calls.

---

## 🔮 Future Improvements
If granted more time, I would implement:
1. **Optimistic Updates**: Explicitly define local rollback logic inside InstantDB writes in case of connectivity drops.
2. **Direct Image Uploads**: Add a modal allowing users to upload local images directly using a cloud bucket (e.g., Supabase storage).
3. **Emoji Reactions Confetti**: Introduce `canvas-confetti` animations bursting from the emoji reaction badges whenever a user triggers a react event.
