// 音频管理器 - 使用Tone.js生成音效
class AudioManager {
    constructor() {
        this.initialized = false;
        this.synth = null;
        this.noiseSynth = null;
        this.metalSynth = null;
        this.bgm = null;
        this.bgmPlaying = false;
    }

    async init() {
        if (this.initialized) return;

        try {
            await Tone.start();

            // 主合成器 - 用于射击音效
            this.synth = new Tone.PolySynth(Tone.Synth, {
                oscillator: {
                    type: "sawtooth"
                },
                envelope: {
                    attack: 0.01,
                    decay: 0.1,
                    sustain: 0,
                    release: 0.1
                }
            }).toDestination();
            this.synth.volume.value = -10;

            // 噪声合成器 - 用于爆炸音效
            this.noiseSynth = new Tone.NoiseSynth({
                noise: {
                    type: "brown"
                },
                envelope: {
                    attack: 0.01,
                    decay: 0.3,
                    sustain: 0,
                    release: 0.5
                }
            }).toDestination();
            this.noiseSynth.volume.value = -5;

            // 金属合成器 - 用于命中音效
            this.metalSynth = new Tone.MetalSynth({
                frequency: 200,
                envelope: {
                    attack: 0.001,
                    decay: 0.1,
                    release: 0.01
                },
                harmonicity: 5.1,
                modulationIndex: 32,
                resonance: 4000,
                octaves: 1.5
            }).toDestination();
            this.metalSynth.volume.value = -15;

            // 导弹发射音效合成器
            this.missileSynth = new Tone.PolySynth(Tone.Synth, {
                oscillator: {
                    type: "square"
                },
                envelope: {
                    attack: 0.05,
                    decay: 0.5,
                    sustain: 0.2,
                    release: 1.0
                }
            }).toDestination();
            this.missileSynth.volume.value = -8;

            // 背景音乐合成器
            this.bgm = new Tone.PolySynth(Tone.Synth, {
                oscillator: {
                    type: "triangle"
                },
                envelope: {
                    attack: 0.05,
                    decay: 0.2,
                    sustain: 0.3,
                    release: 1
                }
            }).toDestination();
            this.bgm.volume.value = -20;

            this.initialized = true;
        } catch (e) {
            console.warn('音频初始化失败:', e);
        }
    }

    playShoot() {
        if (!this.initialized) return;

        try {
            // 快速高音 - 机炮声音
            this.synth.triggerAttackRelease(["C5", "E5"], "32n");
        } catch (e) {}
    }

    playMissileLaunch() {
        if (!this.initialized) return;

        try {
            // 导弹发射音效 - 低沉的呼啸声
            const now = Tone.now();
            this.missileSynth.triggerAttackRelease("C3", "8n", now);
            this.missileSynth.triggerAttackRelease("G2", "8n", now + 0.1);
            this.missileSynth.triggerAttackRelease("C2", "4n", now + 0.2);
        } catch (e) {}
    }

    playHit() {
        if (!this.initialized) return;

        try {
            // 金属撞击声
            this.metalSynth.triggerAttackRelease("16n");
        } catch (e) {}
    }

    playExplosion() {
        if (!this.initialized) return;

        try {
            // 爆炸声
            this.noiseSynth.triggerAttackRelease("8n");

            // 低音轰鸣
            this.synth.triggerAttackRelease(["C2", "G2"], "8n");
        } catch (e) {}
    }

    playWin() {
        if (!this.initialized) return;

        try {
            // 胜利音效
            const now = Tone.now();
            this.synth.triggerAttackRelease("C4", "8n", now);
            this.synth.triggerAttackRelease("E4", "8n", now + 0.15);
            this.synth.triggerAttackRelease("G4", "8n", now + 0.3);
            this.synth.triggerAttackRelease("C5", "4n", now + 0.45);
        } catch (e) {}
    }

    playLose() {
        if (!this.initialized) return;

        try {
            // 失败音效
            const now = Tone.now();
            this.synth.triggerAttackRelease("G4", "8n", now);
            this.synth.triggerAttackRelease("E4", "8n", now + 0.2);
            this.synth.triggerAttackRelease("C4", "4n", now + 0.4);
        } catch (e) {}
    }

    playStart() {
        if (!this.initialized) return;

        try {
            // 开始音效
            const now = Tone.now();
            this.synth.triggerAttackRelease("C4", "16n", now);
            this.synth.triggerAttackRelease("G4", "16n", now + 0.1);
            this.synth.triggerAttackRelease("C5", "8n", now + 0.2);
        } catch (e) {}
    }

    startBGM() {
        if (!this.initialized || this.bgmPlaying) return;

        try {
            // 简单的战斗背景音乐
            const loop = new Tone.Loop((time) => {
                this.bgm.triggerAttackRelease(["C3", "G3"], "8n", time);
                this.bgm.triggerAttackRelease(["E3", "B3"], "8n", time + 0.5);
            }, "1n").start(0);

            Tone.Transport.bpm.value = 120;
            Tone.Transport.start();
            this.bgmPlaying = true;
        } catch (e) {}
    }

    stopBGM() {
        if (!this.initialized) return;

        try {
            Tone.Transport.stop();
            Tone.Transport.cancel();
            this.bgmPlaying = false;
        } catch (e) {}
    }
}

// 导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AudioManager;
}
