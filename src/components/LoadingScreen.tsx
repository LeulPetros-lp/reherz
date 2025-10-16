import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { BsMicFill } from 'react-icons/bs';
import Logo from './Logo';

interface LoadingScreenProps {
  onLoadingComplete: () => void;
}

export default function LoadingScreen({ onLoadingComplete }: LoadingScreenProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      onLoadingComplete();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onLoadingComplete]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-background flex flex-col items-center justify-center z-50">
      <div className="flex flex-col items-center space-y-6">
        <div className="relative">
            <Logo />
          
          {/* Loading spinner */}

        </div>
      </div>
    </div>
  );
}
