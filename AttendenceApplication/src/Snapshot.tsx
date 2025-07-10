import { useEffect, useRef } from "react";
import "./Webcam.css";

interface Props {
    webcamReference: React.RefObject<HTMLVideoElement|null>
    shown: boolean
}

export function downloadImageOfCanvas(canvas: HTMLCanvasElement, path: string){
    const url = canvas.toDataURL("image/jpeg");
    localStorage.setItem("webcam-data", url);
}

export default function Snapshot({ webcamReference, shown } : Props){
    
    const canvasRef = useRef<HTMLCanvasElement|null>(null);
    
    useEffect(()=>{
        if(!(canvasRef.current && webcamReference && webcamReference.current)) return;

        canvasRef.current.width = webcamReference.current.videoWidth;
        canvasRef.current.height = webcamReference.current.videoHeight;
        const ctx = canvasRef.current.getContext("2d");
        if(ctx) ctx.drawImage(webcamReference.current, 0,0, canvasRef.current.width, canvasRef.current.height);
        
        downloadImageOfCanvas(canvasRef.current, "/webcamData/image.jpeg");

    }, [ webcamReference.current ])

    return (<canvas id="frame" ref={canvasRef} style={{display: shown ? "initial" : "none"}}/>);
}