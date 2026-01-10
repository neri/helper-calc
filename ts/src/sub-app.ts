export interface SubApp {
    init(container: HTMLElement): void;
    destroy(): void;
}