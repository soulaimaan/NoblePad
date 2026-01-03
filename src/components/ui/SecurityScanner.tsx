'use client'

export function SecurityScanner() {
  return (
    <div className="security-scanner-container relative w-full max-w-[400px] mx-auto overflow-hidden rounded-lg border border-red-500/20 bg-red-500/5 h-[34px] flex items-center justify-center">
      {/* Animated Beam */}
      <div className="scanner-beam absolute top-0 left-0 w-[60px] h-full bg-gradient-to-r from-transparent via-red-500/40 to-transparent shadow-[0_0_15px_rgba(239,68,68,0.2)] z-10 animate-scan" />
      
      {/* Security Text with Flicker */}
      <span className="security-text relative z-20 text-[10px] sm:text-[11px] font-black uppercase tracking-[4px] text-red-500 opacity-80 animate-flicker">
        Infrastructure Secured
      </span>

      <style jsx>{`
        @keyframes scan {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(600%); }
        }
        @keyframes flicker {
          0%, 19%, 21%, 23%, 25%, 54%, 56%, 100% { opacity: 0.8; }
          20%, 24%, 55% { opacity: 0.3; }
        }
        .animate-scan {
          animation: scan 3s infinite ease-in-out alternate;
        }
        .animate-flicker {
          animation: flicker 2s infinite;
        }
      `}</style>
    </div>
  )
}
