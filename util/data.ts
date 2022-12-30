import { SpringRef } from "@react-spring/web"
import { Dispatch, SetStateAction } from "react"

export const images = [
    "https://db17gxef1g90a.cloudfront.net/img/1_blur.png",
    "https://avatars.githubusercontent.com/u/9144208?s=460&u=3d2e3c8d0d8f8b8f8f8f8f8f8f8f8f8f8f8f8f8f&v=4"
]

export const setImageLoaded = (image: string, setLoadedImages: Dispatch<SetStateAction<string[]>>) => {
    setLoadedImages((loadedImages) => [...loadedImages, image])
}

export const queryUser = async (user: string, pass: string, setErrorNotification: Dispatch<SetStateAction<string>>, setLoggingIn: Dispatch<SetStateAction<boolean>>, setLoggedIn: Dispatch<SetStateAction<boolean>>, setLoginSpring: SpringRef<{opacity: number, scale: number}>, setContentSpring: SpringRef<{opacity: number, scale: number}>, setShowLogin: Dispatch<SetStateAction<boolean>>) => {
    const data = await fetch("/api/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            username: user,
            password: pass,
        }),
    })

    if (data.status === 404) {
        setErrorNotification("User not found")
        setLoggingIn(false)
    }

    if (data.status === 401) {
        setErrorNotification("Incorrect password")
        setLoggingIn(false)
    }

    if (data.status === 200) {
        setErrorNotification("")
        setLoggingIn(false)
        setLoggedIn(true)
        setLoginSpring.start({ opacity: 0, scale: 1.2, onRest: () => {
            setShowLogin(false)
        } })
        setContentSpring.start({ opacity: 1, scale: 1 })
        window.localStorage.setItem("session_id", (await data.json()).session)
    }
}
