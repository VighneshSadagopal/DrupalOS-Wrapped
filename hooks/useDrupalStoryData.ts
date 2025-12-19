import { useState } from 'react';
import { fetchUserByUsername } from '../api/drupal';
import { collectAndStoreDrupalUserData } from '../utils/drupal-api';
import { MOCK_DATA } from '../constants';
import { UserYearData, UserEvent } from '../types';

interface UseDrupalStoryDataResult {
  data: UserYearData | null;
  loading: boolean;
  error: string | null;
  userAvatarUrl: string | undefined;
  fetchData: (username: string, isDemo?: boolean) => Promise<void>;
}

// Helper to parse member since string (e.g. "Member for 10 years 2 months" or "2015")
const parseMemberSince = (str: string | null): number => {
  if (!str) return 2021;
  
  // Try finding a year directly (2000-2025)
  const yearMatch = str.match(/\b(20\d{2})\b/);
  if (yearMatch) return parseInt(yearMatch[1], 10);
  
  // Try parsing relative time "10 years"
  const relativeMatch = str.match(/(\d+)\s+year/i);
  if (relativeMatch) {
    return 2025 - parseInt(relativeMatch[1], 10);
  }
  
  return 2021; // Default fallback
};

// Helper to map scraped event objects to UserEvent array
const mapEvents = (events2025: { spokenAt: string[]; organized: string[]; attended: string[] }): UserEvent[] => {
  const result: UserEvent[] = [];
  
  const addEvents = (list: string[], type: 'speaking' | 'volunteering') => {
    if (!list || !Array.isArray(list)) return;
    list.forEach((title, idx) => {
      // Deduplicate or cleanup titles if needed
      if (title) {
        result.push({
          id: `${type}-${idx}-${Math.random().toString(36).substr(2, 9)}`,
          title: title.replace(/['"]/g, '').trim(),
          date: '2025',
          type,
          url: '#'
        });
      }
    });
  };

  if (events2025) {
    addEvents(events2025.spokenAt, 'speaking');
    addEvents(events2025.organized, 'volunteering');
  }
  
  return result;
};

export const useDrupalStoryData = (): UseDrupalStoryDataResult => {
  const [data, setData] = useState<UserYearData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userAvatarUrl, setUserAvatarUrl] = useState<string | undefined>(undefined);

  const fetchData = async (username: string, isDemo: boolean = false) => {
    setLoading(true);
    setError(null);
    setUserAvatarUrl(undefined);

    if (isDemo) {
      setTimeout(() => {
        setData(MOCK_DATA);
        setLoading(false);
      }, 1500);
      return;
    }

    try {
      // 1. Fetch User Basic Profile (Avatar & Name)
      // We rely on the lightweight existing API function for the avatar as scraping images is harder
      let userProfile = { name: username, uid: '', picture: { url: undefined as string | undefined } };
      
      try {
        const profile = await fetchUserByUsername(username);
        userProfile = {
            name: profile.name,
            uid: profile.uid,
            picture: { url: profile.picture?.url }
        };
        setUserAvatarUrl(profile.picture?.url);
      } catch (e) {
        console.warn("User profile fetch failed, continuing with scrape...", e);
      }

      // 2. Main Data Enrichment (Scraping + Contributions API)
      const enrichedData = await collectAndStoreDrupalUserData(username, 12);

      // 3. Map Enriched Data to Application Model
      const totalCount = enrichedData.total_issues_count;
      
      const mappedData: UserYearData = {
        userId: userProfile.uid || username,
        userName: userProfile.name,
        avatarUrl: userProfile.picture.url,
        
        // Stats
        totalContributions: totalCount,
        totalIssues: totalCount,
        uniqueIssuesCount: totalCount,
        
        // Special Tracks
        aiContributionCount: enrichedData.total_issues_for_ai_count,
        drupalCoreContributionCount: enrichedData.total_issues_for_drupal_count,
        menteeCount: enrichedData.mentee_count,
        memberSince: parseMemberSince(enrichedData.member_since),
        
        // Roles & Events (Scraped)
        contributorRoles: enrichedData.contributor_roles,
        events: mapEvents(enrichedData.events_2025),
        
        // Placeholders / Defaults
        monthlyStats: Array(12).fill(0).map((_, i) => ({
            month: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][i],
            count: 0 // Scraper doesn't currently provide monthly breakdown
        })),
        
        topProject: {
            id: 'summary',
            name: 'Drupal',
            icon: '💧',
            totalIssues: totalCount,
            percentage: 100,
            topMetric: 'Impact',
            description: 'Contributions across Drupal.org'
        },
        
        issues: [],
        aiIssues: []
      };
      
      setData(mappedData);
    } catch (err: any) {
      console.error("Story Data Error:", err);
      setError("Failed to generate your story. Please verify the username and try again.");
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, userAvatarUrl, fetchData };
};