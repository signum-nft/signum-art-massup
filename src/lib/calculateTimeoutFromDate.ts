import intervalToDuration from "date-fns/intervalToDuration";

export function calculateTimeoutFromDate(timeoutDate: string): number {
  const duration = intervalToDuration({
    start: new Date(),
    end: new Date(timeoutDate),
  });
  return (duration.days || 0) * 24 * 60 + (duration.hours || 0) * 60;
}
