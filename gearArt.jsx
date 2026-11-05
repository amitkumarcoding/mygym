const f = { fill: 'rgb(216 185 131/10%)', stroke: 'currentColor', strokeWidth: 2.2, strokeLinecap: 'round', strokeLinejoin: 'round' }
const l = { fill: 'none', stroke: 'currentColor', strokeWidth: 2.2, strokeLinecap: 'round', strokeLinejoin: 'round' }

const art = {
  tee: <><path d="M40 24L16 38l10 18 12-6v48h44V50l12 6 10-18-24-14c-4 8-12 12-20 12s-16-4-20-12z" {...f} /></>,
  bra: <><path d="M26 32c10 0 16 6 20 18 4-4 24-4 28 0 4-12 10-18 20-18-2 30-12 46-34 46S28 62 26 32z" {...f} /><path d="M46 50c2 10 6 16 14 16s12-6 14-16" {...l} /></>,
  watch: <><path d="M46 14h28l4 22H42zM42 84h36l-4 22H46z" {...f} /><rect x="34" y="36" width="52" height="48" rx="14" {...f} /><path d="M60 50v11l9 6" {...l} /></>,
  buds: <><circle cx="42" cy="42" r="14" {...f} /><path d="M42 56v38" {...l} /><circle cx="78" cy="42" r="14" {...f} /><path d="M78 56v38" {...l} /></>,
  wrap: <><rect x="18" y="38" width="84" height="44" rx="22" {...f} /><path d="M40 38v44M58 38v44M76 38v44" {...l} opacity=".6" /></>,
  knee: <><path d="M40 16h40l-4 88H44z" {...f} /><path d="M42 42h36M43 78h34" {...l} /><circle cx="60" cy="60" r="8" {...l} /></>,
  belt: <><rect x="14" y="44" width="92" height="32" rx="6" {...f} /><rect x="48" y="40" width="24" height="40" rx="5" {...f} /><path d="M54 52h12M54 60h12M54 68h12" {...l} opacity=".7" /></>,
  heart: <><path d="M60 96S22 72 22 46a19 19 0 0 1 38-6 19 19 0 0 1 38 6c0 26-38 50-38 50z" {...f} /><path d="M30 58h18l6-12 10 24 6-12h16" {...l} /></>,
  dumbbell: <><path d="M40 60h40" {...l} strokeWidth="6" /><rect x="22" y="38" width="14" height="44" rx="4" {...f} /><rect x="84" y="38" width="14" height="44" rx="4" {...f} /><rect x="10" y="48" width="12" height="24" rx="3" {...f} /><rect x="98" y="48" width="12" height="24" rx="3" {...f} /></>,
  bands: <><path d="M16 72c0-22 20-38 44-38s44 16 44 38-20 24-44 24-44-2-44-24z" {...f} /><path d="M32 72c0-12 12-22 28-22s28 10 28 22" {...l} opacity=".6" /></>,
  mat: <><path d="M18 56h66a18 18 0 0 1 0 36H18z" {...f} /><circle cx="84" cy="74" r="18" {...f} /><circle cx="84" cy="74" r="8" {...l} /><path d="M30 68h40M30 80h40" {...l} opacity=".6" /></>,
  rope: <><rect x="22" y="14" width="14" height="34" rx="6" {...f} /><rect x="84" y="14" width="14" height="34" rx="6" {...f} /><path d="M29 48c-14 34 4 58 31 58s45-24 31-58" {...l} /></>,
  pullup: <><path d="M10 34h100" {...l} strokeWidth="5" /><path d="M20 34v70M100 34v70" {...l} /><path d="M44 104l6-30h20l6 30" {...f} /></>,
  bench: <><path d="M16 60h74v14H16z" {...f} /><path d="M90 60l14-22" {...l} strokeWidth="6" /><path d="M30 74v26M76 74v26" {...l} /></>,
  kettle: <><path d="M42 44c0-26 36-26 36 0" {...l} strokeWidth="5" /><circle cx="60" cy="72" r="28" {...f} /><path d="M44 96h32" {...l} /></>,
  barbell: <><path d="M6 60h108" {...l} strokeWidth="4" /><rect x="20" y="30" width="12" height="60" rx="4" {...f} /><rect x="34" y="38" width="10" height="44" rx="3" {...f} /><rect x="88" y="38" width="10" height="44" rx="3" {...f} /><rect x="100" y="30" width="12" height="60" rx="4" {...f} /></>,
  treadmill: <><path d="M14 92h84l-10-16H28z" {...f} /><path d="M86 76V28l-14-6" {...l} /><rect x="62" y="16" width="20" height="14" rx="3" {...f} /><circle cx="26" cy="98" r="4" {...l} /><circle cx="86" cy="98" r="4" {...l} /></>,
  shoe: <><path d="M12 76c0-10 4-16 12-18l14-4 8-16 14 6c4 10 12 16 28 20 12 4 20 8 20 18v8H12z" {...f} /><path d="M12 88h96" {...l} /><path d="M44 54l8 8M56 58l8 8" {...l} opacity=".7" /></>,
  deo: <><rect x="42" y="38" width="36" height="62" rx="10" {...f} /><rect x="46" y="18" width="28" height="20" rx="5" {...f} /><path d="M52 60h16M52 72h16" {...l} opacity=".7" /><path d="M86 22l8-4M88 30h10M86 38l8 4" {...l} /></>,
  shower: <><path d="M30 34a30 20 0 0 1 60 0z" {...f} /><path d="M60 14v-4M40 50l-4 14M52 54l-3 18M68 54l3 18M80 50l4 14M60 58v22M44 80l-3 14M76 80l3 14" {...l} /></>,
  wash: <><path d="M26 40h68l-8 56H34z" {...f} /><circle cx="48" cy="28" r="8" {...l} /><circle cx="68" cy="22" r="6" {...l} /><circle cx="82" cy="30" r="5" {...l} /><path d="M40 62c6 4 10-4 16 0s10-4 16 0 10-4 14 0" {...l} opacity=".7" /></>,
  mist: <><rect x="34" y="52" width="52" height="48" rx="10" {...f} /><rect x="52" y="38" width="16" height="14" rx="3" {...f} /><rect x="46" y="20" width="28" height="18" rx="4" {...f} /><path d="M46 70h28M46 82h18" {...l} opacity=".7" /></>,
  wipes: <><rect x="26" y="44" width="68" height="50" rx="10" {...f} /><path d="M44 44c0-12 32-12 32 0" {...l} /><path d="M50 22c4 6 4 12 10 12s6-8 10-14" {...l} /></>,
  bag: <><path d="M20 54h80a4 4 0 0 1 4 4v32a8 8 0 0 1-8 8H24a8 8 0 0 1-8-8V58a4 4 0 0 1 4-4z" {...f} /><path d="M40 54c0-26 40-26 40 0" {...l} /><path d="M16 74h88" {...l} opacity=".6" /><rect x="50" y="68" width="20" height="12" rx="3" {...f} /></>,
  towel: <><path d="M22 32h76v56H22z" {...f} /><path d="M22 48h76M22 64h76" {...l} opacity=".6" /><path d="M32 88v10M44 88v10M56 88v10M68 88v10M80 88v10M90 88v10" {...l} /></>,
  bottle: <><rect x="42" y="14" width="36" height="14" rx="4" {...f} /><path d="M46 28h28l6 14v52a8 8 0 0 1-8 8H48a8 8 0 0 1-8-8V42z" {...f} /><path d="M46 58h28M46 74h28" {...l} opacity=".6" /></>,
  lock: <><rect x="30" y="54" width="60" height="46" rx="9" {...f} /><path d="M42 54V42a18 18 0 0 1 36 0v12" {...l} /><circle cx="60" cy="74" r="6" {...l} /><path d="M60 80v8" {...l} /></>,
  slides: <><path d="M16 86c0-8 6-12 12-12h50c18 0 26 6 26 14s-8 8-16 8H30c-8 0-14-4-14-10z" {...f} /><path d="M40 76c0-22 34-22 34 0" {...f} /></>,
  shaker: <><path d="M36 42l6 52a6 6 0 0 0 6 5h24a6 6 0 0 0 6-5l6-52z" {...f} /><rect x="32" y="26" width="56" height="16" rx="6" {...f} /><path d="M66 56l-12 18h10l-4 14 14-20H64z" fill="currentColor" stroke="none" opacity=".85" /></>,
  straps: <><path d="M30 20c-14 0-14 30 0 30h60c14 0 14-30 0-30z" {...f} /><path d="M30 70h60c14 0 14 30 0 30H30c-14 0-14-30 0-30z" {...f} /><path d="M44 20v30M76 70v30" {...l} opacity=".6" /></>,
  snack: <><path d="M60 40c-10-10-34-6-34 22 0 22 14 36 34 36s34-14 34-36c0-28-24-32-34-22z" {...f} /><path d="M60 40c0-10 4-18 14-22" {...l} /></>,
  notebook: <><rect x="28" y="16" width="64" height="88" rx="8" {...f} /><path d="M28 34h-6M28 52h-6M28 70h-6M28 88h-6M44 42h32M44 56h32M44 70h20" {...l} /></>,
  gloves: <><path d="M34 100V58l-8-14c-2-6 6-8 10-2l6 8V28c0-6 8-6 8 0v22V24c0-6 8-6 8 0v26V28c0-6 8-6 8 0v34l8-8c4-4 10 0 8 4L76 86v14z" {...f} /></>,
  fit: <><path d="M20 94V48l16-10 24 8 24-8 16 10v46z" {...f} /><path d="M20 66h80" {...l} opacity=".6" /></>,
  supp: <><rect x="28" y="40" width="64" height="58" rx="9" {...f} /><rect x="24" y="22" width="72" height="18" rx="6" {...f} /><path d="M44 62h32M44 76h20" {...l} /></>,
  avoid: <><circle cx="60" cy="60" r="38" {...f} /><path d="M34 34l52 52" {...l} strokeWidth="4" /></>,
  spark: <><path d="M60 16l10 30 30 10-30 10-10 30-10-30-30-10 30-10z" {...f} /></>,
}

const rules = [
  [/gym bag/i, 'bag'], [/wipes/i, 'wipes'], [/sports bra/i, 'bra'], [/tees? and shorts|\btee\b/i, 'tee'], [/smartwatch|band or/i, 'watch'], [/earphone/i, 'buds'],
  [/wrist/i, 'wrap'], [/knee/i, 'knee'], [/belt/i, 'belt'], [/heart-rate|chest strap/i, 'heart'],
  [/dumbbell/i, 'dumbbell'], [/resistance band/i, 'bands'], [/mat\b/i, 'mat'], [/rope/i, 'rope'], [/pull-up/i, 'pullup'],
  [/bench/i, 'bench'], [/kettlebell/i, 'kettle'], [/barbell/i, 'barbell'], [/treadmill/i, 'treadmill'],
  [/shoe|fit/i, 'shoe'], [/antiperspirant|deodorant/i, 'deo'], [/shower/i, 'shower'], [/wash gym/i, 'wash'],
  [/mist|edt|perfume/i, 'mist'], [/towel/i, 'towel'], [/water bottle/i, 'bottle'],
  [/padlock/i, 'lock'], [/slides|flip/i, 'slides'], [/shaker/i, 'shaker'], [/straps and chalk/i, 'straps'],
  [/snack/i, 'snack'], [/notebook|log/i, 'notebook'], [/gloves/i, 'gloves'],
]

export const artFor = (name) => (rules.find(([re]) => re.test(name)) || [0, 'spark'])[1]

export function GearArt({ kind, className = 'g-art' }) {
  return <svg className={className} viewBox="0 0 120 120" aria-hidden="true">{art[kind] || art.spark}</svg>
}
