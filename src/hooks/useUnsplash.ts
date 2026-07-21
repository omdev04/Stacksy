import { useInfiniteQuery } from '@tanstack/react-query';
import { useStore } from '../store/useStore';

// Fallback Curated Photos when API Keys are not set
export interface UnsplashPhoto {
  id: string;
  urls: {
    regular: string;
    small: string;
    thumb: string;
  };
  user: {
    name: string;
    username: string;
    portfolio_url: string | null;
  };
  description: string | null;
  alt_description: string | null;
  category?: string;
}

const FALLBACK_PHOTOS: UnsplashPhoto[] = [
  // Minimal
  {
    id: 'min-1',
    urls: {
      regular: 'https://images.unsplash.com/photo-1494438639946-1ebd1d2038b5?auto=format&fit=crop&w=1200&q=80',
      small: 'https://images.unsplash.com/photo-1494438639946-1ebd1d2038b5?auto=format&fit=crop&w=600&q=80',
      thumb: 'https://images.unsplash.com/photo-1494438639946-1ebd1d2038b5?auto=format&fit=crop&w=200&q=80',
    },
    user: { name: 'Fiona Small', username: 'fionasmall', portfolio_url: null },
    description: 'Minimalist desk lamp against a pastel clean background.',
    alt_description: 'minimalist desk lamp',
    category: 'Minimal',
  },
  {
    id: 'min-2',
    urls: {
      regular: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
      small: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80',
      thumb: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=200&q=80',
    },
    user: { name: 'Sean Oulash', username: 'seanoulash', portfolio_url: null },
    description: 'Minimal aesthetic beach view with low contrast colors.',
    alt_description: 'minimal beach view',
    category: 'Minimal',
  },
  {
    id: 'min-3',
    urls: {
      regular: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1200&q=80',
      small: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80',
      thumb: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=200&q=80',
    },
    user: { name: 'Cest Mo', username: 'cestmo', portfolio_url: null },
    description: 'Studio shot of yellow headphones placed on minimalist table.',
    alt_description: 'headphones on table',
    category: 'Minimal',
  },
  {
    id: 'min-4',
    urls: {
      regular: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80',
      small: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=600&q=80',
      thumb: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=200&q=80',
    },
    user: { name: 'Ryunosuke Kikuno', username: 'ryunosuke', portfolio_url: null },
    description: 'Glass architectural building looking up with minimalist reflection.',
    alt_description: 'skyscraper facade',
    category: 'Minimal',
  },
  {
    id: 'min-5',
    urls: {
      regular: 'https://images.unsplash.com/photo-1515549832467-8783363e19b6?auto=format&fit=crop&w=1200&q=80',
      small: 'https://images.unsplash.com/photo-1515549832467-8783363e19b6?auto=format&fit=crop&w=600&q=80',
      thumb: 'https://images.unsplash.com/photo-1515549832467-8783363e19b6?auto=format&fit=crop&w=200&q=80',
    },
    user: { name: 'Piotr Szulawski', username: 'szula', portfolio_url: null },
    description: 'A single, perfectly centered leaf casting a shadow on a concrete background.',
    alt_description: 'leaf and shadow',
    category: 'Minimal',
  },
  {
    id: 'min-6',
    urls: {
      regular: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&w=1200&q=80',
      small: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&w=600&q=80',
      thumb: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&w=200&q=80',
    },
    user: { name: 'Joel Filipe', username: 'joelfilipe', portfolio_url: null },
    description: 'Curved architecture abstract with high contrast shades.',
    alt_description: 'abstract curves architecture',
    category: 'Minimal',
  },

  // Nature
  {
    id: 'nat-1',
    urls: {
      regular: 'https://images.unsplash.com/photo-1472214222541-d510753a4907?auto=format&fit=crop&w=1200&q=80',
      small: 'https://images.unsplash.com/photo-1472214222541-d510753a4907?auto=format&fit=crop&w=600&q=80',
      thumb: 'https://images.unsplash.com/photo-1472214222541-d510753a4907?auto=format&fit=crop&w=200&q=80',
    },
    user: { name: 'Kalonji Cooper', username: 'kalonji', portfolio_url: null },
    description: 'Golden hour sunset over rolling green pasture hills.',
    alt_description: 'hills valley sunset',
    category: 'Nature',
  },
  {
    id: 'nat-2',
    urls: {
      regular: 'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?auto=format&fit=crop&w=1200&q=80',
      small: 'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?auto=format&fit=crop&w=600&q=80',
      thumb: 'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?auto=format&fit=crop&w=200&q=80',
    },
    user: { name: 'Lukasz Szmigiel', username: 'szmigiel', portfolio_url: null },
    description: 'Mystic green forest path with sunrays filtering through branches.',
    alt_description: 'forest sun rays',
    category: 'Nature',
  },
  {
    id: 'nat-3',
    urls: {
      regular: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=1200&q=80',
      small: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=600&q=80',
      thumb: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=200&q=80',
    },
    user: { name: 'Keith Ladzinski', username: 'keithlad', portfolio_url: null },
    description: 'Massive orange desert sand dunes extending to the horizon.',
    alt_description: 'desert sand dunes',
    category: 'Nature',
  },
  {
    id: 'nat-4',
    urls: {
      regular: 'https://images.unsplash.com/photo-1500485035595-cbe6f645feb1?auto=format&fit=crop&w=1200&q=80',
      small: 'https://images.unsplash.com/photo-1500485035595-cbe6f645feb1?auto=format&fit=crop&w=600&q=80',
      thumb: 'https://images.unsplash.com/photo-1500485035595-cbe6f645feb1?auto=format&fit=crop&w=200&q=80',
    },
    user: { name: 'David Marcu', username: 'davidmarcu', portfolio_url: null },
    description: 'Perfect mirror reflection of snowcapped mountains in a silent blue lake.',
    alt_description: 'lake mirror reflection mountains',
    category: 'Nature',
  },
  {
    id: 'nat-5',
    urls: {
      regular: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1200&q=80',
      small: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=600&q=80',
      thumb: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=200&q=80',
    },
    user: { name: 'Evgeni Tcherkasski', username: 'evgenit', portfolio_url: null },
    description: 'Rolling green mist mountains under dramatic skies.',
    alt_description: 'hills mist landscape',
    category: 'Nature',
  },
  {
    id: 'nat-6',
    urls: {
      regular: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
      small: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80',
      thumb: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=200&q=80',
    },
    user: { name: 'Bailey Zindel', username: 'baileyz', portfolio_url: null },
    description: 'Sunset painting Yosemite valley with pink and golden highlights.',
    alt_description: 'yosemite valley sunset',
    category: 'Nature',
  },

  // Architecture
  {
    id: 'arch-1',
    urls: {
      regular: 'https://images.unsplash.com/photo-1487958449943-2429e8be8625?auto=format&fit=crop&w=1200&q=80',
      small: 'https://images.unsplash.com/photo-1487958449943-2429e8be8625?auto=format&fit=crop&w=600&q=80',
      thumb: 'https://images.unsplash.com/photo-1487958449943-2429e8be8625?auto=format&fit=crop&w=200&q=80',
    },
    user: { name: 'Jason Briscoe', username: 'jasonbriscoe', portfolio_url: null },
    description: 'Vibrant yellow modular facade of a modern architectural structure.',
    alt_description: 'yellow building architecture',
    category: 'Architecture',
  },
  {
    id: 'arch-2',
    urls: {
      regular: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
      small: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80',
      thumb: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=200&q=80',
    },
    user: { name: 'R-Architecture', username: 'rarchitecture', portfolio_url: null },
    description: 'Beautiful interior lighting of a modern luxury villa living room.',
    alt_description: 'villa interior',
    category: 'Architecture',
  },
  {
    id: 'arch-3',
    urls: {
      regular: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80',
      small: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=600&q=80',
      thumb: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=200&q=80',
    },
    user: { name: 'Sven Brandsma', username: 'svenbrandsma', portfolio_url: null },
    description: 'Clean geometry of raw concrete spiral stairs looking down.',
    alt_description: 'concrete spiral stairs',
    category: 'Architecture',
  },
  {
    id: 'arch-4',
    urls: {
      regular: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
      small: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=600&q=80',
      thumb: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=200&q=80',
    },
    user: { name: 'Bernard Hermant', username: 'bernardhermant', portfolio_url: null },
    description: 'Stunning luxury residence pool facade with minimalist borders.',
    alt_description: 'luxury house pool pool-side',
    category: 'Architecture',
  },
  {
    id: 'arch-5',
    urls: {
      regular: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80',
      small: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=600&q=80',
      thumb: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=200&q=80',
    },
    user: { name: 'Ryunosuke Kikuno', username: 'ryunosuke', portfolio_url: null },
    description: 'Dynamic perspectives of mirror facades on a modern high-rise skyscraper.',
    alt_description: 'glass modular highrise',
    category: 'Architecture',
  },
  {
    id: 'arch-6',
    urls: {
      regular: 'https://images.unsplash.com/photo-1511818966892-d7d671e672a2?auto=format&fit=crop&w=1200&q=80',
      small: 'https://images.unsplash.com/photo-1511818966892-d7d671e672a2?auto=format&fit=crop&w=600&q=80',
      thumb: 'https://images.unsplash.com/photo-1511818966892-d7d671e672a2?auto=format&fit=crop&w=200&q=80',
    },
    user: { name: 'Mathias Reding', username: 'mathiasr', portfolio_url: null },
    description: 'Warm lighting of classical structural columns and dome corridors.',
    alt_description: 'columns corridor archways',
    category: 'Architecture',
  },

  // Technology
  {
    id: 'tech-1',
    urls: {
      regular: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80',
      small: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80',
      thumb: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=200&q=80',
    },
    user: { name: 'Alexandre Debiève', username: 'alexdeb', portfolio_url: null },
    description: 'Detailed close-up of a high-performance computer microchip circuit board.',
    alt_description: 'green electronic circuit board',
    category: 'Technology',
  },
  {
    id: 'tech-2',
    urls: {
      regular: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80',
      small: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=600&q=80',
      thumb: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=200&q=80',
    },
    user: { name: 'Markus Spiske', username: 'markusspiske', portfolio_url: null },
    description: 'Cybersecurity green code stream on matrix console.',
    alt_description: 'green digital hacker code',
    category: 'Technology',
  },
  {
    id: 'tech-3',
    urls: {
      regular: 'https://images.unsplash.com/photo-1531297484001-80022131f5a1?auto=format&fit=crop&w=1200&q=80',
      small: 'https://images.unsplash.com/photo-1531297484001-80022131f5a1?auto=format&fit=crop&w=600&q=80',
      thumb: 'https://images.unsplash.com/photo-1531297484001-80022131f5a1?auto=format&fit=crop&w=200&q=80',
    },
    user: { name: 'Clément Hélardot', username: 'clemhlrdt', portfolio_url: null },
    description: 'Sleek dark laptop screen displaying modern dashboard in workspace.',
    alt_description: 'minimal laptop workplace',
    category: 'Technology',
  },
  {
    id: 'tech-4',
    urls: {
      regular: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1200&q=80',
      small: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=600&q=80',
      thumb: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=200&q=80',
    },
    user: { name: 'Misha Alans', username: 'mishaalans', portfolio_url: null },
    description: 'Intelligent network server dashboard with blue neon status lights.',
    alt_description: 'cyber security firewall routers',
    category: 'Technology',
  },
  {
    id: 'tech-5',
    urls: {
      regular: 'https://images.unsplash.com/photo-1581092921461-eab62e97a780?auto=format&fit=crop&w=1200&q=80',
      small: 'https://images.unsplash.com/photo-1581092921461-eab62e97a780?auto=format&fit=crop&w=600&q=80',
      thumb: 'https://images.unsplash.com/photo-1581092921461-eab62e97a780?auto=format&fit=crop&w=200&q=80',
    },
    user: { name: 'ThisIsEngineering', username: 'thisisengineering', portfolio_url: null },
    description: 'Smart robotic arms working on high precision engineering line.',
    alt_description: 'robotic automation arm',
    category: 'Technology',
  },
  {
    id: 'tech-6',
    urls: {
      regular: 'https://images.unsplash.com/photo-1504639725590-34d0984388bd?auto=format&fit=crop&w=1200&q=80',
      small: 'https://images.unsplash.com/photo-1504639725590-34d0984388bd?auto=format&fit=crop&w=600&q=80',
      thumb: 'https://images.unsplash.com/photo-1504639725590-34d0984388bd?auto=format&fit=crop&w=200&q=80',
    },
    user: { name: 'Christopher Gower', username: 'cgower', portfolio_url: null },
    description: 'Macbook displaying programming code lines in modular IDE workspace.',
    alt_description: 'macbook pro developer editor',
    category: 'Technology',
  },
];

// Helper to check if Unsplash Key is available
const getUnsplashKey = (): string | null => {
  const envKey = import.meta.env.VITE_UNSPLASH_ACCESS_KEY;
  if (envKey && envKey.trim() !== '' && envKey !== 'YOUR_UNSPLASH_ACCESS_KEY') {
    return envKey;
  }
  return localStorage.getItem('stacksy_unsplash_key');
};

const fetchUnsplashPage = async (
  page: number,
  category: string,
  query: string,
  key: string
): Promise<UnsplashPhoto[]> => {
  const perPage = 12;
  let url = '';

  // If search query or specific category is selected
  if (query.trim() !== '') {
    url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(
      query
    )}&page=${page}&per_page=${perPage}`;
  } else if (category !== 'All') {
    url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(
      category
    )}&page=${page}&per_page=${perPage}`;
  } else {
    url = `https://api.unsplash.com/photos?page=${page}&per_page=${perPage}`;
  }

  const response = await fetch(url, {
    headers: {
      Authorization: `Client-ID ${key}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Unsplash API error: ${response.statusText}`);
  }

  const data = await response.json();
  
  // Search endpoint returns { results: [...] }, standard listing returns [...]
  const photos = Array.isArray(data) ? data : data.results;
  
  return photos.map((p: any) => ({
    id: p.id,
    urls: {
      regular: p.urls.regular,
      small: p.urls.small,
      thumb: p.urls.thumb,
    },
    user: {
      name: p.user.name,
      username: p.user.username,
      portfolio_url: p.user.portfolio_url,
    },
    description: p.description || p.alt_description || '',
    alt_description: p.alt_description || '',
  }));
};

export const useUnsplash = () => {
  const category = useStore((state) => state.category);
  const searchQuery = useStore((state) => state.searchQuery);
  const apiKey = getUnsplashKey();

  const isUsingFallback = !apiKey;

  const result = useInfiniteQuery({
    queryKey: ['unsplash_photos', category, searchQuery, apiKey],
    queryFn: async ({ pageParam = 1 }): Promise<UnsplashPhoto[]> => {
      if (isUsingFallback) {
        // Mock Pagination & Search with Local Curated Photos
        await new Promise((resolve) => setTimeout(resolve, 600)); // simulate loading delay
        
        let filtered = FALLBACK_PHOTOS;
        if (category !== 'All') {
          filtered = filtered.filter((p) => p.category === category);
        }
        if (searchQuery.trim() !== '') {
          const s = searchQuery.toLowerCase();
          filtered = filtered.filter(
            (p) =>
              (p.description && p.description.toLowerCase().includes(s)) ||
              (p.alt_description && p.alt_description.toLowerCase().includes(s)) ||
              p.user.name.toLowerCase().includes(s)
          );
        }

        const itemsPerPage = 6;
        const startIndex = (pageParam - 1) * itemsPerPage;
        const sliced = filtered.slice(startIndex, startIndex + itemsPerPage);
        return sliced;
      }

      // If user supplied key, fetch real photos
      return fetchUnsplashPage(pageParam, category, searchQuery, apiKey!);
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage, _allPages, lastPageParam) => {
      if (lastPage.length === 0) return undefined;
      return lastPageParam + 1;
    },
  });

  return {
    ...result,
    isUsingFallback,
  };
};
