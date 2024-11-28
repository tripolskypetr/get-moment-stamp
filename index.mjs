
export const toLondonDate_obsolete = (date) => {
    return new Date(date.getTime() + date.getTimezoneOffset() * 60000);
};

export const toLondonDate = (date) => {
    const londonTimeZone = 'Europe/London';
    return new Date(date.toLocaleString('en-US', { timeZone: londonTimeZone }));
};

const GENESIS_STAMP = toLondonDate(new Date(0));
const DIMENSION_DELTA = 1000 * 60 * 60 * 24;

export const getMomentStamp = (date = new Date()) => {
    const currentStamp = toLondonDate(date);
    const differenceMs = Math.abs(currentStamp - GENESIS_STAMP);
    return Math.floor(differenceMs / DIMENSION_DELTA);
}

export const getTimeStamp = (date = new Date()) => {
    const hour = date.getHours();
    const minute = date.getMinutes();
    return (hour * 60) + minute;
};

export const isCurrentTime = (timeStamp, delta = 15) => {
    const currentStamp = getTimeStamp();
    const min = currentStamp - delta;
    const max = currentStamp + delta;
    return timeStamp >= min && timeStamp <= max
};

export const isCurrentDate = (date, stamp = getMomentStamp()) => {
    return getMomentStamp(date) === stamp;
}

export const fromMomentStamp = (momentStamp) => {
    const millisecondsSinceGenesis = momentStamp * DIMENSION_DELTA;
    const londonDate = new Date(GENESIS_STAMP.getTime() + millisecondsSinceGenesis);
    return new Date(londonDate.getTime() - londonDate.getTimezoneOffset() * 60000);
};

export const fromTimeStamp = (timeStamp, baseDate = new Date()) => {
    const hours = Math.floor(timeStamp / 60);
    const minutes = timeStamp % 60;
    const resultDate = new Date(baseDate);
    resultDate.setHours(hours, minutes, 0, 0); // Set hours, minutes, seconds, and milliseconds
    return resultDate;
};
