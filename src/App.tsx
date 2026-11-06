import { useMemo, useState } from 'react';
import { api } from '@appdeploy/client';
import {
  Sparkles,
  Monitor,
  Smartphone,
  Plus,
  Trash2,
  Eye,
  Download,
  Wand2,
  GripVertical,
  LayoutTemplate,
  Palette,
  Type,
  Image as ImageIcon,
} from 'lucide-react';

type Section = {
  id: string;
  type: string;
  title: string;
  text: string;
  button: string;
};
type Site = { name: string; accent: string; sections: Section[] };

const templates: Record<string, Site> = {
  Business: {
    name: 'Nova Studio',
    accent: '#6d5dfc',
    sections: [
      {
        id: 'hero',
        type: 'Hero',
        title: 'Build something people remember.',
        text: 'A modern digital studio helping ambitious brands turn ideas into beautiful experiences.',
        button: 'Get Started',
      },
      {
        id: 'services',
        type: 'Services',
        title: 'What we do',
        text: 'Strategy, design and development for businesses ready to grow.',
        button: 'View Services',
      },
      {
        id: 'about',
        type: 'About',
        title: 'Small team. Big ideas.',
        text: 'We combine thoughtful design with practical technology to make the web work harder for your business.',
        button: 'Meet the Team',
      },
      {
        id: 'contact',
        type: 'Contact',
        title: 'Let’s work together.',
        text: 'Tell us about your next project and we’ll get back to you.',
        button: 'Contact Us',
      },
    ],
  },
  Portfolio: {
    name: 'Alex Morgan',
    accent: '#111827',
    sections: [
      {
        id: 'hero',
        type: 'Hero',
        title: 'Designer & creative developer.',
        text: 'I create digital products, identities and websites with clarity and character.',
        button: 'See My Work',
      },
      {
        id: 'work',
        type: 'Projects',
        title: 'Selected work',
        text: 'Brand systems, product interfaces and websites built for real people.',
        button: 'Explore Projects',
      },
      {
        id: 'about',
        type: 'About',
        title: 'A little about me',
        text: 'Based in Lagos, working with teams anywhere. Available for selected freelance projects.',
        button: 'About Me',
      },
      {
        id: 'contact',
        type: 'Contact',
        title: 'Have a project in mind?',
        text: 'Let’s make something useful, distinctive and easy to love.',
        button: 'Say Hello',
      },
    ],
  },
  Restaurant: {
    name: 'Mango & Ember',
    accent: '#d97706',
    sections: [
      {
        id: 'hero',
        type: 'Hero',
        title: 'Good food. Warm nights.',
        text: 'Seasonal dishes, bold flavors and a relaxed table in the heart of the city.',
        button: 'Book a Table',
      },
      {
        id: 'menu',
        type: 'Menu',
        title: 'Made fresh every day',
        text: 'Small plates, mains and desserts inspired by local ingredients and global comfort food.',
        button: 'View Menu',
      },
      {
        id: 'about',
        type: 'About',
        title: 'Come as you are.',
        text: 'A neighborhood restaurant for quick lunches, long dinners and everything between.',
        button: 'Our Story',
      },
      {
        id: 'contact',
        type: 'Contact',
        title: 'Find your table.',
        text: 'Open Tuesday–Sunday. Reservations recommended for dinner.',
        button: 'Reserve',
      },
    ],
  },
};

function App() {
  const [site, setSite] = useState<Site>(templates.Business);
  const [prompt, setPrompt] = useState('');
  const [selected, setSelected] = useState(0);
  const [device, setDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [tab, setTab] = useState<'sections' | 'design'>('sections');
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState('');

  const current = site.sections[selected] ?? site.sections[0];
  const preview = useMemo(() => {
    const sections = site.sections
      .map(
        s =>
          `<section class="sec ${s.type.toLowerCase()}"><div class="inner"><div class="eyebrow">${s.type}</div><h2>${s.title}</h2><p>${s.text}</p><button>${s.button}</button></div></section>`
      )
      .join('');
    return `<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><style>*{box-sizing:border-box}body{margin:0;font-family:Inter,Arial,sans-serif;color:#101114}.sec{padding:76px 28px;background:#fff}.sec:nth-child(even){background:#f6f7fb}.inner{max-width:900px;margin:auto}.hero{min-height:430px;display:flex;align-items:center;background:linear-gradient(135deg,${site.accent}18,#fff 65%)}.eyebrow{text-transform:uppercase;letter-spacing:.14em;font-size:12px;font-weight:800;color:${site.accent};margin-bottom:14px}h2{font-size:clamp(36px,7vw,72px);line-height:.98;margin:0 0 20px;letter-spacing:-.05em}p{font-size:18px;line-height:1.7;max-width:680px;color:#5f6470;margin:0 0 28px}button{border:0;background:${site.accent};color:#fff;padding:14px 20px;border-radius:10px;font-weight:800;font-size:15px}</style></head><body>${sections}</body></html>`;
  }, [site]);

  const updateCurrent = (key: keyof Section, value: string) => {
    setSite(s => ({
      ...s,
      sections: s.sections.map((x, i) =>
        i === selected ? { ...x, [key]: value } : x
      ),
    }));
  };

  const addSection = () => {
    const id = `section-${Date.now()}`;
    setSite(s => ({
      ...s,
      sections: [
        ...s.sections,
        {
          id,
          type: 'Custom',
          title: 'New section',
          text: 'Add a short description for this section.',
          button: 'Learn More',
        },
      ],
    }));
    setSelected(site.sections.length);
  };

  const removeSection = () => {
    if (site.sections.length <= 1) return;
    setSite(s => ({
      ...s,
      sections: s.sections.filter((_, i) => i !== selected),
    }));
    setSelected(Math.max(0, selected - 1));
  };

  const generate = async () => {
    if (!prompt.trim()) return;
    setBusy(true);
    setStatus('Designing your site…');
    try {
      const { data } = await api.post('/api/generate-site', { prompt });
      setSite(data.site);
      setSelected(0);
      setStatus('AI design applied');
    } catch {
      setStatus('AI generation failed — try again');
    } finally {
      setBusy(false);
    }
  };

  const download = () => {
    const blob = new Blob([preview], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${site.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.html`;
    a.click();
    URL.revokeObjectURL(url);
    setStatus('HTML downloaded');
  };

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand">
          <div className="brand-mark">
            <Sparkles size={17} />
          </div>
          <span>SiteForge</span>
          <small>AI BUILDER</small>
        </div>
        <div className="top-actions">
          <button
            className={device === 'desktop' ? 'icon-btn active' : 'icon-btn'}
            onClick={() => setDevice('desktop')}
            aria-label="Desktop preview"
          >
            <Monitor size={17} />
          </button>
          <button
            className={device === 'mobile' ? 'icon-btn active' : 'icon-btn'}
            onClick={() => setDevice('mobile')}
            aria-label="Mobile preview"
          >
            <Smartphone size={17} />
          </button>
          <button className="download" onClick={download}>
            <Download size={16} /> Export HTML
          </button>
        </div>
      </header>

      <main className="workspace">
        <aside className="sidebar">
          <div className="ai-box">
            <div className="ai-title">
              <Wand2 size={17} /> Describe your website
            </div>
            <textarea
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              placeholder="e.g. Create a sleek website for a Lagos barber shop called Fresh Cuts…"
            />
            <button className="generate" onClick={generate} disabled={busy}>
              <Sparkles size={16} />
              {busy ? 'Generating…' : 'Generate with AI'}
            </button>
            <div className="quick">
              <button
                onClick={() => setPrompt('A premium Nigerian fashion brand')}
              >
                Fashion
              </button>
              <button onClick={() => setPrompt('A modern restaurant in Lagos')}>
                Restaurant
              </button>
              <button onClick={() => setPrompt('A professional consultant')}>
                Business
              </button>
            </div>
          </div>

          <div className="panel-tabs">
            <button
              className={tab === 'sections' ? 'selected' : ''}
              onClick={() => setTab('sections')}
            >
              <LayoutTemplate size={16} /> Sections
            </button>
            <button
              className={tab === 'design' ? 'selected' : ''}
              onClick={() => setTab('design')}
            >
              <Palette size={16} /> Design
            </button>
          </div>

          {tab === 'sections' ? (
            <div className="section-list">
              {site.sections.map((s, i) => (
                <button
                  key={s.id}
                  className={selected === i ? 'section selected' : ''}
                  onClick={() => setSelected(i)}
                >
                  <GripVertical size={14} />
                  <span>
                    <b>{s.type}</b>
                    <small>{s.title}</small>
                  </span>
                </button>
              ))}
              <div className="section-actions">
                <button onClick={addSection}>
                  <Plus size={15} /> Add section
                </button>
                <button
                  onClick={removeSection}
                  disabled={site.sections.length <= 1}
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ) : (
            <div className="design-panel">
              <label>
                Site name
                <input
                  value={site.name}
                  onChange={e => setSite({ ...site, name: e.target.value })}
                />
              </label>
              <label>
                Accent color
                <input
                  type="color"
                  value={site.accent}
                  onChange={e => setSite({ ...site, accent: e.target.value })}
                />
              </label>
            </div>
          )}

          {tab === 'sections' && current && (
            <div className="editor">
              <div className="editor-head">
                <span>Edit section</span>
                <Type size={15} />
              </div>
              <label>
                Heading
                <input
                  value={current.title}
                  onChange={e => updateCurrent('title', e.target.value)}
                />
              </label>
              <label>
                Text
                <textarea
                  value={current.text}
                  onChange={e => updateCurrent('text', e.target.value)}
                />
              </label>
              <label>
                Button
                <input
                  value={current.button}
                  onChange={e => updateCurrent('button', e.target.value)}
                />
              </label>
            </div>
          )}
        </aside>

        <section className="canvas-area">
          <div className="canvas-toolbar">
            <span>
              <Eye size={15} /> Live preview
            </span>
            <strong>{status}</strong>
          </div>
          <div
            className={
              device === 'mobile' ? 'device-frame mobile' : 'device-frame'
            }
          >
            <iframe title="Website preview" srcDoc={preview} />
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
