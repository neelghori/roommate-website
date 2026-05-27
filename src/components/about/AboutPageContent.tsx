import Link from 'next/link';
import { SUPPORT_EMAIL } from '@/lib/seo/site';

export function AboutPageContent() {
  return (
    <div className="about-page">
      <header className="about-hero" role="banner">
        <div className="about-hero-text relative z-[1]">
          <div className="about-hero-eyebrow">About Roommat</div>
          <h1 className="about-serif">
            We make finding <em>home</em> feel simple
          </h1>
          <p className="about-hero-desc">
            Roommat is Ahmedabad&apos;s most trusted platform for verified PG rooms, shared flats, and
            studio apartments. No brokerage surprises. No fake listings. Just honest spaces for real
            people.
          </p>
          <div className="about-hero-actions">
            <Link href="/explore" className="about-btn-primary">
              Browse Listings
            </Link>
            <a href={`mailto:${SUPPORT_EMAIL}`} className="about-btn-outline">
              Get in Touch
            </a>
          </div>
        </div>

        <div className="about-hero-visual relative z-[1]" aria-hidden="true">
          <div className="about-hero-card-stack">
            <div className="about-hcard about-hcard-back" />
            <div className="about-hcard about-hcard-main">
              <div className="about-badge">Verified</div>
              <h3 className="about-serif">Satellite, Ahmedabad</h3>
              <p>2BHK Shared Flat · ₹9,500/month</p>
            </div>
            <div className="about-floating-stat about-stat-1">
              <span className="num about-serif">500+</span>
              <span className="lbl">Verified Rooms</span>
            </div>
            <div className="about-floating-stat about-stat-2">
              <span className="num about-serif">4.8★</span>
              <span className="lbl">Avg. Rating</span>
            </div>
          </div>
        </div>
      </header>

      <section className="about-stats-bar" aria-label="Roommat by the numbers">
        <div className="about-stat-item">
          <span className="number about-serif">500+</span>
          <span className="label">Verified Listings</span>
        </div>
        <div className="about-stat-item">
          <span className="number about-serif">2,000+</span>
          <span className="label">Happy Tenants</span>
        </div>
        <div className="about-stat-item">
          <span className="number about-serif">15+</span>
          <span className="label">Neighbourhoods</span>
        </div>
        <div className="about-stat-item">
          <span className="number about-serif">0</span>
          <span className="label">Hidden Brokerage</span>
        </div>
      </section>

      <section className="about-section about-story" aria-labelledby="story-heading">
        <div className="about-story-grid">
          <div className="about-story-text">
            <p className="about-section-tag">Our Story</p>
            <h2 id="story-heading" className="about-serif">
              Born from a <em>real problem</em>
            </h2>
            <p>
              It started with a frustrating search. One of our founders moved to Ahmedabad for work and
              spent three weeks scrolling through outdated listings, dealing with brokers who demanded
              months of commission, and visiting flats that looked nothing like the photos.
            </p>
            <p>
              <strong>There had to be a better way.</strong> So we built one. Roommat launched with a
              simple promise — every listing would be personally verified, every owner would be vetted by
              our team, and every tenant would be treated with respect.
            </p>
            <p>
              Today, we serve students, working professionals, and families across Ahmedabad and
              Gandhinagar. We&apos;re a small, passionate team that believes{' '}
              <strong>finding a good room shouldn&apos;t be a full-time job.</strong>
            </p>
          </div>
          <div className="about-story-visual">
            <blockquote className="about-quote-block about-serif">
              &ldquo;Finding a home is the first step to building a life. We want that step to feel
              safe, not stressful.&rdquo;
            </blockquote>
            <p className="about-quote-author">— Roommat Founding Team, Ahmedabad</p>
          </div>
        </div>
      </section>

      <section className="about-section about-vision" aria-labelledby="vision-heading">
        <div className="about-vision-inner">
          <p className="about-section-tag">Our Vision</p>
          <h2 id="vision-heading" className="about-serif">
            A city where everyone finds <em style={{ color: '#c8973a' }}>their place</em>
          </h2>
          <p className="about-section-sub">
            We envision a Gujarat where no student sleeps in a substandard PG for lack of options, and no
            working professional wastes months on a house search. Transparent. Accessible. Human.
          </p>
        </div>
        <div className="about-vision-grid">
          <div className="about-vision-card">
            <div className="about-vision-icon">🔍</div>
            <h3 className="about-serif">Radical Transparency</h3>
            <p>What you see is what you get — real photos, real prices, real availability. No bait-and-switch, ever.</p>
          </div>
          <div className="about-vision-card">
            <div className="about-vision-icon">🛡️</div>
            <h3 className="about-serif">Verified, Not Just Listed</h3>
            <p>
              Before any listing goes live, our team personally meets the property owner — so you know
              the person behind the door is trustworthy.
            </p>
          </div>
          <div className="about-vision-card">
            <div className="about-vision-icon">🤝</div>
            <h3 className="about-serif">Zero Brokerage Model</h3>
            <p>We believe tenants shouldn&apos;t pay middleman fees. Our direct model connects you straight to property owners.</p>
          </div>
          <div className="about-vision-card">
            <div className="about-vision-icon">🏙️</div>
            <h3 className="about-serif">Built for Ahmedabad</h3>
            <p>
              Deep local knowledge of every neighbourhood — from Bodakdev to Gandhinagar — so you find
              the right fit for your life.
            </p>
          </div>
          <div className="about-vision-card">
            <div className="about-vision-icon">📱</div>
            <h3 className="about-serif">Technology That Helps</h3>
            <p>
              Simple, fast, mobile-first search. Compare rent, photos, amenities, and distance from your
              office or college in seconds.
            </p>
          </div>
          <div className="about-vision-card">
            <div className="about-vision-icon">💬</div>
            <h3 className="about-serif">Always Human Support</h3>
            <p>
              Stuck? Have a question? A real person from our Ahmedabad team picks up the phone — in
              English, Hindi, or Gujarati.
            </p>
          </div>
        </div>
      </section>

      <section className="about-section about-values" aria-labelledby="values-heading">
        <div className="about-values-inner">
          <p className="about-section-tag">What We Stand For</p>
          <h2 id="values-heading" className="about-serif">
            Our core <em>values</em>
          </h2>
          <div className="about-values-grid">
            <div className="about-value-item">
              <div className="about-value-dot">✔️</div>
              <div>
                <h3 className="about-serif">Honesty First</h3>
                <p>
                  We never post a listing we haven&apos;t verified. If a flat isn&apos;t available, it
                  comes down immediately — no ghost listings.
                </p>
              </div>
            </div>
            <div className="about-value-item">
              <div className="about-value-dot">🌱</div>
              <div>
                <h3 className="about-serif">Tenant Empowerment</h3>
                <p>
                  We give tenants the information and tools to make confident decisions — without
                  needing to rely on a broker.
                </p>
              </div>
            </div>
            <div className="about-value-item">
              <div className="about-value-dot">🏠</div>
              <div>
                <h3 className="about-serif">Owner Respect</h3>
                <p>
                  We work closely with property owners, helping them find responsible tenants and manage
                  their listings professionally.
                </p>
              </div>
            </div>
            <div className="about-value-item">
              <div className="about-value-dot">🚀</div>
              <div>
                <h3 className="about-serif">Continuous Improvement</h3>
                <p>
                  Every piece of feedback makes Roommat better. We&apos;re a team that listens, learns,
                  and ships improvements fast.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="about-section about-why" aria-labelledby="why-heading">
        <div className="about-why-inner">
          <div className="about-why-grid">
            <div>
              <p className="about-section-tag">Why Choose Roommat</p>
              <h2 id="why-heading" className="about-serif">
                Not just another <em>listing site</em>
              </h2>
              <p className="about-section-sub">
                We&apos;re on the ground in Ahmedabad — checking, photographing, and curating every
                single room.
              </p>
              <ul className="about-why-list" aria-label="Roommat advantages">
                <li>
                  <div className="about-check">✓</div>
                  <div>
                    <strong>Verified Owners</strong>
                    <span>
                      We don&apos;t just verify the property — our team meets every owner face-to-face
                      before listing. Your safety starts with who owns the space.
                    </span>
                  </div>
                </li>
                <li>
                  <div className="about-check">✓</div>
                  <div>
                    <strong>Transparent Pricing</strong>
                    <span>
                      Rent, deposit, and maintenance charges are all listed upfront. No surprises on
                      move-in day.
                    </span>
                  </div>
                </li>
                <li>
                  <div className="about-check">✓</div>
                  <div>
                    <strong>Instant Availability</strong>
                    <span>Listings update in real-time. If it&apos;s on the site, it&apos;s available right now.</span>
                  </div>
                </li>
                <li>
                  <div className="about-check">✓</div>
                  <div>
                    <strong>Local Area Expertise</strong>
                    <span>
                      We cover Satellite, Bodakdev, Navrangpura, Thaltej, Gurukul, and all of
                      Gandhinagar.
                    </span>
                  </div>
                </li>
              </ul>
            </div>
            <div className="about-why-visual">
              <h3 className="about-serif">Serving Ahmedabad & Gandhinagar</h3>
              <p>
                From student PGs near universities to premium flats for working professionals — Roommat
                covers every kind of room, in every major neighbourhood.
              </p>
              <div className="about-why-badge">
                🎓 <span>Near PDEU, Nirma, CEPT</span> University zones
              </div>
              <div className="about-why-badge">
                💼 <span>IT Hubs</span> Bodakdev · Satellite · SG Highway
              </div>
              <div className="about-why-badge">
                🏛️ <span>Gandhinagar</span> Sector-wise listings available
              </div>
              <div className="about-why-badge">
                🌙 <span>Girls PG</span> Safe, verified, women-only options
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="about-section about-cta" aria-labelledby="cta-heading">
        <p className="about-section-tag">Ready to Find Your Space?</p>
        <h2 id="cta-heading" className="about-serif">
          Your next home is one <em>search away</em>
        </h2>
        <p>
          Browse hundreds of verified PG rooms and shared flats in Ahmedabad. Filter by location,
          budget, and amenities — and find your perfect match today.
        </p>
        <div className="about-cta-actions">
          <Link href="/explore" className="about-btn-primary">
            Browse All Listings
          </Link>
          <a href={`mailto:${SUPPORT_EMAIL}`} className="about-btn-outline">
            Talk to Our Team
          </a>
        </div>
      </section>
    </div>
  );
}
