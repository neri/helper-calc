import { estimateLoans } from '../src/calculator';

describe('estimateLoans', () => {
    test('正常ケース: 時間=161, 報酬=1544260', () => {
        const result = estimateLoans(1544260, 161);
        expect(result).toEqual({
            timeReward: 194260,
            loans: 27,
            loanReward: 1350000
        });
    });

    test('正常ケース: 時間=0, 報酬=0', () => {
        const result = estimateLoans(0, 0);
        expect(result).toEqual({
            timeReward: 0,
            loans: 0,
            loanReward: 0
        });
    });

    test('エラーケース: 範囲外', () => {
        expect(() => estimateLoans(100000, 1)).toThrow('測定不能');
    });

    test('エラーケース: 負の値', () => {
        expect(() => estimateLoans(-1, 1)).toThrow('Invalid input: points and hours must be non-negative');
    });
});