import "./SnapshotCard.css";
import WebcamIcon from "./assets/images/CameraIcon.webp";
import Webcam from "./Webcam";
import { useRef, useState } from "react";
import Snapshot from "./Snapshot";

export default function SnapshotCard(){

    const webcamReference = useRef<HTMLVideoElement | null>(null);
    const [ useDebounce, setDebounce ] = useState<boolean>(false);
    const [ useMsg, setMsg ] = useState<[string, string]>(["Awaiting Photo...", "normal"]);
    const [ useSnapshot, setSnapshot] = useState<boolean>(false);

    return (<div className="SnapshotCard">
        
        <Webcam referenceProp={webcamReference} shown={!useSnapshot}/>
        <Snapshot webcamReference={webcamReference} shown={useSnapshot}/>
        
        <p className={useMsg[1]}>{useMsg[0]}</p>
        
        <button onClick={
            ()=>{
                if(useDebounce) return;
                setDebounce(true);
                
                setMsg(["Taking Picture...", "normal"]);

                const audio = new Audio("/audio/cameraClick.mp3");
                audio.play()

                setSnapshot(true)
            }
        }></button>
    </div>);

}
