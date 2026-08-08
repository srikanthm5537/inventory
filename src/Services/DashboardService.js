// src/Services/DashboardService.js

export const fetchDashboardData = async () => {
  // Simulate network latency (600ms)
  await new Promise((resolve) => setTimeout(resolve, 600));

  // Return mock dynamic payload
  return {
    metrics: {
      totalActiveSKUs: 142,
      totalStockValue: "1,84,500",
      reorderLevelCount: 4,
      transactionsToday: 28,
    },
    // FR-41: 14-Day Inward vs Outward movement data
    movementData: [
      { day: 'Day 1', inward: 120, outward: 80 },
      { day: 'Day 2', inward: 95, outward: 110 },
      { day: 'Day 3', inward: 150, outward: 90 },
      { day: 'Day 4', inward: 80, outward: 130 },
      { day: 'Day 5', inward: 200, outward: 170 },
      { day: 'Day 6', inward: 110, outward: 95 },
      { day: 'Day 7', inward: 60, outward: 40 },
      { day: 'Day 8', inward: 140, outward: 120 },
      { day: 'Day 9', inward: 180, outward: 160 },
      { day: 'Day 10', inward: 90, outward: 105 },
      { day: 'Day 11', inward: 210, outward: 140 },
      { day: 'Day 12', inward: 130, outward: 150 },
      { day: 'Day 13', inward: 175, outward: 110 },
      { day: 'Day 14', inward: 190, outward: 130 },
    ],
    // FR-42: 10 Most Recent Transactions
    recentTransactions: [
      { id: 'TXN-101', type: 'INWARD', item: 'Item A', quantity: 50, user: 'John Operator' },
      { id: 'TXN-102', type: 'OUTWARD', item: 'Item B', quantity: 20, user: 'Alex Manager' },
      { id: 'TXN-103', type: 'OUTWARD', item: 'Item C', quantity: 12, user: 'John Operator' },
      { id: 'TXN-104', type: 'INWARD', item: 'Item D', quantity: 100, user: 'Sarah Store' },
      { id: 'TXN-105', type: 'OUTWARD', item: 'Item E', quantity: 5, user: 'Alex Manager' },
      { id: 'TXN-106', type: 'INWARD', item: 'Item F', quantity: 45, user: 'John Operator' },
      { id: 'TXN-107', type: 'OUTWARD', item: 'Item A', quantity: 15, user: 'Sarah Store' },
      { id: 'TXN-108', type: 'OUTWARD', item: 'Item G', quantity: 30, user: 'John Operator' },
      { id: 'TXN-109', type: 'INWARD', item: 'Item H', quantity: 80, user: 'Alex Manager' },
      { id: 'TXN-110', type: 'OUTWARD', item: 'Item B', quantity: 8, user: 'Sarah Store' },
    ],
    // FR-43: Low-Stock Items sorted by severity (highest shortfall percentage first)
    lowStockItems: [
      { id: 1, sku: 'SKU-005', name: 'Item E', currentQty: 3, reorderLevel: 15, severity: 'High' },
      { id: 2, sku: 'SKU-003', name: 'Item C', currentQty: 8, reorderLevel: 20, severity: 'High' },
      { id: 3, sku: 'SKU-004', name: 'Item D', currentQty: 14, reorderLevel: 30, severity: 'Medium' },
      { id: 4, sku: 'SKU-009', name: 'Item K', currentQty: 22, reorderLevel: 25, severity: 'Low' },
    ],
  };
};