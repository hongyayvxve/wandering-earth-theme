// 流浪地球主题扩展 - 最终版：星空背景 + 精致粒子 + 配置面板
(function() {
    const canvasId = 'we-canvas';
    let canvas, ctx, width, height;
    let stars = [];
    let particles = [];
    let animationFrame;
    
    // 默认配置
    let currentSettings = {
        style: 'star',
        count: 15,
        speed: 3,
        size: 30,
        opacity: 0.35
    };

    // ========== 加载设置 ==========
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

    // ========== 星星背景初始化 ==========
    function initStars(count = 200) {
        stars = [];
        for (let i = 0; i < count; i++) {
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

    // ========== 精致粒子类 ==========
    class Particle {
        constructor(style) {
            this.style = style;
            this.reset();
        }
        reset() {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            const speedBase = currentSettings.speed * 0.8;
            this.vx = (Math.random() - 0.5) * speedBase * 1.5;
            this.vy = (Math.random() - 0.5) * speedBase * 1.5;
            this.size = currentSettings.size * (0.6 + Math.random() * 0.5);
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
            ctx.globalAlpha = this.brightness * currentSettings.opacity;
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
            // 精致十字星：两个细长椭圆交叉，带中心高光和边缘羽化
            const w = this.size;
            const h = this.size * 0.18;
            
            // 水平条 - 用渐变模拟光晕
            const gradH = ctx.createLinearGradient(-w/2, 0, w/2, 0);
            gradH.addColorStop(0, 'rgba(255, 230, 200, 0.3)');
            gradH.addColorStop(0.3, 'rgba(255, 240, 210, 0.9)');
            gradH.addColorStop(0.7, 'rgba(255, 240, 210, 0.9)');
            gradH.addColorStop(1, 'rgba(255, 230, 200, 0.3)');
            
            ctx.fillStyle = gradH;
            ctx.beginPath();
            ctx.ellipse(0, 0, w/2, h/2, 0, 0, Math.PI * 2);
            ctx.fill();
            
            // 垂直条
            const gradV = ctx.createLinearGradient(0, -w/2, 0, w/2);
            gradV.addColorStop(0, 'rgba(255, 230, 200, 0.3)');
            gradV.addColorStop(0.3, 'rgba(255, 240, 210, 0.9)');
            gradV.addColorStop(0.7, 'rgba(255, 240, 210, 0.9)');
            gradV.addColorStop(1, 'rgba(255, 230, 200, 0.3)');
            
            ctx.fillStyle = gradV;
            ctx.beginPath();
            ctx.ellipse(0, 0, h/2, w/2, 0, 0, Math.PI * 2);
            ctx.fill();
            
            // 中心亮点
            ctx.beginPath();
            ctx.arc(0, 0, this.size * 0.1, 0, Math.PI * 2);
            ctx.fillStyle = 'white';
            ctx.shadowBlur = 20;
            ctx.fill();
        }
        drawWaterdrop(ctx) {
            // 三体水滴：镜面椭圆 + 高光 + 反射
            const w = this.size * 0.8;
            const h = this.size * 1.2;
            
            // 主体渐变
            const grad = ctx.createRadialGradient(-w*0.2, -h*0.2, 0, 0, 0, w);
            grad.addColorStop(0, '#ddeeff');
            grad.addColorStop(0.4, '#aaccff');
            grad.addColorStop(0.8, '#6688aa');
            grad.addColorStop(1, '#335577');
            
            ctx.beginPath();
            ctx.ellipse(0, 0, w/2, h/2, 0, 0, Math.PI * 2);
            ctx.fillStyle = grad;
            ctx.fill();
            
            // 高光
            ctx.beginPath();
            ctx.ellipse(-w*0.15, -h*0.15, w*0.15, h*0.15, 0, 0, Math.PI*2);
            ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
            ctx.fill();
            
            // 反射光纹
            ctx.beginPath();
            ctx.ellipse(w*0.1, h*0.1, w*0.08, h*0.08, 0, 0, Math.PI*2);
            ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.fill();
        }
        drawGear(ctx) {
            // 工业齿轮：带齿和轴孔
            const r = this.size / 2;
            
            // 主体
            ctx.beginPath();
            ctx.arc(0, 0, r, 0, Math.PI * 2);
            const grad = ctx.createRadialGradient(-r*0.3, -r*0.3, 0, 0, 0, r);
            grad.addColorStop(0, '#ccaa88');
            grad.addColorStop(0.7, '#886644');
            grad.addColorStop(1, '#553322');
            ctx.fillStyle = grad;
            ctx.fill();
            
            // 齿
            ctx.fillStyle = '#aa7744';
            for (let i = 0; i < this.teeth; i++) {
                const angle = (i / this.teeth) * Math.PI * 2;
                const dx = Math.cos(angle) * r * 1.2;
                const dy = Math.sin(angle) * r * 1.2;
                ctx.beginPath();
                ctx.ellipse(dx, dy, r*0.2, r*0.25, 0, 0, Math.PI*2);
                ctx.fill();
            }
            
            // 轴孔
            ctx.beginPath();
            ctx.arc(0, 0, r*0.3, 0, Math.PI*2);
            ctx.fillStyle = '#332211';
            ctx.fill();
            
            // 轴心亮点
            ctx.beginPath();
            ctx.arc(0, 0, r*0.1, 0, Math.PI*2);
            ctx.fillStyle = '#eeddcc';
            ctx.fill();
        }
        drawSpark(ctx) {
            // 柔和光点：多层圆形渐变
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
            // 经典流星（保留作为选项）
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

    // ========== 初始化粒子 ==========
    function initParticles() {
        particles = [];
        for (let i = 0; i < currentSettings.count; i++) {
            particles.push(new Particle(currentSettings.style));
        }
    }

    // ========== 绘制星星背景 ==========
    function drawStars() {
        stars.forEach(s => {
            // 闪烁效果
            const brightness = s.alpha + Math.sin(Date.now() * s.flickerSpeed + s.phase) * 0.15;
            const limitedBrightness = Math.max(0.2, Math.min(1, brightness));
            
            ctx.beginPath();
            ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 240, 210, ${limitedBrightness})`;
            ctx.shadowBlur = 5;
            ctx.shadowColor = 'rgba(200, 180, 160, 0.3)';
            ctx.fill();
        });
    }

    // ========== 动画循环 ==========
    function animate() {
        ctx.clearRect(0, 0, width, height);
        
        // 先画星星（底层）
        drawStars();
        
        // 再画粒子（上层）
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
            initStars(250);
            initParticles();
        }
    }

    // ========== 启动特效 ==========
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
        如果 (animationFrame) cancelAnimationFrame(animationFrame);
        animate();
    }

    // ========== 监听设置变化 ==========
    window.addEventListener('we-settings-changed', (e) => {
        const oldStyle = currentSettings.style;
        const oldCount = currentSettings.count;
        currentSettings = e.detail;
        
        // 更新canvas透明度
        如果 (画布) 画布.样式.透明度 = 当前设置.透明度;
        
        // 如果样式或数量改变，重新生成粒子
        如果 (旧样式 !== 当前设置.样式 || 旧计数 !== 当前设置.计数) {
            initParticles();
        } else {
            // 只更新速度和大小
            粒子.forEach(p => {
                const speedBase = currentSettings.speed * 0.8;
                p.vx = (Math.random() - 0.5) * speedBase * 1.5;
                p.vy = (Math.random() - 0.5) * speedBase * 1.5;
                p.size = currentSettings.size * (0.6 + Math.random() * 0.5);
            });
        }
    });

    // ========== 初始化 ==========
    loadSettings();
    startAnimation();

    console.log('流浪地球主题特效已启动 - 星空背景 + 精致粒子');
})();
