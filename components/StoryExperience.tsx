'use client';

import React, { useState } from 'react';
import { MotionConfig, AnimatePresence, motion } from 'framer-motion';

import { THEMES, MOCK_DATA } from '../constants';
import { ThemeType, UserYearData } from '../types';
import {
  fetchIssuesWithCommentsByUsername,
  fetchUserByUsername,
} from '../api/drupal';
import { transformDrupalData } from '../utils/transformers';

import StoryPlayer from './StoryPlayer';
import UsernameForm from './sections/UsernameForm';
import { getDrupalUserData } from '@/app/actions';

interface StoryExperienceProps {
  /** Visual theme */
  theme?: ThemeType;

  /** Reduce motion for accessibility */
  reduceMotion?: boolean;

  /** Year to fetch data for */
  year?: number;

  /** Optional demo data override */
  demoData?: UserYearData;
}

const StoryExperience: React.FC<StoryExperienceProps> = ({
  theme = 'muted',
  reduceMotion = false,
  year = 2025,
  demoData = MOCK_DATA,
}) => {
  // Data State
  const [userData, setUserData] = useState<UserYearData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingAvatar, setLoadingAvatar] = useState<string | undefined>(
    undefined
  );
  const[drupalData, setDrupalData] = useState<UserYearData | null>(null) 

  const themeStyles = THEMES[theme];

  const handleSearch = async (username: string) => {
    setLoading(true);
    setError(null);
    setLoadingAvatar(undefined);

    const data = await getDrupalUserData(username)
    setDrupalData(data)

    try {
      // 1. Pre-fetch avatar for instant feedback
      try {
        const userPreview = await fetchUserByUsername(username);
        setLoadingAvatar(userPreview.picture?.url);
      } catch (e) {
        console.warn('Could not pre-fetch user avatar', e);
      }

      // 2. Fetch full data
      const apiResponse = await fetchIssuesWithCommentsByUsername(
        username,
        year
      );

      const transformedData = transformDrupalData(apiResponse);
      setUserData(transformedData);
    } catch (err: any) {
      console.error(err);
      setError(
        err.message ||
          'Failed to fetch user data. Please check the username and try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDemo = () => {
    setLoading(true);

    setTimeout(() => {
      setUserData(demoData);
      setError(null);
      setLoadingAvatar(undefined);
      setLoading(false);
    }, 800);
  };

  const handleReset = () => {
    setUserData(null);
    setError(null);
    setLoadingAvatar(undefined);
  };

  return (
    <MotionConfig reducedMotion={reduceMotion ? 'always' : 'user'}>
      <div
        className={`fixed inset-0 w-full h-full overflow-hidden ${themeStyles.bg} flex items-center justify-center`}
      >
        <AnimatePresence mode="wait">
          {!userData ? (
            <motion.div
              key="form"
              className="w-full h-full overflow-y-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <UsernameForm
                onSearch={handleSearch}
                onDemo={handleDemo}
                loading={loading}
                error={error}
                themeStyles={themeStyles}
                userAvatarUrl={loadingAvatar}
              />
            </motion.div>
          ) : (
            <motion.div
              key="story"
              className="w-full h-full md:max-w-[450px] md:h-[850px] md:max-h-[90vh] relative shadow-2xl md:rounded-[3rem] overflow-hidden"
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <StoryPlayer data={drupalData} onExit={handleReset}  />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </MotionConfig>
  );
};

export default StoryExperience;
