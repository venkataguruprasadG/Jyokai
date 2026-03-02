import { Scene } from 'phaser';
import { EventBus } from '../EventBus';

export class EarthLevel extends Scene {
    constructor() {
        super('EarthLevel');
        this.firstSelection = null;
        this.secondSelection = null;
        this.canClick = false;
        this.matchedPairs = 0;
        this.moves = 0;
    }

    preload() {
        // 1. Load your new image
        this.load.image('earth_bg', 'assets/EarthLevel.png');
    }

    create() {
        // Reset state
        this.matchedPairs = 0;
        this.moves = 0;
        this.firstSelection = null;
        this.secondSelection = null;
        this.canClick = false;

        // 2. Add Background Image with Proportional Scaling
        const bg = this.add.image(512, 384, 'earth_bg');
        const scale = Math.max(1024 / bg.width, 768 / bg.height);
        bg.setScale(scale);

        // 3. Title
        this.add.text(512, 80, 'Trial of the Earth God', {
            fontFamily: 'Georgia',
            fontSize: '42px',
            color: '#8dff7a',
            stroke: '#224411',
            strokeThickness: 6
        }).setOrigin(0.5);

        // 4. Create the matching grid
        this.createMatchingGrid();

        // 5. Show Instructions
        this.showInstructions();

        EventBus.emit('current-scene-ready', this);
    }

    createMatchingGrid() {
        const colors = [
            0xff0000, 0xff0000, 0x00ff00, 0x00ff00,
            0x0000ff, 0x0000ff, 0xffff00, 0xffff00,
            0xff00ff, 0xff00ff, 0x00ffff, 0x00ffff,
            0xffa500, 0xffa500, 0x7744aa, 0x7744aa
        ];
        const shuffled = Phaser.Utils.Array.Shuffle(colors);

        // ADJUSTED COORDINATES: These center the 4x4 grid on the stone platform
        const gridStartX = 295;
        const gridStartY = 240;
        const cardWidth = 105;
        const cardHeight = 105;
        const spacingX = 145;
        const spacingY = 125;

        for (let i = 0; i < 16; i++) {
            const col = i % 4;
            const row = Math.floor(i / 4);
            const x = gridStartX + col * spacingX;
            const y = gridStartY + row * spacingY;

            // Using a semi-transparent dark stone color for the card backs
            const cardBack = this.add.rectangle(x, y, cardWidth, cardHeight, 0x2b2b24, 0.8);
            cardBack.setStrokeStyle(3, 0x8dff7a, 0.5);

            cardBack.secretColor = shuffled[i];
            cardBack.isMatched = false;
            cardBack.colorDisplay = null;

            cardBack.setInteractive(new Phaser.Geom.Rectangle(0, 0, cardWidth, cardHeight), Phaser.Geom.Rectangle.Contains);
            cardBack.input.cursor = 'pointer';

            cardBack.on('pointerdown', () => {
                if (!this.canClick || cardBack.isMatched || cardBack === this.firstSelection) return;
                this.revealCard(cardBack);

                if (!this.firstSelection) {
                    this.firstSelection = cardBack;
                } else {
                    this.secondSelection = cardBack;
                    this.canClick = false;
                    this.moves++;
                    EventBus.emit('earth-moves-updated', this.moves);
                    this.time.delayedCall(800, () => this.checkMatch());
                }
            });
        }
    }

    // ... showInstructions, revealCard, hideCard, checkMatch, handleWin logic remain the same ...
    showInstructions() {
        const overlay = this.add.container(0, 0);
        overlay.setDepth(1000);
        const dim = this.add.rectangle(512, 384, 1024, 768, 0x000000, 0.7);
        const scroll = this.add.rectangle(512, 384, 600, 400, 0xf5deb3);
        scroll.setStrokeStyle(6, 0x8B7355);

        const title = this.add.text(512, 250, 'THE EARTH TRIAL', {
            fontFamily: 'Georgia', fontSize: '32px', color: '#2b1d14', fontStyle: 'bold'
        }).setOrigin(0.5);

        const rules = this.add.text(512, 360,
            'The forest platform hides 8 pairs of ancient colors.\n\n' +
            '• Reveal two stones to find a match.\n' +
            '• Use your memory to find all pairs.\n' +
            '• Purify the Earth to move forward.',
            { fontFamily: 'Georgia', fontSize: '20px', color: '#4a3728', align: 'center', lineSpacing: 10 }
        ).setOrigin(0.5);

        const btnBg = this.add.rectangle(512, 500, 200, 50, 0x8B7355);
        const btnText = this.add.text(512, 500, 'BEGIN TRIAL', {
            fontFamily: 'Georgia', fontSize: '20px', color: '#f5deb3', fontStyle: 'bold'
        }).setOrigin(0.5);

        btnBg.setInteractive({ useHandCursor: true });
        btnBg.on('pointerdown', () => {
            this.tweens.add({
                targets: overlay, alpha: 0, duration: 400,
                onComplete: () => { overlay.destroy(); this.canClick = true; }
            });
        });
        overlay.add([dim, scroll, title, rules, btnBg, btnText]);
    }

    revealCard(card) {
        if (!card.colorDisplay) {
            card.colorDisplay = this.add.rectangle(card.x, card.y, 95, 95, card.secretColor);
            card.colorDisplay.setStrokeStyle(2, 0xffff00);
        } else {
            card.colorDisplay.setVisible(true);
        }
        this.tweens.add({ targets: card, scale: 1.1, duration: 150 });
    }

    hideCard(card) {
        if (card.colorDisplay) card.colorDisplay.setVisible(false);
        this.tweens.add({ targets: card, scale: 1, duration: 150 });
    }

    checkMatch() {
        if (this.firstSelection.secretColor === this.secondSelection.secretColor) {
            this.matchedPairs++;
            this.firstSelection.isMatched = true;
            this.secondSelection.isMatched = true;
            this.firstSelection.disableInteractive();
            this.secondSelection.disableInteractive();
            this.firstSelection = null;
            this.secondSelection = null;
            this.canClick = true;
            if (this.matchedPairs === 8) this.handleWin();
        } else {
            this.hideCard(this.firstSelection);
            this.hideCard(this.secondSelection);
            this.firstSelection = null;
            this.secondSelection = null;
            this.canClick = true;
        }
    }

    handleWin() {
        this.add.text(512, 384, 'EARTH PURIFIED', {
            fontSize: '64px', color: '#8dff7a', fontFamily: 'Georgia', stroke: '#224411', strokeThickness: 4
        }).setOrigin(0.5);
        this.time.delayedCall(2000, () => this.scene.start('WaterLevel'));
    }
}