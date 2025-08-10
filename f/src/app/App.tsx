import { BrowserRouter } from 'react-router-dom'
import AppProvider from './AppProvider'
import AppRouter from './AppRouter'

const App = () => {
  return (
    <AppProvider>
      <BrowserRouter>
        <AppRouter />
      </BrowserRouter>
    </AppProvider>
  )
}

export default App
