import React, {useState, DragEvent, useCallback} from 'react';
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
  Handle
} from 'react-flow-renderer';
import { useDebouncedCallback } from 'use-debounce';
import { equals } from 'ramda';
import Sidebar from './Sidebar';
import buildChains from './BuildChains';
import './App.css';
import Forms, {Input} from "./Forms";

import CalendarNode from './OutputNodes/CalendarNode';
import TextOutputNode from './OutputNodes/TextOutputNode';
import BarChartNode from './OutputNodes/BarChartNode';
import PieChartNode from './OutputNodes/PieChartNode';

export type Element = (Node & {form?: any, outputNode?: ((item: { id: string, state: any }) => JSX.Element)}) | Edge;
const initialElements: Element[] = [];


const onDragOver = (event: DragEvent) => {
  event.preventDefault();
  event.dataTransfer.dropEffect = 'move';
};

let id = 0;
const getId = (): ElementId => `dndnode_${id++}`;

const outputTypes = {
    'text': TextOutputNode,
    'barchart': BarChartNode,
    'piechart': PieChartNode,
    'calendar': CalendarNode
}

function App() {

  const [reactFlowInstance, setReactFlowInstance] = useState<OnLoadParams>();
  const [elements, setElements] = useState<Element[]>(initialElements);
  const [pageData, setPageData] = useState<{[key: string]:any}>({});
  const [outputData, setOutputData] = useState<{[key: string]:any}>({});
  const changeOutputData = useCallback((nodeId: string, data: any)=> setOutputData({ ...outputData, [nodeId]: data}), [setOutputData, outputData] )
  const changePageData = useCallback((nodeId: string, data: any)=> setPageData({ ...pageData, [nodeId]: data}), [setPageData, pageData] )
  const chains = buildChains(elements);
  const finalOutput = chains.map((data)=>{
    // @ts-ignore
    return data.map((node) => {
      const result = pageData[node];
      if(typeof result === 'string'){
        return (data:any) => {
          if(!equals(data, outputData[result]) )
          changeOutputData(result, data);
        }
      }

      return result;
    });
  })

  const debounce = useDebouncedCallback(()=>{
      finalOutput.map(chain => chain.reduce(async (acc, func) => func(await acc), undefined))
  }, 1800);
  debounce();
  
  const onConnect = (params: Connection | Edge) => setElements((els) => addEdge(params, els));
  const onElementsRemove = (elementsToRemove: Elements) => setElements((els) => removeElements(elementsToRemove, els));
  const onLoad = (_reactFlowInstance: OnLoadParams) => setReactFlowInstance(_reactFlowInstance);
  
  const onDrop = (event: DragEvent) => {
    event.preventDefault();


    if (reactFlowInstance) {
      const type = event.dataTransfer.getData('application/reactflow');
      const position = reactFlowInstance.project({ x: event.clientX, y: event.clientY - 40 });
      const id = getId();
      // Key id value = data
      const form = type.startsWith('form-') ? Forms[type.split('-')[1]] : null;
      if(form) changePageData(id, form.output({}))
      if(type in outputTypes) {
        changePageData(id, id);
      }
      const newNode: Element = {
        id,
        outputNode: outputTypes[type as keyof typeof outputTypes],
        type:form ? (form.start ? 'input' : 'default') : 'output',
        position,
        form,

        style: {
          width: (type in outputTypes) ? '900px' : '300px'
        }
      };

      setElements((es) => es.concat(newNode));
    }
  };

  return (
      <div className="dndflow">
        <ReactFlowProvider>
          <div className="reactflow-wrapper">
            <ReactFlow
                elements={elements.map((i)=>{
                  if(!('source' in i)){
                    return { ...i, data: {
                      label:
                          ( i.form ) ? <NodeForm title={i.form.name} id={i.id} data={{}} inputs={i.form.inputs} defaults={pageData[id]} onChange={changePageData} output={i.form.output} /> :
                          (i.type==='output' && i.outputNode) ? <i.outputNode id={i.id} state={outputData[i.id]}/>:
                          `${i.type} node`
                    }}
                  }
                  return {...i, style: {
                        strokeWidth: '4px',
                      }};
                })}
                onConnect={onConnect}
                onElementsRemove={onElementsRemove}
                onLoad={onLoad}
                onDrop={onDrop}
                onDragOver={onDragOver}
                deleteKeyCode={46}
            >
              <Controls />
            </ReactFlow>
          </div>
          <Sidebar />
        </ReactFlowProvider>
      </div>
  );
};



function NodeForm ({ title, id, data = {}, defaults = {}, inputs, onChange, output = i => i} : { id: string, data: any, defaults?: any, title: string, inputs: Input[], onChange: any, output?: (data: { [key: string]: string }) => any }) {
  const [state, setState] = useState(defaults);
  const change = (data: any) => {
    setState(data);
    onChange(id, output(data));
  };

  return (
      <div>
        <h4>{title}</h4>
        {inputs.map(input => {
          switch (input.type) {
            case 'input':
              return <input type="text" spellCheck="false" value={state[input.name]} placeholder={input.name} onChange={(e) => change({...state, [input.name]: e.target.value})}/>
            case 'select':
              return <select onChange={(e) => change({...state, [input.name]: e.target.value})} value={state[input.name]}>
                {input.options.map((option) => <option>{option}</option>)}
              </select>
            default:
              return null
          }
        })}
      </div>
  )
}

export default App;
