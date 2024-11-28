declare module "get-moment-stamp" {
    export const toLondonDate = (date: Date) => Date;
    export const getMomentStamp = (date?: Date) => number;
    export const getTimeStamp = (date?: Date) => number;
    export const isCurrentTime = (timeStamp: number, delta?: number) => boolean;
    export const isCurrentDate = (date: Date, stamp?: number) => boolean;
    export const fromMomentStamp = (stamp: number) => Date;
    export const fromTimeStamp = (stamp: number, date?: Date) => Date;
}
