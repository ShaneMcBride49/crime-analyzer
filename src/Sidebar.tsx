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
        <aside style={{overflowY: 'scroll'}}>
            <div className="description"><h1>Nodes</h1></div>
            {formsArray}
            <div className="react-flow__node-output" onDragStart={(event: DragEvent) => onDragStart(event, 'text')} draggable>
                Text Output
            </div>
            <div className="react-flow__node-output" onDragStart={(event: DragEvent) => onDragStart(event, 'calendar')} draggable>
                Calendar
            </div>
            <div className="react-flow__node-output" onDragStart={(event: DragEvent) => onDragStart(event, 'barchart')} draggable>
                 Bar Chart
            </div>
            <div className="react-flow__node-output" onDragStart={(event: DragEvent) => onDragStart(event, 'piechart')} draggable>
                 Pie Chart
            </div>
        </aside>
    );
};

export default Sidebar;
