import { estimateLoans } from './calculator';
import { NegativeLoanError } from './calculator';

class App {
    private debounceTimer: number | null = null;

    constructor() {
        this.init();
    }

    init() {
        const savedMode = localStorage.getItem('input-mode') || 'hours';
        const savedHours = localStorage.getItem('hours') || '';
        const savedDatetime = localStorage.getItem('datetime') || '';
        const app = document.querySelector('#app')!;
        app.innerHTML = `
      <h2>助っ人貸出回数計算機</h2>
      <div id="calc-form">
        <div id="mode-selection">
          <label><input type="radio" name="input-mode" value="hours" ${savedMode === 'hours' ? 'checked' : ''}> 登録時間</label>
          <label><input type="radio" name="input-mode" value="datetime" ${savedMode === 'datetime' ? 'checked' : ''}> 設定日時</label>
        </div>
        <div id="hours-input" ${savedMode === 'datetime' ? 'style="display: none;"' : ''}>
          <label for="hours">登録時間:</label>
          <input type="number" id="hours" min="0" value="${savedHours}">
        </div>
        <div id="datetime-input" ${savedMode === 'hours' ? 'style="display: none;"' : ''}>
          <label for="datetime">設定日時:</label>
          <input type="datetime-local" id="datetime" value="${savedDatetime}">
        </div>
        <div>
          <label for="points">獲得報酬:</label>
          <input type="number" id="points" min="0">
        </div>
      </div>
      <div id="result"></div>
    `;
        this.bindEvents();
    }

    bindEvents() {
        const pointsInput = document.querySelector('#points') as HTMLInputElement;
        const hoursInput = document.querySelector('#hours') as HTMLInputElement;
        const datetimeInput = document.querySelector('#datetime') as HTMLInputElement;
        const modeRadios = document.querySelectorAll('input[name="input-mode"]') as NodeListOf<HTMLInputElement>;

        const saveToLocalStorage = () => {
            const selectedMode = (document.querySelector('input[name="input-mode"]:checked') as HTMLInputElement).value;
            localStorage.setItem('input-mode', selectedMode);
            localStorage.setItem('hours', hoursInput.value);
            localStorage.setItem('datetime', datetimeInput.value);
        };

        const debouncedCalculate = () => {
            if (this.debounceTimer) {
                clearTimeout(this.debounceTimer);
            }
            this.debounceTimer = window.setTimeout(() => {
                this.calculate();
                saveToLocalStorage();
            }, 500);
        };

        const toggleMode = () => {
            const selectedMode = (document.querySelector('input[name="input-mode"]:checked') as HTMLInputElement).value;
            const hoursDiv = document.querySelector('#hours-input') as HTMLElement;
            const datetimeDiv = document.querySelector('#datetime-input') as HTMLElement;
            if (selectedMode === 'hours') {
                hoursDiv.style.display = 'block';
                datetimeDiv.style.display = 'none';
            } else {
                hoursDiv.style.display = 'none';
                datetimeDiv.style.display = 'block';
            }
            this.calculate(); // モード変更時に再計算
            saveToLocalStorage();
        };

        modeRadios.forEach(radio => radio.addEventListener('change', toggleMode));
        pointsInput.addEventListener('input', debouncedCalculate);
        hoursInput.addEventListener('input', debouncedCalculate);
        datetimeInput.addEventListener('input', debouncedCalculate);
    }

    calculate() {
        const selectedMode = (document.querySelector('input[name="input-mode"]:checked') as HTMLInputElement).value;
        const resultDiv = document.querySelector('#result')!;

        const pointsInput = document.querySelector('#points') as HTMLInputElement;
        const hoursInput = document.querySelector('#hours') as HTMLInputElement;
        const datetimeInput = document.querySelector('#datetime') as HTMLInputElement;

        const pointsValue = pointsInput.value.trim();
        const hoursValue = hoursInput.value.trim();
        const datetimeValue = datetimeInput.value.trim();

        if (pointsValue === '') {
            resultDiv.textContent = '';
            return;
        }

        const points = parseInt(pointsValue);
        if (isNaN(points) || points < 0) {
            resultDiv.textContent = '無効な入力です。正の数値を入力してください。';
            return;
        }
        if (points % 20 !== 0) {
            resultDiv.textContent = '';
            return;
        }

        let timeInMinutes: number;
        if (selectedMode === 'hours') {
            if (hoursValue === '') {
                resultDiv.textContent = '';
                return;
            }
            const hours = parseInt(hoursValue);
            if (isNaN(hours) || hours < 0) {
                resultDiv.textContent = '無効な入力です。正の数値を入力してください。';
                return;
            }
            timeInMinutes = hours * 60;
        } else {
            if (datetimeValue === '') {
                resultDiv.textContent = '';
                return;
            }
            const datetime = new Date(datetimeValue);
            if (isNaN(datetime.getTime())) {
                resultDiv.textContent = '無効な日時です。';
                return;
            }
            const diffMs = Date.now() - datetime.getTime();
            if (diffMs < 0) {
                resultDiv.textContent = '未来の日時は無効です。';
                return;
            }
            timeInMinutes = Math.floor(diffMs / (1000 * 60));
        }

        try {
            const { timeReward, loans, loanReward } = estimateLoans(points, timeInMinutes, selectedMode === 'datetime');
            resultDiv.innerHTML = `
                <div class="result-loans">編成回数（推定）: ${loans.toLocaleString()}回</div>
                <p>登録時間報酬: ${timeReward.toLocaleString()}</p>
                <p>編成回数報酬: ${loanReward.toLocaleString()}</p>
            `;
        } catch (error) {
            const err = error as Error;
            if (error instanceof NegativeLoanError) {
                resultDiv.textContent = '';
            } else {
                resultDiv.textContent = err.message;
            }
        }
    }
}

export default App;