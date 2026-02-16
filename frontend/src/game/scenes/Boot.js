import { Scene } from 'phaser';

export class Boot extends Scene {
    constructor() {
        super('Boot');
    }

    preload() {
        // Boot scene - no assets to load since we use only Phaser geometric shapes
        // All assets are generated at runtime to avoid loading errors
    }

    create() {
        // Display boot screen with geometric shapes
        this.add.rectangle(512, 384, 1024, 768, 0x0a0a0a);

        // Simple loading indicator
        this.add.circle(512, 350, 30, 0xd4af37);
        this.add.text(512, 450, 'Initializing Jyokai...', {
            fontFamily: 'Georgia',
            fontSize: '24px',
            color: '#d4af37'
        }).setOrigin(0.5);

        // Move to MainMenu directly
        this.scene.start('MainMenu');
    }
}
