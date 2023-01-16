import Background from '../components/Background'

import { useState, useEffect, useRef } from 'react'
import { images, setImageLoaded } from '../util/data'

import { useSpring, animated as a } from '@react-spring/web'

import { useRouter } from 'next/router'

import { useSession, signIn, signOut } from 'next-auth/react'

import { useForm } from 'react-hook-form'
import BarLoader from 'react-spinners/BarLoader'

import { trpc } from '../util/trpc'

const Index = () => {
  const { data: session, status } = useSession()

  const [loadedImages, setLoadedImages] = useState<string[]>([])
  const router = useRouter()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm()

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  const [errorNotification, setErrorNotification] = useState('')

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
    opacity: 0,
  }))

  const [contentSpring, setContentSpring] = useSpring(() => ({
    scale: 0.8,
    opacity: 0,
  }))

  const endpointData = trpc.redstones.useQuery()

  const reactorData = trpc.brReactor.useQuery()

  useEffect(() => {
    const { error, callbackUrl } = router.query
    if (error) {
      switch (error) {
        case 'CredentialsSignin':
          setErrorNotification('Invalid username or password')
          break
        case 'OAuthAccountNotLinked':
          setErrorNotification('You must sign in with your email address')
          break
        case 'EmailCreateAccount':
          setErrorNotification('You must sign in with your email address')
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
  }, [
    loadedImages,
    setBackgroundSpring,
    setLoginSpring,
    setContentSpring,
    session,
  ])

  useEffect(() => {
    if (session) {
      setLoginSpring.start({
        opacity: 0,
        scale: 1.2,
      })
    }
  }, [session, setLoginSpring])

  useEffect(() => {
    if (loggingIn) {
      signIn('credentials', {
        username: username,
        password: password,
        callbackUrl: '/',
        redirect: false,
      }).then(res => {
        if (res && res.ok) {
          setLoggingIn(false)
        } else {
          setErrorNotification('Invalid username or password')
          setLoggingIn(false)
        }
        setUsername('')
        setPassword('')
      })
    }
  }, [loggingIn, username, password])

  const onSubmit = (data: any) => {
    setUsername(data.username)
    setPassword(data.password)
    setLoggingIn(true)
  }

  return (
    <>
      <div className="fixed w-full h-full object-cover bg-zinc-900" />
      <a.div style={backgroundSpring}>
        <Background
          setReady={() => setImageLoaded(images[0], setLoadedImages)}
        />
      </a.div>
      {showLogin && (
        <a.div
          style={loginSpring}
          className="w-[400px] h-[400px] fixed bg-zinc-900/75 rounded-xl left-0 right-0 top-20 m-auto"
        >
          {showLogin && (
            <div className="text-center m-4">
              <h1 className="text-4xl font-bold text-white">
                Minecraft Remote (work in progress!)
              </h1>
              <form onSubmit={handleSubmit(onSubmit)}>
                <input
                  {...register('username', { required: true })}
                  className="text-zinc-300 bg-zinc-900/50 p-2 m-2"
                  placeholder="Username"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                />
                <input
                  {...register('password', { required: true })}
                  className="text-zinc-300 bg-zinc-900/50 p-2 m-2"
                  placeholder="Password"
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                />

                {errorNotification.length > 0 && (
                  <p className="rounded-xl text-zinc-300">
                    {errorNotification}
                  </p>
                )}
                <div>
                  <button
                    type="submit"
                    className="text-zinc-300 bg-zinc-900/50 p-2 m-2"
                  >
                    {loggingIn ? <BarLoader color="#36d7b7" /> : 'Login'}
                  </button>
                </div>
              </form>
            </div>
          )}
        </a.div>
      )}
      {showContent && (
        <a.div
          style={contentSpring}
          className="w-[600px] portrait:w-[80%] h-82 fixed bg-zinc-900/75 rounded-xl left-0 right-0 top-20 m-auto"
        >
          <div className="text-center m-4">
            <h1 className="text-4xl font-bold text-white">
              Minecraft Remote (work in progress!)
            </h1>
            <p className="text-zinc-100">You&apos;re logged in!</p>
            {endpointData.data &&
              endpointData.data.map(endpoint => {
                return (
                  <div key={endpoint.id} className="text-zinc-100">
                    <p>
                      <b>{endpoint.name}</b>
                    </p>
                  </div>
                )
              })}
            {endpointData.data && endpointData.data.length === 0 && (
              <p className="text-zinc-100">No endpoints found</p>
            )}
            {reactorData.data &&
              reactorData.data.map(reactor => {
                return (
                  <div key={reactor.id} className="text-zinc-100">
                    <p>
                      <button
                        onClick={() => {
                          router.push(`/reactor/${reactor.id}`)
                        }}
                      >
                        <b>{reactor.name}</b>
                      </button>
                    </p>
                  </div>
                )
              })}
            {/*renderGraph && <GraphComponent />*/}
            <button
              onClick={() => signOut({ redirect: false })}
              className="text-zinc-300 bg-zinc-900/50 p-2 m-2"
            >
              Logout
            </button>
          </div>
        </a.div>
      )}
    </>
  )
}

export default Index
