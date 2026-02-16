import { Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from './components/layout/AppLayout'
import { LoginPage } from './pages/LoginPage'
import { CallbackPage } from './pages/CallbackPage'
import { EventListPage } from './pages/EventListPage'

export function AppRouter() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/callback" element={<CallbackPage />} />
      <Route element={<AppLayout />}>
        <Route path="/events" element={<EventListPage />} />
        <Route path="/" element={<Navigate to="/events" replace />} />
      </Route>
      <Route path="*" element={<Navigate to="/events" replace />} />
    </Routes>
  )
}
