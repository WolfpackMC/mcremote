import Background from "../components/Background"

import { useState, useEffect } from "react"
import { images, queryUser, setImageLoaded } from "../util/data"

import { useSpring, animated as a } from "@react-spring/web"

import { Icon } from "@iconify/react"

const sessionExists = async (setLoginSpring: any, setContentSpring: any, setLoggedIn: any, setShowLogin: any) => {
  if (localStorage.getItem("session_id")) {
    const res = await fetch("/api/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        session_id: localStorage.getItem("session_id"),
      }),
    })
    const data = await res.json()
  
    if (data.session) {
      setLoginSpring.start({
        opacity: 0,
      })
      setContentSpring.start({
        opacity: 1,
        scale: 1,
      })
      setLoggedIn(true)
    } else {
      setLoginSpring.start({
        opacity: 1,
        scale: 1,
      })

      setShowLogin(true)
    }
  } else {
    setLoginSpring.start({
      opacity: 1,
      scale: 1,
    })

    setShowLogin(true)
  }
}

const pollDetails = async (setRemoteData: any) => {
  const res = await fetch("/api/poll", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "session_id": localStorage.getItem("session_id") || ""
    }
  })
  const data = await res.json()
  setRemoteData(data)
}

const setRedstoneButton = async (num: number, setRemoteData: any) => {
  const res = await fetch("/api/set", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      redstone: num,
      session_id: localStorage.getItem("session_id"),
    })
  })
  if (res.ok) {
    const data = await res.json()
    // todo: update state here
  }
}

const Index = () => {
  const [loadedImages, setLoadedImages] = useState<string[]>([])

  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")

  const [errorNotification, setErrorNotification] = useState("")

  const [remoteData, setRemoteData] = useState<{ redstone_1: {state: boolean, name: string} }>(
    {
      redstone_1: {
        state: false,
        name: "Redstone 1"
      },
    }
  )

  const [loggingIn, setLoggingIn] = useState(false)

  const [loggedIn, setLoggedIn] = useState(false)

  const [showLogin, setShowLogin] = useState(false)

  const [requestingSignup, setRequestingSignup] = useState(false)

  const [requested, setRequested] = useState(false)

  const [backgroundSpring, setBackgroundSpring] = useSpring(() => ({
    scale: 1,
    opacity: 0,
  }))

  const [loginSpring, setLoginSpring] = useSpring(() => ({
    scale: 0.8,
    opacity: 0,
  }))

  const [contentSpring, setContentSpring] = useSpring(() => ({
    scale: 0.8,
    opacity: 0,
  }))

  useEffect(() => {
    for (const image of loadedImages) {
        if (image === images[0]) {
            setBackgroundSpring.start({
              opacity: 1,
            })

            sessionExists(setLoginSpring, setContentSpring, setLoggedIn, setShowLogin)
        }
    }
  }, [loadedImages])

  useEffect(() => {
    if (loggingIn) {
      queryUser(username, password, setErrorNotification, setLoggingIn, setLoggedIn, setLoginSpring, setContentSpring, setShowLogin)
    }
  }, [loggingIn])

  useEffect(() => {
    if (loggedIn) {
      const interval = setInterval(() => {
        pollDetails(setRemoteData)
      }, 500)
      return () => clearInterval(interval)
    }
  }, [loggedIn])

  return (
    <>
      <div className="fixed w-full h-full object-cover bg-zinc-900" />
      <a.div style={backgroundSpring}>
        <Background setReady={() => setImageLoaded(images[0], setLoadedImages)} />
      </a.div>
      {showLogin && <a.div style={loginSpring} className="w-[40%] portrait:w-[80%] h-60 fixed bg-zinc-900/75 rounded-xl left-0 right-0 top-20 m-auto">
        <div className="text-center m-4">
            <h1 className="text-4xl font-bold text-white">Minecraft Remote (work in progress!)</h1>
            <input disabled={loggingIn} value={username} onChange={(e) => setUsername(e.target.value)} className="w-42 rounded-lg bg-zinc-900/50 text-zinc-100 p-2 m-2" placeholder="Username" />
            <input disabled={loggingIn} type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-42 rounded-lg bg-zinc-900/50 text-zinc-100 p-2 m-2" placeholder="Password" />
            {errorNotification.length > 0 &&
                <p className="rounded-xl text-zinc-300">
                    {errorNotification}
                </p>
            }
            <button disabled={loggingIn} onClick={() => {
                if (username.length > 0 && password.length > 0) {
                    setLoggingIn(true)
                }
            }} className="w-42 rounded-lg bg-zinc-900/50 text-zinc-100 p-2 m-2">{loggingIn ? <Icon className="animate-spin" icon="fluent:spinner-ios-20-regular" /> : loggedIn ? "Whee!" : "Login"}</button>        </div>
      </a.div>}
      {loggedIn && <a.div style={contentSpring} className="w-[40%] portrait:w-[80%] h-48 fixed bg-zinc-900/75 rounded-xl left-0 right-0 top-20 m-auto">
        <div className="text-center m-4">
            <h1 className="text-4xl font-bold text-white">Minecraft Remote (work in progress!)</h1>
            <p className="text-zinc-100">You&apos;re logged in!</p>
            <button onClick={() => setRedstoneButton(1, setRemoteData)} className="text-zinc-300 bg-zinc-900/50 p-2 m-2">Redstone 1: {remoteData.redstone_1.state ? "On" : "Off"}</button>
        </div>
      </a.div>}
    </>
  )
}

export default Index