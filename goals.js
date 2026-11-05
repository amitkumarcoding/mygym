export const goalNames = ['Get in shape', 'Full body', 'Get lean', 'Overall fitness', 'Build muscle', 'Lose weight', 'Build strength', 'Boost stamina']

export const goalPlans = {
  'Get in shape': {
    blurb: 'A balanced start: lift, move and eat well, three to four days a week.',
    days: '4 days a week',
    train: [
      ['Mon', 'Full body strength', 'Squat, bench press, lat pulldown, plank · 3 × 10–12'],
      ['Wed', 'Full body strength', 'Deadlift, overhead press, seated row, lunge · 3 × 10–12'],
      ['Fri', 'Full body strength', 'Leg press, incline press, cable row, crunch · 3 × 10–12'],
      ['Sat', 'Cardio', '30 minutes brisk walk, cycle or jog at a pace where you can still talk'],
    ],
    diet: {
      note: 'Eat at maintenance, about 1.6 g protein per kg, and build every plate around protein, veg and a smart carb.',
      meals: [['Breakfast', 'Poha or upma, 2 boiled eggs, fruit'], ['Lunch', '2 rotis, dal, sabzi, salad, curd'], ['Snack', 'Roasted chana or a handful of nuts'], ['Dinner', 'Paneer or chicken, vegetables, 1 roti or rice']],
    },
  },
  'Full body': {
    blurb: 'Train every muscle in every session. Simple, efficient and great for beginners.',
    days: '3 days a week',
    train: [
      ['Mon', 'Full body A', 'Squat, bench press, barbell row, plank · 3 × 8–10'],
      ['Wed', 'Full body B', 'Deadlift, overhead press, lat pulldown, lunge · 3 × 8–10'],
      ['Fri', 'Full body C', 'Leg press, incline dumbbell press, cable row, hanging knee raise · 3 × 10–12'],
    ],
    diet: {
      note: 'Maintenance to a small surplus. Aim for 1.8 g protein per kg and eat within two hours after training.',
      meals: [['Breakfast', 'Oats with milk, banana, 3 eggs'], ['Lunch', 'Rice, dal, paneer or chicken, salad'], ['Snack', 'Curd with fruit and peanuts'], ['Dinner', 'Roti, sabzi, chicken or soya, curd']],
    },
  },
  'Get lean': {
    blurb: 'Keep your muscle, lose the fat. Heavy lifting plus steady cardio and a small calorie deficit.',
    days: '5 days a week',
    train: [
      ['Mon', 'Upper body', 'Bench press, row, overhead press, curl, pushdown · 4 × 8–10'],
      ['Tue', 'Lower body', 'Squat, Romanian deadlift, lunge, calf raise · 4 × 8–10'],
      ['Wed', 'Cardio and core', '30 minutes incline walk or cycle, then plank and leg raise'],
      ['Thu', 'Upper body', 'Incline press, pulldown, lateral raise, face pull · 3 × 10–12'],
      ['Fri', 'Lower body', 'Deadlift, leg press, hamstring curl · 3 × 10–12'],
    ],
    diet: {
      note: 'About 300 to 400 kcal below maintenance, 2 g protein per kg, and plenty of fibre to stay full.',
      meals: [['Breakfast', 'Veg omelette, 1 toast, green tea'], ['Lunch', '2 rotis, dal, large salad, curd'], ['Snack', 'Sprouts or roasted chana, one fruit'], ['Dinner', 'Grilled chicken or paneer, sauteed vegetables'], ['Hydration', '3 to 4 litres of water through the day']],
    },
  },
  'Overall fitness': {
    blurb: 'Strength, stamina and mobility together. Feel good, move well, stay healthy.',
    days: '4 days a week',
    train: [
      ['Mon', 'Strength', 'Goblet squat, push-up, dumbbell row, plank · 3 × 12'],
      ['Tue', 'Cardio', '30 to 40 minutes jog, cycle or swim at an easy pace'],
      ['Thu', 'Strength', 'Lunge, dumbbell press, lat pulldown, dead bug · 3 × 12'],
      ['Sat', 'Mixed', 'Kettlebell swing, mountain climber, jump squat · 3 rounds, then 10 minutes stretching'],
    ],
    diet: {
      note: 'Eat at maintenance with a balanced plate: half veg, a quarter protein, a quarter carbs.',
      meals: [['Breakfast', 'Idli or dosa with sambar, fruit'], ['Lunch', 'Rice or roti, dal, sabzi, curd'], ['Snack', 'Nuts, buttermilk or fruit'], ['Dinner', 'Roti, paneer or fish, vegetables']],
    },
  },
  'Build muscle': {
    blurb: 'Lift with volume, eat a small surplus, sleep well. Add weight or reps every week.',
    days: '4 to 5 days a week',
    train: [
      ['Day 1', 'Push', 'Bench press, overhead press, incline press, lateral raise, pushdown · 4 × 8–12'],
      ['Day 2', 'Pull', 'Deadlift, lat pulldown, cable row, face pull, barbell curl · 4 × 8–12'],
      ['Day 3', 'Legs', 'Squat, Romanian deadlift, leg press, calf raise, plank · 4 × 8–12'],
      ['Day 4', 'Rest', 'Walk 30 minutes and stretch. Then repeat the cycle.'],
    ],
    diet: {
      note: 'About 300 kcal above maintenance, 1.8 to 2.2 g protein per kg, carbs around training.',
      meals: [['Breakfast', 'Oats with milk, banana, 3 eggs'], ['Lunch', 'Rice, dal, paneer or chicken, salad'], ['Snack', 'Curd with peanuts, one fruit'], ['Dinner', 'Roti, sabzi, chicken or soya, curd'], ['Before bed', 'Glass of milk, handful of almonds']],
    },
  },
  'Lose weight': {
    blurb: 'Burn more than you eat, protect your muscle, and keep the habit going.',
    days: '5 days a week',
    train: [
      ['Mon', 'Full body strength', 'Squat, push-up, row, plank · 3 × 12'],
      ['Tue', 'Cardio', '40 minutes brisk walk, cycle or jog'],
      ['Wed', 'Full body strength', 'Deadlift, overhead press, lat pulldown, lunge · 3 × 12'],
      ['Thu', 'Cardio', '30 minutes intervals: 1 minute fast, 2 minutes easy'],
      ['Sat', 'Long walk', '60 minutes outdoors, plus stretching'],
    ],
    diet: {
      note: 'About 400 to 500 kcal below maintenance. Keep protein high and avoid sugary drinks and fried snacks.',
      meals: [['Breakfast', 'Moong chilla or veg omelette, green tea'], ['Lunch', '2 rotis, dal, big salad, curd'], ['Snack', 'Fruit and a handful of roasted chana'], ['Dinner', 'Grilled paneer or chicken with vegetables, light soup'], ['Hydration', '3 to 4 litres of water through the day']],
    },
  },
  'Build strength': {
    blurb: 'Get stronger on the big lifts. Heavy sets, long rests, small steady jumps in weight.',
    days: '4 days a week',
    train: [
      ['Mon', 'Squat day', 'Barbell squat 5 × 5, leg press 3 × 8, plank 3 × 45 s'],
      ['Tue', 'Bench day', 'Bench press 5 × 5, overhead press 3 × 6, pushdown 3 × 10'],
      ['Thu', 'Deadlift day', 'Deadlift 4 × 4, barbell row 4 × 6, back extension 3 × 10'],
      ['Fri', 'Press day', 'Overhead press 5 × 5, incline press 3 × 8, pull-up 3 × max'],
    ],
    diet: {
      note: 'Slight surplus, 2 g protein per kg, and carbs before heavy sessions. Rest 2 to 3 minutes between big sets.',
      meals: [['Breakfast', 'Oats, milk, banana, 3 eggs'], ['Lunch', 'Rice, dal, chicken or paneer, curd'], ['Pre-workout', 'Banana and a slice of toast with peanut butter'], ['Dinner', 'Roti, sabzi, chicken or soya, curd']],
    },
  },
  'Boost stamina': {
    blurb: 'Build the engine. Longer runs, intervals and a little strength work to protect your joints.',
    days: '5 days a week',
    train: [
      ['Mon', 'Easy run', '30 minutes at a conversational pace'],
      ['Tue', 'Strength', 'Goblet squat, lunge, push-up, plank · 3 × 12'],
      ['Thu', 'Intervals', '8 rounds: 1 minute hard, 90 seconds easy'],
      ['Fri', 'Strength', 'Romanian deadlift, row, dead bug, calf raise · 3 × 12'],
      ['Sat', 'Long session', '45 to 60 minutes run, cycle or swim. Add 5 minutes each week.'],
    ],
    diet: {
      note: 'Carbs are your fuel. Eat at maintenance, 1.4 to 1.6 g protein per kg, and drink water through every session.',
      meals: [['Breakfast', 'Poha or oats, banana, 2 eggs'], ['Lunch', 'Rice, dal, sabzi, curd'], ['Pre-workout', 'Banana or dates 45 minutes before'], ['Dinner', 'Roti, paneer or fish, vegetables, curd']],
    },
  },
}
