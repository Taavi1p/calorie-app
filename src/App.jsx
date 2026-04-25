import React, { useMemo, useState } from "react";

const DAILY_LIMIT = 2300;
const STORAGE_KEY = "ginger-cat-calorie-log";
const todayKey = new Date().toISOString().slice(0, 10);

const calorieDatabase = {
  apple: 95,
  banana: 105,
  berries: 84,
  orange: 62,
  eggs: 156,
  egg: 78,
  oatmeal: 158,
  yogurt: 150,
  toast: 80,
  rice: 205,
  pasta: 220,
  potato: 164,
  chicken: 250,
  salmon: 233,
  tuna: 132,
  beef: 300,
  tofu: 144,
  beans: 225,
  salad: 90,
  avocado: 240,
  sandwich: 430,
  wrap: 350,
  pizza: 285,
  burger: 540,
  fries: 365,
  taco: 210,
  burrito: 650,
  soup: 180,
  chocolate: 155,
  cookie: 150,
  cake: 350,
  smoothie: 250,
  latte: 190,
  beer: 154
};

function normalizeFood(value) {
  return value.trim().toLowerCase().replace(/[^a-z0-9 ]/g, "");
}

function titleCase(value) {
  return value
    .trim()
    .toLowerCase()
    .replace(/\b[a-z]/g, (letter) => letter.toUpperCase());
}

function makeId() {
  return crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;
}

function loadEntries() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return saved?.date === todayKey ? saved.entries : [];
  } catch {
    return [];
  }
}

function saveEntries(entries) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ date: todayKey, entries }));
}

function parseFood(input) {
  const cleanInput = input.trim();
  const explicitCalories = cleanInput.match(/(\d+)\s*(cal|cals|calories)?$/i);
  const normalized = normalizeFood(cleanInput.replace(/(\d+)\s*(cal|cals|calories)?$/i, ""));
  const foundKey = Object.keys(calorieDatabase).find((food) => normalized.includes(food));

  if (explicitCalories) {
    return {
      name: titleCase(normalized || cleanInput.replace(explicitCalories[0], "")),
      calories: Number(explicitCalories[1])
    };
  }

  if (foundKey) {
    return {
      name: titleCase(foundKey),
      calories: calorieDatabase[foundKey]
    };
  }

  return null;
}

function GingerCat({ total }) {
  const ratio = Math.min(total / DAILY_LIMIT, 1);
  const overLimit = total > DAILY_LIMIT;
  const bellyScale = 0.72 + ratio * 0.4;
  const bellyText = overLimit ? "too full" : `${Math.round(ratio * 100)}% full`;

  return (
    <figure
      className={`cat ${overLimit ? "is-exhausted" : ""}`}
      aria-label={
        overLimit
          ? "An exhausted fluffy ginger cat after going over the calorie limit"
          : "A fluffy ginger cat getting fuller as calories are added"
      }
    >
      <div className="tail" />
      <div className="ear ear-left" />
      <div className="ear ear-right" />
      <div className="head">
        <div className="stripe stripe-left" />
        <div className="stripe stripe-middle" />
        <div className="stripe stripe-right" />
        <div className="eye eye-left" />
        <div className="eye eye-right" />
        <div className="muzzle">
          <div className="nose" />
          <div className="mouth" />
          <div className="tongue" />
        </div>
        <div className="whiskers whiskers-left" />
        <div className="whiskers whiskers-right" />
        <div className="cheek cheek-left" />
        <div className="cheek cheek-right" />
      </div>
      <div className="body">
        <div
          className="belly"
          style={{ transform: `translateX(-50%) scale(${bellyScale})` }}
        />
        <span className="belly-label">{bellyText}</span>
      </div>
      <div className="arm arm-left" />
      <div className="arm arm-right" />
      <div className="foot foot-left" />
      <div className="foot foot-right" />
      {overLimit && <div className="sweat" />}
    </figure>
  );
}

function FoodLog({ entries, onClose, onRemove, onClear }) {
  const total = entries.reduce((sum, entry) => sum + entry.calories, 0);

  return (
    <aside className="log-drawer" aria-label="Food log for the day">
      <div className="log-header">
        <div>
          <h2>Food log</h2>
          <p>
            {total.toLocaleString()} / {DAILY_LIMIT.toLocaleString()} calories
          </p>
        </div>
        <button className="icon-button" type="button" onClick={onClose} aria-label="Close food log">
          x
        </button>
      </div>

      {entries.length === 0 ? (
        <p className="empty-log">No food added yet.</p>
      ) : (
        <ul className="food-list">
          {entries.map((entry) => (
            <li className="food-item" key={entry.id}>
              <span>{entry.name}</span>
              <strong>{entry.calories.toLocaleString()} cal</strong>
              <button
                className="remove-button"
                type="button"
                onClick={() => onRemove(entry.id)}
                aria-label={`Remove ${entry.name}`}
              >
                x
              </button>
            </li>
          ))}
        </ul>
      )}

      {entries.length > 0 && (
        <button className="clear-button" type="button" onClick={onClear}>
          Clear day
        </button>
      )}
    </aside>
  );
}

export default function App() {
  const [entries, setEntries] = useState(loadEntries);
  const [food, setFood] = useState("");
  const [message, setMessage] = useState("");
  const [isLogOpen, setIsLogOpen] = useState(false);

  const total = useMemo(() => entries.reduce((sum, entry) => sum + entry.calories, 0), [entries]);
  const overLimit = total > DAILY_LIMIT;

  function updateEntries(nextEntries) {
    setEntries(nextEntries);
    saveEntries(nextEntries);
  }

  function handleSubmit(event) {
    event.preventDefault();

    const parsed = parseFood(food);
    if (!parsed || !parsed.name || !parsed.calories) {
      setMessage("Try a common food, or add calories like: ramen 520");
      return;
    }

    updateEntries([...entries, { id: makeId(), ...parsed }]);
    setFood("");
    setMessage("");
  }

  function removeEntry(id) {
    updateEntries(entries.filter((entry) => entry.id !== id));
  }

  function clearEntries() {
    updateEntries([]);
    setMessage("");
  }

  return (
    <main className="app">
      <GingerCat total={total} />

      <form className="food-form" onSubmit={handleSubmit}>
        <label htmlFor="food-input">Food eaten</label>
        <div className="input-row">
          <input
            id="food-input"
            value={food}
            onChange={(event) => setFood(event.target.value)}
            placeholder="banana, pizza, ramen 520"
            autoComplete="off"
          />
          <button type="submit" aria-label="Add food">
            +
          </button>
        </div>
      </form>

      <button className="log-button" type="button" onClick={() => setIsLogOpen(true)}>
        See food log
      </button>

      <p className={`status ${overLimit ? "danger" : ""}`} role="status">
        {message ||
          (overLimit
            ? `${(total - DAILY_LIMIT).toLocaleString()} calories over. Cat needs a nap.`
            : `${Math.max(DAILY_LIMIT - total, 0).toLocaleString()} calories left.`)}
      </p>

      {isLogOpen && (
        <FoodLog
          entries={entries}
          onClose={() => setIsLogOpen(false)}
          onRemove={removeEntry}
          onClear={clearEntries}
        />
      )}
    </main>
  );
}
