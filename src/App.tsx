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

import Sidebar from './Sidebar';

import './dnd.css';
import Forms, {Input} from "./Forms";


const initialElements = [{ id: '1', type: 'input', data: { label: 'input node' }, style: {width: '200px'}, position: { x: 250, y: 5 } }];

const onDragOver = (event: DragEvent) => {
  event.preventDefault();
  event.dataTransfer.dropEffect = 'move';
};

let id = 0;
const getId = (): ElementId => `dndnode_${id++}`;

const DnDFlow = () => {
  const [reactFlowInstance, setReactFlowInstance] = useState<OnLoadParams>();
  const [elements, setElements] = useState<Elements>(initialElements);
  const [pageData, setPageData] = useState({});

  const changePageData = useCallback((nodeId: string, data: any)=> setPageData({ ...pageData, [nodeId]: data}), [setPageData, pageData] )

  console.log(JSON.stringify(pageData, null, '\t'));

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
      const newNode: Node = {
        id,
        type:form?'default':`${type}`,
        position,
        data: {
          label:
              form ?
                  <NodeForm title={form.name} id={id} data={{}} inputs={form.inputs} defaults={{}} onChange={changePageData} /> :
                  `${type} node`
          },
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
                elements={elements}
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

function NodeForm ({ title, id, data = {}, defaults = {}, inputs, onChange } : { id: string, data: any, defaults?: any, title: string, inputs: Input[], onChange: any }) {
  const [state, setState] = useState(defaults);
  const change = (data: any) => {
    setState(data);
    onChange(id, data);
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

export default DnDFlow;
