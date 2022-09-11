import React from 'react'
import { useChecker, useComplex } from 'react-simplify'

interface Props { }

const CheckerViewer = (props: Props) => {
    const [complex, setComplex] = useComplex({ n: 1, t: '' });

    const complexStr = `{ n: ${complex.n}, t: '${complex.t}' }`;
    return (
        <div className='CheckViewer'>
            <h3>{complexStr}</h3>
            <label>.n value: <input type='number' min='1' defaultValue={1} onChange={(e) => setComplex({ n: parseInt(e.target.value) })} /></label><br />
            <label>.t value:  <input type='text' placeholder='Any text you want' onChange={(e) => setComplex({ t: e.target.value })} /><br /></label><br />
            <h3>useChecker({complexStr}) = {useChecker(complex)}</h3>
        </div>
    )
}

export default CheckerViewer