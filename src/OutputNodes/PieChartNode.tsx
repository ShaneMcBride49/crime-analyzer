import {reduceBy, toPairs } from 'ramda'
import { useMemo, useState } from 'react'
import { Pie } from '@nivo/pie'

export default function PieChartNode ({ id, state=[]} : { id: string, state: any, onChange: any}) {
    const [key, setKey] = useState('')
    const keys = useMemo(() => toPairs(key===''?state:reduceBy((a:number)=> a + 1, 0, (i: any)=> i[key], state)).map((i)=>({id: i[0], value:i[1]})), [state, key])
    return (
        <div>
            <b>Pie Chart</b>
            <br/>
            <input type='text' value={key} placeholder='key' onChange={(e) => setKey(e.target.value)}/>
            <Pie
                data={keys}
                width={1000}
                height={500}
                margin={{ top: 50, right: 130, bottom: 50, left: 60 }}
                animate={true}
            />
        </div>
    )
}
