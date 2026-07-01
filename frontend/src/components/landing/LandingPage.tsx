import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

const calculateTimeLeft = () => {
  const targetDate = new Date('2026-06-20T12:00:00+02:00'); // June 20, 2026 at 12:00:00 GMT+2
  const difference = +targetDate - +new Date();

  let timeLeft = {
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    expired: true
  };

  if (difference > 0) {
    timeLeft = {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / 1000 / 60) % 60),
      seconds: Math.floor((difference / 1000) % 60),
      expired: false
    };
  }

  return timeLeft;
};

export const LandingPage: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDark, setIsDark] = useState(() =>
    window.matchMedia('(prefers-color-scheme: dark)').matches
  );

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => setIsDark(e.matches);

    // Support older browsers just in case
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handler);
    } else {
      mediaQuery.addListener(handler);
    }

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handler);
      } else {
        mediaQuery.removeListener(handler);
      }
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let nodes: any[] = [];
    const nodeCount = 60;
    const maxDistance = 150;
    const nodeColor = '#3b82f6'; // Bright blue for nodes
    const lineColor = '#3b82f6'; // Bright blue for links
    let animationFrameId: number;

    class Node {
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;

      constructor() {
        this.x = Math.random() * canvas!.width;
        this.y = Math.random() * canvas!.height;
        this.vx = (Math.random() - 0.5) * 0.4;
        this.vy = (Math.random() - 0.5) * 0.4;
        this.radius = Math.random() * 2.5 + 1.5;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;

        if (this.x < 0 || this.x > canvas!.width) this.vx *= -1;
        if (this.y < 0 || this.y > canvas!.height) this.vy *= -1;
      }

      draw() {
        ctx!.beginPath();
        ctx!.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx!.fillStyle = nodeColor;
        ctx!.fill();
      }
    }

    function resize() {
      if (!canvas) return;
      canvas.width = canvas.parentElement?.offsetWidth || window.innerWidth;
      canvas.height = canvas.parentElement?.offsetHeight || 700;
      initNodes();
    }

    function initNodes() {
      nodes = [];
      for (let i = 0; i < nodeCount; i++) {
        nodes.push(new Node());
      }
    }

    function drawLines() {
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dist = Math.hypot(nodes[i].x - nodes[j].x, nodes[i].y - nodes[j].y);
          if (dist < maxDistance) {
            ctx!.beginPath();
            ctx!.moveTo(nodes[i].x, nodes[i].y);
            ctx!.lineTo(nodes[j].x, nodes[j].y);
            ctx!.strokeStyle = lineColor;
            ctx!.globalAlpha = (1 - dist / maxDistance) * 0.35; // Good balance for both light and dark
            ctx!.lineWidth = 0.75;
            ctx!.stroke();
            ctx!.globalAlpha = 1;
          }
        }
      }
    }

    function animate() {
      ctx!.clearRect(0, 0, canvas!.width, canvas!.height);
      nodes.forEach((node) => {
        node.update();
        node.draw();
      });
      drawLines();
      animationFrameId = requestAnimationFrame(animate);
    }

    window.addEventListener('resize', resize);
    resize();
    animate();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className={`min-h-screen overflow-y-auto font-sans selection:bg-blue-600 selection:text-white ${isDark ? 'dark bg-slate-950 text-slate-100' : 'bg-background text-on-background'}`}>
      {/* Top Banner */}
      <div className="bg-primary dark:bg-blue-600 text-on-primary dark:text-white py-2 px-4 text-center">
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-2 font-mono text-xs tracking-wider">
          <span className="material-symbols-outlined text-[14px]">code</span>
          <span>OPEN SOURCE — VIEW ON</span>
          <a className="underline font-bold hover:opacity-80 transition-opacity" href="https://github.com/StealthGuy/meshintel">GITHUB</a>
        </div>
      </div>

      {/* TopNavBar */}
      <header className="bg-surface/90 dark:bg-slate-950/80 backdrop-blur-md border-b border-outline-variant dark:border-slate-900 sticky top-0 z-50">
        <div className="flex justify-between items-center h-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-primary dark:text-blue-500 text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>hub</span>
            <div className="flex flex-col">
              <span className="text-lg font-mono font-black tracking-[0.2em] text-slate-900 dark:text-white uppercase leading-tight">MESHINTEL</span>
              <span className="text-[10px] font-mono tracking-widest text-slate-500 dark:text-slate-400 uppercase leading-none mt-0.5">NETWORK ANALYST v1.0</span>
            </div>
          </div>
          <nav className="hidden md:flex items-center gap-8">
          </nav>
          {/* Language Selector */}
          <div className="flex items-center gap-4">
            <Link to="/it" className="font-mono text-xs font-bold text-on-surface-variant dark:text-slate-400 hover:text-primary dark:hover:text-blue-400 transition-colors uppercase">
              IT
            </Link>
            <span className="text-outline font-mono text-xs">|</span>
            <span className="font-mono text-xs font-bold text-primary dark:text-blue-500 uppercase">
              EN
            </span>
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="relative min-h-[600px] flex flex-col justify-center overflow-hidden border-b border-outline-variant dark:border-slate-900 bg-surface dark:bg-slate-950">
          {/* Dynamic Network Graph Canvas */}
          <canvas ref={canvasRef} id="hero-network-canvas" className="absolute top-0 left-0 w-full h-full pointer-events-none z-0 opacity-25 dark:opacity-60"></canvas>

          <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #3b82f6 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>

          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex flex-col items-center justify-center relative z-10 py-24 text-center">
            <h1 className="text-5xl sm:text-7xl md:text-8xl leading-tight font-extrabold tracking-tighter text-on-surface dark:text-white mb-4 font-mono">
              MESHINTEL
            </h1>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-amber-500/10 text-amber-500 dark:bg-amber-400/10 dark:text-amber-400 border border-amber-500/20 dark:border-amber-400/20 mb-6 font-mono text-[10px] font-bold tracking-widest uppercase">
              <span className="w-1 h-1 rounded-full bg-amber-500 dark:bg-amber-400 animate-pulse"></span>
              ALPHA Version
            </div>
            <p className="font-sans text-lg sm:text-xl text-secondary dark:text-slate-300 mb-10 max-w-2xl leading-relaxed mx-auto bg-surface/60 dark:bg-slate-950/60 backdrop-blur-[2px] p-4 rounded-lg border border-outline-variant/50 dark:border-slate-900/50">
              The world's first network analysis study on Meshtastic, designed to empower off-grid communication across the Italian mesh network.
            </p>

            {/* Countdown Box */}
            <div className="mb-10 p-6 sm:p-8 rounded-xl bg-surface-container-low/40 dark:bg-slate-900/50 backdrop-blur-md border border-outline-variant dark:border-slate-900 max-w-xl mx-auto shadow-lg">
              <span className="font-mono text-xs text-primary dark:text-blue-500 uppercase tracking-[0.2em] block mb-2 font-semibold">
                🔔 CODE and REPORTS RELEASE COUNTDOWN
              </span>
              <p className="text-sm text-on-surface-variant dark:text-slate-400 mb-6 leading-relaxed">
                The source code of Meshintel and the structural and resilience analysis reports will be available starting from <strong>June 20, 2026 at 12:00 PM</strong>.
              </p>

              {timeLeft.expired ? (
                <div className="font-mono text-base text-emerald-600 dark:text-emerald-400 font-bold">
                  The source code and reports are now available!
                </div>
              ) : (
                <div className="grid grid-cols-4 gap-3 max-w-md mx-auto">
                  <div className="flex flex-col items-center justify-center p-3 bg-surface-container/60 dark:bg-slate-950/60 rounded border border-outline-variant/30 dark:border-slate-800/40">
                    <span className="font-mono text-2xl sm:text-3xl font-black text-primary dark:text-blue-400 leading-none mb-1">
                      {String(timeLeft.days).padStart(2, '0')}
                    </span>
                    <span className="text-[9px] font-mono text-outline dark:text-slate-500 uppercase tracking-widest">Days</span>
                  </div>
                  <div className="flex flex-col items-center justify-center p-3 bg-surface-container/60 dark:bg-slate-950/60 rounded border border-outline-variant/30 dark:border-slate-800/40">
                    <span className="font-mono text-2xl sm:text-3xl font-black text-primary dark:text-blue-400 leading-none mb-1">
                      {String(timeLeft.hours).padStart(2, '0')}
                    </span>
                    <span className="text-[9px] font-mono text-outline dark:text-slate-500 uppercase tracking-widest">Hours</span>
                  </div>
                  <div className="flex flex-col items-center justify-center p-3 bg-surface-container/60 dark:bg-slate-950/60 rounded border border-outline-variant/30 dark:border-slate-800/40">
                    <span className="font-mono text-2xl sm:text-3xl font-black text-primary dark:text-blue-400 leading-none mb-1">
                      {String(timeLeft.minutes).padStart(2, '0')}
                    </span>
                    <span className="text-[9px] font-mono text-outline dark:text-slate-500 uppercase tracking-widest">Minutes</span>
                  </div>
                  <div className="flex flex-col items-center justify-center p-3 bg-surface-container/60 dark:bg-slate-950/60 rounded border border-outline-variant/30 dark:border-slate-800/40">
                    <span className="font-mono text-2xl sm:text-3xl font-black text-primary dark:text-blue-400 leading-none mb-1">
                      {String(timeLeft.seconds).padStart(2, '0')}
                    </span>
                    <span className="text-[9px] font-mono text-outline dark:text-slate-500 uppercase tracking-widest">Seconds</span>
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center w-full sm:w-auto">
              <Link to="/map" className="w-full sm:w-auto">
                <button className="w-full sm:w-auto bg-primary dark:bg-blue-600 hover:bg-primary-container dark:hover:bg-blue-700 text-on-primary dark:text-white font-mono text-sm font-bold tracking-wider px-8 py-4 flex items-center justify-center gap-2 transition-all shadow-lg active:scale-[0.98] cursor-pointer">
                  Analyst Tool
                  <span className="material-symbols-outlined">arrow_forward</span>
                </button>
              </Link>
              <a href="https://blog.meshintel.it" target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto">
                <button className="w-full sm:w-auto bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-800 dark:text-white font-mono text-sm font-bold tracking-wider px-8 py-4 flex items-center justify-center gap-2 transition-all shadow-lg active:scale-[0.98] border border-slate-200 dark:border-slate-800 cursor-pointer">
                  REPORTS & BLOG
                  <span className="material-symbols-outlined text-[18px]">article</span>
                </button>
              </a>
            </div>
          </div>
        </section>

        {/* Open Source Section
        <section className="bg-surface-container-low dark:bg-slate-900/40 border-b border-outline-variant dark:border-slate-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-center gap-3">
            <div className="flex items-center justify-center gap-2 font-mono text-xs text-on-surface-variant dark:text-slate-400">
              <svg className="w-4 h-4 fill-current text-secondary dark:text-slate-300" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"></path>
              </svg>
              <a href="https://github.com/StealthGuy/meshintel" className="hover:text-primary dark:hover:text-blue-400 transition-colors">Love the project?  <span className="underline font-bold">Leave a star on GitHub!⭐</span></a>
            </div>
          </div>
        </section> */}

        {/* Demo & Telegram Warning Section */}
        <section className="bg-surface-container-low dark:bg-slate-900/40 border-b border-outline-variant dark:border-slate-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-center gap-3">
            <div className="flex items-center justify-center gap-2 font-mono text-xs text-on-surface-variant dark:text-slate-400 text-center flex-wrap">
              <span className="material-symbols-outlined text-[16px] text-primary dark:text-blue-500 shrink-0">info</span>
              <span><strong>Meshintel is currently in demo mode.</strong> Please report bugs and share your ideas on our Telegram group:</span>
              <a href="https://t.me/+W98oFecg2E01OTg0" target="_blank" rel="noopener noreferrer" className="hover:text-primary dark:hover:text-blue-400 underline font-bold flex items-center gap-1">
                Join the Telegram Group

                <span className="material-symbols-outlined text-[12px] inline">open_in_new</span>
              </a>
            </div>
          </div>
        </section>

        {/* Bento Grid Features Section */}
        <section className="py-24 bg-surface dark:bg-slate-900/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col mb-16">
              <span className="font-mono text-xs text-primary dark:text-blue-500 uppercase tracking-[0.2em] mb-2">The Framework</span>
              <h2 className="text-3xl sm:text-4xl font-bold font-mono text-on-surface dark:text-white">Why Network Analysis Matters</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Insight 1 */}
              <div className="bg-surface dark:bg-slate-900/30 border border-outline-variant dark:border-slate-900 rounded-lg p-8 flex flex-col justify-between hover:bg-surface-container-low dark:hover:bg-slate-900/60 dark:hover:border-slate-800 transition-all group">
                <div>
                  <span className="material-symbols-outlined text-primary dark:text-blue-500 mb-6 text-3xl">visibility</span>
                  <h3 className="text-lg font-bold font-mono text-on-surface dark:text-white mb-3 uppercase tracking-wide">Topology, Not Just Signal</h3>
                  <p className="text-on-surface-variant dark:text-slate-400 text-sm leading-relaxed">Most tools and maps only check the signal and position of nodes. Meshintel analyzes the overall structure of the Italian network. A node's signal strength doesn't matter if it's not well-integrated into the mesh.</p>
                </div>
              </div>
              {/* Insight 2 */}
              <div className="bg-surface dark:bg-slate-900/30 border border-outline-variant dark:border-slate-900 rounded-lg p-8 flex flex-col justify-between hover:bg-surface-container-low dark:hover:bg-slate-900/60 dark:hover:border-slate-800 transition-all group">
                <div>
                  <span className="material-symbols-outlined text-primary dark:text-blue-500 mb-6 text-3xl">insights</span>
                  <h3 className="text-lg font-bold font-mono text-on-surface dark:text-white mb-3 uppercase tracking-wide">Powered by NetworkX</h3>
                  <p className="text-on-surface-variant dark:text-slate-400 text-sm leading-relaxed">Our backend uses NetworkX, the leading Python library for network science. We process graph mathematics to calculate topology metrics.</p>
                </div>
              </div>
              {/* Insight 3 */}
              <div className="bg-surface dark:bg-slate-900/30 border border-outline-variant dark:border-slate-900 rounded-lg p-8 flex flex-col justify-between hover:bg-surface-container-low dark:hover:bg-slate-900/60 dark:hover:border-slate-800 transition-all group">
                <div>
                  <span className="material-symbols-outlined text-primary dark:text-blue-500 mb-6 text-3xl">hub</span>
                  <h3 className="text-lg font-bold font-mono text-on-surface dark:text-white mb-3 uppercase tracking-wide">Finding the Breakpoints</h3>
                  <p className="text-on-surface-variant dark:text-slate-400 text-sm leading-relaxed">We spot the vital nodes linking different areas. If one goes down, the network splits. Find them before they fail.</p>
                </div>
              </div>
              {/* Insight 4 */}
              <div className="bg-surface dark:bg-slate-900/30 border border-outline-variant dark:border-slate-900 rounded-lg p-8 flex flex-col justify-between hover:bg-surface-container-low dark:hover:bg-slate-900/60 dark:hover:border-slate-800 transition-all group">
                <div>
                  <span className="material-symbols-outlined text-primary dark:text-blue-500 mb-6 text-3xl">query_stats</span>
                  <h3 className="text-lg font-bold font-mono text-on-surface dark:text-white mb-3 uppercase tracking-wide">Core Network Metrics</h3>
                  <p className="text-on-surface-variant dark:text-slate-400 text-sm leading-relaxed">Track the essential health of the Italian mesh. Get instant data on key metrics like network density, diameter, average path length, and active connected components.</p>
                </div>
              </div>
              {/* Insight 5 */}
              <div className="bg-surface dark:bg-slate-900/30 border border-outline-variant dark:border-slate-900 rounded-lg p-8 flex flex-col justify-between hover:bg-surface-container-low dark:hover:bg-slate-900/60 dark:hover:border-slate-800 transition-all group">
                <div>
                  <span className="material-symbols-outlined text-primary dark:text-blue-500 mb-6 text-3xl">groups</span>
                  <h3 className="text-lg font-bold font-mono text-on-surface dark:text-white mb-3 uppercase tracking-wide">Geographical Clusters</h3>
                  <p className="text-on-surface-variant dark:text-slate-400 text-sm leading-relaxed">Community detection algorithms reveal how the Italian territory's mountains and valleys split the mesh. See how geography naturally clusters nodes into local communities.</p>
                </div>
              </div>
              {/* Insight 6 */}
              <div className="bg-surface dark:bg-slate-900/30 border border-outline-variant dark:border-slate-900 rounded-lg p-8 flex flex-col justify-between hover:bg-surface-container-low dark:hover:bg-slate-900/60 dark:hover:border-slate-800 transition-all group">
                <div>
                  <span className="material-symbols-outlined text-primary dark:text-blue-500 mb-6 text-3xl">analytics</span>
                  <h3 className="text-lg font-bold font-mono text-on-surface dark:text-white mb-3 uppercase tracking-wide">Zero-Cost Pipeline</h3>
                  <p className="text-on-surface-variant dark:text-slate-400 text-sm leading-relaxed">This showcase runs completely free. Powered by GitHub Actions, our pipeline updates network metrics every 24 hours with zero backend hosting costs.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-24 bg-background dark:bg-slate-950 border-t border-outline-variant dark:border-slate-900">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col mb-12">
              <span className="font-mono text-xs text-primary dark:text-blue-500 uppercase tracking-[0.2em] mb-2">Common Inquiries</span>
              <h2 className="text-3xl sm:text-4xl font-bold font-mono text-on-surface dark:text-white">Frequently Asked Questions</h2>
            </div>

            <div className="space-y-4">
              <div className="border border-outline-variant dark:border-slate-900 bg-surface dark:bg-slate-900/20 rounded-lg overflow-hidden">
                <label className="flex flex-col cursor-pointer hover:bg-surface-container-low dark:hover:bg-slate-900/40 transition-colors group">
                  <input defaultChecked className="peer hidden" name="faq-accordion" type="radio" />
                  <div className="flex items-center justify-between p-6">
                    <span className="text-sm sm:text-base font-bold text-on-surface dark:text-white font-mono uppercase group-hover:text-primary dark:group-hover:text-blue-400 transition-colors">1. Does the map show signal strength for my node?</span>
                    <span className="material-symbols-outlined text-on-surface-variant dark:text-slate-400 transition-transform duration-300 peer-checked:rotate-180">expand_more</span>
                  </div>
                  <div className="max-h-0 overflow-hidden peer-checked:max-h-96 transition-all duration-300 ease-in-out bg-surface-container-low dark:bg-slate-900/10">
                    <div className="p-6 pt-2 text-on-surface-variant dark:text-slate-400 text-sm leading-relaxed border-t border-outline-variant/30 dark:border-slate-900/40">
                      No, we purposely omitted it. Our main goal is to study the topology of the complete network, not single nodes. If you need signal coverage maps, use <a href="https://tools.loraitalia.it/map" target="_blank" rel="noopener noreferrer" className="text-primary dark:text-blue-400 hover:underline">tools.loraitalia.it/map</a> instead.
                    </div>
                  </div>
                </label>
              </div>

              <div className="border border-outline-variant dark:border-slate-900 bg-surface dark:bg-slate-900/20 rounded-lg overflow-hidden">
                <label className="flex flex-col cursor-pointer hover:bg-surface-container-low dark:hover:bg-slate-900/40 transition-colors group">
                  <input className="peer hidden" name="faq-accordion" type="radio" />
                  <div className="flex items-center justify-between p-6">
                    <span className="text-sm sm:text-base font-bold text-on-surface dark:text-white font-mono uppercase group-hover:text-primary dark:group-hover:text-blue-400 transition-colors">2. Is the network a true mesh?</span>
                    <span className="material-symbols-outlined text-on-surface-variant dark:text-slate-400 transition-transform duration-300 peer-checked:rotate-180">expand_more</span>
                  </div>
                  <div className="max-h-0 overflow-hidden peer-checked:max-h-96 transition-all duration-300 ease-in-out bg-surface-container-low dark:bg-slate-900/10">
                    <div className="p-6 pt-2 text-on-surface-variant dark:text-slate-400 text-sm leading-relaxed border-t border-outline-variant/30 dark:border-slate-900/40">
                      Yes, it is. The Italian Meshtastic network is increasingly taking on the characteristics of a true mesh. You can check the dashboard for the live metrics used to determine this.
                    </div>
                  </div>
                </label>
              </div>

              <div className="border border-outline-variant dark:border-slate-900 bg-surface dark:bg-slate-900/20 rounded-lg overflow-hidden">
                <label className="flex flex-col cursor-pointer hover:bg-surface-container-low dark:hover:bg-slate-900/40 transition-colors group">
                  <input className="peer hidden" name="faq-accordion" type="radio" />
                  <div className="flex items-center justify-between p-6">
                    <span className="text-sm sm:text-base font-bold text-on-surface dark:text-white font-mono uppercase group-hover:text-primary dark:group-hover:text-blue-400 transition-colors">3. Who are the "Gatekeepers" of communication?</span>
                    <span className="material-symbols-outlined text-on-surface-variant dark:text-slate-400 transition-transform duration-300 peer-checked:rotate-180">expand_more</span>
                  </div>
                  <div className="max-h-0 overflow-hidden peer-checked:max-h-96 transition-all duration-300 ease-in-out bg-surface-container-low dark:bg-slate-900/10">
                    <div className="p-6 pt-2 text-on-surface-variant dark:text-slate-400 text-sm leading-relaxed border-t border-outline-variant/30 dark:border-slate-900/40">
                      Using Betweenness Centrality, we find critical nodes bridging different areas. If a gatekeeper node goes offline, the network splits into isolated islands.
                    </div>
                  </div>
                </label>
              </div>

              <div className="border border-outline-variant dark:border-slate-900 bg-surface dark:bg-slate-900/20 rounded-lg overflow-hidden">
                <label className="flex flex-col cursor-pointer hover:bg-surface-container-low dark:hover:bg-slate-900/40 transition-colors group">
                  <input className="peer hidden" name="faq-accordion" type="radio" />
                  <div className="flex items-center justify-between p-6">
                    <span className="text-sm sm:text-base font-bold text-on-surface dark:text-white font-mono uppercase group-hover:text-primary dark:group-hover:text-blue-400 transition-colors">4. Is the network resilient?</span>
                    <span className="material-symbols-outlined text-on-surface-variant dark:text-slate-400 transition-transform duration-300 peer-checked:rotate-180">expand_more</span>
                  </div>
                  <div className="max-h-0 overflow-hidden peer-checked:max-h-96 transition-all duration-300 ease-in-out bg-surface-container-low dark:bg-slate-900/10">
                    <div className="p-6 pt-2 text-on-surface-variant dark:text-slate-400 text-sm leading-relaxed border-t border-outline-variant/30 dark:border-slate-900/40">
                      Our simulations show that the network holds up well against random failures. However, targeted attacks on key hub nodes can easily trigger a total network collapse.
                    </div>
                  </div>
                </label>
              </div>

              <div className="border border-outline-variant dark:border-slate-900 bg-surface dark:bg-slate-900/20 rounded-lg overflow-hidden">
                <label className="flex flex-col cursor-pointer hover:bg-surface-container-low dark:hover:bg-slate-900/40 transition-colors group">
                  <input className="peer hidden" name="faq-accordion" type="radio" />
                  <div className="flex items-center justify-between p-6">
                    <span className="text-sm sm:text-base font-bold text-on-surface dark:text-white font-mono uppercase group-hover:text-primary dark:group-hover:text-blue-400 transition-colors">5. How does MQTT affect the mesh?</span>
                    <span className="material-symbols-outlined text-on-surface-variant dark:text-slate-400 transition-transform duration-300 peer-checked:rotate-180">expand_more</span>
                  </div>
                  <div className="max-h-0 overflow-hidden peer-checked:max-h-96 transition-all duration-300 ease-in-out bg-surface-container-low dark:bg-slate-900/10">
                    <div className="p-6 pt-2 text-on-surface-variant dark:text-slate-400 text-sm leading-relaxed border-t border-outline-variant/30 dark:border-slate-900/40">
                      Thanks to data from the <a href="https://loraitalia.it" target="_blank" rel="noopener noreferrer" className="text-primary dark:text-blue-400 hover:underline">loraitalia.it</a> community, we are able to calculate metrics on the network composed of RF nodes, both with and without MQTT. This allows us to perform an empirical assessment of how the network would change if MQTT were to stop working one day.
                    </div>
                  </div>
                </label>
              </div>

              <div className="border border-outline-variant dark:border-slate-900 bg-surface dark:bg-slate-900/20 rounded-lg overflow-hidden">
                <label className="flex flex-col cursor-pointer hover:bg-surface-container-low dark:hover:bg-slate-900/40 transition-colors group">
                  <input className="peer hidden" name="faq-accordion" type="radio" />
                  <div className="flex items-center justify-between p-6">
                    <span className="text-sm sm:text-base font-bold text-on-surface dark:text-white font-mono uppercase group-hover:text-primary dark:group-hover:text-blue-400 transition-colors">6. Why did you build Meshintel?</span>
                    <span className="material-symbols-outlined text-on-surface-variant dark:text-slate-400 transition-transform duration-300 peer-checked:rotate-180">expand_more</span>
                  </div>
                  <div className="max-h-0 overflow-hidden peer-checked:max-h-96 transition-all duration-300 ease-in-out bg-surface-container-low dark:bg-slate-900/10">
                    <div className="p-6 pt-2 text-on-surface-variant dark:text-slate-400 text-sm leading-relaxed border-t border-outline-variant/30 dark:border-slate-900/40">
                      To solve a real problem: Meshtastic needs structural analysis. We also wanted to build a project to showcase our development skills.
                    </div>
                  </div>
                </label>
              </div>

              <div className="border border-outline-variant dark:border-slate-900 bg-surface dark:bg-slate-900/20 rounded-lg overflow-hidden">
                <label className="flex flex-col cursor-pointer hover:bg-surface-container-low dark:hover:bg-slate-900/40 transition-colors group">
                  <input className="peer hidden" name="faq-accordion" type="radio" />
                  <div className="flex items-center justify-between p-6">
                    <span className="text-sm sm:text-base font-bold text-on-surface dark:text-white font-mono uppercase group-hover:text-primary dark:group-hover:text-blue-400 transition-colors">7. Can I use Meshintel to analyze networks outside of Italy?</span>
                    <span className="material-symbols-outlined text-on-surface-variant dark:text-slate-400 transition-transform duration-300 peer-checked:rotate-180">expand_more</span>
                  </div>
                  <div className="max-h-0 overflow-hidden peer-checked:max-h-96 transition-all duration-300 ease-in-out bg-surface-container-low dark:bg-slate-900/10">
                    <div className="p-6 pt-2 text-on-surface-variant dark:text-slate-400 text-sm leading-relaxed border-t border-outline-variant/30 dark:border-slate-900/40">
                      Currently, this study is limited to the Italian territory as the data is sourced exclusively from the <a href="https://loraitalia.it" target="_blank" rel="noopener noreferrer" className="text-primary dark:text-blue-400 hover:underline">loraitalia.it</a> community. However, the MeshIntel architecture is fully scalable and completely independent of geographical location. If you have access to the graph of a mesh network composed entirely of radio frequency (RF-only) nodes please contact us to expand the analysis.
                    </div>
                  </div>
                </label>
              </div>
            </div>
          </div>
        </section >

        {/* Final CTA Section */}
        < section className="py-24 bg-primary dark:bg-gradient-to-br dark:from-slate-950 dark:via-slate-900 dark:to-blue-950 dark:border-t dark:border-slate-900 text-on-primary dark:text-white text-center" >
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl sm:text-5xl font-mono font-bold leading-tight mb-6">Ready to analyze the Meshtastic network yourself? </h2>
            <p className="text-white/80 dark:text-slate-300 text-base sm:text-lg mb-10 max-w-2xl mx-auto leading-relaxed">
              Use Meshintel to understand the routing, resilience, and structure of our decentralized mesh. If you are new to network analysis, check out our reports first to understand the metrics
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
              <Link to="/map" className="w-full sm:w-auto">
                <button className="w-full bg-white dark:bg-blue-600 hover:bg-white/90 dark:hover:bg-blue-700 text-primary dark:text-white font-mono text-sm font-bold tracking-wider px-12 py-5 transition-all active:scale-[0.98] border border-white dark:border-blue-600 rounded cursor-pointer">
                  OPEN TOOL
                </button>
              </Link>
              <a href="https://blog.meshintel.it" target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto">
                <button className="w-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-800 dark:text-white font-mono text-sm font-bold tracking-wider px-12 py-5 transition-all active:scale-[0.98] border border-slate-200 dark:border-slate-800 rounded cursor-pointer">
                  READ BLOG
                </button>
              </a>
            </div>
          </div>
        </section >
      </main >

      {/* Footer */}
      < footer className="bg-surface dark:bg-slate-950 border-t border-outline-variant dark:border-slate-900" >
        <div className="flex flex-col md:flex-row justify-between items-center py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center md:items-start mb-8 md:mb-0">
            <div className="flex items-center gap-3 mb-2">
              <span className="material-symbols-outlined text-primary dark:text-blue-500" style={{ fontVariationSettings: "'FILL' 1" }}>hub</span>
              <span className="text-lg font-mono font-black tracking-[0.2em] text-slate-900 dark:text-white uppercase leading-tight">MESHINTEL</span>
            </div>
            <p className="text-slate-500 text-xs mt-1">2026 MESHINTEL. Network Analysis for the Mesh.</p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-8">
            {/* <a className="font-mono text-xs text-slate-400 hover:text-primary dark:hover:text-blue-400 transition-colors" href="#">Privacy Policy</a>
            <a className="font-mono text-xs text-slate-400 hover:text-primary dark:hover:text-blue-400 transition-colors" href="#">Terms of Service</a>
            <a className="font-mono text-xs text-slate-400 hover:text-primary dark:hover:text-blue-400 transition-colors" href="#">API Status</a> */}
            <span className="text-xs text-slate-400 dark:text-slate-500 font-sans">
              Data kindly provided by <a className="underline hover:text-primary dark:hover:text-blue-400 transition-colors" href="https://www.loraitalia.it/" target="_blank" rel="noopener noreferrer">loraitalia.it</a>
            </span>
            {/* <a className="font-mono text-xs text-slate-400 hover:text-primary dark:hover:text-blue-400 transition-colors" href="https://github.com/StealthGuy/meshintel"> My GitHub</a> */}
          </div>
        </div>
      </footer >
    </div >
  );
};
