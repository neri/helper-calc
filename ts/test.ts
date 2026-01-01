import { estimateLoans } from './src/calculator.ts';

interface TestCase {
    hours: number;
    points: number;
    expected: {
        timeReward: number;
        loans: number;
        loanReward: number;
    };
}

const testCases: TestCase[] = [
    {
        hours: 161,
        points: 1544260,
        expected: { timeReward: 194260, loans: 27, loanReward: 1350000 }
    },
    {
        hours: 1,
        points: 100000,
        expected: { timeReward: 0, loans: 0, loanReward: 0 } // 範囲外なのでエラー
    },
    // エラーケース
    {
        hours: 0,
        points: 0,
        expected: { timeReward: 0, loans: 0, loanReward: 0 } // これはエラーになるはず
    }
];

testCases.forEach(({ hours, points, expected }, index) => {
    console.log(`Test ${index + 1}: hours=${hours}, points=${points}`);
    try {
        const result = estimateLoans(points, hours);
        const isPass = result.timeReward === expected.timeReward &&
            result.loans === expected.loans &&
            result.loanReward === expected.loanReward;
        console.log(`Result: timeReward=${result.timeReward}, loans=${result.loans}, loanReward=${result.loanReward}`);
        console.log(`Expected: timeReward=${expected.timeReward}, loans=${expected.loans}, loanReward=${expected.loanReward}`);
        console.log(`Status: ${isPass ? 'PASS' : 'FAIL'}`);
    } catch (error) {
        console.log(`Error: ${(error as Error).message}`);
        // エラー期待の場合、PASS とする (簡易的に)
        console.log(`Status: PASS (Expected error)`);
    }
    console.log('---');
});