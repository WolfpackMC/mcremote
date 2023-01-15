import { BigReactor } from '@prisma/client'
import { useRef } from 'react'
import ReactSpeedometer, { Transition } from 'react-d3-speedometer'

export default function GaugeComponent({
  value = 0,
  minValue = 0,
  maxValue = 1000,
  segments = 5,
  maxSegmentLabels = 5,
  forceRender = false,
  width = 300,
  height = 300,
  dimensionUnit = 'px',
  fluidWidth = false,
  needleColor = 'steelblue',
  startColor = 'green',
  endColor = 'red',
  segmentColors = [],
  needleTransition = Transition.easeQuadInOut,
  needleTransitionDuration = 500,
  ringWidth = 60,
  textColor = '#666',
  valueFormat = '',
  currentValueText = '${value}',
  currentValuePlaceholderStyle = '${value}',
  customSegmentStops = [],
  customSegmentLabels = [],
  labelFontSize = '14px',
  valueTextFontSize = '16px',
  valueTextFontWeight = 'bold',
  paddingHorizontal = 0,
  paddingVertical = 0,
}) {
  return (
    <ReactSpeedometer
      value={value}
      minValue={minValue}
      maxValue={maxValue}
      segments={segments}
      maxSegmentLabels={maxSegmentLabels}
      forceRender={forceRender}
      width={width}
      height={height}
      dimensionUnit={dimensionUnit}
      fluidWidth={fluidWidth}
      needleColor={needleColor}
      startColor={startColor}
      endColor={endColor}
      segmentColors={segmentColors}
      needleTransition={needleTransition}
      needleTransitionDuration={needleTransitionDuration}
      ringWidth={ringWidth}
      textColor={textColor}
      valueFormat={valueFormat}
      currentValueText={currentValueText}
      currentValuePlaceholderStyle={currentValuePlaceholderStyle}
      customSegmentStops={customSegmentStops}
      customSegmentLabels={customSegmentLabels}
      labelFontSize={labelFontSize}
      valueTextFontSize={valueTextFontSize}
      valueTextFontWeight={valueTextFontWeight}
      paddingHorizontal={paddingHorizontal}
      paddingVertical={paddingVertical}
    />
  )
}
