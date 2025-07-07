import { useState, useRef, useEffect } from "react";
import "./Webcam.css"

export default function Webcam(){

    const streamRef = useRef<HTMLVideoElement>(null);
    const [ videoStarted, setVideoStarted ] = useState<boolean>(false);

    useEffect(()=>{
        navigator.mediaDevices.getUserMedia({ video: true })
        .then((stream)=>{
            setVideoStarted(true);
            if(streamRef.current)
                streamRef.current.srcObject = stream
        })
    }, [])

    return <div className="Webcam">
        {videoStarted ? <video id="frame" ref={streamRef} autoPlay playsInline controls={false}></video> : <div id="frame">Video is not enabled!</div>}
        <div id="frame">Video not enabled!</div>
    </div>
}