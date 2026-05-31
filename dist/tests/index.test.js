"use strict";
/**
 * Unit Tests for Lunar Calendar and Hour Conversion
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_test_1 = require("node:test");
const node_assert_1 = __importDefault(require("node:assert"));
const lunar_calendar_1 = require("../core/lunar-calendar");
const lunar_hour_1 = require("../core/lunar-hour");
const calculation_service_1 = require("../services/calculation-service");
(0, node_test_1.describe)('Lunar Calendar Conversion', () => {
    (0, node_test_1.it)('should convert solar date to lunar date correctly', () => {
        // Test case: 09/06/2009
        const result = (0, lunar_calendar_1.convertSolar2Lunar)(9, 6, 2009, 7);
        node_assert_1.default.strictEqual(result.day, 17);
        node_assert_1.default.strictEqual(result.month, 5);
        node_assert_1.default.strictEqual(result.year, 2009);
        node_assert_1.default.strictEqual(result.isLeapMonth, false);
    });
    (0, node_test_1.it)('should calculate Julian Day Number correctly', () => {
        // Test: 1/1/2000 should be JD 2451545
        const jd = (0, lunar_calendar_1.jdFromDate)(1, 1, 2000);
        node_assert_1.default.strictEqual(jd, 2451545);
    });
    (0, node_test_1.it)('should get correct year Can Chi', () => {
        // 2009 = Kỷ Sửu
        const result = (0, lunar_calendar_1.getYearCanChi)(2009);
        node_assert_1.default.strictEqual(result.stem, 'Kỷ');
        node_assert_1.default.strictEqual(result.branch, 'Sửu');
    });
    (0, node_test_1.it)('should get correct day Can Chi', () => {
        // Test with a known date
        const jd = (0, lunar_calendar_1.jdFromDate)(9, 6, 2009);
        const result = (0, lunar_calendar_1.getDayCanChi)(jd);
        // 09/06/2009 is Ất Dậu
        node_assert_1.default.strictEqual(result.stem, 'Ất');
        node_assert_1.default.strictEqual(result.branch, 'Dậu');
    });
});
(0, node_test_1.describe)('Lunar Hour Conversion (TuviGLOBAL Standard)', () => {
    (0, node_test_1.it)('should return Hợi for 23h03 in lunar month 5', () => {
        // Critical test case from requirements
        // 09/06/2009, 23h03, Month 5 AL → Hợi (22h10–24h10)
        // NOT Tý as most software incorrectly calculates
        const branch = (0, lunar_hour_1.getLunarHourBranch)(5, 23, 3);
        node_assert_1.default.strictEqual(branch, 'Hợi');
    });
    (0, node_test_1.it)('should handle giờ Tý spanning midnight in month 1', () => {
        // Month 1: Tý = 23h30 – 1h30
        const branch1 = (0, lunar_hour_1.getLunarHourBranch)(1, 23, 45);
        node_assert_1.default.strictEqual(branch1, 'Tý');
        const branch2 = (0, lunar_hour_1.getLunarHourBranch)(1, 0, 30);
        node_assert_1.default.strictEqual(branch2, 'Tý');
    });
    (0, node_test_1.it)('should handle transition warnings near boundary', () => {
        // Test near boundary (within 15 minutes)
        const result = (0, lunar_hour_1.calculateLunarHour)(1, 23, 35, 0);
        // Should have a warning since 23h35 is within 15 min of 23h30
        node_assert_1.default.ok(result.warning !== null || result.branch === 'Tý');
    });
    (0, node_test_1.it)('should have all 12 months defined in table', () => {
        for (let month = 1; month <= 12; month++) {
            node_assert_1.default.ok(lunar_hour_1.LUNAR_HOUR_TABLE[month], `Month ${month} should be defined`);
            node_assert_1.default.strictEqual(lunar_hour_1.LUNAR_HOUR_TABLE[month].length, 12, `Month ${month} should have 12 hours`);
        }
    });
});
(0, node_test_1.describe)('Timezone Normalization (Historical Vietnam)', () => {
    (0, node_test_1.it)('should subtract 1 hour for 1943-1945 period', () => {
        const date = new Date(1944, 5, 15, 10, 0); // 15/06/1944, 10:00
        const result = (0, lunar_hour_1.normalizeToHanoiTime)(date, 'Hà Nội');
        node_assert_1.default.strictEqual(result.adjustmentHours, -1);
        node_assert_1.default.strictEqual(result.adjustedDateTime.getHours(), 9);
    });
    (0, node_test_1.it)('should subtract 2 hours for Apr-Aug 1945', () => {
        const date = new Date(1945, 5, 15, 10, 0); // 15/06/1945, 10:00
        const result = (0, lunar_hour_1.normalizeToHanoiTime)(date, 'Hà Nội');
        node_assert_1.default.strictEqual(result.adjustmentHours, -2);
        node_assert_1.default.strictEqual(result.adjustedDateTime.getHours(), 8);
    });
    (0, node_test_1.it)('should subtract 1 hour for South Vietnam 1960-1975', () => {
        const date = new Date(1962, 5, 15, 7, 0); // 15/06/1962, 07:00
        const result = (0, lunar_hour_1.normalizeToHanoiTime)(date, 'Sài Gòn', true);
        node_assert_1.default.strictEqual(result.adjustmentHours, -1);
        node_assert_1.default.strictEqual(result.adjustedDateTime.getHours(), 6);
    });
    (0, node_test_1.it)('should not adjust for dates after 1975', () => {
        const date = new Date(1980, 5, 15, 10, 0);
        const result = (0, lunar_hour_1.normalizeToHanoiTime)(date, 'Hồ Chí Minh');
        node_assert_1.default.strictEqual(result.adjustmentHours, 0);
        node_assert_1.default.strictEqual(result.adjustedDateTime.getHours(), 10);
    });
});
(0, node_test_1.describe)('Calculation Service', () => {
    (0, node_test_1.it)('should calculate complete birth chart for example input', () => {
        const input = {
            solar_date: '09/06/2009',
            solar_time: '23:03',
            birthplace: 'Hồ Chí Minh'
        };
        const result = (0, calculation_service_1.calculateBirthChart)(input);
        // Verify lunar date
        node_assert_1.default.strictEqual(result.lunar_date.day, 17);
        node_assert_1.default.strictEqual(result.lunar_date.month, 5);
        node_assert_1.default.strictEqual(result.lunar_date.year, 2009);
        // Verify lunar hour - CRITICAL: Must be Hợi, NOT Tý
        node_assert_1.default.strictEqual(result.gio_am_lich, 'Hợi');
        // Verify hour range
        node_assert_1.default.ok(result.gio_range_used.includes('Tháng 5'));
        // Verify Can Chi
        node_assert_1.default.strictEqual(result.lunar_date.can_chi_year.stem, 'Kỷ');
        node_assert_1.default.strictEqual(result.lunar_date.can_chi_year.branch, 'Sửu');
    });
    (0, node_test_1.it)('should validate input correctly', () => {
        const validInput = {
            solar_date: '09/06/2009',
            solar_time: '23:03',
            birthplace: 'Hồ Chí Minh'
        };
        const validation = (0, calculation_service_1.validateBirthData)(validInput);
        node_assert_1.default.strictEqual(validation.valid, true);
        node_assert_1.default.strictEqual(validation.errors.length, 0);
    });
    (0, node_test_1.it)('should detect invalid input', () => {
        const invalidInput = {
            solar_date: 'invalid',
            solar_time: '23:03',
            birthplace: 'Hồ Chí Minh'
        };
        const validation = (0, calculation_service_1.validateBirthData)(invalidInput);
        node_assert_1.default.strictEqual(validation.valid, false);
        node_assert_1.default.ok(validation.errors.length > 0);
    });
});
(0, node_test_1.describe)('Edge Cases', () => {
    (0, node_test_1.it)('should handle birth at exactly midnight', () => {
        const input = {
            solar_date: '09/06/2009',
            solar_time: '00:00',
            birthplace: 'Hà Nội'
        };
        const result = (0, calculation_service_1.calculateBirthChart)(input);
        // Should not throw, should return valid result
        node_assert_1.default.ok(result.lunar_date.day > 0);
        node_assert_1.default.ok(result.gio_am_lich.length > 0);
    });
    (0, node_test_1.it)('should handle leap month correctly', () => {
        // Year 2020 has leap month 4
        const result = (0, lunar_calendar_1.convertSolar2Lunar)(25, 5, 2020, 7);
        // This date falls in leap month 4
        node_assert_1.default.strictEqual(result.month, 4);
        node_assert_1.default.strictEqual(result.isLeapMonth, true);
    });
});
console.log('All tests completed!');
//# sourceMappingURL=index.test.js.map