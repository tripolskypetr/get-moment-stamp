import { getMomentStamp } from "../index";

const STEP = 1_000; // 1 second
const DAY_MS = 1000 * 60 * 60 * 24;

// Pick a fixed UTC day so the test is deterministic and independent of the host TZ.
const START_OF_DAY_UTC = Date.UTC(2026, 4, 27, 0, 0, 0, 0); // 2026-05-27T00:00:00.000Z
const END_OF_DAY_UTC = Date.UTC(2026, 4, 27, 23, 59, 59, 0); // 2026-05-27T23:59:59.000Z

describe("Check getMomentStamp UTC dimension", () => {

    let DATE_STAMP: number;
    let EXPECT_MOMENT_STAMP: number;

    beforeAll(() => {
        jest.useFakeTimers();
        jest.setSystemTime(new Date(START_OF_DAY_UTC));
        DATE_STAMP = START_OF_DAY_UTC;
        EXPECT_MOMENT_STAMP = getMomentStamp();
    });

    beforeEach(() => {
        DATE_STAMP += STEP;
        jest.setSystemTime(new Date(DATE_STAMP));
    });

    afterAll(() => {
        jest.useRealTimers();
    });

    test("Expect moment stamp to be stable through a full UTC day", () => {
        let iter = 0;
        let isOk = true;
        for (let i = START_OF_DAY_UTC; i <= END_OF_DAY_UTC; i += STEP) {
            const currentStamp = getMomentStamp();
            isOk = isOk && currentStamp === EXPECT_MOMENT_STAMP;
            iter++;
            if (!isOk) {
                console.log(`Test failed on iter=${iter} unix_stamp=${DATE_STAMP} date=${new Date()} current_stamp=${currentStamp} expect_stamp=${EXPECT_MOMENT_STAMP}`);
                break;
            }
        }
        console.log(`Total: ${iter} iters`);
        expect(isOk).toBe(true);
    });

    test("Stamp must increment exactly at the next UTC midnight", () => {
        const lastSecond = new Date(END_OF_DAY_UTC + STEP - 1); // 23:59:59.999
        const nextDayStart = new Date(START_OF_DAY_UTC + DAY_MS); // next 00:00:00.000

        expect(getMomentStamp(lastSecond)).toBe(EXPECT_MOMENT_STAMP);
        expect(getMomentStamp(nextDayStart)).toBe(EXPECT_MOMENT_STAMP + 1);
    });

});
