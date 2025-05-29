import { Project } from '../types';

const GOOGLE_API_KEY = process.env.VITE_GOOGLE_API_KEY;
const GOOGLE_CSE_ID = process.env.VITE_GOOGLE_CSE_ID;

export interface GoogleSearchResult {
  title: string;
  link: string;
  snippet: string;
  source: 'google';
}

// Enhanced language detection with confidence scoring
const detectLanguageWithConfidence = (description: string): { language: string; confidence: number } => {
  const languagePatterns = {
    'JavaScript': /(javascript|node\.js|nodejs|js\b)/i,
    'TypeScript': /(typescript|ts\b)/i,
    'Python': /(python|py\b|django|flask)/i,
    'Java': /(java\b|spring boot|gradle|maven)/i,
    'C++': /(c\+\+|cpp\b)/i,
    'C#': /(c#|csharp|\.net|dotnet)/i,
    'Ruby': /(ruby|rails|rake)/i,
    'Go': /(golang|go\b)/i,
    'Rust': /(rust|cargo)/i,
    'PHP': /(php|laravel|symfony)/i,
    'Swift': /(swift|ios\b|xcode)/i,
    'Kotlin': /(kotlin|android)/i,
    'Dart': /(dart|flutter)/i
  };

  let bestMatch = { language: 'Unknown', confidence: 0 };
  
  for (const [language, pattern] of Object.entries(languagePatterns)) {
    const matches = description.match(new RegExp(pattern, 'gi'));
    if (matches) {
      const confidence = matches.length * 0.3;
      if (confidence > bestMatch.confidence) {
        bestMatch = { language, confidence: Math.min(1, confidence) };
      }
    }
  }

  return bestMatch;
};

// Enhanced tag extraction with categories and tech stacks
const extractTagsFromDescription = (description: string): string[] => {
  const tags = new Set<string>();
  
  // Project categories
  const categories: Record<string, RegExp> = {
    'open-source': /(open[- ]source|opensource|free software)/i,
    'framework': /(framework|library|sdk)/i,
    'tool': /(tool|utility|cli|command[- ]line)/i,
    'web-frontend': /(frontend|front[- ]end|web app|react|vue|angular|svelte)/i,
    'web-backend': /(backend|back[- ]end|server|api|rest|graphql)/i,
    'mobile': /(mobile|ios|android|cross[- ]platform|responsive)/i,
    'desktop': /(desktop|electron|tauri|gtk|qt)/i,
    'devops': /(devops|ci[/]cd|pipeline|automation|kubernetes|docker)/i,
    'database': /(database|sql|nosql|orm|mongodb|postgresql|mysql)/i,
    'machine-learning': /(machine[- ]learning|ml|ai|artificial[- ]intelligence|deep[- ]learning|neural)/i,
    'security': /(security|cryptography|encryption|auth|authentication|authorization)/i,
    'testing': /(testing|test|unit[- ]test|e2e|end[- ]to[- ]end)/i,
    'documentation': /(documentation|docs|tutorial|guide|learning)/i
  };

  // Technology stacks
  const stacks: Record<string, RegExp> = {
    'mern': /(mern|mongo.*express.*react.*node)/i,
    'lamp': /(lamp|linux.*apache.*mysql.*php)/i,
    'jamstack': /(jamstack|static[- ]site|netlify|vercel)/i,
    'serverless': /(serverless|lambda|cloud[- ]function)/i,
    'microservices': /(microservice|service[- ]mesh|distributed)/i,
    'blockchain': /(blockchain|web3|ethereum|smart[- ]contract)/i
  };

  // Project characteristics
  const characteristics: Record<string, RegExp> = {
    'production-ready': /(production[- ]ready|stable|enterprise)/i,
    'actively-maintained': /(actively|regularly|maintained|supporting|updates)/i,
    'beginner-friendly': /(beginner|starter|boilerplate|template)/i,
    'high-performance': /(high[- ]performance|optimized|fast|efficient)/i,
    'scalable': /(scalable|scale|distributed|cluster)/i,
    'cross-platform': /(cross[- ]platform|platform[- ]independent|portable)/i
  };

  // Add tags based on matches
  Object.entries({ ...categories, ...stacks, ...characteristics }).forEach(([tag, pattern]) => {
    if (pattern.test(description)) {
      tags.add(tag);
    }
  });

  // Add language as a tag if detected with high confidence
  const langInfo = detectLanguageWithConfidence(description);
  if (langInfo.confidence > 0.5) {
    tags.add(langInfo.language.toLowerCase());
  }

  return Array.from(tags);
};

// Rate limiting implementation
const rateLimiter = {
  tokens: 100,
  lastRefill: Date.now(),
  refillRate: 60000, // 1 minute in milliseconds
  refillAmount: 50,

  async getToken(): Promise<boolean> {
    const now = Date.now();
    const timePassed = now - this.lastRefill;
    
    if (timePassed >= this.refillRate) {
      const refills = Math.floor(timePassed / this.refillRate);
      this.tokens = Math.min(100, this.tokens + (refills * this.refillAmount));
      this.lastRefill = now;
    }

    if (this.tokens > 0) {
      this.tokens--;
      return true;
    }

    // Wait for token refill if none available
    await new Promise(resolve => setTimeout(resolve, this.refillRate));
    return this.getToken();
  }
};

// Helper function to calculate relevance score
const calculateRelevanceScore = (query: string, description: string, tags: string[]): number => {
  let score = 0;

  // Query match score (0-40)
  const queryTerms = query.toLowerCase().split(/\s+/);
  queryTerms.forEach(term => {
    if (description.toLowerCase().includes(term)) {
      score += 10;
    }
  });

  // Description quality score (0-30)
  const words = description.split(/\s+/).length;
  score += Math.min(30, words / 10);

  // Tags relevance score (0-30)
  score += Math.min(30, tags.length * 5);

  return Math.min(100, score);
};

// Enhanced search function with rate limiting and improved error handling
export const searchProjects = async (query: string): Promise<Project[]> => {
  try {
    // Check API configuration
    if (!GOOGLE_API_KEY || !GOOGLE_CSE_ID) {
      throw new Error('Google Search API credentials not configured');
    }

    // Apply rate limiting
    await rateLimiter.getToken();

    const endpoint = 'https://www.googleapis.com/customsearch/v1';
    const params = new URLSearchParams({
      key: GOOGLE_API_KEY,
      cx: GOOGLE_CSE_ID,
      q: `${query} (github.com OR gitlab.com OR bitbucket.org OR sourceforge.net OR npmjs.com OR codeberg.org) programming project`,
      num: '10'
    });

    const response = await fetch(`${endpoint}?${params.toString()}`);
    if (!response.ok) {
      if (response.status === 429) {
        throw new Error('Google API rate limit exceeded');
      }
      throw new Error(`Google API error: ${response.statusText}`);
    }

    const data = await response.json();
    if (!data.items) {
      return [];
    }

    // Process search results with enhanced metadata
    interface GoogleSearchItem {
      title: string;
      snippet: string;
      link: string;
    }

    const projects: Project[] = (data.items as GoogleSearchItem[])
      .filter((item: GoogleSearchItem) => {
        // Filter for repository URLs
        return item.link.match(
          /(github\.com|gitlab\.com|bitbucket\.org|sourceforge\.net|npmjs\.com|codeberg\.org)\/[^/]+\/[^/]+/
        );
      })
      .map((item: GoogleSearchItem) => {
        const langInfo: { language: string; confidence: number } = detectLanguageWithConfidence(item.snippet);
        const tags: string[] = extractTagsFromDescription(item.snippet);
        
        // Calculate relevance score based on description quality and matched tags
        const relevanceScore: number = calculateRelevanceScore(query, item.snippet, tags);

        return {
          name: item.title.split(' - ')[0].trim(),
          description: item.snippet || 'No description available',
          url: item.link,
          language: langInfo.language,
          tags,
          stars: undefined,
          lastUpdate: undefined,
          forks: undefined,
          relevanceScore
        };
      })
      .sort((a: Project, b: Project) => (b.relevanceScore ?? 0) - (a.relevanceScore ?? 0));

    return projects;
  } catch (error) {
    console.error('Google search error:', error);
    throw error;
  }
};
