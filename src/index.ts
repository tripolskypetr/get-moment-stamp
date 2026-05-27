const DIMENSION_DELTA: number = 1000 * 60 * 60 * 24;

export const getMomentStamp = (date: Date = new Date()): number => {
    return Math.floor(date.getTime() / DIMENSION_DELTA);
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

export const fromMomentStamp = (momentStamp: number): Date => {
    return new Date(momentStamp * DIMENSION_DELTA);
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
