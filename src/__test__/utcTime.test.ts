import {
    getTimeStamp,
    fromTimeStamp,
    fromTimeStampWithMoment,
    getMomentStamp,
    fromMomentStamp,
} from "../index";

const DAY_MS = 1000 * 60 * 60 * 24;
const HOUR_MS = 1000 * 60 * 60;
const MIN_MS = 1000 * 60;

describe("getTimeStamp / fromTimeStamp must be pure UTC (TZ-independent)", () => {

    test("UTC epoch maps to time stamp 0", () => {
        expect(getTimeStamp(new Date(0))).toBe(0);
    });

    test("getTimeStamp returns minutes since 00:00 UTC of the same UTC day", () => {
        expect(getTimeStamp(new Date("2026-05-27T00:00:00.000Z"))).toBe(0);
        expect(getTimeStamp(new Date("2026-05-27T00:01:00.000Z"))).toBe(1);
        expect(getTimeStamp(new Date("2026-05-27T01:00:00.000Z"))).toBe(60);
        expect(getTimeStamp(new Date("2026-05-27T12:34:00.000Z"))).toBe(12 * 60 + 34);
        expect(getTimeStamp(new Date("2026-05-27T23:59:00.000Z"))).toBe(23 * 60 + 59);
    });

    test("getTimeStamp ignores host time zone — same instant gives same stamp", () => {
        // Two Date objects representing the same UTC instant must yield the same
        // time stamp regardless of how the host would format them locally.
        const a = new Date("2026-05-27T08:30:00.000Z");
        const b = new Date(a.getTime());
        expect(getTimeStamp(a)).toBe(getTimeStamp(b));
        expect(getTimeStamp(a)).toBe(8 * 60 + 30);
    });

    test("getTimeStamp wraps to 0 exactly at UTC midnight (no DST seam)", () => {
        const lastMinute = new Date("2026-03-29T23:59:00.000Z"); // EU DST switch day
        const nextMidnight = new Date("2026-03-30T00:00:00.000Z");
        expect(getTimeStamp(lastMinute)).toBe(23 * 60 + 59);
        expect(getTimeStamp(nextMidnight)).toBe(0);
    });

    test("fromTimeStamp returns a UTC-anchored Date with HH:MM UTC set", () => {
        const base = new Date("2026-05-27T15:42:11.123Z");
        const d = fromTimeStamp(8 * 60 + 30, base);
        expect(d.toISOString()).toBe("2026-05-27T08:30:00.000Z");
    });

    test("fromTimeStamp keeps the UTC calendar day of baseDate", () => {
        // Pick a baseDate whose local-TZ day might disagree with its UTC day.
        // The UTC day must win, otherwise a docker rebuild in another TZ would
        // shift cached entries by one day.
        const base = new Date("2026-05-27T23:30:00.000Z");
        const d = fromTimeStamp(0, base);
        expect(d.toISOString()).toBe("2026-05-27T00:00:00.000Z");
    });

    test("fromTimeStamp defaults baseDate to now but still produces UTC midnight + offset", () => {
        const before = Date.now();
        const d = fromTimeStamp(0);
        const after = Date.now();

        const utcMidnightBefore = Math.floor(before / DAY_MS) * DAY_MS;
        const utcMidnightAfter = Math.floor(after / DAY_MS) * DAY_MS;

        expect(d.getTime() === utcMidnightBefore || d.getTime() === utcMidnightAfter).toBe(true);
    });

    test("getTimeStamp / fromTimeStamp round-trip preserves the minute on the same UTC day", () => {
        const base = new Date("2026-05-27T00:00:00.000Z");
        for (let minute = 0; minute < 24 * 60; minute += 7) {
            const d = fromTimeStamp(minute, base);
            expect(getTimeStamp(d)).toBe(minute);
            expect(d.getTime()).toBe(base.getTime() + minute * MIN_MS);
        }
    });

    test("fromTimeStampWithMoment composes moment + time into the exact UTC instant", () => {
        const moment = getMomentStamp(new Date("2026-05-27T00:00:00.000Z"));
        const d = fromTimeStampWithMoment(8 * 60 + 30, moment);
        expect(d.toISOString()).toBe("2026-05-27T08:30:00.000Z");

        // And the inverse direction stays consistent.
        expect(getMomentStamp(d)).toBe(moment);
        expect(getTimeStamp(d)).toBe(8 * 60 + 30);
    });

    test("fromTimeStampWithMoment defaults momentStamp to current UTC day", () => {
        const d = fromTimeStampWithMoment(0);
        const todayMidnight = fromMomentStamp(getMomentStamp());
        expect(d.getTime()).toBe(todayMidnight.getTime());
    });

    test("docker-rebuild scenario: cache key is stable across host TZ changes", () => {
        // Simulate two hosts (e.g. UTC and Asia/Tashkent docker images) computing
        // a cache key for the same logical instant. Both must produce the same
        // (moment, time) pair — otherwise the cache invalidates on redeploy.
        const instant = new Date("2026-05-27T19:00:00.000Z");
        const key = (d: Date) => `${getMomentStamp(d)}:${getTimeStamp(d)}`;

        // Same Date, evaluated twice — the implementation must not depend on
        // anything ambient (TZ env, Intl locale, DST table version).
        expect(key(instant)).toBe(key(new Date(instant.getTime())));
        expect(key(instant)).toBe(`${getMomentStamp(instant)}:${19 * 60}`);
    });

    test("hour boundary: 23:00 UTC and 00:00 UTC differ by exactly one UTC day", () => {
        const a = new Date("2026-05-27T23:00:00.000Z");
        const b = new Date("2026-05-28T00:00:00.000Z");
        expect(b.getTime() - a.getTime()).toBe(HOUR_MS);
        expect(getMomentStamp(b) - getMomentStamp(a)).toBe(1);
        expect(getTimeStamp(a)).toBe(23 * 60);
        expect(getTimeStamp(b)).toBe(0);
    });
});
