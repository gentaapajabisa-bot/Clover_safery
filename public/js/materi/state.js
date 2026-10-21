"use strict";
/* Status sementara di memori halaman (hilang saat dimuat ulang). */

/* =========================================================
   Status sementara (hanya di memori halaman; hilang saat dimuat ulang)
   ========================================================= */
const S = {
  checks: {},
  scn: 0,
  picked: {},
  myth: {},
  boundary: {},
  ref: { text: {}, opts: [], q2: [], q3: "", q4: [], done: false },
  help: null,
  trusted: [
    { r: "", c: "" },
    { r: "", c: "" },
    { r: "", c: "" },
  ],
  tab: "masuk",
  gchecks: [],
};
