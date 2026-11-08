import Link from "next/link";

const domainContent: Record<string, { number: string; title: string; intro: string; topics: string[]; question: string }> = {
  astronomy: {
    number: "01",
    title: "Astronomy",
    intro: "Observe the universe and explore the objects that fill it — from our Solar System to distant galaxies.",
    topics: ["Stars and stellar evolution", "Galaxies and nebulae", "Planets, moons and exoplanets", "Observational astronomy"],
    question: "What can the light reaching Earth tell us about objects millions of light-years away?",
  },
  astrophysics: {
    number: "02",
    title: "Astrophysics",
    intro: "Use the laws of physics to understand how the universe works, evolves and behaves on its grandest scales.",
    topics: ["Gravity and orbital mechanics", "Black holes and neutron stars", "Cosmology and the early universe", "Radiation and high-energy phenomena"],
    question: "How do physics and mathematics help us explain the most extreme objects in the cosmos?",
  },
  "space-exploration": {
    number: "03",
    title: "Space Exploration",
    intro: "Follow humanity's journey beyond Earth through spacecraft, planetary missions and the technologies that make exploration possible.",
    topics: ["Robotic and crewed missions", "Planetary science", "Rockets and spacecraft systems", "Habitability and future exploration"],
    question: "What will it take for humans to explore and live beyond our home planet?",
  },
  "cosmic-research": {
    number: "04",
    title: "Cosmic Research",
    intro: "Investigate open questions, examine evidence and communicate discoveries that push our understanding of the cosmos forward.",
    topics: ["Reading and discussing scientific papers", "Exoplanet and cosmic data", "Research methods and scientific writing", "Emerging discoveries and open questions"],
    question: "Which unanswered question about the universe would you most like to investigate?",
  },
};

export function generateStaticParams() {
  return Object.keys(domainContent).map((slug) => ({ slug }));
}

export default async function DomainPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const domain = domainContent[slug];
  if (!domain) {
    return (
      <main className="domain-detail-page">
        <div className="container domain-detail-content">
          <span className="section-label">COSMOVATE / EXPLORE</span>
          <h1>Unknown territory.</h1>
          <p>That domain could not be found.</p>
          <Link className="button button-primary" href="/#explore">Back to Explore ↗</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="domain-detail-page">
      <div className="domain-detail-stars" aria-hidden="true" />
      <div className="container domain-detail-content">
        <Link href="/#explore" className="domain-back-link">← ALL DOMAINS</Link>
        <span className="section-label">{domain.number} / COSMOVATE DOMAIN</span>
        <div className="domain-detail-orb" aria-hidden="true"><span>✦</span></div>
        <h1>{domain.title}<span>.</span></h1>
        <p className="domain-detail-intro">{domain.intro}</p>
        <section className="domain-detail-topics">
          <span className="section-label">A FEW FRONTIERS TO EXPLORE</span>
          <div className="domain-topic-grid">
            {domain.topics.map((topic, index) => (
              <article className="domain-topic" key={topic}>
                <span>0{index + 1}</span>
                <h2>{topic}</h2>
              </article>
            ))}
          </div>
        </section>
        <blockquote className="domain-question">“{domain.question}”</blockquote>
        <Link className="button button-primary" href="/#join">Join the COSMOVATE community ↗</Link>
      </div>
    </main>
  );
}
