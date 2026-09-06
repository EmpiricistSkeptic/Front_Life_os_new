import React, { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/api";
import {
  ChatMessage,
  Domain,
  ReportType,
  ConversationSummary,
  QUICK_ACTIONS,
  HUD_STYLES,
  CornerHUD,
  MessageBubble,
  DomainSelector,
} from "./aiShared";

async function fetchConversation(id: string): Promise<ConversationSummary> {
  const res = await api.get(`/ai/conversation/${id}/`);
  return res.data;
}

async function fetchConversationMessages(id: string): Promise<ChatMessage[]> {
  const res = await api.get(`/ai/conversation/${id}/messages/`);
  const data: ChatMessage[] = res.data.results ?? res.data;
  return [...data].sort(
    (a, b) => new Date(a.created_at ?? 0).getTime() - new Date(b.created_at ?? 0).getTime()
  );
}

async function sendConversationMessage(
  id: string,
  content: string,
  report_type: ReportType,
  payload: Record<string, any> = {}
): Promise<{ user_message: ChatMessage; ai_message: ChatMessage }> {
  const res = await api.post(`/ai/conversation/${id}/send_message/`, {
    content,
    report_type,
    payload,
  });
  return res.data;
}

async function fetchUserDomains(): Promise<Domain[]> {
  const res = await api.get("/domain/");
  return res.data.results ?? res.data;
}

export default function AIConversation() {
  const { id: conversationId } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [conversation, setConversation]   = useState<ConversationSummary | null>(null);
  const [messages, setMessages]           = useState<ChatMessage[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [input, setInput]                 = useState("");
  const [sending, setSending]             = useState(false);
  const [domains, setDomains]             = useState<Domain[]>([]);
  const [showDomains, setShowDomains]     = useState(false);
  const scrollRef                         = useRef<HTMLDivElement>(null);
  const inputRef                          = useRef<HTMLTextAreaElement>(null);

  useEffect(() => { fetchUserDomains().then(setDomains).catch(console.error); }, []);

  useEffect(() => {
    if (!conversationId) return;
    let cancelled = false;
    setInitialLoading(true);
    Promise.all([
      fetchConversation(conversationId),
      fetchConversationMessages(conversationId),
    ])
      .then(([conv, msgs]) => {
        if (cancelled) return;
        setConversation(conv);
        setMessages(msgs);
      })
      .catch(console.error)
      .finally(() => { if (!cancelled) setInitialLoading(false); });
    return () => { cancelled = true; };
  }, [conversationId]);

  useEffect(() => { if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight; }, [messages]);

  const runReport = useCallback(async (
    userLabel: string,
    type: ReportType,
    payload: Record<string, any> = {}
  ) => {
    if (sending || !conversationId) return;
    setSending(true);

    const optimisticUserId = `local-user-${Date.now()}`;
    const optimisticAiId = `local-ai-${Date.now()}`;
    const now = new Date().toISOString();

    setMessages(prev => [
      ...prev,
      { id: optimisticUserId, role: "user", content: userLabel, created_at: now },
      { id: optimisticAiId, role: "assistant", content: "", created_at: now, loading: true },
    ]);

    try {
      const { user_message, ai_message } = await sendConversationMessage(conversationId, userLabel, type, payload);
      setMessages(prev => prev.map(m => {
        if (m.id === optimisticUserId) return user_message;
        if (m.id === optimisticAiId) return ai_message;
        return m;
      }));
      // title gets set server-side on first message — refresh it quietly
      if (conversation && !conversation.title) {
        fetchConversation(conversationId).then(setConversation).catch(() => {});
      }
    } catch (e: any) {
      const errorText = e?.response?.data?.error ?? e?.message ?? "CONNECTION FAILED";
      setMessages(prev => prev.map(m =>
        m.id === optimisticAiId
          ? { ...m, content: `[ SYSTEM ERROR ] ${errorText}`, loading: false, error: true }
          : m
      ));
    } finally {
      setSending(false);
    }
  }, [sending, conversationId, conversation]);

  const handleQuickAction = (action: typeof QUICK_ACTIONS[number]) => {
    const labels: Record<string, string> = {
      weekly_comparison:  "ANALYZE THIS WEEK VS LAST WEEK",
      monthly_comparison: "ANALYZE THIS MONTH VS LAST MONTH",
      correlations:       "ANALYZE CROSS-DOMAIN CORRELATIONS",
    };
    runReport(labels[action.id] ?? `${action.icon} ${action.label} REPORT`, action.type, action.payload);
  };

  const handleDomainSelect = (domain: Domain) => {
    setShowDomains(false);
    runReport(`DEEP DIVE: ${domain.name.toUpperCase()}`, "domain", { domain_id: domain.id, period: "weekly" });
  };

  const handleSend = () => {
    const q = input.trim();
    if (!q || sending) return;
    setInput("");
    runReport(q, "free", { question: q });
  };

  const isEmpty = !initialLoading && messages.length === 0;

  return (
    <>
      <style>{HUD_STYLES}</style>
      <CornerHUD />

      <div className="sl-ai-root">
        <header className="sl-ai-header">
          <div className="sl-ai-header-left">
            <div className="sl-ai-avatar">✦</div>
            <div style={{ minWidth: 0 }}>
              <div className="sl-ai-title">
                {conversation?.title ? conversation.title.toUpperCase() : "NEW CONVERSATION"}
              </div>
              <div className="sl-ai-sub">▸ DEEPSEEK NEURAL INTERFACE · LIFE OS v2.0</div>
            </div>
          </div>
          <button className="sl-ai-back" onClick={() => navigate("/ai/conversations")}>
            ◁ CONVERSATIONS
          </button>
        </header>

        <div className="sl-ai-body">
          {initialLoading ? (
            <div className="sl-ai-empty">
              <div className="sl-ai-empty-icon">✦</div>
              <div className="sl-ai-empty-title">CONNECTING</div>
              <div className="sl-ai-empty-sub">LOADING CONVERSATION HISTORY...</div>
            </div>
          ) : isEmpty ? (
            <div className="sl-ai-empty">
              <div className="sl-ai-empty-icon">✦</div>
              <div className="sl-ai-empty-title">SYSTEM READY</div>
              <div className="sl-ai-empty-sub">
                NEURAL INTERFACE ACTIVE — QUERY YOUR LIFE DATA OR SELECT A QUICK ANALYSIS MODULE BELOW
              </div>

              <div className="sl-ai-quick">
                {QUICK_ACTIONS.map(action => (
                  <button key={action.id} className="sl-ai-quick-btn" disabled={sending}
                    style={{
                      "--btn-color": action.color,
                      "--btn-glow": action.glow,
                      border: `1px solid ${action.border}`,
                    } as React.CSSProperties}
                    onClick={() => handleQuickAction(action)}>
                    <span className="sl-ai-quick-icon">{action.icon}</span>
                    <span className="sl-ai-quick-label">{action.label}</span>
                    <span className="sl-ai-quick-desc">{action.desc}</span>
                  </button>
                ))}
              </div>

              <div style={{ position: "relative" }}>
                <button className="sl-ai-dive-btn" onClick={() => setShowDomains(v => !v)}>
                  ◈ DOMAIN DEEP DIVE
                  <span style={{ fontSize: 9, color: "rgba(255,204,0,.4)", marginLeft: 6 }}>▾</span>
                </button>
                {showDomains && domains.length > 0 && (
                  <DomainSelector domains={domains} onSelect={handleDomainSelect} onClose={() => setShowDomains(false)} />
                )}
              </div>
            </div>
          ) : (
            <>
              <div className="sl-ai-messages" ref={scrollRef}>
                {messages.map(msg => <MessageBubble key={msg.id} msg={msg} />)}
              </div>

              {!sending && (
                <div className="sl-ai-inline">
                  {QUICK_ACTIONS.slice(0, 4).map(action => (
                    <button key={action.id} className="sl-ai-inline-btn" disabled={sending} onClick={() => handleQuickAction(action)}>
                      {action.icon} {action.label}
                    </button>
                  ))}
                  <button className="sl-ai-inline-btn" disabled={sending}
                    onClick={() => setShowDomains(v => !v)}
                    style={{ position: "relative" }}>
                    ◈ DEEP DIVE
                    {showDomains && domains.length > 0 && (
                      <DomainSelector domains={domains} onSelect={handleDomainSelect} onClose={() => setShowDomains(false)} />
                    )}
                  </button>
                </div>
              )}
            </>
          )}

          <div className="sl-ai-input-area">
            <div className="sl-ai-input-wrap">
              <textarea ref={inputRef} className="sl-ai-textarea"
                placeholder="ENTER QUERY FOR NEURAL PROCESSING..."
                value={input} rows={1} disabled={sending}
                onChange={e => {
                  setInput(e.target.value);
                  e.target.style.height = "auto";
                  e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
                }}
                onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
              />
              <button className="sl-ai-send" disabled={sending || !input.trim()} onClick={handleSend}>
                {sending
                  ? <div style={{ width: 12, height: 12, border: "2px solid rgba(0,212,255,.2)", borderTopColor: "#00d4ff", clipPath: "polygon(50% 0%,100% 25%,100% 75%,50% 100%,0% 75%,0% 25%)", animation: "sl_ai_spin .8s linear infinite" }} />
                  : "▸"}
              </button>
            </div>
            <div className="sl-ai-hint">ENTER TO TRANSMIT · SHIFT+ENTER FOR NEW LINE</div>
          </div>
        </div>
      </div>
    </>
  );
}