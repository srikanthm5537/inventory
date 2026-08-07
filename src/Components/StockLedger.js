import React, { useEffect, useMemo, useState } from 'react';
import { fetchStockTransactions } from '../Services/StockLedgerService';
import './StockLedger.css';

const transactionOptions = ['ALL', 'IN', 'OUT', 'TRANSFER', 'ADJUSTMENT'];
const pageSizeOptions = [5, 10, 15];

function StockLedger() {
  const [transactions, setTransactions] = useState([]);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [item, setItem] = useState('ALL');
  const [location, setLocation] = useState('ALL');
  const [transactionType, setTransactionType] = useState('ALL');
  const [user, setUser] = useState('ALL');
  const [sortKey, setSortKey] = useState('date');
  const [sortDirection, setSortDirection] = useState('desc');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetchStockTransactions()
      .then((data) => setTransactions(data))
      .catch((error) => console.error(error))
      .finally(() => setLoading(false));
  }, []);

  const getUniqueOptions = (key) => [
    'ALL',
    ...Array.from(new Set(transactions.map((row) => row[key]))).sort(),
  ];

  const filteredData = useMemo(() => {
    return transactions
      .filter((row) => (dateFrom ? row.date >= dateFrom : true))
      .filter((row) => (dateTo ? row.date <= dateTo : true))
      .filter((row) => (item !== 'ALL' ? row.item === item : true))
      .filter((row) => (location !== 'ALL' ? row.location === location : true))
      .filter((row) => (transactionType !== 'ALL' ? row.transactionType === transactionType : true))
      .filter((row) => (user !== 'ALL' ? row.user === user : true));
  }, [transactions, dateFrom, dateTo, item, location, transactionType, user]);

  const sortedData = useMemo(() => {
    const copy = [...filteredData];
    return copy.sort((a, b) => {
      const first = a[sortKey];
      const second = b[sortKey];

      if (first < second) {
        return sortDirection === 'asc' ? -1 : 1;
      }
      if (first > second) {
        return sortDirection === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [filteredData, sortKey, sortDirection]);

  const totalPages = Math.max(1, Math.ceil(sortedData.length / pageSize));
  const displayedRows = sortedData.slice((page - 1) * pageSize, page * pageSize);

  useEffect(() => {
    setPage(1);
  }, [sortedData, pageSize]);

  const exportToCsv = () => {
    const header = ['Date', 'Item', 'Location', 'Type', 'User', 'Quantity', 'Reference', 'Note'];
    const rows = sortedData.map((row) => [
      row.date,
      row.item,
      row.location,
      row.transactionType,
      row.user,
      row.quantity,
      row.reference,
      row.note,
    ]);

    const csvContent = [header, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'stock-ledger.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
  };

  return (
    <>
      <div className="content-header">
        <div>
          <h1>Stock Ledger</h1>
          {/* <p>Paginated, sortable ledger with date, item, location, type and user filters plus export.</p> */}
        </div>
      </div>

      <div className="stock-ledger-card">
        <div className="stock-ledger-header">
          <div className="stock-ledger-filters">
            <label>
              Date from
              <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
            </label>
            <label>
              Date to
              <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
            </label>
            <label>
              Item
              <select value={item} onChange={(e) => setItem(e.target.value)}>
                {getUniqueOptions('item').map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Location
              <select value={location} onChange={(e) => setLocation(e.target.value)}>
                {getUniqueOptions('location').map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Transaction type
              <select value={transactionType} onChange={(e) => setTransactionType(e.target.value)}>
                {transactionOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
            <label>
              User
              <select value={user} onChange={(e) => setUser(e.target.value)}>
                {getUniqueOptions('user').map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>

        <div className="stock-ledger-toolbar">
          <div>
            <strong>{sortedData.length}</strong> record{sortedData.length !== 1 ? 's' : ''} found
          </div>
          <div className="stock-ledger-actions">
            <button type="button" className="button-secondary" onClick={() => setPage(1)}>
              Reset page
            </button>
            <button type="button" className="button-primary" onClick={exportToCsv} disabled={sortedData.length === 0}>
              Export CSV
            </button>
          </div>
        </div>

        <div className="stock-ledger-table-wrap">
          <table className="stock-ledger-table">
            <thead>
              <tr>
                {['date', 'item', 'location', 'transactionType', 'user', 'quantity', 'reference', 'note'].map((field) => (
                  <th key={field} onClick={() => handleSort(field)} style={{ cursor: 'pointer' }}>
                    {field === 'transactionType' ? 'Type' : field.charAt(0).toUpperCase() + field.slice(1)}
                    {sortKey === field ? (sortDirection === 'asc' ? ' ▲' : ' ▼') : ''}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8">Loading transactions...</td>
                </tr>
              ) : displayedRows.length === 0 ? (
                <tr>
                  <td colSpan="8">No records found for selected filters.</td>
                </tr>
              ) : (
                displayedRows.map((row) => (
                  <tr key={row.id}>
                    <td>{row.date}</td>
                    <td>{row.item}</td>
                    <td>{row.location}</td>
                    <td>{row.transactionType}</td>
                    <td>{row.user}</td>
                    <td>{row.quantity}</td>
                    <td>{row.reference}</td>
                    <td>{row.note}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="pagination-controls">
          <button type="button" onClick={() => setPage((prev) => Math.max(prev - 1, 1))} disabled={page === 1}>
            Previous
          </button>
          <span>
            Page {page} of {totalPages}
          </span>
          <button type="button" onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))} disabled={page === totalPages}>
            Next
          </button>
          <label>
            Rows per page
            <select value={pageSize} onChange={(e) => setPageSize(Number(e.target.value))}>
              {pageSizeOptions.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>
    </>
  );
}

export default StockLedger;
