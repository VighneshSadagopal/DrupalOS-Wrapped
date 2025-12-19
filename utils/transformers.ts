import { DrupalApiResponse } from '../api/drupal';
import { UserYearData, Issue, MonthlyStat, ProjectStats, UserEvent } from '../types';

const getMonthName = (monthIndex: number) => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return months[monthIndex];
};

export const transformDrupalData = (response: DrupalApiResponse): UserYearData => {
  const { user, issues, aiIssues, drupalCoreIssues, topProject, totalCount, activityByMonth } = response;

  // 1. Calculate Monthly Stats
  let monthsData: number[];

  if (activityByMonth && activityByMonth.length === 12) {
    monthsData = activityByMonth;
  } else {
    monthsData = new Array(12).fill(0);
  }
  
  const monthlyStats: MonthlyStat[] = monthsData.map((count, index) => ({
    month: getMonthName(index),
    count
  }));

  // 2. Top Project (Placeholder logic as issues are mostly empty now)
  let projectStats: ProjectStats;
  
  if (topProject) {
    projectStats = {
      id: 'top-project',
      name: topProject.name,
      icon: '💧', 
      totalIssues: topProject.count,
      percentage: 0,
      topMetric: 'Most Active',
      description: `You focused heavily on ${topProject.name}.`
    };
  } else {
    projectStats = {
      id: 'none',
      name: 'No Activity',
      icon: '🕸️',
      totalIssues: 0,
      percentage: 0,
      topMetric: 'Quiet Year',
      description: 'No specific project activity found for 2025.'
    };
  }

  // 3. Helper to transform API records to Issue type
  const transformRecords = (records: any[], defaultProject: string): Issue[] => {
    return (records || []).map((record, index) => {
      let dateStr = '2025-01-01';
      if (record.created) {
         const dateObj = new Date(typeof record.created === 'number' ? record.created * 1000 : record.created);
         if (!isNaN(dateObj.getTime())) {
           dateStr = dateObj.toISOString().split('T')[0];
         }
      }
  
      return {
        id: record.nid || `${defaultProject.toLowerCase()}-${index}`,
        title: record.title || 'Untitled Contribution',
        project: defaultProject,
        createdAt: dateStr,
        status: 'closed', 
        labels: [defaultProject, 'Contribution'],
        comments: 0,
        url: record.url || '#'
      };
    });
  }

  const transformedAiIssues = transformRecords(aiIssues, 'Drupal AI');
  const transformedCoreIssues = transformRecords(drupalCoreIssues, 'Drupal Core');

  const aiCount = transformedAiIssues.length > 0 ? transformedAiIssues.length : 12; // Default for demo
  const coreCount = transformedCoreIssues.length > 0 ? transformedCoreIssues.length : 5; // Default for demo
  
  // Calculate Total: If API returned 0 (no generic scrape), use sum of specific projects + defaults if in demo mode
  // If in demo mode (totalCount=0 but we want to show something), we rely on MOCK_DATA in App.tsx usually, 
  // but if real fetch happened and yielded 0, we show 0 unless we have specific project data.
  const finalTotal = totalCount > 0 ? totalCount : (aiCount + coreCount > 17 ? aiCount + coreCount : 0);

  // 4. Process Avatar URL
  let safeAvatarUrl = undefined;
  if (user.picture?.url) {
    safeAvatarUrl = user.picture.url.replace(/^http:\/\//i, 'https://');
  }

  return {
    userId: user.uid,
    userName: user.name,
    avatarUrl: safeAvatarUrl,
    totalContributions: finalTotal, 
    uniqueIssuesCount: finalTotal,
    totalIssues: finalTotal,
    topProject: projectStats,
    issues: [], 
    aiIssues: transformedAiIssues,
    monthlyStats,
    events: [],
    memberSince: 2021, // Placeholder
    menteeCount: 46, // Placeholder
    aiContributionCount: aiCount,
    drupalCoreContributionCount: coreCount
  };
};
