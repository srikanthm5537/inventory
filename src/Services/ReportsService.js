const categories = ['RAW_MATERIAL', 'WIP', 'FINISHED_GOOD', 'CONSUMABLE', 'SPARE'];
const items = ['Steel Rods', 'Copper Wire', 'Plastic Sheets', 'Lubricant Oil', 'Packaging Box'];
const locations = ['Warehouse A', 'Warehouse B', 'Retail Outlet', 'Dispatch Center'];
const users = ['Alice', 'Bob', 'Charlie', 'David'];

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function formatDate(offsetDays) {
  const date = new Date();
  date.setDate(date.getDate() - offsetDays);
  return date.toISOString().slice(0, 10);
}

export async function fetchReportData() {
  const records = [];
  for (let i = 1; i <= 30; i += 1) {
    const item = items[i % items.length];
    const category = categories[i % categories.length];
    const location = locations[i % locations.length];
    const quantity = randomInt(5, 80);
    const unitCost = Number((randomInt(50, 400) / 10).toFixed(2));
    records.push({
      id: i,
      date: formatDate(i * 2),
      item,
      category,
      unit: i % 2 === 0 ? 'NOS' : 'KG',
      location,
      quantity,
      unitCost,
      stockValue: Number((quantity * unitCost).toFixed(2)),
      reorderLevel: randomInt(20, 50),
      user: users[i % users.length],
      transactionType: ['IN', 'OUT'][i % 2],
      reference: `REF-${1000 + i}`,
    });
  }

  return records;
}

export function buildCurrentStock(records) {
  const map = new Map();
  records.forEach((row) => {
    const key = `${row.item}|${row.category}|${row.unit}|${row.location}`;
    const existing = map.get(key) || { ...row, quantity: 0, stockValue: 0 };
    existing.quantity += row.transactionType === 'OUT' ? -row.quantity : row.quantity;
    existing.stockValue = Number((existing.quantity * row.unitCost).toFixed(2));
    map.set(key, existing);
  });
  const values = Array.from(map.values()).map((row) => ({
    item: row.item,
    category: row.category,
    unit: row.unit,
    location: row.location,
    quantity: row.quantity,
    unitCost: row.unitCost,
    stockValue: row.stockValue,
  }));
  const totals = {
    totalQuantity: values.reduce((sum, item) => sum + item.quantity, 0),
    totalValue: Number(values.reduce((sum, item) => sum + item.stockValue, 0).toFixed(2)),
  };
  return { rows: values, totals };
}

export function buildLowStock(records) {
  const itemsByKey = new Map();
  records.forEach((row) => {
    const key = `${row.item}|${row.category}|${row.unit}`;
    const existing = itemsByKey.get(key) || { item: row.item, category: row.category, unit: row.unit, quantity: 0, reorderLevel: row.reorderLevel };
    existing.quantity += row.transactionType === 'OUT' ? -row.quantity : row.quantity;
    existing.reorderLevel = Math.min(existing.reorderLevel, row.reorderLevel);
    itemsByKey.set(key, existing);
  });

  const results = Array.from(itemsByKey.values())
    .filter((entry) => entry.quantity <= entry.reorderLevel)
    .map((entry) => ({
      ...entry,
      shortfall: entry.reorderLevel - entry.quantity,
    }));

  return results;
}

export function buildItemMovement(records, selectedItem, dateFrom, dateTo) {
  const filtered = records.filter((row) => {
    if (selectedItem && selectedItem !== 'ALL' && row.item !== selectedItem) return false;
    if (dateFrom && row.date < dateFrom) return false;
    if (dateTo && row.date > dateTo) return false;
    return true;
  });

  const openingBalance = filtered.reduce((sum, row) => sum + (row.transactionType === 'OUT' ? -row.quantity : row.quantity), 0);
  const inward = filtered.filter((row) => row.transactionType === 'IN').reduce((sum, row) => sum + row.quantity, 0);
  const outward = filtered.filter((row) => row.transactionType === 'OUT').reduce((sum, row) => sum + row.quantity, 0);
  const closingBalance = openingBalance;

  return {
    openingBalance,
    inward,
    outward,
    closingBalance,
    rows: filtered,
  };
}

export function buildStockValuation(records, dateOn) {
  const grouped = new Map();
  records
    .filter((row) => !dateOn || row.date <= dateOn)
    .forEach((row) => {
      const key = row.category;
      const existing = grouped.get(key) || { category: row.category, stockValue: 0 };
      existing.stockValue += row.stockValue;
      grouped.set(key, existing);
    });

  const categoriesValuation = Array.from(grouped.values()).map((entry) => ({
    category: entry.category,
    stockValue: Number(entry.stockValue.toFixed(2)),
  }));

  const totalValue = Number(categoriesValuation.reduce((sum, row) => sum + row.stockValue, 0).toFixed(2));
  return { categoriesValuation, totalValue };
}
