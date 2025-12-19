import React from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { UserYearData } from '../../types';
import { fadeInUp } from '../../utils/animations';

interface TimelineProps {
  data: UserYearData;
  themeStyles: any;
  isDark: boolean;
}

const Timeline: React.FC<TimelineProps> = ({ data, themeStyles, isDark }) => {
  return (
    <section className={`py-20 px-4 md:px-8 ${themeStyles.bg} transition-colors duration-500`}>
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={fadeInUp}
        >
          <h2 className={`display-font text-3xl md:text-5xl font-bold mb-8 text-center ${themeStyles.text}`}>
            Your Year in Flow
          </h2>
          
          <div className={`h-[400px] w-full p-6 rounded-3xl border shadow-lg ${themeStyles.card} ${themeStyles.border}`}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.monthlyStats} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <XAxis 
                  dataKey="month" 
                  stroke={isDark ? '#a8a29e' : '#64748b'} 
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip 
                  cursor={{ fill: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }}
                  contentStyle={{ 
                    borderRadius: '12px', 
                    border: 'none', 
                    backgroundColor: isDark ? '#1c1917' : '#fff',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                  }}
                />
                <Bar dataKey="count" radius={[6, 6, 6, 6]}>
                  {data.monthlyStats.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.count > 15 ? (isDark ? '#fb923c' : '#0ea5e9') : (isDark ? '#44403c' : '#cbd5e1')} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          
          <p className={`text-center mt-6 ${themeStyles.textMuted}`}>
            September was your busiest month with <span className="font-bold">25 issues</span>.
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default Timeline;