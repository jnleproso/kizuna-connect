export interface MockPerson {
  id: string;
  username: string;
  display_name: string;
  avatar_url: string | null;
  country: string;
  native_language: string;
  learning_language: string;
  bio: string;
  interests: string[];
}

export const MOCK_PEOPLE: MockPerson[] = [
  { id: "mock-u-1", username: "yuki_tokyo", display_name: "Yuki Tanaka", avatar_url: null, country: "Japan", native_language: "Japanese", learning_language: "English", bio: "Tokyo-based designer learning English to work abroad ✨", interests: ["Anime", "Coffee", "Design"] },
  { id: "mock-u-2", username: "maria_manila", display_name: "Maria Santos", avatar_url: null, country: "Philippines", native_language: "Filipino", learning_language: "Japanese", bio: "JLPT N3 in progress! Love J-dramas 🌸", interests: ["J-Drama", "Cooking", "Travel"] },
  { id: "mock-u-3", username: "kenji_osaka", display_name: "Kenji Ito", avatar_url: null, country: "Japan", native_language: "Japanese", learning_language: "English", bio: "Osaka engineer. Talk to me about food and football!", interests: ["Football", "Ramen", "Tech"] },
  { id: "mock-u-4", username: "ella_cebu", display_name: "Ella Reyes", avatar_url: null, country: "Philippines", native_language: "Filipino", learning_language: "Japanese", bio: "Nurse dreaming of working in Hokkaido someday 🏔️", interests: ["Hiking", "K-pop", "Nursing"] },
  { id: "mock-u-5", username: "david_london", display_name: "David Carter", avatar_url: null, country: "United Kingdom", native_language: "English", learning_language: "Japanese", bio: "London. Studying Japanese for 2 years. Manga fanatic.", interests: ["Manga", "Movies", "Tea"] },
  { id: "mock-u-6", username: "sora_kyoto", display_name: "Sora Nakamura", avatar_url: null, country: "Japan", native_language: "Japanese", learning_language: "English", bio: "Kyoto. Tea ceremony instructor 🍵", interests: ["Tea", "Photography", "Kimono"] },
  { id: "mock-u-7", username: "jp_davao", display_name: "JP Mendoza", avatar_url: null, country: "Philippines", native_language: "Filipino", learning_language: "Japanese", bio: "Game dev in Davao. Looking for Tokyo collaborators!", interests: ["Gaming", "Indie Dev", "Anime"] },
  { id: "mock-u-8", username: "amelia_nyc", display_name: "Amelia Brooks", avatar_url: null, country: "United States", native_language: "English", learning_language: "Japanese", bio: "NYC. Translator in training 📚", interests: ["Books", "Coffee", "City Walks"] },
  { id: "mock-u-9", username: "haruto_fukuoka", display_name: "Haruto Sato", avatar_url: null, country: "Japan", native_language: "Japanese", learning_language: "English", bio: "Fukuoka uni student. DMs open!", interests: ["Surfing", "Music", "Skateboarding"] },
  { id: "mock-u-10", username: "bea_baguio", display_name: "Bea Cruz", avatar_url: null, country: "Philippines", native_language: "Filipino", learning_language: "Japanese", bio: "Baguio. Calligraphy + journaling enthusiast 🖋️", interests: ["Calligraphy", "Journaling", "Hiking"] },
  { id: "mock-u-11", username: "liam_sydney", display_name: "Liam Walker", avatar_url: null, country: "Australia", native_language: "English", learning_language: "Japanese", bio: "Sydney. Surfer and ramen hunter 🌊🍜", interests: ["Surfing", "Ramen", "Travel"] },
  { id: "mock-u-12", username: "akira_sapporo", display_name: "Akira Yamamoto", avatar_url: null, country: "Japan", native_language: "Japanese", learning_language: "English", bio: "Sapporo. Snowboarder ❄️ Looking for English exchange partners.", interests: ["Snowboard", "Coffee", "Photography"] },
];

export function getMockPerson(idOrUsername: string): MockPerson | undefined {
  return MOCK_PEOPLE.find((p) => p.id === idOrUsername || p.username === idOrUsername);
}

export const MOCK_POSTS = [
  { id: "mock-p-1", author: MOCK_PEOPLE[0], content: "今日は新しい英単語を10個覚えました！🎉 Today I learned 10 new English words! Anyone want to practice together?", image_url: "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=900&q=70", created_at: new Date(Date.now() - 1000 * 60 * 15).toISOString(), like_count: 24, comment_count: 5 },
  { id: "mock-p-2", author: MOCK_PEOPLE[1], content: "Watching Terrace House to improve my Japanese listening. Any other recommendations? 🇯🇵📺", image_url: null, created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), like_count: 41, comment_count: 12 },
  { id: "mock-p-3", author: MOCK_PEOPLE[4], content: "Just finished reading my first manga in Japanese without a dictionary 📚 Small win but I'll take it!", image_url: "https://images.unsplash.com/photo-1531501410720-c8d437636169?w=900&q=70", created_at: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), like_count: 67, comment_count: 8 },
  { id: "mock-p-4", author: MOCK_PEOPLE[2], content: "Osaka friends! Any English conversation meetups this weekend? 🍻", image_url: "https://images.unsplash.com/photo-1554797589-7241bb691973?w=900&q=70", created_at: new Date(Date.now() - 1000 * 60 * 60 * 9).toISOString(), like_count: 13, comment_count: 4 },
  { id: "mock-p-5", author: MOCK_PEOPLE[9], content: "Started a daily Japanese journal. Day 7! ✍️ がんばります", image_url: null, created_at: new Date(Date.now() - 1000 * 60 * 60 * 14).toISOString(), like_count: 33, comment_count: 6 },
  { id: "mock-p-6", author: MOCK_PEOPLE[5], content: "Hosting an online tea ceremony for language exchange next Sunday 🍵 DM me if interested!", image_url: "https://images.unsplash.com/photo-1545048702-79362596cdc9?w=900&q=70", created_at: new Date(Date.now() - 1000 * 60 * 60 * 22).toISOString(), like_count: 88, comment_count: 19 },
];

export const SAMPLE_POST_IMAGES = [
  "https://images.unsplash.com/photo-1480796927426-f609979314bd?w=900&q=70",
  "https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=900&q=70",
  "https://images.unsplash.com/photo-1542931287-023b922fa89b?w=900&q=70",
  "https://images.unsplash.com/photo-1526481280693-3bfa7568e0f3?w=900&q=70",
  "https://images.unsplash.com/photo-1493997181344-712f2f19d87a?w=900&q=70",
  "https://images.unsplash.com/photo-1554797589-7241bb691973?w=900&q=70",
  "https://images.unsplash.com/photo-1531501410720-c8d437636169?w=900&q=70",
  "https://images.unsplash.com/photo-1542223616-740d5dff7f56?w=900&q=70",
];

// Convention: append an image to a post by adding `\n\n[img]<url>` to the
// content. Helpers below parse/strip that marker.
export const IMG_PREFIX = "[img]";
export function splitPostImage(content: string): { text: string; image: string | null } {
  const m = content.match(/\n*\[img\](https?:\/\/\S+)\s*$/);
  if (!m) return { text: content, image: null };
  return { text: content.slice(0, m.index).trim(), image: m[1] };
}

export interface MockMessage { id: string; from: string; text: string; at: string }
export interface MockThreadSeed { peerId: string; messages: MockMessage[] }

export const MOCK_THREADS: MockThreadSeed[] = [
  { peerId: "mock-u-1", messages: [
    { id: "m1", from: "mock-u-1", text: "Hi! Saw you're learning Japanese — want to exchange?", at: new Date(Date.now() - 1000*60*45).toISOString() },
    { id: "m2", from: "me", text: "Yes! I can help with English 😊", at: new Date(Date.now() - 1000*60*40).toISOString() },
    { id: "m3", from: "mock-u-1", text: "Awesome, let's start tomorrow!", at: new Date(Date.now() - 1000*60*30).toISOString() },
  ]},
  { peerId: "mock-u-2", messages: [
    { id: "m1", from: "mock-u-2", text: "Kumusta! I love your post about JLPT 🙌", at: new Date(Date.now() - 1000*60*60*3).toISOString() },
    { id: "m2", from: "me", text: "Salamat! Are you taking N3 too?", at: new Date(Date.now() - 1000*60*60*2.5).toISOString() },
  ]},
  { peerId: "mock-u-5", messages: [
    { id: "m1", from: "mock-u-5", text: "Any manga recommendations for an intermediate learner?", at: new Date(Date.now() - 1000*60*60*8).toISOString() },
  ]},
  { peerId: "mock-u-6", messages: [
    { id: "m1", from: "mock-u-6", text: "Tea ceremony Sunday — joining? 🍵", at: new Date(Date.now() - 1000*60*60*20).toISOString() },
    { id: "m2", from: "me", text: "Count me in!", at: new Date(Date.now() - 1000*60*60*19).toISOString() },
    { id: "m3", from: "mock-u-6", text: "Yay! I'll send the link.", at: new Date(Date.now() - 1000*60*60*18).toISOString() },
  ]},
];