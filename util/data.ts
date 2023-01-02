import { SpringRef } from "@react-spring/web"
import { Dispatch, SetStateAction } from "react"

export const images = [
    "https://db17gxef1g90a.cloudfront.net/img/1_blur.png",
    "https://avatars.githubusercontent.com/u/9144208?s=460&u=3d2e3c8d0d8f8b8f8f8f8f8f8f8f8f8f8f8f8f8f&v=4"
]

export const setImageLoaded = (image: string, setLoadedImages: Dispatch<SetStateAction<string[]>>) => {
    setLoadedImages((loadedImages) => [...loadedImages, image])
}
