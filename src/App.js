import logo from './logo.svg';
import './App.css';
import { HashRouter, Routes, Route } from 'react-router-dom';
import Dashboard from './Components/Dashboard';
import PageNotFound from './Components/PageNotFound';
import Login from './Login/Login';
import BaseLayout from './Layouts/BaseLayout';
import ItemMaster from './Components/ItemMaster';
import MastersLocation from './Components/MastersLocation';
import NewTransaction from './Components/NewTransaction';
import StockLedger from './Components/StockLedger';
import Reports from './Components/Reports';

function App() { 
  return (
    <div className="App">
      <HashRouter>
      <Routes>
        <Route path='/' element={<Login />} />
        <Route path='/' element={<BaseLayout />}>
          <Route path='dashboard' element={<Dashboard />} />
          <Route path='itemmaster' element={<ItemMaster />} />
          <Route path='masterslocation' element={<MastersLocation />} />
          <Route path='transaction' element={<NewTransaction />} />
          <Route path='stockledger' element={<StockLedger />} />
          <Route path='report' element={<Reports />} />
        </Route>
        <Route path='*' element={<PageNotFound />} />
      </Routes>
      </HashRouter>
    </div>
  );
}

export default App;
