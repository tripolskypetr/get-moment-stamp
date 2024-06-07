# get-moment-stamp

> Calculates days from 01/01/1970 in London

## The problem

When you working with dates, It require to use UTC time format. For example `2024-06-07T14:31:22Z`. It's ok if you are using SQL, but awful if you are working from vanilla javascript.

The `getMomentStamp()` function returns number of days since `01/01/1970` independent from the current time zone. Quite usefull when building schedulers. The `getTimeStamp()` returns the number of minutes since `00:00` of the current day.

## Usage

Build especially for [react-declarative](https://github.com/react-declarative/react-declarative) time serialization format to use on a backend side
