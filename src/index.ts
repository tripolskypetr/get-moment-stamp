export type Dimension = "minute" | "hour" | "day";

const DIMENSION_DELTA: Record<Dimension, number> = {
    minute: 1000 * 60,
    hour: 1000 * 60 * 60,
    day: 1000 * 60 * 60 * 24,
};

export const getMomentStamp = (date: Date = new Date(), dimension: Dimension = "day"): number => {
    const delta = DIMENSION_DELTA[dimension];
    if (delta === undefined) {
        throw new Error(`Invalid dimension: ${dimension}. Valid dimensions are "minute", "hour", or "day".`);
    }
    return Math.floor(date.getTime() / delta);
};

export const getTimeStamp = (date: Date = new Date()): number => {
    const hour: number = date.getUTCHours();
    const minute: number = date.getUTCMinutes();
    return hour * 60 + minute;
};

export const isCurrentTime = (timeStamp: number, delta: number = 15): boolean => {
    const currentStamp: number = getTimeStamp();
    const min: number = currentStamp - delta;
    const max: number = currentStamp + delta;
    return timeStamp >= min && timeStamp <= max;
};

export const isCurrentDate = (date: Date, stamp: number = getMomentStamp()): boolean => {
    return getMomentStamp(date) === stamp;
};

export const fromMomentStamp = (momentStamp: number, dimension: Dimension = "day"): Date => {
    const delta = DIMENSION_DELTA[dimension];
    if (delta === undefined) {
        throw new Error(`Invalid dimension: ${dimension}. Valid dimensions are "minute", "hour", or "day".`);
    }
    return new Date(momentStamp * delta);
};

export const fromTimeStamp = (timeStamp: number, baseDate: Date = new Date()): Date => {
    const hours: number = Math.floor(timeStamp / 60);
    const minutes: number = timeStamp % 60;
    const resultDate: Date = new Date(baseDate);
    resultDate.setUTCHours(hours, minutes, 0, 0);
    return resultDate;
};

export const fromTimeStampWithMoment = (timeStamp: number, momentStamp = getMomentStamp()): Date => {
    const baseDate: Date = fromMomentStamp(momentStamp);
    const hours: number = Math.floor(timeStamp / 60);
    const minutes: number = timeStamp % 60;
    baseDate.setUTCHours(hours, minutes, 0, 0);
    return baseDate;
};
