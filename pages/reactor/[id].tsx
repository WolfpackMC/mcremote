import { BigReactor } from '@prisma/client'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'
import { useEffect, useState, useRef, Suspense } from 'react'
import ReactSpeedometer from 'react-d3-speedometer'
import { animated as a, useSpring, useTransition } from '@react-spring/web'
import Background from '../../components/Background'
import { trpc } from '../../util/trpc'
import { images, setImageLoaded } from '../../util/data'

import { Icon } from '@iconify/react'

import CountUp, { useCountUp } from 'react-countup'
import { useSession } from 'next-auth/react'

const GaugeComponent = dynamic(() => import('../../components/Gauge'), {
  ssr: false,
  loading: () => <div className="text-zinc-300">Loading...</div>,
})

const transitionSettings = {
  from: { opacity: 0, transform: 'translate3d(0, 20px, 0)' },
  enter: { opacity: 1, transform: 'translate3d(0, 0px, 0)' },
  leave: { opacity: 0, transform: 'translate3d(0, -20px, 0)' },
  config: {
    friction: 20,
  },
}

export default function Reactor() {
  const [loadedImages, setLoadedImages] = useState<string[]>([])

  const { data: session, status } = useSession()

  const [date, setDate] = useState(Date.now())

  const router = useRouter()
  const { id } = router.query

  console.log(id as string)

  const warningRef = useRef<HTMLDivElement>(null)

  const reactorData = trpc.brReactor.useQuery(parseInt(id as string))

  const brMutation = trpc.setBrState.useMutation()

  const [backgroundSpring, setBackgroundSpring] = useSpring(() => ({
    scale: 1,
    opacity: 0,
  }))

  const [colorSpring, setColorSpring] = useSpring(() => ({
    borderColor: 'rgba(0,0,0,200)',
    color: 'rgba(0,0,0,200)',
    config: {
      friction: 20,
    },
  }))

  const [warningSpring, setWarningSpring] = useSpring(() => ({
    scale: 0.8,
    opacity: 0,
    config: {
      friction: 20,
    },
  }))

  useEffect(() => {
    loadedImages.find(image => image === images[2]) &&
      setBackgroundSpring.start({
        scale: 1,
        opacity: 1,
      })
  }, [setBackgroundSpring, loadedImages])

  useEffect(() => {
    const reactor_poll_interval = setInterval(() => {
      if (!document.hidden) {
        reactorData.refetch()
        const time_since_update =
          (Date.now() -
            new Date(reactorData.data?.[0].updatedAt as string).getTime()) /
          1000
        setColorSpring.start({
          borderColor: reactorData.data?.[0].active
            ? time_since_update > 5
              ? 'rgba(100,50,50,1)'
              : 'rgba(100,200,100,200)'
            : 'rgba(100,50,50,200)',
          color: reactorData.data?.[0].active
            ? time_since_update > 5
              ? 'rgba(0,0,0,200)'
              : 'rgba(100,50,50,200)'
            : 'rgba(100,200,100,200)',
        })
        time_since_update > 5
          ? setWarningSpring.start({
              scale: 1,
              opacity: 1,
              onStart: () => {
                warningRef.current?.classList.remove('hidden')
              },
            })
          : setWarningSpring.start({
              scale: 0.8,
              opacity: 0,
              onRest: () => {
                warningRef.current?.classList.add('hidden')
              },
            })
        setDate(Date.now())
      }
    }, 400)
    return () => clearInterval(reactor_poll_interval)
  }, [reactorData, setColorSpring, setWarningSpring])

  if (!reactorData.data) {
    return (
      <>
        <div className="bg-zinc-900 w-full h-full fixed"></div>
        <div>No reactor found yet...</div>
      </>
    )
  }

  console.log(reactorData.data)

  return (
    <>
      <div className="bg-zinc-900 w-full h-full fixed"></div>
      <a.div style={backgroundSpring}>
        <Background
          setReady={() => setImageLoaded(images[2], setLoadedImages)}
        />
      </a.div>
      <div className="w-full h-full fixed">
        <a.div
          style={colorSpring}
          className={`bg-zinc-800/50 backdrop-blur-lg w-[80%] h-[80%] left-0 right-0 m-auto mt-4 rounded-xl border-2`}
        >
          {reactorData.data && (
            <div className="text-center">
              <h1 className="text-lg font-bold text-white">
                #{reactorData.data?.[0].id}: {reactorData.data?.[0].name}
              </h1>
              <p className="text-zinc-100">
                {reactorData.data?.[0].apiVersion}
              </p>
              {session && (
                <a.button
                  onClick={() => {
                    brMutation.mutateAsync({
                      id: parseInt(id as string),
                      state: !reactorData.data?.[0].active,
                    })
                  }}
                  style={colorSpring}
                >
                  <Icon icon="mdi:power" className="text-4xl" />
                </a.button>
              )}
              <a.p
                ref={warningRef}
                style={warningSpring}
                className="text-md text-zinc-300 hidden"
              >
                <Icon
                  className="text-amber-300 text-xl inline"
                  icon="material-symbols:warning"
                  inline={true}
                />
                The reactor has not been updated in the last 5 seconds.
              </a.p>
            </div>
          )}
          <div className="grid grid-flow-col justify-center gap-4 mb-4">
            <div className="mt-4">
              <p className="text-center text-zinc-300">
                <b>Energy Capacity</b>
              </p>
              <GaugeComponent
                value={
                  (reactorData.data?.[0].stored /
                    reactorData.data?.[0].capacity) *
                  100
                }
                width={150}
                height={100}
                minValue={0}
                maxValue={100}
                textColor={'#eeeeee'}
                startColor={'#991111'}
                endColor={'#119911'}
                segments={10}
                valueTextFontSize={'0px'}
              />
              <p className="text-center -mt-5 font-bold text-zinc-300">
                <CountUp
                  end={
                    (reactorData.data?.[0].stored /
                      reactorData.data?.[0].capacity) *
                    100
                  }
                  preserveValue={true}
                  suffix={'%'}
                  separator=","
                  decimals={2}
                />
              </p>
            </div>
            <div className="mt-4">
              <p className="text-center text-zinc-300">
                <b>Fuel Heat</b>
              </p>
              <GaugeComponent
                value={reactorData.data?.[0].fuelTemperature}
                width={150}
                height={100}
                minValue={0}
                maxValue={4000}
                textColor={'#eeeeee'}
                endColor={'#991111'}
                startColor={'#119911'}
                segments={10}
                valueTextFontSize={'0px'}
              />
              <p className="text-center -mt-5 font-bold text-zinc-300">
                <CountUp
                  end={reactorData.data?.[0].fuelTemperature}
                  preserveValue={true}
                  suffix={' K'}
                  separator=","
                  decimals={2}
                />
              </p>
            </div>
            <div className="mt-4">
              <p className="text-center text-zinc-300">
                <b>Case Heat</b>
              </p>
              <GaugeComponent
                value={reactorData.data?.[0].casingTemperature}
                width={150}
                height={100}
                minValue={0}
                maxValue={2000}
                textColor={'#eeeeee'}
                endColor={'#991111'}
                startColor={'#119911'}
                segments={10}
                valueTextFontSize={'0px'}
              />
              <p className="text-center -mt-5 font-bold text-zinc-300">
                <CountUp
                  end={reactorData.data?.[0].casingTemperature}
                  preserveValue={true}
                  suffix={' K'}
                  separator=","
                  decimals={2}
                />
              </p>
            </div>
            <div className="mt-4">
              <p className="text-center text-zinc-300">
                <b>Insertion Value</b>
              </p>
              <GaugeComponent
                value={reactorData.data?.[0].insertionValue}
                width={150}
                height={100}
                minValue={100}
                maxValue={0}
                textColor={'#eeeeee'}
                endColor={'#991111'}
                startColor={'#119911'}
                segments={10}
                valueTextFontSize={'0px'}
              />
              <p className="text-center -mt-5 font-bold text-zinc-300">
                <CountUp
                  end={reactorData.data?.[0].insertionValue}
                  preserveValue={true}
                  suffix={'%'}
                  separator=","
                  decimals={2}
                />
              </p>
            </div>
            <div className="mt-4">
              <p className="text-center text-zinc-300">
                <b>Fuel Amount</b>
              </p>
              <GaugeComponent
                value={
                  (reactorData.data?.[0].totalFuel /
                    (reactorData.data?.[0].controlRodCount * 28 * 1000)) *
                  100
                }
                width={150}
                height={100}
                minValue={0}
                maxValue={100}
                textColor={'#eeeeee'}
                endColor={'#991111'}
                startColor={'#119911'}
                segments={10}
                valueFormat={'d'}
                valueTextFontSize={'0px'}
              />
              <p className="text-center -mt-5 font-bold text-zinc-300">
                <CountUp
                  end={
                    (reactorData.data?.[0].totalFuel /
                      (reactorData.data?.[0].controlRodCount * 28 * 1000)) *
                    100
                  }
                  preserveValue={true}
                  suffix={'%'}
                  separator=","
                  decimals={2}
                />
              </p>
            </div>
          </div>
          <div className="grid grid-flow-col grid-rows-2 gap-4 bg-zinc-900/80 ml-4 mr-4 rounded-xl p-4">
            <div>
              <p className="text-center text-zinc-300">
                <b>Energy Capacity</b>
              </p>
              <p className="text-center text-zinc-300">
                {/*
                capacityTransition((style, item) => (
                  <a.span style={style} className="text-center text-zinc-300 absolute">{item}</a.span>
                ))
                */}
                <CountUp
                  end={reactorData.data?.[0].capacity}
                  preserveValue={true}
                  suffix={' RF'}
                  separator=","
                  decimals={2}
                />
              </p>
            </div>
            <div>
              <p className="text-center text-zinc-300">
                <b>Produced Last Tick</b>
              </p>
              {/* <a.p style={lastTickTransition} className="text-center text-zinc-300">{reactorData.data?.[0].producedLastTick} RF</a.p> */}
              <p className="text-center text-zinc-300">
                {/*lastTickTransition((style, item) => (
                <a.span style={style} className="ml-2 text-center text-zinc-300 absolute">{item}</a.span>
              ))*/}
                <CountUp
                  end={reactorData.data?.[0].producedLastTick}
                  preserveValue={true}
                  suffix={' RF/t'}
                  separator=","
                />
              </p>
            </div>
            <div>
              <p className="text-center text-zinc-300">
                <b>Ambient Temperature</b>
              </p>
              <p className="text-center text-zinc-300">
                <CountUp
                  end={reactorData.data?.[0].ambientTemperature}
                  preserveValue={true}
                  suffix={' K'}
                  separator=","
                  decimals={2}
                />
              </p>
            </div>
            <div>
              <p className="text-center text-zinc-300">
                <b>Stack Temperature</b>
              </p>
              <p className="text-center text-zinc-300">
                <CountUp
                  end={reactorData.data?.[0].stackTemperature}
                  preserveValue={true}
                  suffix={' K'}
                  separator=","
                  decimals={2}
                />
              </p>
            </div>
            <div>
              <p className="text-center text-zinc-300">
                <b>Fuel Burned Last Tick</b>
              </p>
              <p className="text-center text-zinc-300">
                <CountUp
                  end={reactorData.data?.[0].fuelBurnedLastTick}
                  preserveValue={true}
                  suffix={' mB/t'}
                  separator=","
                  decimals={2}
                />
              </p>
            </div>
            <div>
              <p className="text-center text-zinc-300">
                <b>Reactivity</b>
              </p>
              <p className="text-center text-zinc-300">
                <CountUp
                  end={reactorData.data?.[0].fuelReactivity * 100}
                  preserveValue={true}
                  suffix={'%'}
                  separator=","
                  decimals={2}
                />
              </p>
            </div>
            <div>
              <p className="text-center text-zinc-300">
                <b>Waste</b>
              </p>
              <p className="text-center text-zinc-300">
                <CountUp
                  end={reactorData.data?.[0].fuelWaste}
                  preserveValue={true}
                  suffix={' mB'}
                  separator=","
                  decimals={2}
                />
              </p>
            </div>
          </div>
          <div className="bottom-0 fixed text-center w-full">
            <p className="text-zinc-300">
              Last updated:{' '}
              {new Date(reactorData.data?.[0].updatedAt).toLocaleTimeString()}
              <br />
              {
                // calculate the time since the last update
                // if it's been more than 5 seconds, show a warning
                <CountUp
                  end={
                    (Date.now() -
                      new Date(reactorData.data?.[0].updatedAt).getTime()) /
                    1000
                  }
                  preserveValue={true}
                  suffix={' seconds ago'}
                  separator=","
                  decimals={2}
                />
              }
              {/* html line break */}
            </p>
          </div>
        </a.div>
      </div>
    </>
  )
}
