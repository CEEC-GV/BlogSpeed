import React, { useState, useEffect } from 'react';
import { ArrowRight, Zap, Sparkles, Plug, CheckCircle2, Star } from 'lucide-react';

const BlogSpeedsLanding = () => {
  const [isPlugged, setIsPlugged] = useState(false);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setIsPlugged(prev => !prev);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  const features = [
    { title: 'AI-Powered Content', desc: 'Generate SEO-optimized blogs in seconds with advanced AI' },
    { title: 'Zero Setup Time', desc: 'Plug directly into your product page—no complex integration' },
    { title: 'AEO Optimization', desc: 'Optimized for voice search and answer engines' },
    { title: 'Admin Dashboard', desc: 'Intuitive tools to manage and generate content effortlessly' },
    { title: 'Brand Consistency', desc: 'Maintain your voice and style across all content' },
    { title: 'Analytics Built-in', desc: 'Track performance and SEO impact in real-time' }
  ];

  const testimonials = [
    { name: 'Sarah Chen', role: 'CMO, TechFlow', text: 'BlogSpeeds transformed our SEO strategy. We saw 300% increase in organic traffic in just 2 months.' },
    { name: 'Marcus Rodriguez', role: 'Founder, EcoGoods', text: 'The plug-and-play integration took literally 5 minutes. Best investment we made this year.' },
    { name: 'Emily Watson', role: 'Product Lead, Nexus', text: 'Creating SEO content used to take days. Now it takes minutes. Game changer.' }
  ];

  const stats = [
    { value: '10x', label: 'Faster Content Creation' },
    { value: '300%', label: 'Average Traffic Increase' },
    { value: '5min', label: 'Setup Time' },
    { value: '99.9%', label: 'Uptime Guarantee' }
  ];

  return (
    <div className="bg-black text-white min-h-screen relative overflow-hidden">
      {/* Animated Dot Grid Background */}
      <div className="fixed inset-0 opacity-20 pointer-events-none">
        <div 
          className="absolute inset-0" 
          style={{
            backgroundImage: `radial-gradient(circle, white 1px, transparent 1px)`,
            backgroundSize: '30px 30px',
            transform: `translateY(${scrollY * 0.3}px)`
          }}
        />
      </div>

      
      <div className="relative z-10">
        {/* Navigation */}
        <nav className="border-b border-white/10 backdrop-blur-sm sticky top-0 z-50 bg-black/50">
          <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <img src='/src/assets/logo-white.png' alt="BlogSpeeds Logo" className="h-8 w-auto" />
            </div>
            <div className="hidden md:flex gap-8 text-sm">
              <a href="#features" className="hover:text-white/60 transition">Features</a>
              <a href="#how-it-works" className="hover:text-white/60 transition">How It Works</a>
              <a href="#testimonials" className="hover:text-white/60 transition">Testimonials</a>
            </div>
            <a href="/admin/login">
            <button className="bg-white text-black px-6 py-2 rounded-full text-sm font-medium hover:bg-white/90 transition">
              Get Started
            </button>
            </a>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-6 pt-32 pb-20 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 border border-white/20 rounded-full text-sm mb-8 animate-fade-in">
            <Sparkles className="w-4 h-4" />
            <span>AI-Powered Blog Integration</span>
          </div>
          
          <h1 className="text-7xl md:text-8xl font-bold tracking-tighter mb-6 leading-none animate-fade-in-up">
            Plug In.<br />
            <span className="bg-gradient-to-r from-white via-white/80 to-white/60 bg-clip-text text-transparent">
              Rank Higher.
            </span>
          </h1>
          
          <p className="text-xl text-white/60 max-w-2xl mx-auto mb-12 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            The only blog platform that integrates directly into your product page. 
            Generate SEO-optimized content in seconds with AI.
          </p>

          <div className="flex gap-4 justify-center animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
            <button className="bg-white text-black px-8 py-4 rounded-full font-medium hover:bg-white/90 transition flex items-center gap-2 group">
              Start Free Trial
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition" />
            </button>
            <button className="border border-white/20 px-8 py-4 rounded-full font-medium hover:bg-white/5 transition">
              Watch Demo
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-24 animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
            {stats.map((stat, idx) => (
              <div key={idx} className="border border-white/10 rounded-2xl p-6 backdrop-blur-sm bg-white/5">
                <div className="text-4xl font-bold mb-2">{stat.value}</div>
                <div className="text-sm text-white/60">{stat.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Plug Animation Section */}
        <section id="how-it-works" className="max-w-7xl mx-auto px-6 py-32">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold mb-4 tracking-tight">How It Works</h2>
            <p className="text-white/60 text-lg">Watch the magic happen in real-time</p>
          </div>

          <div className="relative h-96 border border-white/10 rounded-3xl bg-gradient-to-br from-white/5 to-transparent overflow-hidden">
            {/* Product Page */}
            <div 
              className={`absolute left-10 top-1/2 -translate-y-1/2 w-48 h-64 border-2 border-white/20 rounded-xl bg-black/50 backdrop-blur transition-all duration-1000 ${isPlugged ? 'scale-95' : 'scale-100'}`}
            >
              <div className="p-4">
                <div className="h-3 bg-white/20 rounded mb-2 w-3/4" />
                <div className="h-2 bg-white/10 rounded mb-2" />
                <div className="h-2 bg-white/10 rounded w-5/6" />
                <div className="mt-4 h-20 bg-white/5 rounded" />
                <div className="absolute bottom-4 right-4">
                  <div className={`w-8 h-8 rounded-full border-2 ${isPlugged ? 'border-green-500 bg-green-500/20' : 'border-white/20'} flex items-center justify-center transition-all duration-500`}>
                    <Plug className={`w-4 h-4 ${isPlugged ? 'text-green-400' : 'text-white/40'}`} />
                  </div>
                </div>
              </div>
            </div>

            {/* Connection Animation */}
            <div className="absolute left-64 top-1/2 -translate-y-1/2 flex items-center gap-4">
              <div className={`flex items-center gap-2 transition-all duration-1000 ${isPlugged ? 'opacity-100' : 'opacity-40'}`}>
                {[...Array(8)].map((_, i) => (
                  <div 
                    key={i}
                    className={`w-3 h-3 rounded-full ${isPlugged ? 'bg-green-400' : 'bg-white/20'}`}
                    style={{ 
                      animationDelay: `${i * 0.1}s`,
                      animation: isPlugged ? 'pulse 1.5s infinite' : 'none'
                    }}
                  />
                ))}
              </div>
            </div>

            {/* BlogSpeeds Module */}
            <div 
              className={`absolute right-10 top-1/2 -translate-y-1/2 w-56 h-72 border-2 rounded-xl backdrop-blur transition-all duration-1000 ${
                isPlugged 
                  ? 'border-green-400 bg-gradient-to-br from-green-500/20 to-transparent scale-100 shadow-[0_0_30px_rgba(34,197,94,0.3)]' 
                  : 'border-white/20 bg-black/50 scale-95'
              }`}
            >
              <div className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Zap className={`w-5 h-5 ${isPlugged ? 'text-green-400' : 'text-white/40'}`} />
                  <span className="text-sm font-bold">BlogSpeeds</span>
                </div>
                <div className="space-y-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div 
                      key={i}
                      className={`h-2 rounded transition-all duration-500 ${
                        isPlugged ? 'bg-green-400/40' : 'bg-white/10'
                      }`}
                      style={{ 
                        width: `${100 - i * 10}%`,
                        transitionDelay: `${i * 0.1}s`
                      }}
                    />
                  ))}
                </div>
                {isPlugged && (
                  <div className="mt-4 text-xs text-green-400 font-medium animate-pulse">
                    ✓ Connected & Optimizing
                  </div>
                )}
              </div>
            </div>

            {/* Status Text */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-center">
              <div className={`text-sm font-medium transition-all duration-500 ${isPlugged ? 'text-green-400' : 'text-white/40'}`}>
                {isPlugged ? '⚡ Blog Integration Active' : '○ Ready to Connect'}
              </div>
            </div>
          </div>

          {/* Steps */}
          <div className="grid md:grid-cols-3 gap-8 mt-16">
            {[
              { step: '01', title: 'Add Code Snippet', desc: 'Copy and paste one line of code into your product page' },
              { step: '02', title: 'Generate Content', desc: 'Use AI tools in the admin panel to create SEO blogs' },
              { step: '03', title: 'Watch Rankings Rise', desc: 'Monitor your improved SEO and organic traffic growth' }
            ].map((item, idx) => (
              <div key={idx} className="border border-white/10 rounded-2xl p-8 backdrop-blur bg-white/5 hover:bg-white/10 transition">
                <div className="text-5xl font-bold text-white/20 mb-4">{item.step}</div>
                <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                <p className="text-white/60">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* AI Workflow Flowchart */}
        <section className="max-w-7xl mx-auto px-6 py-32 border-t border-white/10">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold mb-4 tracking-tight">AI-Powered Workflow</h2>
            <p className="text-white/60 text-lg">Advanced SEO automation in one seamless process</p>
          </div>

          <div className="relative">
            {/* Flowchart Container */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative">
              {[
                { icon: '🔍', title: 'Keyword Research', desc: 'AI analyzes search trends', delay: 0 },
                { icon: '📝', title: 'Title Generation', desc: 'Create click-worthy headlines', delay: 0.2 },
                { icon: '📊', title: 'SERP Analysis', desc: 'Competitor intelligence', delay: 0.4 },
                { icon: '🏷️', title: 'Meta & Keywords', desc: 'Optimized descriptions', delay: 0.6 },
                { icon: '🗺️', title: 'Sitemap Update', desc: 'Auto-indexed content', delay: 0.8 }
              ].map((step, idx) => (
                <div key={idx} className="relative flex-1 w-full md:w-auto">
                  {/* Connection Line */}
                  {idx < 4 && (
                    <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-0.5 bg-gradient-to-r from-white/40 to-transparent z-0">
                      <div 
                        className="absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-white animate-flow-dot"
                        style={{ animationDelay: `${idx * 0.3}s` }}
                      />
                    </div>
                  )}
                  
                  {/* Step Card */}
                  <div 
                    className="border border-white/10 rounded-2xl p-6 backdrop-blur bg-gradient-to-br from-white/5 to-transparent hover:from-white/10 hover:border-white/20 transition-all relative z-10 animate-fade-in-up"
                    style={{ animationDelay: `${step.delay}s` }}
                  >
                    <div className="text-4xl mb-4 text-center">{step.icon}</div>
                    <h3 className="text-lg font-bold mb-2 text-center">{step.title}</h3>
                    <p className="text-sm text-white/60 text-center">{step.desc}</p>
                    
                    {/* Progress indicator */}
                    <div className="mt-4 h-1 bg-white/10 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-green-400 to-blue-400 rounded-full animate-progress"
                        style={{ animationDelay: `${step.delay}s` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Output Result */}
            <div className="mt-12 max-w-2xl mx-auto">
              <div className="text-center mb-6">
                <div className="inline-flex items-center gap-2 text-green-400 text-sm font-medium">
                  <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  Output Generated
                </div>
              </div>
              
              <div className="border-2 border-green-400/40 rounded-2xl p-8 backdrop-blur bg-gradient-to-br from-green-500/10 to-transparent animate-fade-in-up" style={{ animationDelay: '1.2s' }}>
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-10 h-10 rounded-full bg-green-400/20 flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-5 h-5 text-green-400" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-lg mb-2">SEO-Optimized Blog Ready</h4>
                    <p className="text-sm text-white/60 mb-3">Complete with meta tags, keywords, and sitemap integration</p>
                    <div className="flex flex-wrap gap-2">
                      {['SEO Score: 98/100', 'Readability: A+', 'Keywords: 12', 'Links: 8'].map((tag, i) => (
                        <span key={i} className="text-xs px-3 py-1 rounded-full bg-white/10 border border-white/20">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SEO & AEO Boost Visualization */}
        <section className="max-w-7xl mx-auto px-6 py-32 border-t border-white/10">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold mb-4 tracking-tight">Watch Your Rankings Soar</h2>
            <p className="text-white/60 text-lg">Real-time visibility boost across search engines</p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Before/After Chart */}
            <div className="space-y-8">
              <div className="border border-white/10 rounded-2xl p-8 backdrop-blur bg-white/5">
                <h3 className="text-xl font-bold mb-6">Brand Visibility Growth</h3>
                
                {/* SEO Metrics */}
                <div className="space-y-6">
                  {[
                    { label: 'Search Rankings', before: 35, after: 92, color: 'blue' },
                    { label: 'Organic Traffic', before: 28, after: 88, color: 'green' },
                    { label: 'Voice Search', before: 15, after: 75, color: 'purple' },
                    { label: 'Answer Engine', before: 20, after: 85, color: 'pink' }
                  ].map((metric, idx) => (
                    <div key={idx}>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-white/80">{metric.label}</span>
                        <span className="font-bold">{metric.after}%</span>
                      </div>
                      <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                        {/* Before (gray) */}
                        <div 
                          className="h-full bg-white/20 rounded-full transition-all duration-1000"
                          style={{ width: `${metric.before}%` }}
                        />
                        {/* After (colored) - animated */}
                        <div 
                          className={`h-full bg-gradient-to-r ${
                            metric.color === 'blue' ? 'from-blue-400 to-blue-500' :
                            metric.color === 'green' ? 'from-green-400 to-green-500' :
                            metric.color === 'purple' ? 'from-purple-400 to-purple-500' :
                            'from-pink-400 to-pink-500'
                          } rounded-full -mt-3 animate-expand-bar`}
                          style={{ 
                            width: `${metric.after}%`,
                            animationDelay: `${idx * 0.2}s`
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 mt-8 pt-8 border-t border-white/10">
                  <div>
                    <div className="text-3xl font-bold text-green-400">+247%</div>
                    <div className="text-xs text-white/60 mt-1">Avg. Increase</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-blue-400">14 Days</div>
                    <div className="text-xs text-white/60 mt-1">To See Results</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Animated Visualization */}
            <div className="relative h-[500px]">
              <div className="absolute inset-0 border border-white/10 rounded-2xl backdrop-blur bg-gradient-to-br from-white/5 to-transparent overflow-hidden">
                {/* Search Engine Icons Rising */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative w-full h-full">
                    {/* Central Brand Icon */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
                      <div className="w-20 h-20 rounded-full border-4 border-white bg-black flex items-center justify-center animate-pulse">
                        <Zap className="w-10 h-10" />
                      </div>
                      <div className="absolute inset-0 rounded-full border-4 border-white/20 animate-ping" />
                    </div>

                    {/* Orbiting Metrics */}
                    {[
                      { label: 'SEO', angle: 0, color: 'from-blue-400 to-blue-600', delay: 0 },
                      { label: 'AEO', angle: 90, color: 'from-green-400 to-green-600', delay: 0.3 },
                      { label: 'Voice', angle: 180, color: 'from-purple-400 to-purple-600', delay: 0.6 },
                      { label: 'Social', angle: 270, color: 'from-pink-400 to-pink-600', delay: 0.9 }
                    ].map((item, idx) => {
                      const radius = 120;
                      const x = Math.cos((item.angle * Math.PI) / 180) * radius;
                      const y = Math.sin((item.angle * Math.PI) / 180) * radius;
                      
                      return (
                        <div
                          key={idx}
                          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-orbit"
                          style={{
                            animationDelay: `${item.delay}s`,
                            '--orbit-x': `${x}px`,
                            '--orbit-y': `${y}px`
                          }}
                        >
                          <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center font-bold text-sm shadow-lg`}>
                            {item.label}
                          </div>
                          {/* Connection line to center */}
                          <svg className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[240px] h-[240px] -z-10 pointer-events-none">
                            <line
                              x1="120"
                              y1="120"
                              x2={120 + x}
                              y2={120 + y}
                              stroke="rgba(255,255,255,0.1)"
                              strokeWidth="2"
                              strokeDasharray="4 4"
                              className="animate-dash"
                            />
                          </svg>
                        </div>
                      );
                    })}

                    {/* Rising Arrows */}
                    {[...Array(12)].map((_, idx) => (
                      <div
                        key={idx}
                        className="absolute bottom-0 w-1 bg-gradient-to-t from-green-400/60 to-transparent animate-rise-arrow"
                        style={{
                          left: `${(idx + 1) * 8}%`,
                          height: `${30 + (idx % 3) * 20}%`,
                          animationDelay: `${idx * 0.15}s`
                        }}
                      >
                        <div className="absolute -top-2 left-1/2 -translate-x-1/2 text-green-400 text-xs">↑</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Stats Overlay */}
                <div className="absolute bottom-6 left-6 right-6">
                  <div className="flex justify-between items-end">
                    <div className="text-xs text-white/60">
                      <div className="text-2xl font-bold text-white mb-1 animate-count-up">10,247</div>
                      New Visitors Today
                    </div>
                    <div className="text-xs text-white/60 text-right">
                      <div className="text-2xl font-bold text-green-400 mb-1">↑ 347%</div>
                      Growth This Month
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Theme Synchronization Section */}
        <section className="max-w-7xl mx-auto px-6 py-32 border-t border-white/10">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold mb-4 tracking-tight">Your Brand, Your Style</h2>
            <p className="text-white/60 text-lg">Watch your brand colors flow into the blog page automatically</p>
          </div>

          <div className="relative">
            <div className="grid md:grid-cols-2 gap-12">
              {/* Product Page - Source of colors */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-3 h-3 rounded-full bg-purple-400 animate-pulse" />
                  <span className="text-sm font-medium text-white/80">Your Product Page</span>
                </div>
                
                <div className="relative border border-purple-400/30 rounded-2xl overflow-hidden bg-black h-[500px] shadow-[0_0_30px_rgba(168,85,247,0.2)]">
                  {/* Product Page Preview - Always colored */}
                  <div className="absolute inset-0 p-8">
                    {/* Header with theme colors */}
                    <div className="mb-6">
                      <div className="h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg mb-4 flex items-center px-4 shadow-lg">
                        <div className="w-8 h-8 bg-white rounded-full mr-3" />
                        <div className="flex-1 h-4 bg-white/30 rounded w-32" />
                      </div>
                    </div>

                    {/* Content with brand colors */}
                    <div className="space-y-4">
                      <div className="h-4 bg-purple-400/50 rounded w-3/4 shadow-sm" />
                      <div className="h-4 bg-purple-400/40 rounded w-full shadow-sm" />
                      <div className="h-4 bg-purple-400/40 rounded w-5/6 shadow-sm" />
                      
                      <div className="mt-6 p-4 bg-gradient-to-br from-purple-500/30 to-pink-500/30 rounded-xl border border-purple-400/40 shadow-lg">
                        <div className="h-3 bg-purple-300/50 rounded w-1/2 mb-2" />
                        <div className="h-2 bg-purple-300/40 rounded w-full" />
                      </div>

                      <div className="inline-flex gap-2 mt-4">
                        <div className="w-24 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full shadow-lg" />
                        <div className="w-24 h-10 bg-purple-500/30 border border-purple-400/40 rounded-full" />
                      </div>
                    </div>

                    {/* Theme palette */}
                    <div className="absolute bottom-4 left-4 right-4 p-4 bg-black/70 backdrop-blur border border-purple-400/40 rounded-lg">
                      <div className="text-xs text-purple-300 font-medium mb-3">Brand Color Palette</div>
                      <div className="flex gap-2">
                        <div className="flex-1 h-10 rounded-lg bg-purple-500 flex items-center justify-center text-xs font-medium shadow-lg">
                          Primary
                        </div>
                        <div className="flex-1 h-10 rounded-lg bg-pink-500 flex items-center justify-center text-xs font-medium shadow-lg">
                          Secondary
                        </div>
                        <div className="flex-1 h-10 rounded-lg bg-purple-600 flex items-center justify-center text-xs font-medium shadow-lg">
                          Accent
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Blog Page - Adopts colors */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-3 h-3 rounded-full bg-green-400 animate-pulse" />
                  <span className="text-sm font-medium text-white/80">Generated Blog Page</span>
                </div>
                
                <div className="relative border border-white/10 rounded-2xl overflow-hidden bg-black h-[500px]">
                  {/* Blog Page Preview - Starts gray, becomes colored */}
                  <div className="absolute inset-0 p-8">
                    {/* Header adopting theme */}
                    <div className="mb-6">
                      <div className="h-12 rounded-lg mb-4 flex items-center px-4 animate-color-adopt shadow-lg"
                        style={{
                          background: 'linear-gradient(to right, rgb(168 85 247), rgb(236 72 153))',
                          animationDelay: '0s'
                        }}
                      >
                        <div className="w-8 h-8 bg-white rounded-full mr-3" />
                        <div className="flex-1 h-4 bg-white/30 rounded w-32" />
                      </div>
                    </div>

                    {/* Blog content adopting colors progressively */}
                    <div className="space-y-4">
                      <div className="h-6 rounded w-4/5 mb-3 animate-color-adopt shadow-sm" 
                        style={{ 
                          backgroundColor: 'rgba(168, 85, 247, 0.5)',
                          animationDelay: '0.5s' 
                        }} 
                      />
                      <div className="h-2 rounded w-full mb-2 animate-color-adopt shadow-sm" 
                        style={{ 
                          backgroundColor: 'rgba(168, 85, 247, 0.3)',
                          animationDelay: '0.7s' 
                        }} 
                      />
                      <div className="h-2 rounded w-full mb-2 animate-color-adopt shadow-sm" 
                        style={{ 
                          backgroundColor: 'rgba(168, 85, 247, 0.3)',
                          animationDelay: '0.9s' 
                        }} 
                      />
                      <div className="h-2 rounded w-3/4 mb-2 animate-color-adopt shadow-sm" 
                        style={{ 
                          backgroundColor: 'rgba(168, 85, 247, 0.3)',
                          animationDelay: '1.1s' 
                        }} 
                      />

                      <div className="p-4 rounded-xl border animate-color-adopt shadow-lg" 
                        style={{ 
                          background: 'linear-gradient(to bottom right, rgba(168, 85, 247, 0.3), rgba(236, 72, 153, 0.3))',
                          borderColor: 'rgba(168, 85, 247, 0.4)',
                          animationDelay: '1.3s' 
                        }}
                      >
                        <div className="h-3 rounded w-2/3 mb-2 animate-color-adopt" 
                          style={{ 
                            backgroundColor: 'rgba(216, 180, 254, 0.5)',
                            animationDelay: '1.5s' 
                          }} 
                        />
                        <div className="h-2 rounded w-full mb-1 animate-color-adopt" 
                          style={{ 
                            backgroundColor: 'rgba(216, 180, 254, 0.4)',
                            animationDelay: '1.7s' 
                          }} 
                        />
                        <div className="h-2 rounded w-5/6 animate-color-adopt" 
                          style={{ 
                            backgroundColor: 'rgba(216, 180, 254, 0.4)',
                            animationDelay: '1.9s' 
                          }} 
                        />
                      </div>

                      <div className="space-y-2">
                        <div className="h-2 rounded w-full animate-color-adopt shadow-sm" 
                          style={{ 
                            backgroundColor: 'rgba(168, 85, 247, 0.25)',
                            animationDelay: '2.1s' 
                          }} 
                        />
                        <div className="h-2 rounded w-full animate-color-adopt shadow-sm" 
                          style={{ 
                            backgroundColor: 'rgba(168, 85, 247, 0.25)',
                            animationDelay: '2.3s' 
                          }} 
                        />
                        <div className="h-2 rounded w-4/5 animate-color-adopt shadow-sm" 
                          style={{ 
                            backgroundColor: 'rgba(168, 85, 247, 0.25)',
                            animationDelay: '2.5s' 
                          }} 
                        />
                      </div>

                      <div className="inline-flex gap-2 mt-4">
                        <div className="w-24 h-10 rounded-full animate-color-adopt shadow-lg" 
                          style={{ 
                            background: 'linear-gradient(to right, rgb(168 85 247), rgb(236 72 153))',
                            animationDelay: '2.7s' 
                          }} 
                        />
                      </div>
                    </div>

                    {/* Sync status */}
                    <div className="absolute bottom-4 left-4 right-4 p-3 bg-black/70 backdrop-blur border rounded-lg animate-color-adopt-border shadow-lg" 
                      style={{ 
                        borderColor: 'rgba(34, 197, 94, 0.4)',
                        animationDelay: '3s' 
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-xs text-green-400 font-medium mb-1 flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4" />
                            Theme Applied Successfully
                          </div>
                          <div className="text-xs text-white/50">Colors, gradients, and styling synced</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Center Animation - Color Transfer Particles */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none">
              <div className="relative">
                {/* Color particles flowing */}
                {[...Array(12)].map((_, idx) => (
                  <div
                    key={idx}
                    className="absolute rounded-full animate-color-flow"
                    style={{
                      width: `${8 + (idx % 3) * 4}px`,
                      height: `${8 + (idx % 3) * 4}px`,
                      background: idx % 3 === 0 
                        ? 'linear-gradient(135deg, rgb(168 85 247), rgb(236 72 153))' 
                        : idx % 3 === 1 
                        ? 'rgb(168 85 247)' 
                        : 'rgb(236 72 153)',
                      animationDelay: `${idx * 0.25}s`,
                      top: `${(idx % 4) * 20}px`,
                      boxShadow: '0 0 20px rgba(168, 85, 247, 0.6)'
                    }}
                  />
                ))}
                
                {/* Center sync icon */}
                <div className="relative w-20 h-20 rounded-full bg-black border-2 border-purple-400 flex items-center justify-center animate-pulse shadow-[0_0_40px_rgba(168,85,247,0.6)]">
                  <Sparkles className="w-10 h-10 text-purple-400" />
                </div>

                {/* Expanding waves */}
                <div className="absolute inset-0 rounded-full border-2 border-purple-400/40 animate-ping" />
                <div className="absolute inset-0 rounded-full border-2 border-pink-400/40 animate-ping" style={{ animationDelay: '0.5s' }} />
              </div>
            </div>

            {/* Feature highlights below */}
            <div className="grid md:grid-cols-3 gap-6 mt-12">
              {[
                { icon: '🎨', title: 'Color Palette Sync', desc: 'Primary, secondary, and accent colors flow automatically' },
                { icon: '✨', title: 'Gradient Matching', desc: 'Complex gradients and shadows perfectly replicated' },
                { icon: '🎯', title: 'Real-time Preview', desc: 'Watch colors apply instantly as you customize' }
              ].map((feature, idx) => (
                <div 
                  key={idx}
                  className="border border-white/10 rounded-xl p-6 backdrop-blur bg-white/5 hover:bg-white/10 transition animate-fade-in-up"
                  style={{ animationDelay: `${3.5 + idx * 0.2}s` }}
                >
                  <div className="text-3xl mb-3">{feature.icon}</div>
                  <h4 className="font-bold mb-2">{feature.title}</h4>
                  <p className="text-sm text-white/60">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-6 py-32 border-t border-white/10">
          <div className="text-center mb-20">
            <h2 className="text-5xl font-bold mb-4 tracking-tight">Our Clients</h2>
            <p className="text-white/60 text-lg">Trusted by leading brands worldwide</p>
          </div>

          {/* Animated Logo Grid */}
          <div className="relative">
            {/* Dotted background */}
            <div 
              className="absolute inset-0 opacity-5"
              style={{
                backgroundImage: `radial-gradient(circle, white 1px, transparent 1px)`,
                backgroundSize: '30px 30px',
              }}
            />

            {/* Logo Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {[
                'TechFlow',
                'EcoGoods', 
                'Nexus',
                'DataCore',
                'CloudSync',
                'PixelLab',
                'StartupX',
                'InnovateCo'
              ].map((client, idx) => (
                <div
                  key={idx}
                  className="group relative h-32 flex items-center justify-center animate-fade-in-up"
                  style={{ animationDelay: `${idx * 0.1}s` }}
                >
                  {/* Card */}
                  <div className="relative w-full h-full border-2 border-white/10 rounded-2xl bg-black hover:border-white/30 transition-all duration-500 overflow-hidden">
                    {/* Subtle dotted pattern */}
                    <div 
                      className="absolute inset-0 opacity-5"
                      style={{
                        backgroundImage: `radial-gradient(circle, white 1px, transparent 1px)`,
                        backgroundSize: '15px 15px',
                      }}
                    />

                    {/* Scan line effect */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                      <div className="absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-white to-transparent animate-scan-line" />
                    </div>

                    {/* Client Name */}
                    <div className="relative h-full flex items-center justify-center p-6">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-white mb-2 group-hover:scale-110 transition-transform duration-500">
                          {client}
                        </div>
                        {/* Decorative dots */}
                        <div className="flex justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                          <div className="w-1 h-1 rounded-full bg-white animate-pulse" />
                          <div className="w-1 h-1 rounded-full bg-white animate-pulse" style={{ animationDelay: '0.2s' }} />
                          <div className="w-1 h-1 rounded-full bg-white animate-pulse" style={{ animationDelay: '0.4s' }} />
                        </div>
                      </div>
                    </div>

                    {/* Corner accents */}
                    <div className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  </div>
                </div>
              ))}
            </div>

            {/* Floating particles */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              {[...Array(20)].map((_, idx) => (
                <div
                  key={idx}
                  className="absolute w-1 h-1 rounded-full bg-white animate-float-particle"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    animationDelay: `${Math.random() * 5}s`,
                    animationDuration: `${10 + Math.random() * 10}s`,
                    opacity: 0.1 + Math.random() * 0.2
                  }}
                />
              ))}
            </div>
          </div>

          {/* Stats Bar */}
          <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { value: '100+', label: 'Active Clients' },
              { value: '50k+', label: 'Blogs Generated' },
              { value: '99.9%', label: 'Satisfaction Rate' }
            ].map((stat, idx) => (
              <div
                key={idx}
                className="relative group animate-fade-in-up"
                style={{ animationDelay: `${1 + idx * 0.1}s` }}
              >
                <div className="relative border-2 border-white/10 rounded-2xl p-8 bg-black hover:border-white/20 transition-all duration-500 text-center">
                  {/* Dotted background */}
                  <div 
                    className="absolute inset-0 opacity-5 rounded-2xl"
                    style={{
                      backgroundImage: `radial-gradient(circle, white 1px, transparent 1px)`,
                      backgroundSize: '12px 12px',
                    }}
                  />
                  
                  <div className="relative">
                    <div className="text-5xl font-bold mb-2 group-hover:scale-110 transition-transform duration-500">
                      {stat.value}
                    </div>
                    <div className="text-sm text-white/60 uppercase tracking-wider">
                      {stat.label}
                    </div>
                    
                    {/* Decorative line */}
                    <div className="mt-4 h-px w-0 group-hover:w-full bg-gradient-to-r from-transparent via-white to-transparent transition-all duration-700 mx-auto" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Features Grid */}
        <section id="features" className="max-w-7xl mx-auto px-6 py-32">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold mb-4 tracking-tight">Everything You Need</h2>
            <p className="text-white/60 text-lg">Powerful features designed for modern brands</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {features.map((feature, idx) => (
              <div 
                key={idx} 
                className="border border-white/10 rounded-2xl p-8 backdrop-blur bg-gradient-to-br from-white/5 to-transparent hover:from-white/10 hover:border-white/20 transition-all group"
              >
                <div className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center mb-6 group-hover:border-white/40 group-hover:bg-white/5 transition">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-white/60 text-sm leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Testimonials */}
        <section id="testimonials" className="max-w-7xl mx-auto px-6 py-32">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold mb-4 tracking-tight">Loved by Teams</h2>
            <p className="text-white/60 text-lg">See what brands are saying</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, idx) => (
              <div 
                key={idx}
                className="border border-white/10 rounded-2xl p-8 backdrop-blur bg-white/5 hover:bg-white/10 transition"
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-white text-white" />
                  ))}
                </div>
                <p className="text-white/80 mb-6 leading-relaxed">"{testimonial.text}"</p>
                <div>
                  <div className="font-bold">{testimonial.name}</div>
                  <div className="text-sm text-white/60">{testimonial.role}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="max-w-4xl mx-auto px-6 py-32">
          <div className="border border-white/10 rounded-3xl p-16 backdrop-blur bg-gradient-to-br from-white/10 to-transparent text-center">
            <h2 className="text-5xl font-bold mb-6 tracking-tight">
              Ready to Transform<br />Your SEO Strategy?
            </h2>
            <p className="text-white/60 text-lg mb-8 max-w-2xl mx-auto">
              Join hundreds of brands already using BlogSpeeds to dominate search rankings.
            </p>
            <button className="bg-white text-black px-12 py-5 rounded-full font-bold text-lg hover:bg-white/90 transition flex items-center gap-3 mx-auto group">
              Start Your Free Trial
              <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition" />
            </button>
            <p className="text-white/40 text-sm mt-6">No credit card required • 14-day free trial</p>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-white/10 py-12">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-8">
              <div className="flex items-center gap-2">
                <Zap className="w-6 h-6" />
                <span className="text-xl font-bold">BlogSpeeds</span>
              </div>
              <div className="flex gap-8 text-sm text-white/60">
                <a href="#" className="hover:text-white transition">Privacy</a>
                <a href="#" className="hover:text-white transition">Terms</a>
                <a href="#" className="hover:text-white transition">Contact</a>
              </div>
              <div className="text-sm text-white/40">
                © 2026 BlogSpeeds. All rights reserved.
              </div>
            </div>
          </div>
        </footer>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 1s ease-out;
        }

        .animate-fade-in-up {
          animation: fade-in-up 1s ease-out;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        @keyframes flow-dot {
          0% {
            left: 0;
            opacity: 0;
          }
          50% {
            opacity: 1;
          }
          100% {
            left: 100%;
            opacity: 0;
          }
        }

        .animate-flow-dot {
          animation: flow-dot 2s ease-in-out infinite;
        }

        @keyframes progress {
          0% {
            width: 0%;
          }
          100% {
            width: 100%;
          }
        }

        .animate-progress {
          animation: progress 1.5s ease-out forwards;
        }

        @keyframes expand-bar {
          0% {
            width: 0%;
            opacity: 0;
          }
          100% {
            opacity: 1;
          }
        }

        .animate-expand-bar {
          animation: expand-bar 1.5s ease-out forwards;
        }

        @keyframes orbit {
          0%, 100% {
            transform: translate(calc(-50% + var(--orbit-x, 0px)), calc(-50% + var(--orbit-y, 0px))) scale(1);
          }
          50% {
            transform: translate(calc(-50% + var(--orbit-x, 0px)), calc(-50% + var(--orbit-y, 0px))) scale(1.1);
          }
        }

        .animate-orbit {
          animation: orbit 3s ease-in-out infinite;
        }

        @keyframes dash {
          to {
            stroke-dashoffset: -8;
          }
        }

        .animate-dash {
          stroke-dasharray: 4 4;
          animation: dash 0.5s linear infinite;
        }

        @keyframes rise-arrow {
          0% {
            opacity: 0;
            transform: translateY(20px);
          }
          50% {
            opacity: 1;
          }
          100% {
            opacity: 0;
            transform: translateY(-20px);
          }
        }

        .animate-rise-arrow {
          animation: rise-arrow 2s ease-in-out infinite;
        }

        @keyframes scan-line {
          0% {
            top: 0%;
          }
          100% {
            top: 100%;
          }
        }

        .animate-scan-line {
          animation: scan-line 2s ease-in-out infinite;
        }

        @keyframes float-particle {
          0%, 100% {
            transform: translateY(0px) translateX(0px);
            opacity: 0.1;
          }
          50% {
            transform: translateY(-30px) translateX(10px);
            opacity: 0.3;
          }
        }

        .animate-float-particle {
          animation: float-particle 10s ease-in-out infinite;
        }

        @keyframes count-up {
          0% {
            opacity: 0;
            transform: translateY(10px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-count-up {
          animation: count-up 1s ease-out;
        }

        @keyframes theme-pulse {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.8;
            transform: scale(1.02);
          }
        }

        .animate-theme-pulse {
          animation: theme-pulse 2s ease-in-out infinite;
        }

        @keyframes theme-sync {
          0% {
            opacity: 0;
            transform: translateX(-20px) scale(0.95);
          }
          50% {
            opacity: 0.5;
            transform: translateX(-10px) scale(0.98);
          }
          100% {
            opacity: 1;
            transform: translateX(0) scale(1);
          }
        }

        .animate-theme-sync {
          animation: theme-sync 1s ease-out forwards;
        }

        @keyframes theme-transfer {
          0% {
            transform: translateX(-200px);
            opacity: 0;
            scale: 0.5;
          }
          50% {
            opacity: 1;
            scale: 1;
          }
          100% {
            transform: translateX(200px);
            opacity: 0;
            scale: 0.5;
          }
        }

        .animate-theme-transfer {
          animation: theme-transfer 2s ease-in-out infinite;
        }

        @keyframes spark {
          0%, 100% {
            opacity: 0;
            transform: scaleY(0);
          }
          50% {
            opacity: 1;
            transform: scaleY(1);
          }
        }

        .animate-spark {
          animation: spark 0.6s ease-out infinite;
        }

        @keyframes color-adopt {
          0% {
            background-color: rgb(38, 38, 38);
            opacity: 0.5;
          }
          50% {
            opacity: 0.8;
          }
          100% {
            opacity: 1;
          }
        }

        .animate-color-adopt {
          animation: color-adopt 2s ease-out forwards;
        }

        @keyframes color-adopt-border {
          0% {
            border-color: rgba(255, 255, 255, 0.1);
          }
          100% {
            border-color: rgba(34, 197, 94, 0.4);
          }
        }

        .animate-color-adopt-border {
          animation: color-adopt-border 2s ease-out forwards;
        }

        @keyframes color-flow {
          0% {
            transform: translateX(-250px) translateY(0) scale(0);
            opacity: 0;
          }
          20% {
            opacity: 1;
            transform: translateX(-200px) translateY(-10px) scale(1);
          }
          50% {
            transform: translateX(0) translateY(0) scale(1.2);
            opacity: 1;
          }
          80% {
            opacity: 1;
            transform: translateX(200px) translateY(10px) scale(1);
          }
          100% {
            transform: translateX(250px) translateY(0) scale(0);
            opacity: 0;
          }
        }

        .animate-color-flow {
          animation: color-flow 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default BlogSpeedsLanding;