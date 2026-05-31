/**
 * Birth Data Input Interface
 */
export interface BirthDataInput {
    /** Solar date in format DD/MM/YYYY or Date object */
    solar_date: string | Date;
    /** Solar time in format HH:MM or number (hours) */
    solar_time: string | number;
    /** Birthplace name (e.g., "Hồ Chí Minh", "Hà Nội", "Miền Nam VN") */
    birthplace: string;
    /** Optional timezone override (hours from UTC) */
    timezone_override?: number | null;
    /** Gender for iztro compatibility */
    gender?: 'male' | 'female';
    /** Full name (optional, for display) */
    fullName?: string;
}
/**
 * Lunar Date Information
 */
export interface LunarDateInfo {
    day: number;
    month: number;
    year: number;
    isLeapMonth: boolean;
    can_chi_day: {
        stem: string;
        branch: string;
    };
    can_chi_month: {
        stem: string;
        branch: string;
    };
    can_chi_year: {
        stem: string;
        branch: string;
    };
    weekday: string;
}
/**
 * Timezone Adjustment Result
 */
export interface TimezoneAdjustmentResult {
    original_datetime: string;
    normalized_datetime: string;
    adjustment_hours: number;
    adjustment_reason: string | null;
}
/**
 * Complete calculation result
 */
export interface CalculationResult {
    /** Original solar datetime in GMT+7 */
    solar_datetime: string;
    /** Normalized datetime after timezone adjustment */
    normalized_datetime: string;
    /** Lunar date information */
    lunar_date: LunarDateInfo;
    /** Lunar hour (Earthly Branch) */
    gio_am_lich: string;
    /** Hour range used from the table */
    gio_range_used: string;
    /** Warning message if near transition point */
    warning: string | null;
    /** Timezone adjustment details */
    timezone_adjustment: TimezoneAdjustmentResult;
}
/**
 * Error response interface
 */
export interface ErrorResponse {
    error: string;
    code: string;
    details?: unknown;
}
//# sourceMappingURL=types.d.ts.map