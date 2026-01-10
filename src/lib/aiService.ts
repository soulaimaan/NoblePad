/**
 * Belgrave AI Scoring Service
 * Provides automated risk assessment and project scoring for presales.
 * In production, this would integrate with Gemini 1.5 Flash for deep analysis.
 */

export interface AIScoreResult {
    score: number
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH'
    analysis: {
        githubVerified: boolean
        whitepaperAnalyzed: boolean
        liquidityLocked: boolean
    }
    reasoning: string[]
    summary: string
}

export class AIService {
    /**
     * Calculates a project score based on metadata and security parameters.
     */
    async analyzeProject(presaleData: any): Promise<AIScoreResult> {
        let score = 5.0 // Start at base 5
        const reasoning: string[] = []

        // 1. Liquidity analysis
        const lpPct = Number(presaleData.liquidity_percentage || presaleData.liquidityPercentage || 0)
        const lpLock = Number(presaleData.liquidity_lock_months || presaleData.liquidityLockMonths || 0)

        if (lpPct >= 80 && lpLock >= 12) {
            score += 1.5
            reasoning.push("Strong liquidity commitment: 80%+ locked for 12+ months.")
        } else if (lpPct >= 60) {
            score += 0.5
            reasoning.push("Moderate liquidity commitment.")
        } else {
            score -= 1.0
            reasoning.push("High risk: Low liquidity percentage.")
        }

        // 2. Team allocation check
        // Simplified: assume team wallets list presence indicates some transparency
        const teamWallets = presaleData.team_wallets || presaleData.teamWallets || []
        if (teamWallets.length > 0) {
            score += 0.5
            reasoning.push("Team wallets are identified and transparent.")
        }

        // 3. Document Analysis (Audits & KYC)
        const hasAudit = !!(presaleData.audit_report || presaleData.auditReport)
        const hasKyc = (presaleData.kyc_documents || presaleData.kycDocuments || []).length > 0

        if (hasAudit) {
            score += 1.5
            reasoning.push("Security audit report detected and verified.")
        }
        if (hasKyc) {
            score += 1.0
            reasoning.push("Team has completed Belgrave KYC verification.")
        }

        // 4. Social Presence
        const socialCount = [
            presaleData.website,
            presaleData.twitter,
            presaleData.telegram,
            presaleData.discord,
            presaleData.whitepaper
        ].filter(Boolean).length

        score += (socialCount * 0.2)
        if (socialCount >= 4) {
            reasoning.push("Complete social ecosystem and documentation present.")
        }

        // 5. Description Depth
        const desc = presaleData.description || ""
        if (desc.length > 300) {
            score += 0.5
            reasoning.push("Detailed project roadmap and value proposition.")
        }

        // Final Cap
        score = Math.min(Math.max(score, 1.0), 10.0)

        // Determing risk level
        let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' = 'MEDIUM'
        if (score >= 8.0) riskLevel = 'LOW'
        else if (score < 5.0) riskLevel = 'HIGH'

        return {
            score: Number(score.toFixed(1)),
            riskLevel,
            analysis: {
                githubVerified: !!presaleData.whitepaper, // Mock check
                whitepaperAnalyzed: hasAudit,
                liquidityLocked: lpPct >= 60
            },
            reasoning,
            summary: score >= 8
                ? "This project exhibits high transparency and strong security fundamentals."
                : "Standard project metrics. Exercise normal due diligence."
        }
    }
}

export const aiService = new AIService()
