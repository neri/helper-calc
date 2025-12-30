import { estimateLoans } from './calculator';

class App {
    constructor() {
        this.init();
    }

    init() {
        const app = document.querySelector('#app')!;
        app.innerHTML = `
      <h1>助っ人貸出回数計算機</h1>
      <div id="calc-form">
        <div>
          <label for="points">現在の報酬:</label>
          <input type="number" id="points" min="0">
        </div>
        <div>
          <label for="hours">経過時間 (時間):</label>
          <input type="number" id="hours" min="0">
        </div>
      </div>
      <div id="result"></div>
    `;
        this.bindEvents();
    }

    bindEvents() {
        const pointsInput = document.querySelector('#points') as HTMLInputElement;
        const hoursInput = document.querySelector('#hours') as HTMLInputElement;

        pointsInput.addEventListener('input', () => this.calculate());
        hoursInput.addEventListener('input', () => this.calculate());
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
            const { min, max } = estimateLoans(points, hours);
            resultDiv.textContent = `推定貸し出し回数: ${min}〜${max}回`;
        } catch (error) {
            resultDiv.textContent = '計算エラー: ' + (error as Error).message;
        }
    }
}

export default App;