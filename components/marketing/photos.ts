const u = (id: string, w = 1800) => `https://images.unsplash.com/photo-${id}?w=${w}&q=75&auto=format&fit=crop`

/** Things people sell, each paired with a photo. Drives the hero headline. */
export const HERO_ITEMS = [
  { word: "kacchi biryani", photo: u("1589302168068-964664d93dc0"), position: "50% 55%" },
  { word: "t-shirts", photo: u("1523381210434-271e8be1f52b"), position: "50% 40%" },
  { word: "ceramics", photo: u("1610701596007-11502861dcfa"), position: "60% 60%" },
  { word: "headphones", photo: u("1505740420928-5e560c06d30e"), position: "65% 50%" },
  { word: "candles", photo: u("1602874801007-bd458bb1b8b6"), position: "50% 60%" },
  { word: "coffee", photo: u("1495474472287-4d71bcdd2085"), position: "50% 40%" },
]

export const photo = u
