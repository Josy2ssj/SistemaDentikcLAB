import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './store/AppContext';
import Shell from './components/Shell';
import Home from './screens/Home';
import Orders from './screens/Orders';
import Schedule from './screens/Schedule';
import Inventory from './screens/Inventory';
import Capture3D from './screens/Capture3D';

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Shell>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/schedule" element={<Schedule />} />
            <Route path="/inventory" element={<Inventory />} />
            <Route path="/capture" element={<Capture3D />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Shell>
      </BrowserRouter>
    </AppProvider>
  );
}
