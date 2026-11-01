const { onSchedule } = require("firebase-functions/v2/scheduler");
const admin = require("firebase-admin");
admin.initializeApp();

const localTime = (tz, d) =>
  new Intl.DateTimeFormat("en-GB", { timeZone: tz, hour: "2-digit", minute: "2-digit", hour12: false }).format(d);

exports.sendReminders = onSchedule("every 1 minutes", async () => {
  const now = new Date();
  const nowMin = Math.floor(now.getTime() / 60000);
  const snap = await admin.firestore().collection("reminderSubs").get();

  await Promise.all(snap.docs.map(async (d) => {
    const s = d.data();
    if (typeof s.token !== "string" || typeof s.tz !== "string") {
      console.error(`Skipping reminder subscription ${d.id}: missing token or time zone.`);
      return;
    }

    const due = [];

    if (s.water && s.water.on && Number.isInteger(s.water.mins) && s.water.mins > 0 && Number.isFinite(s.water.since)) {
      const elapsed = nowMin - Math.floor(s.water.since / 60000);
      if (elapsed > 0 && elapsed % s.water.mins === 0) {
        due.push({ title: "Time for water", body: "Drink a glass of water now.", tag: "water" });
      }
    }

    let local;
    try {
      local = localTime(s.tz, now);
    } catch (error) {
      console.error(`Skipping reminder subscription ${d.id}: invalid time zone.`, error);
      return;
    }
    for (const m of Array.isArray(s.meals) ? s.meals : []) {
      if (m && m.on && typeof m.id === "string" && typeof m.label === "string" && m.time === local) {
        due.push({ title: `${m.label} reminder`, body: `It's ${m.label.toLowerCase()} time. Eat your planned meal.`, tag: m.id });
      }
    }

    for (const data of due) {
      try {
        await admin.messaging().send({ token: s.token, data });
      } catch (error) {
        if (/not-registered|invalid-argument|invalid-registration/.test(error.code || "")) {
          await d.ref.delete();
          return;
        }
        console.error(`Failed to send reminder for subscription ${d.id}.`, error);
        throw error;
      }
    }
  }));
});
