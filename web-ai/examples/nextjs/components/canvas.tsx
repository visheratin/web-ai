import Jimp from "jimp";
import { useEffect, useRef, useState } from "react";
import { SegmentAnythingPrompt, Point } from "@visheratin/web-ai/image";

export interface CanvasProps {
  image: Jimp | null;
  setPrompt: (prompt: SegmentAnythingPrompt) => void;
  processing: boolean;
  segmentCanvas: HTMLCanvasElement | undefined;
}

export default function Canvas(props: CanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState("pos-points");
  const [currentPrompt, setCurrentPrompt] = useState<SegmentAnythingPrompt>({
    image: undefined,
    points: undefined,
    boxes: undefined,
  });
  const [currentPoint, setCurrentPoint] = useState<{ x: number; y: number } | null>(null);

  const [displayDims, setDisplayDims] = useState({
    width: 0,
    height: 0,
    aspectRatio: 1,
    left: 0,
  });

  const setCanvasSize = (height: number, width: number) => {
    const aspectRatio = height / width;
    if (canvasRef.current && canvasContainerRef.current) {
      let maxWidth = canvasContainerRef.current.offsetWidth;
      maxWidth = maxWidth > 800 ? 800 : maxWidth;
      const widthRatio = maxWidth / width;
      let maxHeight = maxWidth * aspectRatio;
      maxHeight = maxHeight > 500 ? 500 : maxHeight;
      const heightRatio = maxHeight / height;
      if (widthRatio > heightRatio) {
        maxWidth = heightRatio * width;
      } else {
        maxHeight = widthRatio * height;
      }
      const left = (canvasContainerRef.current.offsetWidth - maxWidth) / 2;
      setDisplayDims({
        width: maxWidth,
        height: maxHeight,
        aspectRatio: aspectRatio,
        left: left,
      });
    }
  };

  useEffect(() => {
    if (!props.image) return;
    clearPrompt();
    setCanvasSize(props.image.bitmap.height, props.image.bitmap.width);
    const imageData = new ImageData(
      new Uint8ClampedArray(props.image.bitmap.data),
      props.image.bitmap.width,
      props.image.bitmap.height,
    );
    const c = document.createElement("canvas");
    c.width = props.image.bitmap.width;
    c.height = props.image.bitmap.height;
    const ctx = c.getContext("2d");
    ctx!.putImageData(imageData, 0, 0);
    imageRef.current!.src = c.toDataURL("image/png");
  }, [props.image]);

  useEffect(() => {
    if (props.segmentCanvas) {
      clearCanvas();
      const canvas = canvasRef.current;
      const destCtx = canvas!.getContext("2d");
      destCtx!.globalAlpha = 0.6;
      destCtx!.drawImage(
        props.segmentCanvas,
        0,
        0,
        props.segmentCanvas.width,
        props.segmentCanvas.height,
        0,
        0,
        canvas!.width,
        canvas!.height,
      );
      drawPrompt(currentPrompt, false);
    }
  }, [props.segmentCanvas]);

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas!.getContext("2d");
    ctx!.clearRect(0, 0, canvas!.width, canvas!.height);
  };

  const clearPrompt = () => {
    const prompt = currentPrompt;
    prompt.points = undefined;
    prompt.boxes = undefined;
    setCurrentPrompt(prompt);
    props.setPrompt(prompt);
    clearCanvas();
  };

  const handleClick = (e: any) => {
    if (props.processing) return;
    const canvas = canvasRef.current;
    const rect = canvas!.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    if (mode === "pos-points" || mode === "neg-points") {
      updatePrompt(x, y);
    } else {
      if (currentPoint === null) {
        setCurrentPoint({ x: x, y: y });
      } else {
        updatePrompt(x, y);
      }
    }
  };

  useEffect(() => {
    if (currentPoint !== null) {
      const canvas = canvasRef.current;
      const ctx = canvas!.getContext("2d");
      ctx!.beginPath();
      ctx!.arc(currentPoint.x, currentPoint.y, 2, 0, 2 * Math.PI);
      ctx!.fillStyle = "#f5ed0a";
      ctx!.fill();
      ctx!.strokeStyle = "#f5ed0a";
      ctx!.stroke();
    }
  }, [currentPoint]);

  const updatePrompt = (x: number, y: number) => {
    const canvas = canvasRef.current;
    switch (mode) {
      case "pos-points": {
        const point: Point = {
          x: Math.round((x / canvas!.width) * props.image!.bitmap.width),
          y: Math.round((y / canvas!.height) * props.image!.bitmap.height),
          positive: true,
        };
        const prompt = currentPrompt as SegmentAnythingPrompt;
        if (prompt.points === undefined) {
          prompt.points = [];
        }
        prompt.points.push(point);
        setCurrentPrompt(prompt);
        props.setPrompt(prompt);
        drawPrompt(prompt);
        setCurrentPoint(null);
        break;
      }
      case "neg-points": {
        const point: Point = {
          x: Math.round((x / canvas!.width) * props.image!.bitmap.width),
          y: Math.round((y / canvas!.height) * props.image!.bitmap.height),
          positive: false,
        };
        const prompt = currentPrompt as SegmentAnythingPrompt;
        if (prompt.points === undefined) {
          prompt.points = [];
        }
        prompt.points.push(point);
        setCurrentPrompt(prompt);
        props.setPrompt(prompt);
        drawPrompt(prompt);
        setCurrentPoint(null);
        break;
      }
      case "boxes": {
        if (currentPoint === null) return;
        let left = currentPoint.x;
        let right = x;
        if (x < currentPoint.x) {
          left = x;
          right = currentPoint.x;
        }
        let top = currentPoint.y;
        let bottom = y;
        if (y < currentPoint.y) {
          top = y;
          bottom = currentPoint.y;
        }
        const topLeft: Point = {
          x: Math.round((left / canvas!.width) * props.image!.bitmap.width),
          y: Math.round((top / canvas!.height) * props.image!.bitmap.height),
          positive: true,
        };
        const bottomRight: Point = {
          x: Math.round((right / canvas!.width) * props.image!.bitmap.width),
          y: Math.round((bottom / canvas!.height) * props.image!.bitmap.height),
          positive: true,
        };
        const prompt = currentPrompt as SegmentAnythingPrompt;
        if (prompt.boxes === undefined) {
          prompt.boxes = [];
        }
        prompt.boxes.push([topLeft, bottomRight]);
        setCurrentPrompt(prompt);
        props.setPrompt(prompt);
        drawPrompt(prompt);
        setCurrentPoint(null);
        break;
      }
    }
  };

  const drawPrompt = (prompt: SegmentAnythingPrompt, clear = true) => {
    if (currentPrompt === undefined) return;
    if (clear) {
      clearCanvas();
    }
    const canvas = canvasRef.current;
    const ctx = canvas!.getContext("2d");
    ctx!.lineWidth = 4;
    if (prompt.points !== undefined) {
      for (const point of prompt.points) {
        const x = Math.round((point.x / props.image!.bitmap.width) * canvas!.width);
        const y = Math.round((point.y / props.image!.bitmap.height) * canvas!.height);
        ctx!.beginPath();
        ctx!.arc(x, y, 3, 0, 2 * Math.PI);
        ctx!.fillStyle = point.positive ? "#41f50a" : "#f5190a";
        ctx!.fill();
        ctx!.strokeStyle = point.positive ? "#41f50a" : "#f5190a";
        ctx!.stroke();
      }
    }
    if (prompt.boxes !== undefined) {
      for (const box of prompt.boxes) {
        const topLeft = box[0];
        const bottomRight = box[1];
        ctx!.beginPath();
        ctx!.rect(
          Math.round((topLeft.x / props.image!.bitmap.width) * canvas!.width),
          Math.round((topLeft.y / props.image!.bitmap.height) * canvas!.height),
          Math.round((bottomRight.x / props.image!.bitmap.width) * canvas!.width) -
            Math.round((topLeft.x / props.image!.bitmap.width) * canvas!.width),
          Math.round((bottomRight.y / props.image!.bitmap.height) * canvas!.height) -
            Math.round((topLeft.y / props.image!.bitmap.height) * canvas!.height),
        );
        ctx!.strokeStyle = "#0a50f5";
        ctx!.stroke();
      }
    }
  };

  return (
    <>
      {props.image !== null && (
        <>
          <div ref={canvasContainerRef} style={{ position: "relative", height: displayDims.height }}>
            <img
              ref={imageRef}
              width={displayDims.width}
              height={displayDims.height}
              style={{ position: "absolute", top: 0, left: displayDims.left }}
            />
            <canvas
              ref={canvasRef}
              width={displayDims.width}
              height={displayDims.height}
              style={{ position: "absolute", top: 0, left: displayDims.left }}
              onClick={handleClick}
            />
          </div>
          <hr />
          <div className="row">
            <div className="col-md-3 col-sm-12">
              <button
                className={mode === "pos-points" ? "btn btn-success" : "btn btn-light"}
                style={{ width: "100%" }}
                onClick={() => setMode("pos-points")}
                disabled={props.processing}
              >
                Foreground
              </button>
            </div>
            <div className="col-md-3 col-sm-12">
              <button
                className={mode === "neg-points" ? "btn btn-success" : "btn btn-light"}
                style={{ width: "100%" }}
                onClick={() => setMode("neg-points")}
                disabled={props.processing}
              >
                Background
              </button>
            </div>
            <div className="col-md-3 col-sm-12">
              <button
                className={mode === "boxes" ? "btn btn-success" : "btn btn-light"}
                style={{ width: "100%" }}
                onClick={() => setMode("boxes")}
                disabled={props.processing}
              >
                Boxes
              </button>
            </div>
            <div className="col-md-3 col-sm-12">
              <button
                className="btn btn-danger"
                style={{ width: "100%" }}
                onClick={() => clearPrompt()}
                disabled={props.processing}
              >
                Clear
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}
