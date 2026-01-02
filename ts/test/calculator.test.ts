import { estimateLoans } from '../src/calculator';

describe('estimateLoans', () => {
    test('正常ケース: 登録時間=161, 獲得報酬=1,544,260', () => {
        const result = estimateLoans(1544260, 161 * 60);
        expect(result).toEqual({
            timeReward: 194260,
            loans: 27,
            loanReward: 1350000
        });
    });

    test('正常ケース: 登録時間=70, 獲得報酬=784,480', () => {
        const result = estimateLoans(784480, 70 * 60);
        expect(result).toEqual({
            timeReward: 84480,
            loans: 14,
            loanReward: 700000
        });
    });

    test('正常ケース: 登録時間=176, 獲得報酬=6,711,560', () => {
        const result = estimateLoans(6711560, 176 * 60);
        expect(result).toEqual({
            timeReward: 211560,
            loans: 130,
            loanReward: 6500000
        });
    });

    test('エラーケース: 登録時間=1, 獲得報酬=100,000 (範囲外)', () => {
        expect(() => estimateLoans(100000, 1 * 60)).toThrow('獲得報酬の値が計算範囲外です');
    });

    test('正常ケース: 登録時間=0, 獲得報酬=0', () => {
        const result = estimateLoans(0, 0);
        expect(result).toEqual({
            timeReward: 0,
            loans: 0,
            loanReward: 0
        });
    });

    test('エラーケース: 負の値', () => {
        expect(() => estimateLoans(-1, 1)).toThrow('Invalid input: points and time must be non-negative');
    });
});