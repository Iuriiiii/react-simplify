import React, { SetStateAction, useState } from "react";

export type TSetter<T> = (value: T) => () => void;

export interface IModifiers<T> {
    [member: string]: (state: T, ...args: any) => T | void
}

export type TModifierData = { reducer: string, arguments: any[] }

export type TStoreElement<T> = {
    value: any,
    reducers?: IModifiers<T>,
    setters: Array<TSetter<T>>,
    statesSetters: Array<React.Dispatch<SetStateAction<T>>>
};

interface IStore {
    [member: string]: TStoreElement<any>
}

let uid = 0;
let store: IStore = {};

function useComponentId(): number {
    return useState(uid++)[0];
}

function createSetter<S>(fn: React.Dispatch<SetStateAction<S>>, id: number, element: TStoreElement<S>): TSetter<S> {
    return (value) => {
        element.statesSetters
            .forEach((setState, index) => index !== id && setState(value));

        return () => fn(element.value = value);
    };
}

export function useGlobal<S>(name: string, value: S): [S, TSetter<S>] {
    // if(typeof name !== 'string')
    //     return console.error('Invalid data type for 1st argument of useGlobal, "string" expected.');

    const id = useComponentId();
    let actual = store[name];

    if (!actual)
        actual = store[name] = { value, setters: [], statesSetters: [] };

    const [, setState] = useState(actual ? actual.value : value);

    if (!actual.setters[id]) {
        actual.setters[id] = createSetter(setState, id, actual);
        actual.statesSetters[id] = setState;
    }

    return [actual.value, actual.setters[id]];
}

export function useModifier(modifierName: string, ...args: any): TModifierData {
    // if (typeof modifierName !== 'string')
    //     return console.error('Invalid data type argument for useModifier, "string" expected.');

    return { reducer: modifierName, arguments: [...args] };
}

interface ISuperStateContent<T> {
    value: T,
    reducers?: IModifiers<T>
}

interface ISuperStateType<T> {
    [member: string]: any
}

export function useComplex<S extends ISuperStateType<S>>(initialValue: S | (() => S), reducers?: IModifiers<S>) {
    if (typeof initialValue === 'function')
        initialValue = (initialValue as (() => S))();

    if (typeof initialValue !== 'object')
        return console.error(
            'The initial state value should be an object.'
        );

    const [state, setState] = useState(initialValue);

    return [state, (value: object): () => void => {
        return () => setState({...state, ...value});
    }];
}