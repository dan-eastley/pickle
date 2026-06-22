import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import FullscreenToggle from './FullscreenToggle'

describe('FullscreenToggle', () => {
  it('shows "Full screen" when not full screen and calls onToggle', () => {
    const onToggle = vi.fn()
    render(<FullscreenToggle fullscreen={false} onToggle={onToggle} />)
    const btn = screen.getByRole('button', { name: /full screen/i })
    expect(btn).toBeInTheDocument()
    fireEvent.click(btn)
    expect(onToggle).toHaveBeenCalledTimes(1)
  })

  it('shows "Exit full screen" when full screen', () => {
    render(<FullscreenToggle fullscreen onToggle={() => {}} />)
    expect(screen.getByRole('button', { name: /exit full screen/i })).toBeInTheDocument()
  })
})
