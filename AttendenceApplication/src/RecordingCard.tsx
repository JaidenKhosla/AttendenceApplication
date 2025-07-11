import { useRef, useState } from "react";
import "./RecordingCard.css";
import Webcam from "./Webcam";
import convertWebMtoMP4 from "./webmtomp4";
const timeForRecording: number = 10;

interface formData {
    name: string;
    age: number;
    date: Date;
    video: VideoFrame[]
}

const initialFormData: formData = {
    name: "John Doe",
    age: 15,
    date: new Date(),
    video: [],
}



export default function RecordingCard(){
    
    const webcamReference = useRef<HTMLVideoElement|null>(null);
    const [useFormData, setFormData] = useState<formData>(initialFormData);
    const [useSeconds, setSeconds] = useState<number>(timeForRecording);
    const [ useDebounce, setDebounce ] = useState<boolean>(false);


    function handleChange(event: React.ChangeEvent<HTMLInputElement>){
        const target = event.target;
        
        setFormData({
            ...useFormData,
            [target.name]: target.name == "age" ? Math.min(Number.parseInt(target.value), 100) : target.value
        })
    }
    
    function recordMedia(time: number){
        const chunks: Blob[] = []

        const stream = webcamReference.current?.srcObject as MediaStream;
        if(!stream) return;
        
        const recorder = new MediaRecorder(stream);
        recorder.ondataavailable = (e) => {
            if(e.data.size > 0)
                chunks.push(e.data);
        }

        recorder.onstop = async () => {
            const blob = new Blob(chunks, { type: "video/webm"});
            const mp4Blob = await convertWebMtoMP4(blob);
            
            const uploadData = new FormData();
            uploadData.append("video", mp4Blob, "recording.mp4")
            uploadData.append("name", useFormData.name)

            fetch("http://127.0.0.1:5000/train", {
                method: "POST",
                body: uploadData
            }).then((res)=>{
                if(!res.ok) console.error(`Upload failed with a ${res.status} code.`);
                return res.json();
            }).then((data)=>{
                console.log(data);
            })
        }

        recorder.start();

        const intervalID = setInterval(()=>{
            setSeconds((n)=>--n);
        },1000)

        setTimeout(()=>{
            clearInterval(intervalID);
            recorder.stop();
        }, time*1000)
    }

    return (<div className="recordingCard">
            <Webcam referenceProp={webcamReference}/>
            <p>Look at the camera for {useSeconds} more seconds.</p>
            <label htmlFor="name">Name:</label>
            <input name="name" type="text" value={useFormData.name} placeholder={initialFormData.name} onChange={handleChange}/>
            <label htmlFor="age">Age:</label>
            <input name="age" type="number" value={useFormData.age} min={1} step={1} max={100} placeholder={initialFormData.age.toString()} onChange={handleChange}/>
            <button onClick={()=>{
                if(useDebounce) return;
                setDebounce(true);
                recordMedia(timeForRecording)
            }}>Record</button>
        </div>)
}