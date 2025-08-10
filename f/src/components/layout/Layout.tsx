import { Outlet } from 'react-router-dom'
import Header from './Header'
import Sidebar from './Sidebar'

interface LayoutProps {
  showSidebar?: boolean
}

const Layout = ({ showSidebar = false }: LayoutProps) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex">
        {showSidebar && <Sidebar />}
        <main className={`flex-1 ${showSidebar ? 'ml-64' : ''}`}>
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default Layout
