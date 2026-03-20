// 流浪地球主题 - 最终版（样式+特效+配置面板）
(function() {
    if (window.__WE_INITIALIZED) return;
    window.__WE_INITIALIZED = true;

    console.log('[流浪地球] 初始化中...');

    // ==================== 全局样式注入 ====================
    const style = document.createElement('style');
    style.textContent = `
        /* 流浪地球·工业朋克主题样式 */
        :root {
            --we-red: #b84a4a;
            --we-dark-red: #6d2e2e;
            --we-gold: #b88a4a;
            --we-bg-dark: #0a0505;
            --we-bg-panel: #1a0f0f;
            --we-border: #4d3a3a;
            --we-text: #e6e0e0;
            --we-text-dim: #a89797;
        }
        body {
            background-color: var(--we-bg-dark) !important;
            color: var(--we-text) !important;
            font-family: 'Roboto Light', 'Open Sans Light', 'Segoe UI', sans-serif !important;
            font-weight: 300;
            letter-spacing: 0.3px;
        }
        /* 顶栏 */
        .navbar, .topbar {
            background: linear-gradient(0deg, #1a0a0a, #0c0606) !important;
            border-bottom: 2px solid var(--we-red) !important;
            box-shadow: 0 5px 15px rgba(180, 60, 60, 0.3) !important;
        }
        .navbar .nav-link, .navbar .dropdown-toggle {
            color: #c0b0b0 !important;
            border-left: 1px solid #3a2a2a !important;
        }
        .navbar .nav-link:hover {
            color: white !important;
            background: rgba(180, 70, 70, 0.2) !important;
        }
        /* 侧边栏 */
        #rm_characters_block, #rm_info_block {
            background: #130b0b !important;
            border-right: 2px solid #2a1a1a !important;
        }
        .character-name, .char_name {
            color: var(--we-text-dim) !important;
            border-bottom: 1px dashed #3a2a2a !important;
        }
        .character-name:hover, .char_name:hover {
            background: #1f1212 !important;
            color: white !important;
            border-left: 3px solid var(--we-red) !important;
        }
        .active-character, .char_name.active {
            background: #221515 !important;
            border-left: 3px solid var(--we-red) !important;
        }
        /* 聊天消息 */
        .message, .mes {
            background: rgba(20, 10, 10, 0.9) !important;
            border: 1px solid #3a2a2a !important;
            border-left: 5px solid var(--we-red) !important;
            border-radius: 0 8px 8px 0 !important;
            box-shadow: 0 4px 15px rgba(0,0,0,0.8), inset 0 0 20px rgba(150, 50, 50, 0.2) !important;
        }
        .message.user, .mes.user {
            border-left-color: var(--we-gold) !important;
        }
        .message .message-content, .mes .mes-text {
            color: #f0e0e0 !important;
            font-weight: 300;
        }
        /* 输入区域 */
        #send_form {
            background: #130b0b !important;
            border-top: 3px solid var(--we-red) !important;
            box-shadow: 0 -5px 20px rgba(0,0,0,0.9) !important;
        }
        #send_textarea {
            background: #0f0707 !important;
            border: 1px solid #4a2a2a !important;
            color: #f0e0e0 !important;
            font-family: monospace !important;
        }
        .send_button {
            background: linear-gradient(180deg, #8a3a3a, #5a2a2a) !important;
            border: 1px solid #b55a5a !important;
            color: white !important;
        }
        /* 按钮 */
        .btn, .menu_button, .list-group-item, .dropdown-item {
            background: #1f1212 !important;
            border: 1px solid #4a3a3a !important;
            color: #e0d0d0 !important;
        }
        .btn:hover, .menu_button:hover {
            background: #2f1a1a !important;
            border-color: var(--we-red) !important;
        }
        /* 滚动条 */
        ::-webkit-scrollbar {
            width: 8px;
        }
        ::-webkit-scrollbar-track {
            background: #1a0a0a;
        }
        ::-webkit-scrollbar-thumb {
            background: #5a3a3a;
            border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb:hover {
            background: var(--we-red);
        }
        /* 弹窗 */
        .modal-content {
            background: #1f1313 !important;
            border: 2px solid #6d3a3a !important;
        }
        /* 其他微调 */
        input, select, textarea {
            background: #0f0707 !important;
            border: 1px solid #4a2a2a !important;
            color: #f0e0e0 !important;
        }
        input:focus, select:focus, textarea:focus {
            border-color: var(--we-red) !important;
            box-shadow: 0 0 8px var(--we-red) !important;
        }
    `;
    document.head.appendChild(style);

    // ==================== 特效配置 ====================
    const STORAGE_KEY = 'wandering_earth_settings';
    let settings = {
        style: 'star',
        count: 15,
        speed: 3,
        size: 30,
        opacity: 0.35
    };

    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) settings = { ...settings, ...JSON.parse(saved) };
    } catch(e) {}

    function saveSettings() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    }

    // -------------------- 画布与动画 --------------------
    let canvas, ctx, width, height;
    let stars = [];
    let particles = [];
    let animationId = null;

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
            this.teeth = 8 + Math.floor(Math.random() * 4);
        }
        update() {
            this.x += this.vx;
            this.y += this.vy;
            this.angle += this.rotationSpeed;
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
                case 'star': this.drawStar(ctx); break;
                case 'waterdrop': this.drawWaterdrop(ctx); break;
                case 'gear': this.drawGear(ctx); break;
                case 'spark': this.drawSpark(ctx); break;
                case 'triangle': this.drawTriangle(ctx); break;
                default: this.drawStar(ctx);
            }
            ctx.restore();
        }
        drawStar(ctx) {
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

    // -------------------- 配置面板注入（使用酒馆的扩展设置区域） --------------------
    function injectSettings() {
        // 等待酒馆扩展设置容器出现
        const container = document.getElementById('extensions_settings');
        if (!container) {
            setTimeout(injectSettings, 500);
            return;
        }
        // 避免重复添加
        if (document.getElementById('we-settings-panel')) return;

        // 创建折叠内容
        const panelHtml = `
            <div id="we-settings-panel" style="margin: 15px 0; padding: 10px; background: #1a0f0f; border: 1px solid #4a3a3a; border-radius: 8px; color: #e0d0d0;">
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
                <button id="we-reset" class="menu_button" style="margin-top: 5px;">恢复默认</button>
                <div id="we-status" style="margin-top:10px; color:#b84a4a;"></div>
            </div>
        `;

        container.insertAdjacentHTML('beforeend', panelHtml);

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
            Object.assign(settings, newSettings);
            saveSettings();

            if (particles.length !== settings.count || particles[0]?.style !== settings.style) {
                initParticles();
            } else {
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

        styleSelect.value = settings.style;
        countSlider.value = settings.count;
        speedSlider.value = settings.speed;
        sizeSlider.value = settings.size;
        opacitySlider.value = settings.opacity;
        updateDisplay();

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
    }

    // 启动
    startAnimation();
    injectSettings();
    console.log('[流浪地球] 样式、特效、配置面板已加载');
})();
