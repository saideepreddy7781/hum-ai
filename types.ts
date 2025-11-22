export interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

export interface MoodAnalysisResult {
  mood: string;
  intensity: number; // 1-10
  color: string;
  summary: string;
  suggestions: ContentSuggestion[];
}

export interface ContentSuggestion {
  type: 'music' | 'activity' | 'article' | 'video';
  title: string;
  description: string;
  duration?: string;
}

export interface UserState {
  name: string;
  isLoggedIn: boolean;
  currentMood?: MoodAnalysisResult;
}
