import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UserYearData } from "../types";
import StarField from "./ui/StarField";
import {
  X,
  Globe,
  GraduationCap,
  Mic,
  Sparkles,
  GitCommit,
  Pause,
  Play,
  Linkedin,
  Twitter,
  Loader2,
  Shield,
  Calendar,
  Users,
  Award,
  Plus,
} from "lucide-react";
import { collectAndStoreDrupalUserData } from "../utils/drupal-api";
import html2canvas from "html2canvas";

interface StoryPlayerProps {
  data: UserYearData;
  onExit: () => void;
}

// Neon Drop Icon
const DrupalDrop = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 2.5C12 2.5 5 10.5 5 15C5 19 8 22 12 22C16 22 19 19 19 15C19 10.5 12 2.5 12 2.5Z" />
  </svg>
);

const StoryPlayer: React.FC<StoryPlayerProps> = ({
  data,
  drupalUserData,
  onExit,
}) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isAnimatingEntry, setIsAnimatingEntry] = useState(true);
  const [isSharing, setIsSharing] = useState<null | "linkedin" | "x">(null);
  const [roles, setRoles] = useState<string[]>(data.contributorRoles || []);

  console.log(`drupalUserData`, drupalUserData);

  // Image Error Handling State
  const fallbackAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(
    data.userName
  )}&background=000&color=0ea5e9&size=128`;
  const [avatarSrc, setAvatarSrc] = useState<string>(
    data.avatarUrl || fallbackAvatar
  );

  const storyRef = useRef<HTMLDivElement>(null);

  // Define SLIDE_IDS to avoid circular dependency between slides configuration and handlers/effects
  const SLIDE_IDS = [
    "intro",
    "impact-summary",
    // "ai-leadership",
    // "summary",
  ];

  // Handle Async Data Collection Side Effect
  useEffect(() => {
    const enrichData = async () => {
      try {
        console.log("Enriching data for:", data.userName);
        const result = await collectAndStoreDrupalUserData(data.userName, 12);
        // Update roles if found in scraped data
        if (
          result &&
          result.contributor_roles &&
          Array.isArray(result.contributor_roles) &&
          result.contributor_roles.length > 0
        ) {
          setRoles(result.contributor_roles);
        }
      } catch (e) {
        console.error("Background data enrichment failed:", e);
      }
    };
    enrichData();
  }, [data.userName]);

  // Navigation handlers
  const nextSlide = () => {
    if (currentSlide < SLIDE_IDS.length - 1) {
      setCurrentSlide((prev) => prev + 1);
    } else {
      // If we are on the last slide (Summary), don't exit automatically on click, let them use the X button
      if (SLIDE_IDS[currentSlide] !== "summary") {
        onExit();
      }
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide((prev) => prev - 1);
    }
  };

  const togglePlayPause = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsPlaying(!isPlaying);
  };

  // Share Handler
  const handleShare = async (
    e: React.MouseEvent,
    platform: "linkedin" | "x"
  ) => {
    e.stopPropagation();
    if (!storyRef.current || isSharing) return;

    setIsSharing(platform);

    try {
      // 1. Capture Screenshot
      const canvas = await html2canvas(storyRef.current, {
        useCORS: true,
        allowTaint: true,
        scale: 2, // Retina quality
        backgroundColor: "#000000", // Ensure dark background
        ignoreElements: (element) => element.classList.contains("no-capture"),
        logging: false,
        onclone: (clonedDoc) => {
          // Fix for "bg-clip-text" rendering as a colored block in html2canvas
          // We find all elements using bg-clip-text and replace them with solid colors
          const gradientTexts = clonedDoc.querySelectorAll(
            ".bg-clip-text"
          ) as NodeListOf<HTMLElement>;
          gradientTexts.forEach((el) => {
            el.style.backgroundImage = "none";
            el.style.background = "none";
            el.style.webkitTextFillColor = "initial";
            el.style.color = "#ffffff"; // Default fallback

            // Try to match color from Tailwind classes
            if (el.className.includes("from-orange"))
              el.style.color = "#fb923c";
            else if (el.className.includes("from-blue"))
              el.style.color = "#60a5fa";
            else if (el.className.includes("from-purple"))
              el.style.color = "#a855f7";
            else if (el.className.includes("from-green"))
              el.style.color = "#4ade80";
            else if (el.className.includes("from-cyan"))
              el.style.color = "#22d3ee";
            else if (el.className.includes("from-indigo"))
              el.style.color = "#818cf8";
          });

          // Explicitly hide no-capture elements (double safety)
          const ignored = clonedDoc.querySelectorAll(
            ".no-capture"
          ) as NodeListOf<HTMLElement>;
          ignored.forEach((el) => (el.style.display = "none"));
        },
      });

      // 2. Trigger Download
      const image = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = image;
      link.download = `drupal-2025-highlight-${data.userName}-${SLIDE_IDS[currentSlide]}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // 3. Open Social Media
      const text = `Check out my Drupal 2025 Year in Review! 💧✨ #Drupal #OpenSource #Drupal2025`;
      let shareUrl = "";

      if (platform === "linkedin") {
        // LinkedIn feed share
        shareUrl = `https://www.linkedin.com/feed/?shareActive=true&text=${encodeURIComponent(
          text
        )}`;
      } else {
        // X / Twitter share
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
          text
        )}`;
      }

      window.open(shareUrl, "_blank");
    } catch (err) {
      console.error("Sharing failed:", err);
    } finally {
      setIsSharing(null);
    }
  };

  // Auto-scroll Logic
  useEffect(() => {
    // Don't auto-scroll the intro slide (Slide 0) or the Summary slide (last slide)
    const isLastSlide = currentSlide === SLIDE_IDS.length - 1;
    if (currentSlide === 0 || isLastSlide || !isPlaying) return;

    const SLIDE_DURATION = 6000; // 6 seconds per slide

    const timer = setTimeout(() => {
      nextSlide();
    }, SLIDE_DURATION);

    return () => clearTimeout(timer);
  }, [currentSlide, isPlaying]);

  // Common Background Elements
  const SlideBackground = () => (
    <>
      {/* Starburst Background Effect */}
      <motion.div
        className="absolute inset-0 z-0 pointer-events-none opacity-20"
        style={{
          background:
            "repeating-conic-gradient(from 0deg at 50% 50%, #333 0deg 2deg, transparent 2deg 15deg)",
        }}
        animate={{ rotate: 360 }}
        transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
      />
      {/* Vignette Overlay */}
      <div className="absolute inset-0 z-0 bg-radial-gradient from-transparent via-black/60 to-black/90 pointer-events-none" />
    </>
  );

  // Common Header Component
  const SlideHeader = ({
    title,
    progressIndex,
  }: {
    title: string | React.ReactNode;
    progressIndex: number;
  }) => (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="w-full pt-8 flex flex-col items-center"
    >
      {/* Top Progress Bar */}
      <div className="w-full flex gap-2 z-20 mb-6">
        {Array.from({ length: SLIDE_IDS.length }).map((_, i) => (
          <div
            key={i}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i === progressIndex
                ? "flex-1 bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                : "w-2 bg-white/20"
            }`}
          />
        ))}
      </div>

      <div className="text-gray-400 font-mono text-xs tracking-widest uppercase mb-2 flex flex-col items-center">
        <span>{title}</span>
        {/* Connecting String */}
        <div className="w-px h-8 bg-gradient-to-b from-gray-600 to-transparent mt-2"></div>
      </div>
    </motion.div>
  );

  const slides = [
    // SLIDE 0: INTRO
    {
      id: "intro",
      render: () => (
        <div className="flex flex-col items-center justify-center h-full text-center p-8 relative z-10">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-cyan-500 blur-xl opacity-50 animate-pulse"></div>
            <div className="w-32 h-32 rounded-full border-4 border-cyan-400 mb-8 overflow-hidden relative z-10 bg-black">
              <img
                src={avatarSrc}
                onError={() => setAvatarSrc(fallbackAvatar)}
                className="w-full h-full object-cover"
                alt="Avatar"
              />
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-8 space-y-2"
          >
            <div className="text-cyan-400 font-mono text-sm tracking-[0.2em] uppercase">
              System Access Granted
            </div>
            <h1 className="text-5xl font-bold text-white font-display tracking-tight">
              {data.userName}
            </h1>
            <div className="h-1 w-20 bg-gradient-to-r from-transparent via-cyan-500 to-transparent mx-auto mt-4"></div>
          </motion.div>

          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            onClick={(e) => {
              e.stopPropagation();
              nextSlide();
            }}
            className="mt-12 px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-full text-sm font-semibold tracking-wider transition-all backdrop-blur-sm"
          >
            START SEQUENCE
          </motion.button>
        </div>
      ),
    },
    // SLIDE 1: IMPACT SUMMARY (MEMBER SINCE)
    {
      id: "impact-summary",
      render: () => {
        return (
          <div className="flex flex-col items-center h-full w-full relative z-10 overflow-hidden bg-[#0a0a0a]">
            <SlideBackground />
            <div className="relative z-10 flex flex-col items-center justify-between h-full w-full py-8 px-6">
              <SlideHeader title={`@${data.userName}`} progressIndex={1} />

              <div className="flex flex-col items-center text-center gap-8 flex-1 justify-center -mt-10">
                <motion.h2
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4, duration: 0.5 }}
                  className="text-2xl md:text-3xl font-bold text-white font-display leading-tight max-w-[280px]"
                >
                  YOU DIDN&apos;T JUST USE DRUPAL.
                  <br />
                  YOU SHAPED IT
                </motion.h2>

                <motion.div
                  initial={{ scale: 0, rotate: -45 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{
                    delay: 0.6,
                    type: "spring",
                    stiffness: 200,
                    damping: 15,
                  }}
                  className="relative"
                >
                  <div className="w-24 h-24 rounded-full border-2 border-white/30 flex items-center justify-center bg-white/5 backdrop-blur-md z-10 relative">
                    <Globe className="w-10 h-10 text-white" />
                  </div>
                  <motion.div
                    animate={{
                      scale: [1.2, 1.3, 1.2],
                      opacity: [0.5, 0.2, 0.5],
                    }}
                    transition={{ duration: 4, repeat: Infinity }}
                    className="absolute inset-0 rounded-full border border-white/10 scale-125"
                  />
                  <div className="absolute inset-0 rounded-full border border-white/5 scale-150"></div>
                </motion.div>

                <div className="space-y-2">
                  <motion.h3
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                    className="text-4xl md:text-5xl font-extrabold text-white font-display tracking-tight uppercase"
                  >
                    MEMBER SINCE {drupalUserData.account_created_year}
                  </motion.h3>
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                    className="text-gray-300 text-lg font-medium"
                  >
                    That&apos;s{" "}
                    <span className="text-green-400 font-bold">
                      {drupalUserData.member_since}
                    </span>{" "}
                    of
                    <br />
                    showing up for open source.
                  </motion.p>
                </div>
              </div>

              <div className="absolute bottom-0 left-0 w-full h-1/3 bg-gradient-to-t from-blue-900/90 via-blue-900/30 to-transparent pointer-events-none z-0" />
            </div>
          </div>
        );
      },
    },
  ];

  // SLIDE 2: MULTIPLIER (MENTORSHIP)
  if (drupalUserData.mentee_count > 0) {
    slides.push({
      id: "multiplier",
      render: () => {
        return (
          <div className="flex flex-col items-center h-full w-full relative z-10 overflow-hidden bg-[#0a0a0a]">
            <SlideBackground />
            <div className="relative z-10 flex flex-col items-center justify-between h-full w-full py-8 px-6">
              <SlideHeader title="YOU’RE A MULTIPLIER" progressIndex={2} />

              <div className="flex flex-col items-center text-center gap-8 flex-1 justify-center -mt-16">
                <motion.h2
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 }}
                  className="text-xl md:text-2xl font-bold text-white font-display tracking-widest uppercase hidden"
                >
                  YOU’RE A MULTIPLIER
                </motion.h2>

                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{
                    delay: 0.5,
                    type: "spring",
                    stiffness: 200,
                    damping: 15,
                  }}
                  className="relative"
                >
                  <div className="w-24 h-24 rounded-full border border-white/80 flex items-center justify-center bg-black/40 backdrop-blur-md z-10 relative">
                    <GraduationCap className="w-10 h-10 text-white stroke-1" />
                  </div>
                  <motion.div
                    animate={{ opacity: [0.3, 0.6, 0.3] }}
                    transition={{ duration: 3, repeat: Infinity }}
                    className="absolute inset-0 rounded-full border border-white/20 scale-125"
                  />
                </motion.div>

                <div className="space-y-4 max-w-xs">
                  <motion.h3
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                    className="text-3xl md:text-4xl font-extrabold text-white font-display leading-tight uppercase"
                  >
                    MENTOR TO{" "}
                    <span className="text-green-500">
                      {drupalUserData.mentee_count}
                    </span>
                    <br />
                    CONTRIBUTORS ON DRUPAL.ORG.
                  </motion.h3>
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.9 }}
                    className="text-gray-200 text-base font-medium"
                  >
                    Your knowledge didn’t <br />
                    stop with you
                  </motion.p>
                </div>
              </div>

              <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-blue-600/60 via-blue-900/20 to-transparent pointer-events-none z-0" />
            </div>
          </div>
        );
      },
    });
    SLIDE_IDS.push("multiplier");
  }

  // SLIDE 3: EVENTS (TOOK THE STAGE)
  if (
    drupalUserData.events_2025.spokenAt.length > 0 ||
    drupalUserData.events_2025.attended.length > 0 ||
    drupalUserData.events_2025.organized.length > 0
  ) {
    slides.push({
      id: "events",
      render: () => {
        const events = drupalUserData.events_2025;
        const speakerEvents = events.spokenAt.map((event) => {
          return { title: event, type: "speaking" };
        });

        const organizedEvents = events.organized.map((event) => {
          return { title: event, type: "organized" };
        });

        const attendingEvents = events.attended.map((event) => {
          return { title: event, type: "attending" };
        });

        const finalEvents = organizedEvents.concat(
          speakerEvents,
          attendingEvents
        );

        // Limit to 3 displayed events
        const MAX_EVENTS = 3;
        const displayEvents = finalEvents.slice(0, MAX_EVENTS);
        const remainingCount = finalEvents.length - MAX_EVENTS;

        return (
          <div className="flex flex-col items-center h-full w-full relative z-10 overflow-hidden bg-[#0a0a0a]">
            <SlideBackground />
            <div className="relative z-10 flex flex-col items-center justify-between h-full w-full py-8 px-6">
              <SlideHeader title="ON STAGE & BEHIND SCENES" progressIndex={3} />

              <div className="flex flex-col items-center w-full max-w-md flex-1 mt-4">
                <motion.h3
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-2xl font-extrabold text-white font-display text-center mb-6 uppercase leading-tight"
                >
                  You showed up <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                    In Real Life
                  </span>
                </motion.h3>

                <motion.div
                  className="w-full flex flex-col gap-3 px-2 pb-20"
                  initial="hidden"
                  animate="visible"
                  variants={{
                    visible: { transition: { staggerChildren: 0.15 } },
                  }}
                >
                  {displayEvents.map((evt: any, i) => (
                    <motion.div
                      key={i}
                      variants={{
                        hidden: { opacity: 0, x: -20, rotate: -2 },
                        visible: { opacity: 1, x: 0, rotate: 0 },
                      }}
                      className="relative group"
                    >
                      <div className="relative overflow-hidden bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-0 flex flex-col clip-ticket shadow-lg transition-transform hover:scale-[1.02]">
                        {/* Color bar on left based on type */}
                        <div
                          className={`absolute top-0 bottom-0 left-0 w-2 ${
                            evt.type === "speaking"
                              ? "bg-purple-500"
                              : "bg-blue-500"
                          }`}
                        />

                        <div className="pl-6 pr-4 py-3 flex items-center justify-between gap-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              {evt.type === "speaking" ? (
                                <div className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/20 text-purple-200 border border-purple-500/30 uppercase tracking-wider flex items-center gap-1">
                                  <Mic className="w-3 h-3" /> Speaker
                                </div>
                              ) : (
                                <div className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-200 border border-blue-500/30 uppercase tracking-wider flex items-center gap-1">
                                  <Users className="w-3 h-3" /> Volunteer
                                </div>
                              )}
                              <span className="text-[10px] text-gray-400 uppercase tracking-widest">
                                {"2025"}
                              </span>
                            </div>
                            <h4 className="text-base font-bold text-white leading-tight line-clamp-1">
                              {evt.title}
                            </h4>
                          </div>

                          <div className="opacity-20">
                            {evt.type === "speaking" ? (
                              <Mic className="w-6 h-6" />
                            ) : (
                              <Calendar className="w-6 h-6" />
                            )}
                          </div>
                        </div>

                        {/* Dashed Separator */}
                        <div className="relative h-px w-full bg-transparent flex items-center justify-center my-1">
                          <div className="w-[90%] border-t border-dashed border-white/20"></div>
                        </div>

                        <div className="px-6 py-2 flex justify-between items-center text-[10px] text-gray-400 font-mono uppercase">
                          <span>ADMIT ONE</span>
                          <span>DRUPAL 2025</span>
                        </div>
                      </div>
                    </motion.div>
                  ))}

                  {/* Overflow Card */}
                  {remainingCount > 0 && (
                    <motion.div
                      variants={{
                        hidden: { opacity: 0, y: 20 },
                        visible: { opacity: 1, y: 0 },
                      }}
                      className="mt-2"
                    >
                      <div className="bg-white/5 border border-white/10 rounded-lg p-3 flex items-center justify-between backdrop-blur-sm">
                        <div className="flex items-center gap-3">
                          <div className="flex -space-x-2">
                            <div className="w-6 h-6 rounded-full bg-purple-500/50 border border-white/20 flex items-center justify-center text-[8px]">
                              +
                            </div>
                            <div className="w-6 h-6 rounded-full bg-blue-500/50 border border-white/20 flex items-center justify-center text-[8px]">
                              +
                            </div>
                          </div>
                          <span className="text-xs text-gray-300 font-medium">
                            + And more...
                          </span>
                        </div>
                        <span className="px-2 py-0.5 bg-white/10 rounded text-[10px] font-bold text-white">
                          {remainingCount} More
                        </span>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              </div>

              <div className="absolute bottom-0 left-0 w-full h-1/3 bg-gradient-to-t from-purple-900/60 via-blue-900/20 to-transparent pointer-events-none z-0" />
            </div>
          </div>
        );
      },
    });
    SLIDE_IDS.push("events");
  }

  // SLIDE 4: CONTRIBUTOR ROLES
  if (drupalUserData.contributor_roles.length > 0) {
    slides.push({
      id: "contributor-roles",
      render: () => {
        const roles = drupalUserData.contributor_roles;
        const displayRoles = roles.slice(0, 6);
        const remainingRoles = roles.length - displayRoles.length;
        return (
          <div className="flex flex-col items-center h-full w-full relative z-10 overflow-hidden bg-[#0a0a0a]">
            <SlideBackground />
            <div className="relative z-10 flex flex-col items-center justify-between h-full w-full py-8 px-6">
              <SlideHeader title="ROLES & RECOGNITION" progressIndex={4} />

              <div className="flex flex-col items-center text-center gap-6 flex-1 justify-center -mt-10 w-full max-w-lg">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{
                    delay: 0.4,
                    type: "spring",
                    stiffness: 200,
                    damping: 15,
                  }}
                  className="relative mb-2"
                >
                  <div className="w-20 h-20 rounded-full border border-white/80 flex items-center justify-center bg-black/40 backdrop-blur-md z-10 relative">
                    <Shield className="w-8 h-8 text-yellow-400 stroke-1" />
                  </div>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 20,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    className="absolute inset-0 rounded-full border border-dashed border-yellow-500/30 scale-125"
                  />
                </motion.div>

                <motion.h3
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="text-2xl md:text-3xl font-extrabold text-white font-display leading-tight uppercase mb-4"
                >
                  YOU WEAR MANY HATS
                </motion.h3>

                <motion.div
                  className={`${
                    displayRoles.length > 1 ? "grid grid-cols-2" : "grid"
                  } gap-3`}
                  initial="hidden"
                  animate="visible"
                  variants={{
                    hidden: { opacity: 0 },
                    visible: {
                      opacity: 1,
                      transition: { staggerChildren: 0.05, delayChildren: 0.7 },
                    },
                  }}
                >
                  {displayRoles.map((role, idx) => (
                    <motion.div
                      key={idx}
                      variants={{
                        hidden: { opacity: 0, y: 20, scale: 0.9 },
                        visible: { opacity: 1, y: 0, scale: 1 },
                      }}
                      className="bg-white/5 border border-white/10 rounded-lg p-3 text-left flex items-start gap-2 hover:bg-white/10 transition-colors"
                    >
                      <div className="mt-0.5">
                        <Award className="w-3.5 h-3.5 text-yellow-400" />
                      </div>
                      <span className="text-xs font-medium text-gray-200 leading-tight">
                        {role}
                      </span>
                    </motion.div>
                  ))}

                  {remainingRoles > 0 && (
                    <motion.div
                      variants={{
                        hidden: { opacity: 0, scale: 0.9 },
                        visible: { opacity: 1, scale: 1 },
                      }}
                      className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3 flex items-center justify-center gap-2 col-span-1"
                    >
                      <Plus className="w-4 h-4 text-yellow-400" />
                      <span className="text-xs font-bold text-yellow-200">
                        And {remainingRoles} more...
                      </span>
                    </motion.div>
                  )}
                </motion.div>
              </div>

              <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-yellow-900/40 via-yellow-900/10 to-transparent pointer-events-none z-0" />
            </div>
          </div>
        );
      },
    });
    SLIDE_IDS.push("contributor-roles")
  }

  // SLIDE 5: TOTAL CONTRIBUTIONS
  if (drupalUserData.total_issues_count > 0) {
    slides.push({
      id: "total-contributions",
      render: () => {
        return (
          <div className="flex flex-col items-center h-full w-full relative z-10 overflow-hidden bg-[#0a0a0a]">
            <SlideBackground />
            <div className="relative z-10 flex flex-col items-center justify-between h-full w-full py-8 px-6">
              <SlideHeader title="2025 IMPACT" progressIndex={5} />

              <div className="flex flex-col items-center text-center gap-6 flex-1 justify-center -mt-10">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{
                    delay: 0.4,
                    type: "spring",
                    stiffness: 200,
                    damping: 15,
                  }}
                  className="relative"
                >
                  <div className="w-24 h-24 rounded-full border border-white/80 flex items-center justify-center bg-black/40 backdrop-blur-md z-10 relative">
                    <GitCommit className="w-10 h-10 text-orange-400 stroke-1" />
                  </div>
                  <motion.div
                    animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                    transition={{ duration: 3, repeat: Infinity }}
                    className="absolute inset-0 rounded-full border border-orange-500/30 scale-125"
                  />
                </motion.div>

                {/* Count Animation */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5, type: "spring" }}
                  className="flex flex-col items-center"
                >
                  <span className="text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-br from-orange-300 via-red-300 to-white drop-shadow-[0_0_15px_rgba(251,146,60,0.5)]">
                    {drupalUserData.total_issues_count}
                  </span>
                  <span className="text-xs font-mono tracking-widest text-orange-200 uppercase mt-1">
                    Total Contributions
                  </span>
                </motion.div>

                <div className="space-y-4 max-w-xs">
                  <motion.h3
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="text-2xl md:text-3xl font-extrabold text-white font-display leading-tight uppercase"
                  >
                    YOU KEPT THE <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500">
                      MOMENTUM
                    </span>{" "}
                    ALIVE
                  </motion.h3>

                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className="text-gray-200 text-lg font-medium"
                  >
                    Every commit counts towards
                    <br /> the future.
                  </motion.p>
                </div>
              </div>

              <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-orange-900/60 via-red-900/20 to-transparent pointer-events-none z-0" />
            </div>
          </div>
        );
      },
    });
    SLIDE_IDS.push("total-contributions")
  }

  // SLIDE 6: DRUPAL CORE
  if (drupalUserData.total_issues_for_drupal_count > 0) {
    slides.push({
      id: "drupal-core",
      render: () => {
        return (
          <div className="flex flex-col items-center h-full w-full relative z-10 overflow-hidden bg-[#0a0a0a]">
            <SlideBackground />
            <div className="relative z-10 flex flex-col items-center justify-between h-full w-full py-8 px-6">
              <SlideHeader title="CORE CONTRIBUTOR" progressIndex={6} />

              <div className="flex flex-col items-center text-center gap-6 flex-1 justify-center -mt-10">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{
                    delay: 0.4,
                    type: "spring",
                    stiffness: 200,
                    damping: 15,
                  }}
                  className="relative"
                >
                  <div className="w-24 h-24 rounded-full border border-white/80 flex items-center justify-center bg-black/40 backdrop-blur-md z-10 relative">
                    <DrupalDrop className="w-10 h-10 text-[#0678BE] drop-shadow-[0_0_10px_rgba(6,120,190,0.8)]" />
                  </div>
                  <motion.div
                    animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                    transition={{ duration: 3, repeat: Infinity }}
                    className="absolute inset-0 rounded-full border border-blue-500/30 scale-125"
                  />
                </motion.div>

                {/* Count Animation */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5, type: "spring" }}
                  className="flex flex-col items-center"
                >
                  <span className="text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-b from-blue-300 to-blue-600 drop-shadow-[0_0_15px_rgba(37,99,235,0.5)]">
                    {drupalUserData.total_issues_for_drupal_count}
                  </span>
                  <span className="text-xs font-mono tracking-widest text-blue-200 uppercase mt-1">
                    Core Commits
                  </span>
                </motion.div>

                <div className="space-y-4 max-w-xs">
                  <motion.h3
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="text-2xl md:text-3xl font-extrabold text-white font-display leading-tight uppercase"
                  >
                    YOU BUILT THE <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">
                      FOUNDATION
                    </span>
                  </motion.h3>

                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className="text-gray-200 text-lg font-medium"
                  >
                    Powering the web, <br /> one commit at a time.
                  </motion.p>
                </div>
              </div>

              <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-blue-900/60 via-cyan-900/20 to-transparent pointer-events-none z-0" />
            </div>
          </div>
        );
      },
    });
    SLIDE_IDS.push("drupal-core")
  }

  // SLIDE 7: AI LEADERSHIP
  if (drupalUserData.total_issues_for_ai_count > 0) {
    slides.push({
      id: "ai-leadership",
      render: () => {
        const aiIssuesCount = drupalUserData.total_issues_for_ai_count;

        return (
          <div className="flex flex-col items-center h-full w-full relative z-10 overflow-hidden bg-[#0a0a0a]">
            <SlideBackground />
            <div className="relative z-10 flex flex-col items-center justify-between h-full w-full py-8 px-6">
              <SlideHeader title="YOU BROUGHT AI TO DRUPAL" progressIndex={7} />

              <div className="flex flex-col items-center text-center gap-6 flex-1 justify-center -mt-10">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{
                    delay: 0.4,
                    type: "spring",
                    stiffness: 200,
                    damping: 15,
                  }}
                  className="relative"
                >
                  <div className="w-24 h-24 rounded-full border border-white/80 flex items-center justify-center bg-black/40 backdrop-blur-md z-10 relative">
                    <Sparkles className="w-10 h-10 text-white stroke-1" />
                  </div>
                  <motion.div
                    animate={{ rotate: 180 }}
                    transition={{
                      duration: 10,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    className="absolute inset-0 rounded-full border-2 border-dashed border-white/20 scale-125"
                  />
                </motion.div>

                {/* New Count Animation */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5, type: "spring" }}
                  className="flex flex-col items-center"
                >
                  <span className="text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-br from-blue-300 via-purple-300 to-white drop-shadow-[0_0_15px_rgba(168,85,247,0.5)]">
                    {aiIssuesCount}
                  </span>
                  <span className="text-xs font-mono tracking-widest text-purple-200 uppercase mt-1">
                    AI Contributions
                  </span>
                </motion.div>

                <div className="space-y-4 max-w-xs">
                  <motion.h3
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="text-2xl md:text-3xl font-extrabold text-white font-display leading-tight uppercase"
                  >
                    YOU HELPED LEAD CONVERSATIONS ON <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                      AI + DRUPAL
                    </span>
                  </motion.h3>

                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className="text-gray-200 text-lg font-medium"
                  >
                    Bridging future tech <br /> with open source.
                  </motion.p>
                </div>
              </div>

              <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-blue-800/60 via-purple-900/20 to-transparent pointer-events-none z-0" />
            </div>
          </div>
        );
      },
    });
    SLIDE_IDS.push("ai-leadership")
  }

  // Laser Frame Variants based on slide
  const laserVariants = [
    // Intro: Circle
    {
      top: "30%",
      left: "50%",
      x: "-50%",
      y: "-50%",
      width: "160px",
      height: "160px",
      borderRadius: "50%",
      borderColor: "#22d3ee",
      rotate: 0,
      opacity: 1,
    },
    // Impact Summary: Large Circle/Lens
    {
      top: "50%",
      left: "50%",
      x: "-50%",
      y: "-50%",
      width: "95%",
      height: "95%",
      borderRadius: "30px",
      borderColor: "#3b82f6",
      rotate: 0,
      opacity: 0.5,
    },
    // Multiplier: Green/Blue mix or just Green (MOVED TO INDEX 2)
    {
      top: "50%",
      left: "50%",
      x: "-50%",
      y: "-50%",
      width: "95%",
      height: "95%",
      borderRadius: "30px",
      borderColor: "#4ade80",
      rotate: 0,
      opacity: 0.5,
    },
    // Events: Blue/Purple (MOVED TO INDEX 3)
    {
      top: "50%",
      left: "50%",
      x: "-50%",
      y: "-50%",
      width: "95%",
      height: "95%",
      borderRadius: "30px",
      borderColor: "#60a5fa",
      rotate: 0,
      opacity: 0.5,
    },
    // Contributor Roles: Gold/Yellow (NEW INDEX 4)
    {
      top: "50%",
      left: "50%",
      x: "-50%",
      y: "-50%",
      width: "95%",
      height: "95%",
      borderRadius: "30px",
      borderColor: "#facc15",
      rotate: 0,
      opacity: 0.5,
    },
    // Total Contributions: Orange/Red (MOVED TO INDEX 5)
    {
      top: "50%",
      left: "50%",
      x: "-50%",
      y: "-50%",
      width: "95%",
      height: "95%",
      borderRadius: "30px",
      borderColor: "#fb923c",
      rotate: 0,
      opacity: 0.5,
    },
    // Drupal Core: Deep Blue/Cyan (MOVED TO INDEX 6)
    {
      top: "50%",
      left: "50%",
      x: "-50%",
      y: "-50%",
      width: "95%",
      height: "95%",
      borderRadius: "30px",
      borderColor: "#0678BE",
      rotate: 0,
      opacity: 0.5,
    },
    // AI Leadership: Purple/Deep Blue (MOVED TO INDEX 7)
    {
      top: "50%",
      left: "50%",
      x: "-50%",
      y: "-50%",
      width: "95%",
      height: "95%",
      borderRadius: "30px",
      borderColor: "#a855f7",
      rotate: 0,
      opacity: 0.5,
    },
    // Summary: Full Screen Rainbow/White (NEW INDEX 8)
    {
      top: "50%",
      left: "50%",
      x: "-50%",
      y: "-50%",
      width: "98%",
      height: "98%",
      borderRadius: "20px",
      borderColor: "#ffffff",
      rotate: 0,
      opacity: 0.3,
    },
  ];

  // Entry Animation Timer
  useEffect(() => {
    setIsAnimatingEntry(true);
    const bufferTimer = setTimeout(() => {
      setIsAnimatingEntry(false);
    }, 1200);

    return () => clearTimeout(bufferTimer);
  }, []);

  return (
    <div
      ref={storyRef}
      onClick={nextSlide}
      className="w-full h-full relative overflow-hidden select-none bg-black text-white font-sans cursor-pointer"
    >
      {/* 1. Global Background: Warp Speed Starfield */}
      {/* Hide starfield on content slides as they have their own BG logic */}
      {currentSlide === 0 && <StarField />}

      {/* 2. Ambient Color Glows (Intro only now) */}
      {currentSlide === 0 && (
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-40 mix-blend-screen">
          <div
            className={`absolute top-[-20%] left-[-20%] bg-purple-900 w-[80%] h-[80%] rounded-full blur-[120px] animate-pulse`}
          />
          <div
            className={`absolute bottom-[-20%] right-[-20%] bg-cyan-900 w-[80%] h-[80%] rounded-full blur-[120px] animate-pulse`}
            style={{ animationDelay: "2s" }}
          />
        </div>
      )}

      {/* Header Controls (Hide on capture) */}
      <div className="absolute top-4 right-4 z-[60] flex items-center gap-3 no-capture">
        {/* Play/Pause Button */}
        <button
          onClick={togglePlayPause}
          className="p-2 text-white/70 hover:text-white bg-black/40 rounded-full backdrop-blur-md border border-white/10 transition-colors"
          title={isPlaying ? "Pause Autoscroll" : "Resume Autoscroll"}
        >
          {isPlaying ? (
            <Pause className="w-6 h-6" />
          ) : (
            <Play className="w-6 h-6" />
          )}
        </button>

        {/* Close Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onExit();
          }}
          className="p-2 text-white/70 hover:text-white bg-black/40 rounded-full backdrop-blur-md border border-white/10 transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Full Screen Pause Overlay */}
      <AnimatePresence>
        {!isPlaying && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-[70] flex flex-col items-center justify-center bg-black/80 backdrop-blur-md no-capture"
            onClick={(e) => {
              e.stopPropagation();
              setIsPlaying(true);
            }} // Clicking background resumes
          >
            <div
              className="flex flex-col items-center gap-6 p-8 w-full max-w-sm"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-3xl font-bold text-white tracking-widest uppercase mb-4">
                Paused
              </h2>

              <button
                onClick={(e) => handleShare(e, "linkedin")}
                disabled={isSharing !== null}
                className="w-full py-4 rounded-full bg-[#0077b5] hover:bg-[#006396] text-white font-bold text-lg flex items-center justify-center gap-3 transition-all transform hover:scale-105 active:scale-95 shadow-lg shadow-blue-900/50"
              >
                {isSharing === "linkedin" ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  <Linkedin className="w-6 h-6" />
                )}
                Share on LinkedIn
              </button>

              <button
                onClick={(e) => handleShare(e, "x")}
                disabled={isSharing !== null}
                className="w-full py-4 rounded-full bg-black border border-white/20 hover:bg-zinc-900 text-white font-bold text-lg flex items-center justify-center gap-3 transition-all transform hover:scale-105 active:scale-95 shadow-lg"
              >
                {isSharing === "x" ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  <Twitter className="w-6 h-6" />
                )}
                Share on X
              </button>

              <div className="w-16 h-1 bg-white/20 rounded-full my-4"></div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsPlaying(true);
                }}
                className="w-full py-4 rounded-full bg-white text-black font-bold text-lg flex items-center justify-center gap-3 transition-all transform hover:scale-105 active:scale-95"
              >
                <Play className="w-6 h-6 fill-current" />
                Resume Story
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation Areas (Invisible) for better UX */}
      <div
        className="absolute top-0 left-0 w-1/4 h-full z-20"
        onClick={(e) => {
          e.stopPropagation();
          prevSlide();
        }}
      ></div>
      <div
        className="absolute top-0 right-0 w-1/4 h-full z-20"
        onClick={(e) => {
          e.stopPropagation();
          nextSlide();
        }}
      ></div>

      {/* 4. The Neon Laser Frame */}
      <motion.div
        className="absolute border-2 z-0 pointer-events-none"
        style={{
          borderColor: laserVariants[currentSlide].borderColor,
          boxShadow: `0 0 20px ${laserVariants[currentSlide].borderColor}66, inset 0 0 20px ${laserVariants[currentSlide].borderColor}33`,
        }}
        initial={false}
        animate={laserVariants[currentSlide]}
        transition={{
          type: "spring",
          stiffness: 50,
          damping: 15,
          mass: 1.2,
        }}
      >
        <div
          className="absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2"
          style={{ borderColor: "white" }}
        />
        <div
          className="absolute -top-1 -right-1 w-3 h-3 border-t-2 border-r-2"
          style={{ borderColor: "white" }}
        />
        <div
          className="absolute -bottom-1 -left-1 w-3 h-3 border-b-2 border-l-2"
          style={{ borderColor: "white" }}
        />
        <div
          className="absolute -bottom-1 -right-1 w-3 h-3 border-b-2 border-r-2"
          style={{ borderColor: "white" }}
        />

        {currentSlide === 0 && (
          <motion.div
            className="absolute -top-6 -right-6 w-12 h-12 text-cyan-400 drop-shadow-[0_0_15px_rgba(34,211,238,1)] z-10"
            animate={{
              y: [0, -5, 0],
              rotate: [0, 5, -5, 0],
              scale: [1, 1.1, 1],
            }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          >
            <DrupalDrop className="w-full h-full fill-current" />
          </motion.div>
        )}
      </motion.div>

      {/* 5. Slide Content with Zoom Transition */}
      <div className="w-full h-full relative z-10 flex flex-col justify-center">
        <AnimatePresence mode="popLayout">
          <motion.div
            key={currentSlide}
            className="w-full h-full absolute top-0 left-0"
            initial={{ scale: 0.5, opacity: 0, filter: "blur(20px)" }}
            animate={{ scale: 1, opacity: 1, filter: "blur(0px)" }}
            exit={{ scale: 1.5, opacity: 0, filter: "blur(10px)" }}
            transition={{
              duration: 0.6,
              ease: [0.16, 1, 0.3, 1],
            }}
          >
            {currentSlide <= slides.length - 1 && (
              slides[currentSlide].render()
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default StoryPlayer;
