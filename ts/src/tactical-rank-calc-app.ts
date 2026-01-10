import { SubApp } from './sub-app';
import {
    calculateMultipleRanks,
    getReward,
    calculateMinimumStoneBreak
} from './tactical-rank-calc-calculator';
import { StorageManager } from './storage-manager';

class TacticalRankCalcApp implements SubApp {
    private tacticalRankCalcDebounceTimer: number | null = null;
    private tacticalRankCalcContainer: HTMLElement | null = null;

    init(container: HTMLElement) {
        this.tacticalRankCalcContainer = container;
        this.tacticalRankCalcRender();
        this.tacticalRankCalcBindEvents();
    }

    destroy() {
        if (this.tacticalRankCalcDebounceTimer) {
            clearTimeout(this.tacticalRankCalcDebounceTimer);
        }
    }

    private tacticalRankCalcRender() {
        if (!this.tacticalRankCalcContainer) return;

        const savedRank = StorageManager.getTacticalRankCalcRank() || '';
        const savedIterations = StorageManager.getTacticalRankCalcIterations();

        this.tacticalRankCalcContainer.innerHTML = `
            <div id="tactical-rank-calc-form">
                <div>
                    <label for="tactical-rank-input">現在の順位:</label>
                    <input type="number" id="tactical-rank-input" min="1" max="15001" placeholder="15001" value="${savedRank}">
                </div>
                <div class="iterations-container">
                    <label for="tactical-iterations-select">挑戦回数:</label>
                    <select id="tactical-iterations-select">
                        ${Array.from({ length: 25 }, (_, i) => i + 1)
                .map(i => `<option value="${i}" ${i === savedIterations ? 'selected' : ''}>${i}</option>`)
                .join('')}
                    </select>
                </div>
                <button id="tactical-calculate-btn">計算</button>
            </div>
            <div id="tactical-error"></div>
            <div id="tactical-results"></div>
            <div id="tactical-rewards"></div>
            <div id="tactical-stone-calc"></div>
        `;
    }

    private tacticalRankCalcBindEvents() {
        if (!this.tacticalRankCalcContainer) return;

        const rankInput = this.tacticalRankCalcContainer.querySelector('#tactical-rank-input') as HTMLInputElement;
        const iterationsSelect = this.tacticalRankCalcContainer.querySelector('#tactical-iterations-select') as HTMLSelectElement;
        const calculateBtn = this.tacticalRankCalcContainer.querySelector('#tactical-calculate-btn') as HTMLButtonElement;

        const debouncedCalculate = () => {
            if (this.tacticalRankCalcDebounceTimer) {
                clearTimeout(this.tacticalRankCalcDebounceTimer);
            }
            this.tacticalRankCalcDebounceTimer = window.setTimeout(() => {
                this.tacticalRankCalcCalculate();
            }, 500);
        };

        rankInput.addEventListener('input', () => {
            if (rankInput.value) {
                StorageManager.setTacticalRankCalcRank(parseInt(rankInput.value, 10));
            }
            debouncedCalculate();
        });

        iterationsSelect.addEventListener('change', () => {
            StorageManager.setTacticalRankCalcIterations(parseInt(iterationsSelect.value, 10));
            debouncedCalculate();
        });

        calculateBtn.addEventListener('click', () => {
            this.tacticalRankCalcCalculate();
        });
    }

    private tacticalRankCalcCalculate() {
        if (!this.tacticalRankCalcContainer) return;

        const rankInput = this.tacticalRankCalcContainer.querySelector('#tactical-rank-input') as HTMLInputElement;
        const iterationsSelect = this.tacticalRankCalcContainer.querySelector('#tactical-iterations-select') as HTMLSelectElement;
        const errorDiv = this.tacticalRankCalcContainer.querySelector('#tactical-error') as HTMLElement;
        const resultsDiv = this.tacticalRankCalcContainer.querySelector('#tactical-results') as HTMLElement;
        const rewardsDiv = this.tacticalRankCalcContainer.querySelector('#tactical-rewards') as HTMLElement;
        const stoneCalcDiv = this.tacticalRankCalcContainer.querySelector('#tactical-stone-calc') as HTMLElement;

        const rankValue = rankInput.value.trim();
        if (rankValue === '') {
            errorDiv.textContent = '';
            resultsDiv.innerHTML = '';
            rewardsDiv.innerHTML = '';
            stoneCalcDiv.innerHTML = '';
            return;
        }

        const rank = parseInt(rankValue, 10);
        if (isNaN(rank) || rank < 1 || rank > 15001) {
            errorDiv.textContent = '1から15001までの範囲で入力してください。';
            resultsDiv.innerHTML = '';
            rewardsDiv.innerHTML = '';
            stoneCalcDiv.innerHTML = '';
            return;
        }

        errorDiv.textContent = '';

        const iterations = parseInt(iterationsSelect.value, 10);
        const results = calculateMultipleRanks(rank, iterations);

        // 計算結果を表示
        const resultsHTML = results
            .map((r, i) => `<div>${i + 1}回目：${r}位</div>`)
            .join('');
        resultsDiv.innerHTML = resultsHTML;

        // 報酬を計算して表示
        const currentReward = getReward(rank);
        const finalRank = results[results.length - 1];
        const finalReward = getReward(finalRank);

        let rewardsHTML = `<div>現在の報酬見込: 石${currentReward.stone} コイン${currentReward.coin}</div>`;
        if (finalRank !== rank) {
            rewardsHTML += `<div>最終報酬見込: 石${finalReward.stone} コイン${finalReward.coin}</div>`;
        }
        rewardsDiv.innerHTML = rewardsHTML;

        // 石割り計算を表示
        const actualIterations = results.length;
        const minStoneBreak = calculateMinimumStoneBreak(actualIterations);

        let stoneCalcHTML = '';
        if (minStoneBreak > 0) {
            const stoneCount = minStoneBreak * 60;
            stoneCalcHTML = `<div>最低石割り：${minStoneBreak}回 ${stoneCount}個</div>`;
        }
        stoneCalcDiv.innerHTML = stoneCalcHTML;
    }
}

export default TacticalRankCalcApp;