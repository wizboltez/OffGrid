/**
 * American first and last names for generating random manager names
 */
const AMERICAN_FIRST_NAMES = [
  "James", "John", "Robert", "Michael", "William", "David", "Richard", "Christopher", "Lisa", "Sarah",
  "Michelle", "Karen", "Nancy", "Jennifer", "Mary", "Susan", "Patricia", "Margaret", "Thomas", "Charles",
  "Daniel", "Matthew", "Anthony", "Mark", "Donald", "Steven", "Paul", "Andrew", "Joshua", "Kenneth",
  "Jessica", "Angela", "Brenda", "Donna", "Carol", "Barbara", "Sandra", "Ashley", "Kimberly", "Donna"
];

const AMERICAN_LAST_NAMES = [
  "Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez",
  "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson", "Thomas", "Taylor", "Moore", "Jackson", "Martin",
  "Lee", "Perez", "Thompson", "White", "Harris", "Sanchez", "Clark", "Ramirez", "Lewis", "Robinson",
  "Young", "Allen", "King", "Wright", "Scott", "Torres", "Peterson", "Phillips", "Campbell", "Parker"
];

/**
 * Generate a random American name
 */
function hashSeed(value) {
  const seed = String(value || "manager-seed");
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export function generateRandomManagerName(seed) {
  const base = seed ? hashSeed(seed) : Math.floor(Math.random() * 1000000);
  const firstName = AMERICAN_FIRST_NAMES[base % AMERICAN_FIRST_NAMES.length];
  const lastName = AMERICAN_LAST_NAMES[(Math.floor(base / 7) + 3) % AMERICAN_LAST_NAMES.length];
  return `${firstName} ${lastName}`;
}

export function isGenericManagerLabel(name) {
  const normalized = String(name || "").trim().toLowerCase();
  if (!normalized) return true;

  return (
    normalized === "manager" ||
    normalized.endsWith(" manager") ||
    normalized.includes("department manager") ||
    normalized.includes("team manager")
  );
}

export function resolveManagerDisplayName(manager, fallbackSeed) {
  const rawName = manager?.fullName;
  if (rawName && !isGenericManagerLabel(rawName)) {
    return rawName;
  }

  const seed = manager?.id || manager?.email || fallbackSeed || "manager-fallback";
  return generateRandomManagerName(seed);
}

/**
 * Generate a consistent, distinct color for an employee based on their ID
 * Uses a curated color palette for maximum visual distinction
 */
export function getEmployeeColor(employeeId) {
  if (!employeeId) return {
    bg: '#e8f0ff',
    text: '#1c3f84',
    border: '#c8daff',
    avatar: '#3e7bfa'
  };

  // Use a curated, vibrant color palette
  const colorPalette = [
    { h: 12, s: 85, l: 55 },   // Red-Orange
    { h: 35, s: 85, l: 55 },   // Orange
    { h: 48, s: 85, l: 55 },   // Golden
    { h: 65, s: 80, l: 55 },   // Yellow-Green
    { h: 90, s: 80, l: 55 },   // Green
    { h: 140, s: 85, l: 50 },  // Teal
    { h: 190, s: 85, l: 50 },  // Cyan
    { h: 210, s: 85, l: 50 },  // Sky Blue
    { h: 240, s: 90, l: 55 },  // Blue
    { h: 270, s: 85, l: 55 },  // Purple
    { h: 300, s: 80, l: 55 },  // Magenta
    { h: 330, s: 85, l: 55 },  // Pink
  ];

  const colorIndex = Math.abs(employeeId) % colorPalette.length;
  const selectedColor = colorPalette[colorIndex];

  return {
    bg: `hsl(${selectedColor.h}, ${selectedColor.s}%, 92%)`,
    text: `hsl(${selectedColor.h}, ${selectedColor.s}%, 28%)`,
    border: `hsl(${selectedColor.h}, ${selectedColor.s - 5}%, 60%)`,
    avatar: `hsl(${selectedColor.h}, ${selectedColor.s}%, 50%)`
  };
}

/**
 * Get all employee colors for a list of employees
 */
export function getEmployeeColors(employees) {
  const colors = {};
  if (Array.isArray(employees)) {
    employees.forEach((emp) => {
      colors[emp.id] = getEmployeeColor(emp.id);
    });
  }
  return colors;
}
