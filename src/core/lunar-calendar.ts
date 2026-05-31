/**
 * Lunar Calendar Conversion Engine
 * Based on Hồ Ngọc Đức's algorithm (http://www.informatik.uni-leipzig.de/~duc/amlich/)
 * 
 * This module provides accurate conversion between solar and lunar dates
 * specifically optimized for Vietnamese timezone (GMT+7)
 */

/**
 * Integer division - returns floor of division
 */
function INT(x: number): number {
  return Math.floor(x);
}

/**
 * Convert solar date to Julian Day Number
 * @param dd - Day
 * @param mm - Month  
 * @param yy - Year
 * @returns Julian Day Number
 */
export function jdFromDate(dd: number, mm: number, yy: number): number {
  const a = INT((14 - mm) / 12);
  const y = yy + 4800 - a;
  const m = mm + 12 * a - 3;
  
  let jd = dd + INT((153 * m + 2) / 5) + 365 * y + INT(y / 4) - INT(y / 100) + INT(y / 400) - 32045;
  
  if (jd < 2299161) {
    // Julian calendar
    jd = dd + INT((153 * m + 2) / 5) + 365 * y + INT(y / 4) - 32083;
  }
  
  return jd;
}

/**
 * Convert Julian Day Number to solar date
 * @param jd - Julian Day Number
 * @returns Array [day, month, year]
 */
export function jdToDate(jd: number): [number, number, number] {
  let a: number, b: number, c: number, d: number, e: number, m: number;
  
  if (jd > 2299160) {
    // Gregorian calendar (after 5/10/1582)
    a = jd + 32044;
    b = INT((4 * a + 3) / 146097);
    c = a - INT((b * 146097) / 4);
  } else {
    b = 0;
    c = jd + 32082;
  }
  
  d = INT((4 * c + 3) / 1461);
  e = c - INT((1461 * d) / 4);
  m = INT((5 * e + 2) / 153);
  
  const day = e - INT((153 * m + 2) / 5) + 1;
  const month = m + 3 - 12 * INT(m / 10);
  const year = b * 100 + d - 4800 + INT(m / 10);
  
  return [day, month, year];
}

/**
 * Calculate the day of New Moon (Sóc) for month k since 1/1/1900
 * @param k - Month index from 1/1/1900
 * @param timeZone - Timezone offset in hours (7 for Vietnam)
 * @returns Julian Day Number of New Moon day
 */
export function getNewMoonDay(k: number, timeZone: number): number {
  const T = k / 1236.85; // Time in Julian centuries from 1900 January 0.5
  const T2 = T * T;
  const T3 = T2 * T;
  const dr = Math.PI / 180;
  
  let Jd1 = 2415020.75933 + 29.53058868 * k + 0.0001178 * T2 - 0.000000155 * T3;
  Jd1 += 0.00033 * Math.sin((166.56 + 132.87 * T - 0.009173 * T2) * dr); // Mean new moon
  
  const M = 359.2242 + 29.10535608 * k - 0.0000333 * T2 - 0.00000347 * T3; // Sun's mean anomaly
  const Mpr = 306.0253 + 385.81691806 * k + 0.0107306 * T2 + 0.00001236 * T3; // Moon's mean anomaly
  const F = 21.2964 + 390.67050646 * k - 0.0016528 * T2 - 0.00000239 * T3; // Moon's argument of latitude
  
  let C1 = (0.1734 - 0.000393 * T) * Math.sin(M * dr) + 0.0021 * Math.sin(2 * dr * M);
  C1 -= 0.4068 * Math.sin(Mpr * dr) + 0.0161 * Math.sin(dr * 2 * Mpr);
  C1 -= 0.0004 * Math.sin(dr * 3 * Mpr);
  C1 += 0.0104 * Math.sin(dr * 2 * F) - 0.0051 * Math.sin(dr * (M + Mpr));
  C1 -= 0.0074 * Math.sin(dr * (M - Mpr)) + 0.0004 * Math.sin(dr * (2 * F + M));
  C1 -= 0.0004 * Math.sin(dr * (2 * F - M)) - 0.0006 * Math.sin(dr * (2 * F + Mpr));
  C1 += 0.0010 * Math.sin(dr * (2 * F - Mpr)) + 0.0005 * Math.sin(dr * (2 * Mpr + M));
  
  let deltat: number;
  if (T < -11) {
    deltat = 0.001 + 0.000839 * T + 0.0002261 * T2 - 0.00000845 * T3 - 0.000000081 * T * T3;
  } else {
    deltat = -0.000278 + 0.000265 * T + 0.000262 * T2;
  }
  
  const JdNew = Jd1 + C1 - deltat;
  return INT(JdNew + 0.5 + timeZone / 24);
}

/**
 * Calculate sun longitude at given Julian Day Number
 * Returns the sector (0-11) of the ecliptic where the sun is located
 * @param jdn - Julian Day Number
 * @param timeZone - Timezone offset in hours
 * @returns Sector index (0-11)
 */
export function getSunLongitude(jdn: number, timeZone: number): number {
  const T = (jdn - 2451545.5 - timeZone / 24) / 36525; // Time in Julian centuries from 2000-01-01 12:00:00 GMT
  const T2 = T * T;
  const dr = Math.PI / 180; // degree to radian
  
  const M = 357.52910 + 35999.05030 * T - 0.0001559 * T2 - 0.00000048 * T * T2; // mean anomaly, degree
  let L0 = 280.46645 + 36000.76983 * T + 0.0003032 * T2; // mean longitude, degree
  
  let DL = (1.914600 - 0.004817 * T - 0.000014 * T2) * Math.sin(dr * M);
  DL += (0.019993 - 0.000101 * T) * Math.sin(dr * 2 * M) + 0.000290 * Math.sin(dr * 3 * M);
  
  let L = L0 + DL; // true longitude, degree
  L = L * dr;
  L = L - Math.PI * 2 * (INT(L / (Math.PI * 2))); // Normalize to (0, 2*PI)
  
  return INT(L / Math.PI * 6);
}

/**
 * Find the start day of lunar month 11 (month containing Winter Solstice) for a given year
 * @param yy - Solar year
 * @param timeZone - Timezone offset in hours
 * @returns Julian Day Number of the first day of lunar month 11
 */
export function getLunarMonth11(yy: number, timeZone: number): number {
  const off = jdFromDate(31, 12, yy) - 2415021;
  const k = INT(off / 29.530588853);
  let nm = getNewMoonDay(k, timeZone);
  let sunLong = getSunLongitude(nm, timeZone); // sun longitude at local midnight
  
  if (sunLong >= 9) {
    nm = getNewMoonDay(k - 1, timeZone);
  }
  
  return nm;
}

/**
 * Find the leap month offset after lunar month 11
 * @param a11 - Start day of lunar month 11 (Julian Day Number)
 * @param timeZone - Timezone offset in hours
 * @returns Position of leap month (0 if no leap month)
 */
export function getLeapMonthOffset(a11: number, timeZone: number): number {
  const k = INT((a11 - 2415021.076998695) / 29.530588853 + 0.5);
  let last = 0;
  let i = 1; // Start with the month following lunar month 11
  
  let arc = getSunLongitude(getNewMoonDay(k + i, timeZone), timeZone);
  
  do {
    last = arc;
    i++;
    arc = getSunLongitude(getNewMoonDay(k + i, timeZone), timeZone);
  } while (arc !== last && i < 14);
  
  return i - 1;
}

/**
 * Convert solar date to lunar date
 * @param dd - Solar day
 * @param mm - Solar month
 * @param yy - Solar year
 * @param timeZone - Timezone offset in hours (default: 7 for Vietnam)
 * @returns Object containing lunar date information
 */
export function convertSolar2Lunar(
  dd: number, 
  mm: number, 
  yy: number, 
  timeZone: number = 7
): {
  day: number;
  month: number;
  year: number;
  isLeapMonth: boolean;
} {
  const dayNumber = jdFromDate(dd, mm, yy);
  let k = INT((dayNumber - 2415021.076998695) / 29.530588853);
  let monthStart = getNewMoonDay(k + 1, timeZone);
  
  if (monthStart > dayNumber) {
    monthStart = getNewMoonDay(k, timeZone);
  }
  
  let a11 = getLunarMonth11(yy, timeZone);
  let b11 = a11;
  let lunarYear: number;
  
  if (a11 >= monthStart) {
    lunarYear = yy;
    a11 = getLunarMonth11(yy - 1, timeZone);
  } else {
    lunarYear = yy + 1;
    b11 = getLunarMonth11(yy + 1, timeZone);
  }
  
  const lunarDay = dayNumber - monthStart + 1;
  const diff = INT((monthStart - a11) / 29);
  let lunarLeap = 0;
  let lunarMonth = diff + 11;
  
  if (b11 - a11 > 365) {
    const leapMonthDiff = getLeapMonthOffset(a11, timeZone);
    if (diff >= leapMonthDiff) {
      lunarMonth = diff + 10;
      if (diff === leapMonthDiff) {
        lunarLeap = 1;
      }
    }
  }
  
  if (lunarMonth > 12) {
    lunarMonth = lunarMonth - 12;
  }
  
  if (lunarMonth >= 11 && diff < 4) {
    lunarYear -= 1;
  }
  
  return {
    day: lunarDay,
    month: lunarMonth,
    year: lunarYear,
    isLeapMonth: lunarLeap === 1
  };
}

/**
 * Convert lunar date to solar date
 * @param lunarDay - Lunar day
 * @param lunarMonth - Lunar month
 * @param lunarYear - Lunar year
 * @param isLeapMonth - Whether it's a leap month
 * @param timeZone - Timezone offset in hours (default: 7 for Vietnam)
 * @returns Array [day, month, year] or [0, 0, 0] if invalid
 */
export function convertLunar2Solar(
  lunarDay: number,
  lunarMonth: number,
  lunarYear: number,
  isLeapMonth: boolean = false,
  timeZone: number = 7
): [number, number, number] {
  let a11: number, b11: number;
  
  if (lunarMonth < 11) {
    a11 = getLunarMonth11(lunarYear - 1, timeZone);
    b11 = getLunarMonth11(lunarYear, timeZone);
  } else {
    a11 = getLunarMonth11(lunarYear, timeZone);
    b11 = getLunarMonth11(lunarYear + 1, timeZone);
  }
  
  let off = lunarMonth - 11;
  if (off < 0) {
    off += 12;
  }
  
  let leapOff = 0;
  let leapMonth = 0;
  
  if (b11 - a11 > 365) {
    leapOff = getLeapMonthOffset(a11, timeZone);
    leapMonth = leapOff - 2;
    if (leapMonth < 0) {
      leapMonth += 12;
    }
    
    if (isLeapMonth && lunarMonth !== leapMonth) {
      return [0, 0, 0];
    } else if (isLeapMonth || off >= leapOff) {
      off += 1;
    }
  }
  
  const k = INT(0.5 + (a11 - 2415021.076998695) / 29.530588853);
  const monthStart = getNewMoonDay(k + off, timeZone);
  return jdToDate(monthStart + lunarDay - 1);
}

/**
 * Get the Can Chi (Heavenly Stem and Earthly Branch) for a year
 * @param year - Solar year
 * @returns Object with stem and branch
 */
export function getYearCanChi(year: number): { stem: string; branch: string } {
  const stems = ['Giáp', 'Ất', 'Bính', 'Đinh', 'Mậu', 'Kỷ', 'Canh', 'Tân', 'Nhâm', 'Quý'];
  const branches = ['Tý', 'Sửu', 'Dần', 'Mão', 'Thìn', 'Tỵ', 'Ngọ', 'Mùi', 'Thân', 'Dậu', 'Tuất', 'Hợi'];
  
  const stemIndex = (year + 6) % 10;
  const branchIndex = (year + 8) % 12;
  
  return {
    stem: stems[stemIndex],
    branch: branches[branchIndex]
  };
}

/**
 * Get the Can Chi for a day based on Julian Day Number
 * @param jd - Julian Day Number
 * @returns Object with stem and branch
 */
export function getDayCanChi(jd: number): { stem: string; branch: string } {
  const stems = ['Giáp', 'Ất', 'Bính', 'Đinh', 'Mậu', 'Kỷ', 'Canh', 'Tân', 'Nhâm', 'Quý'];
  const branches = ['Tý', 'Sửu', 'Dần', 'Mão', 'Thìn', 'Tỵ', 'Ngọ', 'Mùi', 'Thân', 'Dậu', 'Tuất', 'Hợi'];
  
  const stemIndex = (jd + 9) % 10;
  const branchIndex = (jd + 1) % 12;
  
  return {
    stem: stems[stemIndex],
    branch: branches[branchIndex]
  };
}

/**
 * Get the Can Chi for a lunar month
 * @param lunarYear - Lunar year
 * @param lunarMonth - Lunar month (1-12)
 * @returns Object with stem and branch
 */
export function getMonthCanChi(lunarYear: number, lunarMonth: number): { stem: string; branch: string } {
  const stems = ['Giáp', 'Ất', 'Bính', 'Đinh', 'Mậu', 'Kỷ', 'Canh', 'Tân', 'Nhâm', 'Quý'];
  const branches = ['Dần', 'Mão', 'Thìn', 'Tỵ', 'Ngọ', 'Mùi', 'Thân', 'Dậu', 'Tuất', 'Hợi', 'Tý', 'Sửu'];
  
  // Month 1 = Dần, Month 2 = Mão, etc.
  const branchIndex = (lunarMonth - 1) % 12;
  
  // Stem calculation: (year * 12 + month + 3) % 10
  const stemIndex = (lunarYear * 12 + lunarMonth + 3) % 10;
  
  return {
    stem: stems[stemIndex],
    branch: branches[branchIndex]
  };
}

/**
 * Get the weekday from Julian Day Number
 * @param jd - Julian Day Number
 * @returns Weekday name in Vietnamese
 */
export function getWeekday(jd: number): string {
  const weekdays = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
  return weekdays[jd % 7];
}
