import { MOCK_THREADS, MOCK_PEOPLE, type MockMessage, getMockPerson } from "./mockData";

const KEY = "otani.messages.v1";
const PEER_KEY = "otani.peers.v1";

export interface PeerInfo {
  id: string;
  username: string;
  display_name: string;
  avatar_url: string | null;
  country?: string | null;
}

export interface Thread {
  peerId: string;
  messages: MockMessage[];
}

function seed(): Thread[] {
  return MOCK_THREADS.map((t) => ({ peerId: t.peerId, messages: [...t.messages] }));
}

function read(): Thread[] {
  if (typeof window === "undefined") return seed();
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) {
      const s = seed();
      localStorage.setItem(KEY, JSON.stringify(s));
      return s;
    }
    return JSON.parse(raw);
  } catch {
    return seed();
  }
}

function write(threads: Thread[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(threads));
  window.dispatchEvent(new Event("otani-messages-changed"));
}

export function getThreads(): Thread[] {
  return read().sort((a, b) => {
    const la = a.messages[a.messages.length - 1]?.at || "";
    const lb = b.messages[b.messages.length - 1]?.at || "";
    return lb.localeCompare(la);
  });
}

export function getThread(peerId: string): Thread {
  const all = read();
  let t = all.find((x) => x.peerId === peerId);
  if (!t) {
    t = { peerId, messages: [] };
    all.push(t);
    write(all);
  }
  return t;
}

export function sendMessage(peerId: string, text: string) {
  const all = read();
  let t = all.find((x) => x.peerId === peerId);
  if (!t) {
    t = { peerId, messages: [] };
    all.push(t);
  }
  t.messages.push({ id: crypto.randomUUID(), from: "me", text, at: new Date().toISOString() });
  write(all);
  // Simulate a reply
  setTimeout(() => {
    const cur = read();
    const target = cur.find((x) => x.peerId === peerId);
    if (!target) return;
    const replies = [
      "Nice! 😊",
      "Haha, that's great!",
      "Tell me more!",
      "面白いね！",
      "I agree 👍",
      "Let's chat more soon!",
    ];
    target.messages.push({
      id: crypto.randomUUID(),
      from: peerId,
      text: replies[Math.floor(Math.random() * replies.length)],
      at: new Date().toISOString(),
    });
    write(cur);
  }, 1500 + Math.random() * 1500);
}

export function registerPeer(p: PeerInfo) {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem(PEER_KEY);
    const map: Record<string, PeerInfo> = raw ? JSON.parse(raw) : {};
    map[p.id] = p;
    localStorage.setItem(PEER_KEY, JSON.stringify(map));
  } catch {}
}

export function getPeerInfo(peerId: string): PeerInfo {
  const m = getMockPerson(peerId);
  if (m) return { id: m.id, username: m.username, display_name: m.display_name, avatar_url: m.avatar_url, country: m.country };
  if (typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem(PEER_KEY);
      if (raw) {
        const map: Record<string, PeerInfo> = JSON.parse(raw);
        if (map[peerId]) return map[peerId];
      }
    } catch {}
  }
  return { id: peerId, username: peerId.slice(0, 8), display_name: "User", avatar_url: null };
}

export function subscribe(cb: () => void) {
  if (typeof window === "undefined") return () => {};
  const h = () => cb();
  window.addEventListener("otani-messages-changed", h);
  window.addEventListener("storage", h);
  return () => {
    window.removeEventListener("otani-messages-changed", h);
    window.removeEventListener("storage", h);
  };
}

export function totalUnreadHint(): number {
  // Simple hint: number of threads where last message is from peer
  return getThreads().filter((t) => {
    const last = t.messages[t.messages.length - 1];
    return last && last.from !== "me";
  }).length;
}