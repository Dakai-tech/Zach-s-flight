# 歼-20 空战王者 - 3D战斗机射击游戏

[![Game](https://img.shields.io/badge/Play-Online-blue)](https://yourusername.github.io/j20-fighter-game)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

一款基于 Three.js 的 3D 飞机射击游戏，支持跨平台游玩（PC、iPad、手机）。

## 🎮 游戏特性

### 多国战机
- 🇨🇳 **中国** - 歼-20 (J-20) - 鸭式布局，双发重型隐身战斗机
- 🇺🇸 **美国** - F-22 猛禽 - 梯形翼，双发隐身战斗机
- 🇯🇵 **日本** - F-2 支援战斗机 - 单发多用途战斗机
- 🇫🇷 **法国** - 阵风 Rafale - 三角翼+鸭式布局多用途战斗机
- 🇷🇺 **俄罗斯** - 苏-57 (Su-57) - 可动前缘，双发重型战斗机

### 游戏模式
- **五局三胜制**：与AI对手进行最多5回合的空战
- **AI智能对手**：具有多种战术状态（追击、躲避、攻击、撤退）
- **难度递增**：每回合AI难度逐渐提升

### 操作方式

#### 键盘控制（PC）
- `↑` / `↓` / `←` / `→` 或 `W` / `A` / `S` / `D` - 控制飞机方向
- `空格键` - 射击

#### 触摸控制（手机/平板）
- 左下角虚拟摇杆 - 控制飞机方向
- 右下角红色按钮 - 射击

### 技术特点
- **Three.js 3D渲染**：真实的3D战机模型和战场环境
- **物理碰撞检测**：精确的子弹命中判定
- **粒子特效**：爆炸效果、引擎尾焰
- **动态光影**：实时光照和阴影
- **自适应布局**：支持各种屏幕尺寸

## 🚀 在线游玩

直接访问 GitHub Pages 链接即可游玩：
```
https://yourusername.github.io/j20-fighter-game
```

## 📦 本地部署

### 方法1：直接打开
1. 下载项目文件
2. 双击 `index.html` 即可在浏览器中打开

### 方法2：本地服务器
```bash
# 使用 Python 3
cd j20-fighter-game
python -m http.server 8000

# 或使用 Node.js
npx serve

# 然后访问 http://localhost:8000
```

## 🛠️ 技术栈

- **Three.js** - 3D图形渲染引擎
- **Tone.js** - 音频合成与音效
- **原生 JavaScript** - 游戏逻辑
- **CSS3** - UI界面和动画

## 📁 项目结构

```
j20-fighter-game/
├── index.html          # 主入口文件
├── css/
│   └── style.css       # 游戏样式
├── js/
│   ├── fighter-models.js   # 3D战机模型生成器
│   ├── game-engine.js      # 游戏引擎核心
│   ├── ai-controller.js    # AI敌人控制器
│   ├── audio-manager.js    # 音频管理器
│   └── main.js            # 主入口脚本
└── README.md
```

## 🎯 游戏攻略

1. **保持距离**：不要离敌人太近，保持10-20单位的距离最佳
2. **预判射击**：考虑敌人的移动方向，提前射击
3. **利用机动**：使用方向键进行规避机动
4. **观察AI状态**：AI会切换不同战术，注意其行动模式
5. **难度递增**：每回合AI会变得更聪明，调整你的策略

## 📝 更新日志

### v1.0.0
- 初始版本发布
- 5种战机模型
- 完整的3D空战体验
- 跨平台支持

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License

---

**注意**：战机模型为简化几何体表示，旨在展示各国战机的外形特征。
