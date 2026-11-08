# Deployment, hosting, and graceful degradation

Once your tutorial is shipped, where does it live and how does it survive in the wild?

## Hosting options

Single-file HTML tutorials work well on:

| Host | Cost | Pros | Cons |
|---|---|---|---|
| **GitHub Pages** | Free | Versioned with code; easy URL (<user>.github.io/<repo>); no signup overhead | Public-only on free tier; build delay; no edge CDN |
| **Netlify / Vercel** | Free tier | Drag-and-drop deploys; instant edge CDN; automatic HTTPS | Branded subdomain on free tier; bandwidth caps |
| **S3 + CloudFront** | ~$1-5/mo | Custom domain; strong CDN; analytics integration | More setup; AWS account required |
| **Cloudflare Pages** | Free | Edge CDN; one-click custom domain; pull from Git | Newer (some integrations less mature) |
| **Self-hosted (your own webserver)** | Whatever | Total control | Maintenance burden; backups; uptime is on you |

**Recommendation for first-time deployment:** GitHub Pages or Netlify. Both can serve a single HTML file with one command. Move to S3/CloudFront only when traffic or analytics needs justify the setup cost.

### GitHub Pages quickstart

```bash
git init
git add tutorial.html
git commit -m "Initial tutorial"
git remote add origin https://github.com/USER/REPO.git
git push -u origin main
# Then enable Pages in repo settings → Pages → source: main branch / root
```

Your tutorial lives at `https://USER.github.io/REPO/tutorial.html` within ~30 seconds.

### Netlify quickstart

```bash
# Drag tutorial.html onto netlify.com/drop — no signup needed.
# Or: install netlify-cli, then:
netlify deploy --prod --dir=. --site=my-tutorial
```

URL: `https://my-tutorial.netlify.app/tutorial.html`.

---

## URL strategy

If your tutorial is the main artifact of a project:

- **Hide the `.html` suffix**: configure your host to serve `tutorial.html` at `/tutorial` or `/recipe`. Cleaner URL, doesn't reveal the file structure.
- **Use a meaningful subpath**: `/recipe/2b-instruct/` is more memorable than `/tutorial.html`.
- **Set up redirects** from common alternatives: `/recipe` → `/recipe/2b-instruct/`.

For Netlify, add a `_redirects` file:

```
/recipe  /recipe/2b-instruct/  301
/recipe/2b-instruct  /recipe/2b-instruct/  301
```

---

## Graceful degradation — what to test

The tutorial should work even when things go wrong on the reader's end:

### MathJax CDN fails to load

**Test**: open the tutorial with browser DevTools → Network tab → block `cdn.jsdelivr.net`.

**Expected behavior**: formulas appear as raw TeX (`\[ L = -\log P \]`). Acceptable degradation — the reader can still read the math.

**Improvement**: add a `<noscript>` fallback explaining that JavaScript is required for full functionality.

### JavaScript disabled

**Test**: open with browser settings → JavaScript disabled.

**Expected behavior**:
- Formulas: raw TeX visible (no MathJax)
- Animations: SMIL keeps running (SVG <animate> works without JS); CSS @keyframes also run
- Widgets: broken (no interactivity)
- Theme toggle: doesn't work (no JS)
- Reading progress bar: stuck at 0%

**Improvement**: include a banner: `<noscript>Some interactive features require JavaScript.</noscript>` at the top of `<body>`. The static content remains fully readable.

### Slow connection (3G or worse)

**Test**: browser DevTools → Network throttling → 3G.

**Expected behavior**: page renders incrementally; MathJax loads last (it's the largest external resource).

**Improvement**:
- Inline critical CSS at the top of `<head>` so first paint is fast.
- Lazy-load MathJax with `async` (already done in boilerplate.html).
- Consider a "lite version" that omits animations for users on slow connections (rarely worth it for technical tutorials).

### Browser doesn't support modern CSS (old IE, old Safari)

**Test**: BrowserStack on Safari ≤14, Edge ≤17, Firefox ≤60.

**Expected behavior**: layout works (CSS Grid and Flexbox are widely supported now); colors work; animations may not work (CSS variables in SVG are buggy on old Safari).

**Improvement**: don't bother. Old browsers <2% of traffic for technical content; not worth the effort. State the supported browser range in the README.

### High-contrast / forced colors mode

**Test**: Windows → Settings → High Contrast → On.

**Expected behavior**: most styling is overridden by the OS; layout should still be navigable.

**Improvement**: test with `@media (forced-colors: active)` and add overrides if specific things break.

---

## Analytics — should you?

For a free, public-facing tutorial:

**The pro case for analytics**:
- See which sections readers spend time on / drop at.
- Identify if the intro is doing its job (high bounce rate = no).
- Validate the audience matches your assumptions (referrers, search terms).

**The pro case against**:
- Privacy: most analytics scripts (Google Analytics, Plausible, etc.) load remote JS, track readers, and may share data.
- Performance: another script to load.
- Complexity: another thing to maintain.

**Pragmatic middle ground**: use **simple, privacy-respecting analytics** like:
- **Plausible** (self-hostable; cookieless; ~10 KB script)
- **Cloudflare Web Analytics** (built into Cloudflare Pages; no JS needed)
- **Server-side log analysis** (just read your access logs; no client-side tracking at all)

Don't use Google Analytics for a technical tutorial. The reader trust cost > the analytics value.

If you do add analytics, ALWAYS:
1. Disclose in the footer ("This site uses Plausible Analytics; no cookies, no personal data").
2. Honor `Do Not Track` browser preference.
3. Don't collect IP addresses.

---

## Reader-feedback collection

Once readers find the tutorial, they'll want to:
- Report typos / corrections
- Ask clarifying questions
- Suggest additions
- Cite the work

Provide ONE clear channel for each:

```html
<footer>
  <p>Bugs or corrections: <a href="https://github.com/USER/REPO/issues">open an issue</a></p>
  <p>Questions: <a href="mailto:CONTACT">CONTACT</a></p>
  <p>Citations: <a href="#citation">see Appendix F</a></p>
</footer>
```

A GitHub issue tracker is usually enough. Don't set up a Discord, forum, or mailing list unless you commit to monitoring it — the silence of a dead channel is worse than no channel.

---

## Versioning

If your tutorial is part of an evolving project:

**Option A: Semantic versioning** (v1.0, v1.1, ...). Track major changes in a CHANGELOG.

**Option B: Date-stamped revisions** ("Last updated: 2026-06-04"). Simpler; works for tutorials that aren't broken into discrete "releases".

**Option C: No versioning** — the tutorial reflects current state. Acceptable for living documents.

**Whatever you choose**: timestamp the version visibly in the footer or hero. Readers need to know if they're looking at the latest.

---

## Long-term maintenance

A tutorial 1 year from now will have rotted in 3 ways:

1. **Broken external links** — papers move, repos get archived, datasets disappear.
   *Mitigation*: link to Web Archive snapshots for important external resources.

2. **Stale code examples** — language versions change, library APIs shift.
   *Mitigation*: pin versions in code blocks (`python 3.12`, `torch 2.10`). State the pinning context.

3. **Drifting recipe accuracy** — your actual best practice has evolved since you wrote the tutorial.
   *Mitigation*: add a "this tutorial reflects practice as of YYYY-MM" disclaimer. Don't claim eternal accuracy.

Set a calendar reminder to revisit the tutorial in 12 months. Either update it or add a deprecation notice.

---

## Citing your tutorial

If readers want to cite your tutorial as a reference, provide a BibTeX block in the appendix:

```
@misc{authorYEARtitle,
  title  = {[Tutorial Title]},
  author = {[Author Name]},
  year   = {YEAR},
  url    = {[STABLE URL]},
  note   = {Tutorial; accessed YYYY-MM-DD}
}
```

This makes your tutorial first-class research-citable infrastructure.
