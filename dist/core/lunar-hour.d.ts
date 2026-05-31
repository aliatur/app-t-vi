/**
 * Lunar Hour Conversion Engine - TuviGLOBAL Standard
 *
 * This module converts solar time to lunar hour (Can Chi) based on
 * the TuviGLOBAL standard, which accounts for the Earth's axial tilt
 * and the varying position of solar noon throughout the year.
 *
 * IMPORTANT: This is NOT the fixed 23h-1h method used by most software.
 * The start of each lunar hour shifts by month according to astronomical observations.
 */
/**
 * Heavenly Stems (Thiên Can) for hours
 */
export declare const HEAVENLY_STEMS: string[];
/**
 * Earthly Branches (Địa Chi) for hours - 12 branches
 */
export declare const EARTHLY_BRANCHES: string[];
/**
 * Lunar hour time ranges by month (TuviGLOBAL standard)
 * Times are in minutes from midnight (00:00)
 *
 * Note: Giờ Tý (Rat hour) spans across midnight into the next day
 */
export declare const LUNAR_HOUR_TABLE: Record<number, Array<{
    branch: string;
    start: number;
    end: number;
}>>;
/**
 * Time range descriptions for display purposes
 */
export declare const HOUR_RANGE_DESCRIPTIONS: Record<string, string>;
/**
 * Interface for timezone adjustment result
 */
export interface TimezoneAdjustment {
    originalDateTime: Date;
    adjustedDateTime: Date;
    adjustmentHours: number;
    reason: string | null;
}
/**
 * Interface for lunar hour result
 */
export interface LunarHourResult {
    branch: string;
    stem?: string;
    hourRange: string;
    warning: string | null;
}
/**
 * Normalize datetime to Hanoi timezone (GMT+7) based on historical Vietnam timezone rules
 *
 * @param dateTime - Input datetime (assumed to be in local timezone or specified timezone)
 * @param birthplace - Birthplace information (e.g., "Miền Nam VN", "Hồ Chí Minh", "Hà Nội")
 * @param isSouthVietnam - Whether birthplace is in South Vietnam (for 1960-1975 rule)
 * @returns Adjusted datetime and adjustment information
 */
export declare function normalizeToHanoiTime(dateTime: Date, birthplace: string, isSouthVietnam?: boolean): TimezoneAdjustment;
/**
 * Convert solar time (hours and minutes) to total minutes from midnight
 */
export declare function timeToMinutes(hours: number, minutes: number): number;
/**
 * Get lunar hour (Earthly Branch) from solar time and lunar month
 * Uses TuviGLOBAL standard table
 *
 * @param lunarMonth - Lunar month (1-12)
 * @param solarHours - Solar hour (0-23)
 * @param solarMinutes - Solar minutes (0-59)
 * @returns Lunar hour branch name
 */
export declare function getLunarHourBranch(lunarMonth: number, solarHours: number, solarMinutes: number): string;
/**
 * Get the heavenly stem for an hour based on the day's stem
 * Formula: If day stem is Giáp/Kỷ → hour stem starts with Giáp at Tý hour
 *
 * @param dayStemIndex - Index of day's heavenly stem (0-9)
 * @param hourBranchIndex - Index of hour's earthly branch (0-11)
 * @returns Heavenly stem for the hour
 */
export declare function getHourStem(dayStemIndex: number, hourBranchIndex: number): string;
/**
 * Check if time is near a transition point (within 15 minutes)
 *
 * @param lunarMonth - Lunar month (1-12)
 * @param solarHours - Solar hour (0-23)
 * @param solarMinutes - Solar minutes (0-59)
 * @returns Warning message if near transition, null otherwise
 */
export declare function checkTransitionWarning(lunarMonth: number, solarHours: number, solarMinutes: number): string | null;
/**
 * Format time range description for a lunar hour in a specific month
 */
export declare function formatHourRange(lunarMonth: number, branch: string): string;
/**
 * Complete lunar hour calculation with all details
 *
 * @param lunarMonth - Lunar month (1-12)
 * @param solarHours - Solar hour (0-23) in GMT+7
 * @param solarMinutes - Solar minutes (0-59)
 * @param dayStemIndex - Index of day's heavenly stem (0-9) for calculating hour stem
 * @returns Complete lunar hour information
 */
export declare function calculateLunarHour(lunarMonth: number, solarHours: number, solarMinutes: number, dayStemIndex?: number): LunarHourResult;
//# sourceMappingURL=lunar-hour.d.ts.map