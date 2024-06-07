declare module "get-moment-stamp" {
    export const toLondonDate = (date: Date) => Date;
    export const getMomentStamp = (date = new Date()) => number;
    export const getTimeStamp = (date = new Date()) => number;
    export const isCurrentTime = (timeStamp: number, delta?: number) => boolean;
    export const isCurrentDate = (date: Date, stamp?: number) => boolean;
}
