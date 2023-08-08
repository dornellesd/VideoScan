'use client'
import React, { useState, useEffect, useRef } from "react";
import { Box, Button, Typography } from "@mui/material";

const VideoRecord: React.FC = () => {
    const [isRecording, setIsRecording] = useState(false);
    const [countdown, setCountdown] = useState<number>(5);
    const [uploadedFiles, setUploadedFiles] = useState<Blob[]>([]);
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (files) {
            const newFiles = Array.from(files);
            setUploadedFiles(prevFiles => [...prevFiles, ...newFiles]);
        }
    };


    const handleStartRecording = () => {
        if (videoRef.current) {
            navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
                // @ts-ignore
                videoRef.current.srcObject = stream;
                setIsRecording(true);
                mediaRecorderRef.current = new MediaRecorder(stream);
                chunksRef.current = [];

                mediaRecorderRef.current.ondataavailable = (event) => {
                    if (event.data.size > 0) {
                        chunksRef.current.push(event.data);
                    }
                };

                mediaRecorderRef.current.onstop = () => {
                    const blob = new Blob(chunksRef.current, { type: 'video/webm' });
                    setUploadedFiles(prevFiles => [...prevFiles, blob]);
                };

                mediaRecorderRef.current.start();
            }).catch((error) => {
                console.error('Error accessing camera:', error);
            });
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            if (videoRef.current && videoRef.current.srcObject) {
                const stream = videoRef.current.srcObject as MediaStream;
                stream.getTracks().forEach(track => track.stop()); // Stop all tracks in the stream
                videoRef.current.srcObject = null; // Clear the srcObject
            }
        }
    };

    useEffect(() => {
        let countdownInterval: NodeJS.Timeout | null = null;

        if (isRecording && countdown > 0) {
            countdownInterval = setInterval(() => {
                setCountdown(prevCountdown => prevCountdown - 1);
            }, 1000);
        } else if (countdown === 0 && isRecording) {
            handleStartRecording();
        }

        return () => {
            if (countdownInterval) {
                clearInterval(countdownInterval);
            }
        };
    }, [isRecording, countdown]);

    useEffect(() => {
        if (videoRef.current) {
            navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((stream) => {
                videoRef.current!.srcObject = stream;
                videoRef.current!.play();
            });
        }
    }, []);

    return (
        <Box sx={{ display: 'grid', flex: 1, height: '100%', width: '100%', gap: { xs: '16px', sm: '32px'}, alignItems: 'center', justifyContent: 'center', paddingY: '24px' }}>
            {isRecording ? (
                <Box sx={{ width: { xs: '90svw', sm: '800px' }, minHeight: '450px', height: 'auto', position: 'relative' }}>
                    <Box sx={{ color: 'red', width: { xs: '90svw', sm: '800px' }, minHeight: '450px', height: 'auto', border: '1px solid gray', borderRadius: '6px', display: 'flex', alignItems: 'center' }}>
                        <video ref={videoRef} width="100%" height="100%" autoPlay playsInline muted />
                    </Box>
                    {countdown > 0 && (<Box sx={{ color: 'red', width: { xs: '90svw', sm: '800px' }, height: '450px', border: '1px solid gray', borderRadius: '6px', position: 'absolute', top: 0, left: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Typography>{countdown}</Typography>
                    </Box>)}
                    <Button onClick={stopRecording}>Stop Recording</Button>
                </Box>
            ) : (
                <Box sx={{ display: { xs: 'grid', sm: 'flex' }, height: { xs: '300px', sm: '450px'}, width: '100%', alignItems: 'center', justifyContent: 'center'}}>
                    <Box sx={{ width: { xs: '90svw', sm: '450px' }, height: '100%', color: 'black', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <label htmlFor="file-upload" style={{ padding: '16px', border: '1px solid gray', borderRadius: '6px', color: 'black', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                            <input type="file" id="file-upload" style={{ display: 'none' }} onChange={handleFileUpload} accept="video/*" />
                            Upload Video
                        </label>
                    </Box>
                    <Box sx={{ width: { xs: '90svw', sm: '1px' }, height: {xs: '1px', sm: '100%'}, backgroundColor: 'gray' }}/>
                    <Box sx={{ width: { xs: '90svw', sm: '450px' }, height: '100%', borderRadius: '6px', color: 'black', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Button onClick={() => setIsRecording(true)} sx={{ textTransform: 'none', padding: '16px', border: '1px solid blue', fontSize: '16px' }}>Record Video</Button>
                    </Box>
                </Box>
            )}

            <Box sx={{ display: isRecording ? 'none' : 'flex', gap: '16px',
                overflowX: 'auto',
                '::-webkit-scrollbar': {
                display: 'none'
            } }}>
                {uploadedFiles.map((file, index) => (
                    <Box key={index} sx={{ display: 'grid', gap: '8px' }}>
                        {/* Thumbnail */}
                        <Box sx={{ height: 'auto', width: { xs: '150px', sm: '300px' } }}>
                            <video src={URL.createObjectURL(file)} width="100%" height="100%" controls />
                        </Box>
                        <Box sx={{ display: 'grid', gap: '8px', color: 'black' }}>
                            <Typography>{file.name}</Typography>
                            <Typography>Size: {(file.size / 1048576).toFixed(2)} MB</Typography>
                            <Typography>Type: {file.type}</Typography>
                        </Box>
                    </Box>
                ))}
            </Box>
        </Box>
    )
}

export default VideoRecord;
