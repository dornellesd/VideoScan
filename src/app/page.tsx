import VideoRecord from "@/app/components/VideoRecord";
import {Typography} from "@mui/material";

export default function Home() {

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24 bg-white xs:gap-8 sm:gap-16">
        <Typography sx={{ textAlign: 'center' }} variant={'h2'} color={'blue'}>Video Scan</Typography>
        <VideoRecord />
    </main>
  )
}
