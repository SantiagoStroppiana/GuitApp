import { useState, useEffect } from 'react'
import '../styles/ExpensesAnalysis.css'

const ExpensesAnalysis = ({ transactions, accounts }) => {
  const [salaryInfo, setSalaryInfo] = useState({
    monthlySalary: localStorage.getItem('monthlySalary') || '',
    isSet: localStorage.getItem('monthlySalary') !== null
  })
  const [monthlyData, setMonthlyData] = useState(null)

  useEffect(() => {
    loadMonthlyData()
  }, [transactions])

  const loadMonthlyData = async () => {
    if (window.electronAPI) {
      const currentMonth = new Date().getMonth() + 1
      const currentYear = new Date().getFullYear()
      const data = await window.electronAPI.getMonthlyBalance(currentMonth, currentYear)
      setMonthlyData(data)
    }
  }

  const handleSalaryUpdate = (e) => {
    e.preventDefault()
    localStorage.setItem('monthlySalary', salaryInfo.monthlySalary)
    setSalaryInfo({...salaryInfo, isSet: true})
  }

  const getFixedExpenses = () => {
    if (!monthlyData?.byCategory) return []
    const fixedCategories = ['servicios', 'alquiler', 'seguros', 'suscripciones']
    return monthlyData.byCategory.filter(item => 
      item.type === 'expense' && fixedCategories.includes(item.category)
    )
  }

  const getVariableExpenses = () => {
    if (!monthlyData?.byCategory) return []
    const variableCategories = ['alimentacion', 'transporte', 'entretenimiento', 'compras', 'otros']
    return monthlyData.byCategory.filter(item => 
      item.type === 'expense' && variableCategories.includes(item.category)
    )
  }

  const calculatePercentages = () => {
    if (!salaryInfo.monthlySalary || !monthlyData) return null
    
    const salary = parseFloat(salaryInfo.monthlySalary)
    const fixedTotal = getFixedExpenses().reduce((sum, exp) => sum + exp.total, 0)
    const variableTotal = getVariableExpenses().reduce((sum, exp) => sum + exp.total, 0)
    const totalExpenses = monthlyData.expenses
    
    return {
      salary,
      fixedTotal,
      variableTotal,
      totalExpenses,
      fixedPercentage: (fixedTotal / salary) * 100,
      variablePercentage: (variableTotal / salary) * 100,
      totalPercentage: (totalExpenses / salary) * 100,
      remaining: salary - totalExpenses,
      remainingPercentage: ((salary - totalExpenses) / salary) * 100
    }
  }

  const percentages = calculatePercentages()

  return (
    <div className="expenses-analysis">
      <div className="analysis-header">
        <h2>Análisis de Gastos</h2>
        <div className="current-month">
          {new Date().toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
        </div>
      </div>

      <div className="salary-section">
        <div className="salary-card">
          <h3>💰 Configuración de Sueldo</h3>
          {!salaryInfo.isSet ? (
            <form onSubmit={handleSalaryUpdate} className="salary-form">
              <div className="form-group">
                <label>Ingresa tu sueldo mensual para obtener análisis personalizados:</label>
                <div className="salary-input-group">
                  <input
                    type="number"
                    step="0.01"
                    className="form-control"
                    placeholder="Ej: 50000"
                    value={salaryInfo.monthlySalary}
                    onChange={(e) => setSalaryInfo({...salaryInfo, monthlySalary: e.target.value})}
                    required
                  />
                  <button type="submit" className="btn btn-primary">Guardar</button>
                </div>
              </div>
            </form>
          ) : (
            <div className="salary-display">
              <div className="salary-amount">
                Sueldo mensual: <strong>${parseFloat(salaryInfo.monthlySalary).toFixed(2)}</strong>
              </div>
              <button 
                className="btn btn-secondary btn-small"
                onClick={() => setSalaryInfo({monthlySalary: '', isSet: false})}
              >
                Modificar
              </button>
            </div>
          )}
        </div>

        {percentages && (
          <div className="salary-analysis">
            <div className="analysis-grid">
              <div className="analysis-card remaining">
                <h4>💵 Disponible</h4>
                <div className="analysis-amount">${percentages.remaining.toFixed(2)}</div>
                <div className="analysis-percentage">{percentages.remainingPercentage.toFixed(1)}%</div>
              </div>
              <div className="analysis-card total-spent">
                <h4>📊 Total Gastado</h4>
                <div className="analysis-amount">${percentages.totalExpenses.toFixed(2)}</div>
                <div className="analysis-percentage">{percentages.totalPercentage.toFixed(1)}%</div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="expenses-breakdown">
        <div className="expenses-section">
          <div className="section-header">
            <h3>🔒 Gastos Fijos</h3>
            <span className="section-subtitle">Gastos recurrentes y necesarios</span>
          </div>
          
          <div className="expenses-list">
            {getFixedExpenses().length === 0 ? (
              <div className="no-expenses">
                <p>No hay gastos fijos registrados este mes</p>
              </div>
            ) : (
              getFixedExpenses().map((expense, index) => (
                <div key={index} className="expense-item fixed">
                  <div className="expense-info">
                    <span className="expense-category">{expense.category}</span>
                    {percentages && (
                      <span className="expense-percentage">
                        {((expense.total / percentages.salary) * 100).toFixed(1)}% del sueldo
                      </span>
                    )}
                  </div>
                  <div className="expense-amount">${expense.total.toFixed(2)}</div>
                </div>
              ))
            )}
            
            {getFixedExpenses().length > 0 && (
              <div className="expenses-total fixed">
                <strong>
                  Total Fijos: ${getFixedExpenses().reduce((sum, exp) => sum + exp.total, 0).toFixed(2)}
                  {percentages && (
                    <span> ({percentages.fixedPercentage.toFixed(1)}%)</span>
                  )}
                </strong>
              </div>
            )}
          </div>
        </div>

        <div className="expenses-section">
          <div className="section-header">
            <h3>📈 Gastos Variables</h3>
            <span className="section-subtitle">Gastos opcionales y ajustables</span>
          </div>
          
          <div className="expenses-list">
            {getVariableExpenses().length === 0 ? (
              <div className="no-expenses">
                <p>No hay gastos variables registrados este mes</p>
              </div>
            ) : (
              getVariableExpenses().map((expense, index) => (
                <div key={index} className="expense-item variable">
                  <div className="expense-info">
                    <span className="expense-category">{expense.category}</span>
                    {percentages && (
                      <span className="expense-percentage">
                        {((expense.total / percentages.salary) * 100).toFixed(1)}% del sueldo
                      </span>
                    )}
                  </div>
                  <div className="expense-amount">${expense.total.toFixed(2)}</div>
                </div>
              ))
            )}
            
            {getVariableExpenses().length > 0 && (
              <div className="expenses-total variable">
                <strong>
                  Total Variables: ${getVariableExpenses().reduce((sum, exp) => sum + exp.total, 0).toFixed(2)}
                  {percentages && (
                    <span> ({percentages.variablePercentage.toFixed(1)}%)</span>
                  )}
                </strong>
              </div>
            )}
          </div>
        </div>
      </div>

      {percentages && (
        <div className="recommendations">
          <h3>💡 Recomendaciones</h3>
          <div className="recommendations-list">
            {percentages.totalPercentage > 90 && (
              <div className="recommendation warning">
                ⚠️ Estás gastando más del 90% de tu sueldo. Considera reducir gastos variables.
              </div>
            )}
            {percentages.fixedPercentage > 50 && (
              <div className="recommendation info">
                ℹ️ Tus gastos fijos representan más del 50% de tu sueldo. Evalúa si puedes optimizar algunos servicios.
              </div>
            )}
            {percentages.remainingPercentage > 20 && (
              <div className="recommendation success">
                ✅ ¡Excelente! Tienes más del 20% de tu sueldo disponible. Considera ahorrar o invertir.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default ExpensesAnalysis