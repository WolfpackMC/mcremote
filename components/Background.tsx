import { Dispatch, SetStateAction, useContext, useEffect } from "react"
import { useSpring, animated as a } from "@react-spring/web"

import Image from "next/image"

import { images } from "../util/data"

const timestamp = () => Math.floor(Date.now())

const x = () => Math.cos(timestamp() / 5000) * 100
const y = () => Math.sin(timestamp() / 5000) * 100

const Background = ({ setReady }: { setReady: (image: string) => void }) => {

    const [backgroundImageSpring, setBackgroundImageSpring] = useSpring(() => ({
        scale: 1.5,
        x: 0,
        y: 0,
    }))

    useEffect(() => {
        setBackgroundImageSpring.set({
            x: x(),
            y: y(),
        })

        const interval = setInterval(() => {
            // get timestamp in seconds
            // rotate the background in a circular motion using sine and cosine
            setBackgroundImageSpring.start({
                x: x(),
                y: y(),
            })
        }, 10)

        const handleResize = () => {
            if (window.innerWidth < 768 || window.innerHeight < 768) {
                setBackgroundImageSpring.start({
                    scale: 5,
                })
            } else {
                setBackgroundImageSpring.start({
                    scale: 1.5,
                })
            }
        }

        window.addEventListener("resize", handleResize)

        return () => clearInterval(interval)
    }, [setBackgroundImageSpring])

    return (
        <>
            <a.div className="fixed w-full h-full object-cover" style={backgroundImageSpring}>
                <Image onLoad={() => setReady(images[0])} src={images[0]} alt="gilneas" width="1920" height="1080" className="fixed object-cover bg-cover w-screen h-screen" quality="100" priority />
                <div className="w-full h-full fixed bg-zinc-900 opacity-50" />
            </a.div>
        </>
    )
}

export default Background
