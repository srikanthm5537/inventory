const categories = ['RAW_MATERIAL', 'WIP', 'FINISHED_GOOD', 'CONSUMABLE', 'SPARE'];
const units = ['NOS', 'KG', 'GRAM', 'LITRE', 'METRE', 'SQ_METRE', 'BOX', 'ROLL'];

export async function fetchItems() {
  const response = await fetch('https://jsonplaceholder.typicode.com/users');
  if (!response.ok) {
    throw new Error('Unable to load item master data');
  }

  const users = await response.json();
  return users.map((user, index) => ({
    id: user.id,
    sku: `SKU-${1000 + user.id}`,
    name: user.name,
    description: user.company?.catchPhrase || 'Inventory item',
    category: categories[index % categories.length],
    unit: units[index % units.length],
    reorderLevel: 20 + (index % 10) * 5,
    safetyStock: 5 + (index % 5) * 2,
    hsnCode: `HSN-${100 + user.id}`,
    gstRate: [5, 12, 18, 28][index % 4],
    openingQty: 10 + index * 3,
    active: index % 4 !== 0,
  }));
}

export async function createItem(item) {
  const response = await fetch('https://jsonplaceholder.typicode.com/posts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(item),
  });

  if (!response.ok) {
    throw new Error('Failed to create item');
  }

  const data = await response.json();
  return { ...item, id: data.id || Date.now() };
}

export async function updateItem(item) {
  const response = await fetch(`https://jsonplaceholder.typicode.com/posts/${item.id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(item),
  });

  if (!response.ok) {
    throw new Error('Failed to update item');
  }

  return item;
}

export async function deactivateItem(itemId) {
  const response = await fetch(`https://jsonplaceholder.typicode.com/posts/${itemId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ active: false }),
  });

  if (!response.ok) {
    throw new Error('Failed to deactivate item');
  }

  return { id: itemId, active: false };
}

export function parseCsvFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    const normalizeHeader = (value) =>
      String(value)
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '');

    const parseNumber = (value) => {
      const parsed = Number(String(value).replace(/[^0-9.-]+/g, ''));
      return Number.isNaN(parsed) ? 0 : parsed;
    };

    const parseCsvLine = (line) => {
      const values = [];
      let current = '';
      let inQuotes = false;

      for (let idx = 0; idx < line.length; idx += 1) {
        const char = line[idx];
        const nextChar = line[idx + 1];

        if (char === '"') {
          if (inQuotes && nextChar === '"') {
            current += '"';
            idx += 1;
          } else {
            inQuotes = !inQuotes;
          }
        } else if (char === ',' && !inQuotes) {
          values.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }

      values.push(current.trim());
      return values;
    };

    const headerMap = {
      sku: 'sku',
      name: 'name',
      description: 'description',
      category: 'category',
      unit: 'unit',
      reorderlevel: 'reorderLevel',
      safetystock: 'safetyStock',
      hsncode: 'hsnCode',
      gstrate: 'gstRate',
      openingqty: 'openingQty',
    };

    reader.onload = () => {
      const text = reader.result;
      const rows = text.split(/\r?\n/).filter((line) => line.trim().length > 0);
      const headerLine = rows.shift();
      const header = headerLine
        ? parseCsvLine(headerLine.replace(/^\uFEFF/, '')).map((h) => normalizeHeader(h))
        : null;

      if (!header || header.length !== Object.keys(headerMap).length) {
        reject(new Error('CSV structure invalid. Expected columns: sku, name, description, category, unit, reorderLevel, safetyStock, hsnCode, gstRate, openingQty'));
        return;
      }

      const mappedHeader = header.map((column) => headerMap[column] || null);
      if (mappedHeader.some((value) => value === null)) {
        reject(new Error('CSV structure invalid. Expected columns: sku, name, description, category, unit, reorderLevel, safetyStock, hsnCode, gstRate, openingQty'));
        return;
      }

      const entries = rows.map((row, rowIndex) => {
        const values = parseCsvLine(row);
        const data = mappedHeader.reduce((acc, key, index) => {
          const value = values[index] || '';
          if (['reorderLevel', 'safetyStock', 'gstRate', 'openingQty'].includes(key)) {
            acc[key] = parseNumber(value);
          } else {
            acc[key] = value;
          }
          return acc;
        }, {});

        const success = !!data.sku && !!data.name;
        const message = success
          ? 'Imported successfully.'
          : 'Required fields missing: SKU and/or Name.';

        return {
          rowIndex: rowIndex + 2,
          success,
          message,
          data: {
            ...data,
            active: true,
          },
        };
      });

      resolve(entries);
    };

    reader.onerror = () => reject(new Error('Unable to read CSV file'));
    reader.readAsText(file);
  });
}
