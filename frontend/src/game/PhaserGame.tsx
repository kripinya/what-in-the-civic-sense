import React, { useEffect, useRef, useState } from 'react';
import * as Phaser from 'phaser';
import { config } from './config';
import { getMissions, updateScore } from '../api';

interface PhaserGameProps {
    user: any;
    onExit: () => void;
    onScoreUpdate: () => void;
}

export const PhaserGame: React.FC<PhaserGameProps> = ({ user, onExit, onScoreUpdate }) => {
    const gameRef = useRef<Phaser.Game | null>(null);
    const [missionData, setMissionData] = useState<any>(null);

    useEffect(() => {
        // Fetch mission based on level
        const fetchMission = async () => {
            try {
                const missions = await getMissions(user.current_level);
                if (missions && missions.length > 0) {
                    setMissionData(missions[0]);
                }
            } catch (e) {
                console.error("Failed to load missions", e);
            }
        };
        fetchMission();
    }, [user.current_level]);

    useEffect(() => {
        if (!missionData) return;

        if (gameRef.current === null) {
            gameRef.current = new Phaser.Game({
                ...config,
                callbacks: {
                    preBoot: (game) => {
                        game.registry.set('missionData', missionData);
                        game.registry.set('user', user);

                        // Listen for custom events from scenes
                        game.events.on('MISSION_COMPLETE', async (scoresEarned: any) => {
                            try {
                                await updateScore(user.user_id, missionData.mission_id, scoresEarned);
                                onScoreUpdate();
                            } catch (e) {
                                console.error("Score update failed", e);
                            }
                        });
                    }
                }
            });
        }

        return () => {
            if (gameRef.current) {
                gameRef.current.destroy(true);
                gameRef.current = null;
            }
        };
    }, [missionData]);

    return (
        <div className="pixel-panel">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <h3>Mission: {missionData?.title || 'Loading...'}</h3>
                <button className="pixel-btn" style={{ backgroundColor: '#ef4444' }} onClick={onExit}>EXIT</button>
            </div>
            <p style={{ fontSize: '12px', marginBottom: '10px' }}>{missionData?.description}</p>

            {!missionData && <div>Loading Mission Data...</div>}
            <div id="game-container" className="game-container"></div>
        </div>
    );
};
