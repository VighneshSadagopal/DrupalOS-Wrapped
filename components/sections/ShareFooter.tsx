import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { UserYearData, ThemeContextType } from '../../types';
import { Copy, Check, Moon, Sun, Monitor } from 'lucide-react';
import { fadeInUp } from '../../utils/animations';

interface ShareFooterProps {
  data: UserYearData;
  themeContext: ThemeContextType;
  themeStyles: any;
}

const ShareFooter: React.FC<ShareFooterProps> = ({ data, themeContext, themeStyles }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const text = `I contributed to ${data.uniqueIssuesCount} issues in 2025! 🚀\nMy top project was ${data.topProject.name}.\nCheck out your year in review.`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.footer 
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      variants={fadeInUp}
      className={`py-20 px-6 border-t ${themeStyles.bg} ${themeStyles.border} transition-colors duration-500`}
    >
      <div className="max-w-4xl mx-auto text-center">
        <h2 className={`display-font text-4xl font-bold mb-6 ${themeStyles.text}`}>
          Share your 2025 highlights
        </h2>
        
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-16">
           <button
             onClick={handleCopy}
             className={`flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-bold text-lg min-w-[200px] transition-transform active:scale-95 ${themeStyles.button}`}
           >
             {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
             {copied ? "Copied!" : "Copy Text"}
           </button>
           
           {/* Placeholder for Image Generation - in a real app, this would use html2canvas */}
           <button 
             className={`px-8 py-4 rounded-xl font-bold text-lg border-2 opacity-50 cursor-not-allowed ${themeStyles.border} ${themeStyles.text}`}
             title="Image generation requires backend processing in this demo"
             disabled
           >
             Download Image
           </button>
        </div>

        <div className={`p-8 rounded-3xl ${themeStyles.card} max-w-lg mx-auto`}>
          <h3 className={`text-sm font-bold uppercase tracking-wider mb-6 ${themeStyles.textMuted}`}>
            Experience Settings
          </h3>
          
          <div className="flex justify-center items-center gap-6">
            <button
              onClick={themeContext.toggleTheme}
              className={`p-4 rounded-full transition-colors ${themeStyles.bg} hover:brightness-110`}
              aria-label="Toggle theme"
            >
              {themeContext.theme === 'bright' ? (
                <Sun className={`w-6 h-6 ${themeStyles.text}`} />
              ) : (
                <Moon className={`w-6 h-6 ${themeStyles.text}`} />
              )}
            </button>
            
            <button
              onClick={themeContext.toggleReduceMotion}
              className={`p-4 rounded-full transition-colors ${themeStyles.bg} hover:brightness-110`}
              aria-label="Toggle reduced motion"
              title={themeContext.reduceMotion ? "Enable animations" : "Reduce motion"}
            >
              <Monitor className={`w-6 h-6 ${themeContext.reduceMotion ? 'text-green-500' : themeStyles.text}`} />
            </button>
          </div>
          <p className={`mt-4 text-xs ${themeStyles.textMuted}`}>
            {themeContext.reduceMotion ? "Animations disabled" : "Animations enabled"} • {themeContext.theme === 'bright' ? "Bright Mode" : "Muted Mode"}
          </p>
        </div>
        
        <div className={`mt-12 text-sm ${themeStyles.textMuted}`}>
          © 2025 Year in Review. Built with React & Tailwind.
        </div>
      </div>
    </motion.footer>
  );
};

export default ShareFooter;