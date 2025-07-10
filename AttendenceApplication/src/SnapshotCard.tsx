import "./SnapshotCard.css";
import WebcamIcon from "./assets/images/CameraIcon.webp";
import Webcam from "./Webcam";
import { useEffect, useRef, useState } from "react";
import Snapshot from "./Snapshot";

interface JSONRequest {
    name: string
    distance: number
}

export type setResult = React.Dispatch<React.SetStateAction<JSONRequest | undefined>>

export default function SnapshotCard(){

    const webcamReference = useRef<HTMLVideoElement | null>(null);
    const [ useDebounce, setDebounce ] = useState<boolean>(false);
    const [ useMsg, setMsg ] = useState<[string, string]>(["Awaiting Photo...", "normal"]);
    const [ useSnapshot, setSnapshot] = useState<boolean>(false);

    const [ useResult, setResult ] = useState<JSONRequest>()

    useEffect(()=>{
        if(useResult)
            setMsg([`You are ${useResult["name"]}.`, 'normal'])
    }, [ useResult ])

    return (<div className="SnapshotCard">
        
        <Webcam referenceProp={webcamReference} shown={!useSnapshot}/>
        <Snapshot webcamReference={webcamReference} shown={useSnapshot} setResult={setResult}/>
        
        <p className={useMsg[1]}>{useMsg[0]}</p>

        {useResult && <button>Not You?</button>}
        
        <button className="snapBTN" onClick={
            ()=>{
                if(useDebounce) return;
                setDebounce(true);
                
                setMsg(["Taking Picture...", "normal"]);

                const audio = new Audio("/audio/cameraClick.mp3");
                audio.play()


                setSnapshot(true)
                setMsg(["Sending picture to server...", "normal "])
            }
        }></button>
    </div>);

}
