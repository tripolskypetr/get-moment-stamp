import {
    getMomentStamp,
    getTimeStamp,
    fromMomentStamp,
    fromTimeStamp,
    fromTimeStampWithMoment,
    isCurrentDate,
    isCurrentTime,
} from "../index";

const DAY_MS = 1000 * 60 * 60 * 24;
const MIN_MS = 1000 * 60;

// Every public function in the library MUST live on the same UTC plane.
// An application developer installing this package should never have to
// reason about host time zone, DST, BST, or Intl locale data.
describe("Public API lives on a single UTC plane (no TZ, no DST)", () => {

    describe("Module surface is exactly what we promise", () => {
        test("no London / TZ-aware helper leaked back into the module", async () => {
            const mod = await import("../index");
            const exported = Object.keys(mod).sort();
            expect(exported).toEqual(
                [
                    "fromMomentStamp",
                    "fromTimeStamp",
                    "fromTimeStampWithMoment",
                    "getMomentStamp",
                    "getTimeStamp",
                    "isCurrentDate",
                    "isCurrentTime",
                ].sort(),
            );
        });
    });

    describe("Cross-function identity: (moment, time) fully describe a UTC instant", () => {
        // Walk a representative set of UTC instants: epoch, both sides of every
        // EU DST seam in 2026, an arbitrary midday, end-of-day, and a leap-ish
        // boundary. Any of these would have tripped the old local-TZ code.
        const instants = [
            "1970-01-01T00:00:00.000Z",
            "2026-03-29T00:30:00.000Z", // EU "spring forward" — local clock jumps, UTC does not
            "2026-03-29T01:30:00.000Z",
            "2026-03-29T02:30:00.000Z",
            "2026-05-27T00:00:00.000Z",
            "2026-05-27T12:34:00.000Z",
            "2026-05-27T23:59:00.000Z",
            "2026-10-25T00:30:00.000Z", // EU "fall back"
            "2026-10-25T01:30:00.000Z",
            "2026-10-25T02:30:00.000Z",
        ];

        test.each(instants)(
            "decompose + recompose round-trips exactly for %s",
            (iso) => {
                const d = new Date(iso);
                const moment = getMomentStamp(d);
                const time = getTimeStamp(d);

                // Recompose via baseDate path.
                const viaBase = fromTimeStamp(time, fromMomentStamp(moment));
                // Recompose via moment-stamp path.
                const viaMoment = fromTimeStampWithMoment(time, moment);

                // The recomposed instant must equal the minute-truncated UTC instant.
                const minuteTruncated = Math.floor(d.getTime() / MIN_MS) * MIN_MS;
                expect(viaBase.getTime()).toBe(minuteTruncated);
                expect(viaMoment.getTime()).toBe(minuteTruncated);

                // And both reconstruction paths must agree.
                expect(viaBase.getTime()).toBe(viaMoment.getTime());
            },
        );
    });

    describe("isCurrentDate / isCurrentTime use the same UTC plane", () => {
        beforeAll(() => {
            jest.useFakeTimers();
            jest.setSystemTime(new Date("2026-05-27T12:00:00.000Z"));
        });
        afterAll(() => {
            jest.useRealTimers();
        });

        test("isCurrentDate is true for any instant within the same UTC day", () => {
            expect(isCurrentDate(new Date("2026-05-27T00:00:00.000Z"))).toBe(true);
            expect(isCurrentDate(new Date("2026-05-27T23:59:59.999Z"))).toBe(true);
        });

        test("isCurrentDate is false the moment we cross UTC midnight", () => {
            expect(isCurrentDate(new Date("2026-05-26T23:59:59.999Z"))).toBe(false);
            expect(isCurrentDate(new Date("2026-05-28T00:00:00.000Z"))).toBe(false);
        });

        test("isCurrentDate composes with getMomentStamp on any Date", () => {
            const probe = new Date("2026-05-27T07:00:00.000Z");
            expect(isCurrentDate(probe, getMomentStamp(probe))).toBe(true);
            // Cross-axis sanity: an instant on a different UTC day, asked
            // against today's stamp, must be rejected.
            expect(isCurrentDate(new Date("2026-05-28T07:00:00.000Z"))).toBe(false);
        });

        test("isCurrentTime matches getTimeStamp of 'now' within the default 15-min window", () => {
            // 'now' is 12:00 UTC -> 720 minutes. Window is ±15.
            expect(isCurrentTime(720)).toBe(true);
            expect(isCurrentTime(705)).toBe(true);
            expect(isCurrentTime(735)).toBe(true);
            expect(isCurrentTime(704)).toBe(false);
            expect(isCurrentTime(736)).toBe(false);
        });

        test("isCurrentTime with delta=0 matches getTimeStamp() exactly", () => {
            expect(isCurrentTime(getTimeStamp(), 0)).toBe(true);
        });
    });

    describe("Host TZ is irrelevant: the math is pure on Date.getTime()", () => {
        test("two Date instances built from the same ms produce identical stamps", () => {
            // Same instant, two constructions — one from ISO (parsed as UTC),
            // one from raw ms. Both must yield the same (moment, time).
            const iso = new Date("2026-05-27T19:00:00.000Z");
            const raw = new Date(iso.getTime());
            expect(getMomentStamp(iso)).toBe(getMomentStamp(raw));
            expect(getTimeStamp(iso)).toBe(getTimeStamp(raw));
        });

        test("fromMomentStamp is a pure multiplication, no TZ branch", () => {
            // Spot-check several days against the closed-form expectation.
            for (const m of [0, 1, 100, 10_000, 20_600, 25_000]) {
                expect(fromMomentStamp(m).getTime()).toBe(m * DAY_MS);
                expect(fromMomentStamp(m).toISOString().endsWith("T00:00:00.000Z")).toBe(true);
            }
        });

        test("fromTimeStamp does NOT touch the UTC day of baseDate", () => {
            // Pathological baseDate: one whose *local* day in any non-UTC zone
            // differs from its UTC day. The library must commit to UTC.
            const base = new Date("2026-05-27T23:30:00.000Z");
            const noon = fromTimeStamp(12 * 60, base);
            expect(noon.toISOString()).toBe("2026-05-27T12:00:00.000Z");
            expect(getMomentStamp(noon)).toBe(getMomentStamp(base));
        });
    });

    describe("Cache-key stability across docker rebuilds in different TZ", () => {
        // The core motivation: the cache key derived from these functions must
        // be deterministic for a given UTC instant, regardless of which TZ the
        // container image was rebuilt with.
        test("cache key is a pure function of Date.getTime()", () => {
            const key = (d: Date) => `${getMomentStamp(d)}:${getTimeStamp(d)}`;

            const samples = [
                new Date("1970-01-01T00:00:00.000Z"),
                new Date("2026-03-29T01:30:00.000Z"), // mid-DST-seam in EU
                new Date("2026-05-27T19:00:00.000Z"),
                new Date("2026-10-25T01:30:00.000Z"), // fall-back seam in EU
            ];

            for (const d of samples) {
                // Re-deriving the key from a freshly constructed Date with the
                // same epoch must give bit-identical output.
                expect(key(d)).toBe(key(new Date(d.getTime())));
            }
        });
    });
});
