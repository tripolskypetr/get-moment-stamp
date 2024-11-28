export const toLondonDate_obsolete = (date: Date): Date => {
    return new Date(date.getTime() + date.getTimezoneOffset() * 60000);
};

export const toLondonDate = (date: Date): Date => {
    const londonTimeZone = 'Europe/London';
    return new Date(date.toLocaleString('en-US', { timeZone: londonTimeZone }));
};

const GENESIS_STAMP: Date = toLondonDate(new Date(0));
const DIMENSION_DELTA: number = 1000 * 60 * 60 * 24;

export const getMomentStamp = (date: Date = new Date()): number => {
    const currentStamp: Date = toLondonDate(date);
    const differenceMs: number = Math.abs(currentStamp.getTime() - GENESIS_STAMP.getTime());
    return Math.floor(differenceMs / DIMENSION_DELTA);
};

export const getTimeStamp = (date: Date = new Date()): number => {
    const hour: number = date.getHours();
    const minute: number = date.getMinutes();
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
    const millisecondsSinceGenesis: number = momentStamp * DIMENSION_DELTA;
    const londonDate: Date = new Date(GENESIS_STAMP.getTime() + millisecondsSinceGenesis);
    return new Date(londonDate.getTime() - londonDate.getTimezoneOffset() * 60000);
};

export const fromTimeStamp = (timeStamp: number, baseDate: Date = new Date()): Date => {
    const hours: number = Math.floor(timeStamp / 60);
    const minutes: number = timeStamp % 60;
    const resultDate: Date = new Date(baseDate);
    resultDate.setHours(hours, minutes, 0, 0);
    return resultDate;
};
