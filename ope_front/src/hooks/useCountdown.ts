import { useEffect, useState } from "react";

export default function useCountdown(target: Date) {
    const getRemaining = () => {
        const diff = Math.max(0, target.getTime() - Date.now());
        return {
            jours: Math.floor(diff / (1000 * 60 * 60 * 24)),
            heures: Math.floor((diff / (1000 * 60 * 60)) % 24),
            minutes: Math.floor((diff / (1000 * 60)) % 60),
        };
    };
    const [time, setTime] = useState(getRemaining);
    useEffect(() => {
        const id = setInterval(() => setTime(getRemaining()), 1000);
        return () => clearInterval(id);
    }, []);
    return time;
}