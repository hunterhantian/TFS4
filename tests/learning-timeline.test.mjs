import test from 'node:test';import assert from 'node:assert/strict';
import {weekFor,weeksInMonth,monthPeriod} from '../web/modules/learning-timeline.mjs';
import {archiveFilters} from '../server/archive-filters.mjs';
test('month range covers the precise calendar month',()=>{assert.deepEqual(monthPeriod('2026-05'),{from:'2026-05-01',to:'2026-05-31'});assert.deepEqual(monthPeriod('2028-02'),{from:'2028-02-01',to:'2028-02-29'});});
test('weeks run Monday to Sunday across month and year boundaries',()=>{
 assert.deepEqual(weekFor('2026-11-01'),{from:'2026-10-26',to:'2026-11-01'});
 assert.deepEqual(weekFor('2027-01-01'),{from:'2026-12-28',to:'2027-01-03'});
 assert.deepEqual(weeksInMonth('2026-11')[0],{from:'2026-10-26',to:'2026-11-01'});
 assert.deepEqual(weeksInMonth('2026-11').at(-1),{from:'2026-11-30',to:'2026-12-06'});
});
test('last 14 days includes today and the previous 13 Shanghai calendar days',()=>{
 const period=archiveFilters({range:'last14'},Date.parse('2026-11-03T16:30:00Z'));
 assert.equal(period.fromDate,'2026-10-22');assert.equal(period.toDate,'2026-11-04');
 assert.equal(period.start,'2026-10-21T16:00:00.000Z');assert.equal(period.end,'2026-11-04T16:00:00.000Z');
});
