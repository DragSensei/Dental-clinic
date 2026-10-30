"use client";

import { useEffect, useRef, useState, useId } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { PenTool, Type, Eraser, Check } from "lucide-react";

export interface SignaturePadProps {
  value?: string;
  onChange: (dataUrl: string) => void;
  clearLabel?: string;
  instructions?: string;
  disabled?: boolean;
}

export function SignaturePad({
  value,
  onChange,
  clearLabel = "Clear",
  instructions = "Sign within the box using your mouse, trackpad, or finger",
  disabled = false,
}: SignaturePadProps) {
  const [mode, setMode] = useState<"draw" | "type">("draw");
  const [typedName, setTypedName] = useState("");
  const [hasDrawn, setHasDrawn] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDrawingRef = useRef(false);
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);
  const padId = useId();

  // If a value is provided externally and canvas is blank, we can track that
  useEffect(() => {
    if (!value) {
      const frame = requestAnimationFrame(() => {
        setHasDrawn(false);
        clearCanvas();
      });
      return () => cancelAnimationFrame(frame);
    }
  }, [value]);

  function getInkColor(canvas: HTMLCanvasElement) {
    if (typeof window === "undefined") return "currentColor";
    return getComputedStyle(canvas).color || "currentColor";
  }

  function setupCanvas(canvas: HTMLCanvasElement) {
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;
    const dpr = window.devicePixelRatio || 1;
    if (canvas.width !== Math.round(rect.width * dpr) || canvas.height !== Math.round(rect.height * dpr)) {
      canvas.width = Math.round(rect.width * dpr);
      canvas.height = Math.round(rect.height * dpr);
      ctx.scale(dpr, dpr);
    }
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = getInkColor(canvas);
  }

  useEffect(() => {
    if (canvasRef.current) {
      setupCanvas(canvasRef.current);
    }
  });

  function clearCanvas() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  function handleClear() {
    clearCanvas();
    setHasDrawn(false);
    setTypedName("");
    onChange("");
  }

  function getCanvasCoords(e: React.PointerEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  }

  function onPointerDown(e: React.PointerEvent<HTMLCanvasElement>) {
    if (disabled || mode !== "draw") return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.setPointerCapture(e.pointerId);
    isDrawingRef.current = true;
    const point = getCanvasCoords(e);
    lastPointRef.current = point;

    const ctx = canvas.getContext("2d");
    if (ctx) {
      const ink = getInkColor(canvas);
      ctx.strokeStyle = ink;
      ctx.fillStyle = ink;
      ctx.beginPath();
      ctx.arc(point.x, point.y, 1.25, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function onPointerMove(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!isDrawingRef.current || disabled || mode !== "draw") return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const point = getCanvasCoords(e);
    const lastPoint = lastPointRef.current ?? point;

    ctx.beginPath();
    ctx.moveTo(lastPoint.x, lastPoint.y);
    ctx.lineTo(point.x, point.y);
    ctx.stroke();

    lastPointRef.current = point;
    if (!hasDrawn) setHasDrawn(true);
  }

  function onPointerUp(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!isDrawingRef.current) return;
    isDrawingRef.current = false;
    lastPointRef.current = null;
    const canvas = canvasRef.current;
    if (!canvas) return;
    try {
      canvas.releasePointerCapture(e.pointerId);
    } catch {}

    const dataUrl = canvas.toDataURL("image/png");
    setHasDrawn(true);
    onChange(dataUrl);
  }

  function renderTypedSignature(name: string) {
    setTypedName(name);
    if (!name.trim()) {
      clearCanvas();
      setHasDrawn(false);
      onChange("");
      return;
    }

    // Render text to canvas with stylized script font
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, rect.width, rect.height);
    const ink = getInkColor(canvas);
    ctx.font = 'italic 34px "Brush Script MT", "Caveat", "Segoe Script", cursive';
    ctx.fillStyle = ink;
    ctx.textBaseline = "middle";
    ctx.textAlign = "center";
    ctx.fillText(name.trim(), rect.width / 2, rect.height / 2);

    // Decorative signature baseline
    ctx.beginPath();
    ctx.moveTo(rect.width * 0.15, rect.height * 0.75);
    ctx.lineTo(rect.width * 0.85, rect.height * 0.75);
    ctx.strokeStyle = ink;
    ctx.globalAlpha = 0.25;
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.globalAlpha = 1;

    setHasDrawn(true);
    onChange(canvas.toDataURL("image/png"));
  }

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 shadow-xs">
      {/* Mode Switcher Pill */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/60 pb-3">
        <div className="flex items-center gap-1 rounded-xl bg-muted p-1">
          <Button
            type="button"
            variant={mode === "draw" ? "default" : "ghost"}
            size="sm"
            disabled={disabled}
            onClick={() => {
              setMode("draw");
              clearCanvas();
              setHasDrawn(false);
              onChange("");
            }}
            className="min-h-[44px] min-w-[44px] rounded-lg px-3 text-xs font-medium"
          >
            <PenTool className="size-3.5 me-1.5" />
            Draw Signature
          </Button>
          <Button
            type="button"
            variant={mode === "type" ? "default" : "ghost"}
            size="sm"
            disabled={disabled}
            onClick={() => {
              setMode("type");
              clearCanvas();
              setHasDrawn(false);
              onChange("");
            }}
            className="min-h-[44px] min-w-[44px] rounded-lg px-3 text-xs font-medium"
          >
            <Type className="size-3.5 me-1.5" />
            Type Signature
          </Button>
        </div>

        <div className="flex items-center gap-2">
          {(hasDrawn || value) && (
            <Badge variant="success" className="gap-1 text-xs">
              <Check className="size-3" />
              Signed
            </Badge>
          )}
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={disabled || (!hasDrawn && !value && !typedName)}
            onClick={handleClear}
            className="min-h-[44px] min-w-[44px] rounded-xl px-3 text-xs text-muted-foreground hover:text-foreground"
          >
            <Eraser className="size-3.5 me-1" />
            {clearLabel}
          </Button>
        </div>
      </div>

      {mode === "type" && (
        <div className="flex flex-col gap-1.5">
          <label htmlFor={`typed-sig-${padId}`} className="text-xs font-medium text-muted-foreground">
            Type your full legal name:
          </label>
          <Input
            id={`typed-sig-${padId}`}
            type="text"
            value={typedName}
            disabled={disabled}
            placeholder="e.g. Mariam Ahmed"
            onChange={(e) => renderTypedSignature(e.target.value)}
            className="min-h-[44px] rounded-xl text-sm"
          />
        </div>
      )}

      {/* Canvas Area */}
      <div className="relative">
        <canvas
          ref={canvasRef}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          className={`h-40 w-full touch-none rounded-xl border border-dashed border-border/80 bg-background text-foreground transition-colors ${
            disabled ? "opacity-60 cursor-not-allowed" : mode === "draw" ? "cursor-crosshair" : ""
          }`}
        />
        {!hasDrawn && !value && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center p-4 text-center">
            <p className="text-xs text-muted-foreground/70">
              {mode === "draw" ? instructions : "Preview of your typed signature will appear here"}
            </p>
          </div>
        )}
      </div>

      <p className="text-[11px] text-muted-foreground">
        By signing, you confirm that this digital signature has the same legal validity as a handwritten signature.
      </p>
    </div>
  );
}

export default SignaturePad;
