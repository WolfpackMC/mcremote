import Background from "../components/Background"

import { useSpring, animated as a } from "@react-spring/web"

import { useState, useEffect } from "react"

import { images, setImageLoaded } from "../util/data"


const LoginPage = () => {
    const [loadedImages, setLoadedImages] = useState<string[]>([])

    const [backgroundSpring, setBackgroundSpring] = useSpring(() => ({
        scale: 1,
        opacity: 0,
    }))

    useEffect(() => {
        for (const image of loadedImages) {
            if (image === images[0]) {
                setBackgroundSpring.start({
                    opacity: 1,
                })
            }
        }
    }, [loadedImages, setBackgroundSpring])
    
    return (
        <>
            <div className="fixed w-full h-full object-cover bg-zinc-900" />
            <a.div style={backgroundSpring}>
                <Background setReady={() => setImageLoaded(images[0], setLoadedImages)} />
            </a.div>
        </>
    )
}

export default LoginPage
