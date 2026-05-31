/**
 * Lunar Calendar Conversion Engine
 * Based on Hồ Ngọc Đức's algorithm (http://www.informatik.uni-leipzig.de/~duc/amlich/)
 *
 * This module provides accurate conversion between solar and lunar dates
 * specifically optimized for Vietnamese timezone (GMT+7)
 */
/**
 * Convert solar date to Julian Day Number
 * @param dd - Day
 * @param mm - Month
 * @param yy - Year
 * @returns Julian Day Number
 */
export declare function jdFromDate(dd: number, mm: number, yy: number): number;
/**
 * Convert Julian Day Number to solar date
 * @param jd - Julian Day Number
 * @returns Array [day, month, year]
 */
export declare function jdToDate(jd: number): [number, number, number];
/**
 * Calculate the day of New Moon (Sóc) for month k since 1/1/1900
 * @param k - Month index from 1/1/1900
 * @param timeZone - Timezone offset in hours (7 for Vietnam)
 * @returns Julian Day Number of New Moon day
 */
export declare function getNewMoonDay(k: number, timeZone: number): number;
/**
 * Calculate sun longitude at given Julian Day Number
 * Returns the sector (0-11) of the ecliptic where the sun is located
 * @param jdn - Julian Day Number
 * @param timeZone - Timezone offset in hours
 * @returns Sector index (0-11)
 */
export declare function getSunLongitude(jdn: number, timeZone: number): number;
/**
 * Find the start day of lunar month 11 (month containing Winter Solstice) for a given year
 * @param yy - Solar year
 * @param timeZone - Timezone offset in hours
 * @returns Julian Day Number of the first day of lunar month 11
 */
export declare function getLunarMonth11(yy: number, timeZone: number): number;
/**
 * Find the leap month offset after lunar month 11
 * @param a11 - Start day of lunar month 11 (Julian Day Number)
 * @param timeZone - Timezone offset in hours
 * @returns Position of leap month (0 if no leap month)
 */
export declare function getLeapMonthOffset(a11: number, timeZone: number): number;
/**
 * Convert solar date to lunar date
 * @param dd - Solar day
 * @param mm - Solar month
 * @param yy - Solar year
 * @param timeZone - Timezone offset in hours (default: 7 for Vietnam)
 * @returns Object containing lunar date information
 */
export declare function convertSolar2Lunar(dd: number, mm: number, yy: number, timeZone?: number): {
    day: number;
    month: number;
    year: number;
    isLeapMonth: boolean;
};
/**
 * Convert lunar date to solar date
 * @param lunarDay - Lunar day
 * @param lunarMonth - Lunar month
 * @param lunarYear - Lunar year
 * @param isLeapMonth - Whether it's a leap month
 * @param timeZone - Timezone offset in hours (default: 7 for Vietnam)
 * @returns Array [day, month, year] or [0, 0, 0] if invalid
 */
export declare function convertLunar2Solar(lunarDay: number, lunarMonth: number, lunarYear: number, isLeapMonth?: boolean, timeZone?: number): [number, number, number];
/**
 * Get the Can Chi (Heavenly Stem and Earthly Branch) for a year
 * @param year - Solar year
 * @returns Object with stem and branch
 */
export declare function getYearCanChi(year: number): {
    stem: string;
    branch: string;
};
/**
 * Get the Can Chi for a day based on Julian Day Number
 * @param jd - Julian Day Number
 * @returns Object with stem and branch
 */
export declare function getDayCanChi(jd: number): {
    stem: string;
    branch: string;
};
/**
 * Get the Can Chi for a lunar month
 * @param lunarYear - Lunar year
 * @param lunarMonth - Lunar month (1-12)
 * @returns Object with stem and branch
 */
export declare function getMonthCanChi(lunarYear: number, lunarMonth: number): {
    stem: string;
    branch: string;
};
/**
 * Get the weekday from Julian Day Number
 * @param jd - Julian Day Number
 * @returns Weekday name in Vietnamese
 */
export declare function getWeekday(jd: number): string;
//# sourceMappingURL=lunar-calendar.d.ts.map