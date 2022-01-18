import {useState, DragEvent, useCallback} from 'react'
import ReactFlow, {
  ReactFlowProvider,
  addEdge,
  removeElements,
  Controls,
  OnLoadParams,
  Elements,
  Connection,
  Edge,
  ElementId,
  Node,
  ControlButton
} from 'react-flow-renderer'
import { useDebouncedCallback } from 'use-debounce'
import { equals } from 'ramda'
import Sidebar from './Sidebar'
import buildChains from './BuildChains'
import './App.css'
import Forms from './Forms'

import CalendarNode from './OutputNodes/CalendarNode'
import TextOutputNode from './OutputNodes/TextOutputNode'
import BarChartNode from './OutputNodes/BarChartNode'
import PieChartNode from './OutputNodes/PieChartNode'
import MapPointsNode from './OutputNodes/MapPointsNode'
import MapHeatNode from './OutputNodes/MapHeatNode'
import NodeForm from './NodeForm'

export type Element = (Node & {form?: any, outputNode?: ((item: { id: string, state: any, onChange?: any}) => JSX.Element)}) | Edge
const initialElements: Element[] = []


const onDragOver = (event: DragEvent) => {
  event.preventDefault()
  event.dataTransfer.dropEffect = 'move'
}

let id = 0
const getId = (): ElementId => `dndnode_${id++}`

const outputTypes = {
    'text': TextOutputNode,
    'barchart': BarChartNode,
    'piechart': PieChartNode,
    'calendar': CalendarNode,
    'mappoints': MapPointsNode,
    'mapheat': MapHeatNode,
}

export default function App({setPropOutputData, setMapEnabled, mapEnabled}: {mapEnabled: boolean, setPropOutputData: any, setMapEnabled: any}) {

  const [reactFlowInstance, setReactFlowInstance] = useState<OnLoadParams>()
  const [elements, setElements] = useState<Element[]>(initialElements)
  const [pageData, setPageData] = useState<{[key: string]:any}>({})
  const [outputData, setOutputData] = useState<{[key: string]:any}>({})
  const changeOutputData = useCallback((nodeId: string, data: any)=> {
    setOutputData({...outputData, [nodeId]: data})
    setPropOutputData({...outputData, [nodeId]: data})
  }, [setOutputData, outputData, setPropOutputData])
  const changePageData = useCallback((nodeId: string, data: any)=> setPageData({ ...pageData, [nodeId]: data}), [setPageData, pageData] )
  const chains = buildChains(elements)

  //Creates the array of output functions
  const finalOutput = chains.map((data)=>{
    // @ts-ignore 
    return data.map(node=>pageData[node]).flat().map((result) => {
      if(typeof result === 'string'){
        return (data:any) => {
          if(!equals(data, outputData[result]) )
            changeOutputData(result, data)
        }
      }
      return result
    })
  })

  // Calls the functions in the chains to create the final output
  const debounce = useDebouncedCallback(()=>{
      finalOutput.map(chain => chain.reduce(async (acc, func) => func(await acc), undefined))
  }, 1800)
  debounce()
  
  const onConnect = (params: Connection | Edge) => setElements((els) => addEdge(params, els))
  const onElementsRemove = (elementsToRemove: Elements) => {
    setElements((els) => removeElements(elementsToRemove, els))
    const out = {...outputData}
    elementsToRemove.forEach((element) => {
      delete out[element.id]
    })
    setOutputData(out)
    setPropOutputData(out)
  }
  const onLoad = (_reactFlowInstance: OnLoadParams) => setReactFlowInstance(_reactFlowInstance)
  
  const onDrop = (event: DragEvent) => {
    event.preventDefault()


    if (reactFlowInstance) {
      const type = event.dataTransfer.getData('application/reactflow')
      const position = reactFlowInstance.project({ x: mapEnabled?event.clientX-window.innerWidth*.4:event.clientX, y: event.clientY - 40 })
      const id = getId()
      const form = type.startsWith('form-') ? Forms[type.split('-')[1]] : null
      if(form) changePageData(id, form.output(form.defaults || {}))
      if(type in outputTypes) {
        changePageData(id, id)
      }
      const newNode: Element = {
        id: (type.startsWith('map'))?'map-'+id: id,
        // @ts-ignore
        outputNode: outputTypes[type as keyof typeof outputTypes],
        type:form ? (form.start ? 'input' : 'default') : 'output',
        position,
        form,
        style: {
          width: (type in outputTypes) ?
              ((type ==='mapheat' || type === 'mappoints')?'200px':'900px')
              : '300px'
        }
      }

      setElements((es) => es.concat(newNode))
    }
  }

  return (
      <div className='dndflow'>
        <ReactFlowProvider>
          <div className='reactflow-wrapper'>
            <ReactFlow
                elements={elements.map((i)=>{
                  if(!('source' in i)){
                    return { ...i, data: {
                      label:
                          ( i.form ) ? <NodeForm title={i.form.name} id={i.id} data={{}} inputs={i.form.inputs} defaults={pageData[id] || i.form.defaults} onChange={changePageData} output={i.form.output} /> :
                          (i.type==='output' && i.outputNode) ? <i.outputNode onChange={changePageData} id={i.id} state={outputData[i.id]}/>:
                          `${i.type} node`
                    }}
                  }
                  return {...i, style: {
                        strokeWidth: '4px',
                      }}
                })}
                onConnect={onConnect}
                onElementsRemove={onElementsRemove}
                onLoad={onLoad}
                onDrop={onDrop}
                onDragOver={onDragOver}
                deleteKeyCode={46}
            >
              <Controls >
                <ControlButton onClick={() => setMapEnabled(!mapEnabled)}>
                  Map
                </ControlButton>
                </Controls>
            </ReactFlow>
          </div>
          <Sidebar />
        </ReactFlowProvider>
      </div>
  )
}