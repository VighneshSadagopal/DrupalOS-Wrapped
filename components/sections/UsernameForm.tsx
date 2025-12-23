import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Loader2, AlertCircle, PlayCircle } from 'lucide-react';
import Confetti from '../ui/Confetti';
import TicTacToe from '../ui/TicTacToe';
import { fadeInUp } from '../../utils/animations';
import Link from 'next/link';

interface UsernameFormProps {
  onSearch: (username: string) => Promise<void>;
  onDemo: () => void;
  loading: boolean;
  error: string | null;
  themeStyles: any;
  userAvatarUrl?: string;
}

const UsernameForm: React.FC<UsernameFormProps> = ({ onSearch, onDemo, loading, error, themeStyles, userAvatarUrl }) => {
  const [username, setUsername] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim()) {
      onSearch(username.trim());
    }
  };

  return (
    <div className={`min-h-dvh flex flex-col items-center justify-center p-6 ${themeStyles.bg}`}>
      <Confetti active={false} />
      
      <motion.div 
        initial="hidden"
        animate="visible"
        variants={fadeInUp}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-10">
          <div className="inline-block p-4 rounded-full bg-blue-500/10 mb-6">
            <span className="text-4xl">💧</span>
          </div>
          <h1 className={`display-font text-4xl font-bold mb-4 ${themeStyles.text}`}>
            Drupal Year in Review
          </h1>
          <p className={`text-lg ${themeStyles.textMuted}`}>
            Enter your Drupal.org username to generate your 2025 highlights.
          </p>
        </div>

        <div className={`p-8 rounded-3xl shadow-xl border ${themeStyles.card} ${themeStyles.border} transition-all duration-300 min-h-[420px] flex flex-col justify-center`}>
          {!loading ? (
            <>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="username" className={`block text-sm font-medium mb-2 ${themeStyles.text}`}>
                    Username
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      id="username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="e.g. Dries"
                      className={`w-full px-4 py-4 rounded-xl border outline-none transition-all focus:ring-2 focus:ring-blue-500 ${themeStyles.bg} ${themeStyles.border} ${themeStyles.text}`}
                      disabled={loading}
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                      <Search className="w-5 h-5" />
                    </div>
                  </div>
                </div>

                {error && (
                  <div className="flex items-center gap-2 text-red-500 text-sm bg-red-50 p-3 rounded-lg border border-red-100">
                    <AlertCircle className="w-4 h-4" />
                    <span>{error}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || !username}
                  className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg flex items-center justify-center gap-2 transition-transform active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed ${themeStyles.button}`}
                >
                  Generate Highlights
                </button>
              </form>
              
              <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-800 text-center">
                {/* <button 
                  onClick={onDemo}
                  className={`flex items-center justify-center gap-2 mx-auto text-sm font-medium hover:underline ${themeStyles.textMuted}`}
                >
                  <PlayCircle className="w-4 h-4" />
                  No account? Try Demo Mode
                </button> */}
                <div className='font-medium text-sm text-stone-400 py-2'>Powered by <Link href={"https://qed42.com"} target="_blank" className="underline">QED42</Link></div>
                <p className={`text-xs ${themeStyles.textMuted} mt-2 max-w-xs mx-auto`}>
                  Disclaimer: The data is sourced from the Drupal.org APIs and publicly available Drupal profile information.
                </p>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="flex items-center gap-3 text-lg font-medium animate-pulse text-blue-500 mb-2">
                 <Loader2 className="w-6 h-6 animate-spin" />
                 <span>Analyzing 2025 Data...</span>
              </div>
              <p className={`text-sm ${themeStyles.textMuted} max-w-[280px]`}>
                 We're digging through your contributions. Play a quick game while you wait!
              </p>
              <TicTacToe themeStyles={themeStyles} userAvatarUrl={userAvatarUrl} />
            </div>
          )}
        </div>
      </motion.div>

      {/* Decorative blobs */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-0">
         <div className="absolute top-1/4 -left-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-float" />
         <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
      </div>
    </div>
  );
};

export default UsernameForm;
