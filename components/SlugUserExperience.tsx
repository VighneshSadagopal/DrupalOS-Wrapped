"use client";

import React, { useEffect, useState } from "react";
import { MotionConfig, AnimatePresence, motion } from "framer-motion";

import { THEMES } from "../constants";
import { ThemeType, UserYearData } from "../types";
import {
  fetchIssuesWithCommentsByUsername,
  fetchUserByUsername,
} from "../api/drupal";
import { transformDrupalData } from "../utils/transformers";

import StoryPlayer from "./StoryPlayer";
import UsernameForm from "./sections/UsernameForm";
import { getDrupalUserData } from "@/app/actions";
import SlugStoryPlayer from "./SlugStoryPlayer";

interface StoryExperienceProps {
  /** Visual theme */
  theme?: ThemeType;

  /** Reduce motion for accessibility */
  reduceMotion?: boolean;

  /** Year to fetch data for */
  year?: number;

  /** Optional demo data override */
  demoData?: UserYearData;

  slugUserData: any;

  username: string;
}

const SlugUserExperience: React.FC<StoryExperienceProps> = ({
  theme = "muted",
  reduceMotion = false,
  year = 2025,
  slugUserData = null,
  username = ""
}) => {
  // Data State
  const [userData, setUserData] = useState<UserYearData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingAvatar, setLoadingAvatar] = useState<string | undefined>(
    undefined
  );
  const [drupalData, setDrupalData] = useState<UserYearData | null>(null);

  const themeStyles = THEMES[theme];

  useEffect(() => {
    if (!username) return; // guard against empty/initial runs

    let isMounted = true; // prevents state updates after unmount

    const runSearch = async () => {
      setLoading(true);
      setError(null);
      setLoadingAvatar(undefined);

      try {
        const data = await getDrupalUserData(username);
        if (isMounted) {
          setDrupalData(data);
        }


        // 1. Pre-fetch avatar for instant feedback
        try {
          const userPreview = await fetchUserByUsername(username);
          if (isMounted) {
            setLoadingAvatar(userPreview.picture?.url);
          }
        } catch (e) {
          console.warn("Could not pre-fetch user avatar", e);
        }

        // 2. Fetch full data
        const apiResponse = await fetchIssuesWithCommentsByUsername(
          username,
          year
        );

        const transformedData = transformDrupalData(apiResponse);
        if (isMounted) {
          setUserData(transformedData);
        }
      } catch (err: any) {
        console.error(err);
        if (isMounted) {
          setError(
            err.message ||
              "Failed to fetch user data. Please check the username and try again."
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    runSearch();

    return () => {
      isMounted = false;
    };
  }, [username, year]);


  const handleReset = () => {
    setUserData(null);
    setError(null);
    setLoadingAvatar(undefined);
  };

  return (
    <MotionConfig reducedMotion={reduceMotion ? "always" : "user"}>
      <div
        className={`fixed inset-0 w-full h-full overflow-hidden ${themeStyles.bg} flex items-center justify-center`}
      >
        <AnimatePresence mode="wait">
           <motion.div
              key="story"
              className="w-full h-full md:max-w-[450px] md:h-[850px] md:max-h-[90vh] relative shadow-2xl md:rounded-[3rem] overflow-hidden"
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <SlugStoryPlayer
                data={userData}
                onExit={handleReset}
                drupalUserData={slugUserData}
              />
            </motion.div>
        </AnimatePresence>
      </div>
    </MotionConfig>
  );
};

export default SlugUserExperience;
