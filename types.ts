export interface Issue {
  id: string;
  title: string;
  project: string;
  createdAt: string; // ISO Date
  status: 'open' | 'closed' | 'merged';
  labels: string[];
  comments: number;
  url: string;
}

export interface ProjectStats {
  id: string;
  name: string;
  icon: string; // URL or emoji
  totalIssues: number;
  percentage: number;
  topMetric: string; // e.g., "Most Active"
  description: string;
}

export interface MonthlyStat {
  month: string;
  count: number;
}

export interface UserEvent {
  id: string;
  title: string;
  date: string;
  type: 'speaking' | 'volunteering';
  url?: string;
}

export interface UserYearData {
  userId: string;
  userName: string;
  avatarUrl?: string;
  totalContributions: number; // Sum of all comments + creations
  totalIssues: number; // Alias for uniqueIssuesCount (backward compatibility)
  uniqueIssuesCount: number; // Distinct issues interacted with
  topProject: ProjectStats;
  issues: Issue[];
  aiIssues: Issue[]; // New field for AI specific issues
  monthlyStats: MonthlyStat[];
  events: UserEvent[];
  memberSince?: number; // Year user joined
  menteeCount?: number; // Number of people mentored
  aiContributionCount?: number; // Number of AI-related contributions
  drupalCoreContributionCount?: number; // Number of Drupal Core contributions
  contributorRoles?: string[]; // List of roles held by the user
}

export type ThemeType = 'bright' | 'muted';

export interface ThemeContextType {
  theme: ThemeType;
  toggleTheme: () => void;
  reduceMotion: boolean;
  toggleReduceMotion: () => void;
}
