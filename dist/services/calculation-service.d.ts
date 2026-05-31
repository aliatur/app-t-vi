/**
 * Calculation Service - Main business logic for Tử Vi calculation
 *
 * This service coordinates:
 * 1. Timezone normalization (historical Vietnam rules)
 * 2. Solar to lunar date conversion (Hồ Ngọc Đức algorithm)
 * 3. Lunar hour calculation (TuviGLOBAL standard)
 * 4. Integration with iztro for chart generation
 */
import type { BirthDataInput, CalculationResult } from './types';
/**
 * Main calculation function
 *
 * @param input - Birth data input
 * @returns Complete calculation result
 */
export declare function calculateBirthChart(input: BirthDataInput): CalculationResult;
/**
 * Validate birth data input
 */
export declare function validateBirthData(input: BirthDataInput): {
    valid: boolean;
    errors: string[];
};
//# sourceMappingURL=calculation-service.d.ts.map