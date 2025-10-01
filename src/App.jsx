import { useState, useEffect } from 'react'
import MainDashboard from './components/MainDashboard'
import AccountsView from './components/AccountsView'
import ExpensesAnalysis from './components/ExpensesAnalysis'
import './styles/base.css'
import './App.css'

function App() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [accounts, setAccounts] = useState([])
  const [transactions, setTransactions] = useState([])

  useEffect(() => {
    loadAccounts()
    loadTransactions()
  }, [])

  const loadAccounts = async () => {
    if (window.electronAPI) {
      const accountsData = await window.electronAPI.getAccounts()
      setAccounts(accountsData)
    }
  }

  const loadTransactions = async () => {
    if (window.electronAPI) {
      const transactionsData = await window.electronAPI.getTransactions()
      setTransactions(transactionsData)
    }
  }

  const refreshData = () => {
    loadAccounts()
    loadTransactions()
  }

  return (
    <div className="app">
      <nav className="nav">
        <h1>Gestor de Finanzas</h1>
        <div className="nav-buttons">
          <button 
            className={`nav-button ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            🏠 Dashboard
          </button>
          <button 
            className={`nav-button ${activeTab === 'accounts' ? 'active' : ''}`}
            onClick={() => setActiveTab('accounts')}
          >
            🏦 Cuentas
          </button>
          <button 
            className={`nav-button ${activeTab === 'expenses' ? 'active' : ''}`}
            onClick={() => setActiveTab('expenses')}
          >
            📊 Análisis de Gastos
          </button>
        </div>
      </nav>

      <main className="main">
        {activeTab === 'dashboard' && (
          <MainDashboard 
            accounts={accounts} 
            transactions={transactions} 
            onDataChange={refreshData}
          />
        )}
        {activeTab === 'accounts' && (
          <AccountsView 
            accounts={accounts} 
            transactions={transactions}
            onAccountCreated={refreshData} 
          />
        )}
        {activeTab === 'expenses' && (
          <ExpensesAnalysis 
            transactions={transactions}
            accounts={accounts}
          />
        )}
      </main>
    </div>
  )
}

export default App
