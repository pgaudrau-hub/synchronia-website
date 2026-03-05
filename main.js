const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        }, { threshold: 0.1 });

        document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));

(function() {
        // Hamburger toggle
        const btn = document.getElementById('hamburger-btn');
        const menu = document.getElementById('mobile-menu');
        if (btn && menu) {
            btn.addEventListener('click', function() {
                const isOpen = menu.classList.toggle('open');
                btn.classList.toggle('active');
                btn.setAttribute('aria-expanded', isOpen);
                document.body.style.overflow = isOpen ? 'hidden' : '';
            });
            menu.querySelectorAll('a').forEach(function(link) {
                link.addEventListener('click', function() {
                    menu.classList.remove('open');
                    btn.classList.remove('active');
                    btn.setAttribute('aria-expanded', 'false');
                    document.body.style.overflow = '';
                });
            });
        }

        // Email obfuscation — assembled at runtime to avoid scrapers
        var u = 'pgaudrau';
        var d = 'gmail.com';
        var addr = u + '@' + d;
        var mailto = 'mailto:' + addr;

        var ctaBtn = document.getElementById('cta-email-btn');
        var ctaTxt = document.getElementById('cta-email-text');
        var footerEl = document.getElementById('footer-email');

        if (ctaBtn) ctaBtn.href = mailto;
        if (ctaTxt) { ctaTxt.href = mailto; ctaTxt.textContent = addr; }
        if (footerEl) { footerEl.href = mailto; footerEl.textContent = addr; }
    })();

(function() {
        const canvas = document.getElementById('synapse-canvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');

        const CORAL = { r: 229, g: 125, b: 97 };
        const NODE_COUNT = 55;
        const CONNECTION_DIST = 175;
        const MOUSE_RADIUS = 280;
        const PULSE_SPEED = 0.012;

        let w, h, nodes = [], mouse = { x: -999, y: -999 }, dpr = 1;

        function resize() {
            dpr = window.devicePixelRatio || 1;
            const rect = canvas.getBoundingClientRect();
            w = rect.width;
            h = rect.height;
            canvas.width = w * dpr;
            canvas.height = h * dpr;
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        }

        const MARGIN_LEFT = 0.03;
        const MARGIN_TOP = 0.03;
        const MARGIN_RIGHT = 0.03;
        const MARGIN_BOTTOM = 0.03;

        function createNodes() {
            nodes = [];
            const xMin = w * MARGIN_LEFT;
            const xMax = w * (1 - MARGIN_RIGHT);
            const yMin = h * MARGIN_TOP;
            const yMax = h * (1 - MARGIN_BOTTOM);
            for (let i = 0; i < NODE_COUNT; i++) {
                nodes.push({
                    x: xMin + Math.random() * (xMax - xMin),
                    y: yMin + Math.random() * (yMax - yMin),
                    vx: (Math.random() - 0.5) * 0.4,
                    vy: (Math.random() - 0.5) * 0.4,
                    radius: 2.5 + Math.random() * 3.5,
                    energy: 0,
                    pulsePhase: Math.random() * Math.PI * 2,
                    baseAlpha: 0.3 + Math.random() * 0.3
                });
            }
        }

        function dist(a, b) {
            return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
        }

        function update() {
            const mx = mouse.x, my = mouse.y;

            for (let i = 0; i < nodes.length; i++) {
                const n = nodes[i];

                // Drift
                n.x += n.vx;
                n.y += n.vy;

                // Bounce at edges — respect margins
                const xMin = w * MARGIN_LEFT - 10;
                const xMax = w * (1 - MARGIN_RIGHT) + 10;
                const yMin = h * MARGIN_TOP - 10;
                const yMax = h * (1 - MARGIN_BOTTOM) + 10;
                if (n.x < xMin) n.vx = Math.abs(n.vx);
                if (n.x > xMax) n.vx = -Math.abs(n.vx);
                if (n.y < yMin) n.vy = Math.abs(n.vy);
                if (n.y > yMax) n.vy = -Math.abs(n.vy);

                // Mouse proximity energy — fast ramp-up, smooth decay
                const md = dist(n, { x: mx, y: my });
                const mouseInfluence = md < MOUSE_RADIUS ? Math.pow(1 - md / MOUSE_RADIUS, 0.6) : 0;
                const lerpSpeed = mouseInfluence > n.energy ? 0.18 : 0.04;
                n.energy += (mouseInfluence - n.energy) * lerpSpeed;

                // Subtle pulse
                n.pulsePhase += PULSE_SPEED;
            }

            // Propagate energy between connected nodes
            for (let i = 0; i < nodes.length; i++) {
                for (let j = i + 1; j < nodes.length; j++) {
                    const d = dist(nodes[i], nodes[j]);
                    if (d < CONNECTION_DIST) {
                        const spread = 0.035;
                        if (nodes[i].energy > nodes[j].energy) {
                            nodes[j].energy += (nodes[i].energy - nodes[j].energy) * spread;
                        } else {
                            nodes[i].energy += (nodes[j].energy - nodes[i].energy) * spread;
                        }
                    }
                }
            }
        }

        function draw() {
            ctx.clearRect(0, 0, w, h);

            // Draw connections
            for (let i = 0; i < nodes.length; i++) {
                for (let j = i + 1; j < nodes.length; j++) {
                    const d = dist(nodes[i], nodes[j]);
                    if (d < CONNECTION_DIST) {
                        const proximity = 1 - d / CONNECTION_DIST;
                        const energy = Math.max(nodes[i].energy, nodes[j].energy);
                        const baseAlpha = proximity * 0.14;
                        const energyAlpha = energy * proximity * 0.5;
                        const alpha = baseAlpha + energyAlpha;

                        ctx.beginPath();
                        ctx.moveTo(nodes[i].x, nodes[i].y);
                        ctx.lineTo(nodes[j].x, nodes[j].y);

                        if (energy > 0.1) {
                            ctx.strokeStyle = `rgba(${CORAL.r}, ${CORAL.g}, ${CORAL.b}, ${alpha})`;
                            ctx.lineWidth = 1 + energy * 1.5;
                        } else {
                            ctx.strokeStyle = `rgba(255, 255, 255, ${alpha * 0.7})`;
                            ctx.lineWidth = 1;
                        }
                        ctx.stroke();

                        // Pulse particle traveling along connection
                        if (energy > 0.25) {
                            const t = (Math.sin(nodes[i].pulsePhase * 3) + 1) / 2;
                            const px = nodes[i].x + (nodes[j].x - nodes[i].x) * t;
                            const py = nodes[i].y + (nodes[j].y - nodes[i].y) * t;
                            ctx.beginPath();
                            ctx.arc(px, py, 1.5 + energy * 1.5, 0, Math.PI * 2);
                            ctx.fillStyle = `rgba(${CORAL.r}, ${CORAL.g}, ${CORAL.b}, ${energy * 0.6})`;
                            ctx.fill();
                        }
                    }
                }
            }

            // Draw nodes
            for (const n of nodes) {
                const pulse = Math.sin(n.pulsePhase) * 0.5 + 0.5;
                const alpha = n.baseAlpha + n.energy * 0.6 + pulse * 0.1;
                const r = n.radius + n.energy * 4 + pulse * 0.8;

                // Outer glow when energized
                if (n.energy > 0.15) {
                    const glowR = r + n.energy * 18;
                    const grd = ctx.createRadialGradient(n.x, n.y, r, n.x, n.y, glowR);
                    grd.addColorStop(0, `rgba(${CORAL.r}, ${CORAL.g}, ${CORAL.b}, ${n.energy * 0.25})`);
                    grd.addColorStop(1, `rgba(${CORAL.r}, ${CORAL.g}, ${CORAL.b}, 0)`);
                    ctx.beginPath();
                    ctx.arc(n.x, n.y, glowR, 0, Math.PI * 2);
                    ctx.fillStyle = grd;
                    ctx.fill();
                }

                // Core node
                ctx.beginPath();
                ctx.arc(n.x, n.y, r, 0, Math.PI * 2);
                if (n.energy > 0.1) {
                    ctx.fillStyle = `rgba(${CORAL.r}, ${CORAL.g}, ${CORAL.b}, ${alpha})`;
                } else {
                    ctx.fillStyle = `rgba(200, 200, 210, ${alpha * 0.85})`;
                }
                ctx.fill();
            }
        }

        function loop() {
            update();
            draw();
            requestAnimationFrame(loop);
        }

        // Mouse tracking relative to canvas
        canvas.addEventListener('mousemove', (e) => {
            const rect = canvas.getBoundingClientRect();
            mouse.x = e.clientX - rect.left;
            mouse.y = e.clientY - rect.top;
        });
        canvas.addEventListener('mouseleave', () => {
            mouse.x = -999;
            mouse.y = -999;
        });

        window.addEventListener('resize', () => {
            resize();
            createNodes();
        });

        resize();
        createNodes();
        loop();
    })();