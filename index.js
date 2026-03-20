// 流浪地球主题 - 最终版：方向性粒子 + 可折叠配置面板
(function() {
    if (window.__WE_INITIALIZED) return;
    window.__WE_INITIALIZED = true;

    console.log('[流浪地球] 正在初始化...');

    // ==================== 配置 ====================
    const STORAGE_KEY = 'wandering_earth_settings_v2';
    let settings = {
        style: 'star',       // star, meteor, waterdrop, gear, spark
        count: 12,
        speed: 2,
        size: 35,
        opacity: 0.4,
        panelExpanded: false
    };

    // 加载设置
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            const parsed = JSON.parse(saved);
            settings = { ...settings, ...parsed };
        }
    } catch(e) {}

    function saveSettings() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    }

    // ==================== 画布与动画 ====================
    let canvas, ctx, width, height;
    let stars = [];
    let particles = [];
    let animationId = null;

    // 星星背景（固定，不闪烁干扰）
    function initStars(count = 180) {
        stars = [];
        for (let i = 0; i < count; i++) {
            stars.push({
                x: Math.random() * width,
                y: Math.random() * height,
                radius: Math.random() * 2 + 1,
                brightness: 0.3 + Math.random() * 0.5
            });
        }
    }

    // ========== 粒子类（方向性设计） ==========
    class Particle {
        constructor(style) {
            this.style = style;
            this.reset();
        }
        
        reset() {
            const w = width, h = height;
            
            // 根据样式设定初始位置和方向
            switch(this.style) {
                case 'meteor':
                    // 流星：从屏幕上方随机X，划向下方或侧方
                    this.x = Math.random() * w;
                    this.y = -Math.random() * h * 0.3;
                    this.targetX = this.x + (Math.random() - 0.5) * w * 0.8;
                    this.targetY = h + Math.random() * h * 0.3;
                    this.progress = 0;
                    this.tailLength = 40 + Math.random() * 40;
                    break;
                    
                case 'waterdrop':
                    // 水滴：从上往下飘落，略带水平飘移
                    this.x = Math.random() * w;
                    this.y = -Math.random() * h * 0.2;
                    this.vx = (Math.random() - 0.5) * 1.2;
                    this.vy = 1.5 + Math.random() * 2;
                    this.angle = Math.atan2(this.vy, this.vx);
                    break;
                    
                case 'gear':
                    // 齿轮：缓慢旋转飘移
                    this.x = Math.random() * w;
                    this.y = Math.random() * h;
                    this.vx = (Math.random() - 0.5) * settings.speed * 0.5;
                    this.vy = (Math.random() - 0.5) * settings.speed * 0.5;
                    this.angle = Math.random() * Math.PI * 2;
                    this.rotSpeed = (Math.random() - 0.5) * 0.03;
                    this.teeth = 8 + Math.floor(Math.random() * 5);
                    break;
                    
                case 'spark':
                    // 光点：随机飘移但速度慢
                    this.x = Math.random() * w;
                    this.y = Math.random() * h;
                    this.vx = (Math.random() - 0.5) * 0.8;
                    this.vy = (Math.random() - 0.5) * 0.8;
                    break;
                    
                default: // star
                    this.x = Math.random() * w;
                    this.y = Math.random() * h;
                    this.vx = (Math.random() - 0.5) * settings.speed * 0.4;
                    this.vy = (Math.random() - 0.5) * settings.speed * 0.4;
                    break;
            }
            
            this.size = settings.size * (0.7 + Math.random() * 0.6);
            this.brightness = 0.5 + Math.random() * 0.5;
        }
        
        update() {
            switch(this.style) {
                case 'meteor':
                    this.progress += 0.005 + settings.speed * 0.002;
                    if (this.progress >= 1) {
                        this.reset();
                    } else {
                        this.x = this.x + (this.targetX - this.x) * 0.02;
                        this.y = this.y + (this.targetY - this.y) * 0.02;
                    }
                    break;
                    
                case 'waterdrop':
                    this.x += this.vx;
                    this.y += this.vy;
                    this.angle = Math.atan2(this.vy, this.vx);
                    if (this.y > height + this.size || this.x < -this.size || this.x > width + this.size) {
                        this.reset();
                    }
                    break;
                    
                case 'gear':
                    this.x += this.vx;
                    this.y += this.vy;
                    this.angle += this.rotSpeed;
                    const margin = this.size;
                    if (this.x < -margin) this.x = width + margin;
                    if (this.x > width + margin) this.x = -margin;
                    if (this.y < -margin) this.y = height + margin;
                    if (this.y > height + margin) this.y = -margin;
                    break;
                    
                default:
                    this.x += this.vx;
                    this.y += this.vy;
                    const bound = this.size * 1.5;
                    if (this.x < -bound) this.x = width + bound;
                    if (this.x > width + bound) this.x = -bound;
                    if (this.y < -bound) this.y = height + bound;
                    if (this.y > height + bound) this.y = -bound;
                    break;
            }
        }
        
        draw(ctx) {
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.shadowBlur = 12;
            ctx.shadowColor = `rgba(200, 100, 80, ${settings.opacity * 0.8})`;
            
            switch(this.style) {
                case 'meteor': this.drawMeteor(ctx); break;
                case 'waterdrop': this.drawWaterdrop(ctx); break;
                case 'gear': this.drawGear(ctx); break;
                case 'spark': this.drawSpark(ctx); break;
                default: this.drawStar(ctx);
            }
            
            ctx.restore();
        }
        
        drawStar(ctx) {
            // 纯色渐变十字星 + 光源效果
            const w = this.size;
            const h = this.size * 0.16;
            
            // 径向渐变模拟光源
            const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, w * 0.5);
            grad.addColorStop(0, '#fff5e6');
            grad.addColorStop(0.5, '#e6b87e');
            grad.addColorStop(1, '#b84a4a');
            
            ctx.fillStyle = grad;
            ctx.shadowBlur = 18;
            
            // 水平条
            ctx.beginPath();
            ctx.ellipse(0, 0, w/2, h/2, 0, 0, Math.PI * 2);
            ctx.fill();
            
            // 垂直条
            ctx.beginPath();
            ctx.ellipse(0, 0, h/2, w/2, 0, 0, Math.PI * 2);
            ctx.fill();
            
            // 中心高光
            ctx.beginPath();
            ctx.arc(0, 0, this.size * 0.12, 0, Math.PI * 2);
            ctx.fillStyle = 'white';
            ctx.fill();
        }
        
        drawMeteor(ctx) {
            // 长尾迹流星：方向性明确
            const length = this.tailLength;
            const angle = Math.atan2(this.targetY - this.y, this.targetX - this.x);
            
            ctx.rotate(angle);
            
            // 尾迹渐变（头部亮白，尾部暗红）
            const grad = ctx.createLinearGradient(-length/2, 0, length/2, 0);
            grad.addColorStop(0, `rgba(255, 220, 160, ${0.8 * settings.opacity})`);
            grad.addColorStop(0.5, `rgba(200, 100, 80, ${0.5 * settings.opacity})`);
            grad.addColorStop(1, `rgba(100, 40, 30, 0)`);
            
            ctx.beginPath();
            ctx.moveTo(-length/2, 0);
            ctx.lineTo(length/2, -this.size/3);
            ctx.lineTo(length/2, this.size/3);
            ctx.closePath();
            ctx.fillStyle = grad;
            ctx.fill();
            
            // 头部亮点
            ctx.beginPath();
            ctx.arc(length/2, 0, this.size/3, 0, Math.PI * 2);
            ctx.fillStyle = '#ffcc88';
            ctx.fill();
        }
        
        drawWaterdrop(ctx) {
            // 镜面水滴：尖锐头部 + 高光反射
            const w = this.size * 0.9;
            const h = this.size * 1.3;
            
            ctx.rotate(this.angle);
            
            // 水滴路径
            ctx.beginPath();
            ctx.moveTo(0, -h/2);  // 顶部尖点
            ctx.quadraticCurveTo(w/2, -h/3, w/2, 0);
            ctx.quadraticCurveTo(w/2, h/2, 0, h/2);
            ctx.quadraticCurveTo(-w/2, h/2, -w/2, 0);
            ctx.quadraticCurveTo(-w/2, -h/3, 0, -h/2);
            ctx.closePath();
            
            // 镜面渐变（模拟金属反射）
            const grad = ctx.createLinearGradient(-w/3, -h/3, w/3, h/3);
            grad.addColorStop(0, '#c0e0ff');
            grad.addColorStop(0.3, '#88aadd');
            grad.addColorStop(0.6, '#446688');
            grad.addColorStop(1, '#224455');
            ctx.fillStyle = grad;
            ctx.fill();
            
            // 主高光
            ctx.beginPath();
            ctx.ellipse(-w*0.15, -h*0.2, w*0.12, h*0.1, 0, 0, Math.PI*2);
            ctx.fillStyle = `rgba(255, 255, 245, ${0.7 * settings.opacity})`;
            ctx.fill();
            
            // 二次高光
            ctx.beginPath();
            ctx.ellipse(w*0.1, h*0.05, w*0.08, h*0.07, 0, 0, Math.PI*2);
            ctx.fillStyle = `rgba(255, 255, 245, ${0.4 * settings.opacity})`;
            ctx.fill();
        }
        
        drawGear(ctx) {
            // 精密齿轮轮廓
            const r = this.size / 2;
            const rInner = r * 0.7;
            const teeth = this.teeth;
            
            ctx.rotate(this.angle);
            
            // 齿形路径
            ctx.beginPath();
            for (let i = 0; i < teeth; i++) {
                const angle = (i / teeth) * Math.PI * 2;
                const angleNext = ((i + 0.5) / teeth) * Math.PI * 2;
                const anglePrev = ((i - 0.5) / teeth) * Math.PI * 2;
                
                const x1 = r * Math.cos(angle);
                const y1 = r * Math.sin(angle);
                const x2 = rInner * Math.cos(angleNext);
                const y2 = rInner * Math.sin(angleNext);
                const x3 = rInner * Math.cos(anglePrev);
                const y3 = rInner * Math.sin(anglePrev);
                
                if (i === 0) ctx.moveTo(x1, y1);
                else ctx.lineTo(x1, y1);
                ctx.lineTo(x2, y2);
                ctx.lineTo(x3, y3);
            }
            ctx.closePath();
            
            // 金属渐变
            const grad = ctx.createRadialGradient(-r*0.2, -r*0.2, 0, 0, 0, r);
            grad.addColorStop(0, '#ccaa77');
            grad.addColorStop(0.5, '#886644');
            grad.addColorStop(1, '#553322');
            ctx.fillStyle = grad;
            ctx.fill();
            
            ctx.strokeStyle = '#332211';
            ctx.lineWidth = 1.5;
            ctx.stroke();
            
            // 轴心
            ctx.beginPath();
            ctx.arc(0, 0, r*0.2, 0, Math.PI*2);
            ctx.fillStyle = '#332211';
            ctx.fill();
            ctx.beginPath();
            ctx.arc(0, 0, r*0.08, 0, Math.PI*2);
            ctx.fillStyle = '#ffdd99';
            ctx.fill();
        }
        
        drawSpark(ctx) {
            // 柔和光点
            const r = this.size / 2;
            const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, r);
            grad.addColorStop(0, '#ffeecc');
            grad.addColorStop(0.4, '#ffaa88');
            grad.addColorStop(0.8, '#884433');
            grad.addColorStop(1, 'rgba(0,0,0,0)');
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(0, 0, r, 0, Math.PI * 2);
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
            ctx.beginPath();
            ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 230, 200, ${s.brightness * 0.6})`;
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
            initStars(180);
            initParticles();
        }
    }
    
    function startAnimation() {
        if (canvas) return;
        canvas = document.createElement('canvas');
        canvas.id = 'we-canvas-v2';
        canvas.style.cssText = `
            position: fixed; top: 0; left: 0;
            width: 100%; height: 100%;
            z-index: -1; pointer-events: none;
            opacity: ${settings.opacity};
        `;
        document.body.appendChild(canvas);
        ctx = canvas.getContext('2d');
        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();
        animate();
    }
    
    function stopAnimation() {
        if (animationId) cancelAnimationFrame(animationId);
        if (canvas) canvas.remove();
        canvas = null;
        ctx = null;
    }
    
    // ==================== 配置面板（可折叠） ====================
    let settingsPanel = null;
    let panelVisible = false;
    
    function togglePanel() {
        const container = document.getElementById('extensions_settings');
        if (!container) return;
        
        if (!settingsPanel) {
            settingsPanel = document.createElement('div');
            settingsPanel.id = 'we-settings-panel-v2';
            settingsPanel.style.cssText = `
                margin: 15px 0;
                background: #1a0f0f;
                border: 1px solid #4a3a3a;
                border-radius: 8px;
                overflow: hidden;
                transition: all 0.2s;
            `;
            container.appendChild(settingsPanel);
            renderPanelContent();
        }
        
        panelVisible = !panelVisible;
        settingsPanel.style.display = panelVisible ? 'block' : 'none';
        settings.panelExpanded = panelVisible;
        saveSettings();
    }
    
    function renderPanelContent() {
        if (!settingsPanel) return;
        
        settingsPanel.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px 15px; background: #2a1a1a; cursor: pointer;" id="we-panel-header">
                <h3 style="margin: 0; font-size: 14px; color: #b84a4a;">⚙️ 流浪地球·粒子特效</h3>
                <span id="we-panel-arrow" style="color: #b84a4a; font-size: 16px;">${panelVisible ? '▼' : '▶'}</span>
            </div>
            <div id="we-panel-body" style="padding: 15px; display: ${panelVisible ? 'block' : 'none'};">
                <div style="margin-bottom: 12px;">
                    <label style="color: #b09090;">粒子样式</label>
                    <select id="we-style" style="width:100%; background:#0f0707; color:#e0d0d0; border:1px solid #4a3a3a; padding:6px;">
                        <option value="star" ${settings.style === 'star' ? 'selected' : ''}>✨ 十字星（纯色渐变）</option>
                        <option value="meteor" ${settings.style === 'meteor' ? 'selected' : ''}>☄️ 流星（长尾迹）</option>
                        <option value="waterdrop" ${settings.style === 'waterdrop' ? 'selected' : ''}>💧 水滴（镜面质感）</option>
                        <option value="gear" ${settings.style === 'gear' ? 'selected' : ''}>⚙️ 齿轮（精密工业）</option>
                        <option value="spark" ${settings.style === 'spark' ? 'selected' : ''}>🌟 光点</option>
                    </select>
                </div>
                <div style="margin-bottom: 12px;">
                    <label style="color: #b09090;">粒子数量 <span id="we-count-val">${settings.count}</span></label>
                    <input type="range" id="we-count" min="5" max="35" step="1" value="${settings.count}" style="width:100%;">
                </div>
                <div style="margin-bottom: 12px;">
                    <label style="color: #b09090;">移动速度 <span id="we-speed-val">${settings.speed}</span></label>
                    <input type="range" id="we-speed" min="0.5" max="4" step="0.5" value="${settings.speed}" style="width:100%;">
                </div>
                <div style="margin-bottom: 12px;">
                    <label style="color: #b09090;">粒子大小 <span id="we-size-val">${settings.size}</span></label>
                    <input type="range" id="we-size" min="20" max="60" step="5" value="${settings.size}" style="width:100%;">
                </div>
                <div style="margin-bottom: 12px;">
                    <label style="color: #b09090;">透明度 <span id="we-opacity-val">${settings.opacity}</span></label>
                    <input type="range" id="we-opacity" min="0.2" max="0.6" step="0.05" value="${settings.opacity}" style="width:100%;">
                </div>
                <button id="we-reset" class="menu_button" style="margin-top:5px;">恢复默认</button>
                <div id="we-status" style="margin-top:10px; color:#b84a4a; font-size:12px;"></div>
            </div>
        `;
        
        // 绑定折叠事件
        const header = document.getElementById('we-panel-header');
        header.addEventListener('click', () => {
            panelVisible = !panelVisible;
            const body = document.getElementById('we-panel-body');
            const arrow = document.getElementById('we-panel-arrow');
            if (body) body.style.display = panelVisible ? 'block' : 'none';
            if (arrow) arrow.innerHTML = panelVisible ? '▼' : '▶';
            settings.panelExpanded = panelVisible;
            saveSettings();
        });
        
        // 绑定控件事件
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
                opacity: parseFloat(opacitySlider.value),
                panelExpanded: settings.panelExpanded
            };
            Object.assign(settings, newSettings);
            saveSettings();
            
            // 更新画布透明度
            if (canvas) canvas.style.opacity = settings.opacity;
            
            // 完全重建粒子（样式/数量变化时）
            if (particles.length !== settings.count || particles[0]?.style !== settings.style) {
                initParticles();
            } else {
                particles.forEach(p => {
                    p.size = settings.size * (0.7 + Math.random() * 0.6);
                    if (p.style === 'meteor') {
                        p.tailLength = 40 + Math.random() * 40;
                    }
                });
            }
            
            statusDiv.innerText = '✓ 已应用';
            setTimeout(() => statusDiv.innerText = '', 1500);
        }
        
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
            countSlider.value = 12;
            speedSlider.value = 2;
            sizeSlider.value = 35;
            opacitySlider.value = 0.4;
            updateDisplay();
            applySettings();
        });
    }
    
    // ==================== 注入扩展列表入口 ====================
    function injectExtensionEntry() {
        const container = document.getElementById('extensions_menu');
        if (!container) {
            setTimeout(injectExtensionEntry, 1000);
            return;
        }
        
        const existingEntry = document.getElementById('we-menu-entry');
        if (existingEntry) return;
        
        const entry = document.createElement('div');
        entry.id = 'we-menu-entry';
        entry.style.cssText = `
            padding: 8px 15px;
            cursor: pointer;
            color: #e0d0d0;
            border-bottom: 1px solid #3a2a2a;
            transition: background 0.2s;
        `;
        entry.innerHTML = '🌌 流浪地球·粒子特效';
        entry.onmouseover = () => entry.style.background = '#2a1a1a';
        entry.onmouseout = () => entry.style.background = 'transparent';
        entry.onclick = togglePanel;
        
        container.appendChild(entry);
        
        // 如果之前是展开状态，恢复面板
        if (settings.panelExpanded) {
            setTimeout(() => togglePanel(), 500);
        }
    }
    
    // ==================== 启动 ====================
    startAnimation();
    injectExtensionEntry();
    
    console.log('[流浪地球] 特效已启动，点击扩展菜单中的条目可打开配置面板');
})();
