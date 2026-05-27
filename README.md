# get-moment-stamp

> Install it and forget about time zones, DST, BST and host locale. Every value is pure UTC.

![screenshot](https://github.com/tripolskypetr/get-moment-stamp/blob/master/assets/screenshot.png?raw=true)

## The problem

A scheduler, a scraper or a cache key needs a single number that uniquely names "this day" and "this minute of the day". The moment you derive that number from `Date.prototype.getHours()` or `toLocaleString(...)`, it starts depending on the host time zone, on DST transitions, and on the ICU data baked into the container image. Rebuild the same Docker image with a different `TZ` and your cache silently invalidates; ship a server to a customer in another country and a job that ran at midnight now runs at 5 a.m.

`get-moment-stamp` collapses time into two flat integers that live on a single UTC axis:

- **`momentStamp`** — whole UTC days since `1970-01-01T00:00:00.000Z`.
- **`timeStamp`** — whole minutes since `00:00:00 UTC` of that UTC day.

Both numbers are pure functions of `Date.prototype.getTime()`. No `Intl`, no `getTimezoneOffset`, no DST table. The pair `(momentStamp, timeStamp)` is a stable, lossless (down to the minute) name for any UTC instant — and it is identical on every host in the world.

## Why this matters in practice

- **Docker rebuilds don't invalidate caches.** A row keyed by `(momentStamp, timeStamp)` keeps its meaning when the image is rebuilt with a different `TZ`, when the OS bumps its tzdata, or when DST ends.
- **Schedulers don't skip or duplicate a tick.** Every UTC day is exactly 1440 minutes long. There is no 23-hour or 25-hour day to special-case.
- **SQL stays honest.** `momentStamp` lines up with `DATE_TRUNC('day', ts AT TIME ZONE 'UTC')` and with `toISOString().slice(0, 10)` — no per-row arithmetic.
- **No clock to look at.** The library never reads ambient state beyond the `Date` you pass in (and `new Date()` when you omit it).

## Usage

```ts
import {
  getMomentStamp,
  getTimeStamp,
  fromMomentStamp,
  fromTimeStamp,
  fromTimeStampWithMoment,
  isCurrentDate,
  isCurrentTime,
} from "get-moment-stamp";

const now = new Date("2026-05-27T08:30:00.000Z");

getMomentStamp(now);                 // 20_600  — UTC days since epoch
getTimeStamp(now);                   // 510     — minutes since 00:00 UTC (8h * 60 + 30)

fromMomentStamp(20_600);             // 2026-05-27T00:00:00.000Z
fromTimeStamp(510, now);             // 2026-05-27T08:30:00.000Z
fromTimeStampWithMoment(510, 20_600);// 2026-05-27T08:30:00.000Z

isCurrentDate(now);                  // true if `now` is on today's UTC day
isCurrentTime(510, 15);              // true if 'now UTC minute' is within ±15 min of 510
```

## API

All functions operate on a single UTC axis. Host time zone, DST and BST are irrelevant.

### `getMomentStamp(date?: Date): number`
Number of whole UTC days since `1970-01-01T00:00:00.000Z`. Defaults to `new Date()`. Rolls over exactly at `00:00 UTC`.

### `getTimeStamp(date?: Date): number`
Number of whole minutes since `00:00:00 UTC` of the same UTC day. Range: `0..1439`. Defaults to `new Date()`.

### `fromMomentStamp(momentStamp: number): Date`
Inverse of `getMomentStamp`. Returns the `Date` representing exactly `T00:00:00.000Z` of that UTC day.

### `fromTimeStamp(timeStamp: number, baseDate?: Date): Date`
Returns a `Date` on the **UTC day of `baseDate`** at `timeStamp` UTC minutes past midnight. The UTC day of `baseDate` is preserved even if its local-zone day is different. Defaults `baseDate` to `new Date()`.

### `fromTimeStampWithMoment(timeStamp: number, momentStamp?: number): Date`
Same as `fromTimeStamp`, but anchored to the UTC day named by `momentStamp` instead of a `Date`. Defaults `momentStamp` to `getMomentStamp()` (today, UTC).

### `isCurrentDate(date: Date, stamp?: number): boolean`
True when `getMomentStamp(date) === stamp`. Defaults `stamp` to today's UTC day.

### `isCurrentTime(timeStamp: number, delta?: number): boolean`
True when `timeStamp` is within ±`delta` UTC minutes of the current UTC minute-of-day. Defaults `delta` to `15`.

## Guarantees

- Output of every function is determined solely by the `Date`/`number` arguments you pass.
- No call ever reads `process.env.TZ`, `Intl` data, DST tables, or `Date.prototype.getTimezoneOffset()`.
- Round-trip is exact down to the minute: `fromTimeStamp(getTimeStamp(d), fromMomentStamp(getMomentStamp(d)))` equals `d` truncated to its UTC minute.
- Test suite is executed under multiple host time zones (UTC, Asia/Tashkent, America/Los_Angeles, Pacific/Chatham) and across both EU DST seams to lock this in.

## Origin

Built for the [react-declarative](https://github.com/react-declarative/react-declarative) time serialization format and used on the backend side.
