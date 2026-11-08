import Link from "next/link";
import { notFound } from "next/navigation";

type ArticleContent = {
  category: string;
  title: string;
  intro: string;
  sections: { heading: string; paragraphs: string[] }[];
  sourceTitle: string;
  sourceUrl: string;
  sourceNote: string;
};

const articleContent: Record<string, ArticleContent> = {
  "exoplanets-how-we-find-worlds": {
    category: "EXOPLANETS / EXPLAINER 001",
    title: "How do we find worlds around distant stars?",
    intro:
      "A planet orbiting another star is called an exoplanet. These worlds are extraordinarily difficult to observe directly, so astronomers often look for the subtle ways a planet changes the light or motion of its host star.",
    sections: [
      {
        heading: "The transit method",
        paragraphs: [
          "When a planet passes in front of its star from our point of view, it blocks a tiny fraction of the star’s light. Sensitive instruments can measure this small, repeating dip in brightness. The pattern can reveal a planet’s orbital period and help estimate its size.",
          "A transit is easiest to detect when the planet’s orbit is aligned so that it crosses the star as seen from Earth. This means the method cannot reveal every planet in every system.",
        ],
      },
      {
        heading: "The radial-velocity method",
        paragraphs: [
          "A planet’s gravity also tugs on its star. The star moves in a small orbit of its own, causing its light to shift slightly as it moves toward or away from us. Astronomers measure these changes in the star’s spectrum.",
          "Combining radial-velocity measurements with transit observations can provide more information about a planet, including an estimate of its mass and density.",
        ],
      },
      {
        heading: "Why the methods matter",
        paragraphs: [
          "Each technique reveals a different part of the picture. Transit observations are especially useful for measuring a planet’s size, while radial velocity can help estimate its mass. Together, they help researchers compare distant worlds with the planets in our own Solar System.",
          "These methods are part of a much wider toolkit used to discover and study planets beyond the Sun.",
        ],
      },
    ],
    sourceTitle: "NASA — In Depth: Exoplanets",
    sourceUrl: "https://science.nasa.gov/exoplanets/facts/",
    sourceNote:
      "This educational explainer is a paraphrased introduction based on NASA’s public exoplanet science material. It is not original research.",
  },
  "black-holes-how-we-detect-the-invisible": {
    category: "ASTROPHYSICS / EXPLAINER 002",
    title: "Black holes: how do we detect the invisible?",
    intro:
      "A black hole does not let light escape from within its event horizon. So how can astronomers study something that does not shine like a star? The answer is to observe what happens around it.",
    sections: [
      {
        heading: "Watching matter heat up",
        paragraphs: [
          "Gas and dust can gather in a fast-moving structure around a black hole called an accretion disk. As material in this environment heats up, it can emit radiation that telescopes detect across different wavelengths.",
          "The radiation comes from the surrounding material, not from inside the event horizon.",
        ],
      },
      {
        heading: "Following the motion of stars",
        paragraphs: [
          "A star orbiting an unseen massive object can reveal that something compact and massive is present. By carefully measuring the star’s motion, astronomers can estimate the mass of the object influencing it.",
          "This approach has helped researchers investigate the supermassive black hole at the centre of the Milky Way.",
        ],
      },
      {
        heading: "Gravity can reveal the unseen",
        paragraphs: [
          "A black hole’s gravity can bend the path of light from more distant objects. This effect, known as gravitational lensing, can provide clues about otherwise difficult-to-see objects.",
          "Gravitational waves from merging black holes offer another way to study these systems, by measuring tiny ripples in spacetime.",
        ],
      },
    ],
    sourceTitle: "NASA — Black Holes",
    sourceUrl: "https://science.nasa.gov/universe/black-holes/",
    sourceNote:
      "This educational explainer is a paraphrased introduction based on NASA’s public black-hole science material. It is not original research.",
  },
};

export function generateStaticParams() {
  return Object.keys(articleContent).map((slug) => ({ slug }));
}

export default async function ResearchArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = articleContent[slug];

  if (!article) notFound();

  return (
    <main className="research-article-page">
      <div className="research-page-stars" aria-hidden="true" />
      <article className="container research-article-content">
        <Link href="/research" className="research-back-link">
          ← ALL EXPLAINERS
        </Link>
        <span className="section-label">{article.category}</span>
        <h1>{article.title}</h1>
        <p className="research-article-lead">{article.intro}</p>
        <div className="research-article-rule">
          <span>THE COSMOVATE NOTEBOOK</span>
          <span>EDUCATIONAL EXPLAINER</span>
        </div>

        <div className="research-article-body">
          {article.sections.map((section) => (
            <section key={section.heading}>
              <h2>{section.heading}</h2>
              {section.paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </section>
          ))}
        </div>

        <aside className="research-source">
          <span className="research-kicker">SOURCE & EDITORIAL NOTE</span>
          <h2>{article.sourceTitle}</h2>
          <p>{article.sourceNote}</p>
          <a href={article.sourceUrl} target="_blank" rel="noreferrer">
            Visit original scientific source ↗
          </a>
        </aside>
        <Link href="/research" className="button button-secondary research-return">
          Back to the library
        </Link>
      </article>
    </main>
  );
}
