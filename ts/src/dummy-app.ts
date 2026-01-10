import { SubApp } from './sub-app';

class DummyApp implements SubApp {
    private container: HTMLElement | null = null;

    init(container: HTMLElement) {
        this.container = container;
        this.render();
    }

    destroy() {
        // 特にクリーンアップ不要
    }

    private render() {
        if (!this.container) return;
        this.container.innerHTML = `
            <div style="text-align: center; padding: 50px;">
                <h2>ダミーアプリ</h2>
                <p>これは空白表示するだけのダミーアプリです。</p>
            </div>
        `;
    }
}

export default DummyApp;