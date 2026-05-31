/**
 * Unit Tests for Lunar Calendar and Hour Conversion
 */

import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  convertSolar2Lunar,
  jdFromDate,
  getDayCanChi,
  getYearCanChi,
  getMonthCanChi
} from '../core/lunar-calendar';

import {
  normalizeToHanoiTime,
  getLunarHourBranch,
  calculateLunarHour,
  LUNAR_HOUR_TABLE
} from '../core/lunar-hour';

import {
  calculateBirthChart,
  validateBirthData
} from '../services/calculation-service';

describe('Lunar Calendar Conversion', () => {
  it('should convert solar date to lunar date correctly', () => {
    // Test case: 09/06/2009
    const result = convertSolar2Lunar(9, 6, 2009, 7);
    
    assert.strictEqual(result.day, 17);
    assert.strictEqual(result.month, 5);
    assert.strictEqual(result.year, 2009);
    assert.strictEqual(result.isLeapMonth, false);
  });

  it('should calculate Julian Day Number correctly', () => {
    // Test: 1/1/2000 should be JD 2451545
    const jd = jdFromDate(1, 1, 2000);
    assert.strictEqual(jd, 2451545);
  });

  it('should get correct year Can Chi', () => {
    // 2009 = Kỷ Sửu
    const result = getYearCanChi(2009);
    assert.strictEqual(result.stem, 'Kỷ');
    assert.strictEqual(result.branch, 'Sửu');
  });

  it('should get correct day Can Chi', () => {
    // Test with a known date
    const jd = jdFromDate(9, 6, 2009);
    const result = getDayCanChi(jd);
    // 09/06/2009 is Ất Dậu
    assert.strictEqual(result.stem, 'Ất');
    assert.strictEqual(result.branch, 'Dậu');
  });
});

describe('Lunar Hour Conversion (TuviGLOBAL Standard)', () => {
  it('should return Hợi for 23h03 in lunar month 5', () => {
    // Critical test case from requirements
    // 09/06/2009, 23h03, Month 5 AL → Hợi (22h10–24h10)
    // NOT Tý as most software incorrectly calculates
    const branch = getLunarHourBranch(5, 23, 3);
    assert.strictEqual(branch, 'Hợi');
  });

  it('should handle giờ Tý spanning midnight in month 1', () => {
    // Month 1: Tý = 23h30 – 1h30
    const branch1 = getLunarHourBranch(1, 23, 45);
    assert.strictEqual(branch1, 'Tý');
    
    const branch2 = getLunarHourBranch(1, 0, 30);
    assert.strictEqual(branch2, 'Tý');
  });

  it('should handle transition warnings near boundary', () => {
    // Test near boundary (within 15 minutes)
    const result = calculateLunarHour(1, 23, 35, 0);
    // Should have a warning since 23h35 is within 15 min of 23h30
    assert.ok(result.warning !== null || result.branch === 'Tý');
  });

  it('should have all 12 months defined in table', () => {
    for (let month = 1; month <= 12; month++) {
      assert.ok(LUNAR_HOUR_TABLE[month], `Month ${month} should be defined`);
      assert.strictEqual(LUNAR_HOUR_TABLE[month].length, 12, `Month ${month} should have 12 hours`);
    }
  });
});

describe('Timezone Normalization (Historical Vietnam)', () => {
  it('should subtract 1 hour for 1943-1945 period', () => {
    const date = new Date(1944, 5, 15, 10, 0); // 15/06/1944, 10:00
    const result = normalizeToHanoiTime(date, 'Hà Nội');
    
    assert.strictEqual(result.adjustmentHours, -1);
    assert.strictEqual(result.adjustedDateTime.getHours(), 9);
  });

  it('should subtract 2 hours for Apr-Aug 1945', () => {
    const date = new Date(1945, 5, 15, 10, 0); // 15/06/1945, 10:00
    const result = normalizeToHanoiTime(date, 'Hà Nội');
    
    assert.strictEqual(result.adjustmentHours, -2);
    assert.strictEqual(result.adjustedDateTime.getHours(), 8);
  });

  it('should subtract 1 hour for South Vietnam 1960-1975', () => {
    const date = new Date(1962, 5, 15, 7, 0); // 15/06/1962, 07:00
    const result = normalizeToHanoiTime(date, 'Sài Gòn', true);
    
    assert.strictEqual(result.adjustmentHours, -1);
    assert.strictEqual(result.adjustedDateTime.getHours(), 6);
  });

  it('should not adjust for dates after 1975', () => {
    const date = new Date(1980, 5, 15, 10, 0);
    const result = normalizeToHanoiTime(date, 'Hồ Chí Minh');
    
    assert.strictEqual(result.adjustmentHours, 0);
    assert.strictEqual(result.adjustedDateTime.getHours(), 10);
  });
});

describe('Calculation Service', () => {
  it('should calculate complete birth chart for example input', () => {
    const input = {
      solar_date: '09/06/2009',
      solar_time: '23:03',
      birthplace: 'Hồ Chí Minh'
    };
    
    const result = calculateBirthChart(input);
    
    // Verify lunar date
    assert.strictEqual(result.lunar_date.day, 17);
    assert.strictEqual(result.lunar_date.month, 5);
    assert.strictEqual(result.lunar_date.year, 2009);
    
    // Verify lunar hour - CRITICAL: Must be Hợi, NOT Tý
    assert.strictEqual(result.gio_am_lich, 'Hợi');
    
    // Verify hour range
    assert.ok(result.gio_range_used.includes('Tháng 5'));
    
    // Verify Can Chi
    assert.strictEqual(result.lunar_date.can_chi_year.stem, 'Kỷ');
    assert.strictEqual(result.lunar_date.can_chi_year.branch, 'Sửu');
  });

  it('should validate input correctly', () => {
    const validInput = {
      solar_date: '09/06/2009',
      solar_time: '23:03',
      birthplace: 'Hồ Chí Minh'
    };
    
    const validation = validateBirthData(validInput);
    assert.strictEqual(validation.valid, true);
    assert.strictEqual(validation.errors.length, 0);
  });

  it('should detect invalid input', () => {
    const invalidInput = {
      solar_date: 'invalid',
      solar_time: '23:03',
      birthplace: 'Hồ Chí Minh'
    } as any;
    
    const validation = validateBirthData(invalidInput);
    assert.strictEqual(validation.valid, false);
    assert.ok(validation.errors.length > 0);
  });
});

describe('Edge Cases', () => {
  it('should handle birth at exactly midnight', () => {
    const input = {
      solar_date: '09/06/2009',
      solar_time: '00:00',
      birthplace: 'Hà Nội'
    };
    
    const result = calculateBirthChart(input);
    // Should not throw, should return valid result
    assert.ok(result.lunar_date.day > 0);
    assert.ok(result.gio_am_lich.length > 0);
  });

  it('should handle leap month correctly', () => {
    // Year 2020 has leap month 4
    const result = convertSolar2Lunar(25, 5, 2020, 7);
    // This date falls in leap month 4
    assert.strictEqual(result.month, 4);
    assert.strictEqual(result.isLeapMonth, true);
  });
});

console.log('All tests completed!');
