import React, { useEffect, useMemo, useState } from 'react';
import {
  fetchReportData,
  buildCurrentStock,
  buildLowStock,
  buildItemMovement,
  buildStockValuation,
} from '../Services/ReportsService';
import './Reports.css';

const getXLSX = () => {
  if (typeof window === 'undefined') return null;
  const lib = window.XLSX || window.sheetjs || window.X || (window.default && (window.default.XLSX || window.default));
  return lib && typeof lib.utils !== 'undefined' ? lib : null;
};

const pageSizeOptions = [5, 10, 15];
const items = ['ALL', 'Steel Rods', 'Copper Wire', 'Plastic Sheets', 'Lubricant Oil', 'Packaging Box'];

function Reports() {
  const [records, setRecords] = useState([]);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [reportDate, setReportDate] = useState('');
  const [selectedItem, setSelectedItem] = useState('ALL');
  const [loading, setLoading] = useState(false);
  const [currentStockPage, setCurrentStockPage] = useState(1);
  const [currentStockPageSize, setCurrentStockPageSize] = useState(10);
  const [lowStockPage, setLowStockPage] = useState(1);
  const [lowStockPageSize, setLowStockPageSize] = useState(10);
  const [movementPage, setMovementPage] = useState(1);
  const [movementPageSize, setMovementPageSize] = useState(10);
  const [currentStockSearch, setCurrentStockSearch] = useState('');
  const [lowStockSearch, setLowStockSearch] = useState('');
  const [movementSearch, setMovementSearch] = useState('');
  const [valuationSearch, setValuationSearch] = useState('');

  useEffect(() => {
    setLoading(true);

    fetchReportData()
      .then(setRecords)
      .catch((error) => console.error(error))
      .finally(() => setLoading(false));
  }, []);

  const currentStock = useMemo(() => buildCurrentStock(records), [records]);
  const lowStock = useMemo(() => buildLowStock(records), [records]);
  const itemMovement = useMemo(
    () => buildItemMovement(records, selectedItem, dateFrom, dateTo),
    [records, selectedItem, dateFrom, dateTo],
  );
  const stockValuation = useMemo(() => buildStockValuation(records, reportDate), [records, reportDate]);

  const filteredCurrentStockRows = currentStock.rows.filter((row) => {
    const search = currentStockSearch.toLowerCase();
    if (!search) return true;
    return [row.item, row.category, row.unit, row.location].some((value) => value.toLowerCase().includes(search));
  });

  const filteredLowStockRows = lowStock.filter((row) => {
    const search = lowStockSearch.toLowerCase();
    if (!search) return true;
    return [row.item, row.category, row.unit].some((value) => value.toLowerCase().includes(search));
  });

  const filteredMovementRows = itemMovement.rows.filter((row) => {
    const search = movementSearch.toLowerCase();
    if (!search) return true;
    return [row.date, row.item, row.location, row.transactionType, row.reference, row.user, row.note]
      .some((value) => String(value).toLowerCase().includes(search));
  });

  const filteredStockValuation = stockValuation.categoriesValuation.filter((row) => {
    const search = valuationSearch.toLowerCase();
    if (!search) return true;
    return row.category.toLowerCase().includes(search);
  });

  const filteredStockValuationTotal = Number(
    filteredStockValuation.reduce((sum, row) => sum + row.stockValue, 0).toFixed(2),
  );

  const filteredCurrentStockTotals = {
    totalQuantity: filteredCurrentStockRows.reduce((sum, row) => sum + row.quantity, 0),
    totalValue: Number(filteredCurrentStockRows.reduce((sum, row) => sum + row.stockValue, 0).toFixed(2)),
  };

  const filteredLowStockTotals = {
    itemCount: filteredLowStockRows.length,
    totalShortfall: filteredLowStockRows.reduce((sum, row) => sum + (row.shortfall || 0), 0),
  };

  const currentStockPageCount = Math.max(1, Math.ceil(filteredCurrentStockRows.length / currentStockPageSize));
  const lowStockPageCount = Math.max(1, Math.ceil(filteredLowStockRows.length / lowStockPageSize));
  const movementPageCount = Math.max(1, Math.ceil(filteredMovementRows.length / movementPageSize));

  const displayedCurrentStockRows = filteredCurrentStockRows.slice(
    (currentStockPage - 1) * currentStockPageSize,
    currentStockPage * currentStockPageSize,
  );

  const displayedLowStockRows = filteredLowStockRows.slice(
    (lowStockPage - 1) * lowStockPageSize,
    lowStockPage * lowStockPageSize,
  );

  const displayedMovementRows = filteredMovementRows.slice(
    (movementPage - 1) * movementPageSize,
    movementPage * movementPageSize,
  );

  useEffect(() => {
    if (currentStockPage > currentStockPageCount) {
      setCurrentStockPage(currentStockPageCount);
    }
  }, [currentStockPageCount]);

  useEffect(() => {
    if (lowStockPage > lowStockPageCount) {
      setLowStockPage(lowStockPageCount);
    }
  }, [lowStockPageCount]);

  useEffect(() => {
    if (movementPage > movementPageCount) {
      setMovementPage(movementPageCount);
    }
  }, [movementPageCount]);

  const downloadCsv = (fileName, header, rows) => {
    const escapeCell = (value) => {
      if (value === null || value === undefined) return '';
      const text = String(value);
      if (/[",\n]/.test(text)) {
        return `"${text.replace(/"/g, '""')}"`;
      }
      return text;
    };

    const csvText = [header, ...rows].map((row) => row.map(escapeCell).join(',')).join('\r\n');
    const blob = new Blob([csvText], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${fileName.replace(/\s+/g, '_').toLowerCase()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const exportWorkbook = (name, header, rows) => {
    const XLSXlib = getXLSX();
    if (!XLSXlib) {
      downloadCsv(name, header, rows);
      return;
    }

    const wb = XLSXlib.utils.book_new();
    const ws = XLSXlib.utils.aoa_to_sheet([header, ...rows]);
    ws['!freeze'] = { xSplit: 0, ySplit: 1 };
    XLSXlib.utils.book_append_sheet(wb, ws, name);
    XLSXlib.writeFile(wb, `${name.replace(/\s+/g, '_').toLowerCase()}.xlsx`);
  };

  const exportCurrentStock = () => {
    const rows = filteredCurrentStockRows.map((row) => [
      row.item,
      row.category,
      row.unit,
      row.location,
      row.quantity,
      row.unitCost,
      row.stockValue,
    ]);
    exportWorkbook('Current Stock', ['Item', 'Category', 'Unit', 'Location', 'Quantity', 'Unit Cost', 'Stock Value'], rows);
  };

  const exportLowStock = () => {
    const rows = filteredLowStockRows.map((row) => [
      row.item,
      row.category,
      row.unit,
      row.quantity,
      row.reorderLevel,
      row.shortfall,
    ]);
    exportWorkbook('Low Stock', ['Item', 'Category', 'Unit', 'Quantity', 'Reorder Level', 'Shortfall'], rows);
  };

  const exportItemMovement = () => {
    const XLSXlib = getXLSX();
    const overview = [[
      'Opening Balance',
      'Inward',
      'Outward',
      'Closing Balance',
    ], [
      itemMovement.openingBalance,
      itemMovement.inward,
      itemMovement.outward,
      itemMovement.closingBalance,
    ]];

    const rows = itemMovement.rows.map((row) => [
      row.date,
      row.item,
      row.location,
      row.transactionType,
      row.quantity,
      row.reference,
      row.user,
      row.note,
    ]);

    if (!XLSXlib) {
      downloadCsv(
        'Item Movement',
        ['Date', 'Item', 'Location', 'Type', 'Quantity', 'Reference', 'User', 'Note'],
        rows,
      );
      return;
    }

    const wb = XLSXlib.utils.book_new();
    const summarySheet = XLSXlib.utils.aoa_to_sheet([
      [`Item Movement report for ${selectedItem}`],
      [],
      ['Date from', dateFrom || 'Any'],
      ['Date to', dateTo || 'Any'],
      [],
      ...overview,
    ]);
    summarySheet['!freeze'] = { xSplit: 0, ySplit: 3 };
    XLSXlib.utils.book_append_sheet(wb, summarySheet, 'Summary');
    const detailSheet = XLSXlib.utils.aoa_to_sheet([
      ['Date', 'Item', 'Location', 'Type', 'Quantity', 'Reference', 'User', 'Note'],
      ...rows,
    ]);
    detailSheet['!freeze'] = { xSplit: 0, ySplit: 1 };
    XLSXlib.utils.book_append_sheet(wb, detailSheet, 'Rows');
    XLSXlib.writeFile(wb, 'item_movement.xlsx');
  };

  const exportStockValuation = () => {
    const rows = filteredStockValuation.map((row) => [row.category, row.stockValue]);
    const totalRow = ['Total', filteredStockValuationTotal];
    exportWorkbook('Stock Valuation', ['Category', 'Stock Value'], [...rows, [], totalRow]);
  };

  return (
    <>
      <div className="content-header">
        <div>
          <h1>Reports</h1>
          {/* <p>Current stock, low stock, item movement and stock valuation reports with Excel export.</p> */}
        </div>
      </div>

      <div className="reports-card">
        <div className="reports-filters">
          <label>
            Date from
            <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
          </label>
          <label>
            Date to
            <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
          </label>
          <label>
            Select Item
            <select value={selectedItem} onChange={(e) => setSelectedItem(e.target.value)}>
              {items.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
          <label>
            Valuation as on
            <input type="date" value={reportDate} onChange={(e) => setReportDate(e.target.value)} />
          </label>
        </div>

        {/* <div className="reports-actions">
          <button type="button" className="button-primary" onClick={exportCurrentStock} disabled={!currentStock.rows?.length}>
            Export Current Stock
          </button>
          <button type="button" className="button-primary" onClick={exportLowStock} disabled={!lowStock.length}>
            Export Low Stock
          </button>
          <button type="button" className="button-primary" onClick={exportItemMovement} disabled={!itemMovement.rows.length || selectedItem === 'ALL'}>
            Export Item Movement
          </button>
          <button type="button" className="button-primary" onClick={exportStockValuation} disabled={!stockValuation.categoriesValuation.length}>
            Export Stock Valuation
          </button>
        </div> */}

        <section className="report-section">
          <div className="report-section-header">
            <div className="report-section-header-left">
              <h2>Current Stock</h2>
              <div className="report-search">
                <input
                  type="text"
                  placeholder="Search current stock"
                  value={currentStockSearch}
                  onChange={(e) => {
                    setCurrentStockSearch(e.target.value);
                    setCurrentStockPage(1);
                  }}
                />
              </div>
            </div>
            <div className="report-summary-inline">
              <span>Total value: {filteredCurrentStockTotals.totalValue}</span>
              <span>Total qty: {filteredCurrentStockTotals.totalQuantity}</span>
              <button
                type="button"
                className="button-primary report-section-export"
                onClick={exportCurrentStock}
                disabled={!filteredCurrentStockRows.length}
              >
                Export Current Stock
              </button>
            </div>
          </div>
          <div className="report-table-wrapper">
            <table className="report-table">
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Category</th>
                  <th>Unit</th>
                  <th>Location</th>
                  <th>Quantity</th>
                  <th>Unit Cost</th>
                  <th>Stock Value</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="7">Loading...</td>
                  </tr>
                ) : displayedCurrentStockRows.length === 0 ? (
                  <tr>
                    <td colSpan="7">No data available.</td>
                  </tr>
                ) : (
                  displayedCurrentStockRows.map((row, index) => (
                    <tr key={index}>
                      <td>{row.item}</td>
                      <td>{row.category}</td>
                      <td>{row.unit}</td>
                      <td>{row.location}</td>
                      <td>{row.quantity}</td>
                      <td>{row.unitCost}</td>
                      <td>{row.stockValue}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="pagination-controls">
            <button type="button" onClick={() => setCurrentStockPage((prev) => Math.max(prev - 1, 1))} disabled={currentStockPage === 1}>
              Previous
            </button>
            <span>
              Page {currentStockPage} of {currentStockPageCount}
            </span>
            <button type="button" onClick={() => setCurrentStockPage((prev) => Math.min(prev + 1, currentStockPageCount))} disabled={currentStockPage === currentStockPageCount}>
              Next
            </button>
            <label>
              Rows per page
              <select value={currentStockPageSize} onChange={(e) => { setCurrentStockPageSize(Number(e.target.value)); setCurrentStockPage(1); }}>
                {pageSizeOptions.map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </section>

        <section className="report-section">
          <div className="report-section-header">
            <div className="report-section-header-left">
              <h2>Low Stock</h2>
              <div className="report-search">
                <input
                  type="text"
                  placeholder="Search low stock"
                  value={lowStockSearch}
                  onChange={(e) => {
                    setLowStockSearch(e.target.value);
                    setLowStockPage(1);
                  }}
                />
              </div>
            </div>
            <div className="report-summary-inline">
              <span>Low items: {filteredLowStockTotals.itemCount}</span>
              <span>Shortfall: {filteredLowStockTotals.totalShortfall}</span>
              <button
                type="button"
                className="button-primary report-section-export"
                onClick={exportLowStock}
                disabled={!filteredLowStockRows.length}
              >
                Export Low Stock
              </button>
            </div>
          </div>
          <div className="report-table-wrapper">
            <table className="report-table">
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Category</th>
                  <th>Unit</th>
                  <th>Quantity</th>
                  <th>Reorder Level</th>
                  <th>Shortfall</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="6">Loading...</td>
                  </tr>
                ) : displayedLowStockRows.length === 0 ? (
                  <tr>
                    <td colSpan="6">No low stock items.</td>
                  </tr>
                ) : (
                  displayedLowStockRows.map((row, index) => (
                    <tr key={index}>
                      <td>{row.item}</td>
                      <td>{row.category}</td>
                      <td>{row.unit}</td>
                      <td>{row.quantity}</td>
                      <td>{row.reorderLevel}</td>
                      <td>{row.shortfall}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="pagination-controls">
            <button type="button" onClick={() => setLowStockPage((prev) => Math.max(prev - 1, 1))} disabled={lowStockPage === 1}>
              Previous
            </button>
            <span>
              Page {lowStockPage} of {lowStockPageCount}
            </span>
            <button type="button" onClick={() => setLowStockPage((prev) => Math.min(prev + 1, lowStockPageCount))} disabled={lowStockPage === lowStockPageCount}>
              Next
            </button>
            <label>
              Rows per page
              <select value={lowStockPageSize} onChange={(e) => { setLowStockPageSize(Number(e.target.value)); setLowStockPage(1); }}>
                {pageSizeOptions.map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </section>

        <section className="report-section">
          <div className="report-section-header">
            <div className="report-section-header-left">
              <h2>Item Movement</h2>
              <div className="report-search">
                <input
                  type="text"
                  placeholder="Search item movement"
                  value={movementSearch}
                  onChange={(e) => {
                    setMovementSearch(e.target.value);
                    setMovementPage(1);
                  }}
                />
              </div>
            </div>
            <div className="report-summary-inline">
              <span>Opening: {itemMovement.openingBalance}</span>
              <span>Inward: {itemMovement.inward}</span>
              <span>Outward: {itemMovement.outward}</span>
              <span>Closing: {itemMovement.closingBalance}</span>
              <button
                type="button"
                className="button-primary report-section-export"
                onClick={exportItemMovement}
                disabled={!filteredMovementRows.length || selectedItem === 'ALL'}
              >
                Export Item Movement
              </button>
            </div>
          </div>
          <div className="report-table-wrapper">
            <table className="report-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Item</th>
                  <th>Location</th>
                  <th>Type</th>
                  <th>Quantity</th>
                  <th>Reference</th>
                  <th>User</th>
                  <th>Note</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="8">Loading...</td>
                  </tr>
                ) : displayedMovementRows.length === 0 ? (
                  <tr>
                    <td colSpan="8">No movement rows for selected item/date range.</td>
                  </tr>
                ) : (
                  displayedMovementRows.map((row, index) => (
                    <tr key={index}>
                      <td>{row.date}</td>
                      <td>{row.item}</td>
                      <td>{row.location}</td>
                      <td>{row.transactionType}</td>
                      <td>{row.quantity}</td>
                      <td>{row.reference}</td>
                      <td>{row.user}</td>
                      <td>{row.note}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="pagination-controls">
            <button type="button" onClick={() => setMovementPage((prev) => Math.max(prev - 1, 1))} disabled={movementPage === 1}>
              Previous
            </button>
            <span>
              Page {movementPage} of {movementPageCount}
            </span>
            <button type="button" onClick={() => setMovementPage((prev) => Math.min(prev + 1, movementPageCount))} disabled={movementPage === movementPageCount}>
              Next
            </button>
            <label>
              Rows per page
              <select value={movementPageSize} onChange={(e) => { setMovementPageSize(Number(e.target.value)); setMovementPage(1); }}>
                {pageSizeOptions.map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </section>

        <section className="report-section">
          <div className="report-section-header">
            <div className="report-section-header-left">
              <h2>Stock Valuation</h2>
              <div className="report-search">
                <input
                  type="text"
                  placeholder="Search valuation"
                  value={valuationSearch}
                  onChange={(e) => setValuationSearch(e.target.value)}
                />
              </div>
            </div>
            <div className="report-summary-inline">
              <span>Total value: {filteredStockValuationTotal}</span>
              <button
                type="button"
                className="button-primary report-section-export"
                onClick={exportStockValuation}
                disabled={!filteredStockValuation.length}
              >
                Export Stock Valuation
              </button>
            </div>
          </div>
          <div className="report-table-wrapper">
            <table className="report-table">
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Stock Value</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="2">Loading...</td>
                  </tr>
                ) : filteredStockValuation.length === 0 ? (
                  <tr>
                    <td colSpan="2">No valuation data available.</td>
                  </tr>
                ) : (
                  filteredStockValuation.map((row, index) => (
                    <tr key={index}>
                      <td>{row.category}</td>
                      <td>{row.stockValue}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </>
  );
}

export default Reports;
