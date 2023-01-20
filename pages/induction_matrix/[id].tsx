import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'
import { useEffect, useState, useRef } from 'react'
import { animated as a, useSpring } from '@react-spring/web'
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

export default function InductionMatrix() {
  const [loadedImages, setLoadedImages] = useState<string[]>([])

  const { data: session, status } = useSession()

  const [date, setDate] = useState(Date.now())

  const [energyNumber, setEnergyNumber] = useState(0)

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

  const router = useRouter()
  const { id } = router.query

  const warningRef = useRef<HTMLDivElement>(null)

  const matrixData = trpc.iMatrix.useQuery(parseInt(id as string), {
    staleTime: 500,
    refetchInterval(data, query) {
      const time_since_update =
        (Date.now() - new Date(data?.[0].updatedAt as string).getTime()) / 1000

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

      return 500 // interval in ms
    },
  })

  useEffect(() => {
    loadedImages.find(image => image === images[2]) &&
      setBackgroundSpring.start({
        scale: 1,
        opacity: 1,
      })
  }, [setBackgroundSpring, loadedImages])

  if (!matrixData.data) {
    return (
      <>
        <div className="bg-zinc-900 w-full h-full fixed"></div>
        <div>No reactor found yet...</div>
      </>
    )
  }

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
          className={`bg-zinc-800/50 backdrop-blur-lg w-[50%] h-[80%] left-0 right-0 m-auto mt-4 rounded-xl border-2`}
        >
          {matrixData.data && (
            <div className="text-center">
              <h1 className="text-lg font-bold text-white">
                #{matrixData.data?.[0].id}: {matrixData.data?.[0].name}
              </h1>
              <p className="text-zinc-100">
                {matrixData.data?.[0].length} x {matrixData.data?.[0].width} x{' '}
                {matrixData.data?.[0].height} (m) Induction Matrix
              </p>
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
                The Induction Matrix has not been updated in the last 5 seconds.
              </a.p>
            </div>
          )}
          <div className="grid grid-flow-col justify-center gap-4 mb-4">
            <div className="mt-4">
              <p className="text-center text-zinc-300">
                <b>Energy Capacity</b>
              </p>
              <GaugeComponent
                value={matrixData.data?.[0].energyFilledPercentage * 100}
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
              <a.p
                style={colorSpring}
                className="text-center -mt-5 font-bold text-zinc-300"
              >
                <CountUp
                  end={matrixData.data?.[0].energyFilledPercentage * 100}
                  preserveValue={true}
                  suffix={'%'}
                  separator=","
                  decimals={2}
                  onUpdate={() => {
                    setColorSpring.start({
                      borderColor: `rgba(${
                        matrixData.data?.[0].energyFilledPercentage * 255
                      },${
                        255 - matrixData.data?.[0].energyFilledPercentage * 255
                      },0,200)`,
                      color: `rgba(${
                        matrixData.data?.[0].energyFilledPercentage * 255
                      },${
                        255 - matrixData.data?.[0].energyFilledPercentage * 255
                      },0,200)`,
                    })
                  }}
                />
              </a.p>
            </div>
          </div>
          <div className="grid grid-flow-row portrait:grid-rows-1 portrait:grid-cols-1 grid-rows-3 grid-cols-3 justify-center gap-4 mb-4">
            <div className="m-auto">
              <p className="text-center text-zinc-300">
                <p>
                  <b>Energy In</b>
                </p>
                <CountUp
                  end={matrixData.data?.[0].lastInput / 2.5}
                  preserveValue={true}
                  suffix={' RF/t'}
                  separator=","
                  decimals={2}
                />
              </p>
            </div>
            <div className="m-auto">
              <p className="text-center text-zinc-300">
                <p>
                  <b>Energy Out</b>
                </p>
                <CountUp
                  end={matrixData.data?.[0].lastOutput / 2.5}
                  preserveValue={true}
                  suffix={' RF/t'}
                  separator=","
                  decimals={2}
                />
              </p>
            </div>
            <div className="m-auto">
              <a.p style={colorSpring} className="text-center text-zinc-300">
                <p>
                  <b>Current Energy</b>
                </p>
                <CountUp
                  end={matrixData.data?.[0].energy / 2.5}
                  preserveValue={true}
                  suffix={' RF/t'}
                  separator=","
                  decimals={2}
                  onUpdate={() => {
                    setColorSpring.start({
                      color: `rgba(${
                        matrixData.data?.[0].energy > energyNumber
                          ? 0
                          : matrixData.data?.[0].energyFilledPercentage * 255
                      },${
                        matrixData.data?.[0].energy > energyNumber
                          ? matrixData.data?.[0].energyFilledPercentage * 255
                          : 0
                      },0,200)`,
                    })

                    setEnergyNumber(matrixData.data?.[0].energy)
                  }}
                />
              </a.p>
            </div>
          </div>
          <div className="bottom-0 fixed text-center w-full">
            <p className="text-zinc-300">
              Last updated:{' '}
              {new Date(matrixData.data?.[0].updatedAt).toLocaleTimeString()}
              <br />
              {
                // calculate the time since the last update
                // if it's been more than 5 seconds, show a warning
                <CountUp
                  end={
                    (Date.now() -
                      new Date(matrixData.data?.[0].updatedAt).getTime()) /
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
