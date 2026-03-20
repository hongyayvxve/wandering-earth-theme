// 流浪地球·粒子特效 - 纯浏览器版本（无 import）
(function() {
    if (window.__WE_RUN) return;
    window.__WE_RUN = true;

    const extName = 'wandering-earth-theme';
    let settings = {
        style: 'star',
        count: 12,
        speed: 2,
        size: 35,
        opacity: 0.4
    };

    let canvas, ctx, width, height;
    let stars = [], particles = [];
    let animId = null;

    // ---------- 星星背景 ----------
    function initStars(n = 180) {
        stars = [];
        for (let i = 0; i < n; i++) {
            stars.push({
                x: Math.random() * width,
                y: Math.random() * height,
                r: Math.random() * 2 + 1,
                b: 0.3 + Math.random() * 0.5
            });
        }
    }

    // ---------- 粒子类 ----------
    class Particle {
        constructor(style) {
            this.style = style;
            this.reset();
        }
        reset() {
            const w = width, h = height;
            switch (this.style) {
                case 'meteor':
                    this.x = Math.random() * w;
                    this.y = -Math.random() * h * 0.3;
                    this.tx = this.x + (Math.random() - 0.5) * w * 0.8;
                    this.ty = h + Math.random() * h * 0.3;
                    this.prog = 0;
                    this.tail = 40 + Math.random() * 40;
                    break;
                case 'waterdrop':
                    this.x = Math.random() * w;
                    this.y = -Math.random() * h * 0.2;
                    this.vx = (Math.random() - 0.5) * 1.2;
                    this.vy = 1.5 + Math.random() * 2;
                    break;
                case 'gear':
                    this.x = Math.random() * w;
                    this.y = Math.random() * h;
                    this.vx = (Math.random() - 0.5) * settings.speed * 0.5;
                    this.vy = (Math.random() - 0.5) * settings.speed * 0.5;
                    this.angle = Math.random() * Math.PI * 2;
                    this.rot = (Math.random() - 0.5) * 0.03;
                    this.teeth = 8 + Math.floor(Math.random() * 5);
                    break;
                case 'spark':
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
            }
            this.size = settings.size * (0.7 + Math.random() * 0.6);
            this.bright = 0.5 + Math.random() * 0.5;
        }
        update() {
            switch (this.style) {
                case 'meteor':
                    this.prog += 0.005 + settings.speed * 0.002;
                    if (this.prog >= 1) this.reset();
                    else {
                        this.x += (this.tx - this.x) * 0.02;
                        this.y += (this.ty - this.y) * 0.02;
                    }
                    break;
                case 'waterdrop':
                    this.x += this.vx;
                    this.y += this.vy;
                    if (this.y > height + this.size || this.x < -this.size || this.x > width + this.size) this.reset();
                    break;
                case 'gear':
                    this.x += this.vx;
                    this.y += this.vy;
                    this.angle += this.rot;
                    const m = this.size;
                    if (this.x < -m) this.x = width + m;
                    if (this.x > width + m) this.x = -m;
                    if (this.y < -m) this.y = height + m;
                    if (this.y > height + m) this.y = -m;
                    break;
                default:
                    this.x += this.vx;
                    this.y += this.vy;
                    const b = this.size * 1.5;
                    if (this.x < -b) this.x = width + b;
                    if (this.x > width + b) this.x = -b;
                    if (this.y < -b) this.y = height + b;
                    if (this.y > height + b) this.y = -b;
            }
        }
        draw(ctx) {
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.shadowBlur = 12;
            ctx.shadowColor = `rgba(200,100,80,${settings.opacity * 0.8})`;
            switch (this.style) {
                case 'meteor': this.drawMeteor(ctx); break;
                case 'waterdrop': this.drawWaterdrop(ctx); break;
                case 'gear': this.drawGear(ctx); break;
                case 'spark': this.drawSpark(ctx); break;
                default: this.drawStar(ctx);
            }
            ctx.restore();
        }
        drawStar(ctx) {
            const w = this.size, h = this.size * 0.16;
            const grad = ctx.createRadialGradient(0,0,0,0,0,w*0.5);
            grad.addColorStop(0,'#fff5e6');
            grad.addColorStop(0.5,'#e6b87e');
            grad.addColorStop(1,'#b84a4a');
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.ellipse(0,0,w/2,h/2,0,0,Math.PI*2);
            ctx.fill();
            ctx.beginPath();
            ctx.ellipse(0,0,h/2,w/2,0,0,Math.PI*2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(0,0,this.size*0.12,0,Math.PI*2);
            ctx.fillStyle = 'white';
            ctx.fill();
        }
        drawMeteor(ctx) {
            const len = this.tail;
            const angle = Math.atan2(this.ty - this.y, this.tx - this.x);
            ctx.rotate(angle);
            const grad = ctx.createLinearGradient(-len/2,0,len/2,0);
            grad.addColorStop(0,`rgba(255,220,160,${0.8*settings.opacity})`);
            grad.addColorStop(0.5,`rgba(200,100,80,${0.5*settings.opacity})`);
            grad.addColorStop(1,`rgba(100,40,30,0)`);
            ctx.beginPath();
            ctx.moveTo(-len/2,0);
            ctx.lineTo(len/2,-this.size/3);
            ctx.lineTo(len/2,this.size/3);
            ctx.fillStyle = grad;
            ctx.fill();
            ctx.beginPath();
            ctx.arc(len/2,0,this.size/3,0,Math.PI*2);
            ctx.fillStyle = '#ffcc88';
            ctx.fill();
        }
        drawWaterdrop(ctx) {
            const w = this.size * 0.9, h = this.size * 1.3;
            ctx.rotate(Math.atan2(this.vy, this.vx));
            ctx.beginPath();
            ctx.moveTo(0,-h/2);
            ctx.quadraticCurveTo(w/2,-h/3,w/2,0);
            ctx.quadraticCurveTo(w/2,h/2,0,h/2);
            ctx.quadraticCurveTo(-w/2,h/2,-w/2,0);
            ctx.quadraticCurveTo(-w/2,-h/3,0,-h/2);
            const grad = ctx.createLinearGradient(-w/3,-h/3,w/3,h/3);
            grad.addColorStop(0,'#c0e0ff');
            grad.addColorStop(0.3,'#88aadd');
            grad.addColorStop(0.6,'#446688');
            grad.addColorStop(1,'#224455');
            ctx.fillStyle = grad;
            ctx.fill();
            ctx.beginPath();
            ctx.ellipse(-w*0.15,-h*0.2,w*0.12,h*0.1,0,0,Math.PI*2);
            ctx.fillStyle = `rgba(255,255,245,${0.7*settings.opacity})`;
            ctx.fill();
            ctx.beginPath();
            ctx.ellipse(w*0.1,h*0.05,w*0.08,h*0.07,0,0,Math.PI*2);
            ctx.fillStyle = `rgba(255,255,245,${0.4*settings.opacity})`;
            ctx.fill();
        }
        drawGear(ctx) {
            const r = this.size/2, ri = r*0.7;
            ctx.rotate(this.angle);
            ctx.beginPath();
            for (let i=0; i<this.teeth; i++) {
                const a = (i/this.teeth)*Math.PI*2;
                const a2 = ((i+0.5)/this.teeth)*Math.PI*2;
                const a1 = ((i-0.5)/this.teeth)*Math.PI*2;
                const x1 = r*Math.cos(a), y1 = r*Math.sin(a);
                const x2 = ri*Math.cos(a2), y2 = ri*Math.sin(a2);
                const x3 = ri*Math.cos(a1), y3 = ri*Math.sin(a1);
                if(i===0) ctx.moveTo(x1,y1);
                else ctx.lineTo(x1,y1);
                ctx.lineTo(x2,y2);
                ctx.lineTo(x3,y3);
            }
            ctx.closePath();
            const grad = ctx.createRadialGradient(-r*0.2,-r*0.2,0,0,0,r);
            grad.addColorStop(0,'#ccaa77');
            grad.addColorStop(0.5,'#886644');
            grad.addColorStop(1,'#553322');
            ctx.fillStyle = grad;
            ctx.fill();
            ctx.strokeStyle = '#332211';
            ctx.lineWidth = 1.5;
            ctx.stroke();
            ctx.beginPath();
            ctx.arc(0,0,r*0.2,0,Math.PI*2);
            ctx.fillStyle = '#332211';
            ctx.fill();
            ctx.beginPath();
            ctx.arc(0,0,r*0.08,0,Math.PI*2);
            ctx.fillStyle = '#ffdd99';
            ctx.fill();
        }
        drawSpark(ctx) {
            const r = this.size/2;
            const grad = ctx.createRadialGradient(0,0,0,0,0,r);
            grad.addColorStop(0,'#ffeecc');
            grad.addColorStop(0.4,'#ffaa88');
            grad.addColorStop(0.8,'#884433');
            grad.addColorStop(1,'rgba(0,0,0,0)');
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(0,0,r,0,Math.PI*2);
            ctx.fill();
        }
    }

    function initParticles() {
        particles = [];
        for (let i=0; i<settings.count; i++) particles.push(new Particle(settings.style));
    }

    function drawStars() {
        stars.forEach(s=>{
            ctx.beginPath();
            ctx.arc(s.x,s.y,s.r,0,Math.PI*2);
            ctx.fillStyle = `rgba(255,230,200,${s.b*0.6})`;
            ctx.fill();
        });
    }

    function animate() {
        if(!ctx) return;
        ctx.clearRect(0,0,width,height);
        drawStars();
        particles.forEach(p=>{ p.update(); p.draw(ctx); });
        animId = requestAnimationFrame(animate);
    }

    function resizeCanvas() {
        width = window.innerWidth;
        height = window.innerHeight;
        if(canvas){
            canvas.width = width;
            canvas.height = height;
            initStars(180);
            initParticles();
        }
    }

    function startAnimation() {
        if(canvas) return;
        canvas = document.createElement('canvas');
        canvas.id = 'we-canvas';
        canvas.style.cssText = `position:fixed; top:0; left:0; width:100%; height:100%; z-index:-1; pointer-events:none; opacity:${settings.opacity};`;
        document.body.appendChild(canvas);
        ctx = canvas.getContext('2d');
        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();
        animate();
    }

    function stopAnimation() {
        if(animId) cancelAnimationFrame(animId);
        if(canvas) canvas.remove();
        canvas = null;
        ctx = null;
    }

    // 配置面板渲染
    function renderSettings() {
        return `
            <div id="we-settings" style="margin:15px 0; padding:10px; background:#1a0f0f; border:1px solid #4a3a3a; border-radius:8px;">
                <h3 style="margin:0 0 12px 0; color:#b84a4a;">⚙️ 流浪地球·粒子特效</h3>
                <div style="margin-bottom:12px;">
                    <label style="color:#b09090;">样式</label>
                    <select id="we-style" style="width:100%; background:#0f0707; color:#e0d0d0; border:1px solid #4a3a3a; padding:6px;">
                        <option value="star" ${settings.style==='star'?'selected':''}>✨ 十字星</option>
                        <option value="meteor" ${settings.style==='meteor'?'selected':''}>☄️ 流星</option>
                        <option value="waterdrop" ${settings.style==='waterdrop'?'selected':''}>💧 水滴</option>
                        <option value="gear" ${settings.style==='gear'?'selected':''}>⚙️ 齿轮</option>
                        <option value="spark" ${settings.style==='spark'?'selected':''}>🌟 光点</option>
                    </select>
                </div>
                <div style="margin-bottom:12px;">
                    <label style="color:#b09090;">数量 <span id="we-count-val">${settings.count}</span></label>
                    <input type="range" id="we-count" min="5" max="35" step="1" value="${settings.count}" style="width:100%;">
                </div>
                <div style="margin-bottom:12px;">
                    <label style="color:#b09090;">速度 <span id="we-speed-val">${settings.speed}</span></label>
                    <input type="range" id="we-speed" min="0.5" max="4" step="0.5" value="${settings.speed}" style="width:100%;">
                </div>
                <div style="margin-bottom:12px;">
                    <label style="color:#b09090;">大小 <span id="we-size-val">${settings.size}</span></label>
                    <input type="range" id="we-size" min="20" max="60" step="5" value="${settings.size}" style="width:100%;">
                </div>
                <div style="margin-bottom:12px;">
                    <label style="color:#b09090;">透明度 <span id="we-opacity-val">${settings.opacity}</span></label>
                    <input type="range" id="we-opacity" min="0.2" max="0.6" step="0.05" value="${settings.opacity}" style="width:100%;">
                </div>
                <button id="we-reset" class="menu_button">恢复默认</button>
                <div id="we-status" style="margin-top:10px; color:#b84a4a;"></div>
            </div>
        `;
    }

    function bindEvents() {
        const style = document.getElementById('we-style');
        const count = document.getElementById('we-count');
        const speed = document.getElementById('we-speed');
        const size = document.getElementById('we-size');
        const opacity = document.getElementById('we-opacity');
        const reset = document.getElementById('we-reset');
        const status = document.getElementById('we-status');

        const updateDisplay = () => {
            document.getElementById('we-count-val').innerText = count.value;
            document.getElementById('we-speed-val').innerText = speed.value;
            document.getElementById('we-size-val').innerText = size.value;
            document.getElementById('we-opacity-val').innerText = opacity.value;
        };
        const apply = () => {
            const newSet = {
                style: style.value,
                count: parseInt(count.value,10),
                speed: parseFloat(speed.value),
                size: parseInt(size.value,10),
                opacity: parseFloat(opacity.value)
            };
            Object.assign(settings, newSet);
            // 保存到酒馆设置
            if (window.SillyTavern && window.SillyTavern.getContext) {
                const ctx = window.SillyTavern.getContext();
                if (ctx) {
                    ctx.extensionSettings[extName] = settings;
                    if (ctx.saveSettingsDebounced) ctx.saveSettingsDebounced();
                    else if (ctx.saveSettings) ctx.saveSettings();
                }
            } else {
                // 降级到 localStorage
                localStorage.setItem(extName, JSON.stringify(settings));
            }
            if(canvas) canvas.style.opacity = settings.opacity;
            if(particles.length !== settings.count || particles[0]?.style !== settings.style) initParticles();
            else particles.forEach(p => p.size = settings.size * (0.7 + Math.random() * 0.6));
            status.innerText = '✓ 已应用';
            setTimeout(()=>status.innerText='',1500);
        };
        style.addEventListener('change', apply);
        count.addEventListener('input', updateDisplay);
        speed.addEventListener('input', updateDisplay);
        size.addEventListener('input', updateDisplay);
        opacity.addEventListener('input', updateDisplay);
        count.addEventListener('change', apply);
        speed.addEventListener('change', apply);
        size.addEventListener('change', apply);
        opacity.addEventListener('change', apply);
        reset.addEventListener('click', () => {
            style.value = 'star';
            count.value = 12;
            speed.value = 2;
            size.value = 35;
            opacity.value = 0.4;
            updateDisplay();
            apply();
        });
        updateDisplay();
    }

    // 注册扩展（等待全局对象就绪）
    function register() {
        if (!window.SillyTavern || !window.SillyTavern.registerExtension) {
            setTimeout(register, 500);
            return;
        }
        window.SillyTavern.registerExtension(extName, {
            onLoad: () => {
                // 加载设置
                const ctx = window.SillyTavern.getContext();
                if (ctx && ctx.extensionSettings && ctx.extensionSettings[extName]) {
                    settings = { ...settings, ...ctx.extensionSettings[extName] };
                } else {
                    const stored = localStorage.getItem(extName);
                    if (stored) {
                        try {
                            settings = { ...settings, ...JSON.parse(stored) };
                        } catch(e) {}
                    }
                }
                startAnimation();
                console.log('流浪地球·粒子特效已启动');
            },
            onUnload: () => {
                stopAnimation();
            },
            onSettingsRender: () => {
                setTimeout(() => bindEvents(), 0);
                return renderSettings();
            }
        });
    }

    register();
})();
