// src/components/layout/Layout.tsx
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
        <main className={`flex-1 transition-all duration-300 ${
          showSidebar ? 'md:ml-64 ml-0' : ''
        }`}>
          <div className={showSidebar ? 'pt-0 md:pt-0' : ''}>
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}

export default Layout