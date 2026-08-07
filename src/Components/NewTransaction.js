import React, { useEffect, useMemo, useState, useRef } from 'react';
import { fetchStockTransactions } from '../Services/StockLedgerService';
import './NewTransaction.css';

const transactionTypes = ['IN', 'OUT', 'TRANSFER', 'ADJUSTMENT'];
const itemOptions = ['Steel Rods', 'Copper Wire', 'Plastic Sheets', 'Lubricant Oil', 'Packaging Box'];
const locationOptions = ['Warehouse A', 'Warehouse B', 'Retail Outlet', 'Dispatch Center'];

const initialForm = {
  date: new Date().toISOString().slice(0, 10),
  item: itemOptions[0],
  location: locationOptions[0],
  transactionType: transactionTypes[0],
  quantity: 1,
  reference: '',
  note: '',
};

function NewTransaction() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const pageSizeOptions = [5, 10, 15];
  const [notification, setNotification] = useState(null);
  const notificationTimerRef = useRef(null);

  useEffect(() => {
    setLoading(true);
    fetchStockTransactions()
      .then((data) => setTransactions(data.slice(0, 12)))
      .catch((error) => showNotification(error.message, 'error'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    return () => {
      if (notificationTimerRef.current) {
        clearTimeout(notificationTimerRef.current);
      }
    };
  }, []);

  const showNotification = (message, type = 'success') => {
    if (notificationTimerRef.current) {
      clearTimeout(notificationTimerRef.current);
    }
    setNotification({ message, type });
    notificationTimerRef.current = setTimeout(() => {
      setNotification(null);
      notificationTimerRef.current = null;
    }, 4000);
  };

  const setField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!form.reference.trim()) {
      showNotification('Reference is required.', 'error');
      return;
    }
    if (form.quantity <= 0) {
      showNotification('Quantity must be greater than zero.', 'error');
      return;
    }

    const newTransaction = {
      id: Date.now(),
      ...form,
      note: form.note.trim() || 'Manual stock transaction',
    };

    setTransactions((prev) => [newTransaction, ...prev].slice(0, 12));
    setForm(initialForm);
    showNotification('Transaction created successfully.');
  };

  const filteredTransactions = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return transactions;

    return transactions.filter((tx) =>
      [tx.date, tx.item, tx.location, tx.transactionType, tx.reference, tx.note]
        .join(' ')
        .toLowerCase()
        .includes(query),
    );
  }, [transactions, searchQuery]);

  const summary = useMemo(() => {
    return {
      totalTransactions: filteredTransactions.length,
      totalQuantity: filteredTransactions.reduce((sum, tx) => sum + Number(tx.quantity || 0), 0),
      inbound: filteredTransactions.filter((tx) => tx.transactionType === 'IN').length,
      outbound: filteredTransactions.filter((tx) => tx.transactionType === 'OUT').length,
    };
  }, [filteredTransactions]);

  const pageCount = Math.max(1, Math.ceil(filteredTransactions.length / pageSize));
  const displayedTransactions = filteredTransactions.slice((page - 1) * pageSize, page * pageSize);

  useEffect(() => {
    if (page > pageCount) {
      setPage(pageCount);
    }
  }, [pageCount, page]);

  useEffect(() => {
    setPage(1);
  }, [filteredTransactions, pageSize]);

  return (
    <>
      <div className="content-header">
        <div>
          <h1>New Transaction</h1>
          {/* <p>Record stock movement with a simple form and review recent entries from a dummy JSON API.</p> */}
        </div>
      </div>

      {notification && (
        <div className={`toast-notification ${notification.type}`} role="status">
          {notification.message}
        </div>
      )}

      <div className="new-transaction-card">
        <div className="new-transaction-card-header">
          <div>
            <h2>Create stock transaction</h2>
            <p style={{ margin: 0, color: '#687394' }}>
              Use the form to add a dummy transaction. The table updates immediately.
            </p>
          </div>
        </div>

        <div className="new-transaction-grid">
          <form className="new-transaction-form" onSubmit={handleSubmit}>
            <div className="transaction-top-row">
              <label className="field-inline">
                Date
                <input
                  type="date"
                  className="date-input"
                  value={form.date}
                  onChange={(e) => setField('date', e.target.value)}
                />
              </label>
            </div>
            <label>
              Item
              <select value={form.item} onChange={(e) => setField('item', e.target.value)}>
                {itemOptions.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Location
              <select value={form.location} onChange={(e) => setField('location', e.target.value)}>
                {locationOptions.map((location) => (
                  <option key={location} value={location}>
                    {location}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Transaction type
              <select
                value={form.transactionType}
                onChange={(e) => setField('transactionType', e.target.value)}
              >
                {transactionTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Quantity
              <input
                type="number"
                min="1"
                value={form.quantity}
                onChange={(e) => setField('quantity', Number(e.target.value))}
              />
            </label>
            <div className="reference-note-card">
              <label>
                Reference
                <input
                  type="text"
                  value={form.reference}
                  onChange={(e) => setField('reference', e.target.value)}
                  placeholder="REF-1234"
                />
              </label>
              <label>
                Note
                <textarea
                  value={form.note}
                  onChange={(e) => setField('note', e.target.value)}
                  placeholder="Optional note"
                />
              </label>
              <div className="form-action-row">
                <button type="submit" className="button-primary">
                  Save transaction
                </button>
                <button
                  type="button"
                  className="button-secondary"
                  onClick={() => setForm(initialForm)}
                >
                  Reset
                </button>
              </div>
            </div>
          </form>

          <div className="transaction-panel">
            <div className="transaction-summary">
              <div className="transaction-summary-card">
                <strong>Total transactions</strong>
                {summary.totalTransactions}
              </div>
              <div className="transaction-summary-card">
                <strong>Total quantity</strong>
                {summary.totalQuantity}
              </div>
              <div className="transaction-summary-card">
                <strong>Inbound count</strong>
                {summary.inbound}
              </div>
              <div className="transaction-summary-card">
                <strong>Outbound count</strong>
                {summary.outbound}
              </div>
            </div>

            <div className="transaction-table-card">
              <div className="transaction-table-card-top">
                <div>
                  <h3>Recent transactions</h3>
                  <p>Filter and review stock entries close to the table.</p>
                </div>
                <div className="transaction-table-search">
                  <label>
                    Search transactions
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search recent transactions"
                    />
                  </label>
                </div>
              </div>
              <div className="transaction-table-wrap">
                <table className="transaction-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Item</th>
                      <th>Location</th>
                      <th>Type</th>
                      <th>Qty</th>
                      <th>Reference</th>
                      <th>Note</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan="7">Loading transactions...</td>
                      </tr>
                    ) : filteredTransactions.length === 0 ? (
                      <tr>
                        <td colSpan="7">No transactions found.</td>
                      </tr>
                    ) : (
                      displayedTransactions.map((tx) => (
                        <tr key={tx.id}>
                          <td>{tx.date}</td>
                          <td>{tx.item}</td>
                          <td>{tx.location}</td>
                          <td>{tx.transactionType}</td>
                          <td>{tx.quantity}</td>
                          <td>{tx.reference}</td>
                          <td>{tx.note}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              <div className="pagination-controls">
                <div className="pagination-group pagination-group-left">
                  <button type="button" onClick={() => setPage((prev) => Math.max(prev - 1, 1))} disabled={page === 1}>
                    Previous
                  </button>
                </div>
                <span className="pagination-label">
                  Page {page} of {pageCount}
                </span>
                <div className="pagination-group pagination-group-right">
                  <button type="button" onClick={() => setPage((prev) => Math.min(prev + 1, pageCount))} disabled={page === pageCount}>
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
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default NewTransaction;