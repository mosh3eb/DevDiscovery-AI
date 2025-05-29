import { CharacteristicOption } from './services/types';

export const CHARACTERISTICS_OPTIONS: CharacteristicOption[] = [
  { id: 'beginner-friendly', label: 'Beginner-Friendly', description: 'Suitable for developers new to the project', category: 'community' },
  { id: 'good-first-issues', label: 'Good First Issues', description: 'Has issues marked as good for beginners', category: 'community' },
  { id: 'actively-maintained', label: 'Actively Maintained', description: 'Regular updates and maintenance', category: 'maintainability' },
  { id: 'good-documentation', label: 'Good Documentation', description: 'Well-documented code and usage', category: 'documentation' },
  { id: 'large-community', label: 'Large Community', description: 'Active community of contributors', category: 'community' },
  { id: 'cutting-edge-tech', label: 'Cutting-Edge Tech', description: 'Uses modern technologies and practices', category: 'performance' },
  { id: 'needs-contributors', label: 'Needs Contributors', description: 'Looking for new contributors', category: 'community' }
];

export const GEMINI_MODEL_NAME = 'gemini-2.5-flash-preview-04-17';
