import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { CreatePresaleForm } from './CreatePresaleForm'

// Mocking dependencies
jest.mock('@/hooks/useCompatibleAccount', () => ({
  useAccount: () => ({
    address: '0x1234567890123456789012345678901234567890',
    isConnected: true,
  }),
}))

jest.mock('wagmi', () => ({
  ...jest.requireActual('wagmi'),
  useWriteContract: () => ({
    writeContract: jest.fn(),
    isPending: false,
  }),
  useWaitForTransactionReceipt: () => ({
    isLoading: false,
    isSuccess: true,
  }),
}))

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}))

// Mock the child step components to isolate the form logic
jest.mock('./steps/ProjectInfoStep', () => ({
  ProjectInfoStep: ({ onDataChange }: { onDataChange: (data: any) => void }) => (
    <div>
      <label htmlFor="projectName">Project Name</label>
      <input
        id="projectName"
        onChange={(e) => onDataChange({ projectName: e.target.value })}
      />
    </div>
  ),
}))

jest.mock('./steps/TokenDetailsStep', () => ({
  TokenDetailsStep: ({ onDataChange }: { onDataChange: (data: any) => void }) => (
    <div>
      <label htmlFor="tokenAddress">Token Address</label>
      <input
        id="tokenAddress"
        onChange={(e) => onDataChange({ tokenAddress: e.target.value })}
      />
    </div>
  ),
}))

jest.mock('./steps/PresaleSetupStep', () => ({
  PresaleSetupStep: ({ onDataChange }: { onDataChange: (data: any) => void }) => (
    <div>
      <label htmlFor="hardCap">Hard Cap</label>
      <input
        id="hardCap"
        onChange={(e) => onDataChange({ hardCap: e.target.value })}
      />
    </div>
  ),
}))

jest.mock('./steps/SecurityReviewStep', () => ({
  SecurityReviewStep: ({ onDataChange }: { onDataChange: (data: any) => void }) => (
    <div>
      <label htmlFor="auditLink">Audit Link</label>
      <input
        id="auditLink"
        onChange={(e) => onDataChange({ auditLink: e.target.value })}
      />
    </div>
  ),
}))

describe('CreatePresaleForm Stability Test', () => {
  const mockOnStepChange = jest.fn()

  beforeEach(() => {
    // Reset mocks before each test
    mockOnStepChange.mockClear()
  })

  it('should render the first step initially', () => {
    render(<CreatePresaleForm currentStep={1} onStepChange={mockOnStepChange} />)
    expect(screen.getByLabelText('Project Name')).toBeInTheDocument()
    expect(screen.queryByLabelText('Token Address')).not.toBeInTheDocument()
  })

  it('should allow progressing through all steps', () => {
    const { rerender } = render(
      <CreatePresaleForm currentStep={1} onStepChange={mockOnStepChange} />
    )

    // Step 1: Project Info
    fireEvent.change(screen.getByLabelText('Project Name'), {
      target: { value: 'Test Project' },
    })
    fireEvent.click(screen.getByText('Next Step'))
    expect(mockOnStepChange).toHaveBeenCalledWith(2)

    // Rerender as step 2
    rerender(<CreatePresaleForm currentStep={2} onStepChange={mockOnStepChange} />)
    expect(screen.getByLabelText('Token Address')).toBeInTheDocument()

    // Step 2: Token Details
    fireEvent.change(screen.getByLabelText('Token Address'), {
      target: { value: '0xTokenAddress' },
    })
    fireEvent.click(screen.getByText('Next Step'))
    expect(mockOnStepChange).toHaveBeenCalledWith(3)

    // Rerender as step 3
    rerender(<CreatePresaleForm currentStep={3} onStepChange={mockOnStepChange} />)
    expect(screen.getByLabelText('Hard Cap')).toBeInTheDocument()

    // Step 3: Presale Setup
    fireEvent.change(screen.getByLabelText('Hard Cap'), {
      target: { value: '100' },
    })
    fireEvent.click(screen.getByText('Next Step'))
    expect(mockOnStepChange).toHaveBeenCalledWith(4)
    
    // Rerender as step 4
    rerender(<CreatePresaleForm currentStep={4} onStepChange={mockOnStepChange} />)
    expect(screen.getByLabelText('Audit Link')).toBeInTheDocument()

    // Step 4: Security
    fireEvent.change(screen.getByLabelText('Audit Link'), {
        target: { value: 'http://audit.link' },
    })
    fireEvent.click(screen.getByText('Next Step'))
    expect(mockOnStepChange).toHaveBeenCalledWith(5)

    // Rerender as step 5 (Review)
    rerender(<CreatePresaleForm currentStep={5} onStepChange={mockOnStepChange} />)
    expect(screen.getByText('Review Your Presale Details')).toBeInTheDocument()
    
    // Check if the submit button is there
    expect(screen.getByText('Submit Presale for Review')).toBeInTheDocument()
  })

  it('should allow going back to previous steps', () => {
    render(<CreatePresaleForm currentStep={2} onStepChange={mockOnStepChange} />)

    fireEvent.click(screen.getByText('Previous Step'))
    expect(mockOnStepChange).toHaveBeenCalledWith(1)
  })

  // This is a more complex integration-style test for the final submission
  it('should collect all data and show it on the review step', async () => {
    let currentStep = 1
    const setCurrentStep = (step: number) => {
      currentStep = step
      rerender(
        <CreatePresaleForm
          currentStep={currentStep}
          onStepChange={setCurrentStep}
        />
      )
    }

    const { rerender } = render(
      <CreatePresaleForm
        currentStep={currentStep}
        onStepChange={setCurrentStep}
      />
    )

    // Fill Step 1
    fireEvent.change(screen.getByLabelText('Project Name'), { target: { value: 'Final Project' } })
    fireEvent.click(screen.getByText('Next Step'))

    // Fill Step 2
    await waitFor(() => expect(screen.getByLabelText('Token Address')).toBeInTheDocument())
    fireEvent.change(screen.getByLabelText('Token Address'), { target: { value: '0xFinalToken' } })
    fireEvent.click(screen.getByText('Next Step'))

    // Fill Step 3
    await waitFor(() => expect(screen.getByLabelText('Hard Cap')).toBeInTheDocument())
    fireEvent.change(screen.getByLabelText('Hard Cap'), { target: { value: '500' } })
    fireEvent.click(screen.getByText('Next Step'))

    // Fill Step 4
    await waitFor(() => expect(screen.getByLabelText('Audit Link')).toBeInTheDocument())
    fireEvent.change(screen.getByLabelText('Audit Link'), { target: { value: 'http://final-audit.com' } })
    fireEvent.click(screen.getByText('Next Step'))
    
    // Arrive at Step 5 (Review)
    await waitFor(() => {
      expect(screen.getByText('Review Your Presale Details')).toBeInTheDocument()
    })

    // Check if data from all steps is displayed
    expect(screen.getByText('Final Project')).toBeInTheDocument()
    expect(screen.getByText('0xFinalToken')).toBeInTheDocument()
    expect(screen.getByText('500')).toBeInTheDocument()
    expect(screen.getByText('http://final-audit.com')).toBeInTheDocument()
  })
})
