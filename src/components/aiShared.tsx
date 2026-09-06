/* ------------------------------------------------------------------ */
/*  Shared types                                                       */
/* ------------------------------------------------------------------ */

export type ReportType =
  | "weekly_comparison"
  | "monthly_comparison"
  | "category"
  | "domain"
  | "correlations"
  | "free";

export interface Domain {
  id: number;
  name: string;
  slug: string;
  category_name?: string;
}

export interface ChatMessage {
  id: number | string;
  role: "user" | "assistant";
  content: string;
  created_at?: string;
  loading?: boolean;
  error?: boolean;
}

export interface ConversationLastMessage {
  role: "user" | "assistant";
  content: string;
  created_at: string;
}

export interface ConversationSummary {
  id: number;
  user?: number;
  title: string;
  message_count: number;
  last_message: ConversationLastMessage | null;
  created_at: string;
  updated_at: string;
}

export const QUICK_ACTIONS = [
  { id: "weekly_comparison", label: "THIS WEEK", icon: "◈", desc: "VS LAST WEEK", color: "#00d4ff", glow: "rgba(0,212,255,.15)", border: "rgba(0,212,255,.3)", type: "weekly_comparison" as ReportType, payload: {} },
  { id: "monthly_comparison", label: "THIS MONTH", icon: "◉", desc: "VS LAST MONTH", color: "#00ff88", glow: "rgba(0,255,136,.15)", border: "rgba(0,255,136,.3)", type: "monthly_comparison" as ReportType, payload: {} },
  { id: "mind", label: "MIND", icon: "◈", desc: "LANGUAGE · PROGRAMMING", color: "#00d4ff", glow: "rgba(0,212,255,.15)", border: "rgba(0,212,255,.3)", type: "category" as ReportType, payload: { category: "mind" } },
  { id: "body", label: "BODY", icon: "△", desc: "TRAINING · NUTRITION", color: "#00ff88", glow: "rgba(0,255,136,.15)", border: "rgba(0,255,136,.3)", type: "category" as ReportType, payload: { category: "body" } },
  { id: "spirit", label: "SPIRIT", icon: "✦", desc: "SLEEP · STRESS · HABITS", color: "#bf7fff", glow: "rgba(191,127,255,.15)", border: "rgba(191,127,255,.3)", type: "category" as ReportType, payload: { category: "spirit" } },
  { id: "correlations", label: "CORRELATIONS", icon: "⬡", desc: "CROSS-DOMAIN PATTERNS", color: "#ffcc00", glow: "rgba(255,204,0,.15)", border: "rgba(255,204,0,.3)", type: "correlations" as ReportType, payload: {} },
];

/* ------------------------------------------------------------------ */
/*  Shared markdown renderer (used inside assistant bubbles)           */
/* ------------------------------------------------------------------ */

export function renderMarkdown(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(/^### (.*$)/gm, '<div class="sl-ai-h3">$1</div>')
    .replace(/^## (.*$)/gm, '<div class="sl-ai-h2">$1</div>')
    .replace(/^# (.*$)/gm, '<div class="sl-ai-h1">$1</div>')
    .replace(/^\* (.*$)/gm, '<div class="sl-ai-bullet">$1</div>')
    .replace(/^- (.*$)/gm, '<div class="sl-ai-bullet">$1</div>')
    .replace(/^\d+\. (.*$)/gm, '<div class="sl-ai-numbered">$1</div>')
    .replace(/\n\n/g, '<div class="sl-ai-spacer"></div>')
    .replace(/\n/g, "<br/>");
}

/* ------------------------------------------------------------------ */
/*  Shared global stylesheet — imported once by each screen so both    */
/*  render pixel-identical chrome. Kept as a single exported string    */
/*  instead of a CSS file so no build-config changes are required.     */
/* ------------------------------------------------------------------ */

export const HUD_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;600;700;900&family=Share+Tech+Mono&display=swap');

  @keyframes sl_ai_fi    { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:none} }
  @keyframes sl_ai_msg   { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:none} }
  @keyframes sl_ai_pop   { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:none} }
  @keyframes sl_ai_spin  { to{transform:rotate(360deg)} }
  @keyframes sl_ai_pulse { 0%,100%{opacity:.2;transform:scale(.7)} 50%{opacity:1;transform:scale(1.2)} }
  @keyframes sl_ai_glow  { 0%,100%{opacity:.3;filter:drop-shadow(0 0 8px rgba(0,212,255,.4))} 50%{opacity:.8;filter:drop-shadow(0 0 20px rgba(0,212,255,.8))} }
  @keyframes sl_ai_scan  { 0%{transform:translateY(-100%)} 100%{transform:translateY(100vh)} }
  @keyframes sl_ai_blink { 0%,100%{opacity:1} 49%{opacity:1} 50%{opacity:0} 99%{opacity:0} }

  html,body,#root { height:100%; margin:0; padding:0; }
  *,*::before,*::after { box-sizing:border-box; margin:0; padding:0; }

  .sl-ai-root {
    width:100%; height:100vh; background:#03060f;
    display:flex; flex-direction:column; overflow:hidden;
    position:relative; font-family:'Share Tech Mono',monospace;
  }

  .sl-ai-root::before {
    content:""; position:fixed; inset:0; pointer-events:none; z-index:0;
    background-image:
      linear-gradient(rgba(0,212,255,.025) 1px,transparent 1px),
      linear-gradient(90deg,rgba(0,212,255,.025) 1px,transparent 1px);
    background-size:40px 40px;
  }
  .sl-ai-root::after {
    content:""; position:fixed; left:0; right:0; height:100px; pointer-events:none; z-index:1;
    background:linear-gradient(transparent,rgba(0,212,255,.03),transparent);
    animation:sl_ai_scan 8s linear infinite;
  }

  .sl-ai-header {
    display:flex; align-items:center; justify-content:space-between;
    padding:16px 32px; flex-shrink:0; position:relative; z-index:10;
    background:rgba(3,6,15,.94); backdrop-filter:blur(16px);
    border-bottom:1px solid rgba(0,212,255,.1);
  }
  .sl-ai-header::after {
    content:""; position:absolute; bottom:0; left:0; right:0; height:1px;
    background:linear-gradient(90deg,transparent,rgba(0,212,255,.5),transparent);
  }
  .sl-ai-header-left { display:flex; align-items:center; gap:14px; min-width:0; }
  .sl-ai-avatar {
    width:38px; height:38px; flex-shrink:0;
    background:rgba(0,212,255,.08); border:1px solid rgba(0,212,255,.3);
    clip-path:polygon(50% 0%,100% 25%,100% 75%,50% 100%,0% 75%,0% 25%);
    display:flex; align-items:center; justify-content:center;
    font-size:16px; color:#00d4ff;
    box-shadow:0 0 16px rgba(0,212,255,.3);
    animation:sl_ai_glow 3s ease-in-out infinite;
  }
  .sl-ai-title { font-family:'Orbitron',sans-serif; font-size:14px; font-weight:700; color:#00d4ff; letter-spacing:3px; text-shadow:0 0 12px rgba(0,212,255,.5); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
  .sl-ai-sub   { font-size:8px; color:rgba(0,212,255,.4); letter-spacing:2px; margin-top:2px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
  .sl-ai-back  {
    display:flex; align-items:center; gap:6px; padding:7px 16px; flex-shrink:0;
    background:rgba(0,212,255,.04); border:1px solid rgba(0,212,255,.15);
    color:rgba(0,212,255,.5); font-family:'Share Tech Mono',monospace;
    font-size:10px; letter-spacing:1px; cursor:pointer; transition:all .2s;
    clip-path:polygon(0 0,calc(100% - 6px) 0,100% 6px,100% 100%,6px 100%,0 calc(100% - 6px));
  }
  .sl-ai-back:hover { border-color:rgba(0,212,255,.4); color:#00d4ff; box-shadow:0 0 12px rgba(0,212,255,.2); }

  .sl-ai-body {
    flex:1; display:flex; flex-direction:column;
    max-width:820px; width:100%; margin:0 auto; padding:0 28px;
    min-height:0; position:relative; z-index:2;
  }

  .sl-ai-empty {
    flex:1; display:flex; flex-direction:column; align-items:center;
    justify-content:center; padding:40px 20px; overflow-y:auto;
    animation:sl_ai_fi .4s ease;
  }
  .sl-ai-empty-icon {
    font-size:52px; margin-bottom:20px; color:#00d4ff;
    animation:sl_ai_glow 3s ease-in-out infinite;
  }
  .sl-ai-empty-title {
    font-family:'Orbitron',sans-serif; font-size:18px; font-weight:900;
    color:#00d4ff; letter-spacing:4px; margin-bottom:10px;
    text-shadow:0 0 20px rgba(0,212,255,.5);
  }
  .sl-ai-empty-sub { font-size:10px; color:rgba(0,212,255,.35); text-align:center; max-width:400px; line-height:1.8; letter-spacing:.5px; }

  .sl-ai-quick { display:grid; grid-template-columns:repeat(3,1fr); gap:8px; width:100%; max-width:620px; margin-top:28px; }
  .sl-ai-quick-btn {
    display:flex; flex-direction:column; align-items:flex-start; gap:5px;
    padding:14px 16px; cursor:pointer; transition:all .2s; text-align:left;
    background:rgba(0,10,30,.8); position:relative; overflow:hidden;
    clip-path:polygon(0 0,calc(100% - 10px) 0,100% 10px,100% 100%,10px 100%,0 calc(100% - 10px));
  }
  .sl-ai-quick-btn::before { content:""; position:absolute; top:0; left:0; right:0; height:1px; background:linear-gradient(90deg,transparent,var(--btn-color),transparent); opacity:.6; }
  .sl-ai-quick-btn:hover { transform:translateY(-3px); box-shadow:0 8px 24px var(--btn-glow); }
  .sl-ai-quick-btn:hover::before { opacity:1; }
  .sl-ai-quick-btn:disabled { opacity:.3; cursor:not-allowed; transform:none; }
  .sl-ai-quick-icon  { font-size:16px; color:var(--btn-color); filter:drop-shadow(0 0 4px var(--btn-color)); }
  .sl-ai-quick-label { font-family:'Orbitron',sans-serif; font-size:9px; font-weight:700; color:var(--btn-color); letter-spacing:2px; text-shadow:0 0 8px var(--btn-color); }
  .sl-ai-quick-desc  { font-size:8px; color:rgba(0,212,255,.3); letter-spacing:.5px; }

  .sl-ai-dive-btn {
    display:flex; align-items:center; gap:8px; padding:9px 18px;
    background:rgba(255,204,0,.05); border:1px solid rgba(255,204,0,.2);
    color:rgba(255,204,0,.6); font-family:'Share Tech Mono',monospace;
    font-size:10px; letter-spacing:1px; cursor:pointer; transition:all .2s; margin-top:14px;
    clip-path:polygon(6px 0,100% 0,100% calc(100% - 6px),calc(100% - 6px) 100%,0 100%,0 6px);
  }
  .sl-ai-dive-btn:hover { background:rgba(255,204,0,.1); border-color:rgba(255,204,0,.4); color:#ffcc00; box-shadow:0 0 16px rgba(255,204,0,.2); }

  .sl-ai-messages {
    flex:1; overflow-y:auto; padding:24px 0 8px; min-height:0;
    scrollbar-width:thin; scrollbar-color:rgba(0,212,255,.2) transparent;
  }
  .sl-ai-messages::-webkit-scrollbar { width:3px; }
  .sl-ai-messages::-webkit-scrollbar-thumb { background:rgba(0,212,255,.2); }

  .sl-ai-inline { display:flex; flex-wrap:wrap; gap:6px; padding:10px 0; border-top:1px solid rgba(0,212,255,.06); flex-shrink:0; }
  .sl-ai-inline-btn {
    display:flex; align-items:center; gap:5px; padding:5px 12px;
    background:rgba(0,212,255,.03); border:1px solid rgba(0,212,255,.1);
    color:rgba(0,212,255,.4); font-family:'Share Tech Mono',monospace;
    font-size:9px; letter-spacing:.5px; cursor:pointer; transition:all .15s;
    clip-path:polygon(4px 0,100% 0,100% calc(100% - 4px),calc(100% - 4px) 100%,0 100%,0 4px);
  }
  .sl-ai-inline-btn:hover    { border-color:rgba(0,212,255,.4); color:#00d4ff; box-shadow:0 0 8px rgba(0,212,255,.2); }
  .sl-ai-inline-btn:disabled { opacity:.3; cursor:not-allowed; }

  .sl-ai-input-area { padding:14px 0 20px; border-top:1px solid rgba(0,212,255,.08); flex-shrink:0; position:relative; }
  .sl-ai-input-area::before { content:""; position:absolute; top:0; left:0; right:0; height:1px; background:linear-gradient(90deg,transparent,rgba(0,212,255,.4),transparent); }
  .sl-ai-input-wrap {
    display:flex; gap:10px; align-items:flex-end;
    background:rgba(0,212,255,.03); border:1px solid rgba(0,212,255,.15);
    padding:12px 14px; transition:border-color .2s;
    clip-path:polygon(0 0,calc(100% - 10px) 0,100% 10px,100% 100%,10px 100%,0 calc(100% - 10px));
  }
  .sl-ai-input-wrap:focus-within { border-color:rgba(0,212,255,.4); box-shadow:0 0 20px rgba(0,212,255,.08); }
  .sl-ai-textarea {
    flex:1; background:none; border:none; outline:none; resize:none;
    font-family:'Share Tech Mono',monospace; font-size:12px; color:#a8d4e6;
    line-height:1.6; max-height:120px; min-height:20px; letter-spacing:.3px;
  }
  .sl-ai-textarea::placeholder { color:rgba(0,212,255,.2); }
  .sl-ai-send {
    width:34px; height:34px; flex-shrink:0; align-self:flex-end;
    background:rgba(0,212,255,.1); border:1px solid rgba(0,212,255,.3);
    color:#00d4ff; cursor:pointer; display:flex; align-items:center;
    justify-content:center; font-size:14px; transition:all .2s;
    clip-path:polygon(4px 0,100% 0,100% calc(100% - 4px),calc(100% - 4px) 100%,0 100%,0 4px);
  }
  .sl-ai-send:hover    { background:rgba(0,212,255,.2); box-shadow:0 0 16px rgba(0,212,255,.3); }
  .sl-ai-send:disabled { opacity:.25; cursor:not-allowed; }
  .sl-ai-hint { font-size:8px; color:rgba(0,212,255,.15); margin-top:6px; text-align:center; letter-spacing:1px; }

  .sl-ai-response .sl-ai-h1 { font-family:'Orbitron',sans-serif; font-size:13px; font-weight:700; color:#00d4ff; margin:12px 0 6px; letter-spacing:2px; text-shadow:0 0 8px rgba(0,212,255,.4); }
  .sl-ai-response .sl-ai-h2 { font-size:11px; font-weight:700; color:#a8d4e6; margin:10px 0 5px; letter-spacing:1px; }
  .sl-ai-response .sl-ai-h3 { font-size:11px; color:rgba(168,212,230,.7); margin:8px 0 4px; }
  .sl-ai-response .sl-ai-bullet { padding-left:16px; position:relative; margin:3px 0; }
  .sl-ai-response .sl-ai-bullet::before { content:"▸"; position:absolute; left:2px; color:#00d4ff; font-size:9px; }
  .sl-ai-response .sl-ai-numbered { padding-left:18px; margin:3px 0; color:rgba(168,212,230,.6); }
  .sl-ai-response .sl-ai-spacer { height:8px; }
  .sl-ai-response strong { color:#00d4ff; font-weight:700; text-shadow:0 0 6px rgba(0,212,255,.4); }
  .sl-ai-response em { color:rgba(168,212,230,.6); font-style:normal; }

  /* conversation list screen */
  .sl-ai-conv-list { flex:1; overflow-y:auto; padding:24px 0 20px; min-height:0; display:flex; flex-direction:column; gap:10px; }
  .sl-ai-conv-card {
    display:flex; align-items:center; justify-content:space-between; gap:16px;
    padding:16px 18px; cursor:pointer; text-align:left; width:100%;
    background:rgba(0,10,30,.75); border:1px solid rgba(0,212,255,.12);
    transition:all .2s; position:relative;
    clip-path:polygon(0 0,calc(100% - 10px) 0,100% 10px,100% 100%,10px 100%,0 calc(100% - 10px));
  }
  .sl-ai-conv-card::before { content:""; position:absolute; top:0; left:0; right:0; height:1px; background:linear-gradient(90deg,transparent,rgba(0,212,255,.4),transparent); opacity:.5; }
  .sl-ai-conv-card:hover { transform:translateX(3px); border-color:rgba(0,212,255,.35); box-shadow:0 6px 20px rgba(0,212,255,.1); }
  .sl-ai-conv-card:hover::before { opacity:1; }
  .sl-ai-conv-main { min-width:0; flex:1; }
  .sl-ai-conv-title { font-family:'Orbitron',sans-serif; font-size:11px; font-weight:700; color:#00d4ff; letter-spacing:1px; margin-bottom:6px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
  .sl-ai-conv-preview { font-size:10px; color:rgba(168,212,230,.5); letter-spacing:.3px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
  .sl-ai-conv-meta { display:flex; flex-direction:column; align-items:flex-end; gap:4px; flex-shrink:0; }
  .sl-ai-conv-count { font-size:8px; color:rgba(0,212,255,.4); letter-spacing:1px; }
  .sl-ai-conv-time { font-size:8px; color:rgba(0,212,255,.25); letter-spacing:1px; }
  .sl-ai-new-btn {
    display:flex; align-items:center; justify-content:center; gap:8px;
    padding:12px 20px; width:100%; margin-top:22px;
    background:rgba(0,255,136,.05); border:1px solid rgba(0,255,136,.25);
    color:rgba(0,255,136,.7); font-family:'Orbitron',sans-serif; font-size:10px;
    font-weight:700; letter-spacing:2px; cursor:pointer; transition:all .2s;
    clip-path:polygon(8px 0,100% 0,100% calc(100% - 8px),calc(100% - 8px) 100%,0 100%,0 8px);
  }
  .sl-ai-new-btn:hover    { background:rgba(0,255,136,.1); border-color:rgba(0,255,136,.5); color:#00ff88; box-shadow:0 0 20px rgba(0,255,136,.2); }
  .sl-ai-new-btn:disabled { opacity:.35; cursor:not-allowed; }
  .sl-ai-new-btn-top { max-width:620px; margin:0 auto 4px; }

  .sl-ai-corner { position:fixed; width:40px; height:40px; pointer-events:none; z-index:1; opacity:.25; }
  .sl-ai-corner-tl { top:0; left:0; border-top:2px solid #00d4ff; border-left:2px solid #00d4ff; }
  .sl-ai-corner-tr { top:0; right:0; border-top:2px solid #00d4ff; border-right:2px solid #00d4ff; }
  .sl-ai-corner-bl { bottom:0; left:0; border-bottom:2px solid #00d4ff; border-left:2px solid #00d4ff; }
  .sl-ai-corner-br { bottom:0; right:0; border-bottom:2px solid #00d4ff; border-right:2px solid #00d4ff; }
`;

/* ------------------------------------------------------------------ */
/*  Shared components                                                   */
/* ------------------------------------------------------------------ */

export function CornerHUD() {
  return (
    <>
      <div className="sl-ai-corner sl-ai-corner-tl" />
      <div className="sl-ai-corner sl-ai-corner-tr" />
      <div className="sl-ai-corner sl-ai-corner-bl" />
      <div className="sl-ai-corner sl-ai-corner-br" />
    </>
  );
}

export function TypingIndicator() {
  return (
    <div style={{ display: "flex", gap: 6, alignItems: "center", padding: "4px 0" }}>
      {[0, 1, 2].map(i => (
        <div key={i} style={{
          width: 5, height: 5,
          background: "#00d4ff",
          boxShadow: "0 0 6px rgba(0,212,255,.8)",
          animation: `sl_ai_pulse 1.2s ease-in-out ${i * 0.25}s infinite`,
          clipPath: "polygon(50% 0%,100% 50%,50% 100%,0% 50%)",
        }} />
      ))}
    </div>
  );
}

export function MessageBubble({ msg }: { msg: ChatMessage }) {
  const isUser = msg.role === "user";
  const time = msg.created_at ? new Date(msg.created_at) : new Date();
  return (
    <div style={{
      display: "flex",
      justifyContent: isUser ? "flex-end" : "flex-start",
      marginBottom: 16,
      animation: "sl_ai_msg .3s cubic-bezier(.22,1,.36,1)",
    }}>
      {!isUser && (
        <div style={{
          width: 30, height: 30, flexShrink: 0, marginRight: 10, marginTop: 2,
          background: "rgba(0,212,255,.08)", border: "1px solid rgba(0,212,255,.3)",
          clipPath: "polygon(50% 0%,100% 25%,100% 75%,50% 100%,0% 75%,0% 25%)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 12, color: "#00d4ff", boxShadow: "0 0 10px rgba(0,212,255,.3)",
        }}>✦</div>
      )}
      <div style={{
        maxWidth: "76%", position: "relative",
        background: isUser ? "rgba(0,212,255,.06)" : "rgba(0,10,30,.9)",
        border: isUser ? "1px solid rgba(0,212,255,.25)" : `1px solid ${msg.error ? "rgba(255,80,80,.3)" : "rgba(0,212,255,.1)"}`,
        padding: "12px 16px",
        clipPath: isUser
          ? "polygon(0 0,100% 0,100% calc(100% - 8px),calc(100% - 8px) 100%,0 100%)"
          : "polygon(8px 0,100% 0,100% 100%,0 100%,0 8px)",
      }}>
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, height: 1,
          background: isUser
            ? "linear-gradient(90deg,transparent,rgba(0,212,255,.6),transparent)"
            : "linear-gradient(90deg,rgba(0,212,255,.3),transparent)",
        }} />

        {msg.loading ? <TypingIndicator /> : isUser ? (
          <span style={{ fontSize: 12, color: "#a8d4e6", lineHeight: 1.7, fontFamily: "'Share Tech Mono',monospace", letterSpacing: .3 }}>{msg.content}</span>
        ) : (
          <div className="sl-ai-response" style={{ fontSize: 12, color: msg.error ? "rgba(255,120,120,.85)" : "rgba(168,212,230,.8)", lineHeight: 1.8, fontFamily: "'Share Tech Mono',monospace" }}
            dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.content) }} />
        )}

        {!msg.loading && (
          <div style={{ fontSize: 8, color: "rgba(0,212,255,.25)", marginTop: 8, textAlign: isUser ? "right" : "left", fontFamily: "'Share Tech Mono',monospace", letterSpacing: 1 }}>
            {time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </div>
        )}
      </div>
    </div>
  );
}

export function DomainSelector({ domains, onSelect, onClose }: { domains: Domain[]; onSelect: (d: Domain) => void; onClose: () => void }) {
  return (
    <div style={{
      position: "absolute", bottom: "calc(100% + 10px)", left: 0, right: 0, zIndex: 20,
      background: "linear-gradient(135deg,rgba(0,10,30,.99),rgba(0,20,50,.97))",
      border: "1px solid rgba(0,212,255,.2)",
      padding: 14, animation: "sl_ai_pop .2s cubic-bezier(.22,1,.36,1)",
      boxShadow: "0 -20px 40px rgba(0,0,0,.6), 0 0 30px rgba(0,212,255,.08)",
      clipPath: "polygon(0 0,calc(100% - 12px) 0,100% 12px,100% 100%,12px 100%,0 calc(100% - 12px))",
    }}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: "linear-gradient(90deg,transparent,rgba(0,212,255,.6),transparent)" }} />
      <div style={{ fontSize: 8, color: "rgba(0,212,255,.5)", letterSpacing: 2, fontFamily: "'Orbitron',sans-serif", marginBottom: 10 }}>◈ SELECT DOMAIN FOR DEEP DIVE</div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        {domains.map(d => (
          <button key={d.id} onClick={() => onSelect(d)} style={{
            padding: "6px 12px", background: "rgba(0,212,255,.04)", border: "1px solid rgba(0,212,255,.15)",
            color: "rgba(0,212,255,.5)", fontFamily: "'Share Tech Mono',monospace", fontSize: 10, letterSpacing: .5,
            cursor: "pointer", transition: "all .15s",
            clipPath: "polygon(4px 0,100% 0,100% calc(100% - 4px),calc(100% - 4px) 100%,0 100%,0 4px)",
          }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(0,212,255,.5)"; (e.currentTarget as HTMLButtonElement).style.color = "#00d4ff"; (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 0 8px rgba(0,212,255,.3)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(0,212,255,.15)"; (e.currentTarget as HTMLButtonElement).style.color = "rgba(0,212,255,.5)"; (e.currentTarget as HTMLButtonElement).style.boxShadow = "none"; }}>
            {d.name.toUpperCase()}
          </button>
        ))}
      </div>
      <button onClick={onClose} style={{ marginTop: 10, fontSize: 9, color: "rgba(0,212,255,.3)", background: "none", border: "none", cursor: "pointer", fontFamily: "'Share Tech Mono',monospace", letterSpacing: 1 }}>[ CLOSE ]</button>
    </div>
  );
}

/* Small helper for the conversations list: "3m ago", "2h ago", "5d ago" */
export function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "NOW";
  if (mins < 60) return `${mins}M AGO`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}H AGO`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}D AGO`;
  return new Date(iso).toLocaleDateString();
}