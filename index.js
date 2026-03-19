// 流浪地球主题扩展 - 背景动画模块（可选）
(function() {
    const canvasId = 'wandering-earth-canvas';
    let canvas, ctx;
    let width, height;
    let stars = [];
    let meteors = [];

    // 初始化星空
    function initStars(count = 200) {
        stars = [];
        for (let i = 0; i < count; i++) {
            stars.push({
                x: Math.random() * width,
                y: Math.random() * height,
                radius: Math.random() * 2.5,
                alpha: Math.random() * 0.7 + 0.3,
                speed: Math.random() * 0.02 + 0.01,
                flicker: Math.random() * 0.1 + 0.05
            });
        }
    }

    // 初始化流星
    function initMeteors(count = 3) {
        meteors = [];
        for (let i = 0; i < count; i++) {
            meteors.push({
                x: Math.random() * width,
                y: Math.random() * height * 0.2,
                length: Math.random() * 80 + 40,
                speed: Math.random() * 6 + 4,
                alpha: Math.random() * 0.5 + 0.3,
                angle: Math.PI / 4 + (Math.random() * 0.3 - 0.15) // 约45度
            });
        }
    }

    function resizeCanvas() {
        width = window.innerWidth;
        height = window.innerHeight;
        if (canvas) {
            canvas.width = width;
            canvas.height = height;
            initStars(250);
            initMeteors(3);
        }
    }

    function draw() {
        if (!ctx) return;
        ctx.clearRect(0, 0, width, height);

        // 绘制星星
        stars.forEach(s => {
            ctx.beginPath();
            ctx.arc(s.x, s.y, s.radius, 0, 2 * Math.PI);
            ctx.fillStyle = `rgba(255, 240, 200, ${s.alpha})`;
            ctx.fill();

            // 微微闪烁
            s.alpha += (Math.random() - 0.5) * s.flicker;
            if (s.alpha > 0.9) s.alpha = 0.9;
            if (s.alpha < 0.3) s.alpha = 0.3;
        });

        // 绘制流星（带尾迹）
        meteors.forEach(m => {
            const dx = Math.cos(m.angle) * m.length;
            const dy = Math.sin(m.angle) * m.length;

            // 主尾迹
            ctx.beginPath();
            ctx.moveTo(m.x, m.y);
            ctx.lineTo(m.x - dx, m.y - dy);
            ctx.strokeStyle = `rgba(200, 220, 255, ${m.alpha})`;
            ctx.lineWidth = 2;
            ctx.stroke();

            // 十字横线（增加工业感）
            const perpAngle = m.angle + Math.PI / 2;
            const perpDx = Math.cos(perpAngle) * 6;
            const perpDy = Math.sin(perpAngle) * 6;
            ctx.beginPath();
            ctx.moveTo(m.x - perpDx, m.y - perpDy);
            ctx.lineTo(m.x + perpDx, m.y + perpDy);
            ctx.strokeStyle = `rgba(220, 240, 255, ${m.alpha * 0.7})`;
            ctx.lineWidth = 1.5;
            ctx.stroke();

            // 移动
            m.x += Math.cos(m.angle) * m.speed;
            m.y += Math.sin(m.angle) * m.speed;

            // 重置
            if (m.x > width + 100 || m.y > height + 100) {
                m.x = Math.random() * width;
                m.y = Math.random() * height * 0.2;
                m.alpha = Math.random() * 0.6 + 0.2;
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
        canvas.style.opacity = '0.3'; // 降低亮度，不干扰阅读
        document.body.appendChild(canvas);
        ctx = canvas.getContext('2d');
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);
        draw();
    }

    // 酒馆加载完成后启动（可选，如果不想用动画可注释掉）
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', startAnimation);
    } else {
        startAnimation();
    }
})();