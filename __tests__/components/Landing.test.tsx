import { render, screen, fireEvent } from '@testing-library/react'
import Landing from '@/components/Landing'

describe('Landing', () => {
  it('renders with the default URL in the input', () => {
    render(<Landing defaultUrl="https://hunter.io" onSubmit={jest.fn()} />)
    expect(screen.getByDisplayValue('https://hunter.io')).toBeInTheDocument()
  })

  it('shows the headline', () => {
    render(<Landing defaultUrl="https://hunter.io" onSubmit={jest.fn()} />)
    expect(screen.getByText(/real performance metrics/i)).toBeInTheDocument()
  })

  it('calls onSubmit with trimmed URL when form is submitted', () => {
    const onSubmit = jest.fn()
    render(<Landing defaultUrl="https://hunter.io" onSubmit={onSubmit} />)
    const input = screen.getByDisplayValue('https://hunter.io')
    fireEvent.change(input, { target: { value: '  https://example.com  ' } })
    fireEvent.submit(input.closest('form')!)
    expect(onSubmit).toHaveBeenCalledWith('https://example.com')
  })

  it('does not call onSubmit when URL is empty', () => {
    const onSubmit = jest.fn()
    render(<Landing defaultUrl="" onSubmit={onSubmit} />)
    fireEvent.submit(document.querySelector('form')!)
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('calls onSubmit when Analyze button is clicked', () => {
    const onSubmit = jest.fn()
    render(<Landing defaultUrl="https://hunter.io" onSubmit={onSubmit} />)
    fireEvent.click(screen.getByRole('button', { name: /analyze/i }))
    expect(onSubmit).toHaveBeenCalledWith('https://hunter.io')
  })

  it('shows CWV budget thresholds', () => {
    render(<Landing defaultUrl="https://hunter.io" onSubmit={jest.fn()} />)
    expect(screen.getByText('LCP')).toBeInTheDocument()
    expect(screen.getByText('CLS')).toBeInTheDocument()
    expect(screen.getByText('INP')).toBeInTheDocument()
  })
})
