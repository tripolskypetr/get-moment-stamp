declare const toLondonDate_obsolete: (date: Date) => Date;
declare const toLondonDate: (date: Date) => Date;
declare const getMomentStamp: (date?: Date) => number;
declare const getTimeStamp: (date?: Date) => number;
declare const isCurrentTime: (timeStamp: number, delta?: number) => boolean;
declare const isCurrentDate: (date: Date, stamp?: number) => boolean;
declare const fromMomentStamp: (momentStamp: number) => Date;
declare const fromTimeStamp: (timeStamp: number, baseDate?: Date) => Date;

export { fromMomentStamp, fromTimeStamp, getMomentStamp, getTimeStamp, isCurrentDate, isCurrentTime, toLondonDate, toLondonDate_obsolete };
