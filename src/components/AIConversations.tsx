import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import type { ConversationSummary } from "./aiShared";
import { HUD_STYLES, CornerHUD, timeAgo } from "./aiShared";

async function fetchConversations(): Promise<ConversationSummary[]> {
  const res = await api.get("/ai/conversation/");
  return res.data.results ?? res.data;
}

async function createConversation(): Promise<ConversationSummary> {
  const res = await api.post("/ai/conversation/", {});
  return res.data;
}

export default function AIConversations() {
  const navigate = useNavigate();
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchConversations()
      .then(data => { if (!cancelled) setConversations(data); })
      .catch(() => { if (!cancelled) setError("FAILED TO LOAD CONVERSATIONS"); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

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

  const isEmpty = !loading && conversations.length === 0;

  return (
    <>
      <style>{HUD_STYLES}</style>
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
          <button className="sl-ai-back" onClick={() => window.history.back()}>
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

              <div className="sl-ai-conv-list">
                {conversations.map(conv => (
                  <button
                    key={conv.id}
                    className="sl-ai-conv-card"
                    onClick={() => navigate(`/ai/conversations/${conv.id}`)}
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
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}