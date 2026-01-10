import HelperCalcApp from './helper-calc-app';
import DummyApp from './dummy-app';
import { SubApp } from './sub-app';

class App {
    private currentApp: SubApp | null = null;
    private appContainer: HTMLElement;

    constructor() {
        this.appContainer = document.querySelector('#app')!;
        this.init();
    }

    init() {
        const savedApp = localStorage.getItem('current-app') || 'calculator';
        document.body.insertAdjacentHTML('afterbegin', `
            <div class="title-bar">
                <button class="hamburger-menu" id="hamburger-btn">
                    <span></span>
                    <span></span>
                    <span></span>
                </button>
                <h2 id="app-title">アプリスイッチャー</h2>
                <div class="app-menu" id="app-menu">
                    <div class="menu-item ${savedApp === 'calculator' ? 'active' : ''}" data-app="calculator">助っ人貸出回数計算機</div>
                    <div class="menu-item ${savedApp === 'dummy' ? 'active' : ''}" data-app="dummy">ダミーアプリ</div>
                </div>
            </div>
        `);
        this.appContainer.innerHTML = '<div id="sub-app-container"></div>';
        this.bindEvents();
        this.switchApp(savedApp);
    }

    bindEvents() {
        const hamburgerBtn = document.querySelector('#hamburger-btn') as HTMLElement;
        const appMenu = document.querySelector('#app-menu') as HTMLElement;
        const menuItems = document.querySelectorAll('.menu-item') as NodeListOf<HTMLElement>;

        hamburgerBtn.addEventListener('click', () => {
            appMenu.classList.toggle('show');
        });

        menuItems.forEach(item => {
            item.addEventListener('click', () => {
                const app = item.dataset.app!;
                this.switchApp(app);
                localStorage.setItem('current-app', app);
                // アクティブクラス更新
                menuItems.forEach(mi => mi.classList.remove('active'));
                item.classList.add('active');
                appMenu.classList.remove('show');
            });
        });
    }

    switchApp(appName: string) {
        if (this.currentApp) {
            this.currentApp.destroy();
        }
        const container = document.querySelector('#sub-app-container') as HTMLElement;
        container.innerHTML = ''; // クリア

        switch (appName) {
            case 'calculator':
                this.currentApp = new HelperCalcApp();
                break;
            case 'dummy':
                this.currentApp = new DummyApp();
                break;
            default:
                this.currentApp = new DummyApp();
        }
        this.currentApp.init(container);

        // タイトルを更新
        const titleElement = document.querySelector('#app-title') as HTMLElement;
        if (titleElement) {
            switch (appName) {
                case 'calculator':
                    titleElement.textContent = '助っ人貸出回数計算機';
                    break;
                case 'dummy':
                    titleElement.textContent = 'ダミーアプリ';
                    break;
                default:
                    titleElement.textContent = 'アプリスイッチャー';
            }
        }
    }
}

export default App;