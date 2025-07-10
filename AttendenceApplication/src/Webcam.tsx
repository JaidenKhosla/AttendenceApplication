import { useState, useRef, useEffect } from "react";
import "./Webcam.css"

interface Props {
    referenceProp: React.RefObject<HTMLVideoElement | null> | undefined;
    shown?: boolean | undefined;
}

export default function Webcam({ referenceProp, shown }: Props){

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

    return <div className="Webcam" style={{display: shown || shown == undefined ? "initial" : "none"}}>
        {videoStarted ? <video id="frame" ref={(component)=>{streamRef.current = component; if(referenceProp) referenceProp.current = component;}} autoPlay playsInline controls={false}></video> : <div id="frame">Video is not enabled!</div>}
    </div>
}