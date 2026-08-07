import React, { useEffect, useMemo, useState, useRef } from 'react';
import {
  fetchItems,
  createItem,
  updateItem,
  deactivateItem,
  parseCsvFile,
} from '../Services/ItemMasterService';
import './ItemMaster.css';

const categoryOptions = ['RAW_MATERIAL', 'WIP', 'FINISHED_GOOD', 'CONSUMABLE', 'SPARE'];
const unitOptions = ['NOS', 'KG', 'GRAM', 'LITRE', 'METRE', 'SQ_METRE', 'BOX', 'ROLL'];

const initialForm = {
  sku: '',
  name: '',
  description: '',
  category: 'RAW_MATERIAL',
  unit: 'NOS',
  reorderLevel: 0,
  safetyStock: 0,
  hsnCode: '',
  gstRate: 0,
  openingQty: 0,
  active: true,
};

function ItemMaster() {
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState({ query: '', category: 'ALL', status: 'ALL' });
  const [page, setPage] = useState(1);
  const [pageSize] = useState(5);
  const [selectedItem, setSelectedItem] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [importResults, setImportResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [notification, setNotification] = useState(null);
  const notificationTimerRef = useRef(null);

  const openCreateModal = () => {
    setSelectedItem(null);
    setForm(initialForm);
    setIsModalOpen(true);
  };

  const openEditModal = (item) => {
    setSelectedItem(item);
    setForm(item);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedItem(null);
    setForm(initialForm);
  };

  const showNotification = (message, type = 'success') => {
    if (notificationTimerRef.current) {
      clearTimeout(notificationTimerRef.current);
    }
    setNotification({ message, type });
    notificationTimerRef.current = setTimeout(() => {
      setNotification(null);
      notificationTimerRef.current = null;
    }, 5000);
  };

  useEffect(() => {
    return () => {
      if (notificationTimerRef.current) {
        clearTimeout(notificationTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchItems()
      .then(setItems)
      .catch((error) => console.error(error))
      .finally(() => setLoading(false));
  }, []);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const query = filter.query.trim().toLowerCase();
      const matchesQuery =
        !query || [item.sku, item.name].some((value) => value.toLowerCase().includes(query));
      const matchesCategory = filter.category === 'ALL' || item.category === filter.category;
      const matchesStatus =
        filter.status === 'ALL' ||
        (filter.status === 'ACTIVE' && item.active) ||
        (filter.status === 'INACTIVE' && !item.active);
      return matchesQuery && matchesCategory && matchesStatus;
    });
  }, [items, filter]);

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / pageSize));
  const pagedItems = filteredItems.slice((page - 1) * pageSize, page * pageSize);

  const setField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    if (!form.sku || !form.name) {
      showNotification('SKU and name are required.', 'error');
      return;
    }

    setLoading(true);
    try {
      const saved = selectedItem ? await updateItem({ ...selectedItem, ...form }) : await createItem(form);
      setItems((prev) => {
        if (selectedItem) {
          return prev.map((item) => (item.id === saved.id ? saved : item));
        }
        return [saved, ...prev];
      });
      closeModal();
      showNotification(selectedItem ? 'Item updated successfully.' : 'Item added successfully.');
    } catch (error) {
      showNotification(error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item) => {
    setSelectedItem(item);
    setForm(item);
  };

  const handleDeactivate = async (item) => {
    if (!window.confirm('Deactivate this item?')) return;
    setLoading(true);
    try {
      await deactivateItem(item.id);
      setItems((prev) => prev.map((row) => (row.id === item.id ? { ...row, active: false } : row)));
      showNotification('Item deactivated successfully.');
    } catch (error) {
      showNotification(error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCsvImport = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const results = await parseCsvFile(file);
      setImportResults(results);
      const successfulRows = results.filter((result) => result.success);
      const importedItems = successfulRows.map((result) => ({ id: Date.now() + Math.random(), ...result.data }));
      setItems((prev) => [...importedItems, ...prev]);
      if (successfulRows.length > 0) {
        showNotification(`${successfulRows.length} CSV record${successfulRows.length > 1 ? 's' : ''} successfully added.`);
      }
      if (successfulRows.length === 0 || successfulRows.length < results.length) {
        const errorCount = results.length - successfulRows.length;
        const message = successfulRows.length === 0
          ? 'No valid CSV records were imported.'
          : `${errorCount} row${errorCount > 1 ? 's' : ''} had missing required fields.`;
        showNotification(message, 'error');
      }
    } catch (error) {
      setImportResults([{ rowIndex: 0, success: false, message: error.message }]);
      showNotification(error.message, 'error');
    }
  };

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [totalPages, page]);

  return (
    <>
      <div className="content-header">
        <div>
          <h1>Item Master</h1>
          {/* <p>Use SKU-based item management, search, filters, CSV import, and soft-deactivation.</p> */}
        </div>
      </div>

      {notification && (
        <div className={`toast-notification ${notification.type}`} role="status">
          {notification.message}
        </div>
      )}

      <div className="item-master-card">
        <div className="item-master-header">
          <div className="item-master-search">
            <div>
              <label>Search</label>
              <input
                type="text"
                value={filter.query}
                onChange={(e) => setFilter((prev) => ({ ...prev, query: e.target.value }))}
                placeholder="Search by SKU or name"
              />
            </div>
            <div>
              <label>Category</label>
              <select
                value={filter.category}
                onChange={(e) => setFilter((prev) => ({ ...prev, category: e.target.value }))}
              >
                <option value="ALL">All</option>
                {categoryOptions.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label>Status</label>
              <select
                value={filter.status}
                onChange={(e) => setFilter((prev) => ({ ...prev, status: e.target.value }))}
              >
                <option value="ALL">All</option>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </div>
          </div>
          <div className="item-master-actions">
            <button type="button" className="button-secondary" onClick={openCreateModal}>
              New Item
            </button>
            <label className="button-primary" style={{ cursor: 'pointer' }}>
              Import CSV
              <input type="file" accept=".csv" onChange={handleCsvImport} style={{ display: 'none' }} />
            </label>
          </div>
        </div>
<section className="masters-table-panel">
        <table className="item-master-table">
          <thead>
            <tr>
              <th>SKU</th>
              <th>Name</th>
              <th>Category</th>
              <th>Unit</th>
              <th>Stock</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {pagedItems.map((item) => (
              <tr key={item.id}>
                <td>{item.sku}</td>
                <td>{item.name}</td>
                <td>{item.category}</td>
                <td>{item.unit}</td>
                <td>{item.openingQty}</td>
                <td>
                  <span className={`status-pill ${item.active ? 'status-active' : 'status-inactive'}`}>
                    {item.active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td>
                    <button
                    type="button"
                    className="button-secondary"
                    onClick={() => openEditModal(item)}
                    disabled={!item.active}
                    title={item.active ? 'Edit item' : 'Cannot edit inactive item'}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className="button-danger"
                    onClick={() => handleDeactivate(item)}
                    disabled={!item.active}
                    style={{ marginLeft: '0.5rem' }}
                  >
                    Deactivate
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </section>

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
        </div>
      </div>

      <div className="item-master-grid">
        <div className="item-master-panel">
          <h2>Import Results</h2>
          {importResults.length > 0 ? (
            <div className="import-result">
              {importResults.map((result) => (
                <p key={result.rowIndex} style={{ color: result.success ? '#0f766e' : '#991b1b' }}>
                  Row {result.rowIndex}: {result.message}
                </p>
              ))}
            </div>
          ) : (
            <p>Upload a valid CSV file to import items into the system.</p>
          )}
        </div>
      </div>

      {isModalOpen && (
        <div className="item-modal-overlay" onClick={closeModal}>
          <div className="item-modal" onClick={(e) => e.stopPropagation()}>
            <div className="item-modal-header">
              <div>
                <h3>{selectedItem ? 'Edit Item' : 'Add New Item'}</h3>
              </div>
              <button type="button" className="item-modal-close" onClick={closeModal}>
                ×
              </button>
            </div>
            <div className="item-modal-body">
              <div>
                <label>SKU Code</label>
                <input value={form.sku} onChange={(e) => setField('sku', e.target.value)} placeholder="Unique SKU" />
              </div>
              <div>
                <label>Name</label>
                <input value={form.name} onChange={(e) => setField('name', e.target.value)} placeholder="Item name" />
              </div>
              <div>
                <label>Description</label>
                <textarea value={form.description} onChange={(e) => setField('description', e.target.value)} rows={3} placeholder="Item description" />
              </div>
              <div>
                <label>Category</label>
                <select value={form.category} onChange={(e) => setField('category', e.target.value)}>
                  {categoryOptions.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label>Unit of Measure</label>
                <select value={form.unit} onChange={(e) => setField('unit', e.target.value)}>
                  {unitOptions.map((unit) => (
                    <option key={unit} value={unit}>
                      {unit}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label>Reorder Level</label>
                <input type="number" value={form.reorderLevel} onChange={(e) => setField('reorderLevel', Number(e.target.value))} />
              </div>
              <div>
                <label>Safety Stock</label>
                <input type="number" value={form.safetyStock} onChange={(e) => setField('safetyStock', Number(e.target.value))} />
              </div>
              <div>
                <label>HSN Code</label>
                <input value={form.hsnCode} onChange={(e) => setField('hsnCode', e.target.value)} />
              </div>
              <div>
                <label>GST Rate</label>
                <input type="number" value={form.gstRate} onChange={(e) => setField('gstRate', Number(e.target.value))} />
              </div>
              <div>
                <label>Opening Quantity</label>
                <input type="number" value={form.openingQty} onChange={(e) => setField('openingQty', Number(e.target.value))} />
              </div>
              <div className="item-modal-actions">
                <button type="button" className="button-primary" onClick={handleSave} disabled={loading}>
                  {selectedItem ? 'Save Changes' : 'Create Item'}
                </button>
                <button type="button" className="button-secondary" onClick={closeModal}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default ItemMaster;
