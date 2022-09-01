import React, { SetStateAction, useState } from "react";

export type TSetter<T> = (value: T) => void;

export interface IModifiers<T> {
    [member: string]: (state: T, ...args: any) => T | undefined
}

type TModifierData = { reducer: string, arguments: any[] }

type TStoreElement<T> = {
    name: string,
    value: T,
    reducers?: IModifiers<T>,
    setters: Array<TSetter<T>>,
    statesSetters: Array<React.Dispatch<SetStateAction<T>>>
};

interface IStore {
    [member: string]: TStoreElement<any>
}

class Modifier implements TModifierData {
    reducer: string;
    arguments: any[];

    constructor(reducer: string, ...args: any) {
        this.reducer = reducer;
        this.arguments = [...args];
    }
}


const store: IStore = {}; var uid = 0;

function useComponentId(): number {
    return useState(uid++)[0];
}
function createSetter<S>(fn: React.Dispatch<SetStateAction<S | unknown>>, id: number, element: TStoreElement<S>) {
    return (value: S | Modifier) => {

        if (value instanceof Modifier) {
            if (element.reducers === undefined || element.reducers[value.reducer] === undefined)
                throw ReferenceError(`The modifier/reducer "${value.reducer}" does not exists within the global state "${element.name}".`);
            
            // console.log('AFTER: element.value', element.value, 'value.arguments', value.arguments, 'value', value);
            value = element.reducers[value.reducer](element.value, value.arguments) || element.value;
            // console.log('element.value', element.value, 'value', value);
        }

        element.statesSetters.forEach((setState, index) => index !== id && setState(value as S));

        return fn(element.value = (value as S));
    };
}

export function useModifier(modifierName: string, ...args: any): Modifier {
    if (typeof modifierName !== 'string')
        throw new TypeError('Invalid data type argument for useModifier, "string" expected.');
    // console.log(args);
    return new Modifier(modifierName, args);
}

export function useGlobal<S>(name: string, value: S, modifiers?: IModifiers<S>): [S, TSetter<S | Modifier>] {
    if (typeof name !== 'string')
        throw new TypeError('Invalid data type for 1st argument of useGlobal, "string" expected.');

    let actual = store[name] || (store[name] = { name, value, setters: [], statesSetters: [], reducers: modifiers });
    const { 1: setState } = useState(actual.value), id = useComponentId();

    if (!actual.setters[id])
        actual.setters[id] = createSetter(actual.statesSetters[id] = setState, id, actual);

    return [actual.value, actual.setters[id]];
}

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