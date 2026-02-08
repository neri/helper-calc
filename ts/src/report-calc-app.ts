import { SubApp } from './sub-app';
import { StorageManager } from './storage-manager';

class ReportCalcApp implements SubApp {
    private reportCalcDebounceTimer: number | null = null;
    private reportCalcContainer: HTMLElement | null = null;

    init(container: HTMLElement) {
        this.reportCalcContainer = container;
        this.reportCalcRender();
        this.reportCalcBindEvents();
    }

    destroy() {
        if (this.reportCalcDebounceTimer) {
            clearTimeout(this.reportCalcDebounceTimer);
        }
    }

    private reportCalcRender() {
        if (!this.reportCalcContainer) return;

        const savedReportT1 = StorageManager.getReportCalcReportT1();
        const savedReportT2 = StorageManager.getReportCalcReportT2();
        const savedReportT3 = StorageManager.getReportCalcReportT3();
        const savedReportT4 = StorageManager.getReportCalcReportT4();
        const savedCredits = StorageManager.getReportCalcCredits();

        this.reportCalcContainer.innerHTML = `
            <div id="report-calc-form">
                <div>
                    <label for="report-t1">初級レポート:</label>
                    <input type="number" id="report-t1" name="report_t1" class="report-input" min="0" max="999999" step="1" inputmode="numeric" value="${savedReportT1}" data-storage-key="report_t1">
                </div>
                <div>
                    <label for="report-t2">中級レポート:</label>
                    <input type="number" id="report-t2" name="report_t2" class="report-input" min="0" max="999999" step="1" inputmode="numeric" value="${savedReportT2}" data-storage-key="report_t2">
                </div>
                <div>
                    <label for="report-t3">上級レポート:</label>
                    <input type="number" id="report-t3" name="report_t3" class="report-input" min="0" max="999999" step="1" inputmode="numeric" value="${savedReportT3}" data-storage-key="report_t3">
                </div>
                <div>
                    <label for="report-t4">最上級レポート:</label>
                    <input type="number" id="report-t4" name="report_t4" class="report-input" min="0" max="999999" step="1" inputmode="numeric" value="${savedReportT4}" data-storage-key="report_t4">
                </div>
                <div>
                    <label for="report-credits">クレジット:</label>
                    <input type="number" id="report-credits" class="credit-input" min="0" max="9999999999" step="1" inputmode="numeric" value="${savedCredits}">
                </div>
                <button id="report-calc-btn">計算</button>
            </div>
            <div id="report-calc-error"></div>
            <div id="report-calc-results"></div>
        `;
    }

    private reportCalcBindEvents() {
        if (!this.reportCalcContainer) return;

        const inputElements = this.reportCalcContainer.querySelectorAll('#report-calc-form input') as NodeListOf<HTMLInputElement>;
        const calculateBtn = this.reportCalcContainer.querySelector('#report-calc-btn') as HTMLButtonElement;

        const saveToLocalStorage = () => {
            const reportT1 = this.reportCalcContainer!.querySelector('#report-t1') as HTMLInputElement;
            const reportT2 = this.reportCalcContainer!.querySelector('#report-t2') as HTMLInputElement;
            const reportT3 = this.reportCalcContainer!.querySelector('#report-t3') as HTMLInputElement;
            const reportT4 = this.reportCalcContainer!.querySelector('#report-t4') as HTMLInputElement;
            const credits = this.reportCalcContainer!.querySelector('#report-credits') as HTMLInputElement;

            StorageManager.setReportCalcReportT1(reportT1.value);
            StorageManager.setReportCalcReportT2(reportT2.value);
            StorageManager.setReportCalcReportT3(reportT3.value);
            StorageManager.setReportCalcReportT4(reportT4.value);
            StorageManager.setReportCalcCredits(credits.value);
        };

        const debouncedCalculate = () => {
            if (this.reportCalcDebounceTimer) {
                clearTimeout(this.reportCalcDebounceTimer);
            }
            this.reportCalcDebounceTimer = window.setTimeout(() => {
                this.reportCalcCalculate();
                saveToLocalStorage();
            }, 500);
        };

        inputElements.forEach(input => {
            input.addEventListener('input', debouncedCalculate);
        });

        calculateBtn.addEventListener('click', () => {
            this.reportCalcCalculate();
            saveToLocalStorage();
        });
    }

    private reportCalcCalculate() {
        if (!this.reportCalcContainer) return;

        const errorDiv = this.reportCalcContainer.querySelector('#report-calc-error') as HTMLElement;
        const resultsDiv = this.reportCalcContainer.querySelector('#report-calc-results') as HTMLElement;

        const reportT1 = this.reportCalcContainer.querySelector('#report-t1') as HTMLInputElement;
        const reportT2 = this.reportCalcContainer.querySelector('#report-t2') as HTMLInputElement;
        const reportT3 = this.reportCalcContainer.querySelector('#report-t3') as HTMLInputElement;
        const reportT4 = this.reportCalcContainer.querySelector('#report-t4') as HTMLInputElement;
        const credits = this.reportCalcContainer.querySelector('#report-credits') as HTMLInputElement;

        const reportMax = 999999;
        const parsedT1 = this.parseIntegerInput(reportT1.value, '初級レポート');
        if (!parsedT1.ok) {
            errorDiv.textContent = parsedT1.message;
            resultsDiv.innerHTML = '';
            return;
        }
        if (parsedT1.value > reportMax) {
            errorDiv.textContent = '初級レポートは6桁まで入力してください。';
            resultsDiv.innerHTML = '';
            return;
        }
        const parsedT2 = this.parseIntegerInput(reportT2.value, '中級レポート');
        if (!parsedT2.ok) {
            errorDiv.textContent = parsedT2.message;
            resultsDiv.innerHTML = '';
            return;
        }
        if (parsedT2.value > reportMax) {
            errorDiv.textContent = '中級レポートは6桁まで入力してください。';
            resultsDiv.innerHTML = '';
            return;
        }
        const parsedT3 = this.parseIntegerInput(reportT3.value, '上級レポート');
        if (!parsedT3.ok) {
            errorDiv.textContent = parsedT3.message;
            resultsDiv.innerHTML = '';
            return;
        }
        if (parsedT3.value > reportMax) {
            errorDiv.textContent = '上級レポートは6桁まで入力してください。';
            resultsDiv.innerHTML = '';
            return;
        }
        const parsedT4 = this.parseIntegerInput(reportT4.value, '最上級レポート');
        if (!parsedT4.ok) {
            errorDiv.textContent = parsedT4.message;
            resultsDiv.innerHTML = '';
            return;
        }
        if (parsedT4.value > reportMax) {
            errorDiv.textContent = '最上級レポートは6桁まで入力してください。';
            resultsDiv.innerHTML = '';
            return;
        }
        const parsedCredits = this.parseIntegerInput(credits.value, 'クレジット');
        if (!parsedCredits.ok) {
            errorDiv.textContent = parsedCredits.message;
            resultsDiv.innerHTML = '';
            return;
        }
        if (parsedCredits.value > 9999999999) {
            errorDiv.textContent = 'クレジットは10桁まで入力してください。';
            resultsDiv.innerHTML = '';
            return;
        }

        errorDiv.textContent = '';

        const exp = parsedT1.value * 50
            + parsedT2.value * 500
            + parsedT3.value * 2000
            + parsedT4.value * 10000;
        const fullyTrainedCount = exp / 1249200;
        const creditPeopleCount = parsedCredits.value / 50000000;
        const specialRequest = (fullyTrainedCount >= 5 && fullyTrainedCount > (creditPeopleCount / 2))
            ? 'クレジット推奨'
            : 'レポート推奨';
        const requiredCredits = exp * 7;
        const creditClass = requiredCredits > parsedCredits.value ? 'credit-warning' : '';
        const creditValue = parsedCredits.value;
        const level90Count = creditValue / 8744295;
        const skill5MmmCount = creditValue / 40017500;
        const equipmentMmmCount = creditValue / 5090088;
        const equipmentBeadCount = creditValue / 16419933;
        const unique4Count = creditValue / 14628900;
        const wb25Count = creditValue / 10500000;
        const fullyTrainedCreditCount = creditValue / 95400716;
        resultsDiv.innerHTML = `
            <div class="report-result-group">
                <div class="report-result-title">特別依頼</div>
                <div>${specialRequest}</div>
            </div>
            <div class="report-result-group">
                <div class="report-result-title">レポート</div>
                <div><strong>EXP</strong>: <span class="result-value">${exp.toLocaleString()}</span></div>
                <div><strong>レベル90可能な人数</strong>: <span class="result-value">${fullyTrainedCount.toFixed(2)}</span></div>
                <div class="${creditClass}"><strong>消費に必要なクレジット</strong>: <span class="result-value">${requiredCredits.toLocaleString()}</span></div>
            </div>
            <div class="report-result-group">
                <div class="report-result-title">クレジット</div>
                <div><strong>完全育成可能な人数</strong>: <span class="result-value">${fullyTrainedCreditCount.toFixed(2)}</span></div>
                <div><strong>レベル90可能な人数</strong>: <span class="result-value">${level90Count.toFixed(2)}</span></div>
                <div><strong>スキル最大可能な人数</strong>: <span class="result-value">${skill5MmmCount.toFixed(2)}</span></div>
                <div><strong>装備最大可能な人数</strong>: <span class="result-value">${equipmentMmmCount.toFixed(2)}</span></div>
                <div><strong>装備最大強化に必要な強化珠の人数</strong>: <span class="result-value">${equipmentBeadCount.toFixed(2)}</span></div>
                <div><strong>固有4まで育成可能な人数</strong>: <span class="result-value">${unique4Count.toFixed(2)}</span></div>
                <div><strong>WB25まで育成可能な人数</strong>: <span class="result-value">${wb25Count.toFixed(2)}</span></div>
            </div>
        `;
    }

    private parseIntegerInput(value: string, label: string): { ok: true, value: number } | { ok: false, message: string } {
        if (value.trim() === '') {
            return { ok: true, value: 0 };
        }
        const parsed = Number(value);
        if (!Number.isInteger(parsed) || parsed < 0) {
            return { ok: false, message: `${label}は0以上の整数を入力してください。` };
        }
        return { ok: true, value: parsed };
    }
}

export default ReportCalcApp;
