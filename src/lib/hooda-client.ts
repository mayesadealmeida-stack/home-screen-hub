const BASE = import.meta.env.VITE_HOODA_FUNCTION_URL as string;
const KEY  = import.meta.env.VITE_ADMIN_SECRET_KEY as string;

async function call(action: string, extra: Record<string, unknown> = {}) {
  const res = await fetch(BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-admin-key": KEY },
    body: JSON.stringify({ action, ...extra }),
  });
  if (!res.ok) throw new Error(`Erro ${res.status}`);
  return res.json();
}

export const hooda = {
  getStats:    ()                              => call("stats"),
  getVideos:   (page: number, limit: number, search: string) => call("videos", { page, limit, search }),
  deleteVideo: (id: string)                   => call("delete_video", { id }),
};
