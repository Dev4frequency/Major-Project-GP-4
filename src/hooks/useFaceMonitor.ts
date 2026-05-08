import { useEffect, useRef, useState, useCallback } from "react";
import { toast } from "sonner";

/**
 * Lightweight "face presence" monitor using the FaceDetector API when available
 * and a brightness/motion fallback otherwise. Triggers a warning when no face
 * (or no apparent presence in front of the camera) is detected for `thresholdMs`.
 */
type Opts = {
  active: boolean;
  thresholdMs?: number;
  onSustainedAbsence?: () => void;
};

export function useFaceMonitor({ active, thresholdMs = 5000, onSustainedAbsence }: Opts) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);
  const lastSeenRef = useRef<number>(Date.now());
  const lastFrameRef = useRef<ImageData | null>(null);
  const warnedRef = useRef(false);

  const [ready, setReady] = useState(false);
  const [present, setPresent] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [absenceCount, setAbsenceCount] = useState(0);

  const stop = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setReady(false);
  }, []);

  useEffect(() => {
    if (!active) { stop(); return; }
    let cancelled = false;

    (async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 240, height: 180 }, audio: false });
        if (cancelled) { stream.getTracks().forEach((t) => t.stop()); return; }
        streamRef.current = stream;
        const v = videoRef.current ?? document.createElement("video");
        videoRef.current = v;
        v.srcObject = stream;
        v.muted = true; v.playsInline = true;
        await v.play();
        const c = canvasRef.current ?? document.createElement("canvas");
        canvasRef.current = c;
        c.width = 160; c.height = 120;
        setReady(true);

        // @ts-ignore — experimental
        const FD = (window as any).FaceDetector;
        const detector = FD ? new FD({ fastMode: true }) : null;

        const tick = async () => {
          if (cancelled) return;
          const ctx = c.getContext("2d", { willReadFrequently: true });
          if (!ctx || v.readyState < 2) { rafRef.current = requestAnimationFrame(tick); return; }
          ctx.drawImage(v, 0, 0, c.width, c.height);

          let faceDetected = false;

          if (detector) {
            try {
              const faces = await detector.detect(c);
              faceDetected = faces.length > 0;
            } catch { /* ignore */ }
          } else {
            // Fallback: detect "presence" via brightness + frame-to-frame motion.
            const frame = ctx.getImageData(0, 0, c.width, c.height);
            const data = frame.data;
            let bright = 0, motion = 0;
            const prev = lastFrameRef.current?.data;
            for (let i = 0; i < data.length; i += 16) {
              const lum = (data[i] + data[i + 1] + data[i + 2]) / 3;
              bright += lum;
              if (prev) motion += Math.abs(lum - (prev[i] + prev[i + 1] + prev[i + 2]) / 3);
            }
            const samples = data.length / 16;
            const avgB = bright / samples;
            const avgM = motion / samples;
            // "Present" if there's enough light AND any motion (or no prev frame yet)
            faceDetected = avgB > 22 && (!prev || avgM > 1.2);
            lastFrameRef.current = frame;
          }

          const now = Date.now();
          if (faceDetected) {
            lastSeenRef.current = now;
            if (!present) setPresent(true);
            warnedRef.current = false;
          } else if (now - lastSeenRef.current > thresholdMs) {
            if (!warnedRef.current) {
              warnedRef.current = true;
              setPresent(false);
              setAbsenceCount((n) => n + 1);
              toast.warning("⚠ Face not detected", {
                description: `You've been away from the screen for over ${Math.round(thresholdMs / 1000)}s.`,
                duration: 4000,
              });
              onSustainedAbsence?.();
            }
          }

          rafRef.current = requestAnimationFrame(tick);
        };
        rafRef.current = requestAnimationFrame(tick);
      } catch (e: any) {
        setError(e?.message ?? "Camera access denied");
        toast.error("Camera unavailable", { description: "Proctoring features won't track attention." });
      }
    })();

    return () => { cancelled = true; stop(); };
  }, [active, thresholdMs, onSustainedAbsence, present, stop]);

  return { videoRef, canvasRef, ready, present, error, absenceCount };
}
