import React, {useState, DragEvent, useEffect, useCallback} from 'react';
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
import { partition, equals } from 'ramda';
import Sidebar from './Sidebar';

import buildChains from './BuildChains';

import './dnd.css';
import Forms, {Input} from "./Forms";


export type Element = (Node&{form?: any}) | Edge;
const initialElements: Element[] = [];// [{ id: '1', type: 'input', data: { label: 'input node' }, style: {width: '200px'}, position: { x: 250, y: 5 } }];


const onDragOver = (event: DragEvent) => {
  event.preventDefault();
  event.dataTransfer.dropEffect = 'move';
};

let id = 0;
const getId = (): ElementId => `dndnode_${id++}`;


const DnDFlow = () => {

  const [reactFlowInstance, setReactFlowInstance] = useState<OnLoadParams>();
  const [elements, setElements] = useState<Element[]>(initialElements);
  const [pageData, setPageData] = useState<{[key: string]:any}>({

//{age: 30}, {age: 20}
  });
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
  console.log(finalOutput)

  // @ts-ignore
  Promise.all(finalOutput.map(chain => chain.reduce(async (acc, func) => func(await acc), undefined)))



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
      if(type === 'output') {
        changePageData(id, id);
      }
      const newNode: Node&{form?:any} = {
        id,
        type:form?form.start?'input':'default':`${type}`,
        position,
        form,

        style: {
          width: '200px'
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
                          i.form ?
                              <NodeForm title={i.form.name} id={i.id} data={{}} inputs={i.form.inputs} defaults={pageData[id]} onChange={changePageData} output={i.form.output} /> :
                              (i.type==='output')?<OutputNode id={i.id} state={outputData[i.id]}/>:`${i.type} node`
                    }}
                  }
                  return i;
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
              return <input type="text" value={state[input.name]} placeholder={input.name} onChange={(e) => change({...state, [input.name]: e.target.value})}/>
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
function OutputNode ({ id, state=''} : { id: string, state: any}) {
  return (
      <div>
          {JSON.stringify(state, null, '\t')}
      </div>
  )
}


export default DnDFlow;
