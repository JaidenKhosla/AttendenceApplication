import webmToMp4 from "webm-to-mp4";

export default async function convertWebMtoMP4(webmBlob: Blob){
    
    const arrayBuffer = await webmBlob.arrayBuffer();

    const uint8Array = new Uint8Array(arrayBuffer);

    const mp4uint8Array = webmToMp4(uint8Array);
    
    return new Blob([mp4uint8Array],{type: "video/mp4"})
}
