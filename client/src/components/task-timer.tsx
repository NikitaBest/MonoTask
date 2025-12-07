import { useState, useEffect } from "react";
import { useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Play, Pause, Square } from "lucide-react";
import { cn } from "@/lib/utils";

interface TaskTimerProps {
  taskId: string;
  compact?: boolean;
}

export function TaskTimer({ taskId, compact = false }: TaskTimerProps) {
  const task = useStore((state) => state.tasks.find((t) => t.id === taskId));
  const startTimer = useStore((state) => state.startTimer);
  const stopTimer = useStore((state) => state.stopTimer);
  const pauseTimer = useStore((state) => state.pauseTimer);
  const getTotalTime = useStore((state) => state.getTotalTimeForTask);

  const [currentTime, setCurrentTime] = useState(0);

  // Проверяем, есть ли активная сессия
  const activeSession = task?.timeSessions?.find(
    (s) => s.startTime && !s.endTime
  );

  const isRunning = !!activeSession;

  // Обновляем текущее время каждую секунду, если таймер запущен
  useEffect(() => {
    if (!isRunning) {
      setCurrentTime(0);
      return;
    }

    const interval = setInterval(() => {
      if (activeSession) {
        const elapsed = Date.now() - activeSession.startTime;
        setCurrentTime(elapsed);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, activeSession]);

  const totalTime = getTotalTime(taskId);
  const displayTime = isRunning ? totalTime + currentTime : totalTime;

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const handleStart = () => {
    startTimer(taskId);
  };

  const handleStop = () => {
    stopTimer(taskId);
  };

  const handlePause = () => {
    pauseTimer(taskId);
  };

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs font-mono text-muted-foreground">
          {formatTime(displayTime)}
        </span>
        {isRunning ? (
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={handleStop}
          >
            <Square className="h-3 w-3" />
          </Button>
        ) : (
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={handleStart}
          >
            <Play className="h-3 w-3" />
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 p-2 rounded-lg border bg-card">
      <div className="flex-1">
        <div className="text-sm font-mono font-semibold">
          {formatTime(displayTime)}
        </div>
        {task?.estimatedTime && (
          <div className="text-xs text-muted-foreground">
            Оценка: {Math.floor(task.estimatedTime / 60)}ч {task.estimatedTime % 60}м
          </div>
        )}
      </div>
      <div className="flex items-center gap-1">
        {isRunning ? (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={handlePause}
              className="h-8"
            >
              <Pause className="h-3 w-3 mr-1" />
              Пауза
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={handleStop}
              className="h-8"
            >
              <Square className="h-3 w-3 mr-1" />
              Стоп
            </Button>
          </>
        ) : (
          <Button
            variant="default"
            size="sm"
            onClick={handleStart}
            className="h-8"
          >
            <Play className="h-3 w-3 mr-1" />
            Старт
          </Button>
        )}
      </div>
    </div>
  );
}

