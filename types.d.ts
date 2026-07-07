type Dimension = "minute" | "hour" | "day";
declare const getMomentStamp: (date?: Date, dimension?: Dimension) => number;
declare const getTimeStamp: (date?: Date) => number;
declare const isCurrentTime: (timeStamp: number, delta?: number) => boolean;
declare const isCurrentDate: (date: Date, stamp?: number) => boolean;
declare const fromMomentStamp: (momentStamp: number, dimension?: Dimension) => Date;
declare const fromTimeStamp: (timeStamp: number, baseDate?: Date) => Date;
declare const fromTimeStampWithMoment: (timeStamp: number, momentStamp?: number) => Date;

export { type Dimension, fromMomentStamp, fromTimeStamp, fromTimeStampWithMoment, getMomentStamp, getTimeStamp, isCurrentDate, isCurrentTime };
