"use client"
import VibeSpace from "@/components/vibe-space"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-gradient-to-b from-slate-900 to-black">
      <div className="max-w-md w-full flex flex-col items-center">
        <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-600 mb-2 text-center">
          VIBE SPACE
        </h1>
        <p className="text-blue-300 mb-6 text-center">Defend the galaxy from cosmic threats</p>

        <VibeSpace />

        <div className="mt-6 text-gray-300 text-center bg-slate-800/50 p-4 rounded-lg border border-slate-700 w-full">
          <h3 className="text-white font-bold mb-2">CONTROLS</h3>
          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center justify-center bg-slate-700/50 p-2 rounded">
              <span className="font-bold text-white">← →</span>
              <span className="ml-2">Move Ship</span>
            </div>
            <div className="flex items-center justify-center bg-slate-700/50 p-2 rounded">
              <span className="font-bold text-white">SPACE</span>
              <span className="ml-2">Fire Weapons</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
