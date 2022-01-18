import { DragEvent } from 'react'
import { Names } from './Forms'
/**
 * Assigns data for the node that is being dragged from the toolbox to the work area
 * @param event 
 * @param nodeType
 */
const onDragStart = (event: DragEvent, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType)
    event.dataTransfer.effectAllowed = 'move'
}

const Sidebar = () => {
    const formsArray = Names.map((form)=>
        <div className='react-flow__node-input' onDragStart={(event: DragEvent) => onDragStart(event, `form-${form}`)} draggable>
            {form}
        </div>
    )
    return (
        <aside style={{overflowY: 'scroll'}}>
            <div className='description'><h1>Nodes</h1></div>
            {formsArray}
            <div className='react-flow__node-output' onDragStart={(event: DragEvent) => onDragStart(event, 'text')} draggable>
                Text Output
            </div>
            <div className='react-flow__node-output' onDragStart={(event: DragEvent) => onDragStart(event, 'calendar')} draggable>
                Calendar
            </div>
            <div className='react-flow__node-output' onDragStart={(event: DragEvent) => onDragStart(event, 'barchart')} draggable>
                 Bar Chart
            </div>
            <div className='react-flow__node-output' onDragStart={(event: DragEvent) => onDragStart(event, 'piechart')} draggable>
                 Pie Chart
            </div>
            <div className='react-flow__node-output' onDragStart={(event: DragEvent) => onDragStart(event, 'mappoints')} draggable>
                Map Points
            </div>
            <div className='react-flow__node-output' onDragStart={(event: DragEvent) => onDragStart(event, 'mapheat')} draggable>
                Heatmap
            </div>
        </aside>
    )
}

export default Sidebar
