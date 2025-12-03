'use client'

import { FileText } from 'lucide-react'

interface ProjectInfoStepProps {
  formData: any
  updateFormData: (updates: any) => void
}

export function ProjectInfoStep({ formData, updateFormData }: ProjectInfoStepProps) {
  return (
    <div>
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-8 h-8 bg-noble-gold rounded-full flex items-center justify-center">
          <FileText className="text-noble-black" size={16} />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-noble-gold">Project Information</h2>
          <p className="text-noble-gold/70 text-sm">Tell us about your project</p>
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-noble-gold/70 mb-2">
            Project Name *
          </label>
          <input
            type="text"
            value={formData.projectName}
            onChange={(e) => updateFormData({ projectName: e.target.value })}
            className="noble-input w-full"
            placeholder="Enter your project name"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-noble-gold/70 mb-2">
            Project Description *
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => updateFormData({ description: e.target.value })}
            className="noble-input w-full h-32 resize-none"
            placeholder="Describe your project, its vision, and key features..."
            required
          />
          <p className="text-xs text-noble-gold/50 mt-1">
            Minimum 100 characters. Be clear and comprehensive.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-noble-gold/70 mb-2">
              Website URL *
            </label>
            <input
              type="url"
              value={formData.website}
              onChange={(e) => updateFormData({ website: e.target.value })}
              className="noble-input w-full"
              placeholder="https://yourproject.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-noble-gold/70 mb-2">
              Whitepaper URL *
            </label>
            <input
              type="url"
              value={formData.whitepaper}
              onChange={(e) => updateFormData({ whitepaper: e.target.value })}
              className="noble-input w-full"
              placeholder="https://yourproject.com/whitepaper.pdf"
              required
            />
          </div>
        </div>

        <div>
          <h3 className="text-lg font-medium text-noble-gold mb-4">Social Links</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-noble-gold/70 mb-2">
                Twitter
              </label>
              <input
                type="url"
                value={formData.twitter}
                onChange={(e) => updateFormData({ twitter: e.target.value })}
                className="noble-input w-full"
                placeholder="https://twitter.com/yourproject"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-noble-gold/70 mb-2">
                Telegram
              </label>
              <input
                type="url"
                value={formData.telegram}
                onChange={(e) => updateFormData({ telegram: e.target.value })}
                className="noble-input w-full"
                placeholder="https://t.me/yourproject"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-noble-gold/70 mb-2">
                Discord
              </label>
              <input
                type="url"
                value={formData.discord}
                onChange={(e) => updateFormData({ discord: e.target.value })}
                className="noble-input w-full"
                placeholder="https://discord.gg/yourproject"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}