import { describe, it, expect } from 'vitest';
import {
    calculateNextRank,
    calculateNextRankCompromise,
    calculateMultipleRanks,
    calculateMultipleRanksCompromise,
    getReward,
    calculateMinimumStoneBreak
} from '../src/tactical-rank-calc-calculator';

describe('TacticalRankCalcCalculator', () => {
    describe('calculateNextRank', () => {
        it('現在の順位が10以上の場合、Math.floor((現在の順位 * 7) / 10)を計算する', () => {
            expect(calculateNextRank(10)).toBe(7);
            expect(calculateNextRank(20)).toBe(14);
            expect(calculateNextRank(100)).toBe(70);
        });

        it('現在の順位が10未満の場合、現在の順位 - 3を計算する', () => {
            expect(calculateNextRank(9)).toBe(6);
            expect(calculateNextRank(5)).toBe(2);
        });

        it('計算結果が1以下の場合は1に補正する', () => {
            expect(calculateNextRank(1)).toBe(1);
            expect(calculateNextRank(2)).toBe(1);
            expect(calculateNextRank(3)).toBe(1);
        });
    });

    describe('calculateMultipleRanks', () => {
        it('指定回数分の順位を計算する（1位が出たら打ち切り）', () => {
            const result = calculateMultipleRanks(15001, 25);
            const expected = [10500, 7350, 5145, 3601, 2520, 1764, 1234, 863, 604, 422, 295, 206, 144, 100, 70, 49, 34, 23, 16, 11, 7, 4, 1];
            expect(result).toEqual(expected);
        });

        it('1位が出たら打ち切る', () => {
            const result = calculateMultipleRanks(10, 5);
            // 10 -> 7 -> 4 -> 1 で打ち切り
            expect(result).toEqual([7, 4, 1]);
        });
    });

    describe('getReward', () => {
        it('1位の報酬を取得する', () => {
            expect(getReward(1)).toEqual({ stone: 45, coin: 125 });
        });

        it('2位の報酬を取得する', () => {
            expect(getReward(2)).toEqual({ stone: 40, coin: 120 });
        });

        it('3~10位の報酬を取得する', () => {
            expect(getReward(5)).toEqual({ stone: 35, coin: 110 });
            expect(getReward(10)).toEqual({ stone: 35, coin: 110 });
        });

        it('11~100位の報酬を取得する', () => {
            expect(getReward(50)).toEqual({ stone: 30, coin: 100 });
            expect(getReward(100)).toEqual({ stone: 30, coin: 100 });
        });

        it('101~200位の報酬を取得する', () => {
            expect(getReward(150)).toEqual({ stone: 25, coin: 90 });
        });

        it('201~500位の報酬を取得する', () => {
            expect(getReward(300)).toEqual({ stone: 20, coin: 80 });
        });

        it('501~1000位の報酬を取得する', () => {
            expect(getReward(750)).toEqual({ stone: 18, coin: 70 });
        });

        it('1001~2000位の報酬を取得する', () => {
            expect(getReward(1500)).toEqual({ stone: 16, coin: 60 });
        });

        it('2001~4000位の報酬を取得する', () => {
            expect(getReward(3000)).toEqual({ stone: 14, coin: 50 });
        });

        it('4001~8000位の報酬を取得する', () => {
            expect(getReward(5000)).toEqual({ stone: 12, coin: 40 });
        });

        it('8001~15000位の報酬を取得する', () => {
            expect(getReward(10000)).toEqual({ stone: 10, coin: 30 });
        });

        it('15001位以上の報酬を取得する', () => {
            expect(getReward(15001)).toEqual({ stone: 0, coin: 0 });
            expect(getReward(20000)).toEqual({ stone: 0, coin: 0 });
        });
    });

    describe('calculateMinimumStoneBreak', () => {
        it('最低石割り回数を計算する', () => {
            expect(calculateMinimumStoneBreak(0)).toBe(0);
            expect(calculateMinimumStoneBreak(1)).toBe(0);
            expect(calculateMinimumStoneBreak(5)).toBe(0);
            expect(calculateMinimumStoneBreak(6)).toBe(1);
            expect(calculateMinimumStoneBreak(10)).toBe(1);
            expect(calculateMinimumStoneBreak(11)).toBe(2);
        });
    });

    describe('calculateNextRankCompromise', () => {
        it('現在順位に応じて妥協幅を縮め、最低+3位を確保する', () => {
            // N=15001: logical=10500、5%の余裕で11025
            expect(calculateNextRankCompromise(15001)).toBe(11025);
            // N=8000: logical=5600、3%の余裕で5768
            expect(calculateNextRankCompromise(8000)).toBe(5768);
            // N=2000: logical=1400、1%の余裕で1414
            expect(calculateNextRankCompromise(2000)).toBe(1414);
            // N=100: 1%より最低+3位の余裕が優先される
            expect(calculateNextRankCompromise(100)).toBe(73);
            // N=15: logical=10、最低+3位の余裕で13
            expect(calculateNextRankCompromise(15)).toBe(13);
        });

        it('10 < rank <= 14の場合、N - 2を計算する', () => {
            expect(calculateNextRankCompromise(14)).toBe(12);
            expect(calculateNextRankCompromise(13)).toBe(11);
            expect(calculateNextRankCompromise(11)).toBe(9);
        });

        it('rank <= 10の場合、N - 1を計算する', () => {
            expect(calculateNextRankCompromise(10)).toBe(9);
            expect(calculateNextRankCompromise(9)).toBe(8);
            expect(calculateNextRankCompromise(5)).toBe(4);
        });

        it('計算結果が1以下の場合は1に補正する', () => {
            expect(calculateNextRankCompromise(1)).toBeGreaterThanOrEqual(1);
            expect(calculateNextRankCompromise(2)).toBeGreaterThanOrEqual(1);
        });
    });

    describe('calculateMultipleRanksCompromise', () => {
        it('妥協値で指定回数分の順位を計算する', () => {
            // N=100: 73 / N=73: logical=51, compromise=54
            const result = calculateMultipleRanksCompromise(100, 25);
            expect(result[0]).toBe(73);
            expect(result[1]).toBe(54);
        });

        it('小さい順位でのN-1を繰り返す', () => {
            // N=9 (<=10): 8 -> 7 -> 6
            const result = calculateMultipleRanksCompromise(9, 3);
            expect(result).toEqual([8, 7, 6]);
        });
    });

});
