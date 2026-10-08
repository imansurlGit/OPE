import { useEffect, useState } from "react";

export interface CountdownTime {
    jours: number;
    heures: number;
    minutes: number;
    secondes: number;
    isFinished: boolean;
}

export default function useCountdown(target: Date): CountdownTime {
    const getRemaining = (): CountdownTime => {
        const diff = Math.max(0, target.getTime() - Date.now());
        return {
            jours: Math.floor(diff / (1000 * 60 * 60 * 24)),
            heures: Math.floor((diff / (1000 * 60 * 60)) % 24),
            minutes: Math.floor((diff / (1000 * 60)) % 60),
            secondes: Math.floor((diff / 1000) % 60),
            isFinished: diff <= 0,
        };
    };

    const [time, setTime] = useState<CountdownTime>(getRemaining);

    useEffect(() => {
        setTime(getRemaining());
        const id = setInterval(() => setTime(getRemaining()), 1000);
        return () => clearInterval(id);
    }, [target.getTime()]);

    return time;
}