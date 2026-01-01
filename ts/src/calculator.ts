export function estimateLoans(points: number, hours: number): { timeReward: number, loans: number, loanReward: number } {
    if (points < 0 || hours < 0) {
        throw new Error('Invalid input: points and hours must be non-negative');
    }

    const minMinutes = hours * 60;
    const maxMinutes = hours * 60 + 59;
    const loanPoints = 50000;

    // 推定貸出回数の下限を算出 (最小時間で計算)
    const loans = Math.max(0, Math.floor((points - minMinutes * 20) / loanPoints));

    // 時間報酬 = 獲得報酬 - (貸出回数 * 50000)
    const timeReward = points - (loans * loanPoints);

    // 貸出回数報酬 = 貸出回数 * 50000
    const loanReward = loans * loanPoints;

    // 下限貸出と入力時間から報酬の範囲を計算
    const minReward = minMinutes * 20 + loans * loanPoints;
    const maxReward = maxMinutes * 20 + loans * loanPoints;

    // 入力報酬が範囲内なら確定
    if (points >= minReward && points <= maxReward) {
        return { timeReward, loans, loanReward };
    } else {
        throw new Error('測定不能');
    }
}