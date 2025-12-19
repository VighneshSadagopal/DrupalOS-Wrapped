import { UserYearData } from './types';

// Mock Data Generator for the assignment
export const MOCK_DATA: UserYearData = {
  userId: 'user-123',
  userName: 'Alex',
  avatarUrl: 'https://www.drupal.org/files/styles/grid-3-2x/public/user-pictures/picture-default.jpg',
  totalContributions: 142,
  totalIssues: 45, // Backward compatibility alias
  uniqueIssuesCount: 45,
  memberSince: 2021,
  menteeCount: 46,
  aiContributionCount: 12,
  drupalCoreContributionCount: 5,
  topProject: {
    id: 'proj-alpha',
    name: 'Nebula UI',
    icon: '⚛️',
    totalIssues: 86,
    percentage: 60.5,
    topMetric: 'Most Impactful',
    description: 'You drove 60% of all frontend cleanup tasks here.'
  },
  monthlyStats: [
    { month: 'Jan', count: 5 },
    { month: 'Feb', count: 12 },
    { month: 'Mar', count: 8 },
    { month: 'Apr', count: 15 },
    { month: 'May', count: 22 },
    { month: 'Jun', count: 18 },
    { month: 'Jul', count: 4 },
    { month: 'Aug', count: 10 },
    { month: 'Sep', count: 25 }, // Peak
    { month: 'Oct', count: 14 },
    { month: 'Nov', count: 6 },
    { month: 'Dec', count: 3 },
  ],
  events: [
    {
      id: 'evt-1',
      title: 'DrupalCon Barcelona 2025',
      date: 'Sep 2025',
      type: 'speaking',
      url: '#'
    },
    {
      id: 'evt-2',
      title: 'Global Contribution Weekend',
      date: 'Jan 2025',
      type: 'volunteering',
      url: '#'
    }
  ],
  issues: Array.from({ length: 12 }).map((_, i) => ({
    id: `issue-${i}`,
    title: [
      "Fix race condition in auth provider",
      "Update dependency versions for security",
      "Refactor button component API",
      "Add dark mode support to dashboard",
      "optimize image loading strategy",
      "Documentation: Add usage examples",
      "Bug: Navigation glitch on mobile",
      "Feature: User profile settings",
      "Accessibility: Improve screen reader labels",
      "Tests: Add E2E coverage for checkout",
      "Chore: Remove legacy CSS",
      "Design: New typography scale"
    ][i],
    project: i % 3 === 0 ? 'Nebula UI' : (i % 2 === 0 ? 'Cosmos Backend' : 'Docs'),
    createdAt: `2025-${String((i % 12) + 1).padStart(2, '0')}-15`,
    status: i % 4 === 0 ? 'open' : 'closed',
    labels: i % 2 === 0 ? ['bug', 'urgent'] : ['feature', 'enhancement'],
    comments: Math.floor(Math.random() * 10),
    url: '#'
  })),
  aiIssues: [
    {
      id: 'ai-1',
      title: 'Implement LLM caching for search',
      project: 'Drupal AI',
      createdAt: '2025-03-10',
      status: 'closed',
      labels: ['AI', 'Performance'],
      comments: 5,
      url: '#'
    },
    {
      id: 'ai-2',
      title: 'Fix prompt injection vulnerability',
      project: 'Drupal AI',
      createdAt: '2025-05-22',
      status: 'closed',
      labels: ['Security', 'AI'],
      comments: 12,
      url: '#'
    },
    {
      id: 'ai-3',
      title: 'Add support for Gemini 1.5 Pro',
      project: 'Drupal AI',
      createdAt: '2025-08-15',
      status: 'closed',
      labels: ['Feature', 'AI'],
      comments: 8,
      url: '#'
    }
  ]
};

export const THEMES = {
  bright: {
    bg: 'bg-slate-50',
    text: 'text-slate-900',
    textMuted: 'text-slate-600',
    card: 'bg-white',
    border: 'border-slate-200',
    accent: 'text-brand-600',
    button: 'bg-brand-600 hover:bg-brand-700 text-white',
    highlight: 'bg-accent-yellow/20 text-yellow-800'
  },
  muted: {
    bg: 'bg-stone-900',
    text: 'text-stone-100',
    textMuted: 'text-stone-400',
    card: 'bg-stone-800',
    border: 'border-stone-700',
    accent: 'text-accent-orange',
    button: 'bg-stone-100 hover:bg-white text-stone-900',
    highlight: 'bg-accent-purple/20 text-purple-200'
  }
};
