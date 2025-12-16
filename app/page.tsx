'use client'

import { useState } from 'react'

interface ProcessedCV {
  name: string
  status: 'processing' | 'success' | 'error'
  downloadUrl?: string
  error?: string
}

export default function Home() {
  const [files, setFiles] = useState<File[]>([])
  const [processing, setProcessing] = useState(false)
  const [processedCVs, setProcessedCVs] = useState<ProcessedCV[]>([])
  const [language, setLanguage] = useState<'pl' | 'en' | null>(null)
  const [aiEnhance, setAiEnhance] = useState(false)
  const [blindCV, setBlindCV] = useState(false)
  const [championProfile, setChampionProfile] = useState<File | null>(null)
  const [showChampionModal, setShowChampionModal] = useState(false)
  const [skipChampion, setSkipChampion] = useState(false)
  const [dragActive, setDragActive] = useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files)
      setFiles(prev => [...prev, ...newFiles])
      if (newFiles.length > 0 && !skipChampion) {
        setShowChampionModal(true)
      }
    }
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDragActive(false)
    if (e.dataTransfer.files) {
      const newFiles = Array.from(e.dataTransfer.files)
      setFiles(prev => [...prev, ...newFiles])
      if (newFiles.length > 0 && !skipChampion) {
        setShowChampionModal(true)
      }
    }
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDragActive(true)
  }

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDragActive(false)
  }

  const removeFile = (index: number) => {
    setFiles(prev => {
      const newFiles = prev.filter((_, i) => i !== index)
      if (newFiles.length === 0) {
        setLanguage(null)
      }
      return newFiles
    })
  }

  const processCV = async (file: File): Promise<ProcessedCV> => {
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('language', language || 'pl')
      formData.append('aiEnhance', aiEnhance.toString())
      formData.append('blindCV', blindCV.toString())
      if (championProfile) {
        formData.append('championProfile', championProfile)
      }

      const response = await fetch('/api/generate', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const error = await response.text()
        throw new Error(error)
      }

      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      
      return {
        name: file.name,
        status: 'success',
        downloadUrl: url,
      }
    } catch (error) {
      return {
        name: file.name,
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  const handleGenerate = async () => {
    if (files.length === 0 || !language) return

    setProcessing(true)
    setProcessedCVs([])
    setProcessedCVs(files.map(f => ({ name: f.name, status: 'processing' as const })))

    for (let i = 0; i < files.length; i++) {
      const result = await processCV(files[i])
      setProcessedCVs(prev => {
        const updated = [...prev]
        updated[i] = result
        return updated
      })
    }

    setProcessing(false)
  }

  const downloadAll = () => {
    processedCVs.forEach(cv => {
      if (cv.downloadUrl) {
        const link = document.createElement('a')
        link.href = cv.downloadUrl
        link.download = `B2B_${cv.name.replace(/\.[^/.]+$/, '')}.docx`
        link.click()
      }
    })
  }

  const clearAll = () => {
    setFiles([])
    setProcessedCVs([])
    setLanguage(null)
    setChampionProfile(null)
    setAiEnhance(false)
    setBlindCV(false)
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-red-600/10 via-transparent to-transparent rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-red-600/10 via-transparent to-transparent rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-white/10 backdrop-blur-xl bg-black/20">
        <div className="max-w-6xl mx-auto px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-700 rounded-xl flex items-center justify-center text-white font-black text-lg shadow-lg shadow-red-500/25">
                  B2B
                </div>
                <div className="absolute -inset-1 bg-gradient-to-br from-red-500 to-red-700 rounded-xl blur opacity-30" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">
                  CV Generator
                </h1>
                <p className="text-xs text-white/40">B2B Network Professional Template</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs text-white/40">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span>AI Powered</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-6xl mx-auto px-6 py-12">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Column - Upload & Settings */}
          <div className="space-y-6">
            {/* Upload Card */}
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-white/90">Upload CV</h2>
                {files.length > 0 && (
                  <button
                    onClick={clearAll}
                    className="text-xs text-white/40 hover:text-white/60 transition-colors"
                  >
                    Clear all
                  </button>
                )}
              </div>
              
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${
                  dragActive 
                    ? 'border-red-500 bg-red-500/10' 
                    : 'border-white/20 hover:border-white/40 hover:bg-white/5'
                }`}
              >
                <input
                  type="file"
                  multiple
                  accept=".pdf,.docx,.doc"
                  onChange={handleFileChange}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center">
                    <svg className="w-8 h-8 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  </div>
                  <p className="text-white/80 font-medium mb-1">Drop files here or click to browse</p>
                  <p className="text-sm text-white/40">Supports PDF, DOCX</p>
                </label>
              </div>

              {/* Files List */}
              {files.length > 0 && (
                <div className="mt-6 space-y-2">
                  {files.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-white/5 rounded-xl group hover:bg-white/10 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-red-500/20 to-red-600/20 flex items-center justify-center flex-shrink-0">
                          <svg className="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm text-white/90 truncate">{file.name}</p>
                          <p className="text-xs text-white/40">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                        </div>
                      </div>
                      <button
                        onClick={() => removeFile(index)}
                        className="p-2 text-white/30 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Language Selection */}
            {files.length > 0 && (
              <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 shadow-2xl">
                <h2 className="text-lg font-semibold text-white/90 mb-4">Output Language</h2>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setLanguage('pl')}
                    className={`relative p-5 rounded-xl border-2 transition-all duration-300 ${
                      language === 'pl'
                        ? 'border-red-500 bg-red-500/10'
                        : 'border-white/10 hover:border-white/30 hover:bg-white/5'
                    }`}
                  >
                    {language === 'pl' && (
                      <div className="absolute top-3 right-3 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                    <div className="text-3xl mb-2">🇵🇱</div>
                    <div className="font-semibold text-white/90">Polski</div>
                    <div className="text-xs text-white/40 mt-1">CV po polsku</div>
                  </button>

                  <button
                    onClick={() => setLanguage('en')}
                    className={`relative p-5 rounded-xl border-2 transition-all duration-300 ${
                      language === 'en'
                        ? 'border-red-500 bg-red-500/10'
                        : 'border-white/10 hover:border-white/30 hover:bg-white/5'
                    }`}
                  >
                    {language === 'en' && (
                      <div className="absolute top-3 right-3 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                    <div className="text-3xl mb-2">🇬🇧</div>
                    <div className="font-semibold text-white/90">English</div>
                    <div className="text-xs text-white/40 mt-1">CV in English</div>
                  </button>
                </div>
              </div>
            )}

            {/* Options */}
            {files.length > 0 && language && (
              <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 shadow-2xl">
                <h2 className="text-lg font-semibold text-white/90 mb-4">Options</h2>
                
                {/* AI Enhance Toggle */}
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
                      <span className="text-lg">🪄</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white/90">AI Enhance</p>
                      <p className="text-xs text-white/40">Add missing responsibilities & technologies</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setAiEnhance(!aiEnhance)}
                    className={`w-12 h-7 rounded-full transition-all duration-300 ${
                      aiEnhance ? 'bg-red-500' : 'bg-white/20'
                    }`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full shadow-lg transition-transform duration-300 ${
                      aiEnhance ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                </div>

                {/* Blind CV Toggle */}
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-gray-500/20 to-slate-500/20 flex items-center justify-center">
                      <span className="text-lg">👤</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white/90">Blind CV</p>
                      <p className="text-xs text-white/40">Anonymize name & company names</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setBlindCV(!blindCV)}
                    className={`w-12 h-7 rounded-full transition-all duration-300 ${
                      blindCV ? 'bg-red-500' : 'bg-white/20'
                    }`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full shadow-lg transition-transform duration-300 ${
                      blindCV ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                </div>

                {/* Champion Profile */}
                {championProfile ? (
                  <div className="flex items-center justify-between p-4 bg-green-500/10 border border-green-500/30 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                        <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white/90">Champion Profile</p>
                        <p className="text-xs text-green-400">{championProfile.name}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setChampionProfile(null)}
                      className="text-xs text-white/40 hover:text-red-400 transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowChampionModal(true)}
                    className="w-full flex items-center justify-between p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center">
                        <span className="text-lg">📋</span>
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-medium text-white/90">Champion Profile</p>
                        <p className="text-xs text-white/40">Match CV to client requirements</p>
                      </div>
                    </div>
                    <svg className="w-5 h-5 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                )}
              </div>
            )}

            {/* Generate Button */}
            {files.length > 0 && language && (
              <button
                onClick={handleGenerate}
                disabled={processing}
                className="w-full relative group"
              >
                <div className="absolute -inset-1 bg-gradient-to-r from-red-600 to-red-500 rounded-xl blur opacity-70 group-hover:opacity-100 transition duration-300" />
                <div className={`relative w-full py-4 px-6 bg-gradient-to-r from-red-600 to-red-500 rounded-xl font-semibold text-white shadow-xl transition-all duration-300 ${
                  processing ? 'opacity-80' : 'hover:shadow-red-500/25 hover:shadow-2xl'
                }`}>
                  {processing ? (
                    <span className="flex items-center justify-center gap-3">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Processing...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      Generate CV ({files.length} {files.length === 1 ? 'file' : 'files'})
                    </span>
                  )}
                </div>
              </button>
            )}
          </div>

          {/* Right Column - Results */}
          <div>
            {processedCVs.length > 0 ? (
              <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 shadow-2xl">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-white/90">Generated CVs</h2>
                  {processedCVs.some(cv => cv.status === 'success') && (
                    <button
                      onClick={downloadAll}
                      className="flex items-center gap-2 px-4 py-2 bg-green-500/20 text-green-400 rounded-lg text-sm font-medium hover:bg-green-500/30 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      Download All
                    </button>
                  )}
                </div>

                <div className="space-y-3">
                  {processedCVs.map((cv, index) => (
                    <div
                      key={index}
                      className={`p-4 rounded-xl transition-all duration-300 ${
                        cv.status === 'processing'
                          ? 'bg-blue-500/10 border border-blue-500/30'
                          : cv.status === 'success'
                          ? 'bg-green-500/10 border border-green-500/30'
                          : 'bg-red-500/10 border border-red-500/30'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 min-w-0">
                          {cv.status === 'processing' && (
                            <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                              <svg className="animate-spin h-4 w-4 text-blue-400" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                              </svg>
                            </div>
                          )}
                          {cv.status === 'success' && (
                            <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center">
                              <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            </div>
                          )}
                          {cv.status === 'error' && (
                            <div className="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center">
                              <svg className="w-4 h-4 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                              </svg>
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-white/90 truncate">{cv.name}</p>
                            {cv.error && <p className="text-xs text-red-400 truncate">{cv.error}</p>}
                            {cv.status === 'processing' && <p className="text-xs text-blue-400">Generating...</p>}
                            {cv.status === 'success' && <p className="text-xs text-green-400">Ready to download</p>}
                          </div>
                        </div>
                        
                        {cv.downloadUrl && (
                          <a
                            href={cv.downloadUrl}
                            download={`B2B_${cv.name.replace(/\.[^/.]+$/, '')}.docx`}
                            className="flex items-center gap-2 px-4 py-2 bg-white/10 text-white rounded-lg text-sm font-medium hover:bg-white/20 transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                            Download
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-12 shadow-2xl flex flex-col items-center justify-center text-center h-full min-h-[400px]">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center mb-6">
                  <svg className="w-10 h-10 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-white/60 mb-2">No CVs generated yet</h3>
                <p className="text-sm text-white/40 max-w-xs">
                  Upload CV files, select a language, and click Generate to create professional B2B Network CVs
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Champion Profile Modal */}
      {showChampionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowChampionModal(false)} />
          <div className="relative bg-[#12121a] rounded-2xl border border-white/10 p-8 max-w-md w-full shadow-2xl">
            <button
              onClick={() => setShowChampionModal(false)}
              className="absolute top-4 right-4 p-2 text-white/40 hover:text-white transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            <div className="text-center mb-6">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center">
                <span className="text-3xl">📋</span>
              </div>
              <h3 className="text-xl font-semibold text-white/90">Champion Profile</h3>
              <p className="text-sm text-white/50 mt-2">
                Add a Champion Profile to match the &quot;WHY&quot; section to client requirements
              </p>
            </div>
            
            <div
              className="border-2 border-dashed border-white/20 rounded-xl p-6 text-center hover:border-white/40 hover:bg-white/5 transition-all cursor-pointer mb-6"
              onClick={() => document.getElementById('champion-upload')?.click()}
            >
              <input
                type="file"
                accept=".docx,.pdf"
                onChange={(e) => setChampionProfile(e.target.files?.[0] || null)}
                className="hidden"
                id="champion-upload"
              />
              {championProfile ? (
                <div className="text-green-400">
                  <svg className="w-8 h-8 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="font-medium">{championProfile.name}</span>
                </div>
              ) : (
                <div className="text-white/50">
                  <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span>Click to select file (DOCX, PDF)</span>
                </div>
              )}
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => {
                  setChampionProfile(null)
                  setShowChampionModal(false)
                }}
                className="py-3 px-4 bg-white/10 text-white rounded-xl font-medium hover:bg-white/20 transition-colors"
              >
                Skip
              </button>
              <button
                onClick={() => {
                  if (!championProfile) {
                    document.getElementById('champion-upload')?.click()
                  } else {
                    setShowChampionModal(false)
                  }
                }}
                className="py-3 px-4 bg-gradient-to-r from-red-600 to-red-500 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-red-500/25 transition-all"
              >
                {championProfile ? 'Continue' : 'Upload'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 mt-12">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <p className="text-center text-white/30 text-sm">
            © 2024 B2B Network • CV Generator v3.0 • Powered by Claude AI
          </p>
        </div>
      </footer>
    </div>
  )
}
