import {Line, LineChart, XAxis, YAxis} from 'recharts';

export default function SimpleLine () {

    const data = [10,12,20,30,44]

    return (
        <LineChart
            style={{ width: '100%', maxWidth: '700px', height: '100%', maxHeight: '70vh', aspectRatio: 1.618 }}
            responsive
            data={data}
            margin={{
                top: 5,
                right: 0,
                left: 0,
                bottom: 5,
            }}
        >
            <XAxis dataKey='label'/>
            <YAxis width='auto'/>
            <Line dataKey="x" />
        </LineChart>
    )
}