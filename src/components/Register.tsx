// src/components/Register.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { register } from "../services/auth";

export default function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState<string | null>(null);
  const [loading, setLoading]   = useState(false);
  const navigate = useNavigate();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await register({ username, email, password });
      navigate("/dashboard");
    } catch (err: any) {
      setError(err?.response?.data || err?.message || "REGISTRATION FAILURE");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;600;700;900&family=Share+Tech+Mono&display=swap');
        @keyframes sl_rg_fi    { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:none} }
        @keyframes sl_rg_spin  { to{transform:rotate(360deg)} }
        @keyframes sl_rg_shake { 0%,100%{transform:translateX(0)} 20%,60%{transform:translateX(-6px)} 40%,80%{transform:translateX(6px)} }
        @keyframes sl_rg_scan  { 0%{transform:translateY(-100%)} 100%{transform:translateY(100vh)} }
        @keyframes sl_rg_glow  { 0%,100%{box-shadow:0 0 20px rgba(191,127,255,.2)} 50%{box-shadow:0 0 40px rgba(191,127,255,.5),0 0 80px rgba(191,127,255,.2)} }

        *,*::before,*::after { box-sizing:border-box; margin:0; padding:0; }
        html,body,#root { width:100%; min-height:100vh; background:#03060f; }

        .sl-rg-root {
          width:100%; min-height:100vh; background:#03060f;
          display:flex; align-items:center; justify-content:center;
          padding:24px; position:relative; overflow:hidden;
          font-family:'Share Tech Mono',monospace;
        }
        .sl-rg-root::before {
          content:""; position:fixed; inset:0; pointer-events:none;
          background-image:
            linear-gradient(rgba(191,127,255,.02) 1px,transparent 1px),
            linear-gradient(90deg,rgba(191,127,255,.02) 1px,transparent 1px);
          background-size:40px 40px;
        }
        .sl-rg-root::after {
          content:""; position:fixed; left:0; right:0; height:100px; pointer-events:none;
          background:linear-gradient(transparent,rgba(191,127,255,.03),transparent);
          animation:sl_rg_scan 8s linear infinite;
        }

        .sl-rg-corner { position:fixed; width:50px; height:50px; pointer-events:none; z-index:1; }
        .sl-rg-corner-tl { top:0; left:0; border-top:2px solid rgba(191,127,255,.25); border-left:2px solid rgba(191,127,255,.25); }
        .sl-rg-corner-tr { top:0; right:0; border-top:2px solid rgba(191,127,255,.25); border-right:2px solid rgba(191,127,255,.25); }
        .sl-rg-corner-bl { bottom:0; left:0; border-bottom:2px solid rgba(191,127,255,.25); border-left:2px solid rgba(191,127,255,.25); }
        .sl-rg-corner-br { bottom:0; right:0; border-bottom:2px solid rgba(191,127,255,.25); border-right:2px solid rgba(191,127,255,.25); }

        .sl-rg-orb1 {
          position:absolute; width:500px; height:500px; border-radius:50%;
          background:radial-gradient(circle,rgba(191,127,255,.06) 0%,transparent 70%);
          top:-150px; right:-150px; pointer-events:none;
        }
        .sl-rg-orb2 {
          position:absolute; width:400px; height:400px; border-radius:50%;
          background:radial-gradient(circle,rgba(0,212,255,.04) 0%,transparent 70%);
          bottom:-100px; left:-100px; pointer-events:none;
        }

        .sl-rg-card {
          width:100%; max-width:440px; position:relative; z-index:2;
          background:linear-gradient(135deg,rgba(10,0,30,.98),rgba(20,0,50,.95));
          border:1px solid rgba(191,127,255,.2);
          overflow:hidden;
          clip-path:polygon(0 0,calc(100% - 24px) 0,100% 24px,100% 100%,24px 100%,0 calc(100% - 24px));
          box-shadow:0 0 60px rgba(191,127,255,.1), 0 40px 80px rgba(0,0,0,.7);
          animation:sl_rg_fi .4s cubic-bezier(.22,1,.36,1);
        }
        .sl-rg-card::before {
          content:""; position:absolute; inset:0; pointer-events:none; z-index:0;
          background:repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(191,127,255,.008) 2px,rgba(191,127,255,.008) 4px);
        }

        .sl-rg-top-bar {
          height:2px;
          background:linear-gradient(90deg,transparent,#bf7fff,transparent);
          animation:sl_rg_glow 3s ease-in-out infinite;
        }

        .sl-rg-inner { padding:36px 36px 32px; position:relative; z-index:1; }

        .sl-rg-logo { display:flex; align-items:center; gap:14px; margin-bottom:32px; }
        .sl-rg-logo-hex {
          width:44px; height:44px;
          background:rgba(191,127,255,.08); border:1px solid rgba(191,127,255,.35);
          clip-path:polygon(50% 0%,100% 25%,100% 75%,50% 100%,0% 75%,0% 25%);
          display:flex; align-items:center; justify-content:center;
          font-size:18px; color:#bf7fff;
          box-shadow:0 0 20px rgba(191,127,255,.3);
          animation:sl_rg_glow 3s ease-in-out infinite;
        }
        .sl-rg-logo-text  { display:flex; flex-direction:column; }
        .sl-rg-logo-title { font-family:'Orbitron',sans-serif; font-size:16px; font-weight:700; color:#bf7fff; letter-spacing:3px; text-shadow:0 0 12px rgba(191,127,255,.5); }
        .sl-rg-logo-sub   { font-size:8px; color:rgba(191,127,255,.4); letter-spacing:2px; margin-top:2px; }

        .sl-rg-heading { font-family:'Orbitron',sans-serif; font-size:18px; font-weight:900; color:#bf7fff; letter-spacing:3px; margin-bottom:6px; text-shadow:0 0 16px rgba(191,127,255,.4); }
        .sl-rg-sub     { font-size:9px; color:rgba(191,127,255,.35); letter-spacing:2px; margin-bottom:32px; }

        .sl-rg-field { margin-bottom:18px; }
        .sl-rg-label { display:block; font-size:8px; color:rgba(191,127,255,.5); letter-spacing:2px; text-transform:uppercase; margin-bottom:7px; }

        .sl-rg-input {
          width:100%; background:rgba(191,127,255,.03); border:1px solid rgba(191,127,255,.2);
          padding:11px 14px; font-size:12px; font-family:'Share Tech Mono',monospace;
          color:#c8a8e6; outline:none; letter-spacing:.5px;
          transition:all .2s; -webkit-appearance:none;
          clip-path:polygon(0 0,calc(100% - 8px) 0,100% 8px,100% 100%,8px 100%,0 calc(100% - 8px));
        }
        .sl-rg-input::placeholder { color:rgba(191,127,255,.2); }
        .sl-rg-input:focus {
          border-color:rgba(191,127,255,.5);
          box-shadow:0 0 16px rgba(191,127,255,.15);
          background:rgba(191,127,255,.06);
          color:#fff;
        }
        .sl-rg-input:disabled { opacity:.4; cursor:not-allowed; }
        .sl-rg-input:-webkit-autofill,
        .sl-rg-input:-webkit-autofill:focus {
          -webkit-box-shadow:0 0 0 100px #08020f inset;
          -webkit-text-fill-color:#c8a8e6;
          caret-color:#c8a8e6;
        }

        .sl-rg-divider {
          height:1px; margin:20px 0;
          background:linear-gradient(90deg,transparent,rgba(191,127,255,.2),transparent);
        }

        .sl-rg-error {
          display:flex; align-items:flex-start; gap:8px;
          background:rgba(255,51,102,.06); border:1px solid rgba(255,51,102,.25);
          padding:10px 14px; margin-bottom:16px;
          font-size:10px; color:rgba(255,100,130,.8); line-height:1.6;
          letter-spacing:.3px; animation:sl_rg_shake .35s ease;
          clip-path:polygon(0 0,calc(100% - 6px) 0,100% 6px,100% 100%,0 100%);
        }
        .sl-rg-error-label { font-family:'Orbitron',sans-serif; font-size:8px; color:#ff3366; letter-spacing:2px; margin-bottom:3px; }

        .sl-rg-btn {
          width:100%; padding:13px; margin-top:4px;
          background:transparent; border:1px solid rgba(191,127,255,.4);
          color:#bf7fff; font-family:'Orbitron',sans-serif; font-size:11px;
          font-weight:700; letter-spacing:3px; cursor:pointer; transition:all .2s;
          clip-path:polygon(8px 0,100% 0,100% calc(100% - 8px),calc(100% - 8px) 100%,0 100%,0 8px);
          display:flex; align-items:center; justify-content:center; gap:10px;
          position:relative; overflow:hidden;
        }
        .sl-rg-btn::before {
          content:""; position:absolute; inset:0;
          background:linear-gradient(135deg,rgba(191,127,255,.08),transparent);
          opacity:0; transition:opacity .2s;
        }
        .sl-rg-btn:hover:not(:disabled) { border-color:#bf7fff; box-shadow:0 0 24px rgba(191,127,255,.3),0 0 60px rgba(191,127,255,.1); color:#fff; }
        .sl-rg-btn:hover:not(:disabled)::before { opacity:1; }
        .sl-rg-btn:disabled { opacity:.3; cursor:not-allowed; }

        .sl-rg-spinner {
          width:14px; height:14px;
          border:2px solid rgba(191,127,255,.2); border-top-color:#bf7fff;
          clip-path:polygon(50% 0%,100% 25%,100% 75%,50% 100%,0% 75%,0% 25%);
          animation:sl_rg_spin .8s linear infinite;
        }

        .sl-rg-login-link { text-align:center; margin-top:22px; font-size:9px; color:rgba(191,127,255,.35); letter-spacing:1px; }
        .sl-rg-login-link a { color:rgba(191,127,255,.7); text-decoration:none; transition:color .15s; letter-spacing:1px; }
        .sl-rg-login-link a:hover { color:#bf7fff; text-shadow:0 0 8px rgba(191,127,255,.5); }

        .sl-rg-bottom-bar { height:1px; background:linear-gradient(90deg,transparent,rgba(191,127,255,.4),transparent); }
      `}</style>

      <div className="sl-rg-corner sl-rg-corner-tl" />
      <div className="sl-rg-corner sl-rg-corner-tr" />
      <div className="sl-rg-corner sl-rg-corner-bl" />
      <div className="sl-rg-corner sl-rg-corner-br" />

      <div className="sl-rg-root">
        <div className="sl-rg-orb1" />
        <div className="sl-rg-orb2" />

        <div className="sl-rg-card">
          <div className="sl-rg-top-bar" />
          <div className="sl-rg-inner">
            <div className="sl-rg-logo">
              <div className="sl-rg-logo-hex">✦</div>
              <div className="sl-rg-logo-text">
                <div className="sl-rg-logo-title">LIFE OS</div>
                <div className="sl-rg-logo-sub">▸ PLAYER STATUS SYSTEM v2.0</div>
              </div>
            </div>

            <div className="sl-rg-heading">NEW PLAYER</div>
            <div className="sl-rg-sub">▸ REGISTER YOUR ACCOUNT TO BEGIN YOUR JOURNEY</div>

            <form onSubmit={submit}>
              <div className="sl-rg-field">
                <label className="sl-rg-label" htmlFor="sl-rg-username">◈ PLAYER ID</label>
                <input
                  id="sl-rg-username" className="sl-rg-input"
                  value={username} onChange={e => setUsername(e.target.value)}
                  placeholder="CHOOSE USERNAME..."
                  required disabled={loading} autoComplete="username" autoFocus
                />
              </div>

              <div className="sl-rg-field">
                <label className="sl-rg-label" htmlFor="sl-rg-email">◈ CONTACT LINK</label>
                <input
                  id="sl-rg-email" className="sl-rg-input"
                  type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="EMAIL ADDRESS..."
                  required disabled={loading} autoComplete="email"
                />
              </div>

              <div className="sl-rg-divider" />

              <div className="sl-rg-field">
                <label className="sl-rg-label" htmlFor="sl-rg-password">◈ ACCESS CODE</label>
                <input
                  id="sl-rg-password" className="sl-rg-input"
                  type="password" value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required disabled={loading} autoComplete="new-password"
                />
              </div>

              {error && (
                <div className="sl-rg-error">
                  <div>
                    <div className="sl-rg-error-label">[ SYSTEM ERROR ]</div>
                    {String(error)}
                  </div>
                </div>
              )}

              <button className="sl-rg-btn" type="submit" disabled={loading}>
                {loading ? (
                  <><div className="sl-rg-spinner" /> REGISTERING PLAYER...</>
                ) : "[ CREATE ACCOUNT ] ▸"}
              </button>
            </form>

            <div className="sl-rg-login-link">
              ALREADY REGISTERED? <a href="/login">ACCESS SYSTEM</a>
            </div>
          </div>
          <div className="sl-rg-bottom-bar" />
        </div>
      </div>
    </>
  );
}