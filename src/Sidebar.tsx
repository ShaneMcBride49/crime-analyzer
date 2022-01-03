import React, { DragEvent } from 'react';
import { Names } from "./Forms";

const onDragStart = (event: DragEvent, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
};

const Sidebar = () => {
    const formsArray = Names.map((form)=>
        <div className="react-flow__node-input" onDragStart={(event: DragEvent) => onDragStart(event, `form-${form}`)} draggable>
            {form}
        </div>
    );
    return (
        <aside>
            <div className="description"><h1>Nodes</h1></div>
            <div className="react-flow__node-input" onDragStart={(event: DragEvent) => onDragStart(event, 'input')} draggable>
                Input Node
            </div>
            {formsArray}
            {/*<div className="react-flow__node-default" onDragStart={(event: DragEvent) => onDragStart(event, 'default')} draggable>*/}
            {/*    Default Node*/}
            {/*</div>*/}
            <div className="react-flow__node-output" onDragStart={(event: DragEvent) => onDragStart(event, 'output')} draggable>
                Output Node
            </div>
        </aside>
    );
};

export default Sidebar;
