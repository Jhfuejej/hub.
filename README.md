# Hub

Personal lifehub — workouts, nutrition, weight, habits, journal, finances, tasks. Black & yellow, slick and modern.

Built from the [Hub Design System](https://claude.ai/design) handoff. React + Vite, no backend — everything persists to `localStorage`.

## Run it

```sh
npm install
npm run dev      # http://localhost:5173
npm run build    # production build to ./dist
npm run preview  # preview the build
```

## What's in the box

| Surface    | What you can do |
|------------|-----------------|
| Dashboard  | Today's calories, weight trend, top streaks, weekly volume, recent workouts & meals |
| Workouts   | Start sessions from templates or scratch · log sets/reps/weight · complete & review history |
| Nutrition  | Log meals (library + custom) · set calorie/macro goals · 7-day chart · per-slot totals |
| Weight     | Log entries · trend chart with goal line · range filter (7d/30d/90d/1y/all) |
| Habits     | Track up to N habits · 14-day grid · current streaks · custom icons |
| Journal    | Write/edit entries · search · date pinning |
| Finances   | Income/expense ledger · monthly net · category breakdown |
| Tasks      | Quick add or detailed · priorities, due dates · grouped by overdue/today/upcoming |
| Quick add  | `Cmd/Ctrl+K` from anywhere — log a task, meal, weight, journal, or money entry |

## Design system

Tokens live in `src/styles/tokens.css`. Brand primitives (Card, YellowButton, Metric, Overline, Badge, ProgressBar, Icon, Modal) live in `src/components/`. The aesthetic and copy guidelines are inherited from the design bundle: black canvas, yellow `#F5D033` accent (used sparingly), Montserrat (Gotham substitute), tabular numerals everywhere, no emoji.

## Data

Everything is stored under one key in `localStorage`: `hub:state:v1`. Seed data preloads workouts, foods, meals, weights, habits, journal, transactions, and tasks so every screen has something to look at on first run. Clear the key in DevTools to reset.
