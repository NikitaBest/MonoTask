import { useState, useEffect } from "react";
import { useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Play, Square, Clock } from "lucide-react";
import { format } from "date-fns";

interface TaskTimerProps {
  taskId: string;
  compact?: boolean;
}

export function TaskTimer({ taskId, compact = false }: TaskTimerProps) {
  const task = useStore((state) => state.tasks.find((t) => t.id === taskId));
  const startTimer = useStore((state) => state.startTimer);
  const stopTimer = useStore((state) => state.stopTimer);
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

  // Получаем все завершенные сессии
  const completedSessions = task?.timeSessions?.filter(
    (s) => s.startTime && s.endTime && s.duration
  ) || [];

  const totalTime = getTotalTime(taskId);
  // Время текущей активной сессии (начинается с нуля)
  const currentSessionTime = isRunning ? currentTime : 0;
  // Общее время всех завершенных сессий (без текущей)
  const completedSessionsTime = completedSessions.reduce((sum, s) => sum + (s.duration || 0), 0);

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

  const formatDuration = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);

    if (hours > 0) {
      return `${hours}ч ${minutes}м`;
    }
    return `${minutes}м`;
  };

  const handleStart = () => {
    startTimer(taskId);
  };

  const handleStop = () => {
    stopTimer(taskId);
  };

  if (compact) {
    const totalTimeForCompact = getTotalTime(taskId);
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs font-mono text-muted-foreground">
          {formatTime(isRunning ? currentTime : 0)}
        </span>
        {totalTimeForCompact > 0 && !isRunning && (
          <span className="text-[10px] text-muted-foreground/70">
            ({formatTime(totalTimeForCompact)})
          </span>
        )}
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
    <div className="space-y-3">
      {/* Основной блок с таймером и кнопками */}
      <div className="relative flex items-center gap-2 p-3 rounded-lg border bg-card">
        {/* Общее время в правом верхнем углу */}
        {totalTime > 0 && (
          <div className="absolute top-2 right-2 text-xs text-muted-foreground whitespace-nowrap">
            Всего: {formatTime(completedSessionsTime + (isRunning ? currentTime : 0))}
          </div>
        )}
        
        <div className="flex-1 pr-20">
          <div className="text-lg font-mono font-semibold">
            {formatTime(currentSessionTime)}
          </div>
          <div className="text-xs text-muted-foreground mt-0.5">
            {isRunning ? "Текущая сессия" : "Время сессии"}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isRunning ? (
            <Button
              variant="default"
              size="sm"
              onClick={handleStop}
              className="h-9"
            >
              <Square className="h-4 w-4 mr-2" />
              Стоп
            </Button>
          ) : (
            <Button
              variant="default"
              size="sm"
              onClick={handleStart}
              className="h-9"
            >
              <Play className="h-4 w-4 mr-2" />
              Плэй
            </Button>
          )}
        </div>
      </div>

      {/* Текущая сессия (если запущена) */}
      {isRunning && activeSession && (
        <div className="p-3 rounded-lg border bg-muted/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span className="font-medium">Текущая сессия</span>
            </div>
            <div className="text-sm font-mono">
              {activeSession.startTimeReal}
            </div>
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            Начало: {activeSession.startTimeReal}
          </div>
        </div>
      )}

      {/* История сессий */}
      {completedSessions.length > 0 && (
        <div className="space-y-2">
          <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            История сессий ({completedSessions.length})
          </div>
          <div className="space-y-1.5">
            {completedSessions.map((session, index) => (
              <div
                key={session.id}
                className="p-2.5 rounded-md border bg-muted/20 text-sm"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      #{completedSessions.length - index}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                      <span className="font-mono">
                        {session.startTimeReal}
                        {session.endTimeReal && ` - ${session.endTimeReal}`}
                      </span>
                    </div>
                  </div>
                  {session.duration && (
                    <span className="text-xs font-mono text-muted-foreground">
                      {formatDuration(session.duration)}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
