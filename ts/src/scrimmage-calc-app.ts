import { SubApp } from './sub-app';
import { StorageManager } from './storage-manager';

const WEAPON_TYPES = ['spring', 'hammer', 'barrel', 'pin'] as const;
type WeaponType = typeof WEAPON_TYPES[number];

const RARITIES = ['white', 'blue', 'gold', 'rainbow'] as const;
type Rarity = typeof RARITIES[number];

const WEAPON_LABELS: Record<WeaponType, string> = {
    spring: 'スプリング',
    hammer: 'ハンマー',
    barrel: '銃身',
    pin: '撃針',
};

const RARITY_LABELS: Record<Rarity, string> = {
    white: '白',
    blue: '青',
    gold: '金',
    rainbow: '虹',
};

const RARITY_MULTIPLIERS: Record<Rarity, number> = {
    white: 1,
    blue: 5,
    gold: 20,
    rainbow: 100,
};

const SCHOOL_MAP: Record<'spring' | 'hammer' | 'barrel', string> = {
    spring: 'トリニティ',
    hammer: 'ゲヘナ',
    barrel: 'ミレニアム',
};

const SCHOOL_CLASS_MAP: Record<'spring' | 'hammer' | 'barrel', string> = {
    spring: 'school-trinity',
    hammer: 'school-gehenna',
    barrel: 'school-millennium',
};

class ScrimmageCalc implements SubApp {
    private scrimmageCalcDebounceTimer: number | null = null;
    private scrimmageCalcContainer: HTMLElement | null = null;

    init(container: HTMLElement) {
        this.scrimmageCalcContainer = container;
        this.scrimmageCalcRender();
        this.scrimmageCalcBindEvents();
    }

    destroy() {
        if (this.scrimmageCalcDebounceTimer) {
            clearTimeout(this.scrimmageCalcDebounceTimer);
        }
    }

    private scrimmageCalcGetInputId(weapon: WeaponType, rarity: Rarity): string {
        return `scrimmage-${weapon}-${rarity}`;
    }

    private scrimmageCalcLoadValues(): Record<WeaponType, Record<Rarity, string>> {
        const packed = StorageManager.getScrimmageCalcPacked();
        const parts = packed ? packed.split(',') : [];
        const result = {} as Record<WeaponType, Record<Rarity, string>>;
        let idx = 0;
        for (const weapon of WEAPON_TYPES) {
            result[weapon] = {} as Record<Rarity, string>;
            for (const rarity of RARITIES) {
                result[weapon][rarity] = parts[idx] ?? '';
                idx++;
            }
        }
        return result;
    }

    private scrimmageCalcRender() {
        if (!this.scrimmageCalcContainer) return;

        const values = this.scrimmageCalcLoadValues();

        const sections = WEAPON_TYPES.map(weapon => {
            const pairs = [
                ['white', 'blue'],
                ['gold', 'rainbow'],
            ] as Rarity[][];
            const rows = pairs.map(pair => {
                const cells = pair.map(rarity => {
                    const id = this.scrimmageCalcGetInputId(weapon, rarity);
                    const val = values[weapon][rarity];
                    return `
                        <div class="scrimmage-cell">
                            <label for="${id}">${RARITY_LABELS[rarity]}</label>
                            <input type="number" id="${id}" class="scrimmage-input" min="0" max="999999" step="1" inputmode="numeric" value="${val}" placeholder="0">
                        </div>`;
                }).join('');
                return `<div class="scrimmage-row">${cells}</div>`;
            }).join('');
            return `
                <div class="scrimmage-section">
                    <div class="scrimmage-section-title">${WEAPON_LABELS[weapon]}</div>
                    ${rows}
                </div>`;
        }).join('');

        this.scrimmageCalcContainer.innerHTML = `
            <div id="scrimmage-calc-form">
                <div class="scrimmage-sections">
                    ${sections}
                </div>
                <button id="scrimmage-calc-btn">計算</button>
            </div>
            <div id="scrimmage-calc-error"></div>
            <div id="scrimmage-calc-results"></div>
        `;
    }

    private scrimmageCalcBindEvents() {
        if (!this.scrimmageCalcContainer) return;

        const inputElements = this.scrimmageCalcContainer.querySelectorAll('.scrimmage-input') as NodeListOf<HTMLInputElement>;
        const calculateBtn = this.scrimmageCalcContainer.querySelector('#scrimmage-calc-btn') as HTMLButtonElement;

        const saveToLocalStorage = () => {
            const parts: string[] = [];
            for (const weapon of WEAPON_TYPES) {
                for (const rarity of RARITIES) {
                    const input = this.scrimmageCalcContainer!.querySelector(`#${this.scrimmageCalcGetInputId(weapon, rarity)}`) as HTMLInputElement;
                    parts.push(input.value);
                }
            }
            StorageManager.setScrimmageCalcPacked(parts.join(','));
        };

        const debouncedCalculate = () => {
            if (this.scrimmageCalcDebounceTimer) {
                clearTimeout(this.scrimmageCalcDebounceTimer);
            }
            this.scrimmageCalcDebounceTimer = window.setTimeout(() => {
                this.scrimmageCalcCalculate();
                saveToLocalStorage();
            }, 500);
        };

        inputElements.forEach(input => {
            input.addEventListener('input', () => {
                if (input.value !== '' && Number(input.value) > 999999) {
                    input.value = '999999';
                }
                debouncedCalculate();
            });
        });

        calculateBtn.addEventListener('click', () => {
            this.scrimmageCalcCalculate();
            saveToLocalStorage();
        });
    }

    private scrimmageCalcCalculate() {
        if (!this.scrimmageCalcContainer) return;

        const errorDiv = this.scrimmageCalcContainer.querySelector('#scrimmage-calc-error') as HTMLElement;
        const resultsDiv = this.scrimmageCalcContainer.querySelector('#scrimmage-calc-results') as HTMLElement;

        const values = {} as Record<WeaponType, Record<Rarity, number>>;
        for (const weapon of WEAPON_TYPES) {
            values[weapon] = {} as Record<Rarity, number>;
            for (const rarity of RARITIES) {
                const input = this.scrimmageCalcContainer.querySelector(`#${this.scrimmageCalcGetInputId(weapon, rarity)}`) as HTMLInputElement;
                const parsed = this.scrimmageCalcParseInput(input.value, `${WEAPON_LABELS[weapon]}/${RARITY_LABELS[rarity]}`);
                if (!parsed.ok) {
                    errorDiv.textContent = parsed.message;
                    resultsDiv.innerHTML = '';
                    return;
                }
                values[weapon][rarity] = parsed.value;
            }
        }

        errorDiv.textContent = '';

        const exp = {} as Record<WeaponType, number>;
        for (const weapon of WEAPON_TYPES) {
            exp[weapon] = 15 * RARITIES.reduce((sum, rarity) => {
                return sum + values[weapon][rarity] * RARITY_MULTIPLIERS[rarity];
            }, 0);
        }

        // Determine recommended weapon among spring/hammer/barrel (tie: spring > hammer > barrel)
        const candidates = ['spring', 'hammer', 'barrel'] as const;
        let recommended: 'spring' | 'hammer' | 'barrel' = 'spring';
        let minExp = exp['spring'];
        for (const c of candidates) {
            if (exp[c] < minExp) {
                minExp = exp[c];
                recommended = c;
            }
        }

        const school = SCHOOL_MAP[recommended];
        const schoolClass = SCHOOL_CLASS_MAP[recommended];

        const totalsHtml = WEAPON_TYPES.map(weapon => {
            return `<div><strong>${WEAPON_LABELS[weapon]}：</strong><span class="result-value">${exp[weapon].toLocaleString()}</span> 経験値</div>`;
        }).join('');

        resultsDiv.innerHTML = `
            <div class="report-result-group">
                <div class="report-result-title">学園交流会</div>
                <div><span class="scrimmage-school ${schoolClass}">${school}</span>推奨</div>
            </div>
            <div class="report-result-group">
                <div class="report-result-title">合計</div>
                ${totalsHtml}
            </div>
        `;
    }

    private scrimmageCalcParseInput(value: string, label: string): { ok: true; value: number } | { ok: false; message: string } {
        if (value.trim() === '') {
            return { ok: true, value: 0 };
        }
        const parsed = Number(value);
        if (!Number.isInteger(parsed) || parsed < 0) {
            return { ok: false, message: `${label}は0以上の整数を入力してください。` };
        }
        if (parsed > 999999) {
            return { ok: false, message: `${label}は6桁まで入力してください。` };
        }
        return { ok: true, value: parsed };
    }
}

export default ScrimmageCalc;
