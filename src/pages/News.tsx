import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Navigation } from "../components/Navigation";
import { Footer } from "../components/Footer";
import { CrossNavCTA } from "../components/CrossNavCTA";
import { ArrowUpRight } from "lucide-react";
import { useMedia } from "../hooks/useMedia";

interface Article {
  id: number;
  slug: string;
  title: string;
  excerpt: string | null;
  coverImageUrl: string | null;
  author: string | null;
  publishedAt: string;
}

export default function News() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const media = useMedia();

  useEffect(() => {
    fetch("/api/news")
      .then((r) => r.json())
      .then((data) => { setArticles(Array.isArray(data) ? data : []); })
      .catch(() => setArticles([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-[var(--color-paper)] text-[var(--color-ink)]">
      <Navigation />

      <section className="border-b border-[var(--color-stone-200)] relative overflow-hidden">
        {media.newsHero && (
          <div className="absolute inset-0 opacity-25" aria-hidden>
            <img src={media.newsHero} alt="" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-paper)] via-[var(--color-paper)]/85 to-transparent" />
          </div>
        )}
        <div className="relative max-w-7xl mx-auto px-6 md:px-10 pt-16 md:pt-24 pb-16">
          <div className="eyebrow mb-4">Newsroom</div>
          <h1 className="text-[var(--color-ink)] max-w-3xl">
            Briefings, case notes & quiet observations.
          </h1>
          <p className="mt-6 max-w-2xl text-[var(--color-stone-700)] leading-relaxed">
            Plain-language writing from our analysts on dispute strategy, FCRA
            jurisprudence and the credit bureaus’ shifting positions.
          </p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 md:px-10 py-12 md:py-20">
        {loading ? (
          <div className="text-[var(--color-stone-600)]">Loading…</div>
        ) : articles.length === 0 ? (
          <div className="text-[var(--color-stone-600)] py-16 text-center">
            No articles published yet. Check back soon.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {articles.map((a) => (
              <Link
                key={a.id}
                to={`/news/${a.slug}`}
                className="group flex flex-col bg-[var(--color-paper)] border border-[var(--color-stone-200)] hover:border-[var(--color-ink)] transition-colors"
              >
                {a.coverImageUrl ? (
                  <div className="aspect-[16/10] bg-[var(--color-stone-200)] overflow-hidden">
                    <img src={a.coverImageUrl} alt="" className="w-full h-full object-cover" />
                  </div>
                ) : media.newsArticleFallback ? (
                  <div className="aspect-[16/10] overflow-hidden">
                    <img src={media.newsArticleFallback} alt="" className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="aspect-[16/10] bg-gradient-to-br from-[var(--color-stone-100)] to-[var(--color-stone-200)]" />
                )}
                <div className="p-6 md:p-8 flex flex-col flex-1">
                  <div className="text-xs uppercase tracking-[0.18em] text-[var(--color-stone-600)] mb-3">
                    {new Date(a.publishedAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                  </div>
                  <h2 className="text-xl md:text-2xl text-[var(--color-ink)] mb-3">{a.title}</h2>
                  {a.excerpt && (
                    <p className="text-sm text-[var(--color-stone-700)] leading-relaxed mb-6 line-clamp-3">{a.excerpt}</p>
                  )}
                  <div className="mt-auto inline-flex items-center gap-2 text-sm text-[var(--color-accent)] group-hover:gap-3 transition-all">
                    Read briefing <ArrowUpRight size={16} />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      <CrossNavCTA />
      <Footer />
    </div>
  );
}
