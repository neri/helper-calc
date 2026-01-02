export function estimateLoans(points: number, timeInMinutes: number, isDatetimeMode: boolean = false): { timeReward: number, loans: number, loanReward: number } {
    if (points < 0 || timeInMinutes < 0) {
        throw new Error('Invalid input: points and time must be non-negative');
    }

    const minMinutes = timeInMinutes;
    const maxMinutes = timeInMinutes + (isDatetimeMode ? 10 : 59);
    const loanPoints = 50000;

    // 推定貸出回数の下限を算出 (最小時間で計算)
    const loans = Math.floor((points - minMinutes * 20) / loanPoints);

    if (loans < 0) {
        throw new Error('貸出回数が負です');
    }

    // 時間報酬 = 獲得報酬 - (貸出回数 * 50000)
    const timeReward = points - (loans * loanPoints);

    // 貸出回数報酬 = 貸出回数 * 50000
    const loanReward = loans * loanPoints;

    // 下限貸出と入力時間から報酬の範囲を計算
    const maxReward = maxMinutes * 20 + loans * loanPoints;

    // 入力報酬が範囲内なら確定
    if (points <= maxReward) {
        return { timeReward, loans, loanReward };
    } else {
        throw new Error('獲得報酬の値が計算範囲外です');
    }
}