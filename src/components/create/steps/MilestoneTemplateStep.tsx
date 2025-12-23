'use client'

import { Button } from '@/components/ui/Button'
import { ExternalLink, Info, Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'

interface Milestone {
  title: string
  percentage: string
  deadline: string
  description: string
  proofOfWork: string
}

interface MilestoneTemplateStepProps {
  formData: any
  updateFormData: (updates: any) => void
}

export function MilestoneTemplateStep({ formData, updateFormData }: MilestoneTemplateStepProps) {
  const [milestones, setMilestones] = useState<Milestone[]>(
    formData.milestones || [
      { title: 'MVP Release', percentage: '40', deadline: '', description: '', proofOfWork: '' },
      { title: 'Beta Testing', percentage: '30', deadline: '', description: '', proofOfWork: '' },
      { title: 'Mainnet Launch', percentage: '30', deadline: '', description: '', proofOfWork: '' }
    ]
  )

  const handleAddMilestone = () => {
    const newMilestones = [...milestones, { 
      title: '', 
      percentage: '0', 
      deadline: '', 
      description: '', 
      proofOfWork: '' 
    }]
    setMilestones(newMilestones)
    updateFormData({ milestones: newMilestones })
  }

  const handleRemoveMilestone = (index: number) => {
    const newMilestones = milestones.filter((_, i) => i !== index)
    setMilestones(newMilestones)
    updateFormData({ milestones: newMilestones })
  }

  const handleChange = (index: number, field: keyof Milestone, value: string) => {
    const newMilestones = [...milestones]
    newMilestones[index] = { ...newMilestones[index], [field]: value }
    setMilestones(newMilestones)
    updateFormData({ milestones: newMilestones })
  }

  const totalPercentage = milestones.reduce((sum, m) => sum + (parseFloat(m.percentage) || 0), 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-noble-gold uppercase tracking-tight">Milestone Template</h2>
          <p className="text-noble-gold/60 text-sm">Define your project stages. Funds will be released only upon community approval.</p>
        </div>
        <div className={`px-4 py-2 rounded-xl border ${totalPercentage === 100 ? 'border-green-500/30 bg-green-500/10 text-green-400' : 'border-noble-gold/20 bg-noble-gold/5 text-noble-gold'}`}>
          <span className="text-xs font-bold uppercase mr-2 tracking-widest">Total:</span>
          <span className="text-lg font-black">{totalPercentage}%</span>
        </div>
      </div>

      <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl flex items-start space-x-3 mb-6">
        <Info className="text-blue-400 mt-1 flex-shrink-0" size={20} />
        <div className="text-sm text-blue-400/80 leading-relaxed">
          <b>Investor Security:</b> If a milestone is rejected by 51% of voters or a deadline is missed, participants can claim a refund for the remaining balance. Use realistic deadlines.
        </div>
      </div>

      <div className="space-y-4">
        {milestones.map((milestone, index) => (
          <div key={index} className="noble-card !p-6 border-noble-gold/10 hover:border-noble-gold/30 transition-all duration-300">
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-noble-gold/10 flex items-center justify-center text-noble-gold font-bold text-sm">
                  {index + 1}
                </div>
                <input
                  type="text"
                  placeholder="Milestone Title (e.g. Beta Launch)"
                  className="bg-transparent border-b border-noble-gold/20 focus:border-noble-gold outline-none text-xl font-bold text-noble-gold placeholder:text-noble-gold/20 pb-1"
                  value={milestone.title}
                  onChange={(e) => handleChange(index, 'title', e.target.value)}
                />
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleRemoveMilestone(index)}
                className="text-red-400 border-red-400/20 hover:bg-red-500/10 h-8 w-8 !p-0"
              >
                <Trash2 size={16} />
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-noble-gold/60">Release Percentage</label>
                <div className="relative">
                  <input
                    type="number"
                    placeholder="0"
                    className="w-full bg-noble-black/40 border border-noble-gold/10 rounded-xl px-4 py-3 text-noble-gold focus:outline-none focus:border-noble-gold"
                    value={milestone.percentage}
                    onChange={(e) => handleChange(index, 'percentage', e.target.value)}
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-noble-gold/40 font-bold">%</span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-noble-gold/60">Target Deadline</label>
                <input
                  type="date"
                  title="Target Deadline"
                  className="w-full bg-noble-black/40 border border-noble-gold/10 rounded-xl px-4 py-3 text-noble-gold focus:outline-none focus:border-noble-gold"
                  value={milestone.deadline}
                  onChange={(e) => handleChange(index, 'deadline', e.target.value)}
                />
              </div>

              <div className="md:col-span-2 space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-noble-gold/60">Proof of Work Reference (GitHub/Docs/Link)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-noble-gold/30">
                    <ExternalLink size={16} />
                  </span>
                  <input
                    type="text"
                    title="Proof of Work Reference"
                    placeholder="https://github.com/yourproject/repo"
                    className="w-full bg-noble-black/40 border border-noble-gold/10 rounded-xl pl-12 pr-4 py-3 text-noble-gold focus:outline-none focus:border-noble-gold"
                    value={milestone.proofOfWork}
                    onChange={(e) => handleChange(index, 'proofOfWork', e.target.value)}
                  />
                </div>
              </div>

              <div className="md:col-span-2 space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-noble-gold/60">Description & Deliverables</label>
                <textarea
                  title="Description & Deliverables"
                  placeholder="What will you deliver in this stage?"
                  className="w-full bg-noble-black/40 border border-noble-gold/10 rounded-xl px-4 py-3 text-noble-gold focus:outline-none focus:border-noble-gold min-h-[100px]"
                  value={milestone.description}
                  onChange={(e) => handleChange(index, 'description', e.target.value)}
                ></textarea>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Button
        variant="outline"
        onClick={handleAddMilestone}
        className="w-full py-4 border-dashed border-noble-gold/20 text-noble-gold/60 hover:text-noble-gold hover:border-noble-gold/40 flex items-center justify-center gap-2 rounded-xl"
      >
        <Plus size={18} />
        Add New Milestone
      </Button>

      {totalPercentage !== 100 && (
         <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3">
           <AlertTriangle className="text-red-400" size={20} />
           <span className="text-xs text-red-400 font-bold uppercase tracking-wider">
             Error: Total release percentage must equal exactly 100%. Current: {totalPercentage}%
           </span>
         </div>
      )}
    </div>
  )
}

function AlertTriangle(props: any) {
    return (
      <svg
        {...props}
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
        <path d="M12 9v4" />
        <path d="M12 17h.01" />
      </svg>
    )
}
