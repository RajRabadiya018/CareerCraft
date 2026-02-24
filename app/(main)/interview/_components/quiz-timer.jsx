"use client";

import { Progress } from "@/components/ui/progress";
import { Clock } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export default function QuizTimer({ duration = 60, onTimeout, isActive = true, questionIndex }) {
    const [timeLeft, setTimeLeft] = useState(duration);
    const hasFiredRef = useRef(false);
    const intervalRef = useRef(null);

    // Reset timer when question changes
    useEffect(() => {
        setTimeLeft(duration);
        hasFiredRef.current = false;

        // Clear any existing interval
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
    }, [questionIndex, duration]);

    useEffect(() => {
        if (!isActive || hasFiredRef.current) return;

        // Clear previous interval
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }

        intervalRef.current = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(intervalRef.current);
                    intervalRef.current = null;
                    if (!hasFiredRef.current) {
                        hasFiredRef.current = true;
                        // Use setTimeout to avoid state update conflicts
                        setTimeout(() => onTimeout?.(), 0);
                    }
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        };
    }, [isActive, questionIndex, onTimeout]);

    const progressValue = (timeLeft / duration) * 100;

    const getTimerColor = () => {
        if (timeLeft > 30) return "text-green-500";
        if (timeLeft > 10) return "text-yellow-500";
        return "text-red-500 animate-pulse";
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

    return (
        <div className="flex items-center gap-3 w-full">
            <Clock className={`h-4 w-4 flex-shrink-0 ${getTimerColor()}`} />
            <Progress
                value={progressValue}
                className="flex-1 h-2"
            />
            <span className={`text-sm font-mono font-bold min-w-[40px] text-right ${getTimerColor()}`}>
                {formatTime(timeLeft)}
            </span>
        </div>
    );
}
