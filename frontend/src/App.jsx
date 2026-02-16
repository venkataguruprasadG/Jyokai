import { useRef, useState, useEffect } from 'react';
import { PhaserGame } from './PhaserGame';
import { EventBus } from './game/EventBus';

function App() {
    const [moves, setMoves] = useState(0);
    const [levelStatus, setLevelStatus] = useState('Earth Trial');
    const [isGameOver, setIsGameOver] = useState(false);

    const phaserRef = useRef();

    useEffect(() => {
        // Earth Level Listener
        EventBus.on('earth-moves-updated', (moveCount) => {
            setMoves(moveCount);
            setLevelStatus('Earth Trial');
        });

        // Water Level Listener
        EventBus.on('water-progress', (round) => {
            setMoves(round);
            setLevelStatus(`Water Trial: Round ${round} / 5`);
        });

        // Fire Level Listener
        EventBus.on('fire-power', (score) => {
            setMoves(score);
            setLevelStatus(`Fire Trial: Power ${score} / 5`);
        });

        // Game Complete Listener
        EventBus.on('game-complete', () => {
            setIsGameOver(true);
            setLevelStatus('WORLD PURIFIED');
        });

        return () => {
            EventBus.removeListener('earth-moves-updated');
            EventBus.removeListener('water-progress');
            EventBus.removeListener('fire-power');
            EventBus.removeListener('game-complete');
        };
    }, []);

    const restartGame = () => {
        setIsGameOver(false);
        setMoves(0);
        setLevelStatus('Earth Trial');

        // Tell Phaser to jump back to the main menu
        if (phaserRef.current.scene) {
            phaserRef.current.scene.scene.start('MainMenu');
        }
    };

    return (
        <div id="app" style={{ position: 'relative', width: '100%', height: '100vh', backgroundColor: '#000' }}>
            <PhaserGame ref={phaserRef} />

            {/* Spirit Scroll Stats Overlay - Parchment Style */}
            <div style={{
                position: 'absolute',
                top: '20px',
                left: '20px',
                width: '280px',
                padding: '20px',
                background: 'linear-gradient(135deg, rgba(245, 222, 179, 0.95) 0%, rgba(210, 180, 140, 0.95) 100%)',
                border: '3px solid #8B7355',
                borderRadius: '8px',
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.6), inset 0 1px 1px rgba(255, 255, 255, 0.3)',
                backdropFilter: 'blur(10px)',
                fontFamily: '"Georgia", "Garamond", serif',
                pointerEvents: 'none',
                color: '#2b1d14'
            }}>
                {/* Parchment texture effect */}
                <div style={{
                    position: 'absolute',
                    top: '0',
                    left: '0',
                    right: '0',
                    bottom: '0',
                    backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'100\' height=\'100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' seed=\'2\' /%3E%3C/filter%3E%3Crect width=\'100\' height=\'100\' filter=\'url(%23noiseFilter)\' opacity=\'0.05\' /%3E%3C/svg%3E")',
                    backgroundRepeat: 'repeat',
                    borderRadius: '6px',
                    pointerEvents: 'none'
                }}></div>

                {/* Content - relative positioning over texture */}
                <div style={{ position: 'relative', zIndex: 1 }}>
                    {/* Decorative header */}
                    <div style={{
                        textAlign: 'center',
                        marginBottom: '12px',
                        paddingBottom: '12px',
                        borderBottom: '2px solid #8B7355',
                        fontSize: '20px',
                        fontWeight: 'bold',
                        letterSpacing: '1px'
                    }}>
                        📜 JYOKAI SCROLL
                    </div>

                    {/* Trial information */}
                    <div style={{
                        marginBottom: '10px',
                        fontSize: '14px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                        <span style={{ fontWeight: '600' }}>Trial:</span>
                        <span style={{
                            color: '#8dff7a',
                            fontStyle: 'italic',
                            fontWeight: 'bold',
                            textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)'
                        }}>
                            {levelStatus}
                        </span>
                    </div>

                    {/* Progress information */}
                    <div style={{
                        marginBottom: '8px',
                        fontSize: '14px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                        <span style={{ fontWeight: '600' }}>Progress:</span>
                        <span style={{
                            fontSize: '26px',
                            fontWeight: 'bold',
                            color: '#d4af37',
                            textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)'
                        }}>
                            {moves}
                        </span>
                    </div>

                    {/* Decorative divider */}
                    <div style={{
                        height: '1px',
                        background: 'linear-gradient(to right, transparent, #8B7355, transparent)',
                        margin: '10px 0'
                    }}></div>

                    {/* Flavor text */}
                    <div style={{
                        fontSize: '12px',
                        textAlign: 'center',
                        color: '#5c4033',
                        fontStyle: 'italic',
                        marginTop: '8px'
                    }}>
                        Test the limits of your mind
                    </div>
                </div>
            </div>

            {/* Victory Overlay */}
            {isGameOver && (
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    backgroundColor: 'rgba(0, 0, 0, 0.9)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    zIndex: 100,
                    backdropFilter: 'blur(5px)'
                }}>
                    {/* Decorative top border */}
                    <div style={{
                        position: 'absolute',
                        top: '100px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: '400px',
                        height: '2px',
                        background: 'linear-gradient(to right, transparent, #d4af37, transparent)'
                    }}></div>

                    <h1 style={{
                        color: '#d4af37',
                        fontSize: '64px',
                        fontFamily: '"Georgia", "Garamond", serif',
                        textAlign: 'center',
                        marginBottom: '20px',
                        textShadow: '0 4px 8px rgba(0, 0, 0, 0.8), 0 0 20px rgba(212, 175, 55, 0.3)',
                        letterSpacing: '2px'
                    }}>
                        THE JYOKAI IS PURIFIED
                    </h1>
                    <p style={{
                        color: '#f0e6d2',
                        fontSize: '20px',
                        marginBottom: '30px',
                        fontFamily: '"Georgia", serif',
                        textShadow: '0 2px 4px rgba(0, 0, 0, 0.6)',
                        maxWidth: '600px',
                        textAlign: 'center'
                    }}>
                        The Gods are pleased with your memory, focus, and unwavering spirit.
                    </p>
                    <button
                        onClick={restartGame}
                        style={{
                            padding: '18px 50px',
                            fontSize: '24px',
                            backgroundColor: '#d4af37',
                            color: '#2b1d14',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontWeight: 'bold',
                            fontFamily: '"Georgia", "Garamond", serif',
                            boxShadow: '0 4px 15px rgba(212, 175, 55, 0.4)',
                            transition: 'all 0.3s ease',
                            outline: 'none',
                            letterSpacing: '1px'
                        }}
                        onMouseOver={(e) => {
                            e.target.style.backgroundColor = '#f4d03f';
                            e.target.style.transform = 'scale(1.05)';
                            e.target.style.boxShadow = '0 6px 20px rgba(212, 175, 55, 0.6)';
                        }}
                        onMouseOut={(e) => {
                            e.target.style.backgroundColor = '#d4af37';
                            e.target.style.transform = 'scale(1)';
                            e.target.style.boxShadow = '0 4px 15px rgba(212, 175, 55, 0.4)';
                        }}
                    >
                        RETURN TO WORLD
                    </button>

                    {/* Decorative bottom border */}
                    <div style={{
                        position: 'absolute',
                        bottom: '100px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: '400px',
                        height: '2px',
                        background: 'linear-gradient(to right, transparent, #d4af37, transparent)'
                    }}></div>
                </div>
            )}
        </div>
    );
}

export default App;