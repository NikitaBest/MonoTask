import { useState, useEffect } from "react";
import Logo404 from "./Logo404";

export function LoadingScreen() {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Показываем экран загрузки на 3 секунды при обновлении страницы
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-background/1 backdrop-blur-sm transition-opacity duration-300">
      <div className="flex flex-col items-center justify-center">
        <Logo404 />
      </div>
    </div>
  );
}

