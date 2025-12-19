import React from 'react';
import { motion } from 'framer-motion';
import { UserYearData } from '../../types';
import { fadeInUp, scaleIn } from '../../utils/animations';
import { Trophy, Activity, GitCommit } from 'lucide-react';

interface TopProjectProps {
  data: UserYearData;
  themeStyles: any;
}

const TopProject: React.FC<TopProjectProps> = ({ data, themeStyles }) => {
  const { topProject } = data;

  return (
    <section className={`py-20 px-4 md:px-8 ${themeStyles.bg} transition-colors duration-500`}>
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeInUp}
          className="mb-12"
        >
          <h2 className={`display-font text-3xl md:text-5xl font-bold mb-4 ${themeStyles.text}`}>
            Your MVP Project
          </h2>
          <p className={`text-lg ${themeStyles.textMuted}`}>
            Where you spent the most energy making an impact.
          </p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={scaleIn}
          className={`relative overflow-hidden rounded-3xl border shadow-2xl ${themeStyles.card} ${themeStyles.border}`}
        >
          <div className="grid grid-cols-1 md:grid-cols-2">
            {/* Visual Side */}
            <div className="p-10 flex flex-col items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600 text-white relative overflow-hidden">
               <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
               <div className="text-8xl mb-4 animate-bounce" role="img" aria-label="Project Icon">
                 {topProject.icon}
               </div>
               <h3 className="text-4xl font-bold text-center z-10">{topProject.name}</h3>
               <div className="mt-6 flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-2 rounded-full">
                 <Trophy className="w-5 h-5 text-yellow-300" />
                 <span className="font-semibold">#1 Project</span>
               </div>
            </div>

            {/* Data Side */}
            <div className={`p-10 flex flex-col justify-center ${themeStyles.card}`}>
              <div className="mb-8">
                <div className={`text-sm font-bold uppercase tracking-widest mb-2 ${themeStyles.accent}`}>
                  The Metric
                </div>
                <div className={`text-5xl font-bold mb-2 ${themeStyles.text}`}>
                  {topProject.percentage}%
                </div>
                <p className={`${themeStyles.textMuted}`}>
                  of your total issues were created here.
                </p>
              </div>

              <div className="space-y-6">
                <div className={`p-4 rounded-xl border ${themeStyles.border} bg-opacity-50 flex items-start gap-4`}>
                  <div className={`p-2 rounded-lg ${themeStyles.highlight}`}>
                    <Activity className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className={`font-bold ${themeStyles.text}`}>Most Active</h4>
                    <p className={`text-sm ${themeStyles.textMuted}`}>{topProject.description}</p>
                  </div>
                </div>

                <div className={`p-4 rounded-xl border ${themeStyles.border} bg-opacity-50 flex items-start gap-4`}>
                  <div className={`p-2 rounded-lg ${themeStyles.highlight}`}>
                    <GitCommit className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className={`font-bold ${themeStyles.text}`}>Total Contributions</h4>
                    <p className={`text-sm ${themeStyles.textMuted}`}>{topProject.totalIssues} Issues opened in 2025</p>
                  </div>
                </div>
              </div>

              <button className={`mt-8 w-full py-3 rounded-xl font-bold transition-transform active:scale-95 ${themeStyles.button}`}>
                Drill into Project
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default TopProject;