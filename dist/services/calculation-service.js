"use strict";
/**
 * Calculation Service - Main business logic for Tử Vi calculation
 *
 * This service coordinates:
 * 1. Timezone normalization (historical Vietnam rules)
 * 2. Solar to lunar date conversion (Hồ Ngọc Đức algorithm)
 * 3. Lunar hour calculation (TuviGLOBAL standard)
 * 4. Integration with iztro for chart generation
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateBirthChart = calculateBirthChart;
exports.validateBirthData = validateBirthData;
const lunar_calendar_1 = require("../core/lunar-calendar");
const lunar_hour_1 = require("../core/lunar-hour");
/**
 * Parse solar date string (DD/MM/YYYY) to Date object
 */
function parseSolarDate(dateStr) {
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
function parseSolarTime(timeStr) {
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
function isSouthVietnam(birthplace) {
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
function formatDateTime(date) {
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
function calculateBirthChart(input) {
    // Step 1: Parse input date and time
    let solarDate;
    if (typeof input.solar_date === 'string') {
        solarDate = parseSolarDate(input.solar_date);
    }
    else {
        solarDate = input.solar_date;
    }
    let solarHours;
    let solarMinutes;
    if (typeof input.solar_time === 'string') {
        const time = parseSolarTime(input.solar_time);
        solarHours = time.hours;
        solarMinutes = time.minutes;
    }
    else {
        solarHours = Math.floor(input.solar_time);
        solarMinutes = Math.round((input.solar_time - solarHours) * 60);
    }
    // Create datetime object with time
    const originalDateTime = new Date(solarDate.getFullYear(), solarDate.getMonth(), solarDate.getDate(), solarHours, solarMinutes);
    // Step 2: Normalize to Hanoi timezone (GMT+7) based on historical rules
    const isSouth = isSouthVietnam(input.birthplace);
    const tzAdjustment = (0, lunar_hour_1.normalizeToHanoiTime)(originalDateTime, input.birthplace, isSouth);
    // Step 3: Extract normalized datetime components
    const normalizedDate = tzAdjustment.adjustedDateTime;
    const normYear = normalizedDate.getFullYear();
    const normMonth = normalizedDate.getMonth() + 1;
    const normDay = normalizedDate.getDate();
    const normHours = normalizedDate.getHours();
    const normMinutes = normalizedDate.getMinutes();
    // Step 4: Convert to lunar date using Hồ Ngọc Đức algorithm
    const lunarDate = (0, lunar_calendar_1.convertSolar2Lunar)(normDay, normMonth, normYear, 7);
    // Step 5: Calculate Can Chi for year, month, day
    const yearCanChi = (0, lunar_calendar_1.getYearCanChi)(lunarDate.year);
    const monthCanChi = (0, lunar_calendar_1.getMonthCanChi)(lunarDate.year, lunarDate.month);
    const jd = (0, lunar_calendar_1.jdFromDate)(normDay, normMonth, normYear);
    const dayCanChi = (0, lunar_calendar_1.getDayCanChi)(jd);
    const weekday = (0, lunar_calendar_1.getWeekday)(jd);
    // Step 6: Calculate lunar hour using TuviGLOBAL standard
    const dayStemIndex = lunar_hour_1.EARTHLY_BRANCHES.indexOf(dayCanChi.branch);
    const lunarHourResult = (0, lunar_hour_1.calculateLunarHour)(lunarDate.month, normHours, normMinutes, dayStemIndex >= 0 ? dayStemIndex : undefined);
    // Step 7: Build result object
    const lunarDateInfo = {
        day: lunarDate.day,
        month: lunarDate.month,
        year: lunarDate.year,
        isLeapMonth: lunarDate.isLeapMonth,
        can_chi_day: dayCanChi,
        can_chi_month: monthCanChi,
        can_chi_year: yearCanChi,
        weekday
    };
    const timezoneAdjustment = {
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
function validateBirthData(input) {
    const errors = [];
    // Validate solar_date
    if (!input.solar_date) {
        errors.push('Missing required field: solar_date');
    }
    else if (typeof input.solar_date === 'string') {
        try {
            parseSolarDate(input.solar_date);
        }
        catch (e) {
            errors.push(`Invalid solar_date: ${e.message}`);
        }
    }
    // Validate solar_time
    if (!input.solar_time) {
        errors.push('Missing required field: solar_time');
    }
    else if (typeof input.solar_time === 'string') {
        try {
            parseSolarTime(input.solar_time);
        }
        catch (e) {
            errors.push(`Invalid solar_time: ${e.message}`);
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
//# sourceMappingURL=calculation-service.js.map