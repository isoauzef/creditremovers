import { Lock, KeyRound, Server } from "lucide-react";
import { useMediaSrc, type MediaKey } from "../hooks/useMedia";

export function SecurityBanner({ mediaKey = "homeSecurity" }: { mediaKey?: MediaKey } = {}) {
  const img = useMediaSrc(mediaKey);
  return (
    <section className="bg-[var(--color-ink)] text-[var(--color-paper)]">
      <div className="max-w-7xl mx-auto px-6 md:px-10 py-8 md:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
          {img && (
            <div className="lg:col-span-4">
              <div className="aspect-[4/5] overflow-hidden rounded-md">
                <img src={img} alt="" className="w-full h-full object-cover" loading="lazy" decoding="async" />
              </div>
            </div>
          )}
          <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-12">
            <Item
              icon={<KeyRound size={20} className="text-[var(--color-gold)]" />}
              title="AWS KMS envelope encryption"
              body="Every Social Security number is encrypted with a unique data key wrapped by AWS Key Management Service — the same standard banks use to protect their own ledgers."
            />
            <Item
              icon={<Server size={20} className="text-[var(--color-gold)]" />}
              title="SSE-KMS secured uploads"
              body="ID documents and utility bills are stored in AWS S3 with server-side encryption. Files are never accessible by URL — only short-lived, authenticated links."
            />
            <Item
              icon={<Lock size={20} className="text-[var(--color-gold)]" />}
              title="Minimal access, full audit trail"
              body="Every decryption or document download is logged with the staff member, timestamp and IP. We hold ourselves to a standard you can verify."
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function Item({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        {icon}
        <span className="text-xs uppercase tracking-[0.2em] text-[var(--color-gold)]">Security</span>
      </div>
      <h3 className="font-serif text-xl mb-3">{title}</h3>
      <p className="text-sm leading-relaxed text-[var(--color-stone-300)]">{body}</p>
    </div>
  );
}

export default SecurityBanner;
