import React from 'react'
import { useGlobal } from 'react-simplify/index';

interface Props { }

const Box1 = (props: Props) => {
    const globalName = 'myGlobal';
    const [global, setGlobal] = useGlobal<number>(globalName);

    return (
        <section className='Box1'>
            <h2>Box I</h2>
            <p>Global Value ({globalName}): {global}</p>
            <button type='button' onClick={() => setGlobal(global + 1)}>+1</button>
        </section>
    )
}

export default Box1