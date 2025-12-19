import React from 'react';
import { motion } from 'framer-motion';
import { UserYearData } from '../../types';
import CountUp from '../ui/CountUp';
import Confetti from '../ui/Confetti';
import { fadeInUp } from '../../utils/animations';
import { ArrowDown } from 'lucide-react';

interface HeroProps {
  data: UserYearData;
  themeStyles: any;
  onExplore: () => void;
}

const Hero: React.FC<HeroProps> = ({ data, themeStyles, onExplore }) => {
  return (
    <section className={`relative min-h-[90vh] flex flex-col items-center justify-center p-6 overflow-hidden ${themeStyles.bg} transition-colors duration-500`}>
      <Confetti active={true} />
      
      <div className="relative z-10 max-w-4xl w-full text-center">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
        >
          <span className={`inline-block py-1 px-3 rounded-full text-sm font-semibold tracking-wider mb-6 ${themeStyles.highlight}`}>
            2025 WRAPPED
          </span>
          
          <h1 className={`display-font text-5xl md:text-7xl lg:text-9xl font-bold mb-4 ${themeStyles.text}`}>
            Your 2025 <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
              Issue Highlights
            </span>
          </h1>

          <p className={`text-xl md:text-2xl ${themeStyles.textMuted} max-w-2xl mx-auto mb-12`}>
            You contributed to <CountUp end={data.uniqueIssuesCount} className={`font-bold ${themeStyles.accent}`} /> issues this year.
            <br className="hidden md:block" />
            That’s a lot of code shipped! Here’s the good stuff.
          </p>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onExplore}
            className={`px-8 py-4 rounded-full text-lg font-bold shadow-lg transition-all flex items-center gap-2 mx-auto ${themeStyles.button}`}
            aria-label="Scroll to highlights"
          >
            See my highlights <ArrowDown className="w-5 h-5 animate-bounce" />
          </motion.button>
        </motion.div>
      </div>

      {/* Decorative background blobs */}
      <div className="absolute top-1/4 left-10 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl animate-float -z-0" />
      <div className="absolute bottom-1/4 right-10 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl animate-float -z-0" style={{ animationDelay: '1s' }} />
    </section>
  );
};

export default Hero;