import { useState, useEffect } from 'react';
import { Card, CardContent } from './Card';

// **Import your assets** so bundler knows to include them:
import Tip1 from '../../assets/Tip1.png';
import Tip2 from '../../assets/Tip2.png';
import Tip3 from '../../assets/Tip3.png';

export default function TipsCarousel() {
  const slides = [Tip1, Tip2, Tip3];
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((i) => (i + 1) % slides.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [slides.length]);

  return (
    <Card className="shadow-sm border border-gray-100/50 backdrop-blur-sm bg-white/80 flex flex-col h-full rounded-lg overflow-hidden">
      <CardContent className="flex-1 p-0">
        <div className="w-full h-full">
          <img
            src={slides[currentIndex]}
            alt={`Tip ${currentIndex + 1}`}
            className="object-cover w-full h-full transition-opacity duration-500"
          />
        </div>
      </CardContent>
    </Card>
  );
}
