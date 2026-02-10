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
        const savedBasePeople = StorageManager.getReportCalcBasePeople();
        const savedTrainCredits = StorageManager.getReportCalcTrainCredits();

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
                    <span class="input-with-suffix">
                        <input type="number" id="report-credits" class="credit-input" min="0" max="99999" step="1" inputmode="numeric" value="${savedCredits}">
                        <span class="input-suffix">M</span>
                    </span>
                </div>
                <details class="report-calc-settings">
                    <summary>詳細設定</summary>
                    <div>
                        <label for="report-base-people">基準人数:</label>
                        <input type="number" id="report-base-people" min="1" max="9" step="1" inputmode="numeric" value="${savedBasePeople}" placeholder="5">
                    </div>
                    <div>
                        <label for="report-train-credits">育成基準:</label>
                        <span class="input-with-suffix">
                            <input type="number" id="report-train-credits" min="1" max="99" step="1" inputmode="numeric" value="${savedTrainCredits}" placeholder="50">
                            <span class="input-suffix">M</span>
                        </span>
                    </div>
                </details>
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
            const basePeople = this.reportCalcContainer!.querySelector('#report-base-people') as HTMLInputElement;
            const trainCredits = this.reportCalcContainer!.querySelector('#report-train-credits') as HTMLInputElement;

            StorageManager.setReportCalcReportT1(reportT1.value);
            StorageManager.setReportCalcReportT2(reportT2.value);
            StorageManager.setReportCalcReportT3(reportT3.value);
            StorageManager.setReportCalcReportT4(reportT4.value);
            StorageManager.setReportCalcCredits(credits.value);
            StorageManager.setReportCalcBasePeople(basePeople.value);
            StorageManager.setReportCalcTrainCredits(trainCredits.value);
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
        const basePeople = this.reportCalcContainer.querySelector('#report-base-people') as HTMLInputElement;
        const trainCredits = this.reportCalcContainer.querySelector('#report-train-credits') as HTMLInputElement;

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
        if (parsedCredits.value > 99999) {
            errorDiv.textContent = 'クレジットは5桁まで入力してください。';
            resultsDiv.innerHTML = '';
            return;
        }
        const parsedBasePeople = this.parseIntegerInput(basePeople.value, '基準人数');
        if (!parsedBasePeople.ok) {
            errorDiv.textContent = parsedBasePeople.message;
            resultsDiv.innerHTML = '';
            return;
        }
        const normalizedBasePeople = parsedBasePeople.value === 0 ? 5 : parsedBasePeople.value;
        if (normalizedBasePeople < 1 || normalizedBasePeople > 9) {
            errorDiv.textContent = '基準人数は1桁の整数を入力してください。';
            resultsDiv.innerHTML = '';
            return;
        }
        const parsedTrainCredits = this.parseIntegerInput(trainCredits.value, '育成基準');
        if (!parsedTrainCredits.ok) {
            errorDiv.textContent = parsedTrainCredits.message;
            resultsDiv.innerHTML = '';
            return;
        }
        const normalizedTrainCredits = parsedTrainCredits.value === 0 ? 50 : parsedTrainCredits.value;
        if (normalizedTrainCredits < 1 || normalizedTrainCredits > 99) {
            errorDiv.textContent = '育成基準は2桁の整数を入力してください。';
            resultsDiv.innerHTML = '';
            return;
        }

        errorDiv.textContent = '';

        const exp = parsedT1.value * 50
            + parsedT2.value * 500
            + parsedT3.value * 2000
            + parsedT4.value * 10000;
        const fullyTrainedCount = exp / 1249200;
        const creditValue = parsedCredits.value * 1000000;
        const formatPeople = (value: number) => (Math.floor(value * 10) / 10).toFixed(1);
        const creditPeopleCount = creditValue / (normalizedTrainCredits * 1000000);
        const creditRecommendLimitM = (fullyTrainedCount / 2) * normalizedTrainCredits;
        const shouldRecommendCredit = fullyTrainedCount >= normalizedBasePeople
            && parsedCredits.value < creditRecommendLimitM;
        const specialRequest = shouldRecommendCredit
            ? `クレジット推奨(約${formatPeople(creditRecommendLimitM)}Mまで)`
            : 'レポート推奨';
        const specialRequestNote = shouldRecommendCredit
            ? '<div class="report-result-note">※ 基本的にはレポート周回した方が効率が良いとされています。</div>'
            : '';
        const reportT1People = parsedT1.value / 25000;
        const reportT2People = parsedT2.value / 2500;
        const reportT3People = parsedT3.value / 625;
        const reportT4People = parsedT4.value / 125;
        const requiredCredits = exp * 7;
        const creditClass = requiredCredits > creditValue ? 'credit-warning' : '';
        const level90Count = creditValue / 8744295;
        const skill5MmmCount = creditValue / 40017500;
        const equipmentMmmCount = creditValue / 5090088;
        const unique4Count = creditValue / 14628900;
        const wb25Count = creditValue / 10500000;
        const fullyTrainedCreditCount = creditValue / 95400716;
        resultsDiv.innerHTML = `
            <div class="report-result-group">
                <div class="report-result-title">特別依頼</div>
                <div>${specialRequest}</div>
                ${specialRequestNote}
            </div>
            <div class="report-result-group">
                <div class="report-result-title">レポート</div>
                <div><strong>レベル90可能な人数</strong>: 約 <span class="result-value">${formatPeople(fullyTrainedCount)}</span> 人分</div>
                <div><strong>初級レポート</strong>: 約 <span class="result-value">${formatPeople(reportT1People)}</span> 人分</div>
                <div><strong>中級レポート</strong>: 約 <span class="result-value">${formatPeople(reportT2People)}</span> 人分</div>
                <div><strong>上級レポート</strong>: 約 <span class="result-value">${formatPeople(reportT3People)}</span> 人分</div>
                <div><strong>最上級レポート</strong>: 約 <span class="result-value">${formatPeople(reportT4People)}</span> 人分</div>
                <div><strong>合計EXP</strong>: <span class="result-value">${exp.toLocaleString()}</span></div>
                <div class="${creditClass}"><strong>消費に必要なクレジット</strong>: 約 <span class="result-value">${requiredCredits.toLocaleString()}</span></div>
            </div>
            <div class="report-result-group">
                <div class="report-result-title">クレジット</div>
                <div><strong>完全育成可能な人数</strong>: 約 <span class="result-value">${formatPeople(fullyTrainedCreditCount)}</span> 人分</div>
                <div><strong>基準まで育成可能な人数</strong>: 約 <span class="result-value">${formatPeople(creditPeopleCount)}</span> 人</div>
                <div><strong>レベル90可能な人数</strong>: 約 <span class="result-value">${formatPeople(level90Count)}</span> 人分</div>
                <div><strong>スキル最大可能な人数</strong>: 約 <span class="result-value">${formatPeople(skill5MmmCount)}</span> 人分</div>
                <div><strong>装備最大可能な人数</strong>: 約 <span class="result-value">${formatPeople(equipmentMmmCount)}</span> 人分</div>
                <div><strong>固有4まで育成可能な人数</strong>: 約 <span class="result-value">${formatPeople(unique4Count)}</span> 人分</div>
                <div><strong>WB25まで育成可能な人数</strong>: 約 <span class="result-value">${formatPeople(wb25Count)}</span> 人分</div>
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
