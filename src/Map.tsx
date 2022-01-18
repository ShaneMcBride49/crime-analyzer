import DeckGL from 'deck.gl'
import { ScatterplotLayer} from '@deck.gl/layers'
import {pickBy} from 'ramda'
import React, { useMemo } from 'react'
import { StaticMap } from 'react-map-gl'
import { HeatmapLayer } from '@deck.gl/aggregation-layers'
import hexToRgb from './hexToRgb'

// @ts-ignore This module does not have typing
import ColorHash from 'color-hash'

const TOKEN = 'pk.eyJ1Ijoic2hhbmV0bWNicmlkZTQ5IiwiYSI6ImNrZ2htMHJnaTA0eWQyc251Z3hydHFoMWYifQ.sgAnWPIMYs-lcGEXvZrTEQ'

/**
 * Gets the longitude and latitude from an object
 * @param i 
 * @returns [longitude, latitude]
 */
function getPoint(i: any) {
    if (i?.point?.coordinates)
        return i.point.coordinates;
    else if (i?.location?.coordinates)
        return i.location.coordinates;
    else if (i?.longitude && i?.latitude)
        return [+i.longitude, +i.latitude];
    else
        console.warn(`${i} does not have a location`)
}

export default function Map({outputData}: { outputData: any }) {
    const [viewport, setViewport] = React.useState({
        longitude: -122.43569,
    latitude: 37.7703,//37.7853
    zoom: 11.5,
    pitch: 0,
    bearing: 0
    })
    console.log(outputData)
    console.log(Object.values(pickBy((value, key) => key.startsWith('map-'), outputData)))
    // const layers = useMemo((newData) => Object.values(pickBy((value, key) => key.startsWith('map-'), newData)) , [outputData])
    const layers: any[] = useMemo(() => Object.values(pickBy((value, key) => key.startsWith('map-'), outputData)).map((layer: any) => {
        if (layer.type === 'mapheat') {
            const opacity = 200
            return new HeatmapLayer({
                id: layer.id,
                data: layer.data.filter((i: any) => i?.location?.coordinates || i?.point?.coordinates),
                getPosition: d => getPoint(d),
                getWeight: d => 5,
                aggregation: 'SUM',
                colorRange: [[239, 243, 255, opacity], [198, 219, 239, opacity], [158, 202, 225, opacity], [107, 174, 214, opacity], [49, 130, 189, opacity], [8, 81, 156, opacity]]
            })
        }else if (layer.type === 'mappoints') {
            return new ScatterplotLayer({
                id: layer.id,
                data: layer.data.filter((i: any) => (i?.location?.coordinates || i?.point?.coordinates || (i?.longitude && i?.latitude))),
                pickable: true,
                sizeScale: 40,
                getPosition: (d: any) => getPoint(d),//[+d.longitude, +d.latitude],
                getRadius: (d: any) => 7,
                // @ts-ignore TODO: investigate RGBAColor type
                getColor: (d: any) => {
                    if (layer.hashColor){
                        let colorHash = new ColorHash({lightness: 0.9})
                        // console.log([...colorHash.rgb(d[layer.key]), 200])
                        // console.log(d[layer.key]);
                        // const hashedColor = colorHash.rgb(d[layer.key])
                        console.log();
                        //@ts-ignore
                        return [(layer?.key && d[layer.key])?colorHash.rgb(d[layer.key]):[0,0,0], 255].flat()
                    } else {
                        return hexToRgb(layer.color)
                    }
                }
            })
        }
    }), [outputData])
    console.log(layers)

    // console.log(layers)
    // @ts-ignore
    return (
        <DeckGL
            initialViewState={viewport}
            controller={true}
            width={'35vw'}
            getTooltip={current => current.object && JSON.stringify(current.object, null, '\t')}
            layers={layers}
        >
            <StaticMap mapboxApiAccessToken={TOKEN}/>
        </DeckGL>
    )
}
