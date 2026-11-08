
import Image from "next/image";
import ScrollAnimations from "./components/ScrollAnimations";
import CosmicPopups from "./components/CosmicPopups";
import GalleryPreview from "./components/GalleryPreview";

const domains = [
  {
    number: "01",
    title: "Astronomy",
    slug: "astronomy",
    description:
      "Explore celestial objects, galaxies, stars and the wonders of our universe.",
    icon: "✧",
  },
  {
    number: "02",
    title: "Astrophysics",
    slug: "astrophysics",
    description:
      "Understand the physical laws and forces shaping the cosmos.",
    icon: "◉",
  },
  {
    number: "03",
    title: "Space Exploration",
    slug: "space-exploration",
    description:
      "Discover missions, planetary science and humanity's journey beyond Earth.",
    icon: "⌁",
  },
  {
    number: "04",
    title: "Cosmic Research",
    slug: "cosmic-research",
    description:
      "Explore discoveries, scientific questions and the frontiers of knowledge.",
    icon: "⌘",
  },
];

const navigation = [
  { label: "Home", href: "#home" },
  { label: "About", href: "#about" },
  { label: "Explore", href: "#explore" },
  { label: "Our Mission", href: "#mission" },
  { label: "Gallery", href: "/gallery" },
  { label: "Live Space Updates", href: "/live-space-updates" },
];

const socialLinks = [
  {
    label: "Instagram",
    href: "https://www.instagram.com/cosmovate.in/",
  },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/company/cosmovate/",
  },
  {
    label: "Gmail",
    href: "mailto:cosmovate.enquiries@gmail.com",
  },
];

function SocialIcon({ name }: { name: string }) {
  
if (name === "Instagram") {
  return (
    <svg
      viewBox="0 0 24 24"
      width="24"
      height="24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <rect
        x="3"
        y="3"
        width="18"
        height="18"
        rx="5"
        stroke="#E85D91"
        strokeWidth="2"
      />
      <circle
        cx="12"
        cy="12"
        r="4"
        stroke="#E85D91"
        strokeWidth="2"
      />
      <circle cx="17.5" cy="6.8" r="1.2" fill="#E85D91" />
    </svg>
  );
}


  if (name === "LinkedIn") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path
          fill="#0A66C2"
          d="M20.45 2H3.55C2.69 2 2 2.68 2 3.52v16.96c0 .84.69 1.52 1.55 1.52h16.9c.86 0 1.55-.68 1.55-1.52V3.52c0-.84-.69-1.52-1.55-1.52ZM8.1 18.5H5.15V9h2.95v9.5ZM6.63 7.7a1.71 1.71 0 1 1 0-3.42 1.71 1.71 0 0 1 0 3.42ZM19 18.5h-2.95v-4.62c0-1.1-.02-2.51-1.53-2.51-1.53 0-1.77 1.2-1.77 2.43v4.7H9.8V9h2.83v1.3h.04c.4-.75 1.36-1.53 2.8-1.53 3 0 3.55 1.97 3.55 4.53v5.2Z"
        />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#EA4335"
        d="M3 6.5 12 13l9-6.5V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6.5Z"
      />
      <path fill="#4285F4" d="M3 6.5V19a2 2 0 0 0 2 2h1V9.4L3 6.5Z" />
      <path fill="#34A853" d="M18 21h1a2 2 0 0 0 2-2V6.5l-3 2.9V21Z" />
      <path fill="#FBBC04" d="m3 6.5 3 2.9 6 4.3 6-4.3 3-2.9-9-4.5-9 4.5Z" />
      <path fill="#EA4335" d="M3 6.5 12 13l9-6.5-3-2.2-6 4.3-6-4.3-3 2.2Z" />
    </svg>
  );
}

function SocialLinks({ className = "" }: { className?: string }) {
  return (
    <div className={`social-links ${className}`}>
      {socialLinks.map((link) => (
        <a
          key={link.label}
          href={link.href}
          target={link.label !== "Gmail" ? "_blank" : undefined}
          rel={link.label !== "Gmail" ? "noopener noreferrer" : undefined}
          aria-label={`COSMOVATE ${link.label}`}
          title={link.label}
          className={`social-icon social-${link.label.toLowerCase()}`}
        >
          <SocialIcon name={link.label} />
        </a>
      ))}
    </div>
  );
}

export default function Home() {
  return (
    <main>
      <ScrollAnimations />
      <CosmicPopups />
      {/* Navigation */}
      <header className="site-header">
        <nav className="navbar container">
          <a href="#home" className="brand">
            <Image
              src="/cosmovate-logo.png"
              alt="COSMOVATE logo"
              width={68}
              height={68}
              className="brand-logo"
              style={{ width: "68px", height: "68px" }}
              priority
            />
            <span>COSMOVATE</span>
          </a>

          <div className="nav-links">
            {navigation.map((item) => (
              <a key={item.label} href={item.href}>
                {item.label}
              </a>
            ))}
          </div>

          <SocialLinks className="navbar-socials" />

          <a href="#join" className="nav-cta">
            Join the Community <span>↗</span>
          </a>
        </nav>
      </header>

      {/* Hero */}
      <section className="hero" id="home">
        <div className="hero-stars" />
        <div className="hero-glow" />

        <div className="container hero-content">
          <div className="hero-copy" data-scroll-reveal="hero">
            <div className="eyebrow">
              <span className="status-dot" />
              A COMMUNITY BEYOND BOUNDARIES
            </div>

            <h1>
              THE UNIVERSE
              <br />
              IS <span>OUR FRONTIER.</span>
            </h1>

            <p className="hero-description">
              Curiosity has no boundaries. Discover the science, explore the
              unknown and be part of a community driven by the mysteries of
              the cosmos.
            </p>

            <div className="hero-actions">
              <a href="#join" className="button button-primary">
                Explore COSMOVATE <span>↗</span>
              </a>

              <a href="#about" className="button button-secondary">
                Discover our story <span>↓</span>
              </a>

              <a href="/live-space-updates" className="button button-secondary">
                🛰️ Live Space Updates <span>↗</span>
              </a>
            </div>

            <div className="hero-caption">
              <span>SPACE</span>
              <span className="caption-divider" />
              <span>SCIENCE</span>
              <span className="caption-divider" />
              <span>DISCOVERY</span>
            </div>
          </div>

          <div className="cosmos-art" data-scroll-reveal="cosmos" aria-hidden="true">
            <div className="orbit orbit-one" />
            <div className="orbit orbit-two" />
            <div className="orbit orbit-three" />
            <div className="planet">
              <div className="planet-light" />
              <div className="planet-shadow" />
            </div>
            <div className="moon-orbit">
              <div className="planet-moon" />
            </div>
            <span className="shooting-star shooting-star-one" />
            <span className="shooting-star shooting-star-two" />
            <span className="orbit-label label-one">EXPLORATION</span>
            <span className="orbit-label label-two">INNOVATION</span>
            <span className="orbit-label label-three">DISCOVERY</span>
            <span className="floating-star star-one">✦</span>
            <span className="floating-star star-two">✧</span>
            <span className="floating-star star-three">✦</span>
          </div>
        </div>

        <div className="hero-bottom container">
          <span>01 — THE BEGINNING</span>
          <span>LOOK BEYOND WHAT YOU KNOW ↓</span>
        </div>
      </section>

      {/* About */}
      <section data-scroll-reveal className="about-section section-padding" id="about">
        <div className="container about-grid">
          <div>
            <span className="section-label">02 / WHO WE ARE</span>
            <h2>
              A universe of
              <br />
              <span>possibilities.</span>
            </h2>
          </div>

          <div className="about-copy" data-scroll-reveal>
            <p>
              COSMOVATE is a space science community built around curiosity,
              exploration and the pursuit of knowledge.
            </p>
            <p>
              From distant galaxies and fascinating exoplanets to the
              technologies shaping space exploration, we bring together
              people who want to understand what lies beyond our world.
            </p>
            <a href="#mission" className="text-link">
              Discover our mission <span>↗</span>
            </a>
          </div>
        </div>
      </section>

      {/* Mission */}
      <section data-scroll-reveal className="mission-section section-padding" id="mission">
        <div className="container">
          <span className="section-label">03 / OUR PURPOSE</span>

          <div className="mission-heading" data-scroll-reveal>
            <h2>
              Driven by curiosity.
              <br />
              <span>United by discovery.</span>
            </h2>
            <p>
              The universe is full of unanswered questions. We believe every
              great discovery begins with the courage to ask them.
            </p>
          </div>

          <div className="mission-values" data-scroll-stagger>
            <div>
              <span className="value-number">01</span>
              <h3>Explore</h3>
              <p>Look beyond the familiar and question the unknown.</p>
            </div>
            <div>
              <span className="value-number">02</span>
              <h3>Innovate</h3>
              <p>Embrace ideas, technology and new perspectives.</p>
            </div>
            <div>
              <span className="value-number">03</span>
              <h3>Discover</h3>
              <p>Turn curiosity into knowledge and understanding.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Exploration domains */}
      <section data-scroll-reveal className="explore-section section-padding" id="explore">
        <div className="container">
          <div className="explore-heading" data-scroll-reveal>
            <div>
              <span className="section-label">04 / EXPLORE THE COSMOS</span>
              <h2>
                The universe,
                <br />
                <span>one discovery at a time.</span>
              </h2>
            </div>
            <p>
              There is more to the cosmos than meets the eye. Find your
              curiosity among the many frontiers of space science.
            </p>
          </div>

          <div className="domain-grid" data-scroll-stagger>
            {domains.map((domain) => (
              <a
                className="domain-card domain-card-link"
                href={`/explore/${domain.slug}`}
                key={domain.number}
                aria-label={`Explore ${domain.title}`}
              >
                <div className="domain-visual" aria-hidden="true">
                  <span className={`domain-orb domain-orb-${domain.number}`}>{domain.icon}</span>
                  <span className="domain-orbit-line" />
                  <span className="domain-visual-star">✦</span>
                </div>
                <div className="domain-top">
                  <span>{domain.number} / DOMAIN</span>
                  <span className="domain-icon">{domain.icon}</span>
                </div>
                <h3>{domain.title}</h3>
                <p>{domain.description}</p>
                <span className="domain-card-action">EXPLORE DOMAIN <span>↗</span></span>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Cosmic Challenges */}
      <section
        data-scroll-reveal
        className="section-padding relative overflow-hidden bg-[#071426]"
        id="challenges"
      >
        <div className="pointer-events-none absolute -left-32 top-10 h-80 w-80 rounded-full bg-blue-500/10 blur-[110px]" />
        <div className="pointer-events-none absolute -right-32 bottom-0 h-80 w-80 rounded-full bg-violet-500/10 blur-[110px]" />

        <div className="container relative z-10">
          <div className="mb-12 flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div data-scroll-reveal>
              <span className="section-label">05 / TEST YOUR COSMIC KNOWLEDGE</span>
              <h2 className="mt-4 text-4xl font-semibold leading-tight text-white md:text-5xl">
                Think you know
                <br />
                <span className="text-cyan-300">the universe?</span>
              </h2>
            </div>
            <div className="max-w-xl" data-scroll-reveal>
              <p className="text-base leading-7 text-slate-300">
                Put your curiosity to the test. Take on interactive space-science
                missions, challenge your knowledge and earn XP as you explore.
              </p>
              <div className="mt-5 flex flex-wrap gap-3 text-xs font-semibold tracking-wider text-cyan-100">
                <span className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-4 py-2">PLAY WITHOUT LOGIN</span>
                <span className="rounded-full border border-blue-300/20 bg-blue-300/10 px-4 py-2">EARN EXPLORER XP</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4" data-scroll-stagger>
            {[
              {
                number: "01",
                title: "Astronomy",
                description: "Explore stars, planets, galaxies and the Solar System.",
                icon: "✦",
                color: "from-cyan-400/20 to-blue-500/5",
                accent: "text-cyan-200",
              },
              {
                number: "02",
                title: "Astrophysics",
                description: "Test your understanding of gravity, stars and spacetime.",
                icon: "◉",
                color: "from-violet-400/20 to-blue-500/5",
                accent: "text-violet-200",
              },
              {
                number: "03",
                title: "Space Exploration",
                description: "Take on questions about rockets and historic space missions.",
                icon: "🚀",
                color: "from-blue-400/20 to-cyan-500/5",
                accent: "text-blue-200",
              },
              {
                number: "04",
                title: "Cosmic Research",
                description: "Investigate exoplanets, dark matter and cosmic mysteries.",
                icon: "⌘",
                color: "from-fuchsia-400/20 to-violet-500/5",
                accent: "text-fuchsia-200",
              },
            ].map((mission) => (
              <a
                key={mission.number}
                href="/challenges"
                className={`group relative flex min-h-[270px] flex-col overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br ${mission.color} p-6 no-underline transition duration-300 hover:-translate-y-1 hover:border-cyan-300/40 hover:shadow-xl hover:shadow-cyan-950/30`}
                aria-label={`Explore ${mission.title} challenges`}
              >
                <div className="flex items-start justify-between">
                  <span className="text-xs font-bold tracking-[0.2em] text-slate-500">MISSION {mission.number}</span>
                  <span className={`text-3xl ${mission.accent}`} aria-hidden="true">{mission.icon}</span>
                </div>
                <div className="mt-auto">
                  <h3 className="text-xl font-bold text-white">{mission.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-slate-400">{mission.description}</p>
                  <span className="mt-6 inline-flex items-center gap-2 text-xs font-bold tracking-widest text-cyan-200">
                    ENTER MISSION <span className="transition-transform group-hover:translate-x-1">↗</span>
                  </span>
                </div>
              </a>
            ))}
          </div>

          <div className="mt-9 flex flex-col items-center justify-between gap-5 rounded-2xl border border-white/10 bg-white/[0.035] p-6 sm:flex-row sm:px-8">
            <div>
              <p className="text-lg font-semibold text-white">Your next discovery starts here.</p>
              <p className="mt-1 text-sm text-slate-400">Four missions. Instant play. No player account required.</p>
            </div>
            <a
              href="/challenges"
              className="inline-flex shrink-0 items-center justify-center gap-3 rounded-full border border-cyan-300/40 bg-cyan-300/10 px-6 py-3 text-sm font-bold text-cyan-100 no-underline transition hover:bg-cyan-300/20"
            >
              Explore All Challenges <span>↗</span>
            </a>
          </div>
        </div>
      </section>

      {/* Space Gallery */}
      <GalleryPreview />



      {/* Research & Publications */}
      <section data-scroll-reveal className="research-section section-padding" id="research">
        <div className="container">
          <div className="research-heading" data-scroll-reveal>
            <div>
              <span className="section-label">07 / THE COSMIC NOTEBOOK</span>
              <h2>Ideas beyond <span>our atmosphere.</span></h2>
            </div>
            <p>
              Explore accessible explainers on astronomy and space science,
              built from established research and trusted scientific sources.
            </p>
          </div>

          <a className="research-feature" href="/research/exoplanets-how-we-find-worlds">
            <div className="research-feature-art" data-scroll-reveal="zoom" aria-hidden="true">
              <span className="research-feature-orbit research-feature-orbit-one" />
              <span className="research-feature-orbit research-feature-orbit-two" />
              <span className="research-feature-planet" />
              <span className="research-feature-star">✦</span>
              <span className="research-art-caption">FIELD NOTES / 001</span>
            </div>
            <div className="research-feature-copy" data-scroll-reveal>
              <span className="research-kicker">FEATURED EXPLAINER · EXOPLANETS</span>
              <h3>How do we find worlds around distant stars?</h3>
              <p>
                A look at the clever observational techniques that let
                astronomers detect planets they cannot usually see directly.
              </p>
              <span className="research-read-link">READ THE EXPLAINER <span>↗</span></span>
            </div>
          </a>

          <div className="research-bottom" data-scroll-reveal>
            <div>
              <span className="research-kicker">EXPLORE THE LIBRARY</span>
              <h3>Curiosity, backed by evidence.</h3>
            </div>
            <p>
              Browse explainers by topic, discover the science behind cosmic
              phenomena and follow the original sources.
            </p>
            <a href="/research" className="button button-primary">
              Visit Research & Publications <span>↗</span>
            </a>
          </div>
        </div>
      </section>



      {/* Leadership */}
      <section data-scroll-reveal className="leadership-section section-padding" id="leadership">
        <div className="container">
          <div className="leadership-heading" data-scroll-reveal>
            <div>
              <span className="section-label">08 / THE PEOPLE BEHIND COSMOVATE</span>
              <h2>Meet our <span>leadership.</span></h2>
            </div>
            <p>Guided by curiosity. Driven by a shared vision to explore what lies beyond.</p>
          </div>

          <div className="leadership-grid" data-scroll-stagger>
            <article className="leader-card">
              <div className="leader-image-wrap">
                <Image
                  src="/ayushi-patil.jpg"
                  alt="Ayushi Patil, Founder of COSMOVATE"
                  width={1080}
                  height={1080}
                  className="leader-image"
                  sizes="(max-width: 700px) 100vw, 50vw"
                />
                <span className="leader-number">01</span>
              </div>
              <div className="leader-info">
                <span className="leader-role">FOUNDER</span>
                <h3>Ayushi Patil</h3>
                <p>Founder · COSMOVATE</p>
              </div>
            </article>

            <article className="leader-card">
              <div className="leader-image-wrap">
                <Image
                  src="/samruddhi-sawant.jpg"
                  alt="Samruddhi Sawant, Co-Founder of COSMOVATE"
                  width={1080}
                  height={1080}
                  className="leader-image"
                  sizes="(max-width: 700px) 100vw, 50vw"
                />
                <span className="leader-number">02</span>
              </div>
              <div className="leader-info">
                <span className="leader-role">CO-FOUNDER</span>
                <h3>Samruddhi Sawant</h3>
                <p>Co-Founder · COSMOVATE</p>
              </div>
            </article>
          </div>
        </div>
      </section>




      {/* Recruitment */}
      <section data-scroll-reveal className="join-section section-padding" id="join">
        <div className="join-background" />
        <div className="container join-content" data-scroll-reveal>
          <span className="section-label">09 / YOUR JOURNEY STARTS HERE</span>
          <h2>
            LOOK UP.
            <br />
            <span>THINK BEYOND.</span>
          </h2>
          <p>
            The universe is too vast to explore alone. Bring your curiosity,
            ideas and passion. There's a place for you at COSMOVATE.
          </p>
          <a
            href="/apply"
            className="button button-primary"
          >
            Become a part of COSMOVATE <span>↗</span>
          </a>
          <span className="join-note">
            YOUR CURIOSITY IS YOUR GREATEST ASSET.
          </span>
        </div>
      </section>

      {/* Footer */}
      <footer className="site-footer">
        <div className="container footer-main">
          <a href="#home" className="brand footer-brand">
            <Image
              src="/cosmovate-logo.png"
              alt="COSMOVATE logo"
              width={42}
              height={42}
            />
            <span>COSMOVATE</span>
          </a>

          <p>Exploring the universe. Inspiring discovery.</p>

          <SocialLinks className="footer-socials" />

          <a href="#home" className="back-top">
            BACK TO TOP ↑
          </a>
        </div>

        <div className="container footer-bottom">
          <span>© 2026 COSMOVATE. All rights reserved.</span>
          <span>MADE WITH CURIOSITY. ✦</span>
        </div>
      </footer>
    </main>
  );
}
