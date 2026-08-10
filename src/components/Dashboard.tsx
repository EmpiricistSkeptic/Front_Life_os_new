import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { fetchDomains, fetchCategories, createDomain, deleteDomain } from "../services/domains";
import type { Domain, Category, DomainCreatePayload } from "../types";
import DomainModal from "./DomainModal";
import { logout, getCurrentUser } from "../services/auth";

const SLUG_OPTIONS = [
  { value: "default",     label: "Default",     icon: "⬡",  category: "none"   },
  { value: "language",    label: "Language",    icon: "◈",  category: "mind"   },
  { value: "programming", label: "Programming", icon: "⟨⟩", category: "mind"   },
  { value: "nutrition",   label: "Nutrition",   icon: "◇",  category: "body"   },
  { value: "training",    label: "Training",    icon: "△",  category: "body"   },
  { value: "body",        label: "Body",        icon: "◉",  category: "body"   },
  { value: "sleep",       label: "Sleep",       icon: "◌",  category: "spirit" },
  { value: "stress",      label: "Stress",      icon: "◈",  category: "spirit" },
  { value: "habit",       label: "Habit",       icon: "✦",  category: "spirit" },
];

const DOMAIN_ICON: Record<string, string> = {
  language:"◈", sleep:"◌", stress:"◈", habit:"✦",
  nutrition:"◇", programming:"⟨⟩", training:"△", body:"◉", default:"⬡",
};

type SectionKey = "mind" | "body" | "spirit";

const SECTIONS = [
  {
    key: "mind" as SectionKey, label: "MIND", icon: "◈",
    color: "#00d4ff", dimColor: "rgba(0,212,255,.12)", borderColor: "rgba(0,212,255,.35)",
    glowColor: "rgba(0,212,255,.6)", gradient: "linear-gradient(135deg,#0066ff,#00d4ff)",
    desc: "INTELLECTUAL GROWTH SYSTEM",
  },
  {
    key: "body" as SectionKey, label: "BODY", icon: "△",
    color: "#00ff88", dimColor: "rgba(0,255,136,.12)", borderColor: "rgba(0,255,136,.35)",
    glowColor: "rgba(0,255,136,.6)", gradient: "linear-gradient(135deg,#00994d,#00ff88)",
    desc: "PHYSICAL ENHANCEMENT SYSTEM",
  },
  {
    key: "spirit" as SectionKey, label: "SPIRIT", icon: "✦",
    color: "#bf7fff", dimColor: "rgba(191,127,255,.12)", borderColor: "rgba(191,127,255,.35)",
    glowColor: "rgba(191,127,255,.6)", gradient: "linear-gradient(135deg,#6600cc,#bf7fff)",
    desc: "MENTAL FORTITUDE SYSTEM",
  },
];

// ── create modal ──────────────────────────────────────────────────────────────
function CreateDomainModal({ categories, defaultSection, onClose, onCreate }: {
  categories: Category[];
  defaultSection?: SectionKey | null;
  onClose: () => void;
  onCreate: (d: Domain) => void;
}) {
  const defaultCat = defaultSection ? categories.find(c => c.name.toLowerCase() === defaultSection) : null;
  const [name, setName]        = useState("");
  const [description, setDesc] = useState("");
  const [slug, setSlug]        = useState("");
  const [categoryId, setCatId] = useState<number | null>(defaultCat?.id ?? null);
  const [saving, setSaving]    = useState(false);
  const [error, setError]      = useState<string | null>(null);

  const handleSlugPick = (s: string) => {
    const newSlug = slug === s ? "" : s;
    setSlug(newSlug);
    if (newSlug) {
      const opt = SLUG_OPTIONS.find(o => o.value === newSlug);
      if (opt && !name) setName(opt.label);
      if (opt && opt.category !== "none") {
        const cat = categories.find(c => c.name.toLowerCase() === opt.category);
        if (cat) setCatId(cat.id);
      }
    }
  };

  const handleSubmit = async () => {
    if (!name.trim()) { setError("[ ERROR ] NAME REQUIRED"); return; }
    if (!categoryId)  { setError("[ ERROR ] SELECT CATEGORY"); return; }
    setSaving(true); setError(null);
    try {
      const payload: DomainCreatePayload = {
        name: name.trim(), description: description.trim() || undefined,
        slug: slug || undefined, category: categoryId !== null ? Number(categoryId) : null,
      };
      onCreate(await createDomain(payload));
    } catch (e: any) {
      setError(e?.response?.data ? JSON.stringify(e.response.data) : e?.message ?? "ERROR");
      setSaving(false);
    }
  };

  return (
    <>
      <style>{`
        @keyframes sl_fi { from{opacity:0} to{opacity:1} }
        @keyframes sl_su { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:none} }
        @keyframes sl_scan {
          0%{transform:translateY(-100%)} 100%{transform:translateY(400px)}
        }
        .sl-modal-input {
          width:100%; background:rgba(0,212,255,.04); border:1px solid rgba(0,212,255,.2);
          padding:10px 14px; font-size:12px; color:#a8d4e6; letter-spacing:.5px;
          font-family:'Share Tech Mono',monospace; outline:none; transition:all .2s;
          clip-path:polygon(0 0,calc(100% - 8px) 0,100% 8px,100% 100%,0 100%);
        }
        .sl-modal-input:focus { border-color:#00d4ff; box-shadow:0 0 12px rgba(0,212,255,.2); color:#fff; }
        .sl-modal-input::placeholder { color:rgba(0,212,255,.25); }
        .sl-slug-btn {
          padding:6px 12px; background:rgba(0,212,255,.04); border:1px solid rgba(0,212,255,.15);
          color:rgba(0,212,255,.5); font-family:'Share Tech Mono',monospace; font-size:11px;
          cursor:pointer; transition:all .15s; letter-spacing:.5px;
          clip-path:polygon(4px 0,100% 0,100% calc(100% - 4px),calc(100% - 4px) 100%,0 100%,0 4px);
        }
        .sl-slug-btn:hover { border-color:rgba(0,212,255,.5); color:#00d4ff; background:rgba(0,212,255,.08); }
        .sl-slug-btn.active { border-color:#00d4ff; color:#00d4ff; background:rgba(0,212,255,.12); box-shadow:0 0 8px rgba(0,212,255,.3); }
        .sl-btn-primary {
          flex:1; padding:11px; background:transparent; border:1px solid #00d4ff;
          color:#00d4ff; font-family:'Share Tech Mono',monospace; font-size:12px;
          letter-spacing:2px; cursor:pointer; transition:all .2s;
          clip-path:polygon(8px 0,100% 0,100% calc(100% - 8px),calc(100% - 8px) 100%,0 100%,0 8px);
          position:relative; overflow:hidden;
        }
        .sl-btn-primary:hover { background:rgba(0,212,255,.1); box-shadow:0 0 20px rgba(0,212,255,.3); }
        .sl-btn-primary:disabled { opacity:.3; cursor:not-allowed; }
        .sl-btn-cancel {
          padding:11px 20px; background:transparent; border:1px solid rgba(255,255,255,.1);
          color:rgba(255,255,255,.3); font-family:'Share Tech Mono',monospace; font-size:12px;
          letter-spacing:1px; cursor:pointer; transition:all .2s;
        }
        .sl-btn-cancel:hover { border-color:rgba(255,255,255,.3); color:rgba(255,255,255,.6); }
        .sl-label { font-size:9px; font-weight:400; color:rgba(0,212,255,.5); letter-spacing:2px; text-transform:uppercase; margin-bottom:6px; font-family:'Share Tech Mono',monospace; }
      `}</style>

      <div onClick={e => e.target === e.currentTarget && onClose()} style={{
        position:"fixed", inset:0, zIndex:1100,
        background:"rgba(0,5,20,.92)", backdropFilter:"blur(12px)",
        display:"flex", alignItems:"center", justifyContent:"center", padding:20,
        animation:"sl_fi .2s ease",
      }}>
        <div style={{
          width:"100%", maxWidth:520,
          background:"linear-gradient(135deg,rgba(0,10,30,.98),rgba(0,20,50,.95))",
          border:"1px solid rgba(0,212,255,.25)",
          padding:0, maxHeight:"90vh", overflowY:"auto",
          animation:"sl_su .25s cubic-bezier(.22,1,.36,1)",
          position:"relative",
          boxShadow:"0 0 60px rgba(0,212,255,.15), inset 0 0 60px rgba(0,0,50,.5)",
          clipPath:"polygon(0 0,calc(100% - 20px) 0,100% 20px,100% 100%,20px 100%,0 calc(100% - 20px))",
        }}>
          {/* scan line effect */}
          <div style={{
            position:"absolute", inset:0, pointerEvents:"none", zIndex:0,
            background:"repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,212,255,.015) 2px,rgba(0,212,255,.015) 4px)",
          }} />
          {/* top accent bar */}
          <div style={{ height:2, background:"linear-gradient(90deg,transparent,#00d4ff,transparent)", position:"relative", zIndex:1 }} />

          <div style={{ padding:28, position:"relative", zIndex:1 }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:24 }}>
              <div>
                <div style={{ fontSize:9, color:"rgba(0,212,255,.5)", letterSpacing:3, fontFamily:"'Share Tech Mono',monospace", marginBottom:6 }}>
                  ▸ SYSTEM INTERFACE / NEW DOMAIN
                </div>
                <div style={{ fontSize:20, fontWeight:700, color:"#00d4ff", letterSpacing:2, fontFamily:"'Orbitron',sans-serif", textShadow:"0 0 20px rgba(0,212,255,.5)" }}>
                  INITIALIZE DOMAIN
                </div>
              </div>
              <button onClick={onClose} style={{
                width:30, height:30, background:"rgba(255,50,80,.05)",
                border:"1px solid rgba(255,50,80,.2)", color:"rgba(255,50,80,.5)",
                cursor:"pointer", fontSize:13, display:"flex", alignItems:"center", justifyContent:"center",
                flexShrink:0, transition:"all .15s", fontFamily:"'Share Tech Mono',monospace",
              }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background="rgba(255,50,80,.15)"; (e.currentTarget as HTMLButtonElement).style.color="#ff3050"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background="rgba(255,50,80,.05)"; (e.currentTarget as HTMLButtonElement).style.color="rgba(255,50,80,.5)"; }}
              >✕</button>
            </div>

            {/* slug picker */}
            <div style={{ marginBottom:20 }}>
              <div className="sl-label">◈ SELECT TEMPLATE</div>
              {SECTIONS.map(sec => (
                <div key={sec.key} style={{ marginBottom:10 }}>
                  <div style={{ fontSize:9, color:sec.color, letterSpacing:2, fontFamily:"'Share Tech Mono',monospace", marginBottom:5, opacity:.7 }}>
                    {sec.icon} {sec.label}
                  </div>
                  <div style={{ display:"flex", flexWrap:"wrap", gap:5 }}>
                    {SLUG_OPTIONS.filter(o => o.category === sec.key).map(o => (
                      <button key={o.value}
                        className={`sl-slug-btn ${slug===o.value?"active":""}`}
                        style={slug===o.value?{borderColor:sec.color,color:sec.color,boxShadow:`0 0 8px ${sec.glowColor}`}:{}}
                        onClick={() => handleSlugPick(o.value)}>
                        {o.icon} {o.label.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
              <div style={{ marginTop:8 }}>
                <div style={{ fontSize:9, color:"rgba(255,255,255,.3)", letterSpacing:2, fontFamily:"'Share Tech Mono',monospace", marginBottom:5 }}>⬡ DEFAULT</div>
                {SLUG_OPTIONS.filter(o => o.category==="none").map(o => (
                  <button key={o.value} className={`sl-slug-btn ${slug===o.value?"active":""}`} onClick={() => handleSlugPick(o.value)}>
                    {o.icon} {o.label.toUpperCase()} — GENERIC ANALYTICS
                  </button>
                ))}
              </div>
              <div style={{ fontSize:9, color:"rgba(0,212,255,.3)", marginTop:8, fontFamily:"'Share Tech Mono',monospace", letterSpacing:1 }}>
                ▸ TEMPLATE SELECTION ENABLES AUTO-METRIC GENERATION
              </div>
            </div>

            <div style={{ marginBottom:14 }}>
              <div className="sl-label">◈ DOMAIN NAME *</div>
              <input className="sl-modal-input" placeholder="ENTER DESIGNATION..." value={name} onChange={e => setName(e.target.value)} />
            </div>

            <div style={{ marginBottom:14 }}>
              <div className="sl-label">◈ DESCRIPTION</div>
              <textarea className="sl-modal-input" placeholder="ENTER DESCRIPTION..." value={description}
                onChange={e => setDesc(e.target.value)}
                style={{ resize:"vertical", minHeight:60, lineHeight:1.6 }} />
            </div>

            {categories.length > 0 && (
              <div style={{ marginBottom:22 }}>
                <div className="sl-label">◈ CATEGORY *</div>
                <div style={{ display:"flex", gap:8 }}>
                  {categories.map(c => {
                    const sec = SECTIONS.find(s => s.key === c.name.toLowerCase());
                    const isSelected = categoryId === c.id;
                    return (
                      <button key={c.id} onClick={() => setCatId(c.id)} style={{
                        flex:1, padding:"10px 8px",
                        background: isSelected ? sec?.dimColor ?? "rgba(0,212,255,.08)" : "rgba(0,212,255,.03)",
                        border: `1px solid ${isSelected ? (sec?.borderColor ?? "rgba(0,212,255,.4)") : "rgba(0,212,255,.1)"}`,
                        color: isSelected ? (sec?.color ?? "#00d4ff") : "rgba(0,212,255,.3)",
                        fontFamily:"'Share Tech Mono',monospace", fontSize:11, letterSpacing:1,
                        cursor:"pointer", transition:"all .2s",
                        boxShadow: isSelected ? `0 0 16px ${sec?.glowColor ?? "rgba(0,212,255,.3)"}` : "none",
                        clipPath:"polygon(4px 0,100% 0,100% calc(100% - 4px),calc(100% - 4px) 100%,0 100%,0 4px)",
                      }}>
                        {c.name === "mind" ? "◈ MIND" : c.name === "body" ? "△ BODY" : c.name === "spirit" ? "✦ SPIRIT" : c.name.toUpperCase()}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {error && (
              <div style={{ background:"rgba(255,0,60,.08)", border:"1px solid rgba(255,0,60,.3)", padding:"10px 14px", fontSize:11, color:"#ff4466", marginBottom:16, fontFamily:"'Share Tech Mono',monospace", letterSpacing:.5 }}>
                {error}
              </div>
            )}

            <div style={{ display:"flex", gap:10 }}>
              <button className="sl-btn-cancel" onClick={onClose}>[ CANCEL ]</button>
              <button className="sl-btn-primary" disabled={saving} onClick={handleSubmit}>
                {saving ? "[ INITIALIZING... ]" : "[ CONFIRM ]"}
              </button>
            </div>
          </div>
          {/* bottom accent */}
          <div style={{ height:1, background:"linear-gradient(90deg,transparent,rgba(0,212,255,.4),transparent)" }} />
        </div>
      </div>
    </>
  );
}

// ── delete modal ──────────────────────────────────────────────────────────────
function ConfirmDeleteModal({ name, onConfirm, onClose }: { name: string; onConfirm: () => void; onClose: () => void }) {
  return (
    <div onClick={e => e.target === e.currentTarget && onClose()} style={{
      position:"fixed", inset:0, zIndex:1200,
      background:"rgba(0,5,20,.95)", backdropFilter:"blur(12px)",
      display:"flex", alignItems:"center", justifyContent:"center", padding:20,
    }}>
      <div style={{
        width:"100%", maxWidth:380,
        background:"linear-gradient(135deg,rgba(30,0,0,.98),rgba(20,0,0,.95))",
        border:"1px solid rgba(255,50,80,.3)",
        boxShadow:"0 0 60px rgba(255,0,60,.15)",
        clipPath:"polygon(0 0,calc(100% - 16px) 0,100% 16px,100% 100%,16px 100%,0 calc(100% - 16px))",
        overflow:"hidden",
      }}>
        <div style={{ height:2, background:"linear-gradient(90deg,transparent,#ff3050,transparent)" }} />
        <div style={{ padding:28 }}>
          <div style={{ fontSize:9, color:"rgba(255,50,80,.6)", letterSpacing:3, fontFamily:"'Share Tech Mono',monospace", marginBottom:16 }}>
            ▸ SYSTEM WARNING / IRREVERSIBLE ACTION
          </div>
          <div style={{ fontSize:16, fontWeight:700, color:"#ff3050", letterSpacing:2, fontFamily:"'Orbitron',sans-serif", marginBottom:12, textShadow:"0 0 20px rgba(255,50,80,.5)" }}>
            DELETE DOMAIN?
          </div>
          <div style={{ fontSize:12, color:"rgba(255,100,120,.6)", marginBottom:24, fontFamily:"'Share Tech Mono',monospace", lineHeight:1.7, letterSpacing:.5 }}>
            DOMAIN <span style={{ color:"#ff3050" }}>"{name}"</span> AND ALL ASSOCIATED METRICS WILL BE PERMANENTLY ERASED FROM THE SYSTEM.
          </div>
          <div style={{ display:"flex", gap:10 }}>
            <button onClick={onClose} style={{
              flex:1, padding:10, background:"transparent",
              border:"1px solid rgba(255,255,255,.1)", color:"rgba(255,255,255,.3)",
              fontFamily:"'Share Tech Mono',monospace", fontSize:11, letterSpacing:1, cursor:"pointer", transition:"all .15s",
            }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor="rgba(255,255,255,.3)"; (e.currentTarget as HTMLButtonElement).style.color="rgba(255,255,255,.6)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor="rgba(255,255,255,.1)"; (e.currentTarget as HTMLButtonElement).style.color="rgba(255,255,255,.3)"; }}>
              [ ABORT ]
            </button>
            <button onClick={onConfirm} style={{
              flex:1, padding:10, background:"rgba(255,50,80,.1)",
              border:"1px solid rgba(255,50,80,.4)", color:"#ff3050",
              fontFamily:"'Share Tech Mono',monospace", fontSize:11, letterSpacing:1, cursor:"pointer", transition:"all .15s",
              clipPath:"polygon(4px 0,100% 0,100% calc(100% - 4px),calc(100% - 4px) 100%,0 100%,0 4px)",
            }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background="rgba(255,50,80,.2)"; (e.currentTarget as HTMLButtonElement).style.boxShadow="0 0 16px rgba(255,50,80,.3)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background="rgba(255,50,80,.1)"; (e.currentTarget as HTMLButtonElement).style.boxShadow="none"; }}>
              [ CONFIRM DELETE ]
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── main ──────────────────────────────────────────────────────────────────────
export default function Dashboard() {
  const [domains, setDomains]             = useState<Domain[]>([]);
  const [categories, setCategories]       = useState<Category[]>([]);
  const [loading, setLoading]             = useState(true);
  const [activeSection, setActiveSection] = useState<SectionKey>("mind");
  const [selected, setSelected]           = useState<number | null>(null);
  const [showCreate, setShowCreate]       = useState(false);
  const [deleteTarget, setDeleteTarget]   = useState<Domain | null>(null);
  
  const navigate = useNavigate();
  const user = getCurrentUser();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [doms, cats] = await Promise.all([fetchDomains(), fetchCategories()]);
      setDomains(doms); setCategories(cats);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleCreated = (d: Domain) => {
    setShowCreate(false);
    setDomains(prev => [d, ...prev]);
    const cat = d.category_name?.toLowerCase() as SectionKey | undefined;
    if (cat && SECTIONS.find(s => s.key === cat)) setActiveSection(cat);
    setSelected(d.id);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try { await deleteDomain(deleteTarget.id); setDomains(prev => prev.filter(d => d.id !== deleteTarget.id)); }
    catch (e) { console.error(e); }
    finally { setDeleteTarget(null); }
  };

  const sec = SECTIONS.find(s => s.key === activeSection)!;
  const visible = domains.filter(d => (d.category_name ?? "").toLowerCase() === activeSection);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;600;700;900&family=Share+Tech+Mono&display=swap');

        @keyframes sl_fi    { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:none} }
        @keyframes sl_spin  { to{transform:rotate(360deg)} }
        @keyframes sl_pulse { 0%,100%{opacity:.4} 50%{opacity:1} }
        @keyframes sl_scan  { 0%{transform:translateY(-100%)} 100%{transform:translateY(100vh)} }
        @keyframes sl_blink { 0%,100%{opacity:1} 49%{opacity:1} 50%{opacity:0} 99%{opacity:0} }
        @keyframes sl_glow  { 0%,100%{box-shadow:0 0 8px var(--sec-glow)} 50%{box-shadow:0 0 24px var(--sec-glow),0 0 48px var(--sec-glow)} }
        @keyframes sl_tab   { from{opacity:0;transform:translateX(-8px)} to{opacity:1;transform:none} }
        @keyframes sl_card  { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:none} }
        @keyframes sl_hex   { 0%{transform:rotate(0deg)} 100%{transform:rotate(360deg)} }

        *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
        html,body,#root { width:100%; min-height:100vh; background:#03060f; }

        .sl-root {
          width:100%; min-height:100vh; background:#03060f;
          font-family:'Share Tech Mono',monospace; color:#a8d4e6;
          position:relative; overflow-x:hidden;
        }

        /* ── grid background ── */
        .sl-root::before {
          content:""; position:fixed; inset:0; pointer-events:none; z-index:0;
          background-image:
            linear-gradient(rgba(0,212,255,.03) 1px,transparent 1px),
            linear-gradient(90deg,rgba(0,212,255,.03) 1px,transparent 1px);
          background-size:40px 40px;
        }

        /* ── scan line ── */
        .sl-root::after {
          content:""; position:fixed; left:0; right:0; height:120px; pointer-events:none; z-index:1;
          background:linear-gradient(transparent,rgba(0,212,255,.04),transparent);
          animation:sl_scan 8s linear infinite;
        }

        /* ── header ── */
        .sl-header {
          display:flex; align-items:center; justify-content:space-between;
          padding:16px 32px; position:sticky; top:0; z-index:100;
          background:rgba(3,6,15,.92); backdrop-filter:blur(16px);
          border-bottom:1px solid rgba(0,212,255,.12);
        }
        .sl-header::after {
          content:""; position:absolute; bottom:0; left:0; right:0; height:1px;
          background:linear-gradient(90deg,transparent,rgba(0,212,255,.6),transparent);
        }

        .sl-logo { display:flex; align-items:center; gap:14px; }
        .sl-logo-hex {
          width:38px; height:38px; position:relative;
          display:flex; align-items:center; justify-content:center;
        }
        .sl-logo-hex-inner {
          width:100%; height:100%;
          background:rgba(0,212,255,.1);
          border:1px solid rgba(0,212,255,.4);
          clip-path:polygon(50% 0%,100% 25%,100% 75%,50% 100%,0% 75%,0% 25%);
          display:flex; align-items:center; justify-content:center;
          font-size:16px; color:#00d4ff;
          box-shadow:0 0 16px rgba(0,212,255,.3);
        }
        .sl-logo-text {
          display:flex; flex-direction:column;
        }
        .sl-logo-title {
          font-size:14px; font-weight:700; color:#00d4ff; letter-spacing:3px;
          font-family:'Orbitron',sans-serif; text-shadow:0 0 12px rgba(0,212,255,.5);
        }
        .sl-logo-sub { font-size:8px; color:rgba(0,212,255,.4); letter-spacing:2px; margin-top:1px; }

        .sl-header-right { display:flex; align-items:center; gap:12px; }

        .sl-user-panel {
          display:flex; align-items:center; gap:8px; padding:6px 14px;
          border:1px solid rgba(0,212,255,.15); background:rgba(0,212,255,.04);
          clip-path:polygon(0 0,calc(100% - 6px) 0,100% 6px,100% 100%,0 100%);
        }
        .sl-user-dot {
          width:6px; height:6px;
          background:#00ff88; border-radius:50%;
          box-shadow:0 0 6px #00ff88;
          animation:sl_pulse 2s ease-in-out infinite;
        }
        .sl-user-name { font-size:11px; color:rgba(0,212,255,.7); letter-spacing:1px; }

        .sl-ai-btn {
          display:flex; align-items:center; gap:6px; padding:7px 16px;
          background:rgba(191,127,255,.06); border:1px solid rgba(191,127,255,.25);
          color:#bf7fff; font-family:'Share Tech Mono',monospace; font-size:11px;
          letter-spacing:1px; cursor:pointer; transition:all .2s;
          clip-path:polygon(6px 0,100% 0,100% calc(100% - 6px),calc(100% - 6px) 100%,0 100%,0 6px);
        }
        .sl-ai-btn:hover { background:rgba(191,127,255,.12); box-shadow:0 0 16px rgba(191,127,255,.3); }

        .sl-logout-btn {
          padding:7px 14px; background:rgba(255,50,80,.05);
          border:1px solid rgba(255,50,80,.2); color:rgba(255,50,80,.6);
          font-family:'Share Tech Mono',monospace; font-size:11px; letter-spacing:1px;
          cursor:pointer; transition:all .2s;
        }
        .sl-logout-btn:hover { background:rgba(255,50,80,.1); border-color:rgba(255,50,80,.4); color:#ff3050; }

        /* ── main ── */
        .sl-main { padding:24px 32px; position:relative; z-index:2; }

        /* ── section tabs ── */
        .sl-tabs { display:flex; gap:0; margin-bottom:32px; position:relative; }
        .sl-tabs::after {
          content:""; position:absolute; bottom:0; left:0; right:0; height:1px;
          background:rgba(0,212,255,.1);
        }

        .sl-tab {
          display:flex; align-items:center; gap:10px; padding:14px 28px;
          background:transparent; border:none; border-bottom:2px solid transparent;
          color:rgba(0,212,255,.25); font-family:'Orbitron',sans-serif; font-size:11px;
          font-weight:700; letter-spacing:3px; cursor:pointer; transition:all .2s;
          position:relative;
        }
        .sl-tab:hover { color:rgba(0,212,255,.5); }
        .sl-tab.active { color:var(--sec-color); border-bottom-color:var(--sec-color); }
        .sl-tab.active::after {
          content:""; position:absolute; bottom:-1px; left:0; right:0; height:2px;
          background:var(--sec-color);
          box-shadow:0 0 12px var(--sec-glow);
        }
        .sl-tab-icon { font-size:14px; }
        .sl-tab-count {
          font-size:9px; padding:2px 6px;
          border:1px solid currentColor; opacity:.6;
          font-family:'Share Tech Mono',monospace; letter-spacing:1px;
        }

        /* ── section header ── */
        .sl-section-header {
          display:flex; align-items:center; justify-content:space-between;
          margin-bottom:20px; animation:sl_tab .2s ease;
        }
        .sl-section-left { display:flex; align-items:center; gap:16px; }
        .sl-section-emblem {
          width:48px; height:48px; position:relative;
          display:flex; align-items:center; justify-content:center;
          background:var(--sec-dim); border:1px solid var(--sec-border);
          clip-path:polygon(50% 0%,100% 25%,100% 75%,50% 100%,0% 75%,0% 25%);
          font-size:20px;
          animation:sl_glow 3s ease-in-out infinite;
        }
        .sl-section-title { font-family:'Orbitron',sans-serif; font-size:20px; font-weight:900; color:var(--sec-color); letter-spacing:4px; text-shadow:0 0 20px var(--sec-glow); }
        .sl-section-subtitle { font-size:8px; color:var(--sec-color); opacity:.4; letter-spacing:3px; margin-top:3px; }

        .sl-new-btn {
          display:flex; align-items:center; gap:8px; padding:10px 22px;
          background:var(--sec-dim); border:1px solid var(--sec-border);
          color:var(--sec-color); font-family:'Orbitron',sans-serif; font-size:10px;
          font-weight:700; letter-spacing:2px; cursor:pointer; transition:all .2s;
          clip-path:polygon(8px 0,100% 0,100% calc(100% - 8px),calc(100% - 8px) 100%,0 100%,0 8px);
        }
        .sl-new-btn:hover { box-shadow:0 0 20px var(--sec-glow); background:rgba(0,0,0,.5); }

        /* ── loading ── */
        .sl-state { display:flex; flex-direction:column; align-items:center; justify-content:center; padding:80px 20px; gap:16px; }
        .sl-spinner {
          width:36px; height:36px;
          border:2px solid rgba(0,212,255,.1);
          border-top-color:#00d4ff;
          clip-path:polygon(50% 0%,100% 25%,100% 75%,50% 100%,0% 75%,0% 25%);
          animation:sl_spin .8s linear infinite;
        }
        .sl-state-text { font-size:10px; color:rgba(0,212,255,.4); letter-spacing:3px; animation:sl_blink 1s infinite; }

        /* ── grid ── */
        .sl-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(300px,1fr)); gap:16px; }

        /* ── domain card ── */
        .sl-card {
          background:rgba(0,10,30,.8);
          border:1px solid var(--sec-border);
          padding:0; cursor:pointer;
          transition:all .25s;
          animation:sl_card .4s cubic-bezier(.22,1,.36,1) both;
          position:relative; overflow:hidden;
          clip-path:polygon(0 0,calc(100% - 16px) 0,100% 16px,100% 100%,16px 100%,0 calc(100% - 16px));
        }
        .sl-card::before {
          content:""; position:absolute; inset:0; pointer-events:none;
          background:repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(0,212,255,.008) 3px,rgba(0,212,255,.008) 4px);
        }
        .sl-card:hover {
          border-color:var(--sec-color);
          box-shadow:0 0 30px var(--sec-glow), inset 0 0 30px rgba(0,0,0,.5);
          transform:translateY(-3px);
        }
        .sl-card:hover .sl-card-scan { animation:sl_scan 1.5s linear infinite; }

        .sl-card-scan {
          position:absolute; left:0; right:0; height:40px; pointer-events:none;
          background:linear-gradient(transparent,var(--sec-dim),transparent);
          top:0; opacity:0; transition:opacity .3s;
        }
        .sl-card:hover .sl-card-scan { opacity:1; }

        .sl-card-top-bar {
          height:2px;
          background:linear-gradient(90deg,transparent,var(--sec-color),transparent);
          opacity:.6;
        }
        .sl-card:hover .sl-card-top-bar { opacity:1; box-shadow:0 0 8px var(--sec-glow); }

        .sl-card-body { padding:18px 20px; }

        .sl-card-header { display:flex; align-items:flex-start; gap:14px; margin-bottom:16px; }

        .sl-card-emblem {
          width:42px; height:42px; flex-shrink:0;
          background:var(--sec-dim); border:1px solid var(--sec-border);
          clip-path:polygon(50% 0%,100% 25%,100% 75%,50% 100%,0% 75%,0% 25%);
          display:flex; align-items:center; justify-content:center;
          font-size:16px; color:var(--sec-color);
          transition:box-shadow .25s;
        }
        .sl-card:hover .sl-card-emblem { box-shadow:0 0 16px var(--sec-glow); }

        .sl-card-info { flex:1; min-width:0; }
        .sl-card-id { font-size:8px; color:var(--sec-color); opacity:.4; letter-spacing:2px; margin-bottom:4px; }
        .sl-card-name {
          font-family:'Orbitron',sans-serif; font-size:13px; font-weight:700;
          color:#e8f4ff; letter-spacing:1px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;
          margin-bottom:4px;
        }
        .sl-card-desc { font-size:10px; color:rgba(168,212,230,.35); line-height:1.5; letter-spacing:.5px; }

        .sl-card-footer {
          display:flex; align-items:center; justify-content:space-between;
          padding-top:14px; border-top:1px solid rgba(0,212,255,.06);
        }
        .sl-card-stats { display:flex; align-items:center; gap:14px; }
        .sl-card-stat { display:flex; align-items:center; gap:5px; font-size:10px; color:rgba(0,212,255,.4); letter-spacing:1px; }
        .sl-card-stat-dot { width:4px; height:4px; background:var(--sec-color); box-shadow:0 0 4px var(--sec-glow); }

        .sl-card-actions { display:flex; gap:6px; }
        .sl-card-open {
          padding:5px 14px; background:var(--sec-dim); border:1px solid var(--sec-border);
          color:var(--sec-color); font-family:'Share Tech Mono',monospace; font-size:10px;
          letter-spacing:1px; cursor:pointer; transition:all .15s;
          clip-path:polygon(4px 0,100% 0,100% calc(100% - 4px),calc(100% - 4px) 100%,0 100%,0 4px);
        }
        .sl-card-open:hover { box-shadow:0 0 12px var(--sec-glow); }
        .sl-card-del {
          width:28px; height:28px; background:rgba(255,50,80,.05);
          border:1px solid rgba(255,50,80,.15); color:rgba(255,50,80,.5);
          cursor:pointer; display:flex; align-items:center; justify-content:center;
          font-size:11px; transition:all .15s;
        }
        .sl-card-del:hover { background:rgba(255,50,80,.12); border-color:rgba(255,50,80,.4); color:#ff3050; box-shadow:0 0 8px rgba(255,50,80,.2); }

        /* ── empty ── */
        .sl-empty { display:flex; flex-direction:column; align-items:center; justify-content:center; padding:70px 20px; gap:14px; }
        .sl-empty-icon { font-size:40px; color:var(--sec-color); opacity:.2; animation:sl_pulse 3s ease-in-out infinite; }
        .sl-empty-title { font-family:'Orbitron',sans-serif; font-size:13px; font-weight:700; color:var(--sec-color); opacity:.4; letter-spacing:3px; }
        .sl-empty-desc { font-size:9px; color:rgba(0,212,255,.25); letter-spacing:2px; }
        .sl-empty-btn {
          margin-top:8px; padding:10px 24px;
          background:var(--sec-dim); border:1px solid var(--sec-border);
          color:var(--sec-color); font-family:'Orbitron',sans-serif; font-size:9px;
          font-weight:700; letter-spacing:3px; cursor:pointer; transition:all .2s;
          clip-path:polygon(8px 0,100% 0,100% calc(100% - 8px),calc(100% - 8px) 100%,0 100%,0 8px);
        }
        .sl-empty-btn:hover { box-shadow:0 0 20px var(--sec-glow); }

        /* ── corner decorations ── */
        .sl-corner {
          position:fixed; width:60px; height:60px; pointer-events:none; z-index:1;
          opacity:.3;
        }
        .sl-corner-tl { top:0; left:0; border-top:2px solid #00d4ff; border-left:2px solid #00d4ff; }
        .sl-corner-tr { top:0; right:0; border-top:2px solid #00d4ff; border-right:2px solid #00d4ff; }
        .sl-corner-bl { bottom:0; left:0; border-bottom:2px solid #00d4ff; border-left:2px solid #00d4ff; }
        .sl-corner-br { bottom:0; right:0; border-bottom:2px solid #00d4ff; border-right:2px solid #00d4ff; }
      `}</style>

      {/* corner HUD decorations */}
      <div className="sl-corner sl-corner-tl" />
      <div className="sl-corner sl-corner-tr" />
      <div className="sl-corner sl-corner-bl" />
      <div className="sl-corner sl-corner-br" />

      <div className="sl-root">
        {/* ── header ── */}
        <header className="sl-header">
          <div className="sl-logo">
            <div className="sl-logo-hex">
              <div className="sl-logo-hex-inner">◈</div>
            </div>
            <div className="sl-logo-text">
              <div className="sl-logo-title">LIFE OS</div>
              <div className="sl-logo-sub">▸ PLAYER STATUS SYSTEM v2.0</div>
            </div>
          </div>

          <div className="sl-header-right">
            <div className="sl-user-panel">
              <div className="sl-user-dot" />
              <span className="sl-user-name">[ {user?.username?.toUpperCase() ?? "—"} ]</span>
            </div>
            <button className="sl-ai-btn" onClick={() => navigate("/assistant")}>
              ✦ A.I. SYSTEM
            </button>
            <button className="sl-logout-btn" onClick={() => logout().then(() => navigate("/login"))}>
              [ EXIT ]
            </button>
          </div>
        </header>

        <main className="sl-main">
          {/* ── tabs ── */}
          <div className="sl-tabs">
            {SECTIONS.map(s => {
              const count = domains.filter(d => (d.category_name ?? "").toLowerCase() === s.key).length;
              const isActive = activeSection === s.key;
              return (
                <button key={s.key} className={`sl-tab ${isActive ? "active" : ""}`}
                  style={{ "--sec-color": s.color, "--sec-glow": s.glowColor } as React.CSSProperties}
                  onClick={() => setActiveSection(s.key)}>
                  <span className="sl-tab-icon">{s.icon}</span>
                  {s.label}
                  <span className="sl-tab-count">{count}</span>
                </button>
              );
            })}
          </div>

          {loading ? (
            <div className="sl-state">
              <div className="sl-spinner" />
              <div className="sl-state-text">LOADING SYSTEM DATA...</div>
            </div>
          ) : (
            <div style={{ "--sec-color": sec.color, "--sec-dim": sec.dimColor, "--sec-border": sec.borderColor, "--sec-glow": sec.glowColor } as React.CSSProperties}>
              {/* ── section header ── */}
              <div className="sl-section-header" key={activeSection}>
                <div className="sl-section-left">
                  <div className="sl-section-emblem">{sec.icon}</div>
                  <div>
                    <div className="sl-section-title">{sec.label}</div>
                    <div className="sl-section-subtitle">{sec.desc}</div>
                  </div>
                </div>
                <button className="sl-new-btn" onClick={() => setShowCreate(true)}>
                  ＋ INITIALIZE DOMAIN
                </button>
              </div>

              {visible.length === 0 ? (
                <div className="sl-empty">
                  <div className="sl-empty-icon">{sec.icon}</div>
                  <div className="sl-empty-title">NO DOMAINS REGISTERED</div>
                  <div className="sl-empty-desc">▸ ADD YOUR FIRST {sec.label} DOMAIN TO BEGIN TRACKING</div>
                  <button className="sl-empty-btn" onClick={() => setShowCreate(true)}>
                    ＋ INITIALIZE FIRST DOMAIN
                  </button>
                </div>
              ) : (
                <div className="sl-grid">
                  {visible.map((d, i) => {
                    const metricsCount = d.summary?.metrics_count ?? (d.metrics?.length ?? 0);
                    const icon = DOMAIN_ICON[d.slug ?? ""] ?? "⬡";
                    return (
                      <div key={d.id} className="sl-card"
                        style={{ animationDelay: `${i * 60}ms` }}
                        onClick={() => setSelected(d.id)}>
                        <div className="sl-card-scan" />
                        <div className="sl-card-top-bar" />
                        <div className="sl-card-body">
                          <div className="sl-card-header">
                            <div className="sl-card-emblem">{icon}</div>
                            <div className="sl-card-info">
                              <div className="sl-card-id">▸ DOMAIN ID:{String(d.id).padStart(4,"0")}</div>
                              <div className="sl-card-name">{d.name.toUpperCase()}</div>
                              <div className="sl-card-desc">{d.description || "NO DESCRIPTION REGISTERED"}</div>
                            </div>
                          </div>
                          <div className="sl-card-footer">
                            <div className="sl-card-stats">
                              <div className="sl-card-stat">
                                <div className="sl-card-stat-dot" />
                                {metricsCount} METRICS
                              </div>
                              <div className="sl-card-stat">
                                <div className="sl-card-stat-dot" />
                                {d.slug?.toUpperCase() ?? "DEFAULT"}
                              </div>
                            </div>
                            <div className="sl-card-actions">
                              <button className="sl-card-del"
                                onClick={e => { e.stopPropagation(); setDeleteTarget(d); }}
                                title="DELETE">✕</button>
                              <button className="sl-card-open"
                                onClick={e => { e.stopPropagation(); setSelected(d.id); }}>
                                ENTER ▸
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {selected !== null && (
        <DomainModal id={selected} onClose={() => setSelected(null)}
          onDeleted={() => { setSelected(null); setDomains(prev => prev.filter(d => d.id !== selected)); }} />
      )}
      {showCreate && (
        <CreateDomainModal categories={categories} defaultSection={activeSection}
          onClose={() => setShowCreate(false)} onCreate={handleCreated} />
      )}
      {deleteTarget && (
        <ConfirmDeleteModal name={deleteTarget.name} onConfirm={handleDeleteConfirm} onClose={() => setDeleteTarget(null)} />
      )}
    </>
  );
}