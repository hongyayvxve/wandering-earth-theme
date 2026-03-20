// 流浪地球主题扩展 - 星空 + 粒子特效 + 内置配置面板
import { getContext } from '../../../extensions.js';
import { registerExtension, saveSettingsDebounced } from '../../../script.js';

const extensionName = 'wandering-earth-theme';

// 默认设置
let settings = {
    style: 'star',
    count: 15,
    speed: 3,
    size: 30,
    opacity: 0.35
};

// 全局变量
let canvas, ctx, width, height;
let stars = [];
let particles = [];
let animationId = null;

// ========== 星星背景初始化 ==========
function initStars(starCount = 250) {
    stars = [];
    for (let i = 0; i < starCount; i++) {
        stars.push({
            x: Math.random() * width,
            y: Math.random() * height,
            radius: Math.random() * 2.5 + 0.8,
            alpha: Math.random() * 0.7 + 0.2,
            flickerSpeed: 0.01 + Math.random() * 0.03,
            phase: Math.random() * Math.PI * 2
        });
    }
}

// ========== 粒子类（精致版） ==========
class Particle {
    constructor(style) {
        this.style = style;
        this.reset();
    }
    reset() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        const speedBase = settings.speed * 0.8;
        this.vx = (Math.random() - 0.5) * speedBase * 1.5;
        this.vy = (Math.random() - 0.5) * speedBase * 1.5;
        this.size = settings.size * (0.6 + Math.random() * 0.5);
        this.angle = Math.random() * Math.PI * 2;
        this.rotationSpeed = (Math.random() - 0.5) * 0.01;
        this.brightness = 0.5 + Math.random() * 0.5;
        // 水滴特有
        this.reflectPos = Math.random();
        // 齿轮特有
        this.teeth = 8 + Math.floor(Math.random() * 4);
    }
    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.angle += this.rotationSpeed;

        // 边界循环
        const margin = this.size * 2;
        if (this.x < -margin) this.x = width + margin;
        if (this.x > width + margin) this.x = -margin;
        if (this.y < -margin) this.y = height + margin;
        if (this.y > height + margin) this.y = -margin;
    }
    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);
        ctx.globalAlpha = this.brightness * settings.opacity;
        ctx.shadowColor = 'rgba(200, 140, 140, 0.6)';
        ctx.shadowBlur = 15;

        switch (this.style) {
            case 'star':
                this.drawStar(ctx);
                break;
            case 'waterdrop':
                this.drawWaterdrop(ctx);
                break;
            case 'gear':
                this.drawGear(ctx);
                break;
            case 'spark':
                this.drawSpark(ctx);
                break;
            case 'triangle':
                this.drawTriangle(ctx);
                break;
            default:
                this.drawStar(ctx);
        }
        ctx.restore();
    }
    drawStar(ctx) {
        // 精致十字星：两个细长椭圆交叉，带中心高光
        const w = this.size;
        const h = this.size * 0.18;
        
        const gradH = ctx.createLinearGradient(-w/2, 0, w/2, 0);
        gradH.addColorStop(0, 'rgba(255, 230, 200, 0.3)');
        gradH.addColorStop(0.3, 'rgba(255, 240, 210, 0.9)');
        gradH.addColorStop(0.7, 'rgba(255, 240, 210, 0.9)');
        gradH.addColorStop(1, 'rgba(255, 230, 200, 0.3)');
        ctx.fillStyle = gradH;
        ctx.beginPath();
        ctx.ellipse(0, 0, w/2, h/2, 0, 0, Math.PI * 2);
        ctx.fill();
        
        const gradV = ctx.createLinearGradient(0, -w/2, 0, w/2);
        gradV.addColorStop(0, 'rgba(255, 230, 200, 0.3)');
        gradV.addColorStop(0.3, 'rgba(255, 240, 210, 0.9)');
        gradV.addColorStop(0.7, 'rgba(255, 240, 210, 0.9)');
        gradV.addColorStop(1, 'rgba(255, 230, 200, 0.3)');
        ctx.fillStyle = gradV;
        ctx.beginPath();
        ctx.ellipse(0, 0, h/2, w/2, 0, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.beginPath();
        ctx.arc(0, 0, this.size * 0.1, 0, Math.PI * 2);
        ctx.fillStyle = 'white';
        ctx.shadowBlur = 20;
        ctx.fill();
    }
    drawWaterdrop(ctx) {
        const w = this.size * 0.8;
        const h = this.size * 1.2;
        const grad = ctx.createRadialGradient(-w*0.2, -h*0.2, 0, 0, 0, w);
        grad.addColorStop(0, '#ddeeff');
        grad.addColorStop(0.4, '#aaccff');
        grad.addColorStop(0.8, '#6688aa');
        grad.addColorStop(1, '#335577');
        ctx.beginPath();
        ctx.ellipse(0, 0, w/2, h/2, 0, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();
        
        ctx.beginPath();
        ctx.ellipse(-w*0.15, -h*0.15, w*0.15, h*0.15, 0, 0, Math.PI*2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(w*0.1, h*0.1, w*0.08, h*0.08, 0, 0, Math.PI*2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.fill();
    }
    drawGear(ctx) {
        const r = this.size / 2;
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI * 2);
        const grad = ctx.createRadialGradient(-r*0.3, -r*0.3, 0, 0, 0, r);
        grad.addColorStop(0, '#ccaa88');
        grad.addColorStop(0.7, '#886644');
        grad.addColorStop(1, '#553322');
        ctx.fillStyle = grad;
        ctx.fill();
        
        ctx.fillStyle = '#aa7744';
        for (let i = 0; i < this.teeth; i++) {
            const angle = (i / this.teeth) * Math.PI * 2;
            const dx = Math.cos(angle) * r * 1.2;
            const dy = Math.sin(angle) * r * 1.2;
            ctx.beginPath();
            ctx.ellipse(dx, dy, r*0.2, r*0.25, 0, 0, Math.PI*2);
            ctx.fill();
        }
        ctx.beginPath();
        ctx.arc(0, 0, r*0.3, 0, Math.PI*2);
        ctx.fillStyle = '#332211';
        ctx.fill();
        ctx.beginPath();
        ctx.arc(0, 0, r*0.1, 0, Math.PI*2);
        ctx.fillStyle = '#eeddcc';
        ctx.fill();
    }
    drawSpark(ctx) {
        const r = this.size / 2;
        const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, r);
        grad.addColorStop(0, '#ffeecc');
        grad.addColorStop(0.3, '#ffccaa');
        grad.addColorStop(0.7, '#aa8866');
        grad.addColorStop(1, 'rgba(100, 70, 50, 0)');
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.shadowBlur = 25;
        ctx.fill();
    }
    drawTriangle(ctx) {
        ctx.beginPath();
        ctx.moveTo(this.size, 0);
        ctx.lineTo(-this.size/2, -this.size/3);
        ctx.lineTo(-this.size/2, this.size/3);
        ctx.closePath();
        const grad = ctx.createLinearGradient(this.size/2, 0, -this.size/2, 0);
        grad.addColorStop(0, '#ffaa88');
        grad.addColorStop(0.7, '#884422');
        ctx.fillStyle = grad;
        ctx.fill();
    }
}

// ========== 特效核心 ==========
function initParticles() {
    particles = [];
    for (let i = 0; i < settings.count; i++) {
        particles.push(new Particle(settings.style));
    }
}

function drawStars() {
    stars.forEach(s => {
        const brightness = s.alpha + Math.sin(Date.now() * s.flickerSpeed + s.phase) * 0.15;
        const limited = Math.max(0.2, Math.min(1, brightness));
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 240, 210, ${limited})`;
        ctx.shadowBlur = 5;
        ctx.shadowColor = 'rgba(200, 180, 160, 0.3)';
        ctx.fill();
    });
}

function animate() {
    if (!ctx) return;
    ctx.clearRect(0, 0, width, height);
    drawStars();
    particles.forEach(p => {
        p.update();
        p.draw(ctx);
    });
    animationId = requestAnimationFrame(animate);
}

function resizeCanvas() {
    width = window.innerWidth;
    height = window.innerHeight;
    if (canvas) {
        canvas.width = width;
        canvas.height = height;
        initStars(250);
        initParticles();
    }
}

function startAnimation() {
    if (canvas) return;
    canvas = document.createElement('canvas');
    canvas.id = 'we-canvas';
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.zIndex = '-1';
    canvas.style.pointerEvents = 'none';
    document.body.appendChild(canvas);
    ctx = canvas.getContext('2d');
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
    animate();
}

function stopAnimation() {
    if (animationId) {
        cancelAnimationFrame(animationId);
        animationId = null;
    }
    if (canvas) {
        canvas.remove();
        canvas = null;
        ctx = null;
    }
}

// ========== 配置面板渲染 ==========
function renderSettings() {
    const container = document.getElementById('extensions_settings');
    if (!container) return;

    // 生成HTML
    const html = `
        <div id="we-settings-panel" style="margin: 15px 0; padding: 10px; background: #1a0f0f; border: 1px solid #4a3a3a; border-radius: 8px;">
            <h3 style="margin-top:0; color:#b84a4a;">⚙️ 流浪地球·粒子特效配置</h3>
            <div style="margin-bottom:12px;">
                <label>粒子样式</label>
                <select id="we-style" style="width:100%; background:#0f0707; color:#e0d0d0; border:1px solid #4a3a3a; padding:5px;">
                    <option value="star">✨ 闪烁十字星</option>
                    <option value="waterdrop">💧 三体水滴</option>
                    <option value="gear">⚙️ 机械齿轮</option>
                    <option value="spark">🌟 光点</option>
                    <option value="triangle">▲ 流星(经典)</option>
                </select>
            </div>
            <div style="margin-bottom:12px;">
                <label>粒子数量 <span id="we-count-val">${settings.count}</span></label>
                <input type="range" id="we-count" min="5" max="40" step="1" value="${settings.count}" style="width:100%;">
            </div>
            <div style="margin-bottom:12px;">
                <label>移动速度 <span id="we-speed-val">${settings.speed}</span></label>
                <input type="range" id="we-speed" min="0.5" max="6" step="0.5" value="${settings.speed}" style="width:100%;">
            </div>
            <div style="margin-bottom:12px;">
                <label>粒子大小 <span id="we-size-val">${settings.size}</span></label>
                <input type="range" id="we-size" min="15" max="80" step="5" value="${settings.size}" style="width:100%;">
            </div>
            <div style="margin-bottom:12px;">
                <label>背景透明度 <span id="we-opacity-val">${settings.opacity}</span></label>
                <input type="range" id="we-opacity" min="0.15" max="0.6" step="0.05" value="${settings.opacity}" style="width:100%;">
            </div>
            <button id="we-reset" class="menu_button">恢复默认</button>
            <div id="we-status" style="margin-top:10px; color:#b84a4a;"></div>
        </div>
    `;

    // 检查是否已存在，避免重复添加
    if (document.getElementById('we-settings-panel')) return;
    container.insertAdjacentHTML('beforeend', html);

    // 绑定事件
    const styleSelect = document.getElementById('we-style');
    const countSlider = document.getElementById('we-count');
    const speedSlider = document.getElementById('we-speed');
    const sizeSlider = document.getElementById('we-size');
    const opacitySlider = document.getElementById('we-opacity');
    const resetBtn = document.getElementById('we-reset');
    const statusDiv = document.getElementById('we-status');

    function updateDisplay() {
        document.getElementById('we-count-val').innerText = countSlider.value;
        document.getElementById('we-speed-val').innerText = speedSlider.value;
        document.getElementById('we-size-val').innerText = sizeSlider.value;
        document.getElementById('we-opacity-val').innerText = opacitySlider.value;
    }

    function applySettings() {
        const newSettings = {
            style: styleSelect.value,
            count: parseInt(countSlider.value, 10),
            speed: parseFloat(speedSlider.value),
            size: parseInt(sizeSlider.value, 10),
            opacity: parseFloat(opacitySlider.value)
        };
        // 更新全局
        settings = newSettings;
        // 保存到酒馆
        const context = getContext();
        context.extensionSettings[extensionName] = settings;
        saveSettingsDebounced();

        // 重新生成粒子（数量和样式变化时需要完全重建）
        if (particles.length !== settings.count || particles[0]?.style !== settings.style) {
            initParticles();
        } else {
            // 只更新速度和大小
            particles.forEach(p => {
                const speedBase = settings.speed * 0.8;
                p.vx = (Math.random() - 0.5) * speedBase * 1.5;
                p.vy = (Math.random() - 0.5) * speedBase * 1.5;
                p.size = settings.size * (0.6 + Math.random() * 0.5);
            });
        }
        if (canvas) canvas.style.opacity = settings.opacity;

        statusDiv.innerText = '✓ 已应用';
        setTimeout(() => statusDiv.innerText = '', 1500);
    }

    styleSelect.addEventListener('change', applySettings);
    countSlider.addEventListener('input', updateDisplay);
    speedSlider.addEventListener('input', updateDisplay);
    sizeSlider.addEventListener('input', updateDisplay);
    opacitySlider.addEventListener('input', updateDisplay);
    countSlider.addEventListener('change', applySettings);
    speedSlider.addEventListener('change', applySettings);
    sizeSlider.addEventListener('change', applySettings);
    opacitySlider.addEventListener('change', applySettings);

    resetBtn.addEventListener('click', () => {
        styleSelect.value = 'star';
        countSlider.value = 15;
        speedSlider.value = 3;
        sizeSlider.value = 30;
        opacitySlider.value = 0.35;
        updateDisplay();
        applySettings();
    });

    updateDisplay();
}

// ========== 扩展注册 ==========
registerExtension(extensionName, {
    onLoad: () => {
        // 加载已保存的设置
        const context = getContext();
        const saved = context.extensionSettings[extensionName];
        if (saved) {
            settings = { ...settings, ...saved };
        }
        // 启动特效
        startAnimation();
        // 渲染配置面板
        renderSettings();
    },
    onUnload: () => {
        stopAnimation();
    }
});
