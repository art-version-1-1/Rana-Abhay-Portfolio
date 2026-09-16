import { type ReactNode, useCallback, useEffect, useRef, useState } from 'react';

const TRAIL_COUNT = 6;
const TRAIL_INTERVAL = 40;
import { ArrowUpRight, Check, Copy, Github, Linkedin, Mail, MoveUpRight } from 'lucide-react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useRecordVisit } from '@workspace/api-client-react';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { Route, Switch, useLocation, Router as WouterRouter } from 'wouter';

const queryClient = new QueryClient();

type Project = {
  id: string;
  number: string;
  title: string;
  type: string;
  description: string;
  stack: string[];
  href: string;
  live: boolean;
};

// Add future work here. Each project is intentionally self-contained so the work index can grow without changing the layout.
const projects: Project[] = [
  {
    id: 'portfolio-sys',
    number: '01',
    title: 'PORTFOLIO.sys',
    type: 'Interactive web experience',
    description: 'A retro desktop OS portfolio with a boot sequence, draggable windows, terminal, themes, sound, and a working contact form.',
    stack: ['HTML5', 'CSS3', 'JavaScript', 'Canvas API'],
    href: 'https://github.com/rana-abhay1/portfolio.sys',
    live: true,
  },
  {
    id: 'gnit-college',
    number: '02',
    title: 'GNIT College Website',
    type: 'Institutional web platform',
    description: 'A modern, responsive official college website that makes a large amount of information feel easy to navigate.',
    stack: ['HTML5', 'CSS3', 'JavaScript'],
    href: 'https://github.com/MohitManola/gnit-homePage',
    live: false,
  },
  {
    id: 'geloof-solution',
    number: '03',
    title: 'Geloof Solution',
    type: 'Website rework',
    description: 'A reworked website with a sharper visual system, modern design language, and smooth interactions throughout.',
    stack: ['JavaScript', 'Web Design'],
    href: 'https://github.com/rana-abhay1/geloof-solution-private-limited',
    live: false,
  },
  {
    id: 'python-tts',
    number: '04',
    title: 'Python TTS Converter',
    type: 'Creative utility',
    description: 'A focused text-to-speech converter built with Python and local audio playback for quick, useful output.',
    stack: ['Python', 'Audio'],
    href: 'https://github.com/rana-abhay1/Python-tts-converter',
    live: false,
  },
  {
    id: 'weather-podcast',
    number: '05',
    title: 'Weather Podcast App',
    type: 'API + voice interface',
    description: 'Live weather data becomes a spoken, listenable forecast through API integration and text-to-speech.',
    stack: ['Weather API', 'Text-to-speech'],
    href: 'https://github.com/rana-abhay1/weather-podcast-using-api-in-python',
    live: false,
  },
];

const skills = [
  { name: 'JavaScript', score: 90 },
  { name: 'HTML5 / CSS3', score: 92 },
  { name: 'Python', score: 80 },
  { name: 'UI / UX Design', score: 85 },
  { name: 'API Integration', score: 78 },
  { name: 'Responsive Design', score: 88 },
  { name: 'React', score: 27 },
  { name: 'Java', score: 30 },
];

const navItems = [
  { id: 'about', label: 'About' },
  { id: 'work', label: 'Work' },
  { id: 'approach', label: 'Approach' },
  { id: 'contact', label: 'Contact' },
];

function Home() {
  const [activeSection, setActiveSection] = useState('about');
  const [copied, setCopied] = useState(false);
  const [visitCount, setVisitCount] = useState<number | null>(null);
  const heroRef = useRef<HTMLElement>(null);
  const trailRefs = useRef<(HTMLDivElement | null)[]>([]);
  const positionsRef = useRef<{ x: number; y: number; t: number }[]>([]);
  const rafRef = useRef(0);
  const recordVisit = useRecordVisit();

  useEffect(() => {
    recordVisit.mutate(undefined, {
      onSuccess: (data) => setVisitCount(data.totalVisits),
      onError: () => setVisitCount(0),
    });
  }, [recordVisit]);

  useEffect(() => {
    const sections = navItems
      .map(({ id }) => document.getElementById(id))
      .filter((section): section is HTMLElement => Boolean(section));

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target.id) setActiveSection(visible.target.id);
      },
      { rootMargin: '-18% 0px -62% 0px', threshold: [0.05, 0.2, 0.55] },
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const revealNodes = Array.from(document.querySelectorAll<HTMLElement>('.reveal'));
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08 },
    );
    revealNodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, []);

  // Animation loop for trail glow
  useEffect(() => {
    const animate = (now: number) => {
      const hero = heroRef.current;
      if (!hero) { rafRef.current = requestAnimationFrame(animate); return; }
      const rect = hero.getBoundingClientRect();
      const positions = positionsRef.current;

      // Prune old positions (> 350ms)
      while (positions.length > 0 && now - positions[0].t > 350) positions.shift();

      // Update main glow
      if (positions.length > 0) {
        const p = positions[positions.length - 1];
        hero.style.setProperty('--glow-x', `${((p.x - rect.left) / rect.width) * 100}%`);
        hero.style.setProperty('--glow-y', `${((p.y - rect.top) / rect.height) * 100}%`);
      } else {
        hero.style.setProperty('--glow-x', '50%');
        hero.style.setProperty('--glow-y', '50%');
      }

      // Update trail dots
      for (let i = 0; i < TRAIL_COUNT; i++) {
        const el = trailRefs.current[i];
        if (!el) continue;
        const idx = positions.length - 1 - (i + 1) * 2;
        if (idx < 0) { el.style.opacity = '0'; continue; }
        const p = positions[idx];
        const age = (now - p.t) / 350;
        el.style.opacity = `${Math.max(0, (1 - age) * 0.45)}`;
        el.style.setProperty('--trail-x', `${((p.x - rect.left) / rect.width) * 100}%`);
        el.style.setProperty('--trail-y', `${((p.y - rect.top) / rect.height) * 100}%`);
      }

      rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  const handleHeroMouseMove = useCallback((e: React.MouseEvent<HTMLElement>) => {
    const now = performance.now();
    const pos = positionsRef.current;
    const last = pos[pos.length - 1];
    if (last && now - last.t < TRAIL_INTERVAL) return;
    pos.push({ x: e.clientX, y: e.clientY, t: now });
    if (pos.length > TRAIL_COUNT * 4) pos.splice(0, pos.length - TRAIL_COUNT * 4);
  }, []);

  // Magnetic hover for project cards
  const handleCardMouseMove = useCallback((e: React.MouseEvent<HTMLAnchorElement>) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const offsetX = (e.clientX - centerX) / (rect.width / 2);
    const offsetY = (e.clientY - centerY) / (rect.height / 2);
    card.style.transform = `translateX(10px) translate(${offsetX * 6}px, ${offsetY * 4}px)`;
  }, []);

  const handleCardMouseLeave = useCallback((e: React.MouseEvent<HTMLAnchorElement>) => {
    e.currentTarget.style.transform = '';
  }, []);

  // Typewriter effect
  const typewriterText = 'AI engineer / web developer';
  const [typedText, setTypedText] = useState('');
  const [showCursor, setShowCursor] = useState(true);

  useEffect(() => {
    let i = 0;
    const timer = setTimeout(() => {
      const interval = setInterval(() => {
        i++;
        setTypedText(typewriterText.slice(0, i));
        if (i >= typewriterText.length) {
          clearInterval(interval);
          setTimeout(() => setShowCursor(false), 1200);
        }
      }, 55);
      return () => clearInterval(interval);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText('rana.abhay1@outlook.com');
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      window.location.href = 'mailto:rana.abhay1@outlook.com';
    }
  };

  return (
    <main className="site-shell">
      <div className="topline" />
      <header className="nav" data-testid="navigation-header">
        <nav className="nav-links" aria-label="Primary navigation">
          {navItems.map((item) => (
            <a
              className={`nav-link ${activeSection === item.id ? 'is-active' : ''}`}
              href={`#${item.id}`}
              key={item.id}
              data-testid={`link-nav-${item.id}`}
            >
              {item.label}
            </a>
          ))}
        </nav>
        <div className="nav-status" data-testid="status-availability">
          <span className="status-dot" aria-hidden="true" />
          <span className="nav-location">New Delhi / IST</span>
          <span className="nav-visits" aria-live="polite">
            {visitCount === null ? 'Visits / —' : `Visits / ${visitCount}`}
          </span>
        </div>
      </header>

      <section ref={heroRef} className="hero" id="top" aria-labelledby="hero-title" onMouseMove={handleHeroMouseMove}>
        <div className="hero-glow" aria-hidden="true" />
        {Array.from({ length: TRAIL_COUNT }, (_, i) => (
          <div
            key={i}
            className="hero-trail"
            aria-hidden="true"
            ref={(el) => { trailRefs.current[i] = el; }}
          />
        ))}
        <div className="hero-grid" aria-hidden="true" />
        <div className="hero-copy">
          <div className="eyebrow">
            <span className="eyebrow-line" />
            <span>{typedText}{showCursor && <span className="typewriter-cursor">|</span>}</span>
          </div>
          <h1 className="hero-title" id="hero-title">
            RANA
            <br />
            <em>ABHAY</em>
            <br />
            KUMAR<span style={{ color: '#f1f1f1' }}>.</span>
          </h1>
          <div className="hero-bottom">
            <p className="hero-intro">
              I build developer-friendly interfaces, useful automations, and AI-assisted creative work from New Delhi.
            </p>
            <div className="hero-meta">
              <span>Available for<br />interesting problems</span>
              <span className="scroll-cue"><span className="scroll-line" /> Scroll to explore</span>
            </div>
          </div>
        </div>
      </section>

      <section className="section section-border" id="about" aria-labelledby="about-title">
        <div className="section-heading reveal">
          <span className="section-index">01 / Profile</span>
          <h2 className="section-title" id="about-title">The short<br />version.</h2>
          <p className="section-note">A student with a bias toward making the thing, then making it better.</p>
        </div>
        <div className="about-layout">
          <p className="about-statement reveal delay-1">
            Curious by default.<br />
            <span>Precise by practice.</span>
          </p>
          <div className="about-copy reveal delay-2">
            <p>
              I&apos;m Rana, a B.Tech Artificial Intelligence &amp; Machine Learning student at Guru Gobind Singh Indraprastha University (2025–2029 expected).
            </p>
            <p>
              My work sits between front-end craft and practical intelligence: JavaScript, Python, modern web technologies, workflow automation, and interfaces that people actually enjoy using.
            </p>
            <div className="about-detail">
              <div>
                <span className="detail-label">Based in</span>
                <span className="detail-value">New Delhi, India</span>
              </div>
              <div>
                <span className="detail-label">Certification</span>
                <span className="detail-value">Ethical Hacking / Tutedude</span>
              </div>
              <div>
                <span className="detail-label">Languages</span>
                <span className="detail-value">English / Hindi</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section work-section section-border" id="work" aria-labelledby="work-title">
        <div className="section-heading reveal">
          <span className="section-index">02 / Selected work</span>
          <h2 className="section-title" id="work-title">Built to<br />be used.</h2>
          <p className="section-note">A growing index of experiments, client work, and tools with a point of view.</p>
        </div>
        <div className="project-list" data-testid="project-list">
          {projects.map((project, index) => (
            <a
              className={`project-card reveal delay-${Math.min(index + 1, 3)}`}
              href={project.href}
              target={project.href.startsWith('http') ? '_blank' : undefined}
              rel={project.href.startsWith('http') ? 'noreferrer' : undefined}
              aria-label={`${project.title}${project.href.startsWith('http') ? ' repository on GitHub' : ''}`}
              key={project.id}
              data-testid={`link-project-${project.id}`}
              onMouseMove={handleCardMouseMove}
              onMouseLeave={handleCardMouseLeave}
            >
              <span className="project-number">{project.number}</span>
              <div>
                <h3 className="project-name">{project.title}</h3>
                <span className="project-type">{project.type}{project.live ? ' / Live' : ''}</span>
                <div className="project-stack">
                  {project.stack.map((tag) => <span className="stack-tag" key={tag}>{tag}</span>)}
                </div>
              </div>
              <p className="project-description project-aside">{project.description}</p>
              <span className="project-arrow" aria-hidden="true"><ArrowUpRight size={17} strokeWidth={1.5} /></span>
            </a>
          ))}
        </div>
      </section>

      <section className="section section-border" id="skills" aria-labelledby="skills-title">
        <div className="section-heading reveal">
          <span className="section-index">03 / Toolkit</span>
          <h2 className="section-title" id="skills-title">The working<br />set.</h2>
          <p className="section-note">Not a scorecard. A snapshot of where I&apos;m most useful today.</p>
        </div>
        <div className="skill-layout">
          <p className="skill-intro reveal delay-1">
            The best tool is the one that gets the idea across. <strong>These are the tools I reach for first.</strong>
          </p>
          <div className="skill-list reveal delay-2" data-testid="skill-list">
            {skills.map((skill) => (
              <div className="skill-row" key={skill.name} data-testid={`row-skill-${skill.name.toLowerCase().replaceAll(' ', '-')}`}>
                <span className="skill-name">{skill.name}</span>
                <span className="skill-track" aria-hidden="true"><span className="skill-fill" style={{ width: `${skill.score}%` }} /></span>
                <span className="skill-percent">{skill.score}%</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section section-border" id="approach" aria-labelledby="approach-title">
        <div className="section-heading reveal">
          <span className="section-index">04 / Working principles</span>
          <h2 className="section-title" id="approach-title">Make it<br />matter.</h2>
          <p className="section-note">The habits underneath the pixels.</p>
        </div>
        <div className="principles reveal delay-1">
          <article className="principle" data-testid="principle-curiosity">
            <span className="principle-index">01</span>
            <h3>Stay curious.</h3>
            <p>Self-taught, always testing a new angle, never precious about the first idea.</p>
          </article>
          <article className="principle" data-testid="principle-clarity">
            <span className="principle-index">02</span>
            <h3>Prefer clarity.</h3>
            <p>Clean code and clear interfaces are not polish. They are the work.</p>
          </article>
          <article className="principle" data-testid="principle-adapt">
            <span className="principle-index">03</span>
            <h3>Adapt quickly.</h3>
            <p>New constraint, new tool, new domain. Find the shape of the problem first.</p>
          </article>
        </div>
      </section>

      <section className="section contact-section" id="contact" aria-labelledby="contact-title">
        <span className="section-index reveal">05 / Open channel</span>
        <h2 className="contact-heading reveal delay-1" id="contact-title">
          Have a good<br /><em>problem?</em>
        </h2>
        <p className="contact-sub reveal delay-2">
          I&apos;m interested in thoughtful collaborations, useful products, and creative technical challenges. Say hello and let&apos;s see what we can make of it.
        </p>
        <div className="contact-actions reveal delay-3">
          <a className="button-primary" href="mailto:rana.abhay1@outlook.com" data-testid="link-email">
            <Mail size={15} /> Start a conversation <MoveUpRight size={15} />
          </a>
          <button className="button-secondary" type="button" onClick={copyEmail} data-testid="button-copy-email">
            {copied ? <Check size={15} /> : <Copy size={15} />}
            {copied ? 'Copied' : 'Copy email'}
          </button>
        </div>
      </section>

      <footer className="footer">
        <p>© {new Date().getFullYear()} Rana Abhay Kumar</p>
        <div className="footer-links">
          <a href="https://github.com/rana-abhay1" target="_blank" rel="noreferrer" data-testid="link-github">
            <Github size={13} style={{ verticalAlign: 'middle', marginRight: 6 }} /> GitHub
          </a>
          <a href="https://linkedin.com/in/rana-abhay-kumar" target="_blank" rel="noreferrer" data-testid="link-linkedin">
            <Linkedin size={13} style={{ verticalAlign: 'middle', marginRight: 6 }} /> LinkedIn
          </a>
        </div>
      </footer>
    </main>
  );
}

function Router() {
  return (
    <RoutedErrorBoundary>
      <Switch>
        <Route path="/" component={Home} />
        <Route component={NotFound} />
      </Switch>
    </RoutedErrorBoundary>
  );
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;