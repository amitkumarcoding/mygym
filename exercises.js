const F = 'M10 150H230'
const bench = `${F}M28 134H142M40 134V150M130 134V150`
const hang = (y) => `M70 ${y}H170M70 ${y}V180M170 ${y}V180`
const st = { k: 'A', f: [110, 146] }

export const exercises = {
  Chest: [
    { n: 'Barbell bench press', s: '4 × 6–8', t: 'Shoulder blades pinned back, feet planted. Lower to mid chest, press up.', k: 'P', f: [95, 128], A: [180, -90, -90, -30, 75], B: [180, 5, -90, -30, 75], q: 'bar', g: bench },
    { n: 'Incline dumbbell press', s: '3 × 8–12', t: 'Bench at 30–45°. Press up and slightly in, lower with control.', k: 'P', f: [110, 112], A: [-135, -80, -85, 0, 90], B: [-135, 50, -100, 0, 90], q: 'db', g: `${F}M126 128L66 68M92 119H136M104 119V150M128 119V150` },
    { n: 'Push-up', s: '3 × 12–15', t: 'Body in one straight line. Chest to the floor, elbows about 45°.', k: 'A', f: [50, 146], A: [-26, 90, 90, 154, 154], B: [-12, 165, 45, 168, 168], g: F },
    { n: 'Chest dip', s: '3 × 8–12', t: 'Lean forward slightly. Lower until elbows reach 90°, then push up.', k: 'W', f: [120, 95], A: [-80, 90, 90, 100, 150], B: [-65, 160, 45, 100, 150], g: `${F}M92 95H152M104 95V150M140 95V150` },
    { n: 'Dumbbell bench press', s: '3 × 8–12', t: 'Dumbbells over shoulders, feet planted. Lower to chest level, press up and together.', k: 'P', f: [95, 128], A: [180, -90, -90, -30, 75], B: [180, 15, -90, -30, 75], q: 'db', g: bench },
    { n: 'Cable crossover', s: '3 × 12–15', t: 'Slight bend in the elbows. Sweep the handles down and together, squeeze your chest.', ...st, A: [-80, -150, -150, 90, 90], B: [-80, 55, 50, 90, 90], q: 'cab', c: [8, 12], g: F },
    { n: 'Incline push-up', s: '3 × 12–15', t: 'Hands on a bench, body in one line. Lower your chest to the edge, press away.', k: 'A', f: [30, 146], A: [-50, 90, 90, 130, 130], B: [-44, 150, 55, 134, 134], g: `${F}M96 106H146M104 106V150M138 106V150` },
    { n: 'Incline barbell press', s: '4 × 6–8', t: 'Bench at 30–45°. Lower the bar to your upper chest, then press up and slightly back.', k: 'P', f: [110, 112], A: [-135, -80, -85, 0, 90], B: [-135, 50, -100, 0, 90], q: 'bar', g: `${F}M126 128L66 68M92 119H136M104 119V150M128 119V150` },
    { n: 'Dumbbell fly', s: '3 × 10–12', t: 'Soft bend in the elbows. Open your arms in a wide arc until you feel a stretch, then hug them back together.', k: 'P', f: [95, 128], A: [180, -90, -90, -30, 75], B: [180, 10, 5, -30, 75], q: 'db', g: bench },
    { n: 'Incline dumbbell fly', s: '3 × 10–12', t: 'Bench at 30°. Lower the dumbbells in a wide arc with soft elbows, then squeeze them back over your upper chest.', k: 'P', f: [110, 112], A: [-135, -80, -80, 0, 90], B: [-135, 30, 20, 0, 90], q: 'db', g: `${F}M126 128L66 68M92 119H136M104 119V150M128 119V150` },
    { n: 'Machine chest press', s: '3 × 10–12', t: 'Handles at mid-chest height, back flat on the pad. Press forward without locking out, return slowly.', k: 'P', f: [90, 112], A: [-92, 0, 0, 0, 90], B: [-92, 168, 2, 0, 90], q: 'ank', g: `${F}M60 119H112M86 119V150M60 119L58 56` },
    { n: 'Dumbbell pullover', s: '3 × 10–12', t: 'Upper back on a bench, one dumbbell held with both hands. Lower it behind your head with straight arms, then pull back over your chest.', k: 'P', f: [112, 128], A: [180, -90, -90, -30, 75], B: [180, -180, -180, -30, 75], q: 'db', g: bench },
  ],
  Back: [
    { n: 'Deadlift', s: '3 × 5', t: 'Bar over mid-foot, brace your core. Push the floor away, lock hips at the top.', ...st, A: [-80, 90, 90, 95, 95], B: [-30, 90, 90, 15, 100], q: 'bar', g: F },
    { n: 'Lat pulldown', s: '3 × 10–12', t: 'Lean back slightly. Pull the bar to upper chest, elbows down and back.', k: 'P', f: [100, 112], A: [-100, -75, -80, 0, 90], B: [-100, 110, -10, 0, 90], q: 'cab', c: [132, 8], g: `${F}M70 119H120M96 119V150` },
    { n: 'Seated cable row', s: '3 × 10–12', t: 'Chest tall. Pull the handle to your belly and squeeze your shoulder blades.', k: 'P', f: [70, 128], A: [-92, 0, 0, 5, 5], B: [-96, 160, 5, 5, 5], q: 'cab', c: [228, 100], g: `${F}M44 134H100M60 134V150M146 100V150` },
    { n: 'Pull-up', s: '3 × max', t: 'Start from a dead hang. Pull your chest to the bar, lower under control.', k: 'W', f: [120, 22], A: [-90, -90, -90, 90, 150], B: [-90, -260, -80, 90, 150], v: '0 -10 240 190', g: hang(22) },
    { n: 'Barbell bent-over row', s: '4 × 8–10', t: 'Hinge until your torso is near parallel. Row the bar to your belly, elbows back.', k: 'A', f: [100, 146], A: [-35, 90, 90, 70, 110], B: [-35, 145, 90, 70, 110], q: 'bar', g: F },
    { n: 'Single-arm dumbbell row', s: '3 × 10 each', t: 'Flat back, hand braced on a bench. Pull the dumbbell to your hip, not your shoulder.', k: 'A', f: [100, 146], A: [-18, 90, 90, 70, 110], B: [-18, 150, 70, 70, 110], q: 'db', g: `${F}M130 100H190M140 100V150M180 100V150` },
    { n: 'Straight-arm pulldown', s: '3 × 12–15', t: 'Arms nearly straight, slight lean. Sweep the bar down to your thighs with your lats.', ...st, A: [-82, -35, -35, 90, 90], B: [-82, 80, 75, 90, 90], q: 'cab', c: [160, 8], g: F },
    { n: 'Back extension', s: '3 × 12–15', t: 'Hinge at the hips, flat back. Rise until your body is straight, squeeze glutes at the top.', k: 'P', f: [120, 100], A: [128, 30, 150, 0, 0], B: [185, 30, 150, 0, 0], g: `${F}M96 108H138M110 108V150M164 108V150M150 108H178` },
    { n: 'Chin-up', s: '3 × max', t: 'Underhand grip, shoulder-width. Pull until your chin clears the bar, lower to a full hang.', k: 'W', f: [120, 22], A: [-90, -90, -90, 90, 150], B: [-90, -260, -80, 90, 150], v: '0 -10 240 190', g: hang(22) },
    { n: 'Rack pull', s: '3 × 5', t: 'Bar set at knee height. Brace your core, drive your hips through and stand tall with a straight back.', ...st, A: [-80, 90, 90, 95, 95], B: [-45, 90, 90, 45, 100], q: 'bar', g: F },
    { n: 'Good morning', s: '3 × 8–10', t: 'Bar on your upper back, soft knees. Push your hips back until your torso is near parallel, then drive hips forward.', ...st, A: [-85, 60, -120, 92, 92], B: [-20, 60, -120, 70, 100], q: 'bar', g: F },
    { n: 'Superman', s: '3 × 12', t: 'Face down, arms reaching forward. Lift arms, chest and legs a few inches, pause, lower slowly.', k: 'P', f: [110, 141], A: [180, 180, 180, 0, 0], B: [195, 195, 195, -16, -16], g: F },
    { n: 'Pendlay row', s: '4 × 5–6', t: 'Torso near parallel, bar resting on the floor each rep. Explode the bar to your lower chest, lower it back to the floor.', k: 'A', f: [100, 146], A: [-10, 90, 90, 60, 110], B: [-10, 150, 90, 60, 110], q: 'bar', g: F },
  ],
  Legs: [
    { n: 'Barbell squat', s: '4 × 6–8', t: 'Bar on upper back, chest up. Sit between your hips, knees track toes.', ...st, A: [-90, 60, -120, 90, 90], B: [-55, 60, -120, 8, 108], q: 'bar', g: F },
    { n: 'Romanian deadlift', s: '3 × 8–10', t: 'Soft knees, push hips back. Bar slides down your thighs, then drive hips forward.', ...st, A: [-85, 90, 90, 92, 92], B: [-20, 110, 110, 60, 100], q: 'bar', g: F },
    { n: 'Leg press', s: '3 × 10–12', t: 'Feet shoulder-width. Lower until knees reach 90°, never lock out hard.', k: 'P', f: [80, 110], A: [-135, 40, 20, -70, 20], B: [-135, 40, 20, -40, -40], q: 'ank', g: `${F}M90 122L44 76M118 104L140 44` },
    { n: 'Barbell hip thrust', s: '3 × 8–12', t: 'Upper back on a bench, drive through heels. Squeeze glutes hard at the top.', k: 'A', f: [120, 146], A: [-155, 15, 20, -30, 90], B: [-170, 15, 20, 0, 90], q: 'bar', g: `${F}M26 118H74M38 118V150M62 118V150` },
    { n: 'Lunge', s: '3 × 10 each', t: 'Long stride, torso tall. Drop your back knee toward the floor, drive through the front heel.', k: 'A', f: [130, 146], A: [-90, 90, 90, 70, 105, 120, 135], B: [-90, 90, 90, 15, 100, 100, 160], q: 'db', g: F },
    { n: 'Goblet squat', s: '3 × 10–12', t: 'Hold the dumbbell at your chest. Sit between your heels, keep your chest tall.', ...st, A: [-90, 80, -40, 90, 90], B: [-72, 80, -40, 5, 105], q: 'db', g: F },
    { n: 'Leg extension', s: '3 × 12–15', t: 'Back flat on the pad. Extend until your legs are straight, pause, lower slowly.', k: 'P', f: [80, 112], A: [-95, 100, 60, 0, 90], B: [-95, 100, 60, 0, -4], q: 'ank', g: `${F}M56 119H108M80 119V150` },
    { n: 'Lying leg curl', s: '3 × 10–12', t: 'Hips pressed into the pad. Curl your heels toward your glutes, lower for 2 seconds.', k: 'P', f: [100, 128], A: [180, 180, 180, 0, 3], B: [180, 180, 180, 0, -105], q: 'ank', g: `${F}M26 134H138M40 134V150M126 134V150` },
    { n: 'Standing calf raise', s: '4 × 12–15', t: 'Balls of your feet on a step. Rise high, pause, then lower below the step.', ...st, A: [-90, 90, 90, 90, 90], B: [-90, 90, 90, 90, 90], lift: 12, g: `${F}M70 138H150` },
    { n: 'Front squat', s: '4 × 6–8', t: 'Bar on your front shoulders, elbows high. Keep your torso upright and sit straight down.', ...st, A: [-90, -15, -150, 90, 90], B: [-72, -15, -150, 8, 108], q: 'bar', g: F },
    { n: 'Reverse lunge', s: '3 × 10 each', t: 'Step back and drop your rear knee toward the floor. Push through your front heel to stand.', k: 'A', f: [130, 146], A: [-90, 90, 90, 90, 90, 90, 90], B: [-90, 90, 90, 15, 100, 100, 160], q: 'db', g: F },
    { n: 'Single-leg Romanian deadlift', s: '3 × 8 each', t: 'Soft knee on your standing leg. Hinge forward as the other leg reaches back, then squeeze your glute to stand.', k: 'A', f: [110, 146], A: [-85, 90, 90, 90, 92, 90, 92], B: [-10, 90, 90, 80, 92, 170, 170], q: 'db', g: F },
    { n: 'Glute bridge', s: '3 × 12–15', t: 'Lie on your back, knees bent. Drive through your heels, lift your hips, squeeze your glutes at the top.', k: 'A', f: [120, 146], A: [180, 0, 0, -65, 90], B: [160, 10, 10, -20, 90], g: F },
    { n: 'Seated calf raise', s: '4 × 12–15', t: 'Pad on your lower thighs. Rise onto your toes, pause, and lower until you feel a deep stretch.', k: 'P', f: [100, 112], A: [-80, 75, 20, 0, 90], B: [-80, 75, 20, 0, 90], lift: 8, g: `${F}M70 119H120M96 119V150` },
    { n: 'Wall sit', s: '3 × 45 s', t: 'Back flat on the wall, thighs parallel to the floor, knees over ankles. Hold and breathe.', k: 'A', f: [110, 146], A: [-90, 90, 0, 0, 90], B: [-90, 90, 0, 2, 90], g: `${F}M66 40V150` },
  ],
  Shoulders: [
    { n: 'Barbell overhead press', s: '4 × 6–8', t: 'Squeeze glutes and core. Press straight up, head through at the top.', ...st, A: [-90, 70, -110, 90, 90], B: [-90, -90, -90, 90, 90], q: 'bar', v: '0 -32 240 192', g: F },
    { n: 'Dumbbell front raise', s: '3 × 12', t: 'Slight bend in the elbows. Raise to shoulder height, lower slowly.', ...st, A: [-90, 90, 90, 90, 90], B: [-90, -5, -5, 90, 90], q: 'db', g: F },
    { n: 'Face pull', s: '3 × 15', t: 'Pull the rope toward your forehead, elbows high. Pause and squeeze.', ...st, A: [-90, 0, 0, 90, 90], B: [-90, -170, -30, 90, 90], q: 'cab', c: [232, 34], g: F },
    { n: 'Upright row', s: '3 × 10–12', t: 'Pull the bar up along your body, elbows leading. Stop at chest height.', ...st, A: [-90, 90, 90, 90, 90], B: [-90, -30, 120, 90, 90], q: 'bar', g: F },
    { n: 'Seated dumbbell press', s: '3 × 8–12', t: 'Back against the pad. Press the dumbbells overhead until your arms are straight, lower to ear height.', k: 'P', f: [100, 112], A: [-90, 70, -110, 0, 90], B: [-90, -88, -90, 0, 90], q: 'db', v: '0 -20 240 180', g: `${F}M70 119H120M96 119V150` },
    { n: 'Arnold press', s: '3 × 8–10', t: 'Start with palms facing you at chest height. Rotate and press overhead in one smooth arc.', k: 'P', f: [100, 112], A: [-90, 30, -100, 0, 90], B: [-90, -88, -90, 0, 90], q: 'db', v: '0 -20 240 180', g: `${F}M70 119H120M96 119V150` },
    { n: 'Push press', s: '4 × 5', t: 'Dip with an upright torso, then drive your legs and press the bar overhead.', ...st, A: [-90, 70, -110, 55, 120], B: [-90, -90, -90, 90, 90], q: 'bar', v: '0 -32 240 192', g: F },
    { n: 'Seated barbell press', s: '3 × 8–10', t: 'Back against the pad. Press the bar overhead from chin height, lower under control.', k: 'P', f: [100, 112], A: [-90, 70, -110, 0, 90], B: [-90, -88, -90, 0, 90], q: 'bar', v: '0 -20 240 180', g: `${F}M70 119H120M96 119V150` },
    { n: 'Standing dumbbell press', s: '3 × 8–12', t: 'Squeeze glutes and core. Press both dumbbells overhead until your arms are straight, lower to shoulder height.', ...st, A: [-90, 70, -110, 90, 90], B: [-90, -90, -90, 90, 90], q: 'db', v: '0 -32 240 192', g: F },
    { n: 'Landmine press', s: '3 × 10 each', t: 'Hold the end of the bar at your shoulder. Press up and forward along its arc, lower slowly.', ...st, A: [-82, 45, -55, 90, 90], B: [-82, -45, -45, 90, 90], q: 'bar', v: '0 -32 240 192', g: `${F}M20 146L96 100` },
    { n: 'Cable front raise', s: '3 × 12', t: 'Face the low pulley, slight bend in the elbows. Raise the handle to shoulder height, lower slowly.', ...st, A: [-90, 90, 90, 90, 90], B: [-90, -5, -5, 90, 90], q: 'cab', c: [232, 146], g: F },
  ],
  Arms: [
    { n: 'Barbell curl', s: '3 × 8–10', t: 'Elbows pinned to your sides. Curl up, squeeze, lower for 2 seconds.', ...st, A: [-90, 92, 80, 90, 90], B: [-90, 92, -80, 90, 90], q: 'bar', g: F },
    { n: 'Hammer curl', s: '3 × 10', t: 'Thumbs up, neutral grip. Curl without swinging your torso.', ...st, A: [-90, 92, 80, 90, 90], B: [-90, 92, -100, 90, 90], q: 'db', g: F },
    { n: 'Triceps rope pushdown', s: '3 × 10–12', t: 'Elbows fixed at your sides. Push down and spread the rope at the bottom.', ...st, A: [-90, 90, -35, 90, 90], B: [-90, 90, 80, 90, 90], q: 'cab', c: [128, 8], g: F },
    { n: 'Skull crusher', s: '3 × 10', t: 'Upper arms stay still. Lower the bar toward your forehead, extend back up.', k: 'P', f: [95, 128], A: [180, -90, -90, -30, 75], B: [180, -100, -190, -30, 75], q: 'bar', g: bench },
    { n: 'Incline dumbbell curl', s: '3 × 10–12', t: 'Lean back on an incline bench, arms hanging. Curl up without swinging, lower fully.', k: 'P', f: [100, 118], A: [-140, 90, 90, 0, 90], B: [-140, 90, -75, 0, 90], q: 'db', g: `${F}M70 125H124M96 125V150M64 100L100 125` },
    { n: 'Overhead triceps extension', s: '3 × 10–12', t: 'Elbows point to the ceiling. Lower the dumbbell behind your head, extend fully.', ...st, A: [-90, -80, -80, 90, 90], B: [-90, -80, 165, 90, 90], q: 'db', v: '0 -32 240 192', g: F },
    { n: 'Cable curl', s: '3 × 12', t: 'Elbows fixed at your sides. Curl the handle up, hold for a beat, lower slowly.', ...st, A: [-90, 92, 80, 90, 90], B: [-90, 92, -80, 90, 90], q: 'cab', c: [232, 146], g: F },
    { n: 'Bench dip', s: '3 × 10–15', t: 'Hands on a bench behind you, hips close. Lower until elbows reach 90°, press up.', k: 'W', f: [76, 106], A: [-92, 98, 98, 20, 90], B: [-68, 160, 45, 2, 70], g: `${F}M44 106H100M54 106V150M90 106V150` },
    { n: 'Dumbbell curl', s: '3 × 10–12', t: 'Palms forward, elbows pinned. Curl up, squeeze at the top, lower for 2 seconds.', ...st, A: [-90, 92, 80, 90, 90], B: [-90, 92, -80, 90, 90], q: 'db', g: F },
    { n: 'Preacher curl', s: '3 × 8–12', t: 'Upper arms flat on the pad. Curl up without lifting your elbows, lower to a full stretch.', k: 'P', f: [100, 112], A: [-75, 60, 85, 0, 90], B: [-75, 60, -75, 0, 90], q: 'bar', g: `${F}M70 119H120M96 119V150M108 74L136 108M136 108V150` },
    { n: 'Concentration curl', s: '3 × 10 each', t: 'Seated, elbow braced on your inner thigh. Curl the dumbbell toward your shoulder, lower slowly.', k: 'P', f: [100, 112], A: [-35, 90, 90, 0, 90], B: [-35, 90, -62, 0, 90], q: 'db', g: `${F}M70 119H134M96 119V150` },
    { n: 'Close-grip bench press', s: '3 × 8–10', t: 'Hands shoulder-width, elbows tucked. Lower to your lower chest, press up and squeeze your triceps.', k: 'P', f: [95, 128], A: [180, -90, -90, -30, 75], B: [180, 5, -90, -30, 75], q: 'bar', g: bench },
    { n: 'Triceps kickback', s: '3 × 12 each', t: 'Hinge forward, upper arm parallel to your torso. Straighten your arm back, squeeze, return.', k: 'A', f: [100, 146], A: [-35, 145, 90, 70, 110], B: [-35, 145, 145, 70, 110], q: 'db', g: F },
  ],
  Core: [
    { n: 'Plank', s: '3 × 45 s', t: 'Elbows under shoulders, body in one line. Squeeze glutes and keep breathing.', k: 'A', f: [50, 146], A: [-13, 90, 0, 167, 167], B: [-16, 90, 0, 164, 164], g: F },
    { n: 'Crunch', s: '3 × 15', t: 'Lower back stays down. Lift your shoulder blades, exhale, lower slowly.', k: 'P', f: [110, 141], A: [180, -165, 30, -50, 75], B: [215, -165, 30, -50, 75], g: F },
    { n: 'Hanging knee raise', s: '3 × 12', t: 'Hang with a firm grip. Lift knees to hip height without swinging.', k: 'W', f: [120, 12], A: [-90, -90, -90, 95, 110], B: [-100, -90, -90, 10, 100], v: '0 -10 240 190', g: hang(12) },
    { n: 'Lying leg raise', s: '3 × 12', t: 'Press your lower back down. Raise straight legs to vertical, lower slowly.', k: 'P', f: [110, 142], A: [180, 0, 0, 0, 0], B: [180, 0, 0, -85, -85], g: F },
    { n: 'Sit-up', s: '3 × 15', t: 'Feet anchored, arms crossed. Curl all the way up, then lower with control.', k: 'P', f: [110, 141], A: [180, -165, 30, -50, 75], B: [255, -165, 30, -50, 75], g: F },
    { n: 'Dead bug', s: '3 × 10 each', t: 'Lower back glued to the floor. Extend opposite arm and leg, return, switch sides.', k: 'P', f: [112, 141], A: [180, -90, -90, -90, 0], B: [180, 180, 180, -8, -8], g: F },
    { n: 'Hanging leg raise', s: '3 × 10', t: 'Hang tall, legs straight. Raise them to hip height without swinging, lower slowly.', k: 'W', f: [120, 12], A: [-90, -90, -90, 95, 100], B: [-100, -90, -90, 5, 5], v: '0 -10 240 190', g: hang(12) },
    { n: 'Ab wheel rollout', s: '3 × 8–10', t: 'Kneel with a braced core. Roll out as far as you can keep your lower back flat, then pull back in.', k: 'A', f: [60, 146], A: [-45, 80, 80, 90, 180], B: [-12, 55, 55, 90, 180], q: 'db', g: F },
    { n: 'V-up', s: '3 × 12', t: 'Lie flat, arms overhead. Lift your legs and chest together to touch your toes, lower slowly.', k: 'P', f: [110, 142], A: [180, 0, 0, 0, 0], B: [245, -5, -5, -50, -50], g: F },
    { n: 'Flutter kicks', s: '3 × 30 s', t: 'Lower back pressed down, legs straight. Kick small and fast, alternating legs, keeping your core tight.', k: 'P', f: [110, 142], A: [180, 0, 0, -22, -22, -6, -6], B: [180, 0, 0, -6, -6, -22, -22], g: F },
    { n: 'Reverse crunch', s: '3 × 12–15', t: 'Knees bent over your hips. Curl your hips off the floor toward your ribs, lower slowly.', k: 'P', f: [110, 142], A: [180, 0, 0, -90, -5], B: [180, 0, 0, -118, -30], g: F },
    { n: 'Hollow body hold', s: '3 × 30 s', t: 'Press your lower back down. Lift your shoulders and straight legs off the floor and hold.', k: 'P', f: [110, 138], A: [195, 195, 195, -12, -12], B: [198, 198, 198, -16, -16], g: F },
  ],
  Cardio: [
    { n: 'Kettlebell swing', s: '4 × 15', t: 'Hinge, do not squat. Snap your hips forward and let the bell float to chest height.', k: 'A', f: [100, 146], A: [-35, 110, 100, 70, 110], B: [-90, 0, 0, 90, 90], q: 'db', g: F },
    { n: 'High knees', s: '3 × 30 s', t: 'Stay tall on the balls of your feet. Drive each knee to hip height, pump your arms.', k: 'P', f: [110, 82], A: [-88, 60, -40, 90, 90, 90, 90], B: [-88, 120, 40, 5, 95, 90, 90], g: F },
    { n: 'Jump squat', s: '3 × 10', t: 'Load into a quarter squat, explode up, land softly with bent knees.', ...st, A: [-55, 40, 40, 8, 108], B: [-90, -80, -80, 90, 90], lift: 18, g: F },
    { n: 'Mountain climber', s: '3 × 30 s', t: 'Strong plank, hands under shoulders. Drive your knees to your chest in a running rhythm.', k: 'W', f: [168, 150], A: [-26, 90, 90, 154, 154], B: [-26, 90, 90, 70, 200], g: F },
    { n: 'Butt kicks', s: '3 × 30 s', t: 'Stay tall and light on your feet. Flick each heel up toward your glutes in a quick running rhythm.', k: 'P', f: [110, 82], A: [-88, 60, -40, 90, 90, 92, 175], B: [-88, 120, 40, 92, 175, 90, 90], g: F },
    { n: 'Jump rope', s: '4 × 45 s', t: 'Elbows close, turn the rope with your wrists. Hop just off the floor and land softly on the balls of your feet.', ...st, A: [-90, 95, -5, 90, 90], B: [-90, 95, -15, 90, 115], lift: 10, g: F },
  ],
}

const R = Math.PI / 180
const d = (a, l) => [Math.cos(a * R) * l, Math.sin(a * R) * l]
const add = (p, q) => [p[0] + q[0], p[1] + q[1]]

const ease = (x) => 0.5 - 0.5 * Math.cos(Math.PI * x)
const SEG = [[1.1, 'up'], [0.35, 'top'], [1.9, 'down'], [0.45, 'bot']]
export const DUR = SEG.reduce((a, [t]) => a + t, 0)

export const frames = (ex, n = 24) => {
  const pose = (t) => {
    const p = ex.A.map((a, i) => a + (ex.B[i] - a) * t)
    const P = [0, 0]
    const N = add(P, d(p[0], 44))
    const E = add(N, d(p[1], 26))
    const W = add(E, d(p[2], 24))
    const K = add(P, d(p[3], 34))
    const A = add(K, d(p[4], 34))
    const o = { P, N, E, W, A }[ex.k]
    const dy = (ex.lift || 0) * t
    const m = (q) => [+(q[0] + ex.f[0] - o[0]).toFixed(1), +(q[1] + ex.f[1] - o[1] - dy).toFixed(1)]
    const r = { P: m(P), N: m(N), E: m(E), W: m(W), K: m(K), A: m(A), H: m(add(N, d(p[0], 13))), F: m(add(A, [10, 0])) }
    if (ex.A.length > 5) {
      const K2 = add(P, d(p[5], 34))
      r.K2 = m(K2)
      r.A2 = m(add(K2, d(p[6], 34)))
    }
    return r
  }
  const out = []
  let at = 0
  SEG.forEach(([len, kind]) => {
    if (kind === 'up' || kind === 'down') {
      for (let i = kind === 'up' ? 0 : 1; i <= n; i++) {
        const e = ease(i / n)
        out.push({ ...pose(kind === 'up' ? e : 1 - e), kt: (at + (i / n) * len) / DUR, a: Math.sin((Math.PI * i) / n) * (kind === 'up' ? 0.8 : 1) })
      }
    } else {
      out.push({ ...pose(kind === 'top' ? 1 : 0), kt: (at + len) / DUR, a: 0 })
    }
    at += len
  })
  out[out.length - 1].kt = 1
  return out
}

// Which muscles each exercise works: p = primary (full glow), s = secondary (half glow). First matching rule wins.
const RULES = [
  [/close-grip|triceps|pushdown|skull|kickback|bench dip/, ['tri'], ['chest', 'delts']],
  [/curl/ , ['bi'], ['fore']],
  [/calf/, ['calf'], ['quad']],
  [/leg extension/, ['quad'], []],
  [/mountain|high knees|butt kicks/, ['quad', 'abs'], ['delts']],
  [/jump rope/, ['calf'], ['fore', 'delts']],
  [/hanging|leg raise|knee raise|crunch|sit-up|plank|hollow|dead bug|ab wheel|v-up|flutter/, ['abs'], ['fore']],
  [/romanian|deadlift|rack pull|good morning|swing/, ['ham', 'glute'], ['back']],
  [/hip thrust|bridge/, ['glute'], ['ham']],
  [/squat|lunge|leg press|wall sit/, ['quad', 'glute'], ['ham']],
  [/back extension|superman/, ['back'], ['glute', 'ham']],
  [/pullover/, ['lats', 'chest'], ['tri']],
  [/upright|face pull/, ['delts', 'traps'], ['bi']],
  [/fly|crossover/, ['chest'], ['delts']],
  [/bench press|incline.*press|chest press|push-up|chest dip/, ['chest'], ['tri', 'delts']],
  [/pulldown|pull-up|chin-up|row/, ['lats'], ['bi', 'traps']],
  [/press|raise/, ['delts'], ['tri']],
]
const FALLBACK = { Chest: ['chest'], Back: ['lats'], Legs: ['quad'], Shoulders: ['delts'], Arms: ['bi'], Core: ['abs'], Cardio: ['quad'] }
Object.entries(exercises).forEach(([g, list]) => list.forEach((e) => { e.grp = g }))
export const muscleOf = (ex) => {
  const hit = RULES.find(([re]) => re.test(ex.n.toLowerCase()))
  return hit ? { p: hit[1], s: hit[2] } : { p: FALLBACK[ex.grp] || ['abs'], s: [] }
}
