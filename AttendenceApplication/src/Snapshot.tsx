import { useEffect, useRef } from "react";
import "./Webcam.css";

import type { setResult } from "./SnapshotCard";

interface Props {
    webcamReference: React.RefObject<HTMLVideoElement|null>
    setResult: setResult,
    resetWebcam: Function,
    shown: boolean
}

export function downloadImageOfCanvas(canvas: HTMLCanvasElement, path: string, setResult: setResult){
    const url = canvas.toDataURL("image/jpeg");
   
    canvas.toBlob(async (blob) => {
        if (!blob) return;

        const formData = new FormData();
        formData.append("image", blob, "snapshot.png");

        const res = await fetch("http://127.0.0.1:5000/predict", {
            method: "POST",
            body: formData
        });

        if(!res.ok){
            console.error(`Error sending image to backend: ${res.status}`);
            return;
        }

        const response = await res.json();

        console.log(response);

        setResult(response);
    })

}

export default function Snapshot({ webcamReference, shown, setResult, resetWebcam } : Props){
    
    const canvasRef = useRef<HTMLCanvasElement|null>(null);
    
    useEffect(()=>{
        
        resetWebcam();

        if(!(canvasRef.current && webcamReference && webcamReference.current)) return;

        canvasRef.current.width = webcamReference.current.videoWidth;
        canvasRef.current.height = webcamReference.current.videoHeight;
        const ctx = canvasRef.current.getContext("2d");
        if(ctx) ctx.drawImage(webcamReference.current, 0,0, canvasRef.current.width, canvasRef.current.height);
        
        downloadImageOfCanvas(canvasRef.current, "/webcamData/image.jpeg", setResult);

    }, [ webcamReference.current ]);

    return (<canvas id="frame" ref={canvasRef} style={{display: shown ? "initial" : "none"}}/>);
}