'use client'

import { CheckCircle, Coins, FileText, Shield, Timer } from 'lucide-react'

interface CreatePresaleStepsProps {
  currentStep: number
}

export function CreatePresaleSteps({ currentStep }: CreatePresaleStepsProps) {
  const steps = [
    {
      number: 1,
      title: 'Project Info',
      description: 'Basic project details',
      icon: FileText,
    },
    {
      number: 2,
      title: 'Token Details',
      description: 'Token specifications',
      icon: Coins,
    },
    {
      number: 3,
      title: 'Presale Setup',
      description: 'Sale parameters',
      icon: Timer,
    },
    {
      number: 4,
      title: 'Milestones',
      description: 'Fund release plan',
      icon: Timer,
    },
    {
      number: 5,
      title: 'Security & Review',
      description: 'KYC and audit info',
      icon: Shield,
    },
  ]

  return (
    <div className="noble-card">
      <h3 className="text-lg font-semibold text-noble-gold mb-6">Creation Steps</h3>
      
      <div className="space-y-4">
        {steps.map((step) => {
          const isCompleted = currentStep > step.number
          const isCurrent = currentStep === step.number
          const IconComponent = step.icon
          
          return (
            <div key={step.number} className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                {isCompleted ? (
                  <div className="w-8 h-8 bg-noble-gold rounded-full flex items-center justify-center">
                    <CheckCircle className="text-noble-black" size={16} />
                  </div>
                ) : (
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    isCurrent 
                      ? 'bg-noble-gold/20 border-2 border-noble-gold' 
                      : 'bg-noble-gray border border-noble-gold/30'
                  }`}>
                    <IconComponent 
                      className={isCurrent ? 'text-noble-gold' : 'text-noble-gold/50'} 
                      size={16} 
                    />
                  </div>
                )}
              </div>
              
              <div className="flex-1">
                <h4 className={`font-medium ${
                  isCompleted || isCurrent ? 'text-noble-gold' : 'text-noble-gold/50'
                }`}>
                  {step.title}
                </h4>
                <p className={`text-sm ${
                  isCompleted || isCurrent ? 'text-noble-gold/70' : 'text-noble-gold/40'
                }`}>
                  {step.description}
                </p>
              </div>
            </div>
          )
        })}
      </div>
      
      <div className="mt-6 pt-6 border-t border-noble-gold/20">
        <p className="text-xs text-noble-gold/60">
          All submissions are reviewed by our security team. 
          Approval typically takes 24-48 hours.
        </p>
      </div>
    </div>
  )
}