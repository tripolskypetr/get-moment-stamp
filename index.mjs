
export const toLondonDate = (date) => {
    return new Date(date.getTime() + date.getTimezoneOffset() * 60000);
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
