(function() {
    const canvasId = 'we-canvas';
    let canvas, ctx, width, height;
    let stars = [];
    let nebulas = [];  // 星云
    let lightPillars = []; // 发动机光柱

    function initStars(count = 300) {
        stars = [];
        for (let i = 0; i < count; i++) {
            stars.push({
                x: Math.random() * width,
                y: Math.random() * height,
                radius: Math.random() * 2 + 0.5,
                alpha: Math.random() * 0.8 + 0.2,
                speed: Math.random() * 0.02 + 0.005
            });
        }
    }

    function initNebulas(count = 3) {
        nebulas = [];
        for (let i = 0; i < count; i++) {
            nebulas.push({
                x: Math.random() * width,
                y: Math.random() * height,
                radius: Math.random() * 150 + 100,
                color: `rgba(80, 20, 20, ${Math.random() * 0.15 + 0.05})`,
                speedX: (Math.random() - 0.5) * 0.02,
                speedY: (Math.random() - 0.5) * 0.02
            });
        }
    }

    function initLightPillars(count = 2) {
        lightPillars = [];
        for (let i = 0; i < count; i++) {
            lightPillars.push({
                x: Math.random() * width,
                y: height,
                width: Math.random() * 60 + 30,
                alpha: Math.random() * 0.3 + 0.1,
                speed: Math.random() * 0.5 + 0.2
            });
        }
    }

    function resizeCanvas() {
        width = window.innerWidth;
        height = window.innerHeight;
        if (canvas) {
            canvas.width = width;
            canvas.height = height;
            initStars(350);
            initNebulas(4);
            initLightPillars(2);
        }
    }

    function draw() {
        if (!ctx) return;
        ctx.clearRect(0, 0, width, height);

        // 绘制星云（半透明，慢速移动）
        nebulas.forEach(n => {
            ctx.beginPath();
            ctx.arc(n.x, n.y, n.radius, 0, 2 * Math.PI);
            ctx.fillStyle = n.color;
            ctx.fill();
            n.x += n.speedX;
            n.y += n.speedY;
            if (n.x < -n.radius) n.x = width + n.radius;
            if (n.x > width + n.radius) n.x = -n.radius;
            if (n.y < -n.radius) n.y = height + n.radius;
            if (n.y > height + n.radius) n.y = -n.radius;
        });

        // 绘制星星
        stars.forEach(s => {
            ctx.beginPath();
            ctx.arc(s.x, s.y, s.radius, 0, 2 * Math.PI);
            ctx.fillStyle = `rgba(255, 240, 200, ${s.alpha})`;
            ctx.fill();
            s.alpha += (Math.random() - 0.5) * 0.05;
            if (s.alpha > 0.9) s.alpha = 0.9;
            if (s.alpha < 0.2) s.alpha = 0.2;
        });

        // 绘制发动机光柱（从下往上）
        lightPillars.forEach(p => {
            const gradient = ctx.createLinearGradient(p.x, p.y, p.x, p.y - 200);
            gradient.addColorStop(0, `rgba(180, 60, 60, ${p.alpha})`);
            gradient.addColorStop(0.5, `rgba(140, 40, 40, ${p.alpha * 0.5})`);
            gradient.addColorStop(1, 'rgba(0,0,0,0)');
            ctx.fillStyle = gradient;
            ctx.fillRect(p.x - p.width/2, p.y - 200, p.width, 200);
            p.y -= p.speed;
            if (p.y < -100) {
                p.y = height;
                p.x = Math.random() * width;
            }
        });

        requestAnimationFrame(draw);
    }

    function startAnimation() {
        if (document.getElementById(canvasId)) return;
        canvas = document.createElement('canvas');
        canvas.id = canvasId;
        canvas.style.position = 'fixed';
        canvas.style.top = '0';
        canvas.style.left = '0';
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        canvas.style.zIndex = '-1';
        canvas.style.pointerEvents = 'none';
        canvas.style.opacity = '0.35'; // 低亮度，不抢眼
        document.body.appendChild(canvas);
        ctx = canvas.getContext('2d');
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);
        draw();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', startAnimation);
    } else {
        startAnimation();
    }
})();
