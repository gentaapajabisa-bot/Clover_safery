"use strict";
/* Kemajuan belajar (tersimpan di perangkat ini, per akun). Dipakai oleh dashboard dan halaman materi.
   Urutan wajib: Tanda Bahaya → Privasi → Tindakan → Refleksi. Langkah berikutnya terbuka setelah
   langkah sebelumnya selesai (semua skor terisi; refleksi: jawaban wajib terisi lalu "Selesai"). */
const Progress = (() => {
  const STEPS = [
    { key: "tanda-bahaya", rate: "signs", label: "Mengenali Tanda Bahaya", short: "Tanda Bahaya", total: 5 },
    { key: "privasi", rate: "priv", label: "Privasi dan Batasan Diri", short: "Privasi & Batasan", total: 5 },
    { key: "tindakan", rate: "act", label: "Tindakan yang Aman", short: "Tindakan Aman", total: 4 },
    { key: "refleksi", rate: null, label: "Refleksi", short: "Refleksi", total: 0 },
  ];
  const mem = {};
  const storeKey = () => {
    let uid = "guest";
    try {
      uid = localStorage.getItem("clover_uid") || "guest";
    } catch {
      /* penyimpanan tidak tersedia */
    }
    return "clover_progress_" + uid;
  };
  function read() {
    try {
      const raw = localStorage.getItem(storeKey());
      if (raw) return JSON.parse(raw);
    } catch {
      /* abaikan */
    }
    return mem[storeKey()] || { rating: {}, done: {} };
  }
  function write(d) {
    mem[storeKey()] = d;
    try {
      localStorage.setItem(storeKey(), JSON.stringify(d));
    } catch {
      /* tetap tersimpan di memori halaman */
    }
  }
  const step = (key) => STEPS.find((s) => s.key === key);
  function ratings(id) {
    return (read().rating[id] || []).slice();
  }
  function setRating(id, i, v) {
    const d = read();
    const a = d.rating[id] || [];
    a[i] = v;
    d.rating[id] = a;
    write(d);
  }
  function rated(id, total) {
    const a = ratings(id);
    let n = 0;
    for (let i = 0; i < total; i++) if (a[i] >= 1 && a[i] <= 5) n++;
    return n;
  }
  function average(id, total) {
    const a = ratings(id).slice(0, total).filter((x) => x >= 1);
    return a.length ? a.reduce((x, y) => x + y, 0) / a.length : 0;
  }
  function isDone(key) {
    const s = step(key);
    if (!s) return true;
    if (s.rate) return rated(s.rate, s.total) === s.total;
    return !!read().done[key];
  }
  function markDone(key) {
    const d = read();
    d.done[key] = true;
    write(d);
  }
  /** Langkah pertama yang belum selesai, atau null bila semua selesai. */
  function next() {
    return STEPS.find((s) => !isDone(s.key)) || null;
  }
  /** Langkah terkunci bila ada langkah sebelumnya yang belum selesai. */
  function blocker(key) {
    const i = STEPS.findIndex((s) => s.key === key);
    if (i < 0) return null;
    return STEPS.slice(0, i).find((s) => !isDone(s.key)) || null;
  }
  const doneCount = () => STEPS.filter((s) => isDone(s.key)).length;
  return { STEPS, step, ratings, setRating, rated, average, isDone, markDone, next, blocker, doneCount };
})();
