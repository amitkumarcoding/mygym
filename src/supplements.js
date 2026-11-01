export const supplements = [
  { id: 'protein', name: 'Protein powder', art: 'tub', verdict: 'Worth it', tier: 'good', form: 'Whey concentrate or isolate. Plant blend (pea + rice) if vegan.', dose: '20–30 g per serving, 1–2 servings a day', when: 'Any time. After training or with breakfast is easiest to remember.', what: 'Food in powder form. It does nothing magic; it just makes hitting your daily protein number easy and cheap.', who: 'Anyone who cannot reach 1.6–2.2 g protein per kg bodyweight from meals. Most vegetarians and busy lifters.', care: 'Isolate or plant protein if milk upsets your stomach. Skip the powder if your meals already cover your target. Check with a doctor if you have kidney disease.' },
  { id: 'creatine', name: 'Creatine monohydrate', art: 'jar', verdict: 'Best value', tier: 'best', form: 'Plain monohydrate. Skip HCl, buffered and liquid versions; they cost more and add nothing.', dose: '3–5 g every day. No loading needed.', when: 'Any time, same time daily. Take it with water or a meal.', what: 'The most researched sports supplement. Helps your muscles reproduce quick energy, so you get an extra rep or two and add strength and lean mass over time.', who: 'Almost any lifter. Vegetarians and vegans often see the biggest effect.', care: 'Expect 1–2 kg of water weight in the first weeks, not fat. Drink water. No cycling needed. Ask a doctor first if you have kidney problems or are under 18.' },
  { id: 'pre', name: 'Pre-workout', art: 'shaker', verdict: 'Optional', tier: 'maybe', form: 'Look for a clear label: caffeine, citrulline, beta-alanine. Avoid "proprietary blends".', dose: 'Caffeine about 3 mg per kg bodyweight, never above 400 mg a day in total', when: '30–45 minutes before training, and not within 6–8 hours of bed.', what: 'Mostly caffeine for energy and focus. Citrulline helps pump and endurance. Beta-alanine causes harmless tingling.', who: 'Lifters who feel flat in the gym. A black coffee gives you the same caffeine for a fraction of the price.', care: 'Skip if you have heart, blood pressure or anxiety issues, or are pregnant. Do not stack with coffee, tea and energy drinks.' },
  { id: 'bcaa', name: 'BCAA', art: 'bottle', verdict: 'Mostly skip', tier: 'skip', form: 'If you want amino acids, a full EAA product beats BCAA.', dose: 'Not needed if you eat enough protein', when: 'Only maybe around fasted training.', what: 'Three of the nine essential amino acids. Protein foods and whey already contain them, and your muscle needs all nine to build.', who: 'Rarely anyone. Possibly vegans with low protein intake, or people who train fasted.', care: 'If your protein target is met, BCAA is mostly flavoured money. Spend it on creatine or food.' },
  { id: 'multi', name: 'Multivitamin', art: 'pills', verdict: 'Insurance', tier: 'maybe', form: 'Standard daily multivitamin with minerals. Avoid mega-doses.', dose: '1 tablet a day, as the label says', when: 'With a meal that has some fat.', what: 'Fills small gaps in a limited diet. It does not build muscle or burn fat.', who: 'People who eat few vegetables, fruit or variety, people on a calorie deficit, and vegans (B12 matters most).', care: 'Do not combine several multi products. Take iron only when a doctor or blood test says so.' },
  { id: 'omega', name: 'Omega-3 (fish or algae oil)', art: 'softgel', verdict: 'Situational', tier: 'maybe', form: 'Fish oil, or algae oil if vegan. Check EPA + DHA, not just "oil" total.', dose: '1–2 g EPA + DHA a day', when: 'With a meal.', what: 'Supports heart and joint health and helps recovery slightly. Most people eat too little oily fish.', who: 'Anyone who does not eat oily fish (sardine, mackerel, salmon) about twice a week.', care: 'Talk to a doctor first if you take blood thinners or are due for surgery.' },
  { id: 'd3', name: 'Vitamin D3', art: 'sun', verdict: 'Test first', tier: 'maybe', form: 'D3 (cholecalciferol), ideally with K2.', dose: 'Often 1000–2000 IU a day, but follow your blood test', when: 'With your biggest meal.', what: 'Needed for bones, muscle function and immunity. Low levels are very common in India despite the sun, especially for office workers.', who: 'Anyone with a low 25-OH vitamin D test, or with very little sun exposure.', care: 'Get a blood test first. Staying above 4000 IU a day without medical advice is not wise.' },
]

export const skipList = [
  ['Fat burners', 'Mostly caffeine with a fancy label. Diet and steps do the work.'],
  ['Testosterone boosters', 'Little to no proof, and some products are not what the label says.'],
  ['Mass gainers', 'Sugar and cheap calories. A milk, banana and oats shake does the same for less.'],
  ['"Detox" products', 'Your liver and kidneys already do this.'],
]

export const goalsList = ['Muscle gain', 'Fat loss', 'Strength', 'General health']
export const dietsList = ['Non-veg', 'Vegetarian', 'Vegan', 'Lactose intolerant']

const range = { 'Muscle gain': [1.8, 2.2], 'Fat loss': [1.8, 2.2], Strength: [1.6, 2.0], 'General health': [1.2, 1.6] }

export function buildStack(goal, diet, kg) {
  const [lo, hi] = range[goal]
  const w = Math.max(30, Math.min(200, Number(kg) || 70))
  const plant = diet === 'Vegan'
  const sensitive = diet === 'Lactose intolerant'
  const general = goal === 'General health'
  const caf = Math.min(400, Math.round((3 * w) / 10) * 10)
  const items = [
    {
      id: 'protein', tag: general ? 'Optional' : 'Core',
      dose: `${Math.round(lo * w)}–${Math.round(hi * w)} g protein a day in total. Fill the gap with 1 scoop (about 25 g) at a time.`,
      note: plant ? 'Pea + rice blend for a full amino profile.' : sensitive ? 'Whey isolate or a plant blend. Both are easy on the stomach.' : 'Whey concentrate is the best value.',
    },
    {
      id: 'creatine', tag: general ? 'Optional' : 'Core',
      dose: `${w >= 90 ? '5 g' : '3–5 g'} a day, every day.`,
      note: diet === 'Non-veg' || sensitive ? 'Monohydrate, nothing fancy.' : 'Vegetarians and vegans usually respond even better.',
    },
    {
      id: 'multi', tag: plant ? 'Core' : 'Optional',
      dose: '1 a day with a meal.',
      note: plant ? 'Make sure it has vitamin B12. Vegans cannot get it from food.' : goal === 'Fat loss' ? 'Handy insurance while eating less.' : 'Only if your diet is limited.',
    },
    {
      id: 'd3', tag: 'Test first',
      dose: 'Get a 25-OH vitamin D blood test, then dose by the result.',
      note: 'Very common to be low in India.',
    },
    {
      id: 'omega', tag: 'Optional',
      dose: '1–2 g EPA + DHA a day.',
      note: plant ? 'Choose algae oil.' : 'Skip it if you eat oily fish twice a week.',
    },
    {
      id: 'pre', tag: general ? 'Skip' : 'Optional',
      dose: `Up to ${caf} mg caffeine, 30–45 min before training.`,
      note: 'A black coffee works just as well. Keep total caffeine under 400 mg a day.',
    },
    { id: 'bcaa', tag: 'Skip', dose: 'Not needed.', note: 'Hit your protein target instead.' },
  ]
  const order = { Core: 0, 'Test first': 1, Optional: 2, Skip: 3 }
  return items.sort((a, b) => order[a.tag] - order[b.tag])
}
