import React from 'react'
import { useGlobal, useGlobalState, useModifier } from 'react-simplify';

interface Props { }

const Box2 = (props: Props) => {
    const globalName = 'myGlobal';
    const [global, setGlobal] = useGlobalState<number>(globalName);

    return (
        <section className='Box2'>
            <h2>Box II</h2>
            <p>Global Value ({globalName}): {global}</p>
            <button type='button' onClick={() => setGlobal(global! - 1)}>-1</button>
            <button type='button' onClick={() => setGlobal(useModifier("increaseBy"), 3)}>increase</button>
        </section>
    )
}

export default Box2