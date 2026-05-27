import { getMomentStamp, fromMomentStamp } from "../index";

const DAY_MS = 1000 * 60 * 60 * 24;

describe("getMomentStamp must be timezone-independent (pure UTC)", () => {

    test("UTC epoch maps to stamp 0", () => {
        expect(getMomentStamp(new Date(0))).toBe(0);
    });

    test("stamp transitions exactly at UTC midnight, not London midnight", () => {
        const lastSecondOfDay = new Date("2026-05-27T23:59:59.999Z");
        const firstSecondNextDay = new Date("2026-05-28T00:00:00.000Z");

        const stampBefore = getMomentStamp(lastSecondOfDay);
        const stampAfter = getMomentStamp(firstSecondNextDay);

        expect(stampAfter).toBe(stampBefore + 1);
    });

    test("all moments inside one UTC day share the same stamp (summer / BST)", () => {
        const baseStamp = getMomentStamp(new Date("2026-05-27T00:00:00.000Z"));
        const samplesUtc = [
            "2026-05-27T00:00:00.000Z",
            "2026-05-27T03:00:00.000Z",
            "2026-05-27T12:00:00.000Z",
            "2026-05-27T22:30:00.000Z",
            "2026-05-27T23:00:00.000Z",
            "2026-05-27T23:59:59.999Z",
        ];
        for (const iso of samplesUtc) {
            expect(getMomentStamp(new Date(iso))).toBe(baseStamp);
        }
    });

    test("fromMomentStamp returns exact UTC midnight", () => {
        const stamp = getMomentStamp(new Date("2026-05-27T12:34:56.000Z"));
        const d = fromMomentStamp(stamp);
        expect(d.toISOString()).toBe("2026-05-27T00:00:00.000Z");
    });

    test("getMomentStamp / fromMomentStamp are inverse on day boundaries", () => {
        for (let s = 0; s < 25000; s += 137) {
            const d = fromMomentStamp(s);
            expect(getMomentStamp(d)).toBe(s);
            expect(d.getTime()).toBe(s * DAY_MS);
        }
    });

    test("Tashkent 04:30 local (UTC+5, summer) belongs to the previous UTC day", () => {
        // 04:30 Tashkent = 23:30 UTC of the previous calendar day.
        // A pure-UTC stamp must reflect the previous UTC day,
        // matching scrapers that build [00:00 UTC .. 23:59 UTC] windows.
        const tashkentMorning = new Date("2026-05-27T23:30:00.000Z");
        const utcDayStart = new Date("2026-05-27T00:00:00.000Z");

        expect(getMomentStamp(tashkentMorning)).toBe(getMomentStamp(utcDayStart));

        const window = fromMomentStamp(getMomentStamp(tashkentMorning));
        const windowEnd = new Date(window);
        windowEnd.setUTCHours(23, 59, 59, 999);
        expect(tashkentMorning >= window && tashkentMorning <= windowEnd).toBe(true);
    });
});
