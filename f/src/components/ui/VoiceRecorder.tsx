import { useState, useRef } from 'react'

interface VoiceRecorderProps {
  onRecordingComplete: (audioFile: File) => void
  isRecording: boolean
  onRecordingStart: () => void
  onRecordingStop: () => void
  disabled?: boolean
}

const VoiceRecorder = ({
  onRecordingComplete,
  isRecording,
  onRecordingStart,
  onRecordingStop,
  disabled = false
}: VoiceRecorderProps) => {
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [recordingTime, setRecordingTime] = useState(0)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
        }
      })

      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      chunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' })
        const audioFile = new File([audioBlob], `recording-${Date.now()}.webm`, {
          type: 'audio/webm'
        })
        
        const url = URL.createObjectURL(audioBlob)
        setAudioUrl(url)
        onRecordingComplete(audioFile)
        
        // Останавливаем поток
        stream.getTracks().forEach(track => track.stop())
      }

      mediaRecorder.start()
      onRecordingStart()
      
      // Запускаем таймер
      setRecordingTime(0)
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1)
      }, 1000)

    } catch (error) {
      console.error('Error starting recording:', error)
      alert('Unable to access microphone. Please check permissions.')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop()
      onRecordingStop()
      
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="text-center">
        {!isRecording && !audioUrl && (
          <button
            onClick={startRecording}
            disabled={disabled}
            className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-full transition-colors shadow-lg"
          >
            🎤
          </button>
        )}

        {isRecording && (
          <div className="space-y-4">
            <button
              onClick={stopRecording}
              className="inline-flex items-center justify-center w-16 h-16 bg-red-600 hover:bg-red-700 text-white rounded-full transition-colors shadow-lg animate-pulse"
            >
              ⏹️
            </button>
            
            <div className="text-lg font-mono text-gray-700">{formatTime(recordingTime)}</div>
          </div>
        )}

        {audioUrl && !isRecording && (
          <div className="space-y-4">
            <div className="flex items-center justify-center space-x-4">
              <button
                onClick={() => {
                  const audio = new Audio(audioUrl)
                  audio.play()
                }}
                className="inline-flex items-center justify-center w-12 h-12 bg-green-600 hover:bg-green-700 text-white rounded-full transition-colors"
              >
                ▶️
              </button>
              
              <button
                onClick={startRecording}
                disabled={disabled}
                className="inline-flex items-center justify-center w-12 h-12 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-full transition-colors"
              >
                🎤
              </button>
            </div>
          </div>
        )}

        <div className="mt-4 text-sm text-gray-500">
          {isRecording ? 'Recording... Click stop when finished' : 
           audioUrl ? 'Ready to translate. Record again or translate current recording.' :
           'Click microphone to start recording'}
        </div>
      </div>
    </div>
  )
}

export default VoiceRecorder
