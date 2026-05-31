"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.HOUR_RANGE_DESCRIPTIONS = exports.LUNAR_HOUR_TABLE = exports.EARTHLY_BRANCHES = exports.HEAVENLY_STEMS = void 0;
exports.normalizeToHanoiTime = normalizeToHanoiTime;
exports.timeToMinutes = timeToMinutes;
exports.getLunarHourBranch = getLunarHourBranch;
exports.getHourStem = getHourStem;
exports.checkTransitionWarning = checkTransitionWarning;
exports.formatHourRange = formatHourRange;
exports.calculateLunarHour = calculateLunarHour;
/**
 * Integer division helper (same as in lunar-calendar.ts)
 */
function INT(x) {
    return Math.floor(x);
}
/**
 * Heavenly Stems (Thiên Can) for hours
 */
exports.HEAVENLY_STEMS = ['Giáp', 'Ất', 'Bính', 'Đinh', 'Mậu', 'Kỷ', 'Canh', 'Tân', 'Nhâm', 'Quý'];
/**
 * Earthly Branches (Địa Chi) for hours - 12 branches
 */
exports.EARTHLY_BRANCHES = ['Tý', 'Sửu', 'Dần', 'Mão', 'Thìn', 'Tỵ', 'Ngọ', 'Mùi', 'Thân', 'Dậu', 'Tuất', 'Hợi'];
/**
 * Lunar hour time ranges by month (TuviGLOBAL standard)
 * Times are in minutes from midnight (00:00)
 *
 * Note: Giờ Tý (Rat hour) spans across midnight into the next day
 */
exports.LUNAR_HOUR_TABLE = {
    // Tháng 1 âm lịch
    1: [
        { branch: 'Tý', start: 1410, end: 90 }, // 23h30 – 1h30 (next day)
        { branch: 'Sửu', start: 90, end: 210 }, // 1h30 – 3h30
        { branch: 'Dần', start: 210, end: 330 }, // 3h30 – 5h30
        { branch: 'Mão', start: 330, end: 450 }, // 5h30 – 7h30
        { branch: 'Thìn', start: 450, end: 570 }, // 7h30 – 9h30
        { branch: 'Tỵ', start: 570, end: 690 }, // 9h30 – 11h30
        { branch: 'Ngọ', start: 690, end: 810 }, // 11h30 – 13h30
        { branch: 'Mùi', start: 810, end: 930 }, // 13h30 – 15h30
        { branch: 'Thân', start: 930, end: 1050 }, // 15h30 – 17h30
        { branch: 'Dậu', start: 1050, end: 1170 }, // 17h30 – 19h30
        { branch: 'Tuất', start: 1170, end: 1290 }, // 19h30 – 21h30
        { branch: 'Hợi', start: 1290, end: 1410 } // 21h30 – 23h30
    ],
    // Tháng 2 âm lịch
    2: [
        { branch: 'Tý', start: 1420, end: 100 }, // 23h40 – 1h40
        { branch: 'Sửu', start: 100, end: 220 }, // 1h40 – 3h40
        { branch: 'Dần', start: 220, end: 340 }, // 3h40 – 5h40
        { branch: 'Mão', start: 340, end: 460 }, // 5h40 – 7h40
        { branch: 'Thìn', start: 460, end: 580 }, // 7h40 – 9h40
        { branch: 'Tỵ', start: 580, end: 700 }, // 9h40 – 11h40
        { branch: 'Ngọ', start: 700, end: 820 }, // 11h40 – 13h40
        { branch: 'Mùi', start: 820, end: 940 }, // 13h40 – 15h40
        { branch: 'Thân', start: 940, end: 1060 }, // 15h40 – 17h40
        { branch: 'Dậu', start: 1060, end: 1180 }, // 17h40 – 19h40
        { branch: 'Tuất', start: 1180, end: 1300 }, // 19h40 – 21h40
        { branch: 'Hợi', start: 1300, end: 1420 } // 21h40 – 23h40
    ],
    // Tháng 3 âm lịch
    3: [
        { branch: 'Tý', start: 1430, end: 110 }, // 23h50 – 1h50
        { branch: 'Sửu', start: 110, end: 230 }, // 1h50 – 3h50
        { branch: 'Dần', start: 230, end: 350 }, // 3h50 – 5h50
        { branch: 'Mão', start: 350, end: 470 }, // 5h50 – 7h50
        { branch: 'Thìn', start: 470, end: 590 }, // 7h50 – 9h50
        { branch: 'Tỵ', start: 590, end: 710 }, // 9h50 – 11h50
        { branch: 'Ngọ', start: 710, end: 830 }, // 11h50 – 13h50
        { branch: 'Mùi', start: 830, end: 950 }, // 13h50 – 15h50
        { branch: 'Thân', start: 950, end: 1070 }, // 15h50 – 17h50
        { branch: 'Dậu', start: 1070, end: 1190 }, // 17h50 – 19h50
        { branch: 'Tuất', start: 1190, end: 1310 }, // 19h50 – 21h50
        { branch: 'Hợi', start: 1310, end: 1430 } // 21h50 – 23h50
    ],
    // Tháng 4 âm lịch
    4: [
        { branch: 'Tý', start: 1440, end: 120 }, // 00h00 – 2h00 (midnight boundary)
        { branch: 'Sửu', start: 120, end: 240 }, // 2h00 – 4h00
        { branch: 'Dần', start: 240, end: 360 }, // 4h00 – 6h00
        { branch: 'Mão', start: 360, end: 480 }, // 6h00 – 8h00
        { branch: 'Thìn', start: 480, end: 600 }, // 8h00 – 10h00
        { branch: 'Tỵ', start: 600, end: 720 }, // 10h00 – 12h00
        { branch: 'Ngọ', start: 720, end: 840 }, // 12h00 – 14h00
        { branch: 'Mùi', start: 840, end: 960 }, // 14h00 – 16h00
        { branch: 'Thân', start: 960, end: 1080 }, // 16h00 – 18h00
        { branch: 'Dậu', start: 1080, end: 1200 }, // 18h00 – 20h00
        { branch: 'Tuất', start: 1200, end: 1320 }, // 20h00 – 22h00
        { branch: 'Hợi', start: 1320, end: 1440 } // 22h00 – 24h00
    ],
    // Tháng 5 âm lịch
    5: [
        { branch: 'Tý', start: 10, end: 130 }, // 00h10 – 2h10 (next day)
        { branch: 'Sửu', start: 130, end: 250 }, // 2h10 – 4h10
        { branch: 'Dần', start: 250, end: 370 }, // 4h10 – 6h10
        { branch: 'Mão', start: 370, end: 490 }, // 6h10 – 8h10
        { branch: 'Thìn', start: 490, end: 610 }, // 8h10 – 10h10
        { branch: 'Tỵ', start: 610, end: 730 }, // 10h10 – 12h10
        { branch: 'Ngọ', start: 730, end: 850 }, // 12h10 – 14h10
        { branch: 'Mùi', start: 850, end: 970 }, // 14h10 – 16h10
        { branch: 'Thân', start: 970, end: 1090 }, // 16h10 – 18h10
        { branch: 'Dậu', start: 1090, end: 1210 }, // 18h10 – 20h10
        { branch: 'Tuất', start: 1210, end: 1330 }, // 20h10 – 22h10
        { branch: 'Hợi', start: 1330, end: 1450 } // 22h10 – 24h10
    ],
    // Tháng 6 âm lịch
    6: [
        { branch: 'Tý', start: 1440, end: 120 }, // 00h00 – 2h00
        { branch: 'Sửu', start: 120, end: 240 }, // 2h00 – 4h00
        { branch: 'Dần', start: 240, end: 360 }, // 4h00 – 6h00
        { branch: 'Mão', start: 360, end: 480 }, // 6h00 – 8h00
        { branch: 'Thìn', start: 480, end: 600 }, // 8h00 – 10h00
        { branch: 'Tỵ', start: 600, end: 720 }, // 10h00 – 12h00
        { branch: 'Ngọ', start: 720, end: 840 }, // 12h00 – 14h00
        { branch: 'Mùi', start: 840, end: 960 }, // 14h00 – 16h00
        { branch: 'Thân', start: 960, end: 1080 }, // 16h00 – 18h00
        { branch: 'Dậu', start: 1080, end: 1200 }, // 18h00 – 20h00
        { branch: 'Tuất', start: 1200, end: 1320 }, // 20h00 – 22h00
        { branch: 'Hợi', start: 1320, end: 1440 } // 22h00 – 24h00
    ],
    // Tháng 7 âm lịch
    7: [
        { branch: 'Tý', start: 1430, end: 110 }, // 23h50 – 1h50
        { branch: 'Sửu', start: 110, end: 230 }, // 1h50 – 3h50
        { branch: 'Dần', start: 230, end: 350 }, // 3h50 – 5h50
        { branch: 'Mão', start: 350, end: 470 }, // 5h50 – 7h50
        { branch: 'Thìn', start: 470, end: 590 }, // 7h50 – 9h50
        { branch: 'Tỵ', start: 590, end: 710 }, // 9h50 – 11h50
        { branch: 'Ngọ', start: 710, end: 830 }, // 11h50 – 13h50
        { branch: 'Mùi', start: 830, end: 950 }, // 13h50 – 15h50
        { branch: 'Thân', start: 950, end: 1070 }, // 15h50 – 17h50
        { branch: 'Dậu', start: 1070, end: 1190 }, // 17h50 – 19h50
        { branch: 'Tuất', start: 1190, end: 1310 }, // 19h50 – 21h50
        { branch: 'Hợi', start: 1310, end: 1430 } // 21h50 – 23h50
    ],
    // Tháng 8 âm lịch
    8: [
        { branch: 'Tý', start: 1420, end: 100 }, // 23h40 – 1h40
        { branch: 'Sửu', start: 100, end: 220 }, // 1h40 – 3h40
        { branch: 'Dần', start: 220, end: 340 }, // 3h40 – 5h40
        { branch: 'Mão', start: 340, end: 460 }, // 5h40 – 7h40
        { branch: 'Thìn', start: 460, end: 580 }, // 7h40 – 9h40
        { branch: 'Tỵ', start: 580, end: 700 }, // 9h40 – 11h40
        { branch: 'Ngọ', start: 700, end: 820 }, // 11h40 – 13h40
        { branch: 'Mùi', start: 820, end: 940 }, // 13h40 – 15h40
        { branch: 'Thân', start: 940, end: 1060 }, // 15h40 – 17h40
        { branch: 'Dậu', start: 1060, end: 1180 }, // 17h40 – 19h40
        { branch: 'Tuất', start: 1180, end: 1300 }, // 19h40 – 21h40
        { branch: 'Hợi', start: 1300, end: 1420 } // 21h40 – 23h40
    ],
    // Tháng 9 âm lịch
    9: [
        { branch: 'Tý', start: 1410, end: 90 }, // 23h30 – 1h30
        { branch: 'Sửu', start: 90, end: 210 }, // 1h30 – 3h30
        { branch: 'Dần', start: 210, end: 330 }, // 3h30 – 5h30
        { branch: 'Mão', start: 330, end: 450 }, // 5h30 – 7h30
        { branch: 'Thìn', start: 450, end: 570 }, // 7h30 – 9h30
        { branch: 'Tỵ', start: 570, end: 690 }, // 9h30 – 11h30
        { branch: 'Ngọ', start: 690, end: 810 }, // 11h30 – 13h30
        { branch: 'Mùi', start: 810, end: 930 }, // 13h30 – 15h30
        { branch: 'Thân', start: 930, end: 1050 }, // 15h30 – 17h30
        { branch: 'Dậu', start: 1050, end: 1170 }, // 17h30 – 19h30
        { branch: 'Tuất', start: 1170, end: 1290 }, // 19h30 – 21h30
        { branch: 'Hợi', start: 1290, end: 1410 } // 21h30 – 23h30
    ],
    // Tháng 10 âm lịch
    10: [
        { branch: 'Tý', start: 1400, end: 80 }, // 23h20 – 1h20
        { branch: 'Sửu', start: 80, end: 200 }, // 1h20 – 3h20
        { branch: 'Dần', start: 200, end: 320 }, // 3h20 – 5h20
        { branch: 'Mão', start: 320, end: 440 }, // 5h20 – 7h20
        { branch: 'Thìn', start: 440, end: 560 }, // 7h20 – 9h20
        { branch: 'Tỵ', start: 560, end: 680 }, // 9h20 – 11h20
        { branch: 'Ngọ', start: 680, end: 800 }, // 11h20 – 13h20
        { branch: 'Mùi', start: 800, end: 920 }, // 13h20 – 15h20
        { branch: 'Thân', start: 920, end: 1040 }, // 15h20 – 17h20
        { branch: 'Dậu', start: 1040, end: 1160 }, // 17h20 – 19h20
        { branch: 'Tuất', start: 1160, end: 1280 }, // 19h20 – 21h20
        { branch: 'Hợi', start: 1280, end: 1400 } // 21h20 – 23h20
    ],
    // Tháng 11 âm lịch
    11: [
        { branch: 'Tý', start: 1390, end: 70 }, // 23h10 – 1h10
        { branch: 'Sửu', start: 70, end: 190 }, // 1h10 – 3h10
        { branch: 'Dần', start: 190, end: 310 }, // 3h10 – 5h10
        { branch: 'Mão', start: 310, end: 430 }, // 5h10 – 7h10
        { branch: 'Thìn', start: 430, end: 550 }, // 7h10 – 9h10
        { branch: 'Tỵ', start: 550, end: 670 }, // 9h10 – 11h10
        { branch: 'Ngọ', start: 670, end: 790 }, // 11h10 – 13h10
        { branch: 'Mùi', start: 790, end: 910 }, // 13h10 – 15h10
        { branch: 'Thân', start: 910, end: 1030 }, // 15h10 – 17h10
        { branch: 'Dậu', start: 1030, end: 1150 }, // 17h10 – 19h10
        { branch: 'Tuất', start: 1150, end: 1270 }, // 19h10 – 21h10
        { branch: 'Hợi', start: 1270, end: 1390 } // 21h10 – 23h10
    ],
    // Tháng 12 âm lịch
    12: [
        { branch: 'Tý', start: 1400, end: 80 }, // 23h20 – 1h20
        { branch: 'Sửu', start: 80, end: 200 }, // 1h20 – 3h20
        { branch: 'Dần', start: 200, end: 320 }, // 3h20 – 5h20
        { branch: 'Mão', start: 320, end: 440 }, // 5h20 – 7h20
        { branch: 'Thìn', start: 440, end: 560 }, // 7h20 – 9h20
        { branch: 'Tỵ', start: 560, end: 680 }, // 9h20 – 11h20
        { branch: 'Ngọ', start: 680, end: 800 }, // 11h20 – 13h20
        { branch: 'Mùi', start: 800, end: 920 }, // 13h20 – 15h20
        { branch: 'Thân', start: 920, end: 1040 }, // 15h20 – 17h20
        { branch: 'Dậu', start: 1040, end: 1160 }, // 17h20 – 19h20
        { branch: 'Tuất', start: 1160, end: 1280 }, // 19h20 – 21h20
        { branch: 'Hợi', start: 1280, end: 1400 } // 21h20 – 23h20
    ]
};
/**
 * Time range descriptions for display purposes
 */
exports.HOUR_RANGE_DESCRIPTIONS = {
    'Tý': '23hXX – 1hXX (ngày hôm sau)',
    'Sửu': '1hXX – 3hXX',
    'Dần': '3hXX – 5hXX',
    'Mão': '5hXX – 7hXX',
    'Thìn': '7hXX – 9hXX',
    'Tỵ': '9hXX – 11hXX',
    'Ngọ': '11hXX – 13hXX',
    'Mùi': '13hXX – 15hXX',
    'Thân': '15hXX – 17hXX',
    'Dậu': '17hXX – 19hXX',
    'Tuất': '19hXX – 21hXX',
    'Hợi': '21hXX – 23hXX'
};
/**
 * Normalize datetime to Hanoi timezone (GMT+7) based on historical Vietnam timezone rules
 *
 * @param dateTime - Input datetime (assumed to be in local timezone or specified timezone)
 * @param birthplace - Birthplace information (e.g., "Miền Nam VN", "Hồ Chí Minh", "Hà Nội")
 * @param isSouthVietnam - Whether birthplace is in South Vietnam (for 1960-1975 rule)
 * @returns Adjusted datetime and adjustment information
 */
function normalizeToHanoiTime(dateTime, birthplace, isSouthVietnam) {
    const birthDate = dateTime;
    const year = birthDate.getFullYear();
    const month = birthDate.getMonth() + 1;
    const day = birthDate.getDate();
    let adjustmentHours = 0;
    let reason = null;
    // Create a copy to avoid mutating the original
    const adjusted = new Date(dateTime.getTime());
    // Historical timezone adjustments for Vietnam
    const startDate = new Date(year, month - 1, day);
    // Before 01/01/1943: GMT+7 (no adjustment)
    // 01/01/1943 → 31/03/1945: GMT+8 (subtract 1 hour)
    const period2Start = new Date(1943, 0, 1);
    const period2End = new Date(1945, 2, 31);
    // 01/04/1945 → 18/08/1945: GMT+9 (subtract 2 hours)
    const period3Start = new Date(1945, 3, 1);
    const period3End = new Date(1945, 7, 18);
    // 19/08/1945 → 31/12/1959: GMT+7 (no adjustment)
    // 01/01/1960 → 30/04/1975 (only South Vietnam): GMT+8 (subtract 1 hour)
    const period5Start = new Date(1960, 0, 1);
    const period5End = new Date(1975, 3, 30);
    // From 01/05/1975 onwards: GMT+7 (no adjustment)
    if (startDate >= period2Start && startDate <= period2End) {
        adjustmentHours = -1;
        reason = 'Giai đoạn 01/01/1943 – 31/03/1945: GMT+8 → GMT+7';
    }
    else if (startDate >= period3Start && startDate <= period3End) {
        adjustmentHours = -2;
        reason = 'Giai đoạn 01/04/1945 – 18/08/1945: GMT+9 → GMT+7';
    }
    else if (isSouthVietnam && startDate >= period5Start && startDate <= period5End) {
        adjustmentHours = -1;
        reason = 'Miền Nam VN 01/01/1960 – 30/04/1975: GMT+8 → GMT+7';
    }
    if (adjustmentHours !== 0) {
        adjusted.setHours(adjusted.getHours() + adjustmentHours);
    }
    return {
        originalDateTime: dateTime,
        adjustedDateTime: adjusted,
        adjustmentHours,
        reason
    };
}
/**
 * Convert solar time (hours and minutes) to total minutes from midnight
 */
function timeToMinutes(hours, minutes) {
    return hours * 60 + minutes;
}
/**
 * Get lunar hour (Earthly Branch) from solar time and lunar month
 * Uses TuviGLOBAL standard table
 *
 * @param lunarMonth - Lunar month (1-12)
 * @param solarHours - Solar hour (0-23)
 * @param solarMinutes - Solar minutes (0-59)
 * @returns Lunar hour branch name
 */
function getLunarHourBranch(lunarMonth, solarHours, solarMinutes) {
    const table = exports.LUNAR_HOUR_TABLE[lunarMonth];
    if (!table) {
        throw new Error(`Invalid lunar month: ${lunarMonth}`);
    }
    const totalMinutes = timeToMinutes(solarHours, solarMinutes);
    // Handle midnight (0:0) - it belongs to the last hour of the previous day
    // In the TuviGLOBAL system, the last hour (Hợi) typically extends past 24h
    if (totalMinutes === 0) {
        // Find the hour that contains midnight (the one whose end > 1440 or wraps around)
        for (const entry of table) {
            if (entry.start > entry.end) {
                // This hour spans midnight
                if (0 < entry.end) {
                    return entry.branch;
                }
            }
            else if (entry.end > 1440) {
                // Hour extends past 24h (like Hợi in month 5: 22h10 - 24h10)
                return entry.branch;
            }
        }
        // Fallback: return the last hour in the table
        return table[table.length - 1].branch;
    }
    for (const entry of table) {
        // Handle special case: hours that span across midnight (like giờ Tý)
        if (entry.start > entry.end) {
            // This hour spans midnight (e.g., 23h30 to 1h30, or 22h10 to 24h10)
            // Check if we're in the range considering the wrap-around
            if (totalMinutes >= entry.start || totalMinutes < entry.end) {
                return entry.branch;
            }
        }
        else {
            // Normal case: hour doesn't span midnight
            if (totalMinutes >= entry.start && totalMinutes < entry.end) {
                return entry.branch;
            }
        }
    }
    throw new Error(`Cannot determine lunar hour for ${solarHours}:${solarMinutes} in lunar month ${lunarMonth}`);
}
/**
 * Get the heavenly stem for an hour based on the day's stem
 * Formula: If day stem is Giáp/Kỷ → hour stem starts with Giáp at Tý hour
 *
 * @param dayStemIndex - Index of day's heavenly stem (0-9)
 * @param hourBranchIndex - Index of hour's earthly branch (0-11)
 * @returns Heavenly stem for the hour
 */
function getHourStem(dayStemIndex, hourBranchIndex) {
    // Starting stem for Tý hour based on day stem
    // Giáp, Kỷ days: Tý hour = Giáp
    // Ất, Canh days: Tý hour = Bính
    // Bính, Tân days: Tý hour = Mậu
    // Đinh, Nhâm days: Tý hour = Canh
    // Mậu, Quý days: Tý hour = Nhâm
    let tyHourStemIndex;
    if (dayStemIndex === 0 || dayStemIndex === 5) { // Giáp or Kỷ
        tyHourStemIndex = 0; // Giáp
    }
    else if (dayStemIndex === 1 || dayStemIndex === 6) { // Ất or Canh
        tyHourStemIndex = 2; // Bính
    }
    else if (dayStemIndex === 2 || dayStemIndex === 7) { // Bính or Tân
        tyHourStemIndex = 4; // Mậu
    }
    else if (dayStemIndex === 3 || dayStemIndex === 8) { // Đinh or Nhâm
        tyHourStemIndex = 6; // Canh
    }
    else { // Mậu or Quý (4 or 9)
        tyHourStemIndex = 8; // Nhâm
    }
    // Calculate stem for the given hour branch
    const stemIndex = (tyHourStemIndex + hourBranchIndex) % 10;
    return exports.HEAVENLY_STEMS[stemIndex];
}
/**
 * Check if time is near a transition point (within 15 minutes)
 *
 * @param lunarMonth - Lunar month (1-12)
 * @param solarHours - Solar hour (0-23)
 * @param solarMinutes - Solar minutes (0-59)
 * @returns Warning message if near transition, null otherwise
 */
function checkTransitionWarning(lunarMonth, solarHours, solarMinutes) {
    const table = exports.LUNAR_HOUR_TABLE[lunarMonth];
    if (!table)
        return null;
    const totalMinutes = timeToMinutes(solarHours, solarMinutes);
    const threshold = 15; // 15 minutes threshold
    for (let i = 0; i < table.length; i++) {
        const entry = table[i];
        const prevEntry = table[i > 0 ? i - 1 : table.length - 1];
        // Check if near start of current hour
        let distanceToStart;
        if (entry.start >= 23 * 60 && totalMinutes < entry.start) {
            // Crossing midnight
            distanceToStart = (24 * 60 - entry.start) + totalMinutes;
        }
        else {
            distanceToStart = Math.abs(totalMinutes - entry.start);
        }
        // Check if near end of current hour
        let distanceToEnd;
        if (entry.end === 0 && totalMinutes > 23 * 60) {
            // Crossing midnight
            distanceToEnd = totalMinutes + (24 * 60 - entry.end);
        }
        else {
            distanceToEnd = Math.abs(totalMinutes - entry.end);
        }
        if (distanceToStart <= threshold) {
            const prevBranch = prevEntry.branch;
            return `Giờ sinh nằm gần giao điểm chuyển giờ, có thể thuộc giờ ${prevBranch} hoặc ${entry.branch}. Cần xác minh lại bằng đối chiếu sự kiện thực tế.`;
        }
        if (distanceToEnd <= threshold) {
            const nextEntry = table[(i + 1) % table.length];
            return `Giờ sinh nằm gần giao điểm chuyển giờ, có thể thuộc giờ ${entry.branch} hoặc ${nextEntry.branch}. Cần xác minh lại bằng đối chiếu sự kiện thực tế.`;
        }
    }
    return null;
}
/**
 * Format time range description for a lunar hour in a specific month
 */
function formatHourRange(lunarMonth, branch) {
    const table = exports.LUNAR_HOUR_TABLE[lunarMonth];
    if (!table)
        return '';
    const entry = table.find(e => e.branch === branch);
    if (!entry)
        return '';
    const formatTime = (minutes) => {
        if (minutes === 1440 || minutes === 0)
            return '24h00';
        const h = Math.floor(minutes / 60);
        const m = minutes % 60;
        return `${h.toString().padStart(2, '0')}h${m.toString().padStart(2, '0')}`;
    };
    if (entry.start >= 23 * 60) {
        // Spans midnight
        return `${formatTime(entry.start)} – ${formatTime(entry.end)} (Tháng ${lunarMonth} âm lịch)`;
    }
    return `${formatTime(entry.start)} – ${formatTime(entry.end)} (Tháng ${lunarMonth} âm lịch)`;
}
/**
 * Complete lunar hour calculation with all details
 *
 * @param lunarMonth - Lunar month (1-12)
 * @param solarHours - Solar hour (0-23) in GMT+7
 * @param solarMinutes - Solar minutes (0-59)
 * @param dayStemIndex - Index of day's heavenly stem (0-9) for calculating hour stem
 * @returns Complete lunar hour information
 */
function calculateLunarHour(lunarMonth, solarHours, solarMinutes, dayStemIndex) {
    const branch = getLunarHourBranch(lunarMonth, solarHours, solarMinutes);
    const hourRange = formatHourRange(lunarMonth, branch);
    const warning = checkTransitionWarning(lunarMonth, solarHours, solarMinutes);
    let stem;
    if (dayStemIndex !== undefined) {
        const branchIndex = exports.EARTHLY_BRANCHES.indexOf(branch);
        stem = getHourStem(dayStemIndex, branchIndex);
    }
    return {
        branch,
        stem,
        hourRange,
        warning
    };
}
//# sourceMappingURL=lunar-hour.js.map