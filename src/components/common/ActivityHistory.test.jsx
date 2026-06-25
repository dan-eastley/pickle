import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import ActivityHistory from './ActivityHistory'

describe('ActivityHistory', () => {
  it('renders nothing when there is no activity', () => {
    const { container } = render(<ActivityHistory activity={[]} />)
    expect(container).toBeEmptyDOMElement()
  })

  it('renders an entry per activity item with its action and author', () => {
    render(<ActivityHistory activity={[
      { timestamp: '2026-01-15T09:30:00Z', action: 'Created', who: 'Joe B' },
      { timestamp: '2026-03-04T14:10:00Z', action: 'Updated', who: 'Jane Doe' },
    ]} />)
    expect(screen.getByText('Created')).toBeInTheDocument()
    expect(screen.getByText('Updated')).toBeInTheDocument()
    expect(screen.getByText('Joe B')).toBeInTheDocument()
    expect(screen.getByText('Jane Doe')).toBeInTheDocument()
  })

  it('orders entries most-recent first', () => {
    render(<ActivityHistory activity={[
      { timestamp: '2026-01-15T09:30:00Z', action: 'Created', who: 'A' },
      { timestamp: '2026-03-04T14:10:00Z', action: 'Updated', who: 'B' },
    ]} />)
    const actions = screen.getAllByText(/Created|Updated/).map(el => el.textContent)
    expect(actions[0]).toBe('Updated') // newer first
  })
})
