import {reduceBy, toPairs } from "ramda";
import { useMemo, useState } from "react";
import { Bar } from '@nivo/bar'

export default function BarChartNode ({ id, state=[]} : { id: string, state: any}) {
    const [key, setKey] = useState('');
    const keys = useMemo(() => toPairs(key===''?state:reduceBy((a:number)=> a + 1, 0, (i: any)=> i[key], state)).map((i)=>({id: i[0], value:i[1]})), [state, key])
    return (
        <div>
            <input type="text" value={key} placeholder="key" onChange={(e) => setKey(e.target.value)}/>
            <Bar
                data={keys}
                width={1000}
                height={500}
                colorBy={'indexValue'}
                margin={{ top: 50, right: 130, bottom: 50, left: 60 }}
                padding={0.4}
                valueScale={{ type: "linear" }}
                colors={{ scheme: 'nivo' }}
                animate={true}
                enableLabel={false}
                axisTop={null}
                axisRight={null}
                axisLeft={{
                    tickSize: 5,
                    tickPadding: 5,
                    tickRotation: 0,
                    legend: "",
                    legendPosition: "middle",
                    legendOffset: -40
                }}
            />
        </div>
    )
}
