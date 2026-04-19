/**
 * 対抗戦順位計算ロジック
 */

/**
 * 次の順位を計算する
 * @param currentRank 現在の順位
 * @returns 次の順位
 */
export function calculateNextRank(currentRank: number): number {
    let nextRank: number;

    if (currentRank >= 10) {
        nextRank = Math.floor((currentRank * 7) / 10);
    } else {
        nextRank = currentRank - 3;
    }

    // 結果が1以下の場合は1に補正
    return Math.max(1, nextRank);
}

/**
 * 複数の順位を計算する（1位が出たら打ち切り）
 * @param initialRank 初期順位
 * @param iterations 繰り返し回数
 * @returns 順位の配列
 */
export function calculateMultipleRanks(initialRank: number, iterations: number): number[] {
    const results: number[] = [];
    let currentRank = initialRank;

    for (let i = 0; i < iterations; i++) {
        currentRank = calculateNextRank(currentRank);
        results.push(currentRank);

        if (currentRank === 1) {
            break;
        }
    }

    return results;
}

/**
 * 報酬インターフェース
 */
export interface Reward {
    stone: number;
    coin: number;
}

/**
 * 順位から報酬を取得する
 * @param rank 順位
 * @returns 報酬オブジェクト
 */
export function getReward(rank: number): Reward {
    if (rank === 1) {
        return { stone: 45, coin: 125 };
    } else if (rank === 2) {
        return { stone: 40, coin: 120 };
    } else if (rank >= 3 && rank <= 10) {
        return { stone: 35, coin: 110 };
    } else if (rank >= 11 && rank <= 100) {
        return { stone: 30, coin: 100 };
    } else if (rank >= 101 && rank <= 200) {
        return { stone: 25, coin: 90 };
    } else if (rank >= 201 && rank <= 500) {
        return { stone: 20, coin: 80 };
    } else if (rank >= 501 && rank <= 1000) {
        return { stone: 18, coin: 70 };
    } else if (rank >= 1001 && rank <= 2000) {
        return { stone: 16, coin: 60 };
    } else if (rank >= 2001 && rank <= 4000) {
        return { stone: 14, coin: 50 };
    } else if (rank >= 4001 && rank <= 8000) {
        return { stone: 12, coin: 40 };
    } else if (rank >= 8001 && rank <= 15000) {
        return { stone: 10, coin: 30 };
    } else {
        return { stone: 0, coin: 0 };
    }
}

/**
 * 妥協値で次の順位を計算する (rank<=10: N-1, rank<=14: N-2, その他: max(floor(論理値 * 1.1), 論理値 + 3))
 * @param currentRank 現在の順位
 * @returns 次の順位
 */
export function calculateNextRankCompromise(currentRank: number): number {
    let nextRank: number;
    if (currentRank <= 10) {
        nextRank = currentRank - 1;
    } else if (currentRank <= 14) {
        nextRank = currentRank - 2;
    } else {
        const logical = calculateNextRank(currentRank);
        nextRank = Math.max(
            Math.floor((logical * 11) / 10),
            logical + 3
        );
    }
    return Math.max(1, nextRank);
}

/**
 * 妥協値で複数の順位を計算する（1位が出たら打ち切り）
 * @param initialRank 初期順位
 * @param iterations 繰り返し回数
 * @returns 順位の配列
 */
export function calculateMultipleRanksCompromise(initialRank: number, iterations: number): number[] {
    const results: number[] = [];
    let currentRank = initialRank;

    for (let i = 0; i < iterations; i++) {
        currentRank = calculateNextRankCompromise(currentRank);
        results.push(currentRank);

        if (currentRank === 1) {
            break;
        }
    }

    return results;
}

/**
 * 最低石割り回数を計算する
 * @param actualIterations 実際に繰り返した回数
 * @returns 最低石割り回数
 */
export function calculateMinimumStoneBreak(actualIterations: number): number {
    if (actualIterations === 0) return 0;
    return Math.floor((actualIterations + 4) / 5) - 1;
}