import { useRef, useState } from "react";
import "./RecordingCard.css";
import Webcam from "./Webcam";

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

    function handleChange(event: React.ChangeEvent<HTMLInputElement>){
         const target = event.target;

         setFormData({
            ...useFormData,
            [target.name]: target.name == "age" ? Math.min(Number.parseInt(target.value), 100) : target.value
         })
    }

    return (<div className="recordingCard">
            <Webcam referenceProp={webcamReference}/>
            
            <label htmlFor="name">Name:</label>
            <input name="name" type="text" value={useFormData.name} placeholder={initialFormData.name} onChange={handleChange}/>
            <label htmlFor="age">Age:</label>
            <input name="age" type="number" value={useFormData.age} min={1} step={1} max={100} placeholder={initialFormData.age.toString()} onChange={handleChange}/>
        </div>)
}