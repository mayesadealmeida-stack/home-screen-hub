import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useCallback } from "react";
import { hooda } from "../lib/hooda-client";
import {
  Play, Trash2, Eye, Search, ChevronLeft, ChevronRight,
  Film, Users, BarChart3, AlertTriangle, RefreshCw,
  Clock, ThumbsUp, X, Shield,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [{ title: "Hooda Admin" }] }),
  component: AdminPage,
});

/* ── Design tokens (igual à Hooda) ── */
const P    = "#5B3FCF";
const PINK = "#E94B8A";
const GRAD = `linear-gradient(135deg,${P},${PINK})`;

const fmtV = (n: number) =>
  n >= 1_000_000 ? `${(n/1_000_000).toFixed(1)}M`
  : n >= 1_000 ? `${(n/1_000).toFixed(0)}K`
  : String(n ?? 0);

const timeAgo = (d: string) => {
  const diff = Date.now() - new Date(d).getTime(), m = Math.floor(diff/60_000);
  if (m < 60) return `${m}m atrás`;
  const h = Math.floor(m/60); if (h < 24) return `${h}h atrás`;
  const days = Math.floor(h/24); if (days < 30) return `${days}d atrás`;
  return `${Math.floor(days/30)} meses atrás`;
};

const fmtDur = (s: number | null) => {
  if (!s) return "—";
  const m = Math.floor(s/60), sec = s%60;
  return `${m}:${String(sec).padStart(2,"0")}`;
};

/* ── Password Gate ── */
const ADMIN_PASS = import.meta.env.VITE_ADMIN_PASSWORD ?? "hooda2024";

function PasswordGate({ onUnlock }: { onUnlock: () => void }) {
  const [val, setVal] = useState("");
  const [err, setErr] = useState(false);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (val === ADMIN_PASS) { onUnlock(); }
    else { setErr(true); setVal(""); setTimeout(() => setErr(false), 1500); }
  }

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "#0f0f14" }}>
      <div className="w-full max-w-sm px-6">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: GRAD }}>
              <Shield className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-black text-white tracking-tight">Hooda <span style={{ color: PINK }}>Admin</span></span>
          </div>
          <p className="text-sm" style={{ color: "#888" }}>Acesso restrito — introduz a password</p>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <input
            type="password"
            value={val}
            onChange={e => setVal(e.target.value)}
            placeholder="Password de admin"
            autoFocus
            className="w-full px-4 py-3 rounded-2xl text-sm outline-none transition-all"
            style={{
              background: "#1a1a24",
              border: `1.5px solid ${err ? "#ef4444" : val ? P : "#2a2a38"}`,
              color: "#fff",
              boxShadow: err ? "0 0 0 3px rgba(239,68,68,0.15)" : val ? `0 0 0 3px ${P}22` : "none",
            }}
          />
          {err && <p className="text-xs text-red-400 text-center">Password incorrecta</p>}
          <button type="submit" className="w-full py-3 rounded-2xl text-sm font-bold text-white transition-all active:scale-95"
            style={{ background: GRAD }}>
            Entrar
          </button>
        </form>
      </div>
    </div>
  );
}

/* ── Video Detail Modal ── */
function VideoModal({ v, onClose, onDelete }: { v: any; onClose: () => void; onDelete: (id: string) => void }) {
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (!confirming) { setConfirming(true); return; }
    setDeleting(true);
    await hooda.deleteVideo(v.id);
    onDelete(v.id);
    onClose();
  }

  const ch = v.channels;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.80)", backdropFilter: "blur(8px)" }}
      onClick={onClose}>
      <div className="w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl"
        style={{ background: "#16161f" }}
        onClick={e => e.stopPropagation()}>

        {/* Player */}
        <div className="relative aspect-video bg-black">
          {v.cf_embed_url
            ? <iframe src={v.cf_embed_url} className="w-full h-full" allow="autoplay; fullscreen" allowFullScreen />
            : v.thumbnail_url
            ? <img src={v.thumbnail_url} className="w-full h-full object-cover opacity-60" alt="" />
            : <div className="w-full h-full flex items-center justify-center">
                <Film className="w-16 h-16" style={{ color: "#333" }} />
              </div>}
          <button onClick={onClose}
            className="absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center transition"
            style={{ background: "rgba(0,0,0,0.6)", color: "#fff" }}>
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Info */}
        <div className="p-5">
          <h2 className="text-lg font-bold text-white mb-1 leading-snug">{v.title}</h2>

          {ch && (
            <p className="text-sm mb-4" style={{ color: "#888" }}>
              Canal: <span style={{ color: P }}>@{ch.handle}</span> — {ch.name}
            </p>
          )}

          {/* Stats */}
          <div className="grid grid-cols-4 gap-3 mb-5">
            {[
              { icon: Eye, label: "Views", val: fmtV(v.views_count ?? 0) },
              { icon: ThumbsUp, label: "Gostos", val: fmtV(v.likes_count ?? 0) },
              { icon: Clock, label: "Duração", val: fmtDur(v.duration_seconds) },
              { icon: BarChart3, label: "Estado", val: v.status === "published" ? "Publicado" : v.status },
            ].map(s => (
              <div key={s.label} className="rounded-2xl p-3 text-center" style={{ background: "#1e1e2a" }}>
                <s.icon className="w-4 h-4 mx-auto mb-1" style={{ color: P }} />
                <p className="text-xs font-bold text-white">{s.val}</p>
                <p className="text-[10px]" style={{ color: "#666" }}>{s.label}</p>
              </div>
            ))}
          </div>

          {v.description && (
            <p className="text-sm mb-4 leading-relaxed" style={{ color: "#aaa" }}>{v.description}</p>
          )}

          <p className="text-xs mb-5" style={{ color: "#555" }}>
            Publicado: {v.published_at ? new Date(v.published_at).toLocaleString("pt-PT") : "—"} · ID: {v.id}
          </p>

          {/* Delete */}
          <button onClick={handleDelete} disabled={deleting}
            className="w-full py-3 rounded-2xl text-sm font-bold transition-all active:scale-95 flex items-center justify-center gap-2"
            style={{ background: confirming ? "#ef4444" : "#2a1a1a", color: confirming ? "#fff" : "#ef4444", border: "1.5px solid #ef444433" }}>
            <Trash2 className="w-4 h-4" />
            {deleting ? "A apagar..." : confirming ? "Confirmar — apagar permanentemente" : "Apagar vídeo"}
          </button>
          {confirming && (
            <button onClick={() => setConfirming(false)} className="w-full mt-2 py-2 rounded-xl text-xs" style={{ color: "#666" }}>
              Cancelar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Video Card ── */
function VideoCard({ v, onClick }: { v: any; onClick: () => void }) {
  const ch = v.channels;
  return (
    <div onClick={onClick} className="group cursor-pointer rounded-2xl overflow-hidden transition-all hover:-translate-y-0.5"
      style={{ background: "#16161f", border: "1px solid #22222e" }}>
      {/* Thumbnail */}
      <div className="relative aspect-video overflow-hidden" style={{ background: "#0f0f14" }}>
        {v.thumbnail_url
          ? <img src={v.thumbnail_url} alt={v.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.04]" />
          : <div className="w-full h-full flex items-center justify-center"><Film className="w-8 h-8" style={{ color: "#333" }} /></div>}
        {v.duration_seconds && (
          <span className="absolute bottom-2 right-2 text-[10px] font-bold text-white px-1.5 py-0.5 rounded-lg"
            style={{ background: "rgba(0,0,0,0.85)" }}>{fmtDur(v.duration_seconds)}</span>
        )}
        {/* Hover: ver detalhes */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
          style={{ background: "rgba(0,0,0,0.5)" }}>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold text-white"
            style={{ background: GRAD }}>
            <Eye className="w-3.5 h-3.5" /> Ver detalhes
          </div>
        </div>
        {/* Status badge */}
        <div className="absolute top-2 left-2">
          <span className="text-[9px] font-bold px-2 py-0.5 rounded-full"
            style={{
              background: v.status === "published" ? "#16a34a22" : "#eab30822",
              color: v.status === "published" ? "#4ade80" : "#fbbf24",
              border: `1px solid ${v.status === "published" ? "#16a34a44" : "#eab30844"}`,
            }}>
            {v.status === "published" ? "Publicado" : v.status}
          </span>
        </div>
      </div>

      {/* Meta */}
      <div className="p-3">
        <p className="text-sm font-semibold leading-snug line-clamp-2 mb-1.5 text-white">{v.title}</p>
        {ch && (
          <p className="text-xs mb-2" style={{ color: "#666" }}>
            <span style={{ color: P }}>@{ch.handle}</span> · {ch.name}
          </p>
        )}
        <div className="flex items-center gap-3 text-[11px]" style={{ color: "#555" }}>
          <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{fmtV(v.views_count ?? 0)}</span>
          <span className="flex items-center gap-1"><ThumbsUp className="w-3 h-3" />{fmtV(v.likes_count ?? 0)}</span>
          <span className="ml-auto">{v.published_at ? timeAgo(v.published_at) : "—"}</span>
        </div>
      </div>
    </div>
  );
}

/* ══ ADMIN PAGE ══ */
function AdminPage() {
  const [unlocked, setUnlocked] = useState(false);
  useEffect(() => {
    if (typeof window !== "undefined" && sessionStorage.getItem("hooda_admin") === "1") {
      setUnlocked(true);
    }
  }, []);
  const [videos, setVideos] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [selected, setSelected] = useState<any>(null);
  const [stats, setStats] = useState({ videos: 0, users: 0, views: 0, channels: 0 });
  const PER_PAGE = 12;

  function unlock() {
    sessionStorage.setItem("hooda_admin", "1");
    setUnlocked(true);
  }

  const loadStats = useCallback(async () => {
    const data = await hooda.getStats();
    setStats({ videos: data.videos, users: data.users, views: data.views, channels: data.channels });
  }, []);

  const loadVideos = useCallback(async () => {
    setLoading(true);
    try {
      const res = await hooda.getVideos(page, PER_PAGE, search);
      setVideos(res.data ?? []);
      setTotal(res.total ?? 0);
    } catch (e) { console.error(e); }
    setLoading(false);
  }, [page, search]);

  useEffect(() => { if (unlocked) { loadStats(); loadVideos(); } }, [unlocked, loadStats, loadVideos]);

  if (!unlocked) return <PasswordGate onUnlock={unlock} />;

  const totalPages = Math.ceil(total / PER_PAGE);

  return (
    <div className="min-h-screen" style={{ background: "#0f0f14", color: "#fff" }}>

      {/* Modal */}
      {selected && <VideoModal v={selected} onClose={() => setSelected(null)} onDelete={id => setVideos(vs => vs.filter(v => v.id !== id))} />}

      {/* Header */}
      <header className="sticky top-0 z-30 border-b px-6 py-4 flex items-center gap-4"
        style={{ background: "rgba(15,15,20,0.92)", borderColor: "#1e1e2a", backdropFilter: "blur(20px)" }}>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: GRAD }}>
            <Shield className="w-4 h-4 text-white" />
          </div>
          <span className="text-base font-black tracking-tight">Hooda <span style={{ color: PINK }}>Admin</span></span>
        </div>
        <div className="flex-1" />
        <button onClick={() => { loadStats(); loadVideos(); }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition hover:opacity-80"
          style={{ background: "#1e1e2a", color: "#888" }}>
          <RefreshCw className="w-3.5 h-3.5" /> Atualizar
        </button>
        <button onClick={() => { sessionStorage.removeItem("hooda_admin"); setUnlocked(false); }}
          className="text-xs font-semibold px-3 py-1.5 rounded-xl transition"
          style={{ background: "#1e1e2a", color: "#ef4444" }}>
          Sair
        </button>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { icon: Film,     label: "Vídeos",     val: fmtV(stats.videos),   color: P },
            { icon: Users,    label: "Utilizadores",val: fmtV(stats.users),   color: PINK },
            { icon: Eye,      label: "Visualizações",val: fmtV(stats.views),  color: "#1FAFA6" },
            { icon: BarChart3,label: "Canais",      val: fmtV(stats.channels),color: "#F26B3A" },
          ].map(s => (
            <div key={s.label} className="rounded-2xl p-4" style={{ background: "#16161f", border: "1px solid #22222e" }}>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3" style={{ background: `${s.color}20` }}>
                <s.icon className="w-4 h-4" style={{ color: s.color }} />
              </div>
              <p className="text-2xl font-black" style={{ color: s.color }}>{s.val}</p>
              <p className="text-xs mt-0.5" style={{ color: "#555" }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Título + pesquisa */}
        <div className="flex items-center gap-4 mb-6">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Play className="w-5 h-5" style={{ color: P }} /> Vídeos da HoodaTV
            <span className="text-sm font-normal" style={{ color: "#555" }}>({total})</span>
          </h2>
          <div className="flex-1 flex items-center gap-2 rounded-2xl px-4 h-10 border max-w-xs ml-auto"
            style={{ background: "#16161f", borderColor: "#22222e" }}>
            <Search className="w-4 h-4 shrink-0" style={{ color: "#444" }} />
            <input value={search} onChange={e => { setSearch(e.target.value); setPage(0); }}
              placeholder="Pesquisar vídeos…"
              className="flex-1 bg-transparent text-sm outline-none text-white placeholder-gray-600" />
            {search && <button onClick={() => { setSearch(""); setPage(0); }}><X className="w-3.5 h-3.5" style={{ color: "#555" }} /></button>}
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="animate-pulse rounded-2xl overflow-hidden" style={{ background: "#16161f" }}>
                <div className="aspect-video" style={{ background: "#1e1e2a" }} />
                <div className="p-3 space-y-2">
                  <div className="h-3 rounded-full w-4/5" style={{ background: "#1e1e2a" }} />
                  <div className="h-3 rounded-full w-1/2" style={{ background: "#1e1e2a" }} />
                </div>
              </div>
            ))}
          </div>
        ) : videos.length === 0 ? (
          <div className="py-24 text-center rounded-3xl" style={{ background: "#16161f", border: "1px solid #22222e" }}>
            <AlertTriangle className="w-12 h-12 mx-auto mb-3" style={{ color: "#333" }} />
            <p className="text-sm font-semibold" style={{ color: "#555" }}>
              {search ? `Sem resultados para "${search}"` : "Nenhum vídeo encontrado"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {videos.map(v => <VideoCard key={v.id} v={v} onClick={() => setSelected(v)} />)}
          </div>
        )}

        {/* Paginação */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 mt-8">
            <button onClick={() => setPage(p => Math.max(0, p-1))} disabled={page === 0}
              className="w-9 h-9 rounded-xl flex items-center justify-center transition disabled:opacity-30"
              style={{ background: "#16161f", border: "1px solid #22222e", color: "#888" }}>
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm" style={{ color: "#666" }}>
              {page + 1} / {totalPages}
            </span>
            <button onClick={() => setPage(p => Math.min(totalPages - 1, p+1))} disabled={page >= totalPages - 1}
              className="w-9 h-9 rounded-xl flex items-center justify-center transition disabled:opacity-30"
              style={{ background: "#16161f", border: "1px solid #22222e", color: "#888" }}>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
