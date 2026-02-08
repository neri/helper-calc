import HelperCalcApp from './helper-calc-app';
import TacticalRankCalcApp from './tactical-rank-calc-app';
import ReportCalcApp from './report-calc-app';
import { SubApp } from './sub-app';

class App {
    private currentApp: SubApp | null = null;
    private appContainer: HTMLElement;

    constructor() {
        this.appContainer = document.querySelector('#app')!;
        this.init();
    }

    init() {
        const hashApp = this.normalizeAppFromHash(location.hash);
        const initialApp = hashApp || 'helper';
        document.body.insertAdjacentHTML('afterbegin', `
            <div class="title-bar">
                <button class="hamburger-menu" id="hamburger-btn">
                    <span></span>
                    <span></span>
                    <span></span>
                </button>
                <h2 id="app-title">助っ人貸出回数計算機</h2>
                <div class="app-menu" id="app-menu">
                    <div class="menu-item ${initialApp === 'helper' ? 'active' : ''}" data-app="helper">助っ人貸出回数計算機</div>
                    <div class="menu-item ${initialApp === 'tactical' ? 'active' : ''}" data-app="tactical">対抗戦順位計算機</div>
                    <div class="menu-item ${initialApp === 'report' ? 'active' : ''}" data-app="report">レポート計算機</div>
                    <div class="menu-item" data-action="about">このアプリについて</div>
                </div>
            </div>
            <div class="menu-backdrop" id="menu-backdrop" aria-hidden="true"></div>
            <div class="modal-overlay" id="about-modal" aria-hidden="true">
                <div class="modal-dialog" role="dialog" aria-modal="true" aria-labelledby="about-title">
                    <div class="modal-header">
                        <h3 id="about-title">このアプリについて</h3>
                        <button class="modal-close" id="about-close" aria-label="閉じる">×</button>
                    </div>
                    <div class="modal-body">
                        <p>助っ人計算や対抗戦順位、レポート作成の目安をまとめて扱えるツールです。</p>
                        <p>用途に合わせて上のメニューから切り替えて使ってください。</p>
                        <p>今後の更新で計算精度の改善や便利な補助機能を追加予定です。</p>
                        <p><a href="https://github.com/neri/helper-calc" target="_blank" rel="noopener noreferrer">GitHubで表示</a></p>
                    </div>
                </div>
            </div>
        `);
        this.appContainer.innerHTML = '<div id="sub-app-container"></div>';
        this.bindEvents();
        this.switchApp(initialApp, { updateHash: false });
        this.updateHash(initialApp);
    }

    bindEvents() {
        const hamburgerBtn = document.querySelector('#hamburger-btn') as HTMLElement;
        const appMenu = document.querySelector('#app-menu') as HTMLElement;
        const menuItems = document.querySelectorAll('.menu-item') as NodeListOf<HTMLElement>;
        const appMenuItems = document.querySelectorAll('.menu-item[data-app]') as NodeListOf<HTMLElement>;
        const menuBackdrop = document.querySelector('#menu-backdrop') as HTMLElement | null;
        const aboutModal = document.querySelector('#about-modal') as HTMLElement | null;
        const aboutClose = document.querySelector('#about-close') as HTMLElement | null;

        const openMenu = () => {
            appMenu.classList.add('show');
            menuBackdrop?.classList.add('show');
            menuBackdrop?.setAttribute('aria-hidden', 'false');
        };

        const closeMenu = () => {
            appMenu.classList.remove('show');
            menuBackdrop?.classList.remove('show');
            menuBackdrop?.setAttribute('aria-hidden', 'true');
        };

        hamburgerBtn.addEventListener('click', () => {
            if (appMenu.classList.contains('show')) {
                closeMenu();
                return;
            }
            openMenu();
        });

        const closeAboutModal = () => {
            if (!aboutModal) {
                return;
            }
            aboutModal.classList.remove('show');
            aboutModal.setAttribute('aria-hidden', 'true');
        };

        const openAboutModal = () => {
            if (!aboutModal) {
                return;
            }
            aboutModal.classList.add('show');
            aboutModal.setAttribute('aria-hidden', 'false');
        };

        menuItems.forEach(item => {
            item.addEventListener('click', () => {
                if (item.dataset.app) {
                    const app = item.dataset.app;
                    this.switchApp(app!);
                    // アクティブクラス更新
                    appMenuItems.forEach(mi => mi.classList.remove('active'));
                    item.classList.add('active');
                    closeMenu();
                    return;
                }

                if (item.dataset.action === 'about') {
                    closeMenu();
                    openAboutModal();
                }
            });
        });

        menuBackdrop?.addEventListener('click', closeMenu);

        aboutClose?.addEventListener('click', closeAboutModal);
        aboutModal?.addEventListener('click', event => {
            if (event.target === aboutModal) {
                closeAboutModal();
            }
        });

        document.addEventListener('keydown', event => {
            if (event.key === 'Escape') {
                closeAboutModal();
            }
        });
    }

    switchApp(appName: string, options: { updateHash?: boolean } = {}) {
        const updateHash = options.updateHash !== false;
        if (this.currentApp) {
            this.currentApp.destroy();
        }
        const container = document.querySelector('#sub-app-container') as HTMLElement;
        container.innerHTML = ''; // クリア

        switch (appName) {
            case 'helper':
                this.currentApp = new HelperCalcApp();
                break;
            case 'tactical':
                this.currentApp = new TacticalRankCalcApp();
                break;
            case 'report':
                this.currentApp = new ReportCalcApp();
                break;
            default:
                this.currentApp = new HelperCalcApp();
        }
        this.currentApp.init(container);

        if (updateHash) {
            this.updateHash(appName);
        }

        // タイトルを更新
        const titleElement = document.querySelector('#app-title') as HTMLElement;
        if (titleElement) {
            switch (appName) {
                case 'helper':
                    titleElement.textContent = '助っ人貸出回数計算機';
                    break;
                case 'tactical':
                    titleElement.textContent = '対抗戦順位計算機';
                    break;
                case 'report':
                    titleElement.textContent = 'レポート計算機';
                    break;
                default:
                    titleElement.textContent = '助っ人貸出回数計算機';
            }
        }
    }

    private normalizeAppFromHash(hash: string): string | null {
        const trimmed = hash.replace(/^#/, '').trim();
        if (trimmed === 'helper') {
            return 'helper';
        }
        if (trimmed === 'tactical' || trimmed === 'report') {
            return trimmed;
        }
        return null;
    }

    private updateHash(appName: string) {
        if (location.hash !== `#${appName}`) {
            history.replaceState(null, '', `#${appName}`);
        }
    }
}

export default App;