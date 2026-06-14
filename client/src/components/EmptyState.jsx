import React from 'react';
import { motion } from 'framer-motion';
import * as Icons from 'lucide-react';

export const EmptyState = ({ 
  title = "No data found", 
  description = "There are no items to display at this time.", 
  actionText, 
  onAction, 
  icon = "Inbox" 
}) => {
  const IconComponent = Icons[icon] || Icons.Inbox;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col items-center justify-center p-8 text-center bg-white border border-darkBorder rounded-2xl shadow-sm max-w-md mx-auto my-6"
    >
      <div className="relative mb-5">
        <div className="absolute inset-0 bg-brandPrimary/5 rounded-full blur-xl transform scale-150" />
        <div className="relative p-4 bg-slate-50 border border-darkBorder rounded-2xl flex items-center justify-center text-slate-400">
          <IconComponent className="h-10 w-10 text-brandPrimary" strokeWidth={1.5} />
        </div>
      </div>
      
      <h3 className="text-lg font-bold text-slate-900 font-jakarta mb-2">
        {title}
      </h3>
      
      <p className="text-sm text-slate-500 max-w-sm mb-6 leading-relaxed">
        {description}
      </p>

      {actionText && onAction && (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onAction}
          className="btn-primary"
        >
          {actionText}
        </motion.button>
      )}
    </motion.div>
  );
};

export default EmptyState;
