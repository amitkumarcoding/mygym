import { useEffect, useRef, useState } from "react";
import { registerPush, saveSubscription } from "./push";

// Change the brand + currency here.
const BRAND = "Ironline";
const CURRENCY = "$";

const programs = [
  { name: "Strength floor", text: "Racks, platforms and chalk. Coached barbell sessions for every level, from first squat to meet prep." },
  { name: "Conditioning", text: "Sleds, rowers and intervals built in 40 minutes. You leave tired, not wrecked." },
  { name: "Mobility", text: "Slow, structured sessions that fix hips, shoulders and ankles so you can lift deeper and pain free." },
  { name: "Boxing", text: "Bag work, pad rounds and footwork drills in small groups. No sparring unless you ask." },
];

const schedule = {
  Mon: [["6:30 am", "Strength basics", "Rhea"], ["12:15 pm", "Conditioning", "Dev"], ["6:30 pm", "Boxing rounds", "Kabir"]],
  Tue: [["6:30 am", "Mobility reset", "Rhea"], ["5:30 pm", "Olympic lifting", "Dev"], ["7:00 pm", "Strength basics", "Rhea"]],
  Wed: [["6:30 am", "Conditioning", "Kabir"], ["12:15 pm", "Strength basics", "Dev"], ["6:30 pm", "Boxing rounds", "Kabir"]],
  Thu: [["6:30 am", "Mobility reset", "Rhea"], ["5:30 pm", "Powerlifting", "Dev"], ["7:00 pm", "Conditioning", "Kabir"]],
  Fri: [["6:30 am", "Strength basics", "Dev"], ["12:15 pm", "Conditioning", "Kabir"], ["6:00 pm", "Open floor", "Team"]],
  Sat: [["8:00 am", "Boxing rounds", "Kabir"], ["9:30 am", "Strength basics", "Rhea"], ["11:00 am", "Mobility reset", "Rhea"]],
  Sun: [["9:00 am", "Open floor", "Team"], ["10:30 am", "Mobility reset", "Rhea"]],
};

const trainers = [
  { name: "Dev Malhotra", role: "Head coach, strength", bio: "Ten years coaching powerlifters and first timers. Believes the squat fixes most things." },
  { name: "Rhea Sethi", role: "Mobility and rehab", bio: "Former physio assistant. Writes programs around your injuries instead of ignoring them." },
  { name: "Kabir Anand", role: "Boxing and conditioning", bio: "Amateur boxer turned coach. Runs the loudest, friendliest room in the building." },
];

const plans = [
  { id: "Off-peak", monthly: 29, perks: ["Gym floor 10 am to 4 pm", "Locker room and showers", "One free coach intro"] },
  { id: "Full access", monthly: 49, perks: ["Gym floor, every hour", "All group classes", "Monthly body check-in"], featured: true },
  { id: "Coached", monthly: 119, perks: ["Everything in Full access", "4 one-to-one sessions a month", "Written training plan"] },
];

const css = `@import url('https://fonts.googleapis.com/css2?family=Bodoni+Moda:ital,opsz,wght@0,6..96,400;0,6..96,500;1,6..96,400&family=Hanken+Grotesk:wght@400;500;600&display=swap');
.gym{--forest:#0D1B17;--moss:#16302A;--bone:#EBE6DA;--paper:#F5F1E7;--brass:#B8975A;--mist:#9FADA6;--ink:#111715;
font-family:'Hanken Grotesk',system-ui,sans-serif;background:var(--forest);color:var(--bone);line-height:1.65;-webkit-font-smoothing:antialiased}
.gym *{box-sizing:border-box}
.gym h1,.gym h2,.gym h3{font-family:'Bodoni Moda',Georgia,serif;font-weight:400;margin:0;line-height:1.05;letter-spacing:-.015em}
.gym a{color:inherit}
.gym :focus-visible{outline:2px solid var(--brass);outline-offset:4px}
.gym .wrap{max-width:1160px;margin:0 auto;padding:0 28px}
.gym section{padding:104px 0}
.gym h2{font-size:clamp(38px,5vw,60px);margin-bottom:16px}
.gym .lead{max-width:50ch;color:var(--mist);margin:0 0 56px;font-size:17px}
.gym .light{background:var(--bone);color:var(--ink)}
.gym .light .lead{color:#55605b}
.gym .btn{display:inline-block;padding:14px 30px;border:1px solid currentColor;background:transparent;color:inherit;font:500 15px 'Hanken Grotesk',sans-serif;letter-spacing:.02em;cursor:pointer;text-decoration:none;transition:background .2s,color .2s}
.gym .btn.blue{background:var(--brass);border-color:var(--brass);color:var(--forest)}
.gym .btn.blue:hover{background:#cdb07a;border-color:#cdb07a}
.gym .btn.ghost:hover{background:var(--bone);color:var(--forest)}
.gym nav{position:sticky;top:0;z-index:5;background:rgba(13,27,23,.86);backdrop-filter:blur(12px);border-bottom:1px solid rgba(184,151,90,.25)}
.gym nav .wrap{display:flex;align-items:center;justify-content:space-between;height:76px}
.gym .logo{font:500 28px 'Bodoni Moda',serif;letter-spacing:.06em;text-decoration:none}
.gym .links{display:flex;gap:34px;align-items:center;font-size:14px}
.gym .links a{text-decoration:none;color:var(--mist);transition:color .2s}
.gym .links a:hover{color:var(--bone)}
.gym .links .btn{padding:10px 22px;color:var(--forest)}
.gym .hero{position:relative;padding:112px 0 96px;overflow:hidden;background:radial-gradient(800px 520px at 80% 25%,rgba(184,151,90,.14),transparent 65%),radial-gradient(900px 600px at 0% 100%,#1c443a,transparent 60%),var(--forest)}
.gym .hero::before{content:"";position:absolute;inset:0;opacity:.07;pointer-events:none;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence baseFrequency='.8' numOctaves='2'/%3E%3C/filter%3E%3Crect width='160' height='160' filter='url(%23n)'/%3E%3C/svg%3E")}
.gym .hero .wrap{position:relative;display:grid;grid-template-columns:1.1fr .9fr;gap:72px;align-items:center}
.gym .hero h1{font-size:clamp(52px,7.4vw,104px)}
.gym .hero p{max-width:42ch;font-size:18px;color:var(--mist);margin:28px 0 40px}
.gym .actions{display:flex;gap:14px;flex-wrap:wrap}
.gym .rack{border:1px solid rgba(184,151,90,.4);padding:36px;background:linear-gradient(160deg,rgba(255,255,255,.05),rgba(255,255,255,.01))}
.gym .rack svg{width:100%;height:auto;display:block}
.gym .rack small{color:var(--brass);display:block;margin-bottom:10px;font-size:14px;letter-spacing:.04em}
.gym .total{font:400 76px 'Bodoni Moda',serif;line-height:1;margin-top:8px}
.gym .plates{display:flex;gap:8px;flex-wrap:wrap;margin-top:22px}
.gym .plates button{background:transparent;color:var(--bone);border:1px solid rgba(235,230,218,.35);padding:8px 14px;font:500 13px 'Hanken Grotesk';cursor:pointer;transition:border-color .2s,color .2s}
.gym .plates button:hover:not(:disabled){border-color:var(--brass);color:var(--brass)}
.gym .plates button:disabled{opacity:.3;cursor:not-allowed}
.gym .amen{padding:0;border-top:1px solid rgba(184,151,90,.25);border-bottom:1px solid rgba(184,151,90,.25)}
.gym .amen .wrap{display:grid;grid-template-columns:repeat(4,1fr)}
.gym .amen .wrap>div{padding:40px 28px;border-left:1px solid rgba(184,151,90,.25)}
.gym .amen .wrap>div:first-child{border-left:0;padding-left:0}
.gym .amen h3{font-size:24px;margin-bottom:8px}
.gym .amen p{margin:0;color:var(--mist);font-size:15px}
.gym .rows{border-top:1px solid rgba(184,151,90,.3)}
.gym .row{border-bottom:1px solid rgba(184,151,90,.3)}
.gym .row>button{all:unset;box-sizing:border-box;width:100%;display:flex;justify-content:space-between;align-items:center;padding:32px 0;cursor:pointer}
.gym .row>button:focus-visible{outline:2px solid var(--brass);outline-offset:2px}
.gym .row .t{font:400 clamp(30px,4.4vw,52px) 'Bodoni Moda',serif;letter-spacing:-.015em;transition:color .2s}
.gym .row>button:hover .t,.gym .row.open .t{color:var(--brass)}
.gym .plus{width:22px;height:22px;position:relative;flex:none}
.gym .plus::before,.gym .plus::after{content:"";position:absolute;background:var(--brass);left:0;top:50%;width:100%;height:1px;transition:transform .3s}
.gym .plus::after{transform:rotate(90deg)}
.gym .row.open .plus::after{transform:rotate(0)}
.gym .more{display:grid;grid-template-rows:0fr;transition:grid-template-rows .35s ease}
.gym .row.open .more{grid-template-rows:1fr}
.gym .more p{overflow:hidden;min-height:0;margin:0;max-width:56ch;color:var(--mist);font-size:17px}
.gym .row.open .more p{padding-bottom:32px}
.gym .tabs{display:flex;gap:28px;flex-wrap:wrap;margin-bottom:12px;border-bottom:1px solid rgba(17,23,21,.2)}
.gym .tabs button{background:none;border:0;border-bottom:2px solid transparent;margin-bottom:-1px;padding:10px 0;color:#55605b;font:500 15px 'Hanken Grotesk';cursor:pointer}
.gym .tabs button[aria-selected="true"]{color:var(--ink);border-bottom-color:var(--brass)}
.gym .slot{display:grid;grid-template-columns:140px 1fr auto;gap:20px;padding:26px 0;border-bottom:1px solid rgba(17,23,21,.14);align-items:baseline}
.gym .slot strong{font:400 32px 'Bodoni Moda',serif;letter-spacing:-.01em}
.gym .slot span{color:#55605b}
.gym .trainers{display:grid;grid-template-columns:repeat(3,1fr);gap:40px}
.gym .avatar{aspect-ratio:3/4;margin-bottom:22px;display:grid;place-items:center;border:1px solid rgba(184,151,90,.3);background:radial-gradient(circle at 30% 20%,#245246,var(--forest) 70%);color:var(--brass);font:italic 400 140px 'Bodoni Moda',serif}
.gym .trainers h3{font-size:30px}
.gym .trainers em{color:var(--brass);font-style:normal;font-size:14px;letter-spacing:.03em}
.gym .trainers p{margin:10px 0 0;color:var(--mist);font-size:15px}
.gym .toggle{display:inline-flex;border:1px solid rgba(17,23,21,.3);margin-bottom:48px;padding:3px;border-radius:99px}
.gym .toggle button{border:0;background:transparent;padding:9px 22px;font:500 14px 'Hanken Grotesk';cursor:pointer;border-radius:99px;color:var(--ink)}
.gym .toggle button[aria-pressed="true"]{background:var(--ink);color:var(--bone)}
.gym .plans{display:grid;grid-template-columns:repeat(3,1fr);gap:24px;align-items:center}
.gym .plan{background:var(--paper);border:1px solid rgba(17,23,21,.18);padding:40px 34px;display:flex;flex-direction:column}
.gym .plan.featured{background:var(--forest);color:var(--bone);border-color:var(--brass);padding:56px 34px;box-shadow:0 30px 60px -30px rgba(13,27,23,.6)}
.gym .plan h3{font-size:30px}
.gym .price{font:400 64px 'Bodoni Moda',serif;margin:18px 0 4px;line-height:1}
.gym .price small{font:400 15px 'Hanken Grotesk'}
.gym .plan>small{color:#55605b}
.gym .plan.featured>small{color:var(--mist)}
.gym .plan ul{padding:20px 0 0;margin:24px 0 32px;flex:1;list-style:none;border-top:1px solid rgba(128,128,128,.3)}
.gym .plan li{padding:6px 0 6px 20px;position:relative}
.gym .plan li::before{content:"";position:absolute;left:0;top:17px;width:8px;height:1px;background:var(--brass)}
.gym .plan .btn{text-align:center}
.gym .plan.featured .btn{background:var(--brass);border-color:var(--brass);color:var(--forest)}
.gym .join{display:grid;grid-template-columns:1fr 1fr;gap:80px}
.gym label{display:block;font-size:14px;color:var(--mist);margin-bottom:28px}
.gym input,.gym select{display:block;width:100%;margin-top:4px;padding:12px 0;font:400 18px 'Hanken Grotesk';color:var(--bone);background:transparent;border:0;border-bottom:1px solid rgba(235,230,218,.4);border-radius:0}
.gym input:focus,.gym select:focus{outline:0;border-bottom-color:var(--brass)}
.gym select option{color:#111}
.gym .err{color:#e7a39b;margin:-12px 0 24px}
.gym .ok{border:1px solid var(--brass);padding:40px}
.gym .ok h3{font-size:36px;margin-bottom:10px}
.gym .ok p{color:var(--mist);margin:0}
.gym footer{border-top:1px solid rgba(184,151,90,.25);padding:56px 0;font-size:14px;color:var(--mist)}
.gym footer .wrap{display:flex;justify-content:space-between;gap:32px;flex-wrap:wrap}
.gym footer strong{font:400 22px 'Bodoni Moda',serif;color:var(--bone)}
.gym .moss{background:var(--moss)}
.gym .rem{display:grid;grid-template-columns:1fr 1.2fr;gap:80px;align-items:start}
.gym .rem-card{border:1px solid rgba(184,151,90,.35);padding:32px;margin-bottom:20px}
.gym .rem-head{display:flex;justify-content:space-between;align-items:center;gap:16px;margin-bottom:12px}
.gym .rem-head h3{font-size:28px}
.gym .rem select{width:auto;min-width:200px;margin-top:8px}
.gym .sw{position:relative;width:48px;height:26px;border-radius:99px;border:1px solid var(--brass);background:transparent;cursor:pointer;padding:0;flex:none}
.gym .sw::after{content:"";position:absolute;top:3px;left:3px;width:18px;height:18px;border-radius:50%;background:var(--brass);transition:transform .2s}
.gym .sw[aria-checked="true"]{background:rgba(184,151,90,.28)}
.gym .sw[aria-checked="true"]::after{transform:translateX(22px)}
.gym .meal{display:grid;grid-template-columns:1fr auto auto;gap:20px;align-items:center;padding:14px 0;border-bottom:1px solid rgba(184,151,90,.2)}
.gym .meal input{width:auto;margin:0;padding:6px 0;font-size:16px;color-scheme:dark}
.gym .note{color:var(--mist);font-size:14px;margin:14px 0 0}
.gym .toast{position:fixed;right:24px;bottom:24px;z-index:20;max-width:340px;background:var(--bone);color:var(--ink);padding:20px 22px;border-left:4px solid var(--brass);box-shadow:0 20px 50px -20px rgba(0,0,0,.6)}
.gym .toast strong{font:400 22px 'Bodoni Moda',serif;display:block;margin-bottom:2px}
.gym .toast button{background:none;border:0;color:#55605b;cursor:pointer;margin-top:8px;padding:0;font:500 14px 'Hanken Grotesk';text-decoration:underline}
@media(max-width:860px){
.gym .rem{gap:32px}
.gym .toast{left:16px;right:16px;bottom:16px;max-width:none}
.gym .hero .wrap,.gym .join,.gym .trainers,.gym .plans,.gym .rem{grid-template-columns:1fr}
.gym .hero{padding:72px 0}
.gym .join{gap:32px}
.gym .amen .wrap{grid-template-columns:1fr 1fr}
.gym .amen .wrap>div:nth-child(odd){border-left:0;padding-left:0}
.gym .links a:not(.btn){display:none}
.gym section{padding:72px 0}
.gym .slot{grid-template-columns:96px 1fr}.gym .slot span:last-child{grid-column:2}
.gym .plan.featured{padding:40px 34px}
}
@media(prefers-reduced-motion:no-preference){.gym svg rect.plate{animation:drop .3s ease-out}}
@media(prefers-reduced-motion:reduce){.gym *{transition:none!important}}
@keyframes drop{from{transform:translateY(-14px);opacity:0}to{transform:none;opacity:1}}
`;

const PLATE = { 5: [64, 0.55], 10: [92, 0.75], 15: [120, 0.9], 20: [150, 1] };

function Barbell() {
  const [load, setLoad] = useState([]); // plates per side
  const total = 20 + 2 * load.reduce((a, b) => a + b, 0);
  const add = (w) => load.length < 5 && setLoad([...load, w]);
  const label = total <= 20 ? "Empty bar. Add some plates." : total < 80 ? "Solid warm-up." : total < 140 ? "Now we're training." : "Heavy. Chalk up.";
  return (
    <div className="rack">
      <small>Load the bar</small>
      <svg viewBox="0 0 520 190" role="img" aria-label={`Barbell loaded to ${total} kilograms`}>
        <rect x="10" y="92" width="500" height="8" fill="#9FADA6" />
        <rect x="200" y="86" width="120" height="20" fill="#B8975A" opacity=".4" />
        {load.map((w, i) => {
          const [h, o] = PLATE[w];
          return (
            <g key={i}>
              <rect className="plate" x={190 - (i + 1) * 22} y={96 - h / 2} width="18" height={h} fill="#B8975A" fillOpacity={o} stroke="#EBE6DA" strokeOpacity=".45" />
              <rect className="plate" x={330 + i * 22} y={96 - h / 2} width="18" height={h} fill="#B8975A" fillOpacity={o} stroke="#EBE6DA" strokeOpacity=".45" />
            </g>
          );
        })}
      </svg>
      <div className="total">{total} kg</div>
      <p style={{ margin: "6px 0 0", color: "#9FADA6" }}>{label}</p>
      <div className="plates">
        {[5, 10, 15, 20].map((w) => (
          <button key={w} onClick={() => add(w)} disabled={load.length >= 5}>Add {w} kg</button>
        ))}
        <button onClick={() => setLoad(load.slice(0, -1))} disabled={!load.length}>Undo</button>
        <button onClick={() => setLoad([])} disabled={!load.length}>Clear</button>
      </div>
    </div>
  );
}

function Schedule() {
  const [day, setDay] = useState("Mon");
  return (
    <>
      <div className="tabs" role="tablist" aria-label="Day of the week">
        {Object.keys(schedule).map((d) => (
          <button key={d} role="tab" aria-selected={day === d} onClick={() => setDay(d)}>{d}</button>
        ))}
      </div>
      <div role="tabpanel">
        {schedule[day].map(([time, name, coach]) => (
          <div className="slot" key={time}>
            <span>{time}</span>
            <strong>{name}</strong>
            <span>with {coach}</span>
          </div>
        ))}
      </div>
    </>
  );
}

function Pricing({ onPick }) {
  const [annual, setAnnual] = useState(false);
  return (
    <>
      <div className="toggle">
        <button aria-pressed={!annual} onClick={() => setAnnual(false)}>Monthly</button>
        <button aria-pressed={annual} onClick={() => setAnnual(true)}>Yearly, save 20%</button>
      </div>
      <div className="plans">
        {plans.map((p) => (
          <div key={p.id} className={`plan${p.featured ? " featured" : ""}`}>
            <h3>{p.id}</h3>
            <div className="price">{CURRENCY}{annual ? Math.round(p.monthly * 0.8) : p.monthly}<small> /month</small></div>
            <small>{annual ? "Billed yearly" : "Cancel any month"}</small>
            <ul>{p.perks.map((x) => <li key={x}>{x}</li>)}</ul>
            <a href="#join" className="btn" onClick={() => onPick(p.id)}>Choose {p.id}</a>
          </div>
        ))}
      </div>
    </>
  );
}

function Join({ plan, setPlan }) {
  const [f, setF] = useState({ name: "", email: "" });
  const [err, setErr] = useState("");
  const [done, setDone] = useState(false);

  const submit = (e) => {
    e.preventDefault();
    if (f.name.trim().length < 2) return setErr("Enter your full name.");
    if (!/^\S+@\S+\.\S+$/.test(f.email)) return setErr("Enter a valid email address.");
    setErr("");
    // TODO: save to Firestore, e.g. addDoc(collection(db, "leads"), { ...f, plan })
    setDone(true);
  };

  return (
    <div className="join">
      <div>
        <h2>Book a free first session</h2>
        <p className="lead">Tour the floor, meet a coach and try a class. No card needed. We reply within one working day.</p>
      </div>
      {done ? (
        <div className="ok" role="status">
          <h3>You're booked in, {f.name.split(" ")[0]}.</h3>
          <p>We'll email {f.email} to confirm a time for your {plan} intro.</p>
        </div>
      ) : (
        <form onSubmit={submit} noValidate>
          <label>Full name<input value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} autoComplete="name" /></label>
          <label>Email<input type="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} autoComplete="email" /></label>
          <label>Plan you're curious about
            <select value={plan} onChange={(e) => setPlan(e.target.value)}>
              {plans.map((p) => <option key={p.id}>{p.id}</option>)}
            </select>
          </label>
          {err && <p className="err" role="alert">{err}</p>}
          <button className="btn blue" type="submit">Book my session</button>
        </form>
      )}
    </div>
  );
}

const MEALS = [
  { id: "b", label: "Breakfast", time: "08:00", on: true },
  { id: "l", label: "Lunch", time: "13:00", on: true },
  { id: "s", label: "Snack", time: "17:00", on: false },
  { id: "d", label: "Dinner", time: "20:30", on: true },
];
const KEY = "ironline-reminders";
const saved = () => {
  try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { return {}; }
};

function Reminders() {
  const [water, setWater] = useState(() => saved().water || { on: false, mins: 60 });
  const [meals, setMeals] = useState(() => saved().meals || MEALS);
  const [perm, setPerm] = useState(typeof Notification === "undefined" ? "unsupported" : Notification.permission);
  const [toast, setToast] = useState(null);
  const fired = useRef({});
  const [token, setToken] = useState(null);
  const [bg, setBg] = useState("off"); // off | on | error
  const bgOn = useRef(false);
  bgOn.current = bg === "on";

  // Shows an on-page alert, plus a browser notification when allowed.
  const notify = (title, body) => {
    if (bgOn.current && document.hidden) return; // the server push covers hidden tabs
    setToast({ title, body });
    if (perm === "granted") {
      try { new Notification(title, { body }); } catch (e) { /* ignore */ }
    }
  };
  const live = useRef(notify);
  live.current = notify;

  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify({ water, meals })); } catch (e) { /* ignore */ }
  }, [water, meals]);

  useEffect(() => {
    if (!water.on) return;
    const id = setInterval(() => live.current("Time for water", "Drink a glass of water now."), water.mins * 60000);
    return () => clearInterval(id);
  }, [water.on, water.mins]);

  useEffect(() => {
    const id = setInterval(() => {
      const d = new Date();
      const hm = d.toTimeString().slice(0, 5);
      const stamp = d.toDateString() + hm;
      meals.forEach((m) => {
        if (m.on && m.time === hm && fired.current[m.id] !== stamp) {
          fired.current[m.id] = stamp;
          live.current(`${m.label} reminder`, `It's ${m.label.toLowerCase()} time. Eat your planned meal.`);
        }
      });
    }, 15000);
    return () => clearInterval(id);
  }, [meals]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 9000);
    return () => clearTimeout(t);
  }, [toast]);

  useEffect(() => {
    if (perm !== "granted") return;
    registerPush().then(setToken).catch(() => setBg("error"));
  }, [perm]);

  useEffect(() => {
    if (!token) return;
    const t = setTimeout(() => {
      saveSubscription(token, water, meals).then(() => setBg("on")).catch(() => setBg("error"));
    }, 600);
    return () => clearTimeout(t);
  }, [token, water, meals]);

  const enable = async () => setPerm(await Notification.requestPermission());
  const setMeal = (id, patch) => setMeals(meals.map((m) => (m.id === id ? { ...m, ...patch } : m)));

  return (
    <>
      <div className="rem">
        <div>
          <h2>Stay on plan</h2>
          <p className="lead">Set water and meal reminders. Turn on notifications and we'll send them to your device even when this site is closed.</p>
          {perm === "default" && <button className="btn blue" onClick={enable}>Turn on notifications</button>}
          {perm === "granted" && <p className="note">Browser notifications are on.</p>}
          {perm === "denied" && <p className="note">Notifications are blocked. Allow them in your browser's site settings, or rely on the on-page alerts.</p>}
          {perm === "unsupported" && <p className="note">This browser doesn't support notifications. You'll get on-page alerts instead.</p>}
          {bg === "on" && <p className="note">Background reminders are on. They arrive even when this site is closed.</p>}
          {bg === "error" && <p className="note">Background reminders couldn't be set up. On-page reminders still work.</p>}
          <p><button className="btn" onClick={() => notify("Test reminder", "This is how your reminders will look.")}>Send a test reminder</button></p>
        </div>
        <div>
          <div className="rem-card">
            <div className="rem-head">
              <h3>Water</h3>
              <button className="sw" role="switch" aria-checked={water.on} aria-label="Water reminders" onClick={() => setWater({ ...water, on: !water.on, since: Date.now() })} />
            </div>
            <label>Remind me every
              <select value={water.mins} onChange={(e) => setWater({ ...water, mins: Number(e.target.value), since: Date.now() })}>
                {[30, 45, 60, 90, 120].map((n) => <option key={n} value={n}>{n} minutes</option>)}
              </select>
            </label>
          </div>
          <div className="rem-card">
            <div className="rem-head"><h3>Meals</h3></div>
            {meals.map((m) => (
              <div className="meal" key={m.id}>
                <span>{m.label}</span>
                <input type="time" aria-label={`${m.label} time`} value={m.time} onChange={(e) => setMeal(m.id, { time: e.target.value })} />
                <button className="sw" role="switch" aria-checked={m.on} aria-label={`${m.label} reminder`} onClick={() => setMeal(m.id, { on: !m.on })} />
              </div>
            ))}
            <p className="note">Each meal reminder fires once a day at the time you set.</p>
          </div>
        </div>
      </div>
      {toast && (
        <div className="toast" role="status">
          <strong>{toast.title}</strong>
          {toast.body}
          <br /><button onClick={() => setToast(null)}>Dismiss</button>
        </div>
      )}
    </>
  );
}

function Accordion() {
  const [open, setOpen] = useState(0);
  return (
    <div className="rows">
      {programs.map((p, i) => (
        <div className={`row${open === i ? " open" : ""}`} key={p.name}>
          <button aria-expanded={open === i} onClick={() => setOpen(open === i ? -1 : i)}>
            <span className="t">{p.name}</span>
            <span className="plus" aria-hidden="true" />
          </button>
          <div className="more"><p>{p.text}</p></div>
        </div>
      ))}
    </div>
  );
}

export default function GymSite() {
  const [plan, setPlan] = useState("Full access");
  return (
    <div className="gym">
      <style>{css}</style>

      <nav>
        <div className="wrap">
          <a href="#top" className="logo">{BRAND}</a>
          <div className="links">
            <a href="#programs">Programs</a>
            <a href="#schedule">Schedule</a>
            <a href="#coaches">Coaches</a>
            <a href="#reminders">Reminders</a>
            <a href="#pricing">Pricing</a>
            <a href="#join" className="btn blue">Free session</a>
          </div>
        </div>
      </nav>

      <header className="hero" id="top">
        <div className="wrap">
          <div>
            <h1>Serious training, quietly done.</h1>
            <p>A private, coached strength club with competition equipment, small classes and a recovery suite. It feels like yours by the second week.</p>
            <div className="actions">
              <a href="#join" className="btn blue">Book a free session</a>
              <a href="#pricing" className="btn ghost">See pricing</a>
            </div>
          </div>
          <Barbell />
        </div>
      </header>

      <section className="amen">
        <div className="wrap">
          {[["Competition racks", "Calibrated plates, deadlift platforms and chalk welcome."], ["Recovery suite", "Sauna and cold plunge, included with every plan."], ["Private lockers", "Full length lockers, fresh towels and showers."], ["Small classes", "Twelve people at most, always with a coach."]].map(([t, d]) => (
            <div key={t}><h3>{t}</h3><p>{d}</p></div>
          ))}
        </div>
      </section>

      <section id="programs">
        <div className="wrap">
          <h2>Four ways to train</h2>
          <p className="lead">Pick one or mix them. Every session is coached and scaled to you.</p>
          <Accordion />
        </div>
      </section>

      <section id="schedule" className="light">
        <div className="wrap">
          <h2>This week's classes</h2>
          <p className="lead">Classes cap at 12 people. Members reserve a spot in the app.</p>
          <Schedule />
        </div>
      </section>

      <section id="coaches">
        <div className="wrap">
          <h2>Your coaches</h2>
          <p className="lead">Certified, patient and genuinely into this.</p>
          <div className="trainers">
            {trainers.map((t) => (
              <article key={t.name}>
                <div className="avatar" aria-hidden="true">{t.name[0]}</div>
                <h3>{t.name}</h3>
                <em>{t.role}</em>
                <p>{t.bio}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="reminders" className="moss">
        <div className="wrap"><Reminders /></div>
      </section>

      <section id="pricing" className="light">
        <div className="wrap">
          <h2>Simple pricing</h2>
          <p className="lead">No joining fee. Pause or cancel from your account.</p>
          <Pricing onPick={setPlan} />
        </div>
      </section>

      <section id="join">
        <div className="wrap"><Join plan={plan} setPlan={setPlan} /></div>
      </section>

      <footer>
        <div className="wrap">
          <div><strong>{BRAND}</strong><br />12 Example Street, Your City</div>
          <div>Mon to Fri 5:30 am to 10 pm<br />Sat and Sun 7 am to 8 pm</div>
          <div>hello@ironline.example<br />+00 000 000 0000</div>
        </div>
      </footer>
    </div>
  );
}
