// src/components/Login.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../services/auth";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState<string | null>(null);
  const [loading, setLoading]   = useState(false);
  const navigate = useNavigate();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login({ username, password });
      navigate("/dashboard");
    } catch (err: any) {
      setError(err?.response?.data || err?.message || "AUTH FAILURE");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;600;700;900&family=Share+Tech+Mono&display=swap');
        @keyframes sl_lg_fi    { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:none} }
        @keyframes sl_lg_spin  { to{transform:rotate(360deg)} }
        @keyframes sl_lg_shake { 0%,100%{transform:translateX(0)} 20%,60%{transform:translateX(-6px)} 40%,80%{transform:translateX(6px)} }
        @keyframes sl_lg_scan  { 0%{transform:translateY(-100%)} 100%{transform:translateY(100vh)} }
        @keyframes sl_lg_pulse { 0%,100%{opacity:.3} 50%{opacity:1} }
        @keyframes sl_lg_glow  { 0%,100%{box-shadow:0 0 20px rgba(0,212,255,.2)} 50%{box-shadow:0 0 40px rgba(0,212,255,.5),0 0 80px rgba(0,212,255,.2)} }

        *,*::before,*::after { box-sizing:border-box; margin:0; padding:0; }
        html,body,#root { width:100%; min-height:100vh; background:#03060f; }

        .sl-lg-root {
          width:100%; min-height:100vh; background:#03060f;
          display:flex; align-items:center; justify-content:center;
          padding:24px; position:relative; overflow:hidden;
          font-family:'Share Tech Mono',monospace;
        }

        /* grid */
        .sl-lg-root::before {
          content:""; position:fixed; inset:0; pointer-events:none;
          background-image:
            linear-gradient(rgba(0,212,255,.025) 1px,transparent 1px),
            linear-gradient(90deg,rgba(0,212,255,.025) 1px,transparent 1px);
          background-size:40px 40px;
        }
        /* scan line */
        .sl-lg-root::after {
          content:""; position:fixed; left:0; right:0; height:100px; pointer-events:none;
          background:linear-gradient(transparent,rgba(0,212,255,.04),transparent);
          animation:sl_lg_scan 8s linear infinite;
        }

        /* corner decorations */
        .sl-lg-corner { position:fixed; width:50px; height:50px; pointer-events:none; z-index:1; }
        .sl-lg-corner-tl { top:0; left:0; border-top:2px solid rgba(0,212,255,.3); border-left:2px solid rgba(0,212,255,.3); }
        .sl-lg-corner-tr { top:0; right:0; border-top:2px solid rgba(0,212,255,.3); border-right:2px solid rgba(0,212,255,.3); }
        .sl-lg-corner-bl { bottom:0; left:0; border-bottom:2px solid rgba(0,212,255,.3); border-left:2px solid rgba(0,212,255,.3); }
        .sl-lg-corner-br { bottom:0; right:0; border-bottom:2px solid rgba(0,212,255,.3); border-right:2px solid rgba(0,212,255,.3); }

        /* glow orbs */
        .sl-lg-orb1 {
          position:absolute; width:500px; height:500px; border-radius:50%;
          background:radial-gradient(circle,rgba(0,212,255,.06) 0%,transparent 70%);
          top:-150px; left:-150px; pointer-events:none;
        }
        .sl-lg-orb2 {
          position:absolute; width:400px; height:400px; border-radius:50%;
          background:radial-gradient(circle,rgba(191,127,255,.05) 0%,transparent 70%);
          bottom:-100px; right:-100px; pointer-events:none;
        }

        .sl-lg-card {
          width:100%; max-width:440px; position:relative; z-index:2;
          background:linear-gradient(135deg,rgba(0,10,30,.98),rgba(0,20,50,.95));
          border:1px solid rgba(0,212,255,.2);
          padding:0; overflow:hidden;
          clip-path:polygon(0 0,calc(100% - 24px) 0,100% 24px,100% 100%,24px 100%,0 calc(100% - 24px));
          box-shadow:0 0 60px rgba(0,212,255,.1), 0 40px 80px rgba(0,0,0,.7);
          animation:sl_lg_fi .4s cubic-bezier(.22,1,.36,1);
        }

        /* scanlines overlay */
        .sl-lg-card::before {
          content:""; position:absolute; inset:0; pointer-events:none; z-index:0;
          background:repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,212,255,.01) 2px,rgba(0,212,255,.01) 4px);
        }

        .sl-lg-top-bar {
          height:2px;
          background:linear-gradient(90deg,transparent,#00d4ff,transparent);
          animation:sl_lg_glow 3s ease-in-out infinite;
        }

        .sl-lg-inner { padding:36px 36px 32px; position:relative; z-index:1; }

        /* logo */
        .sl-lg-logo { display:flex; align-items:center; gap:14px; margin-bottom:32px; }
        .sl-lg-logo-hex {
          width:44px; height:44px;
          background:rgba(0,212,255,.08); border:1px solid rgba(0,212,255,.35);
          clip-path:polygon(50% 0%,100% 25%,100% 75%,50% 100%,0% 75%,0% 25%);
          display:flex; align-items:center; justify-content:center;
          font-size:18px; color:#00d4ff;
          box-shadow:0 0 20px rgba(0,212,255,.3);
          animation:sl_lg_glow 3s ease-in-out infinite;
        }
        .sl-lg-logo-text { display:flex; flex-direction:column; }
        .sl-lg-logo-title { font-family:'Orbitron',sans-serif; font-size:16px; font-weight:700; color:#00d4ff; letter-spacing:3px; text-shadow:0 0 12px rgba(0,212,255,.5); }
        .sl-lg-logo-sub   { font-size:8px; color:rgba(0,212,255,.4); letter-spacing:2px; margin-top:2px; }

        /* heading */
        .sl-lg-heading { font-family:'Orbitron',sans-serif; font-size:18px; font-weight:900; color:#00d4ff; letter-spacing:3px; margin-bottom:6px; text-shadow:0 0 16px rgba(0,212,255,.4); }
        .sl-lg-sub     { font-size:9px; color:rgba(0,212,255,.35); letter-spacing:2px; margin-bottom:32px; }

        /* fields */
        .sl-lg-field { margin-bottom:18px; }
        .sl-lg-label { display:block; font-size:8px; color:rgba(0,212,255,.5); letter-spacing:2px; text-transform:uppercase; margin-bottom:7px; }
        .sl-lg-input {
          width:100%; background:rgba(0,212,255,.03); border:1px solid rgba(0,212,255,.2);
          padding:11px 14px; font-size:12px; font-family:'Share Tech Mono',monospace;
          color:#a8d4e6; outline:none; letter-spacing:.5px;
          transition:all .2s; -webkit-appearance:none;
          clip-path:polygon(0 0,calc(100% - 8px) 0,100% 8px,100% 100%,8px 100%,0 calc(100% - 8px));
        }
        .sl-lg-input::placeholder { color:rgba(0,212,255,.2); }
        .sl-lg-input:focus {
          border-color:rgba(0,212,255,.5);
          box-shadow:0 0 16px rgba(0,212,255,.15);
          background:rgba(0,212,255,.06);
          color:#fff;
        }
        .sl-lg-input:disabled { opacity:.4; cursor:not-allowed; }
        .sl-lg-input:-webkit-autofill,
        .sl-lg-input:-webkit-autofill:focus {
          -webkit-box-shadow:0 0 0 100px #020810 inset;
          -webkit-text-fill-color:#a8d4e6;
          caret-color:#a8d4e6;
        }

        /* error */
        .sl-lg-error {
          display:flex; align-items:flex-start; gap:8px;
          background:rgba(255,51,102,.06); border:1px solid rgba(255,51,102,.25);
          padding:10px 14px; margin-bottom:16px;
          font-size:10px; color:rgba(255,100,130,.8); line-height:1.6;
          letter-spacing:.3px; animation:sl_lg_shake .35s ease;
          clip-path:polygon(0 0,calc(100% - 6px) 0,100% 6px,100% 100%,0 100%);
        }
        .sl-lg-error-label { font-family:'Orbitron',sans-serif; font-size:8px; color:#ff3366; letter-spacing:2px; margin-bottom:3px; }

        /* button */
        .sl-lg-btn {
          width:100%; padding:13px; margin-top:4px;
          background:transparent; border:1px solid rgba(0,212,255,.4);
          color:#00d4ff; font-family:'Orbitron',sans-serif; font-size:11px;
          font-weight:700; letter-spacing:3px; cursor:pointer; transition:all .2s;
          clip-path:polygon(8px 0,100% 0,100% calc(100% - 8px),calc(100% - 8px) 100%,0 100%,0 8px);
          display:flex; align-items:center; justify-content:center; gap:10px;
          position:relative; overflow:hidden;
        }
        .sl-lg-btn::before {
          content:""; position:absolute; inset:0;
          background:linear-gradient(135deg,rgba(0,212,255,.08),transparent);
          opacity:0; transition:opacity .2s;
        }
        .sl-lg-btn:hover:not(:disabled) { border-color:#00d4ff; box-shadow:0 0 24px rgba(0,212,255,.3),0 0 60px rgba(0,212,255,.1); color:#fff; }
        .sl-lg-btn:hover:not(:disabled)::before { opacity:1; }
        .sl-lg-btn:disabled { opacity:.3; cursor:not-allowed; }

        .sl-lg-spinner {
          width:14px; height:14px;
          border:2px solid rgba(0,212,255,.2); border-top-color:#00d4ff;
          clip-path:polygon(50% 0%,100% 25%,100% 75%,50% 100%,0% 75%,0% 25%);
          animation:sl_lg_spin .8s linear infinite;
        }

        .sl-lg-bottom-bar { height:1px; background:linear-gradient(90deg,transparent,rgba(0,212,255,.4),transparent); }
      `}</style>

      <div className="sl-lg-corner sl-lg-corner-tl" />
      <div className="sl-lg-corner sl-lg-corner-tr" />
      <div className="sl-lg-corner sl-lg-corner-bl" />
      <div className="sl-lg-corner sl-lg-corner-br" />

      <div className="sl-lg-root">
        <div className="sl-lg-orb1" />
        <div className="sl-lg-orb2" />

        <div className="sl-lg-card">
          <div className="sl-lg-top-bar" />
          <div className="sl-lg-inner">
            <div className="sl-lg-logo">
              <div className="sl-lg-logo-hex">◈</div>
              <div className="sl-lg-logo-text">
                <div className="sl-lg-logo-title">LIFE OS</div>
                <div className="sl-lg-logo-sub">▸ PLAYER STATUS SYSTEM v2.0</div>
              </div>
            </div>

            <div className="sl-lg-heading">AUTHENTICATION</div>
            <div className="sl-lg-sub">▸ ENTER CREDENTIALS TO ACCESS THE SYSTEM</div>

            <form onSubmit={submit}>
              <div className="sl-lg-field">
                <label className="sl-lg-label" htmlFor="sl-username">◈ PLAYER ID</label>
                <input
                  id="sl-username" className="sl-lg-input"
                  value={username} onChange={e => setUsername(e.target.value)}
                  placeholder="ENTER USERNAME..."
                  required disabled={loading} autoComplete="username" autoFocus
                />
              </div>

              <div className="sl-lg-field">
                <label className="sl-lg-label" htmlFor="sl-password">◈ ACCESS CODE</label>
                <input
                  id="sl-password" className="sl-lg-input"
                  type="password" value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required disabled={loading} autoComplete="current-password"
                />
              </div>

              {error && (
                <div className="sl-lg-error">
                  <div>
                    <div className="sl-lg-error-label">[ SYSTEM ERROR ]</div>
                    {String(error)}
                  </div>
                </div>
              )}

              <button className="sl-lg-btn" type="submit" disabled={loading}>
                {loading ? (
                  <><div className="sl-lg-spinner" /> AUTHENTICATING...</>
                ) : "[ INITIATE LOGIN ] ▸"}
              </button>
            </form>
          </div>
          <div className="sl-lg-bottom-bar" />
        </div>
      </div>
    </>
  );
}