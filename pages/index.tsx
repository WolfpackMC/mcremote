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
      url: 'http://localhost:3000/api/trpc',
    }),
  ],
})

const GraphComponent = dynamic(() => import("../components/Graph"), { ssr: false, loading: () => <div>Loading...</div> })

import { useSession, signIn, signOut } from "next-auth/react"

import { useForm } from "react-hook-form"
import BarLoader from "react-spinners/BarLoader"

const pollDetails = async (setRemoteData: any) => {
  const data = await client.poll.query()
  setRemoteData(data)
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
        }
    }
  }, [loadedImages, setBackgroundSpring, setLoginSpring, setContentSpring, session])

  useEffect(() => {
    if (loggingIn) {
      signIn("credentials", {
        username: username,
        password: password,
        options: {
          redirect: false,
        },
        callbackUrl: "/",
      })
    }
  }, [loggingIn, username, password])

  useEffect(() => {
    if (loggedIn) {
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
      {!session &&
        <div className="text-center m-4">
          <h1 className="text-4xl font-bold text-white">Minecraft Remote (work in progress!)</h1>
          <form onSubmit={handleSubmit(onSubmit)}>
              <input {...register("username", {required: true})} className="text-zinc-300 bg-zinc-900/50 p-2 m-2" placeholder="Username" />
              <input {...register("password", {required: true})} className="text-zinc-300 bg-zinc-900/50 p-2 m-2" placeholder="Password" type="password" />
              
              
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
      {loggedIn && <a.div style={contentSpring} className="w-[600px] portrait:w-[80%] h-82 fixed bg-zinc-900/75 rounded-xl left-0 right-0 top-20 m-auto">
        <div className="text-center m-4">
            <h1 className="text-4xl font-bold text-white">Minecraft Remote (work in progress!)</h1>
            <p className="text-zinc-100">You&apos;re logged in!</p>
            {remoteData && <button onClick={() => setRedstoneButton(1, setRemoteData)} className="text-zinc-300 bg-zinc-900/50 p-2 m-2">Redstone 1: {remoteData.redstone_1.state ? "On" : "Off"}</button>}
            <GraphComponent />
            <button onClick={() => signOut()} className="text-zinc-300 bg-zinc-900/50 p-2 m-2">Logout</button>
        </div>
      </a.div>}
    </>
  )
}

export default Index