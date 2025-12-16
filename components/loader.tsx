"use client"

import { useEffect, useState } from "react"

interface LoaderProps {
  retryCount?: number
  maxRetries?: number
}

export default function HammerLoader({ retryCount = 0, maxRetries = 3 }: LoaderProps) {
  const [progress, setProgress] = useState(0)
  const isRetrying = retryCount > 1

  // Fake progress bar animation
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        // Slow down as we get closer to 100%, never actually reach 100%
        if (prev >= 95) return prev
        const increment = Math.max(0.5, (100 - prev) * 0.02)
        return Math.min(95, prev + increment)
      })
    }, 200)

    return () => clearInterval(interval)
  }, [retryCount])

  // Reset progress when retry count changes
  useEffect(() => {
    if (retryCount > 1) {
      setProgress(0)
    }
  }, [retryCount])

  return (
    <div className="flex flex-col items-center justify-center py-24 space-y-8">
      <div className="fire">
        <div className="fire-left">
          <div className="main-fire"></div>
          <div className="particle-fire"></div>
        </div>
        <div className="fire-center">
          <div className="main-fire"></div>
          <div className="particle-fire"></div>
        </div>
        <div className="fire-right">
          <div className="main-fire"></div>
          <div className="particle-fire"></div>
        </div>
        <div className="fire-bottom">
          <div className="main-fire"></div>
        </div>
      </div>

      <div className="text-center space-y-2">
        <h2 className="text-xl font-semibold">
          {isRetrying ? `Retrying ${retryCount} of ${maxRetries}...` : "Forging Your Perfect Build"}
        </h2>
        <p className="text-muted-foreground text-balance max-w-md leading-relaxed">
          {isRetrying
            ? "The AI is busy. Waiting a moment before trying again..."
            : "Our AI is analyzing compatible components and optimizing your build for peak performance"
          }
        </p>
      </div>

      {/* Fake Progress Bar */}
      <div className="w-full max-w-xs space-y-2">
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-xs text-muted-foreground text-center">
          {isRetrying ? "Reconnecting..." : `${Math.round(progress)}% complete`}
        </p>
      </div>

      <style jsx>{`
        @keyframes scaleUpDown {
          0%, 100% {
            transform: scaleY(1) scaleX(1);
          }
          50%, 90% {
            transform: scaleY(1.1);
          }
          75% {
            transform: scaleY(0.95);
          }
          80% {
            transform: scaleX(0.95);
          }
        }

        @keyframes shake {
          0%, 100% {
            transform: skewX(0) scale(1);
          }
          50% {
            transform: skewX(5deg) scale(0.9);
          }
        }

        @keyframes particleUp {
          0% {
            opacity: 0;
          }
          20% {
            opacity: 1;
          }
          80% {
            opacity: 1;
          }
          100% {
            opacity: 0;
            top: -100%;
            transform: scale(0.5);
          }
        }

        @keyframes glow {
          0%, 100% {
            background-color: #FF0040;
          }
          50% {
            background-color: #ff3366;
          }
        }

        .fire {
          position: relative;
          width: 100px;
          height: 100px;
          background-color: transparent;
        }

        .fire-center {
          position: absolute;
          height: 100%;
          width: 100%;
          animation: scaleUpDown 3s ease-out infinite both;
        }

        .fire-center .main-fire {
          position: absolute;
          width: 100%;
          height: 100%;
          background-image: radial-gradient(farthest-corner at 10px 0, #d43300 0%, #FF0040 95%);
          transform: scaleX(0.8) rotate(45deg);
          border-radius: 0 40% 60% 40%;
          filter: drop-shadow(0 0 10px #FF0040);
        }

        .fire-center .particle-fire {
          position: absolute;
          top: 60%;
          left: 45%;
          width: 10px;
          height: 10px;
          background-color: #FF0040;
          border-radius: 50%;
          filter: drop-shadow(0 0 10px #FF0040);
          animation: particleUp 2s ease-out 0s infinite both;
        }

        .fire-right {
          height: 100%;
          width: 100%;
          position: absolute;
          animation: shake 2s ease-out 0s infinite both;
        }

        .fire-right .main-fire {
          position: absolute;
          top: 15%;
          right: -25%;
          width: 80%;
          height: 80%;
          background-color: #FF0040;
          transform: scaleX(0.8) rotate(45deg);
          border-radius: 0 40% 60% 40%;
          filter: drop-shadow(0 0 10px #FF0040);
        }

        .fire-right .particle-fire {
          position: absolute;
          top: 45%;
          left: 50%;
          width: 15px;
          height: 15px;
          background-color: #FF0040;
          transform: scaleX(0.8) rotate(45deg);
          border-radius: 50%;
          filter: drop-shadow(0 0 10px #FF0040);
          animation: particleUp 2s ease-out 0s infinite both;
        }

        .fire-left {
          position: absolute;
          height: 100%;
          width: 100%;
          animation: shake 3s ease-out 0s infinite both;
        }

        .fire-left .main-fire {
          position: absolute;
          top: 15%;
          left: -20%;
          width: 80%;
          height: 80%;
          background-color: #FF0040;
          transform: scaleX(0.8) rotate(45deg);
          border-radius: 0 40% 60% 40%;
          filter: drop-shadow(0 0 10px #FF0040);
        }

        .fire-left .particle-fire {
          position: absolute;
          top: 10%;
          left: 20%;
          width: 10%;
          height: 10%;
          background-color: #FF0040;
          border-radius: 50%;
          filter: drop-shadow(0 0 10px #FF0040);
          animation: particleUp 3s infinite ease-out 0s both;
        }

        .fire-bottom .main-fire {
          position: absolute;
          top: 30%;
          left: 20%;
          width: 75%;
          height: 75%;
          background-color: #ff3366;
          transform: scaleX(0.8) rotate(45deg);
          border-radius: 0 40% 100% 40%;
          filter: blur(10px);
          animation: glow 2s ease-out 0s infinite both;
        }
      `}</style>
    </div>
  )
}
