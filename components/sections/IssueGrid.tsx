import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserYearData, Issue } from '../../types';
import { staggerContainer, fadeInUp } from '../../utils/animations';
import { GitPullRequest, CircleDot, MessageSquare, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';

interface IssueGridProps {
  data: UserYearData;
  themeStyles: any;
}

const IssueGrid: React.FC<IssueGridProps> = ({ data, themeStyles }) => {
  const [filter, setFilter] = useState<'all' | 'open' | 'closed'>('all');
  const [isOpen, setIsOpen] = useState(false);

  const filteredIssues = data.issues.filter(issue => {
    if (filter === 'all') return true;
    return issue.status === filter;
  });

  return (
    <section className={`py-20 px-4 md:px-8 ${themeStyles.bg} transition-colors duration-500`}>
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
          <div>
            <h2 className={`display-font text-3xl md:text-5xl font-bold mb-2 ${themeStyles.text}`}>
              The Details
            </h2>
            <p className={themeStyles.textMuted}>A breakdown of your contributions.</p>
          </div>
          
          <div className={`inline-flex rounded-lg p-1 border ${themeStyles.border} ${themeStyles.card}`}>
            {(['all', 'open', 'closed'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors capitalize ${
                  filter === f 
                    ? `bg-gray-200 dark:bg-stone-700 ${themeStyles.text}` 
                    : `${themeStyles.textMuted} hover:${themeStyles.text}`
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className={`rounded-2xl border ${themeStyles.border} overflow-hidden shadow-sm`}>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={`w-full flex items-center justify-between p-6 ${themeStyles.card} hover:brightness-95 transition-all text-left outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500`}
            aria-expanded={isOpen}
          >
            <div className="flex items-center gap-3">
               <span className={`font-bold text-lg ${themeStyles.text}`}>
                 Issue List ({filteredIssues.length})
               </span>
               <span className={`text-sm ${themeStyles.textMuted}`}>
                 {isOpen ? 'Click to collapse' : 'Click to expand'}
               </span>
            </div>
            {isOpen ? (
              <ChevronUp className={`w-6 h-6 ${themeStyles.text}`} />
            ) : (
              <ChevronDown className={`w-6 h-6 ${themeStyles.text}`} />
            )}
          </button>

          <AnimatePresence initial={false}>
            {isOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 500, opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className={`border-t ${themeStyles.border} ${themeStyles.bg}`}
              >
                <div className="h-full overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
                  {filteredIssues.length > 0 ? (
                    <motion.div 
                      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                      variants={staggerContainer}
                      initial="hidden"
                      animate="visible"
                    >
                      {filteredIssues.map((issue) => (
                        <motion.a
                          href={issue.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          key={issue.id}
                          layout
                          variants={fadeInUp}
                          className={`group p-6 rounded-2xl border flex flex-col justify-between h-full hover:shadow-lg transition-all duration-300 ${themeStyles.card} ${themeStyles.border} hover:-translate-y-1`}
                        >
                          <div>
                            <div className="flex justify-between items-start mb-4">
                              <span className={`text-xs font-mono px-2 py-1 rounded bg-opacity-20 ${themeStyles.highlight}`}>
                                {issue.project}
                              </span>
                              <div className="flex items-center gap-2">
                                <ExternalLink className={`w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity ${themeStyles.textMuted}`} />
                                {issue.status === 'open' ? (
                                  <CircleDot className="w-5 h-5 text-green-500" />
                                ) : (
                                  <GitPullRequest className="w-5 h-5 text-purple-500" />
                                )}
                              </div>
                            </div>
                            <h3 className={`text-xl font-bold mb-2 leading-tight group-hover:underline decoration-2 underline-offset-2 ${themeStyles.text}`}>
                              {issue.title}
                            </h3>
                            <div className="flex flex-wrap gap-2 mb-4">
                              {issue.labels.map(label => (
                                <span key={label} className={`text-xs px-2 py-1 rounded-full border ${themeStyles.border} ${themeStyles.textMuted}`}>
                                  #{label}
                                </span>
                              ))}
                            </div>
                          </div>
                          
                          <div className={`flex items-center justify-between pt-4 border-t ${themeStyles.border} mt-4`}>
                            <span className={`text-xs ${themeStyles.textMuted}`}>{issue.createdAt}</span>
                            <div className={`flex items-center gap-1 text-xs ${themeStyles.textMuted}`}>
                              <MessageSquare className="w-3 h-3" />
                              {issue.comments}
                            </div>
                          </div>
                        </motion.a>
                      ))}
                    </motion.div>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center">
                      <p className={`text-lg ${themeStyles.textMuted}`}>No issues found for this filter.</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
};

export default IssueGrid;