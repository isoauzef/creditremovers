import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Navigation } from "../components/Navigation";
import { Footer } from "../components/Footer";
import { ArrowRight } from "lucide-react";
import { useMediaSrc } from "../hooks/useMedia";

interface Article {
  id: number;
  slug: string;
  title: string;
  excerpt: string | null;
  content: string;
  coverImageUrl: string | null;
  author: string | null;
  publishedAt: string;
}

export default function NewsArticle() {
  const { slug } = useParams<{ slug: string }>();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const fallbackCover = useMediaSrc("newsArticleFallback");

  useEffect(() => {
    if (!slug) return;
    fetch(`/api/news/${slug}`)
      .then((r) => { if (!r.ok) throw new Error(); return r.json(); })
      .then((data) => setArticle(data))
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [slug]);

  // Render content as paragraphs (simple newline splitter — content is plain/markdown-light)
  const paragraphs = article?.content?.split(/\n\n+/).map((p) => p.trim()).filter(Boolean) ?? [];

  return (
    <div className="min-h-screen bg-[var(--color-paper)] text-[var(--color-ink)]">
      <Navigation />

      {loading ? (
        <div className="max-w-3xl mx-auto px-6 py-32 text-[var(--color-stone-600)]">Loading…</div>
      ) : notFound || !article ? (
        <div className="max-w-3xl mx-auto px-6 py-32 text-center">
          <h1 className="font-serif text-3xl mb-4">Article not found</h1>
          <Link to="/news" className="text-[var(--color-accent)]">Return to newsroom</Link>
        </div>
      ) : (
        <>
          <article className="max-w-3xl mx-auto px-6 md:px-10 pt-12 md:pt-20 pb-16">
            <div className="eyebrow mb-6">
              {new Date(article.publishedAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
              {article.author && <span className="ml-3 text-[var(--color-stone-600)] normal-case tracking-normal">· By {article.author}</span>}
            </div>
            <h1 className="font-serif text-[var(--color-ink)] mb-8">{article.title}</h1>

            {(article.coverImageUrl || fallbackCover) && (
              <div className="aspect-[16/9] bg-[var(--color-stone-200)] mb-12 overflow-hidden">
                <img src={article.coverImageUrl || fallbackCover} alt="" className="w-full h-full object-cover" />
              </div>
            )}

            <div className="prose-editorial">
              {paragraphs.map((p, i) => (
                <p key={i} className={`text-lg leading-[1.75] text-[var(--color-stone-800)] mb-6 ${i === 0 ? "drop-cap" : ""}`}>
                  {p}
                </p>
              ))}
            </div>
          </article>

          <section className="bg-[var(--color-stone-50)] border-t border-[var(--color-stone-200)]">
            <div className="max-w-4xl mx-auto px-6 md:px-10 py-16 md:py-20 grid grid-cols-1 md:grid-cols-2 gap-6">
              <Link
                to="/#lead-form"
                className="bg-[var(--color-paper)] border border-[var(--color-stone-200)] p-8 hover:border-[var(--color-ink)] transition-colors"
              >
                <div className="eyebrow mb-3">Discuss</div>
                <h3 className="font-serif text-xl mb-3">Free Consultation</h3>
                <p className="text-sm text-[var(--color-stone-700)] mb-5">
                  A senior analyst will review your file within one business day.
                </p>
                <span className="inline-flex items-center gap-2 text-sm text-[var(--color-accent)]">
                  Request consultation <ArrowRight size={14} />
                </span>
              </Link>
              <Link
                to="/checkout"
                className="bg-[var(--color-ink)] text-[var(--color-paper)] p-8 hover:bg-[var(--color-stone-900)] transition-colors"
              >
                <div className="eyebrow mb-3 text-[var(--color-gold)]">Begin</div>
                <h3 className="font-serif text-xl mb-3">Sign Up Now</h3>
                <p className="text-sm text-[var(--color-stone-300)] mb-5">
                  Become a client today. Onboarding takes about ten minutes.
                </p>
                <span className="inline-flex items-center gap-2 text-sm text-[var(--color-gold)]">
                  Start your application <ArrowRight size={14} />
                </span>
              </Link>
            </div>
          </section>
        </>
      )}

      <Footer />
    </div>
  );
}
