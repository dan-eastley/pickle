import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import RequireAuth from './RequireAuth'

// useAuth is the only external the gate depends on.
const auth = vi.hoisted(() => ({ state: { user: null, isLoading: false } }))
vi.mock('../../context/AuthContext', () => ({ useAuth: () => auth.state }))

function renderGated(initialPath = '/secret') {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route
          path="/secret"
          element={
            <RequireAuth>
              <div>secret content</div>
            </RequireAuth>
          }
        />
        <Route path="/login" element={<div>login page</div>} />
      </Routes>
    </MemoryRouter>
  )
}

beforeEach(() => {
  auth.state = { user: null, isLoading: false }
})

describe('RequireAuth (client gate — always enforced)', () => {
  it('renders the protected content for an authenticated user', () => {
    auth.state = { user: { id: 'u1' }, isLoading: false }
    renderGated()
    expect(screen.getByText('secret content')).toBeInTheDocument()
  })

  it('redirects an unauthenticated visitor to /login', () => {
    auth.state = { user: null, isLoading: false }
    renderGated()
    expect(screen.queryByText('secret content')).not.toBeInTheDocument()
    expect(screen.getByText('login page')).toBeInTheDocument()
  })

  it('shows a loading state (not the content, not a redirect) while auth resolves', () => {
    auth.state = { user: null, isLoading: true }
    renderGated()
    expect(screen.queryByText('secret content')).not.toBeInTheDocument()
    expect(screen.queryByText('login page')).not.toBeInTheDocument()
  })
})
