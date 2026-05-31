/**
 * Calculation Service - Main business logic for Tử Vi calculation
 * 
 * This service coordinates:
 * 1. Timezone normalization (historical Vietnam rules)
 * 2. Solar to lunar date conversion (Hồ Ngọc Đức algorithm)
 * 3. Lunar hour calculation (TuviGLOBAL standard)
 * 4. Integration with iztro for chart generation
 */

import {
  convertSolar2Lunar,
  jdFromDate,
  getDayCanChi,
  getMonthCanChi,
  getYearCanChi,
  getWeekday
} from '../core/lunar-calendar';

import {
  normalizeToHanoiTime,
  calculateLunarHour,
  EARTHLY_BRANCHES
} from '../core/lunar-hour';

import type {
  BirthDataInput,
  CalculationResult,
  LunarDateInfo,
  TimezoneAdjustmentResult
} from './types';

/**
 * Parse solar date string (DD/MM/YYYY) to Date object
 */
function parseSolarDate(dateStr: string): Date {
  const parts = dateStr.split('/');
  if (parts.length !== 3) {
    throw new Error(`Invalid date format: ${dateStr}. Expected DD/MM/YYYY`);
  }
  
  const day = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10);
  const year = parseInt(parts[2], 10);
  
  if (isNaN(day) || isNaN(month) || isNaN(year)) {
    throw new Error(`Invalid date values: ${dateStr}`);
  }
  
  return new Date(year, month - 1, day);
}

/**
 * Parse solar time string (HH:MM) to hours and minutes
 */
function parseSolarTime(timeStr: string): { hours: number; minutes: number } {
  const parts = timeStr.split(':');
  if (parts.length !== 2) {
    throw new Error(`Invalid time format: ${timeStr}. Expected HH:MM`);
  }
  
  const hours = parseInt(parts[0], 10);
  const minutes = parseInt(parts[1], 10);
  
  if (isNaN(hours) || isNaN(minutes)) {
    throw new Error(`Invalid time values: ${timeStr}`);
  }
  
  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
    throw new Error(`Invalid time: ${timeStr}. Hours must be 0-23, minutes 0-59`);
  }
  
  return { hours, minutes };
}

/**
 * Check if birthplace is in South Vietnam (for 1960-1975 timezone rule)
 */
function isSouthVietnam(birthplace: string): boolean {
  const southKeywords = [
    'miền nam', 'sài gòn', 'hồ chí minh', 'chí minh',
    'cần thơ', 'đà lạt', 'biên hòa', 'vũng tàu',
    'an giang', 'bà rịa', 'bạc liêu', 'bến tre',
    'cà mau', 'châu đốc', 'đồng nai', 'đồng tháp',
    'hậu giang', 'kiên giang', 'long an', 'minh hải',
    'tiền giang', 'trà vinh', 'vĩnh long', 'tây ninh',
    'khánh hòa', 'ninh thuận', 'bình thuận',
    'gia lai', 'kon tum', 'đắk lắk', 'lâm đồng'
  ];
  
  const normalized = birthplace.toLowerCase();
  return southKeywords.some(keyword => normalized.includes(keyword));
}

/**
 * Format datetime to string
 */
function formatDateTime(date: Date): string {
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  
  return `${day}/${month}/${year} ${hours}:${minutes}`;
}

/**
 * Main calculation function
 * 
 * @param input - Birth data input
 * @returns Complete calculation result
 */
export function calculateBirthChart(input: BirthDataInput): CalculationResult {
  // Step 1: Parse input date and time
  let solarDate: Date;
  if (typeof input.solar_date === 'string') {
    solarDate = parseSolarDate(input.solar_date);
  } else {
    solarDate = input.solar_date;
  }
  
  let solarHours: number;
  let solarMinutes: number;
  if (typeof input.solar_time === 'string') {
    const time = parseSolarTime(input.solar_time);
    solarHours = time.hours;
    solarMinutes = time.minutes;
  } else {
    solarHours = Math.floor(input.solar_time);
    solarMinutes = Math.round((input.solar_time - solarHours) * 60);
  }
  
  // Create datetime object with time
  const originalDateTime = new Date(
    solarDate.getFullYear(),
    solarDate.getMonth(),
    solarDate.getDate(),
    solarHours,
    solarMinutes
  );
  
  // Step 2: Normalize to Hanoi timezone (GMT+7) based on historical rules
  const isSouth = isSouthVietnam(input.birthplace);
  const tzAdjustment = normalizeToHanoiTime(originalDateTime, input.birthplace, isSouth);
  
  // Step 3: Extract normalized datetime components
  const normalizedDate = tzAdjustment.adjustedDateTime;
  const normYear = normalizedDate.getFullYear();
  const normMonth = normalizedDate.getMonth() + 1;
  const normDay = normalizedDate.getDate();
  const normHours = normalizedDate.getHours();
  const normMinutes = normalizedDate.getMinutes();
  
  // Step 4: Convert to lunar date using Hồ Ngọc Đức algorithm
  const lunarDate = convertSolar2Lunar(normDay, normMonth, normYear, 7);
  
  // Step 5: Calculate Can Chi for year, month, day
  const yearCanChi = getYearCanChi(lunarDate.year);
  const monthCanChi = getMonthCanChi(lunarDate.year, lunarDate.month);
  const jd = jdFromDate(normDay, normMonth, normYear);
  const dayCanChi = getDayCanChi(jd);
  const weekday = getWeekday(jd);
  
  // Step 6: Calculate lunar hour using TuviGLOBAL standard
  const dayStemIndex = EARTHLY_BRANCHES.indexOf(dayCanChi.branch);
  const lunarHourResult = calculateLunarHour(
    lunarDate.month,
    normHours,
    normMinutes,
    dayStemIndex >= 0 ? dayStemIndex : undefined
  );
  
  // Step 7: Build result object
  const lunarDateInfo: LunarDateInfo = {
    day: lunarDate.day,
    month: lunarDate.month,
    year: lunarDate.year,
    isLeapMonth: lunarDate.isLeapMonth,
    can_chi_day: dayCanChi,
    can_chi_month: monthCanChi,
    can_chi_year: yearCanChi,
    weekday
  };
  
  const timezoneAdjustment: TimezoneAdjustmentResult = {
    original_datetime: formatDateTime(originalDateTime),
    normalized_datetime: formatDateTime(tzAdjustment.adjustedDateTime),
    adjustment_hours: tzAdjustment.adjustmentHours,
    adjustment_reason: tzAdjustment.reason
  };
  
  return {
    solar_datetime: formatDateTime(originalDateTime),
    normalized_datetime: formatDateTime(tzAdjustment.adjustedDateTime),
    lunar_date: lunarDateInfo,
    gio_am_lich: lunarHourResult.branch,
    gio_range_used: lunarHourResult.hourRange,
    warning: lunarHourResult.warning,
    timezone_adjustment: timezoneAdjustment
  };
}

/**
 * Validate birth data input
 */
export function validateBirthData(input: BirthDataInput): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Validate solar_date
  if (!input.solar_date) {
    errors.push('Missing required field: solar_date');
  } else if (typeof input.solar_date === 'string') {
    try {
      parseSolarDate(input.solar_date);
    } catch (e) {
      errors.push(`Invalid solar_date: ${(e as Error).message}`);
    }
  }
  
  // Validate solar_time
  if (!input.solar_time) {
    errors.push('Missing required field: solar_time');
  } else if (typeof input.solar_time === 'string') {
    try {
      parseSolarTime(input.solar_time);
    } catch (e) {
      errors.push(`Invalid solar_time: ${(e as Error).message}`);
    }
  }
  
  // Validate birthplace
  if (!input.birthplace) {
    errors.push('Missing required field: birthplace');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}
