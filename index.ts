import React, { SetStateAction, useState } from "react";

export type TSetter<T> = (value: T) => void;

export interface IModifiers<T> {
    [member: string]: (state: T, ...args: any) => T | void
}

// export type TModifierData = { reducer: string, arguments: any[] }

type TStoreElement<T> = {
    value: any,
    reducers?: IModifiers<T>,
    setters: Array<TSetter<T>>,
    statesSetters: Array<React.Dispatch<SetStateAction<T>>>
};

interface IStore {
    [member: string]: TStoreElement<any>
}


const store: IStore = {}; var uid = 0;

function useComponentId(): number {
    return useState(uid++)[0];
}

function createSetter<S>(fn: React.Dispatch<SetStateAction<S>>, id: number, element: TStoreElement<S>) {
    return (value: S) => {
        element.statesSetters.forEach((setState, index) => index !== id && setState(value));

        return fn(element.value = value);
    };
}

export function useGlobal<S>(name: string, value: S): [S, TSetter<S>] {
    if (typeof name !== 'string')
        throw new TypeError('Invalid data type for 1st argument of useGlobal, "string" expected.');

    let actual = store[name] || (store[name] = { value, setters: [], statesSetters: [] });
    const { 1: setState } = useState(actual.value), id = useComponentId();

    if (!actual.setters[id])
        actual.setters[id] = createSetter(actual.statesSetters[id] = setState, id, actual);

    return [actual.value, actual.setters[id]];
}

// export function useModifier(modifierName: string, ...args: any): TModifierData {
//     // if (typeof modifierName !== 'string')
//     //     return console.error('Invalid data type argument for useModifier, "string" expected.');

//     return { reducer: modifierName, arguments: [...args] };
// }

// interface ISuperStateContent<T> {
//     value: T,
//     reducers?: IModifiers<T>
// }

interface ISuperStateType<T> {
    [member: string]: any
}

export function useComplex<S extends ISuperStateType<S>>(initialValue: S | (() => S), reducers?: IModifiers<S>) {
    if (typeof initialValue === 'function')
        initialValue = (initialValue as (() => S))();

    if (typeof initialValue !== 'object')
        throw new TypeError('The initial state value should be an object.');

    const [state, setState] = useState(initialValue);

    return [state, (value: object) => setState({ ...state, ...value })];
}

const isDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

export function useDarkMode(): boolean {
    return isDarkMode;
}