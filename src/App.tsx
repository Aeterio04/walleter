import { Routes, Route } from 'react-router-dom'
import { AppProvider } from './context/AppContext'
import Landing from './pages/Landing'
import Signup from './pages/Signup'
import DashboardLayout from './layouts/DashboardLayout'
import Dashboard from './pages/Dashboard'
import Expenses from './pages/Expenses'
import Insights from './pages/Insights'
import Budget from './pages/Budget'
import Investments from './pages/Investments'
import Settings from './pages/Settings'

function App() {
  return (
    <AppProvider>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/signup" element={<Signup />} />
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/expenses" element={<Expenses />} />
          <Route path="/insights" element={<Insights />} />
          <Route path="/budget" element={<Budget />} />
          <Route path="/investments" element={<Investments />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
      </Routes>
    </AppProvider>
  )
}

export default App
