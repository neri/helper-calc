/**
 * アプリ全体のローカルストレージ管理
 * このファイルで、すべてのストレージキーと操作を一元管理する
 */

/**
 * ストレージキーの定数定義
 */
export const STORAGE_KEYS = {
    // メインアプリ (App)
    CURRENT_APP: 'app-current-app',

    // サブアプリ: 助っ人貸出回数計算機 (HelperCalcApp)
    HELPER_CALC_INPUT_MODE: 'helper-calc-input-mode',
    HELPER_CALC_HOURS: 'helper-calc-hours',
    HELPER_CALC_DATETIME: 'helper-calc-datetime',

    // サブアプリ: 対抗戦順位計算機 (TacticalRankCalcApp)
    TACTICAL_RANK_CALC_RANK: 'tactical-rank-calc-rank',
    TACTICAL_RANK_CALC_ITERATIONS: 'tactical-rank-calc-iterations'
} as const;

/**
 * ストレージマネージャー
 */
export const StorageManager = {
    // ===== メインアプリ =====
    getCurrentApp(): string {
        return localStorage.getItem(STORAGE_KEYS.CURRENT_APP) || 'calculator';
    },

    setCurrentApp(appName: string): void {
        localStorage.setItem(STORAGE_KEYS.CURRENT_APP, appName);
    },

    // ===== 助っ人貸出回数計算機 =====
    getHelperCalcInputMode(): string {
        return localStorage.getItem(STORAGE_KEYS.HELPER_CALC_INPUT_MODE) || 'hours';
    },

    setHelperCalcInputMode(mode: string): void {
        localStorage.setItem(STORAGE_KEYS.HELPER_CALC_INPUT_MODE, mode);
    },

    getHelperCalcHours(): string {
        return localStorage.getItem(STORAGE_KEYS.HELPER_CALC_HOURS) || '';
    },

    setHelperCalcHours(hours: string): void {
        localStorage.setItem(STORAGE_KEYS.HELPER_CALC_HOURS, hours);
    },

    getHelperCalcDatetime(): string {
        return localStorage.getItem(STORAGE_KEYS.HELPER_CALC_DATETIME) || '';
    },

    setHelperCalcDatetime(datetime: string): void {
        localStorage.setItem(STORAGE_KEYS.HELPER_CALC_DATETIME, datetime);
    },

    // ===== 対抗戦順位計算機 =====
    getTacticalRankCalcRank(): number | null {
        const rank = localStorage.getItem(STORAGE_KEYS.TACTICAL_RANK_CALC_RANK);
        return rank ? parseInt(rank, 10) : null;
    },

    setTacticalRankCalcRank(rank: number): void {
        localStorage.setItem(STORAGE_KEYS.TACTICAL_RANK_CALC_RANK, rank.toString());
    },

    getTacticalRankCalcIterations(): number {
        const iterations = localStorage.getItem(STORAGE_KEYS.TACTICAL_RANK_CALC_ITERATIONS);
        return iterations ? parseInt(iterations, 10) : 5;
    },

    setTacticalRankCalcIterations(iterations: number): void {
        localStorage.setItem(STORAGE_KEYS.TACTICAL_RANK_CALC_ITERATIONS, iterations.toString());
    }
} as const;