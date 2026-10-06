import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock as ClockIcon, Calendar } from 'lucide-react';

export default function Clock() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gradient-to-r from-primary-300/10 to-purple-400/10 border border-primary-300/20 backdrop-blur-sm"
    >
      <ClockIcon size={14} className="text-primary-300" />
      <div className="flex flex-col">
        <span className="text-xs font-mono font-semibold text-primary-300">
          {formatTime(time)}
        </span>
        <span className="text-[10px] text-gray-400 flex items-center gap-1">
          <Calendar size={8} />
          {formatDate(time)}
        </span>
      </div>
    </motion.div>
  );
}
