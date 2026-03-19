// 流浪地球主题扩展 - 可配置粒子特效
(function() {
    const canvasId = 'we-canvas';
    let canvas, ctx, width, height;
    let particles = [];
    let animationFrame;
    let currentSettings = {
        style: 'star',
        count: 15,
        speed: 3,
        size: 30,
        opacity: 0.4
    };

    // ========== 从酒馆加载设置 ==========
    function loadSettings() {
        try {
            const context = window.SillyTavern?.getContext?.();
            if (context && context.extensionSettings && context.extensionSettings['wandering-earth-theme']) {
                currentSettings = { ...currentSettings, ...context.extensionSettings['wandering-earth-theme'] };
            }
        } catch (e) {
            console.warn('加载设置失败', e);
        }
    }

    // ========== 保存设置 ==========
    function saveSettings() {
        const context = window.SillyTavern?.getContext?.();
        if (context) {
            context.extensionSettings['wandering-earth-theme'] = currentSettings;
            context.saveSettings();
        }
    }

    // ========== 粒子类 ==========
    class Particle {
        constructor(style) {
            this.style = style;
            this.reset();
        }
        reset() {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            this.vx = (Math.random() - 0.5) * currentSettings.speed * 1.5;
            this.vy = (Math.random() - 0.5) * currentSettings.speed * 1.5;
            this.size = currentSettings.size * (0.7 + Math.random() * 0.6);
            this.angle = Math.random() * Math.PI * 2;
            this.rotationSpeed = (Math.random() - 0.5) * 0.02;
            this.brightness = 0.5 + Math.random() * 0.5;
            this.flickerSpeed = 0.01 + Math.random() * 0.03;
            // 水滴特定属性
            this.reflectPos = Math.random();
        }
        update() {
            this.x += this.vx;
            this.y += this.vy;
            this.angle += this.rotationSpeed;

            // 闪烁
            this.brightness += (Math.random() - 0.5) * this.flickerSpeed;
            if (this.brightness > 1) this.brightness = 1;
            if (this.brightness < 0.3) this.brightness = 0.3;

            // 边界循环
            const margin = this.size;
            if (this.x < -margin) this.x = width + margin;
            if (this.x > width + margin) this.x = -margin;
            if (this.y < -margin) this.y = height + margin;
            if (this.y > height + margin) this.y = -margin;
        }
        draw(ctx) {
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate(this.angle);
            ctx.globalAlpha = this.brightness * currentSettings.opacity;
            ctx.shadowColor = 'rgba(200, 100, 100, 0.8)';
            ctx.shadowBlur = 10;

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
            // 闪烁的十字星（两个细长椭圆交叉）
            const w = this.size;
            const h = this.size * 0.15;
            ctx.fillStyle = '#ffdd99';
            // 水平条
            ctx.fillRect(-w/2, -h/2, w, h);
            // 垂直条
            ctx.fillRect(-h/2, -w/2, h, w);
        }
        drawWaterdrop(ctx) {
            // 模仿三体水滴：椭圆 + 高光
            const w = this.size * 0.8;
            const h = this.size * 1.2;
            ctx.beginPath();
            ctx.ellipse(0, 0, w/2, h/2, 0, 0, Math.PI * 2);
            ctx.fillStyle = '#aaccff';
            ctx.fill();
            // 高光
            ctx.beginPath();
            ctx.ellipse(-w*0.1, -h*0.1, w*0.2, h*0.2, 0, 0, Math.PI*2);
            ctx.fillStyle = '#ffffff';
            ctx.globalAlpha *= 0.7;
            ctx.fill();
        }
        drawGear(ctx) {
            // 简单齿轮：圆形 + 几个齿
            const r = this.size / 2;
            ctx.beginPath();
            ctx.arc(0, 0, r, 0, Math.PI * 2);
            ctx.fillStyle = '#cc9966';
            ctx.fill();
            // 齿
            ctx.fillStyle = '#aa7755';
            for (let i = 0; i < 8; i++) {
                const angle = (i / 8) * Math.PI * 2;
                const dx = Math.cos(angle) * r * 1.2;
                const dy = Math.sin(angle) * r * 1.2;
                ctx.beginPath();
                ctx.ellipse(dx, dy, r*0.2, r*0.2, 0, 0, Math.PI*2);
                ctx.fill();
            }
        }
        drawSpark(ctx) {
            // 光点：圆形 + 光晕
            ctx.beginPath();
            ctx.arc(0, 0, this.size/2, 0, Math.PI*2);
            ctx.fillStyle = '#ffeeaa';
            ctx.shadowBlur = 20;
            ctx.fill();
        }
        drawTriangle(ctx) {
            // 旧版流星三角形
            ctx.beginPath();
            ctx.moveTo(this.size, 0);
            ctx.lineTo(-this.size/2, -this.size/3);
            ctx.lineTo(-this.size/2, this.size/3);
            ctx.closePath();
            ctx.fillStyle = '#ddaa88';
            ctx.fill();
        }
    }

    // ========== 初始化粒子 ==========
    function initParticles() {
        particles = [];
        for (let i = 0; i < currentSettings.count; i++) {
            particles.push(new Particle(currentSettings.style));
        }
    }

    // ========== 动画循环 ==========
    function animate() {
        ctx.clearRect(0, 0, width, height);
        particles.forEach(p => {
            p.update();
            p.draw(ctx);
        });
        animationFrame = requestAnimationFrame(animate);
    }

    // ========== 重置画布 ==========
    function resizeCanvas() {
        width = window.innerWidth;
        height = window.innerHeight;
        if (canvas) {
            canvas.width = width;
            canvas.height = height;
            initParticles();
        }
    }

    // ========== 启动/更新特效 ==========
    function startAnimation() {
        if (!canvas) {
            canvas = document.createElement('canvas');
            canvas.id = canvasId;
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
        }
        resizeCanvas();
        if (animationFrame) cancelAnimationFrame(animationFrame);
        animate();
    }

    // ========== 监听设置变化 ==========
    window.addEventListener('we-settings-changed', (e) => {
        currentSettings = e.detail;
        // 重新生成粒子（样式/数量改变时）
        if (particles.length !== currentSettings.count || particles[0]?.style !== currentSettings.style) {
            initParticles();
        } else {
            // 只更新速度/大小等属性
            particles.forEach(p => {
                p.vx = (Math.random() - 0.5) * currentSettings.speed * 1.5;
                p.vy = (Math.random() - 0.5) * currentSettings.speed * 1.5;
                p.size = currentSettings.size * (0.7 + Math.random() * 0.6);
            });
        }
        // 更新透明度
        canvas.style.opacity = currentSettings.opacity;
    });

    // ========== 初始化 ==========
    loadSettings();
    startAnimation();
})();
