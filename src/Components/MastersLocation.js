import React, { useEffect, useMemo, useState, useRef } from 'react';
import {
  fetchLocations,
  fetchSuppliers,
  createLocation,
  updateLocation,
  deactivateLocation,
  createSupplier,
  updateSupplier,
  locationTypes,
} from '../Services/MastersService';
import './MastersLocation.css';

const initialLocation = {
  code: '',
  name: '',
  type: locationTypes[0],
  stock: 0,
  active: true,
};

const initialSupplier = {
  code: '',
  name: '',
  contact: '',
  phone: '',
  email: '',
  gstin: '',
};

function MastersLocation() {
  const [locations, setLocations] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [activeTab, setActiveTab] = useState('locations');
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [locationForm, setLocationForm] = useState(initialLocation);
  const [supplierForm, setSupplierForm] = useState(initialSupplier);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState('location');
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);
  const notificationTimerRef = useRef(null);

  useEffect(() => {
    setLoading(true);
    Promise.all([fetchLocations(), fetchSuppliers()])
      .then(([locationsData, suppliersData]) => {
        setLocations(locationsData);
        setSuppliers(suppliersData);
      })
      .catch((error) => showNotification(error.message, 'error'))
      .finally(() => setLoading(false));
  }, []);

  const showNotification = (message, type = 'success') => {
    if (notificationTimerRef.current) clearTimeout(notificationTimerRef.current);
    setNotification({ message, type });
    notificationTimerRef.current = setTimeout(() => {
      setNotification(null);
      notificationTimerRef.current = null;
    }, 5000);
  };

  useEffect(() => {
    return () => {
      if (notificationTimerRef.current) clearTimeout(notificationTimerRef.current);
    };
  }, []);

  const resetLocationForm = () => {
    setSelectedLocation(null);
    setLocationForm(initialLocation);
  };

  const resetSupplierForm = () => {
    setSelectedSupplier(null);
    setSupplierForm(initialSupplier);
  };

  const openLocationModal = () => {
    resetLocationForm();
    setModalType('location');
    setIsModalOpen(true);
  };

  const openSupplierModal = () => {
    resetSupplierForm();
    setModalType('supplier');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    resetLocationForm();
    resetSupplierForm();
  };

  const handleLocationSave = async () => {
    if (!locationForm.code || !locationForm.name) {
      showNotification('Location code and name are required.', 'error');
      return;
    }
    setLoading(true);
    try {
      const saved = selectedLocation
        ? await updateLocation({ ...selectedLocation, ...locationForm })
        : await createLocation(locationForm);
      setLocations((prev) => {
        if (selectedLocation) return prev.map((row) => (row.id === saved.id ? saved : row));
        return [saved, ...prev];
      });
      closeModal();
      showNotification(selectedLocation ? 'Location updated successfully.' : 'Location created successfully.');
    } catch (error) {
      showNotification(error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSupplierSave = async () => {
    if (!supplierForm.code || !supplierForm.name) {
      showNotification('Supplier code and name are required.', 'error');
      return;
    }
    setLoading(true);
    try {
      const saved = selectedSupplier
        ? await updateSupplier({ ...selectedSupplier, ...supplierForm })
        : await createSupplier(supplierForm);
      setSuppliers((prev) => {
        if (selectedSupplier) return prev.map((row) => (row.id === saved.id ? saved : row));
        return [saved, ...prev];
      });
      closeModal();
      showNotification(selectedSupplier ? 'Supplier updated successfully.' : 'Supplier created successfully.');
    } catch (error) {
      showNotification(error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleLocationEdit = (location) => {
    setSelectedLocation(location);
    setLocationForm(location);
    setModalType('location');
    setIsModalOpen(true);
  };

  const handleSupplierEdit = (supplier) => {
    setSelectedSupplier(supplier);
    setSupplierForm(supplier);
    setModalType('supplier');
    setIsModalOpen(true);
  };

  const handleDeactivateLocation = async (location) => {
    setLoading(true);
    try {
      const updated = await deactivateLocation(location);
      setLocations((prev) => prev.map((row) => (row.id === updated.id ? updated : row)));
      showNotification('Location deactivated successfully.');
    } catch (error) {
      showNotification(error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const locationCount = useMemo(() => locations.length, [locations]);
  const supplierCount = useMemo(() => suppliers.length, [suppliers]);

  return (
    <>
      <div className="content-header">
        <div>
          <h1>Masters Location</h1>
          {/* <p>Manage storage locations and suppliers with dummy backend simulation.</p> */}
        </div>
      </div>

      {notification && (
        <div className={`toast-notification ${notification.type}`} role="status">
          {notification.message}
        </div>
      )}

      <div className="item-master-card">
        <div className="item-master-header">
          <div className="tabs">
            <button
              type="button"
              className={`button-secondary ${activeTab === 'locations' ? 'active-tab' : ''}`}
              onClick={() => setActiveTab('locations')}
            >
              Locations ({locationCount})
            </button>
            <button
              type="button"
              className={`button-secondary ${activeTab === 'suppliers' ? 'active-tab' : ''}`}
              onClick={() => setActiveTab('suppliers')}
            >
              Suppliers ({supplierCount})
            </button>
          </div>
        </div>

        {activeTab === 'locations' ? (
          <div className="masters-grid">
            <section className="masters-table-panel">
              <div className="masters-table-header">
                <h2>Location List</h2>
                <button type="button" className="button-primary" onClick={openLocationModal}>
                  New Location
                </button>
              </div>
              <table className="masters-table">
                <thead>
                  <tr>
                    <th>Code</th>
                    <th>Name</th>
                    <th>Type</th>
                    <th>Stock</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {locations.map((location) => (
                    <tr key={location.id}>
                      <td>{location.code}</td>
                      <td>{location.name}</td>
                      <td>{location.type}</td>
                      <td>{location.stock}</td>
                      <td>
                        <span className={`status-pill ${location.active ? 'status-active' : 'status-inactive'}`}>
                          {location.active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td>
                        <button type="button" className="button-secondary" onClick={() => handleLocationEdit(location)} disabled={!location.active}>
                          Edit
                        </button>
                        <button
                          type="button"
                          className="button-danger"
                          onClick={() => handleDeactivateLocation(location)}
                          disabled={!location.active}
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
          </div>
        ) : (
          <div className="masters-grid">
            <section className="masters-table-panel">
              <div className="masters-table-header">
                <h2>Supplier List</h2>
                <button type="button" className="button-primary" onClick={openSupplierModal}>
                  New Supplier
                </button>
              </div>
              <table className="masters-table">
                <thead>
                  <tr>
                    <th>Code</th>
                    <th>Name</th>
                    <th>Contact</th>
                    <th>Phone</th>
                    <th>Email</th>
                    <th>GSTIN</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {suppliers.map((supplier) => (
                    <tr key={supplier.id}>
                      <td>{supplier.code}</td>
                      <td>{supplier.name}</td>
                      <td>{supplier.contact}</td>
                      <td>{supplier.phone}</td>
                      <td>{supplier.email}</td>
                      <td>{supplier.gstin}</td>
                      <td>
                        <button type="button" className="button-secondary" onClick={() => handleSupplierEdit(supplier)}>
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          </div>
        )}

      {isModalOpen && (
        <div className="masters-modal-overlay" onClick={closeModal}>
          <div className="masters-modal" onClick={(e) => e.stopPropagation()}>
            <div className="masters-modal-header">
              <h3>
                {modalType === 'location'
                  ? selectedLocation
                    ? 'Edit Location'
                    : 'Add New Location'
                  : selectedSupplier
                  ? 'Edit Supplier'
                  : 'Add New Supplier'}
              </h3>
              <button type="button" className="masters-modal-close" onClick={closeModal}>
                ×
              </button>
            </div>
            <div className="masters-modal-body">
              {modalType === 'location' ? (
                <>
                  <div>
                    <label>Location Code</label>
                    <input
                      value={locationForm.code}
                      onChange={(e) => setLocationForm((prev) => ({ ...prev, code: e.target.value }))}
                      placeholder="LOC-001"
                    />
                  </div>
                  <div>
                    <label>Name</label>
                    <input
                      value={locationForm.name}
                      onChange={(e) => setLocationForm((prev) => ({ ...prev, name: e.target.value }))}
                      placeholder="Main Warehouse"
                    />
                  </div>
                  <div>
                    <label>Type</label>
                    <select value={locationForm.type} onChange={(e) => setLocationForm((prev) => ({ ...prev, type: e.target.value }))}>
                      {locationTypes.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label>Stock</label>
                    <input
                      type="number"
                      value={locationForm.stock}
                      onChange={(e) => setLocationForm((prev) => ({ ...prev, stock: Number(e.target.value) }))}
                    />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label>Supplier Code</label>
                    <input
                      value={supplierForm.code}
                      onChange={(e) => setSupplierForm((prev) => ({ ...prev, code: e.target.value }))}
                      placeholder="SUP-001"
                    />
                  </div>
                  <div>
                    <label>Name</label>
                    <input
                      value={supplierForm.name}
                      onChange={(e) => setSupplierForm((prev) => ({ ...prev, name: e.target.value }))}
                      placeholder="ABC Suppliers"
                    />
                  </div>
                  <div>
                    <label>Contact Person</label>
                    <input
                      value={supplierForm.contact}
                      onChange={(e) => setSupplierForm((prev) => ({ ...prev, contact: e.target.value }))}
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <label>Phone</label>
                    <input
                      value={supplierForm.phone}
                      onChange={(e) => setSupplierForm((prev) => ({ ...prev, phone: e.target.value }))}
                      placeholder="9999999999"
                    />
                  </div>
                  <div>
                    <label>Email</label>
                    <input
                      value={supplierForm.email}
                      onChange={(e) => setSupplierForm((prev) => ({ ...prev, email: e.target.value }))}
                      placeholder="supplier@example.com"
                    />
                  </div>
                  <div>
                    <label>GSTIN</label>
                    <input
                      value={supplierForm.gstin}
                      onChange={(e) => setSupplierForm((prev) => ({ ...prev, gstin: e.target.value }))}
                      placeholder="27AABCU9603R1Z1"
                    />
                  </div>
                </>
              )} 
            </div>
            <div className="masters-modal-actions">
              <button
                type="button"
                className="button-primary"
                onClick={modalType === 'location' ? handleLocationSave : handleSupplierSave}
                disabled={loading}
              >
                {modalType === 'location'
                  ? selectedLocation
                    ? 'Save Location'
                    : 'Add Location'
                  : selectedSupplier
                  ? 'Save Supplier'
                  : 'Add Supplier'}
              </button>
              <button type="button" className="button-secondary" onClick={closeModal}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </>
  );
}

export default MastersLocation;
