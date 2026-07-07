import { getMomentStamp, fromMomentStamp } from "../index";

const MIN_MS = 1000 * 60;
const HOUR_MS = 1000 * 60 * 60;
const DAY_MS = 1000 * 60 * 60 * 24;

// getMomentStamp takes a granularity: "minute" | "hour" | "day" (default "day").
// The bug that broke lightweight-charts: the minute axis collapsed because the
// dimension argument was dropped and every stamp became a whole-day number, so
// 1440 minute candles inside one day shared the same time value. These tests
// pin the axis property setData() actually depends on: strictly-increasing time.
describe("getMomentStamp dimension controls axis granularity", () => {

    test("default dimension is 'day' — one stamp per UTC day (unchanged v2 behaviour)", () => {
        const d = new Date("2026-05-27T12:34:00.000Z");
        expect(getMomentStamp(d)).toBe(getMomentStamp(d, "day"));
        expect(getMomentStamp(d)).toBe(Math.floor(d.getTime() / DAY_MS));
    });

    test("'minute' axis increments by exactly 1 per minute — no collapse", () => {
        // The regression: consecutive minute candles must yield consecutive,
        // strictly-increasing stamps, or lightweight-charts draws flat bands.
        const start = new Date("2026-05-27T00:00:00.000Z");
        let prev = getMomentStamp(start, "minute");
        for (let m = 1; m < 1440; m++) {
            const stamp = getMomentStamp(new Date(start.getTime() + m * MIN_MS), "minute");
            expect(stamp).toBe(prev + 1); // +1 per candle, strictly monotonic
            prev = stamp;
        }
    });

    test("a full UTC day of minute candles has 1440 DISTINCT stamps (was 1)", () => {
        const start = Date.UTC(2026, 4, 27, 0, 0, 0, 0);
        const stamps = new Set<number>();
        for (let m = 0; m < 1440; m++) {
            stamps.add(getMomentStamp(new Date(start + m * MIN_MS), "minute"));
        }
        expect(stamps.size).toBe(1440);
    });

    test("'hour' axis increments by 1 per hour", () => {
        const a = new Date("2026-05-27T00:00:00.000Z");
        const b = new Date("2026-05-27T01:00:00.000Z");
        expect(getMomentStamp(b, "hour")).toBe(getMomentStamp(a, "hour") + 1);
        expect(getMomentStamp(a, "hour")).toBe(Math.floor(a.getTime() / HOUR_MS));
    });

    test("each dimension is timezone-independent — a pure floor over Date.getTime()", () => {
        const instant = new Date("2026-05-27T19:00:00.000Z");
        const rebuilt = new Date(instant.getTime());
        for (const dim of ["minute", "hour", "day"] as const) {
            expect(getMomentStamp(instant, dim)).toBe(getMomentStamp(rebuilt, dim));
        }
    });

    test("getMomentStamp / fromMomentStamp round-trip per dimension", () => {
        const unit = { minute: MIN_MS, hour: HOUR_MS, day: DAY_MS } as const;
        for (const dim of ["minute", "hour", "day"] as const) {
            for (const s of [0, 1, 137, 25_000]) {
                const d = fromMomentStamp(s, dim);
                expect(d.getTime()).toBe(s * unit[dim]);
                expect(getMomentStamp(d, dim)).toBe(s);
            }
        }
    });
});
