// 音频管理器 - 使用Tone.js生成音效
class AudioManager {
    constructor() {
        this.initialized = false;
        this.synth = null;
        this.noiseSynth = null;
        this.metalSynth = null;
        this.missileSynth = null;
        this.bgm = null;
        this.bgmPlaying = false;
        this.currentMusicType = 'epic';
    }

    async init() {
        if (this.initialized) return;

        try {
            await Tone.start();

            this.synth = new Tone.PolySynth(Tone.Synth, {
                oscillator: { type: "sawtooth" },
                envelope: { attack: 0.01, decay: 0.1, sustain: 0, release: 0.1 }
            }).toDestination();
            this.synth.volume.value = -10;

            this.noiseSynth = new Tone.NoiseSynth({
                noise: { type: "brown" },
                envelope: { attack: 0.01, decay: 0.3, sustain: 0, release: 0.5 }
            }).toDestination();
            this.noiseSynth.volume.value = -5;

            this.metalSynth = new Tone.MetalSynth({
                frequency: 200,
                envelope: { attack: 0.001, decay: 0.1, release: 0.01 },
                harmonicity: 5.1,
                modulationIndex: 32,
                resonance: 4000,
                octaves: 1.5
            }).toDestination();
            this.metalSynth.volume.value = -15;

            this.missileSynth = new Tone.PolySynth(Tone.Synth, {
                oscillator: { type: "square" },
                envelope: { attack: 0.05, decay: 0.5, sustain: 0.2, release: 1.0 }
            }).toDestination();
            this.missileSynth.volume.value = -8;

            this.bgm = new Tone.PolySynth(Tone.Synth, {
                oscillator: { type: "triangle" },
                envelope: { attack: 0.05, decay: 0.2, sustain: 0.3, release: 1 }
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
            this.synth.triggerAttackRelease(["C5", "E5"], "32n");
        } catch (e) {}
    }

    playMissileLaunch() {
        if (!this.initialized) return;
        try {
            const now = Tone.now();
            this.missileSynth.triggerAttackRelease("C3", "8n", now);
            this.missileSynth.triggerAttackRelease("G2", "8n", now + 0.1);
            this.missileSynth.triggerAttackRelease("C2", "4n", now + 0.2);
        } catch (e) {}
    }

    playHit() {
        if (!this.initialized) return;
        try {
            this.metalSynth.triggerAttackRelease("16n");
        } catch (e) {}
    }

    playExplosion() {
        if (!this.initialized) return;
        try {
            this.noiseSynth.triggerAttackRelease("8n");
            this.synth.triggerAttackRelease(["C2", "G2"], "8n");
        } catch (e) {}
    }

    playWin() {
        if (!this.initialized) return;
        try {
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
            const now = Tone.now();
            this.synth.triggerAttackRelease("G4", "8n", now);
            this.synth.triggerAttackRelease("E4", "8n", now + 0.2);
            this.synth.triggerAttackRelease("C4", "4n", now + 0.4);
        } catch (e) {}
    }

    playStart() {
        if (!this.initialized) return;
        try {
            const now = Tone.now();
            this.synth.triggerAttackRelease("C4", "16n", now);
            this.synth.triggerAttackRelease("G4", "16n", now + 0.1);
            this.synth.triggerAttackRelease("C5", "8n", now + 0.2);
        } catch (e) {}
    }

    startBGM(musicType) {
        if (!this.initialized || this.bgmPlaying) return;

        this.currentMusicType = musicType || 'epic';

        try {
            Tone.Transport.cancel();

            switch(this.currentMusicType) {
                case 'epic':
                    this.createEpicBGM();
                    break;
                case 'rock':
                    this.createRockBGM();
                    break;
                case 'electronic':
                    this.createElectronicBGM();
                    break;
                case 'orchestral':
                    this.createOrchestralBGM();
                    break;
                default:
                    this.createEpicBGM();
            }

            Tone.Transport.bpm.value = 120;
            Tone.Transport.start();
            this.bgmPlaying = true;
        } catch (e) {}
    }

    createEpicBGM() {
        // 史诗战歌 - 雄壮的和弦进行
        const loop = new Tone.Loop((time) => {
            this.bgm.triggerAttackRelease(["C3", "G3", "C4"], "2n", time);
            this.bgm.triggerAttackRelease(["F3", "A3", "C4"], "2n", time + 0.5);
            this.bgm.triggerAttackRelease(["G3", "B3", "D4"], "2n", time + 1.0);
            this.bgm.triggerAttackRelease(["C3", "G3", "E4"], "1n", time + 1.5);
        }, "2n").start(0);
    }

    createRockBGM() {
        // 摇滚风暴 - 强烈的节奏
        const loop = new Tone.Loop((time) => {
            this.bgm.triggerAttackRelease(["E3", "B3"], "8n", time);
            this.bgm.triggerAttackRelease(["E3", "B3"], "8n", time + 0.25);
            this.bgm.triggerAttackRelease(["A3", "E4"], "8n", time + 0.5);
            this.bgm.triggerAttackRelease(["A3", "E4"], "8n", time + 0.75);
            this.bgm.triggerAttackRelease(["G3", "D4"], "4n", time + 1.0);
        }, "1n").start(0);
    }

    createElectronicBGM() {
        // 电子脉冲 - 合成器风格
        const loop = new Tone.Loop((time) => {
            this.bgm.triggerAttackRelease(["C4", "E4"], "16n", time);
            this.bgm.triggerAttackRelease(["G4", "B4"], "16n", time + 0.125);
            this.bgm.triggerAttackRelease(["F4", "A4"], "16n", time + 0.25);
            this.bgm.triggerAttackRelease(["C4", "E4"], "8n", time + 0.375);
        }, "2n").start(0);
    }

    createOrchestralBGM() {
        // 交响乐章 - 管弦乐风格
        const loop = new Tone.Loop((time) => {
            this.bgm.triggerAttackRelease(["C3", "E3", "G3"], "4n", time);
            this.bgm.triggerAttackRelease(["F3", "A3", "C4"], "4n", time + 0.5);
            this.bgm.triggerAttackRelease(["G3", "B3", "D4"], "4n", time + 1.0);
            this.bgm.triggerAttackRelease(["C3", "G3", "C4", "E4"], "2n", time + 1.5);
        }, "2n").start(0);
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
