import { estimateLoans } from './calculator';

class App {
    private debounceTimer: number | null = null;

    constructor() {
        this.init();
    }

    init() {
        const app = document.querySelector('#app')!;
        app.innerHTML = `
      <h1>助っ人貸出回数計算機</h1>
      <div id="calc-form">
        <div>
          <label for="hours">登録時間:</label>
          <input type="number" id="hours" min="0">
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

        const debouncedCalculate = () => {
            if (this.debounceTimer) {
                clearTimeout(this.debounceTimer);
            }
            this.debounceTimer = window.setTimeout(() => {
                this.calculate();
            }, 500);
        };

        pointsInput.addEventListener('input', debouncedCalculate);
        hoursInput.addEventListener('input', debouncedCalculate);
    }

    calculate() {
        const pointsInput = document.querySelector('#points') as HTMLInputElement;
        const hoursInput = document.querySelector('#hours') as HTMLInputElement;
        const resultDiv = document.querySelector('#result')!;

        const pointsValue = pointsInput.value.trim();
        const hoursValue = hoursInput.value.trim();

        if (pointsValue === '' || hoursValue === '') {
            resultDiv.textContent = '';
            return;
        }

        const points = parseInt(pointsValue);
        const hours = parseInt(hoursValue);

        if (isNaN(points) || isNaN(hours) || points < 0 || hours < 0) {
            resultDiv.textContent = '無効な入力です。正の数値を入力してください。';
            return;
        }

        try {
            const { timeReward, loans, loanReward } = estimateLoans(points, hours);
            resultDiv.innerHTML = `
                <div class="result-loans">編成回数（推定）: ${loans.toLocaleString()}回</div>
                <p>登録時間報酬: ${timeReward.toLocaleString()}</p>
                <p>編成回数報酬: ${loanReward.toLocaleString()}</p>
            `;
        } catch (error) {
            const err = error as Error;
            if (err.message === '貸出回数が負です') {
                resultDiv.textContent = '';
            } else {
                resultDiv.textContent = err.message;
            }
        }
    }
}

export default App;