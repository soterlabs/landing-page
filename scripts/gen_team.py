#!/usr/bin/env python3
"""Single source of truth for the Soter Labs team.

Edit TEAM below, then run:  python3 scripts/gen_team.py
Regenerates every team/<slug>.html page and rewrites the orbit markup and
modal data inside about.html (between the TEAM-ORBIT / TEAM-DATA markers).
"""
import json, os, re

os.chdir(os.path.join(os.path.dirname(__file__), '..'))

# ── Role copy: mandate + Operates/Builds/Directs drafts per role ──
ROLE_COPY = {
  'Team Lead': dict(
    mandate='Leads Soter Labs &mdash; accountable for every engagement we ship, end to end.',
    operates='Client engagements and the operating cadence across every active mandate.',
    builds='The playbooks, standards, and tooling the team runs on.',
    directs='Where Soter Labs goes next &mdash; scope, standards, and strategy.'),
  'Technical PM': dict(
    mandate='Turns mandates into plans &mdash; scope, timelines, and delivery across engagements.',
    operates='Delivery across engagements: scope, timelines, and dependencies.',
    builds='Project structure &mdash; trackers, registries, and status routines.',
    directs='Prioritization calls and the definition of done.'),
  'Sky SME': dict(
    mandate='Subject-matter expert on the Sky Ecosystem &mdash; governance mechanics, Atlas, and protocol context.',
    operates='Governance context for live cycles: Atlas, spells, and protocol mechanics.',
    builds='Reference material and self-service knowledge for the team and clients.',
    directs='Technical positions on Sky Ecosystem questions.'),
  'OEA Dev': dict(
    mandate='Builds and reviews the on-chain side &mdash; spells, deployments, and tooling for executor agents.',
    operates='Spell development, review, and deployment coordination for executor agents.',
    builds='On-chain tooling, checks, and automation around the deployment pipeline.',
    directs='Implementation approach for on-chain changes.'),
  'Project Manager': dict(
    mandate='Keeps cycles on cadence &mdash; coordination, status, and expectations across every workstream.',
    operates='Cycle coordination: schedules, status, and follow-through across workstreams.',
    builds='The routines and templates that keep coordination cheap.',
    directs='Cadence and expectations across projects.'),
  'Exec Ops': dict(
    mandate='Executive operations &mdash; the connective tissue between clients, team, and commitments.',
    operates='Client relationships, commitments, and escalations.',
    builds='The bridges between clients, team, and partners.',
    directs='How engagements are structured and where attention goes.'),
  'Operations Specialist': dict(
    mandate='Runs day-to-day operations &mdash; monitoring, comms, and the routines that keep cycles moving.',
    operates='Day-to-day operations: monitoring, comms, and cycle routines.',
    builds='Process documentation and the checklists behind reliable delivery.',
    directs='Improvements to the routines they run.'),
  'Contributor': dict(
    mandate='Contributor &mdash; role being defined.',
    operates='TBD.',
    builds='TBD.',
    directs='TBD.'),
}

# ── The roster.  ring: 'outer' | 'inner'.  Angles assigned evenly per ring. ──
TEAM = [
  dict(slug='retro',         name='Retro',         role='Team Lead',             ring='outer', email='hello@soterlabs.com'),
  dict(slug='louis',         name='Louis',         role='Technical PM',          ring='outer'),
  dict(slug='banxy',         name='Banxy',         role='Sky SME',               ring='outer'),
  dict(slug='jamilya',       name='Jamilya',       role='Project Manager',       ring='outer'),
  dict(slug='wolf',          name='Wolf',          role='Exec Ops',              ring='outer'),
  dict(slug='erwe',          name='Erwe',          role='Operations Specialist', ring='outer'),
  dict(slug='ketcher',       name='Ketcher',       role='Sky SME',               ring='outer'),
  dict(slug='lakonema2000',  name='lakonema2000',  role='OEA Dev',               ring='inner'),
  dict(slug='filip',         name='Filip',         role='OEA Dev',               ring='inner'),
  dict(slug='adam',          name='Adam',          role='Contributor',           ring='inner'),
  dict(slug='lex',           name='Lex',           role='Contributor',           ring='inner'),
  dict(slug='kohla',         name='Kohla',         role='Contributor',           ring='inner'),
  dict(slug='nofreekoolaid', name='NoFreeKoolaid', role='Contributor',           ring='inner'),
]

for p in TEAM:
    p.setdefault('initial', p['name'][0].upper())
    p.setdefault('bio', ['Bio coming soon.'])
    for k, v in ROLE_COPY[p['role']].items():
        p.setdefault(k, v)

# assign angles evenly per ring
for ring, start in (('outer', 270), ('inner', 330)):
    members = [p for p in TEAM if p['ring'] == ring]
    step = 360 / len(members)
    for i, p in enumerate(members):
        p['angle'] = round((start + i * step) % 360, 1)

# ── Page chrome ──
NAV = '''  <!-- Nav -->
  <nav class="nav">
    <div class="nav__inner">
      <a href="/" class="nav__wordmark"><img src="/assets/images/logo_wo_name_transparent.png" alt="Soter Labs logo">Soter <span>Labs</span></a>
      <button class="nav__mobile-toggle" aria-label="Toggle navigation" aria-expanded="false" aria-controls="nav-links">
        <span></span>
        <span></span>
        <span></span>
      </button>
      <ul class="nav__links" id="nav-links">
        <li><a href="/about" class="nav__link nav__link--active">About</a></li>
        <li><a href="/values" class="nav__link">Values</a></li>
        <li><a href="/services" class="nav__link">Services</a></li>
        <li><a href="/clients" class="nav__link">Clients</a></li>
        <li><a href="https://settle.soterlabs.com" target="_blank" rel="noopener" class="nav__link nav__link--ext">Console<sup>&nearr;</sup></a></li>
        <li>
          <button class="theme-toggle" type="button" aria-label="Toggle color theme" title="Toggle color theme">
            <svg class="theme-toggle__moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
            <svg class="theme-toggle__sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>
          </button>
        </li>
        <li><a href="/contact" class="nav__cta">Get in touch &rarr;</a></li>
      </ul>
    </div>
  </nav>
'''

FOOTER = '''  <!-- Footer -->
  <footer class="footer">
    <div class="footer__grid">
      <div class="footer__brand">
        <a href="/" class="nav__wordmark"><img src="/assets/images/logo_wo_name_transparent.png" alt="Soter Labs logo">Soter <span>Labs</span></a>
        <p class="footer__tag">Trusted GovOps provider for the Sky Ecosystem. We make complex operations simple and opaque processes transparent.</p>
        <p class="footer__copy">&copy; <span id="footer-year">2026</span> Soter Labs. All rights reserved.</p>
      </div>
      <nav class="footer__col footer__col--split" aria-label="Site">
        <p class="footer__heading">Site</p>
        <a href="/" class="footer__navlink">Home</a>
        <a href="/about" class="footer__navlink">About</a>
        <a href="/values" class="footer__navlink">Values</a>
        <a href="/services" class="footer__navlink">Services</a>
        <a href="/clients" class="footer__navlink">Clients</a>
        <a href="/contact" class="footer__navlink">Contact</a>
      </nav>
      <div class="footer__col">
        <p class="footer__heading">Products</p>
        <a href="https://settle.soterlabs.com" target="_blank" rel="noopener" class="footer__navlink">Soter Console &nearr;</a>
      </div>
      <div class="footer__col">
        <p class="footer__heading">Connect</p>
        <a href="mailto:hello@soterlabs.com" class="footer__navlink">hello@soterlabs.com</a>
        <a href="https://x.com/soterlabs" target="_blank" rel="noopener" class="footer__navlink">X / Twitter</a>
        <a href="https://github.com/soterlabs" target="_blank" rel="noopener" class="footer__navlink">GitHub</a>
      </div>
    </div>
  </footer>
'''

def head(p):
    title = f"{p['name']} &middot; Soter Labs"
    desc = f"{p['name']}, {re.sub('<[^>]+>', '', p['role'])} at Soter Labs."
    return f'''<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{title}</title>
  <meta name="description" content="{desc}">
  <meta property="og:title" content="{title}">
  <meta property="og:description" content="{desc}">
  <meta property="og:type" content="profile">
  <meta property="og:image" content="https://soterlabs.com/assets/images/og-card.jpg">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:image" content="https://soterlabs.com/assets/images/og-card.jpg">
  <meta property="og:url" content="https://soterlabs.com/team/{p['slug']}">
  <link rel="canonical" href="https://soterlabs.com/team/{p['slug']}">
  <link rel="icon" type="image/png" sizes="32x32" href="/assets/images/favicon-32.png">
  <link rel="icon" type="image/png" sizes="192x192" href="/assets/images/favicon-192.png">
  <link rel="icon" type="image/png" sizes="512x512" href="/assets/images/favicon-512.png">
  <link rel="apple-touch-icon" sizes="180x180" href="/assets/images/apple-touch-icon.png">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/assets/css/styles.css">
  <script>
    (function () {{
      var stored = localStorage.getItem('theme');
      var prefersLight = window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches;
      var theme = stored || (prefersLight ? 'light' : 'dark');
      document.documentElement.setAttribute('data-theme', theme);
    }})();
  </script>
  <!-- Umami analytics -->
  <script defer src="https://cloud.umami.is/script.js" data-website-id="d4115aab-1aa7-4ec0-b0f7-fb1b7f1ddf7e" data-domains="soterlabs.com"></script>
</head>
<body>

'''

def person_page(p):
    actions = ''
    if p.get('email'):
        actions += f'        <a href="mailto:{p["email"]}" class="section-link">{p["email"]} &rarr;</a>\n'
    if p.get('x'):
        actions += f'        <a href="https://x.com/{p["x"]}" target="_blank" rel="noopener" class="section-link">@{p["x"]} &rarr;</a>\n'
    actions += f'        <button type="button" class="section-link profile-copy" data-copy="https://soterlabs.com/team/{p["slug"]}">Copy link</button>'
    bio = '\n'.join(f'        <p>{b}</p>' for b in p['bio'])
    return (head(p) + NAV + f'''
  <!-- Profile -->
  <header class="page-hero">
    <div class="page-hero__inner">
      <div class="profile-avatar fade-in">{p['initial']}</div>
      <p class="page-hero__kicker fade-in">{p['role']}</p>
      <h1 class="page-hero__title fade-in">{p['name']}</h1>
      <p class="page-hero__lede fade-in">{p['mandate']}</p>
      <div class="profile-actions fade-in">
{actions}
      </div>
    </div>
  </header>

  <section class="section section--flush">
    <div class="section__inner">
      <div class="profile-rows fade-in">
        <div class="profile-row">
          <span class="profile-row__term">Operates</span>
          <span class="profile-row__desc">{p['operates']}</span>
        </div>
        <div class="profile-row">
          <span class="profile-row__term">Builds</span>
          <span class="profile-row__desc">{p['builds']}</span>
        </div>
        <div class="profile-row">
          <span class="profile-row__term">Directs</span>
          <span class="profile-row__desc">{p['directs']}</span>
        </div>
      </div>
    </div>
  </section>

  <!-- Background -->
  <section class="section">
    <div class="section__inner">
      <h2 class="section__label fade-in">Background</h2>
      <div class="prose fade-in">
{bio}
      </div>
    </div>
  </section>

  <section class="section section--center section--flush">
    <div class="section__inner">
      <div class="fade-in">
        <a href="/about" class="section-link">&larr; Back to the team</a>
      </div>
    </div>
  </section>

''' + FOOTER + '''
  <script src="/assets/js/main.js"></script>
  <script>
    document.querySelectorAll('.profile-copy').forEach(function (btn) {
      btn.addEventListener('click', function () {
        navigator.clipboard.writeText(btn.getAttribute('data-copy')).then(function () {
          var prev = btn.textContent;
          btn.textContent = 'Copied!';
          setTimeout(function () { btn.textContent = prev; }, 1600);
        });
      });
    });
  </script>

</body>
</html>
''')

# ── Write person pages ──
for p in TEAM:
    with open(f"team/{p['slug']}.html", 'w') as f:
        f.write(person_page(p))
print(f"wrote {len(TEAM)} person pages")

# ── Rewrite about.html orbit + modal data between markers ──
about = open('about.html').read()

sats = '\n'.join(
    f'''        <a href="/team/{p['slug']}" class="team-orbit__avatar" data-angle="{p['angle']}" data-ring="{p['ring']}">
          <span class="team-orbit__face">{p['initial']}</span>
          <span class="team-orbit__name">{p['name']}</span>
        </a>''' for p in TEAM)
orbit_block = f'''<!-- TEAM-ORBIT:START (generated by scripts/gen_team.py — do not hand-edit) -->
{sats}
        <!-- TEAM-ORBIT:END -->'''

modal_team = {p['slug']: {k: p[k] for k in ('name','initial','role','mandate','operates','builds','directs')} for p in TEAM}
data_block = ('/* TEAM-DATA:START (generated by scripts/gen_team.py — do not hand-edit) */\n'
              '    var TEAM = ' + json.dumps(modal_team, indent=2) + ';\n'
              '    /* TEAM-DATA:END */')

if 'TEAM-ORBIT:START' in about:
    about = re.sub(r'<!-- TEAM-ORBIT:START.*?TEAM-ORBIT:END -->', orbit_block, about, flags=re.S)
else:
    about = re.sub(
        r'<a href="/team/[^"]*" class="team-orbit__avatar".*?</a>\n(?:\s*<a href="/team/[^"]*" class="team-orbit__avatar".*?</a>\n)*',
        orbit_block + '\n', about, count=1, flags=re.S)

if 'TEAM-DATA:START' in about:
    about = re.sub(r'/\* TEAM-DATA:START.*?TEAM-DATA:END \*/', data_block, about, flags=re.S)
else:
    about = re.sub(r'var TEAM = \{.*?\n\};', data_block, about, count=1, flags=re.S)

open('about.html','w').write(about)
print('about.html orbit + modal data regenerated')
