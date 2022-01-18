import Map from './Map'
import App from './App'
import { useReducer, useState } from 'react'
import hexRgb from 'hex-rgb'
import './Panes.css'


import {IconLayer} from '@deck.gl/layers'


const ICON_MAPPING = {
    marker: {x: 0, y: 0, width: 128, height: 128, mask: true}
}

export default function Panes() {
    const [outputData, setOutputData] = useState({})
    const [mapEnabled, setMapEnabled] = useState(true)
    return(
       <div className='window'>
           {mapEnabled && <div style={{width: '35vw'}}>
            <Map outputData={outputData} />
           </div>}
           <div style={{width: mapEnabled?'65vw':'100vw'}}>
            <App setPropOutputData={setOutputData} setMapEnabled={setMapEnabled} mapEnabled={mapEnabled}/>
           </div>
       </div>
    )

}
