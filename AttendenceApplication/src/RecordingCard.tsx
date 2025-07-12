import { useRef, useState } from "react";
import "./RecordingCard.css";
import Webcam from "./Webcam";
import convertWebMtoMP4 from "./webmtomp4";
const timeForRecording: number = 10;

interface formData {
    name: string;
}

const initialFormData: formData = {
    name: ""
}

interface Props {
    checkIn: Function,
    resetWebcam: Function
}


export default function RecordingCard({checkIn, resetWebcam} : Props){
    
    const webcamReference = useRef<HTMLVideoElement|null>(null);
    const [useFormData, setFormData] = useState<formData>({
        name: ""
    });
    const seconds = useRef<number>(timeForRecording);
    const [useMsg, setMsg] = useState<string>("");
    const [ useDebounce, setDebounce ] = useState<boolean>(false);


    function handleChange(event: React.ChangeEvent<HTMLInputElement>){
        const target = event.target;
        
        setFormData({
            ...useFormData,
            [target.name]: target.name == "age" ? Math.min(Number.parseInt(target.value), 100) : target.value
        })
    }

    function recordMedia(time: number){
        resetWebcam();
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
                setMsg(data["message"])
                setTimeout(()=>{
                    checkIn(uploadData.get("name"));
                }, 1500);
            })
        }

        recorder.start();

        const intervalID = setInterval(()=>{
            seconds.current--;
            console.log(seconds.current);
            setMsg(`Please look at the camera for ${seconds.current} more seconds.`);
        },1000)

        setTimeout(()=>{
            clearInterval(intervalID);
            recorder.stop();
            setMsg("Uploading video to server...")
            setDebounce(false);
        }, time*1000)
    }

    return (<div className="recordingCard">
            <Webcam referenceProp={webcamReference}/>
            <p>{useMsg}</p>
            <label htmlFor="name">Name:</label>
            <input name="name" type="text" value={useFormData.name} placeholder={initialFormData.name} onChange={handleChange}/>
            
            <button onClick={()=>{
                if(useDebounce) return;
                if(useFormData.name == ""){
                    setMsg("Please input a name.");
                    return;
                }
                setDebounce(true);
                recordMedia(timeForRecording)
            }}>Record</button>
        </div>);
}