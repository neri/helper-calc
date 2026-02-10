import { describe, it, expect, beforeEach } from 'vitest';
import ReportCalcApp from '../src/report-calc-app';
import { StorageManager } from '../src/storage-manager';

describe('ReportCalcApp', () => {
    const createMockStorage = () => {
        const store = new Map<string, string>();
        return {
            getItem: (key: string) => store.get(key) ?? null,
            setItem: (key: string, value: string) => {
                store.set(key, value);
            },
            removeItem: (key: string) => {
                store.delete(key);
            },
            clear: () => {
                store.clear();
            }
        } as Storage;
    };

    beforeEach(() => {
        const mockStorage = createMockStorage();
        (globalThis as { localStorage: Storage }).localStorage = mockStorage;
        if (typeof window !== 'undefined') {
            (window as { localStorage: Storage }).localStorage = mockStorage;
        }
        StorageManager.setReportCalcReportT1('');
        StorageManager.setReportCalcReportT2('');
        StorageManager.setReportCalcReportT3('');
        StorageManager.setReportCalcReportT4('');
        StorageManager.setReportCalcCredits('');
        document.body.innerHTML = '<div id="report-container"></div>';
    });

    const setupApp = () => {
        const container = document.querySelector('#report-container') as HTMLElement;
        const app = new ReportCalcApp();
        app.init(container);
        return { app, container };
    };

    it('EXP計算と基本表示ができる', () => {
        const { container } = setupApp();
        const reportT1 = container.querySelector('#report-t1') as HTMLInputElement;
        const reportT2 = container.querySelector('#report-t2') as HTMLInputElement;
        const reportT3 = container.querySelector('#report-t3') as HTMLInputElement;
        const reportT4 = container.querySelector('#report-t4') as HTMLInputElement;
        const credits = container.querySelector('#report-credits') as HTMLInputElement;
        const calculateBtn = container.querySelector('#report-calc-btn') as HTMLButtonElement;

        reportT1.value = '1';
        reportT2.value = '2';
        reportT3.value = '3';
        reportT4.value = '4';
        credits.value = '0';
        calculateBtn.click();

        const resultsDiv = container.querySelector('#report-calc-results') as HTMLElement;
        expect(resultsDiv.textContent).toContain('特別依頼');
        expect(resultsDiv.textContent).toContain('レポート');
        expect(resultsDiv.textContent).toContain('合計EXP: 47,050');
        expect(resultsDiv.textContent).toContain('レベル90可能な人数: 約 0.0 人分');
        expect(resultsDiv.textContent).toContain('消費に必要なクレジット: 約 329,350');
    });

    it('特別依頼がレポート優先になる（5人未満）', () => {
        const { container } = setupApp();
        const reportT1 = container.querySelector('#report-t1') as HTMLInputElement;
        const credits = container.querySelector('#report-credits') as HTMLInputElement;
        const calculateBtn = container.querySelector('#report-calc-btn') as HTMLButtonElement;

        reportT1.value = '0';
        credits.value = '0';
        calculateBtn.click();

        const resultsDiv = container.querySelector('#report-calc-results') as HTMLElement;
        expect(resultsDiv.textContent).toContain('レポート推奨');
    });

    it('特別依頼がクレジット優先になる（5人分以上）', () => {
        const { container } = setupApp();
        const reportT1 = container.querySelector('#report-t1') as HTMLInputElement;
        const credits = container.querySelector('#report-credits') as HTMLInputElement;
        const calculateBtn = container.querySelector('#report-calc-btn') as HTMLButtonElement;

        reportT1.value = '124920';
        credits.value = '100';
        calculateBtn.click();

        const resultsDiv = container.querySelector('#report-calc-results') as HTMLElement;
        expect(resultsDiv.textContent).toContain('クレジット推奨');
    });

    it('特別依頼がレポート優先になる（境界条件）', () => {
        const { container } = setupApp();
        const reportT1 = container.querySelector('#report-t1') as HTMLInputElement;
        const credits = container.querySelector('#report-credits') as HTMLInputElement;
        const calculateBtn = container.querySelector('#report-calc-btn') as HTMLButtonElement;

        reportT1.value = '124920';
        credits.value = '125';
        calculateBtn.click();

        const resultsDiv = container.querySelector('#report-calc-results') as HTMLElement;
        expect(resultsDiv.textContent).toContain('レポート推奨');
    });

    it('不正な入力でエラーメッセージを表示する', () => {
        const { container } = setupApp();
        const reportT1 = container.querySelector('#report-t1') as HTMLInputElement;
        const calculateBtn = container.querySelector('#report-calc-btn') as HTMLButtonElement;

        reportT1.value = '-1';
        calculateBtn.click();

        const errorDiv = container.querySelector('#report-calc-error') as HTMLElement;
        expect(errorDiv.textContent).toBe('初級レポートは0以上の整数を入力してください。');
    });
});
