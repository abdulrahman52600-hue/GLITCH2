import React, { useEffect, useRef, useState } from 'react';
import { AlertTriangle, Camera, LoaderCircle, ShieldCheck } from 'lucide-react';

const VISION_VERSION = '1.0.1';
const MODEL_URL = 'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task';
const LOOK_AWAY_MS = 5000;
const RESET_CENTERED_MS = 1200;

function estimatePose(landmarks) {
  const leftEye = landmarks[33];
  const rightEye = landmarks[263];
  const nose = landmarks[1];
  const mouth = landmarks[13];
  if (!leftEye || !rightEye || !nose || !mouth) return null;
  const eyeSpan = Math.abs(leftEye.x - rightEye.x);
  if (!eyeSpan) return null;
  const eyeMidX = (leftEye.x + rightEye.x) / 2;
  const eyeMidY = (leftEye.y + rightEye.y) / 2;
  const verticalSpan = mouth.y - eyeMidY;
  if (Math.abs(verticalSpan) < 0.01) return null;
  const pose = {
    yaw: (nose.x - eyeMidX) / eyeSpan,
    pitch: (nose.y - eyeMidY) / verticalSpan
  };
  const rightIris = landmarks[468];
  const leftIris = landmarks[473];
  const rightEyeOuter = landmarks[33];
  const rightEyeInner = landmarks[133];
  const leftEyeInner = landmarks[362];
  const leftEyeOuter = landmarks[263];
  const rightEyeTop = landmarks[159];
  const rightEyeBottom = landmarks[145];
  const leftEyeTop = landmarks[386];
  const leftEyeBottom = landmarks[374];
  if ([rightIris, leftIris, rightEyeOuter, rightEyeInner, leftEyeInner, leftEyeOuter, rightEyeTop, rightEyeBottom, leftEyeTop, leftEyeBottom].every(Boolean)) {
    const rightWidth = rightEyeInner.x - rightEyeOuter.x;
    const leftWidth = leftEyeOuter.x - leftEyeInner.x;
    const rightHeight = rightEyeBottom.y - rightEyeTop.y;
    const leftHeight = leftEyeBottom.y - leftEyeTop.y;
    if (Math.abs(rightWidth) > 0.005 && Math.abs(leftWidth) > 0.005 && rightHeight > 0.008 && leftHeight > 0.008) {
      pose.gazeX = ((rightIris.x - rightEyeOuter.x) / rightWidth + (leftIris.x - leftEyeInner.x) / leftWidth) / 2;
      pose.gazeY = ((rightIris.y - rightEyeTop.y) / rightHeight + (leftIris.y - leftEyeTop.y) / leftHeight) / 2;
    }
  }
  return pose;
}

export default function AssessmentCameraMonitor({ active, setupMode, onReady, onFaceAway, onFaceReturned, retryKey = 0 }) {
  const videoRef = useRef(null);
  const callbacksRef = useRef({ onReady, onFaceAway, onFaceReturned });
  callbacksRef.current = { onReady, onFaceAway, onFaceReturned };
  const [status, setStatus] = useState('starting');
  const [error, setError] = useState('');
  const [stream, setStream] = useState(null);
  const [faceAway, setFaceAway] = useState(false);

  useEffect(() => {
    if (!active) return undefined;
    let cancelled = false;
    let animationFrame = 0;
    let landmarker;
    let mediaStream;
    let lastDetectionAt = 0;
    let awaySince = 0;
    let centeredSince = 0;
    let warningRaised = false;
    let calibrationSamples = [];
    let baseline = null;
    let noFaceSince = 0;
    let cameraTrack;
    let cameraTrackEndedHandler;

    const setReady = (value) => callbacksRef.current.onReady?.(value);
    const fail = (message) => {
      if (cancelled) return;
      setError(message);
      setStatus('error');
      setReady(false);
    };

    const processPose = (landmarks, now) => {
      const pose = landmarks ? estimatePose(landmarks) : null;
      if (!pose) {
        if (!noFaceSince) noFaceSince = now;
        awaySince = awaySince || noFaceSince;
      } else {
        noFaceSince = 0;
        if (!baseline) {
          calibrationSamples.push(pose);
          if (calibrationSamples.length >= 8) {
            baseline = {
              yaw: calibrationSamples.reduce((sum, value) => sum + value.yaw, 0) / calibrationSamples.length,
              pitch: calibrationSamples.reduce((sum, value) => sum + value.pitch, 0) / calibrationSamples.length,
              gazeX: calibrationSamples.reduce((sum, value) => sum + (value.gazeX ?? 0.5), 0) / calibrationSamples.length,
              gazeY: calibrationSamples.reduce((sum, value) => sum + (value.gazeY ?? 0.5), 0) / calibrationSamples.length
            };
            setStatus('ready');
            setReady(true);
          }
          return;
        }
        const eyesAway = pose.gazeX !== undefined && pose.gazeY !== undefined
          && (Math.abs(pose.gazeX - baseline.gazeX) > 0.20 || Math.abs(pose.gazeY - baseline.gazeY) > 0.28);
        const turnedAway = Math.abs(pose.yaw - baseline.yaw) > 0.24 || Math.abs(pose.pitch - baseline.pitch) > 0.24 || eyesAway;
        if (turnedAway) {
          awaySince = awaySince || now;
          centeredSince = 0;
        } else {
          awaySince = 0;
          centeredSince = centeredSince || now;
          if (warningRaised && now - centeredSince >= RESET_CENTERED_MS) {
            warningRaised = false;
            setFaceAway(false);
            callbacksRef.current.onFaceReturned?.();
          }
        }
      }

      if (awaySince && !warningRaised && now - awaySince >= LOOK_AWAY_MS) {
        warningRaised = true;
        centeredSince = 0;
        setFaceAway(true);
        callbacksRef.current.onFaceAway?.();
      }
    };

    const detectLoop = (now) => {
      if (cancelled) return;
      const video = videoRef.current;
      if (video?.readyState >= 2 && now - lastDetectionAt >= 300) {
        lastDetectionAt = now;
        try {
          const result = landmarker.detectForVideo(video, now);
          processPose(result.faceLandmarks?.[0] || null, now);
        } catch {
          // Camera frames can briefly be unavailable while a browser changes tabs or resumes.
        }
      }
      animationFrame = window.requestAnimationFrame(detectLoop);
    };

    const start = async () => {
      try {
        if (!navigator.mediaDevices?.getUserMedia) {
          fail('Camera access is unavailable. Open this site over HTTPS or localhost in a supported browser.');
          return;
        }
        setStatus('requesting');
        setError('');
        setReady(false);
        mediaStream = await navigator.mediaDevices.getUserMedia({
          audio: false,
          video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } }
        });
        if (cancelled) {
          mediaStream.getTracks().forEach(track => track.stop());
          return;
        }
        setStream(mediaStream);
        cameraTrack = mediaStream.getVideoTracks()[0];
        cameraTrackEndedHandler = () => fail('Camera connection ended. Reconnect the camera to continue the monitored assessment.');
        cameraTrack?.addEventListener('ended', cameraTrackEndedHandler);
        const video = videoRef.current;
        if (!video) throw new Error('Camera preview could not be opened.');
        video.srcObject = mediaStream;
        await video.play();
        setStatus('loading-model');

        const { FaceLandmarker, FilesetResolver } = await import('@mediapipe/tasks-vision');
        const vision = await FilesetResolver.forVisionTasks(`https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@${VISION_VERSION}/wasm`);
        landmarker = await FaceLandmarker.createFromOptions(vision, {
          baseOptions: { modelAssetPath: MODEL_URL, delegate: 'CPU' },
          runningMode: 'VIDEO',
          numFaces: 1,
          minFaceDetectionConfidence: 0.55,
          minFacePresenceConfidence: 0.55,
          minTrackingConfidence: 0.55,
          outputFaceBlendshapes: false,
          outputFacialTransformationMatrixes: false
        });
        if (cancelled) return;
        setStatus('calibrating');
        animationFrame = window.requestAnimationFrame(detectLoop);
      } catch (err) {
        if (cancelled) return;
        const message = err?.name === 'NotAllowedError'
          ? 'Camera permission was declined. Allow camera access in your browser settings, then try again.'
          : err?.name === 'NotFoundError'
            ? 'No camera was found. Connect a camera or contact your assessment administrator for an accommodation.'
            : err?.message || 'Camera setup failed. Check your camera and internet connection, then try again.';
        fail(message);
      }
    };

    start();
    return () => {
      cancelled = true;
      window.cancelAnimationFrame(animationFrame);
      cameraTrack?.removeEventListener('ended', cameraTrackEndedHandler);
      mediaStream?.getTracks().forEach(track => track.stop());
      landmarker?.close?.();
      setStream(null);
      setReady(false);
    };
  }, [active, retryKey]);

  if (!active) return null;

  const statusLabel = {
    starting: 'Starting camera check…',
    requesting: 'Waiting for camera permission…',
    'loading-model': 'Loading the on-device face checker…',
    calibrating: 'Look toward the screen to calibrate…',
    ready: setupMode ? 'Camera check passed' : 'Camera check active'
  }[status] || 'Camera check unavailable';

  return (
    <section className="rounded-2xl border border-outline-variant/25 bg-surface-container-lowest p-4 sm:p-5" aria-label="Assessment camera check">
      <div className="flex flex-col sm:flex-row gap-4 sm:items-center">
        <div className="relative w-full sm:w-56 aspect-video rounded-xl overflow-hidden bg-slate-950 shrink-0">
          <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover -scale-x-100" />
          {!stream && <div className="absolute inset-0 flex items-center justify-center text-white/70"><Camera className="w-7 h-7" /></div>}
          {faceAway && <div className="absolute inset-x-2 bottom-2 rounded-lg bg-amber-500 text-white text-[10px] font-bold px-2 py-1">Please face the screen</div>}
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2 font-bold text-sm"><Camera className="w-4 h-4 text-primary" /> Camera check <span className="text-[10px] font-semibold text-on-surface-variant">· no recording</span></div>
          <div className="mt-2 flex items-center gap-2 text-xs text-on-surface-variant" role="status" aria-live="polite">
            {status === 'ready' ? <ShieldCheck className="w-4 h-4 text-green-700" /> : status === 'error' ? <AlertTriangle className="w-4 h-4 text-amber-700" /> : <LoaderCircle className="w-4 h-4 animate-spin" />}
            {error || statusLabel}
          </div>
          <p className="text-[11px] leading-5 text-on-surface-variant mt-2">Approximate face and eye direction is estimated on this device; it cannot prove where someone is looking. NexBridge does not record or upload camera video. The Face Landmarker library may send non-image usage and performance metrics to Google.</p>
        </div>
      </div>
    </section>
  );
}
