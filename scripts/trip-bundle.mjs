// 旅行1件ぶんの記録（本体 + 写真 + レース）を JSON から入れる。
// seed.mjs と import-trip.mjs の両方から使う。
//
// JSON の形は db/kyoto-keiba-2026-10-03.json を参照。
import fs from "node:fs";

export function readBundle(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

/** 同じ見出し・開始日の旅行がすでにあれば何もしない。入れた trip_id か null を返す。 */
export function insertTripBundle(db, bundle) {
  const { trip, photos = [], races = [] } = bundle;

  const exists = db
    .prepare(`SELECT id FROM trips WHERE title IS ? AND start_date = ?`)
    .get(trip.title, trip.start_date);
  if (exists) return null;

  const insertTrip = db.prepare(
    `INSERT INTO trips (title, place, start_date, end_date, memo) VALUES (?, ?, ?, ?, ?)`
  );
  const insertPhoto = db.prepare(
    `INSERT INTO trip_photos
       (trip_id, sort_no, src, thumb_src, scene, caption, taken_at, width, height)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
  );
  const insertRace = db.prepare(
    `INSERT INTO trip_races
       (trip_id, race_date, course, meeting, race_no, race_name, grade, track, conditions,
        post_time, placings, bettor, bet_type, bet_detail, hit, dividend_yen, returned_yen,
        photo, source_url)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  );

  return db.transaction(() => {
    // 感想は本人が書くものなので memo は空のまま入れる。
    const tripId = insertTrip.run(
      trip.title,
      trip.place,
      trip.start_date,
      trip.end_date ?? null,
      trip.memo ?? null
    ).lastInsertRowid;

    photos.forEach((p, i) => {
      insertPhoto.run(
        tripId,
        i + 1,
        p.src,
        p.thumb_src ?? null,
        p.scene ?? null,
        p.caption ?? null,
        p.taken_at ?? null,
        p.width ?? null,
        p.height ?? null
      );
    });

    for (const r of races) {
      insertRace.run(
        tripId,
        r.race_date,
        r.course,
        r.meeting ?? null,
        r.race_no,
        r.race_name,
        r.grade ?? null,
        r.track ?? null,
        r.conditions ?? null,
        r.post_time ?? null,
        JSON.stringify(r.placings),
        r.bettor ?? null,
        r.bet_type ?? null,
        r.bet_detail ?? null,
        r.hit ?? null,
        r.dividend_yen ?? null,
        r.returned_yen ?? null,
        r.photo ?? null,
        r.source_url ?? null
      );
    }
    return tripId;
  })();
}
