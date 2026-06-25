import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import ActionBar from './ActionBar'

describe('ActionBar', () => {
  it('renders the title and strapline', () => {
    render(<ActionBar title="Architecture Decisions" strapline="fedc · v1.0.0" />)
    expect(screen.getByRole('heading', { name: 'Architecture Decisions' })).toBeInTheDocument()
    expect(screen.getByText('fedc · v1.0.0')).toBeInTheDocument()
  })

  it('orders actions Tertiary → Secondary → Primary regardless of prop order', () => {
    render(
      <ActionBar
        primary={<button>Primary</button>}
        secondary={<button>Secondary</button>}
        tertiary={<button>Tertiary</button>}
      />
    )
    const order = screen.getAllByRole('button').map((b) => b.textContent)
    expect(order).toEqual(['Tertiary', 'Secondary', 'Primary'])
  })

  it('omits the strapline margin/element when no title is given', () => {
    render(<ActionBar strapline="standalone help" />)
    expect(screen.getByText('standalone help')).toBeInTheDocument()
    expect(screen.queryByRole('heading')).not.toBeInTheDocument()
  })
})
