import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import type { ConversationSummary } from "./aiShared";
import { HUD_STYLES, CornerHUD, timeAgo } from "./aiShared";

const HOLD_MS = 550;

async function fetchConversations(): Promise<ConversationSummary[]> {
  const res = await api.get("/conversation/");
  return res.data.results ?? res.data;
}

async function createConversation(): Promise<ConversationSummary> {
  const res = await api.post("/conversation/", {});
  return res.data;
}

async function deleteConversation(id: number): Promise<void> {
  await api.delete(`/conversation/${id}/`);
}

/* ── delete confirm modal — same visual language as Dashboard's ConfirmDeleteModal ── */
function ConfirmDeleteConversationModal({
  title, deleting, error, onConfirm, onClose,
}: {
  title: string;
  deleting: boolean;
  error: string | null;
  onConfirm: () => void;
  onClose: () => void;
}) {
  return (
    <div onClick={e => e.target === e.currentTarget && !deleting && onClose()} style={{
      position: "fixed", inset: 0, zIndex: 1200,
      background: "rgba(0,5,20,.95)", backdropFilter: "blur(12px)",
      display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
      animation: "sl_ai_pop .2s cubic-bezier(.22,1,.36,1)",
    }}>
      <div style={{
        width: "100%", maxWidth: 380,
        background: "linear-gradient(135deg,rgba(30,0,0,.98),rgba(20,0,0,.95))",
        border: "1px solid rgba(255,50,80,.3)",
        boxShadow: "0 0 60px rgba(255,0,60,.15)",
        clipPath: "polygon(0 0,calc(100% - 16px) 0,100% 16px,100% 100%,16px 100%,0 calc(100% - 16px))",
        overflow: "hidden",
      }}>
        <div style={{ height: 2, background: "linear-gradient(90deg,transparent,#ff3050,transparent)" }} />
        <div style={{ padding: 28 }}>
          <div style={{ fontSize: 9, color: "rgba(255,50,80,.6)", letterSpacing: 3, fontFamily: "'Share Tech Mono',monospace", marginBottom: 16 }}>
            ▸ SYSTEM WARNING / IRREVERSIBLE ACTION
          </div>
          <div style={{ fontSize: 16, fontWeight: 700, color: "#ff3050", letterSpacing: 2, fontFamily: "'Orbitron',sans-serif", marginBottom: 12, textShadow: "0 0 20px rgba(255,50,80,.5)" }}>
            DELETE CONVERSATION?
          </div>
          <div style={{ fontSize: 12, color: "rgba(255,100,120,.6)", marginBottom: 24, fontFamily: "'Share Tech Mono',monospace", lineHeight: 1.7, letterSpacing: .5 }}>
            CONVERSATION <span style={{ color: "#ff3050" }}>"{title}"</span> AND ALL ITS MESSAGES WILL BE PERMANENTLY ERASED FROM THE SYSTEM.
          </div>

          {error && (
            <div style={{ background: "rgba(255,0,60,.08)", border: "1px solid rgba(255,0,60,.3)", padding: "10px 14px", fontSize: 11, color: "#ff4466", marginBottom: 16, fontFamily: "'Share Tech Mono',monospace", letterSpacing: .5 }}>
              {error}
            </div>
          )}

          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={onClose} disabled={deleting} style={{
              flex: 1, padding: 10, background: "transparent",
              border: "1px solid rgba(255,255,255,.1)", color: "rgba(255,255,255,.3)",
              fontFamily: "'Share Tech Mono',monospace", fontSize: 11, letterSpacing: 1,
              cursor: deleting ? "not-allowed" : "pointer", transition: "all .15s", opacity: deleting ? .4 : 1,
            }}
              onMouseEnter={e => { if (!deleting) { (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,255,255,.3)"; (e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,.6)"; } }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,255,255,.1)"; (e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,.3)"; }}>
              [ ABORT ]
            </button>
            <button onClick={onConfirm} disabled={deleting} style={{
              flex: 1, padding: 10, background: "rgba(255,50,80,.1)",
              border: "1px solid rgba(255,50,80,.4)", color: "#ff3050",
              fontFamily: "'Share Tech Mono',monospace", fontSize: 11, letterSpacing: 1,
              cursor: deleting ? "not-allowed" : "pointer", transition: "all .15s", opacity: deleting ? .6 : 1,
              clipPath: "polygon(4px 0,100% 0,100% calc(100% - 4px),calc(100% - 4px) 100%,0 100%,0 4px)",
            }}
              onMouseEnter={e => { if (!deleting) { (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,50,80,.2)"; (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 0 16px rgba(255,50,80,.3)"; } }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,50,80,.1)"; (e.currentTarget as HTMLButtonElement).style.boxShadow = "none"; }}>
              {deleting ? "[ DELETING... ]" : "[ CONFIRM DELETE ]"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AIConversations() {
  const navigate = useNavigate();
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ── long-press-to-delete state ──────────────────────────────────────────
  const [pressingId, setPressingId] = useState<number | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ConversationSummary | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const holdTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const suppressClickRef = useRef(false);

  useEffect(() => {
    let cancelled = false;
    fetchConversations()
      .then(data => { if (!cancelled) setConversations(data); })
      .catch(() => { if (!cancelled) setError("FAILED TO LOAD CONVERSATIONS"); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const clearHoldTimer = () => {
    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }
    setPressingId(null);
  };

  const startHold = (conv: ConversationSummary) => {
    setPressingId(conv.id);
    holdTimerRef.current = setTimeout(() => {
      suppressClickRef.current = true;
      setDeleteTarget(conv);
      setDeleteError(null);
      setPressingId(null);
      holdTimerRef.current = null;
    }, HOLD_MS);
  };

  const handleCardClick = (conv: ConversationSummary) => {
    if (suppressClickRef.current) {
      suppressClickRef.current = false;
      return;
    }
    navigate(`/ai/conversations/${conv.id}`);
  };

  const handleCreate = async () => {
    if (creating) return;
    setCreating(true);
    setError(null);
    try {
      const conv = await createConversation();
      navigate(`/ai/conversations/${conv.id}`);
    } catch {
      setError("COULD NOT START A NEW CONVERSATION");
      setCreating(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      await deleteConversation(deleteTarget.id);
      setConversations(prev => prev.filter(c => c.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch {
      setDeleteError("[ ERROR ] COULD NOT DELETE CONVERSATION");
    } finally {
      setDeleting(false);
    }
  };

  const isEmpty = !loading && conversations.length === 0;

  return (
    <>
      <style>{HUD_STYLES}</style>
      {/* local styles for the long-press hold indicator */}
      <style>{`
        @keyframes sl_ai_hold_fill { from { width: 0%; } to { width: 100%; } }
        .sl-ai-conv-card { user-select: none; -webkit-touch-callout: none; }
        .sl-ai-hold-bar {
          position: absolute; left: 0; bottom: 0; height: 3px;
          background: linear-gradient(90deg, #ff3050, #ff6688);
          box-shadow: 0 0 8px rgba(255,50,80,.6);
          animation: sl_ai_hold_fill ${HOLD_MS}ms linear forwards;
        }
      `}</style>
      <CornerHUD />

      <div className="sl-ai-root">
        <header className="sl-ai-header">
          <div className="sl-ai-header-left">
            <div className="sl-ai-avatar">✦</div>
            <div style={{ minWidth: 0 }}>
              <div className="sl-ai-title">A.I. SYSTEM</div>
              <div className="sl-ai-sub">▸ DEEPSEEK NEURAL INTERFACE · LIFE OS v2.0</div>
            </div>
          </div>
          <button className="sl-ai-back" onClick={() => navigate("/dashboard")}>
            ◁ DASHBOARD
          </button>
        </header>

        <div className="sl-ai-body">
          {loading ? (
            <div className="sl-ai-empty">
              <div className="sl-ai-empty-icon">✦</div>
              <div className="sl-ai-empty-title">LOADING</div>
              <div className="sl-ai-empty-sub">RETRIEVING CONVERSATION LOG...</div>
            </div>
          ) : isEmpty ? (
            <div className="sl-ai-empty">
              <div className="sl-ai-empty-icon">✦</div>
              <div className="sl-ai-empty-title">SYSTEM READY</div>
              <div className="sl-ai-empty-sub">
                NO CONVERSATIONS YET — START ONE TO QUERY YOUR LIFE DATA
              </div>
              <button className="sl-ai-new-btn" style={{ maxWidth: 320, marginTop: 28 }} disabled={creating} onClick={handleCreate}>
                {creating ? "STARTING..." : "+ NEW CONVERSATION"}
              </button>
              {error && (
                <div style={{ marginTop: 14, fontSize: 9, color: "rgba(255,120,120,.7)", letterSpacing: 1 }}>{error}</div>
              )}
            </div>
          ) : (
            <>
              <button className="sl-ai-new-btn sl-ai-new-btn-top" style={{ marginTop: 20 }} disabled={creating} onClick={handleCreate}>
                {creating ? "STARTING..." : "+ NEW CONVERSATION"}
              </button>
              {error && (
                <div style={{ margin: "10px auto 0", maxWidth: 620, fontSize: 9, color: "rgba(255,120,120,.7)", letterSpacing: 1, textAlign: "center" }}>{error}</div>
              )}

              <div style={{ maxWidth: 620, margin: "6px auto 0", fontSize: 8, color: "rgba(0,212,255,.25)", letterSpacing: 1, textAlign: "center" }}>
                ▸ HOLD A CONVERSATION TO DELETE IT
              </div>

              <div className="sl-ai-conv-list">
                {conversations.map(conv => (
                  <button
                    key={conv.id}
                    className="sl-ai-conv-card"
                    style={pressingId === conv.id ? { borderColor: "rgba(255,50,80,.4)" } : undefined}
                    onClick={() => handleCardClick(conv)}
                    onPointerDown={() => startHold(conv)}
                    onPointerUp={clearHoldTimer}
                    onPointerLeave={clearHoldTimer}
                    onPointerCancel={clearHoldTimer}
                    onContextMenu={e => e.preventDefault()}
                  >
                    <div className="sl-ai-conv-main">
                      <div className="sl-ai-conv-title">
                        {(conv.title || "UNTITLED CONVERSATION").toUpperCase()}
                      </div>
                      <div className="sl-ai-conv-preview">
                        {conv.last_message
                          ? `${conv.last_message.role === "user" ? "YOU: " : "AI: "}${conv.last_message.content}`
                          : "NO MESSAGES YET"}
                      </div>
                    </div>
                    <div className="sl-ai-conv-meta">
                      <div className="sl-ai-conv-count">{conv.message_count} MSG</div>
                      <div className="sl-ai-conv-time">{timeAgo(conv.updated_at)}</div>
                    </div>
                    {pressingId === conv.id && <div className="sl-ai-hold-bar" />}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {deleteTarget && (
        <ConfirmDeleteConversationModal
          title={deleteTarget.title || "UNTITLED CONVERSATION"}
          deleting={deleting}
          error={deleteError}
          onConfirm={handleDeleteConfirm}
          onClose={() => { if (!deleting) { setDeleteTarget(null); setDeleteError(null); } }}
        />
      )}
    </>
  );
}