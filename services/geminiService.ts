import { GoogleGenerativeAI, GenerateContentResult } from "@google/generative-ai";
import { UserPreferences, Project } from '../types';
import { CHARACTERISTICS_OPTIONS } from '../constants';

interface AIProjectSuggestion {
  name: string;
  description: string;
  language: string;
  tags: string[];
  url: string;
  conceptual_difficulty: 'Beginner' | 'Intermediate' | 'Advanced' | string;
}

const mapAISuggestionToProject = (aiProj: AIProjectSuggestion, index: number): Project => ({
  name: aiProj.name || `AI Suggested Project ${index + 1}`,
  description: aiProj.description || 'No description provided by AI.',
  url: aiProj.url || 'N/A',
  language: aiProj.language || 'Unknown',
  tags: aiProj.tags && Array.isArray(aiProj.tags) 
        ? (aiProj.conceptual_difficulty ? [...aiProj.tags, `Difficulty: ${aiProj.conceptual_difficulty}`] : aiProj.tags)
        : (aiProj.conceptual_difficulty ? [`Difficulty: ${aiProj.conceptual_difficulty}`] : []),
  platform: 'AI Suggestion',
  stars: 0,
  forks: 0,
  watchers: 0,
  openIssues: 0,
  closedIssues: 0,
  contributors: 0,
  commitsLastMonth: 0,
  issuesLastMonth: 0,
  pullRequestsLastMonth: 0,
  owner: undefined,
  downloads: undefined,
  recentDownloads: undefined,
  monthlyDownloads: undefined,
  versionDownloads: undefined,
  version: undefined,
  updatedAt: undefined,
  isBookmarked: false
});

const fetchAIRecommendations = async (preferences: Omit<UserPreferences, 'platforms'>): Promise<Project[]> => {
  console.log('Checking API key:', {
    hasKey: !!process.env.GEMINI_API_KEY,
    keyLength: process.env.GEMINI_API_KEY?.length,
    envKeys: Object.keys(process.env).filter(key => key.includes('GEMINI'))
  });

  if (!process.env.GEMINI_API_KEY) {
    console.error("GEMINI_API_KEY environment variable is not set.");
    throw new Error("AI service is not configured (API key missing).");
  }
  const ai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

  const characteristicsString = preferences.characteristics
    .map(id => CHARACTERISTICS_OPTIONS.find(c => c.id === id)?.label)
    .filter(Boolean)
    .join(', ');

  const prompt = `
    System Instruction: "You are an expert software project recommender, specializing in open-source. Your goal is to recommend real, existing open-source projects that match the user's preferences. Focus on well-maintained, popular projects that are actively developed. Provide up to 5 project suggestions."

    User Preferences:
    - Languages: ${preferences.languages || 'Any'}
    - Topics: ${preferences.topics || 'Any'}
    - Desired Characteristics: ${characteristicsString || 'General interest'}

    IMPORTANT: You must respond with a valid JSON array containing project objects. The response must start with [ and end with ]. Each object must be properly formatted with all strings in double quotes.

    Each project object must have these exact fields:
    {
      "name": "Project Name",
      "description": "Project description",
      "language": "Primary Language",
      "tags": ["tag1", "tag2", "tag3"],
      "url": "https://github.com/username/repo",
      "conceptual_difficulty": "Beginner|Intermediate|Advanced"
    }

    Example of a valid response:
    [
      {
        "name": "Vue.js",
        "description": "A progressive, incrementally adoptable JavaScript framework for building UI on the web.",
        "language": "JavaScript",
        "tags": ["frontend", "framework", "vue", "javascript"],
        "url": "https://github.com/vuejs/vue",
        "conceptual_difficulty": "Intermediate"
      }
    ]

    Rules:
    1. Start with [ and end with ]
    2. Use double quotes for all strings
    3. No trailing commas
    4. No comments or explanatory text
    5. No special characters in strings
    6. Keep descriptions short and simple
    7. Use valid GitHub URLs
    8. Only include real, existing projects

    Return ONLY the JSON array. Do not include any other text.
  `;

  let geminiApiResponse: GenerateContentResult | undefined;

  try {
    const model = ai.getGenerativeModel({ model: 'gemini-pro' });
    geminiApiResponse = await model.generateContent(prompt);

    if (!geminiApiResponse) {
      throw new Error("No response from AI model");
    }

    let jsonStr = geminiApiResponse.response.text()?.trim() || '';
    console.log('Raw AI response:', jsonStr);

    // Extract JSON array if it's wrapped in markdown or other text
    const arrayMatch = jsonStr.match(/\[\s*\{[\s\S]*\}\s*\]/);
    if (arrayMatch) {
      jsonStr = arrayMatch[0];
      console.log('Extracted array:', jsonStr);
    }

    // Basic cleanup
    jsonStr = jsonStr
      .replace(/\n/g, ' ')
      .replace(/\r/g, '')
      .replace(/\t/g, ' ')
      .replace(/\s+/g, ' ')
      .replace(/,(\s*[}\]])/g, '$1');

    console.log('Cleaned JSON:', jsonStr);

    try {
      const parsedData = JSON.parse(jsonStr);

      if (!Array.isArray(parsedData)) {
        throw new Error("Response is not a JSON array");
      }

      // Validate and filter projects
      const validProjects = parsedData.filter((item): item is AIProjectSuggestion => {
        if (!item || typeof item !== 'object') {
          console.log('Invalid item (not an object):', item);
          return false;
        }

        const requiredFields = {
          name: 'string',
          description: 'string',
          language: 'string',
          tags: 'array',
          url: 'string',
          conceptual_difficulty: 'string'
        };

        for (const [field, type] of Object.entries(requiredFields)) {
          if (type === 'array') {
            if (!Array.isArray(item[field])) {
              console.log(`Invalid ${field} (not an array):`, item[field]);
              return false;
            }
          } else if (typeof item[field] !== type) {
            console.log(`Invalid ${field} (not a ${type}):`, item[field]);
            return false;
          }
        }

        return true;
      });

      if (validProjects.length === 0) {
        throw new Error("No valid project suggestions found");
      }

      return validProjects.map((item, index) => mapAISuggestionToProject(item, index));
    } catch (parseError: unknown) {
      console.error('Parse error:', parseError);
      console.error('Attempted to parse:', jsonStr);
      const errorMessage = parseError instanceof Error ? parseError.message : 'Unknown parse error';
      throw new Error(`Failed to parse AI response: ${errorMessage}`);
    }
  } catch (error) {
    console.error("Error fetching or parsing AI recommendations:", error);
    let message = "An unknown error occurred with the AI service.";
    if (error instanceof Error) {
        message = error.message;
    } else if (typeof error === 'string') {
        message = error;
    }
    
    if (message.includes("API key not valid") || (error as any)?.type === 'permission_denied' || (error as any)?.status === 'PERMISSION_DENIED') {
         throw new Error("AI service API key is invalid or lacks permissions. Please check configuration.");
    }
    
    throw new Error(`Failed to get AI recommendations: ${message}`);
  }
};

export { fetchAIRecommendations };
