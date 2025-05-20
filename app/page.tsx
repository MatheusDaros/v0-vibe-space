"use client"
import VibeSpace from "@/components/vibe-space"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-gradient-to-b from-slate-900 to-black">
      <div className="max-w-md w-full flex flex-col items-center">
        <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-600 mb-2 text-center">
          VIBE SPACE
        </h1>
        <p className="text-blue-300 mb-6 text-center">Pilot your ship, conquer cosmic dangers, and become a legend of the Vibe Space!</p>

        <VibeSpace />

        <div className="mt-4 text-gray-300 text-center bg-slate-800/50 p-2 rounded-md border border-slate-700 max-w-xs w-full">
          <h3 className="text-white font-bold mb-1 text-base">CONTROLS</h3>
          <div className="grid grid-cols-2 gap-1">
            <div className="flex items-center justify-center bg-slate-700/50 px-1 py-0.5 rounded text-xs min-h-6">
              <span className="font-bold text-white text-xs">← →</span>
              <span className="ml-1 text-xs">Move Ship</span>
            </div>
            <div className="flex items-center justify-center bg-slate-700/50 px-1 py-0.5 rounded text-xs min-h-6">
              <span className="font-bold text-white text-xs">SPACE</span>
              <span className="ml-1 text-xs">Fire Weapons</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
