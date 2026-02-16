import { Scene } from 'phaser';
import { EventBus } from '../EventBus';

export class EarthLevel extends Scene {
    constructor() {
        super('EarthLevel');
        this.firstSelection = null;
        this.secondSelection = null;
        this.canClick = true;
        this.matchedPairs = 0;
        this.moves = 0;
    }

    create() {
        // Reset state
        this.matchedPairs = 0;
        this.moves = 0;
        this.firstSelection = null;
        this.secondSelection = null;
        this.canClick = true;

        // Background
        this.add.rectangle(512, 384, 1024, 768, 0x1a1a14);

        // Title - FIXED: y: 100, setOrigin(0.5)
        this.add.text(512, 100, 'Trial of the Earth God', {
            fontFamily: 'Georgia',
            fontSize: '42px',
            color: '#8dff7a',
            stroke: '#224411',
            strokeThickness: 6
        }).setOrigin(0.5);

        // Create the matching grid
        this.createMatchingGrid();

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

        // Grid layout
        const gridStartX = 250;
        const gridStartY = 250;
        const cardWidth = 120;
        const cardHeight = 120;
        const spacingX = 150;
        const spacingY = 130;

        for (let i = 0; i < 16; i++) {
            const col = i % 4;
            const row = Math.floor(i / 4);
            const x = gridStartX + col * spacingX;
            const y = gridStartY + row * spacingY;

            // Create card back (dark rectangle)
            const cardBack = this.add.rectangle(x, y, cardWidth, cardHeight, 0x444433);
            cardBack.setStrokeStyle(2, 0x666655);

            // Store card state
            cardBack.secretColor = shuffled[i];
            cardBack.isMatched = false;
            cardBack.colorDisplay = null;

            // CRITICAL: Use setInteractive with proper hit area for instant click detection
            cardBack.setInteractive(
                new Phaser.Geom.Rectangle(-cardWidth / 2, -cardHeight / 2, cardWidth, cardHeight),
                Phaser.Geom.Rectangle.Contains
            );
            cardBack.input.cursor = 'pointer';

            // Click handler
            cardBack.on('pointerdown', () => {
                if (!this.canClick || cardBack.isMatched || cardBack === this.firstSelection) {
                    return;
                }

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

            // Hover effect
            cardBack.on('pointerover', () => {
                if (!cardBack.isMatched && cardBack !== this.firstSelection && this.canClick) {
                    cardBack.setScale(1.05);
                }
            });

            cardBack.on('pointerout', () => {
                if (cardBack.scale !== 1.1) {
                    cardBack.setScale(1);
                }
            });
        }
    }

    revealCard(card) {
        // Create color display on the card
        if (!card.colorDisplay) {
            card.colorDisplay = this.add.rectangle(card.x, card.y, 110, 110, card.secretColor);
            card.colorDisplay.setStrokeStyle(2, 0xffff00);
        } else {
            card.colorDisplay.setVisible(true);
        }

        // Scale animation
        this.tweens.add({
            targets: card,
            scale: 1.1,
            duration: 150
        });
    }

    hideCard(card) {
        if (card.colorDisplay) {
            card.colorDisplay.setVisible(false);
        }
        this.tweens.add({
            targets: card,
            scale: 1,
            duration: 150
        });
    }

    checkMatch() {
        if (this.firstSelection.secretColor === this.secondSelection.secretColor) {
            // MATCH FOUND!
            this.matchedPairs++;
            this.firstSelection.isMatched = true;
            this.secondSelection.isMatched = true;

            // VISUAL: Add shining tween to matched stones
            this.addShiningEffect(this.firstSelection);
            this.addShiningEffect(this.secondSelection);

            // Disable click on matched cards
            this.firstSelection.disableInteractive();
            this.secondSelection.disableInteractive();

            this.firstSelection = null;
            this.secondSelection = null;
            this.canClick = true;

            // WIN CONDITION: Check if all 8 pairs are found
            if (this.matchedPairs === 8) {
                this.handleWin();
            }
        } else {
            // NO MATCH: Flip back
            this.hideCard(this.firstSelection);
            this.hideCard(this.secondSelection);

            this.firstSelection = null;
            this.secondSelection = null;
            this.canClick = true;
        }
    }

    addShiningEffect(card) {
        // Shining tween: scale pulse with opacity
        this.tweens.add({
            targets: card,
            scale: 1.15,
            duration: 300,
            yoyo: true,
            ease: 'Back.easeInOut'
        });

        // Add a shine flash effect
        if (card.colorDisplay) {
            this.tweens.add({
                targets: card.colorDisplay,
                alpha: 0.6,
                duration: 300,
                yoyo: true
            });
        }
    }

    handleWin() {
        this.add.text(512, 384, 'EARTH PURIFIED', {
            fontSize: '64px',
            color: '#8dff7a',
            fontFamily: 'Georgia',
            stroke: '#224411',
            strokeThickness: 4
        }).setOrigin(0.5);

        // Transition to Water Level
        this.time.delayedCall(2000, () => {
            this.scene.start('WaterLevel');
        });
    }
}