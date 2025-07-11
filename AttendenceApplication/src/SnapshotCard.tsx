import "./SnapshotCard.css";
import WebcamIcon from "./assets/images/CameraIcon.webp";
import Webcam from "./Webcam";
import { useEffect, useRef, useState } from "react";
import RecordingCard from "./RecordingCard";
import Snapshot from "./Snapshot";

interface JSONRequest {
    name: string
    distance: number
}

const waitingMSG: [string, string] = ["Awaiting Photo...","normal"]

export type setResult = React.Dispatch<React.SetStateAction<JSONRequest | undefined>>

export default function SnapshotCard(){

    const webcamReference = useRef<HTMLVideoElement | null>(null);
    const [ useDebounce, setDebounce ] = useState<boolean>(false);
    const [ useMsg, setMsg ] = useState<[string, string]>(["Awaiting Photo...", "normal"]);
    const [ useSnapshot, setSnapshot] = useState<boolean>(false);
    const [ useResult, setResult ] = useState<JSONRequest | undefined>();
    const [ useDisplayRecordingCard, setDisplayRecordingCard ] = useState<boolean>(false);

    useEffect(()=>{
        if(useResult && useResult.name != "Unknown")
            setMsg([`You are ${useResult["name"]}.`, 'normal'])
        else if(useResult){
            setMsg(["Unknown. Gathering results...", "normal"]);
            setDisplayRecordingCard(true);
            
        }
    }, [ useResult ])

    function reset(){
        setResult(undefined);
        setMsg(waitingMSG);
        setDebounce(false);
        setSnapshot(false);
        setDisplayRecordingCard(false);
    }

    function checkIn(name?: string){

        if(!name) name = useResult?.name;

        //checkin logic for finding class and stuff
        //this is a mock database
        if(useResult?.name == "Unknown") return;
        setDisplayRecordingCard(false);
        const attendingClass = ["class1", "class2"][0];
        setMsg([`We are checking you into ${attendingClass}, ${name}`, "normal"]);
        setTimeout(reset, 2000);

    }

    return (<><div className="SnapshotCard" style={{display: !useDisplayRecordingCard ? "flex" : "none"}}>
        
        <Webcam referenceProp={webcamReference} shown={!useSnapshot}/>
        <Snapshot webcamReference={webcamReference} shown={useSnapshot} setResult={setResult}/>
        
        <p className={useMsg[1]}>{useMsg[0]}</p>

        {useResult && <button onClick={()=>setDisplayRecordingCard(true)}>Not You?</button>}
        {useResult && <button onClick={()=>checkIn()}>That's Me</button>}

        
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
    </div>
    <div style={{display: useDisplayRecordingCard ? "initial" : "none"}}>
        <RecordingCard checkIn={checkIn}/>
    </div>
    </>);

}
