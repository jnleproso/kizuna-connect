import { MOCK_PEOPLE, type MockPerson } from "./mockData";

const K_FOLLOWING = "oc.follow.following.v1"; // people I follow (mock ids)
const K_FOLLOWERS = "oc.follow.followers.v1"; // people following me (mock ids)
const K_SEEDED = "oc.follow.seeded.v1";

type Listener = () => void;
const listeners = new Set<Listener>();

function read(key: string): string[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(key) || "[]");
  } catch {
    return [];
  }
}
function write(key: string, ids: string[]) {
  localStorage.setItem(key, JSON.stringify(Array.from(new Set(ids))));
  listeners.forEach((l) => l());
}

function seedOnce() {
  if (typeof window === "undefined") return;
  if (localStorage.getItem(K_SEEDED)) return;
  // Seed: I'm followed by 6, I follow 5
  write(K_FOLLOWERS, ["mock-u-1", "mock-u-2", "mock-u-3", "mock-u-5", "mock-u-7", "mock-u-9"]);
  write(K_FOLLOWING, ["mock-u-2", "mock-u-4", "mock-u-6", "mock-u-8", "mock-u-11"]);
  localStorage.setItem(K_SEEDED, "1");
}
seedOnce();

export function subscribeFollows(fn: Listener): () => void {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

export function myFollowing(): string[] {
  return read(K_FOLLOWING);
}
export function myFollowers(): string[] {
  return read(K_FOLLOWERS);
}
export function isFollowingMock(id: string) {
  return read(K_FOLLOWING).includes(id);
}
export function toggleFollowMock(id: string) {
  const cur = read(K_FOLLOWING);
  if (cur.includes(id)) write(K_FOLLOWING, cur.filter((x) => x !== id));
  else write(K_FOLLOWING, [...cur, id]);
}
export function removeFollower(id: string) {
  write(K_FOLLOWERS, read(K_FOLLOWERS).filter((x) => x !== id));
}

export function followingPeople(): MockPerson[] {
  const ids = new Set(myFollowing());
  return MOCK_PEOPLE.filter((p) => ids.has(p.id));
}
export function followerPeople(): MockPerson[] {
  const ids = new Set(myFollowers());
  return MOCK_PEOPLE.filter((p) => ids.has(p.id));
}