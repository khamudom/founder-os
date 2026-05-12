import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { RequireSession } from '@/components/RequireSession'
import { AppStateProvider } from '@/hooks/AppStateProvider'
import { AuthProvider } from '@/hooks/AuthProvider'
import { ThemeProvider } from '@/hooks/ThemeProvider'
import { DashboardPage } from '@/pages/DashboardPage'
import { EventsPage } from '@/pages/EventsPage'
import { FounderDutiesPage } from '@/pages/FounderDutiesPage'
import { InvestorsPage } from '@/pages/InvestorsPage'
import { SignInPage } from '@/pages/SignInPage'
import { WeeklyUpdatePage } from '@/pages/WeeklyUpdatePage'

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppStateProvider>
          <BrowserRouter>
          <Routes>
            <Route path="/sign-in" element={<SignInPage />} />
            <Route
              path="/"
              element={
                <RequireSession>
                  <DashboardPage />
                </RequireSession>
              }
            />
            <Route
              path="/duties"
              element={
                <RequireSession>
                  <FounderDutiesPage />
                </RequireSession>
              }
            />
            <Route
              path="/investors"
              element={
                <RequireSession>
                  <InvestorsPage />
                </RequireSession>
              }
            />
            <Route
              path="/events"
              element={
                <RequireSession>
                  <EventsPage />
                </RequireSession>
              }
            />
            <Route
              path="/weekly-update"
              element={
                <RequireSession>
                  <WeeklyUpdatePage />
                </RequireSession>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
        </AppStateProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}
