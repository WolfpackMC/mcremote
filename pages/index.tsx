import Background from "../components/Background"

import { useState, useEffect, useRef } from "react"
import { images, setImageLoaded } from "../util/data"

import { useSpring, animated as a } from "@react-spring/web"

import { useRouter } from "next/router"
import dynamic from "next/dynamic"

import { createTRPCProxyClient, httpBatchLink } from '@trpc/client'

import type { AppRouter } from '../server/routers/_app'

const client = createTRPCProxyClient<AppRouter>({
  links: [
    httpBatchLink({
      url: '/api/trpc',
    }),
  ],
})

const GraphComponent = dynamic(() => import("../components/Graph"), { ssr: false, loading: () => <div>Loading...</div> })

import { useSession, signIn, signOut } from "next-auth/react"

import { useForm } from "react-hook-form"
import BarLoader from "react-spinners/BarLoader"

const pollDetails = async (setRemoteData: any) => {
  try {
    const data = await client.poll.query()
    setRemoteData(data)
  } catch (e) {
    console.log(e)
  }
}

const setRedstoneButton = async (num: number, setRemoteData: any) => {
  const data: {} = await client.set.query({
    redstone: num,
  })
  console.log(data)
  setRemoteData(data)
}

const Index = () => {
  const [loadedImages, setLoadedImages] = useState<string[]>([])
  const router = useRouter()

  const {register, handleSubmit, formState: {errors}} = useForm()

  const { data: session, status } = useSession()

  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")

  const [errorNotification, setErrorNotification] = useState("")

  const [waiting, setWaiting] = useState({redstone_1: false})

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

  const [showContent, setShowContent] = useState(false)

  const [renderGraph, setRenderGraph] = useState(false)

  const [backgroundSpring, setBackgroundSpring] = useSpring(() => ({
    scale: 1,
    opacity: 0,
  }))

  const [loginSpring, setLoginSpring] = useSpring(() => ({
    scale: 0.8,
    opacity: 1,
  }))

  const [contentSpring, setContentSpring] = useSpring(() => ({
    scale: 0.8,
    opacity: 0,
  }))

  useEffect(() => {
    const { error, callbackUrl } = router.query
    if (error) {
      switch(error) {
        case "CredentialsSignin":
          setErrorNotification("Invalid username or password")
          break
        case "OAuthAccountNotLinked":
          setErrorNotification("You must sign in with your email address")
          break
        case "EmailCreateAccount":
          setErrorNotification("You must sign in with your email address")
          break
      }
    }

    if (error || callbackUrl) {
      setBackgroundSpring.set({
        opacity: 1,
      })
      setLoginSpring.set({
        opacity: 1,
        scale: 1,
      })
    }
  }, [router.query, setBackgroundSpring, setLoginSpring])

  useEffect(() => {
    for (const image of loadedImages) {
        if (image === images[0]) {
            setBackgroundSpring.start({
              opacity: 1,
            })

            if (session) {
              setLoginSpring.start({
                opacity: 0,
                scale: 1.2,
              })
              setShowContent(true)
              setContentSpring.start({
                opacity: 1,
                scale: 1,
                onRest: () => {
                  setRenderGraph(true)
                },
              })
              setLoggedIn(true)
            } else {
              setLoginSpring.start({
                opacity: 1,
                scale: 1,
              })

              setContentSpring.start({
                opacity: 0,
                scale: 0.8,
                onRest: () => {
                  setShowContent(false)
                  setRenderGraph(false)
                },
              })

              setLoggedIn(false)
        
              setShowLogin(true)
            }
        }
    }
  }, [loadedImages, setBackgroundSpring, setLoginSpring, setContentSpring, session])

  useEffect(() => {
    if (session) {
      setLoginSpring.start({
        opacity: 0,
        scale: 1.2,
      })
    }
  }, [session, setLoginSpring])

  useEffect(() => {
    setLoginSpring.start({
      opacity: 1,
      scale: 1,
    })
  }, [setLoginSpring])

  useEffect(() => {
    if (loggingIn) {
      signIn("credentials", {
        username: username,
        password: password,
        callbackUrl: "/",
        redirect: false,
      }).then((res) => {
        if (res && res.ok) {
          setLoggingIn(false)
        } else {
          setErrorNotification("Invalid username or password")
          setLoggingIn(false)
        }
        setUsername("")
        setPassword("")
      })
    }
  }, [loggingIn, username, password])

  useEffect(() => {
    if (loggedIn) {
      pollDetails(setRemoteData)

      const interval = setInterval(() => {
        pollDetails(setRemoteData)
      }, 500)


      return () => clearInterval(interval)
    }
  }, [loggedIn])

  const onSubmit = (data: any) => {
    setUsername(data.username)
    setPassword(data.password)
    setLoggingIn(true)
  }

  return (
    <>
      <div className="fixed w-full h-full object-cover bg-zinc-900" />
      <a.div style={backgroundSpring}>
        <Background setReady={() => setImageLoaded(images[0], setLoadedImages)} />
      </a.div>
      {showLogin && <a.div style={loginSpring} className="w-[400px] h-[400px] fixed bg-zinc-900/75 rounded-xl left-0 right-0 top-20 m-auto">
      {showLogin &&
        <div className="text-center m-4">
          <h1 className="text-4xl font-bold text-white">Minecraft Remote (work in progress!)</h1>
          <form onSubmit={handleSubmit(onSubmit)}>
              <input {...register("username", {required: true})} className="text-zinc-300 bg-zinc-900/50 p-2 m-2" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
              <input {...register("password", {required: true})} className="text-zinc-300 bg-zinc-900/50 p-2 m-2" placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
              
              
              {errorNotification.length > 0 &&
              <p className="rounded-xl text-zinc-300">
                  {errorNotification}
              </p>
              }
              <div>
                <button type="submit" className="text-zinc-300 bg-zinc-900/50 p-2 m-2">{loggingIn ? <BarLoader color="#36d7b7" /> : "Login"}</button>
              </div>
          </form>
        </div>
      }
      </a.div>}
      {showContent && <a.div style={contentSpring} className="w-[600px] portrait:w-[80%] h-82 fixed bg-zinc-900/75 rounded-xl left-0 right-0 top-20 m-auto">
        <div className="text-center m-4">
            <h1 className="text-4xl font-bold text-white">Minecraft Remote (work in progress!)</h1>
            <p className="text-zinc-100">You&apos;re logged in!</p>
            {remoteData && <button onClick={() => {
              setWaiting({...waiting, redstone_1: true})
              setRedstoneButton(1, setRemoteData).then(() => {
                setWaiting({...waiting, redstone_1: false})
              })
            }} className="text-zinc-300 bg-zinc-900/50 p-2 m-2">Redstone 1: {!waiting.redstone_1 ? remoteData.redstone_1.state ? "On" : "Off" : <BarLoader />}</button>}
            {/*renderGraph && <GraphComponent />*/}
            <button onClick={() => signOut({redirect: false})} className="text-zinc-300 bg-zinc-900/50 p-2 m-2">Logout</button>
        </div>
      </a.div>}
    </>
  )
}

export default Index