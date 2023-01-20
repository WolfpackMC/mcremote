export {}
// import Dygraph from 'dygraphs'

// import { useRef, useState, useEffect } from 'react'

// import { useSpring } from '@react-spring/web'

// const Graph = () => {
//   const [paused, setPaused] = useState(false)

//   const [time, setTime] = useState(new Date())
//   const graphRef = useRef<HTMLDivElement>(null)

//   const [zoomValue, setZoomValue] = useState(10000)

//   const [zoomSpring, setZoomSpring] = useSpring(() => ({
//     zoomValue: 10000,
//   }))

//   const [data, setData] = useState<[Date, number, number][]>([
//     [new Date(), 0, 0],
//   ])

//   useEffect(() => {
//     const interval = setInterval(() => {
//       if (!paused) {
//         setData(data => {
//           const newData = [...data]
//           newData.push([new Date(), Math.random() * 100, Math.random() * 100])
//           return newData
//         })
//       }
//     }, 500)

//     return () => clearInterval(interval)
//   }, [paused])

//   const [labels, setLabels] = useState<string[]>([])

//   const [visibility, setVisibility] = useState<boolean[]>([])

//   useEffect(() => {
//     if (graphRef.current) {
//       if (data.length > 0) {
//         const graph = new Dygraph(graphRef.current, data, {
//           legend: 'always',
//           labels: ['Time', 'Temperature', 'Humidity'],
//         })

//         if (graph) {
//           const labels = graph.getLabels()
//           if (labels) {
//             labels.shift()
//             setLabels(labels)
//           }

//           // Loop through each boolean in the visibility array and set the visibility of the corresponding label
//           visibility.forEach((visible, index) => {
//             graph.setVisibility(index, visible)
//           })

//           // Scroll to the right

//           // Get date window options
//           const dateWindow = graph.xAxisRange()

//           // Set the date window to the current date and the current date minus the zoom value
//           graph.updateOptions({
//             dateWindow: [dateWindow[1] - zoomValue, dateWindow[1]],
//           })

//           return () => {
//             graph.destroy()
//           }
//         }
//       }
//     }
//   }, [time, data, visibility, zoomValue])

//   return (
//     <>
//       <div
//         onWheel={e => {
//           if (e.deltaY > 0) {
//             setZoomValue(zoomValue + 1000)
//           } else {
//             setZoomValue(zoomValue - 1000)
//           }
//         }}
//         onMouseEnter={() => setPaused(true)}
//         onMouseLeave={() => setPaused(false)}
//         ref={graphRef}
//         className="w-full h-full"
//       />
//       <div className="top-0 left-0 m-2">
//         {labels.map(label => (
//           <button
//             onClick={() => {
//               setVisibility(visibility => {
//                 const newVisibility = [...visibility]
//                 const index = labels.indexOf(label)
//                 newVisibility[index] = !newVisibility[index]
//                 return newVisibility
//               })
//             }}
//             className={`bg-zinc-900/75 rounded-xl transition-colors p-2 m-1 ${
//               visibility[labels.indexOf(label)]
//                 ? 'text-zinc-100'
//                 : 'text-zinc-500'
//             }`}
//             key={label}
//           >
//             {label}
//           </button>
//         ))}
//       </div>
//     </>
//   )
// }

// export default Graph
