import { useEffect, useState } from 'react';

export default function Timer({ secondsLeft, onComplete }) {
  const [seconds, setSeconds] = useState(secondsLeft);

  useEffect(() => {
    if (seconds <= 0) {
      onComplete && onComplete();
      return;
    }
    const interval = setInterval(() => {
      setSeconds((s) => s - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [seconds, onComplete]);

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  return (
    <div className="text-center text-lg font-bold text-blue-600">
      Next question unlocks in: {hours}h {minutes}m {secs}s
    </div>
  );
}
