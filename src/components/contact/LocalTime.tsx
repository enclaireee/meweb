"use client";

import { useEffect, useState } from "react";

const formatter = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Asia/Jakarta",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false,
});

/** Live local time in Depok — renders a stable placeholder until mounted. */
export function LocalTime() {
  const [time, setTime] = useState<string | null>(null);

  useEffect(() => {
    const tick = () => setTime(formatter.format(new Date()));
    const id = setInterval(tick, 1000);
    const raf = requestAnimationFrame(tick);
    return () => {
      clearInterval(id);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <span className="tabular-nums" suppressHydrationWarning>
      {time ?? "--:--:--"} UTC+7
    </span>
  );
}
