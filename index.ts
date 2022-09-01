import React, { SetStateAction, useState } from "react";

export type TSetter<T> = (value: T, ...args: any) => void;

export interface IModifiers<T> {
    [member: string]: (state: T, ...args: any) => T | undefined
}

type TModifierData = { modifier: string, arguments: any[] }

type TStoreElement<T> = {
    name: string,
    value: T,
    modifiers?: IModifiers<T>,
    setters: Array<TSetter<T>>,
    statesSetters: Array<React.Dispatch<SetStateAction<T>>>
};

interface IStore {
    [member: string]: TStoreElement<any>
}

class Modifier implements TModifierData {
    modifier: string;
    arguments: any[];

    constructor(modifier: string, ...args: any) {
        this.modifier = modifier;
        this.arguments = args;
    }
}


const store: IStore = {}; var uid = 0;

function useComponentId(): number {
    return useState(uid++)[0];
}
function createSetter<S>(fn: React.Dispatch<SetStateAction<S | unknown>>, id: number, element: TStoreElement<S>) {
    return (value: S | Modifier, ...args: any) => {

        if (value instanceof Modifier) {
            if (element.modifiers === undefined || element.modifiers[value.modifier] === undefined)
                throw ReferenceError(`The modifier "${value.modifier}" does not exists within the global state "${element.name}".`);

            value = element.modifiers[value.modifier](element.value, ...value.arguments, ...args) || element.value;
        }

        element.statesSetters.forEach((setState, index) => index !== id && setState(value as S));

        return fn(element.value = (value as S));
    };
}

export function useModifier(modifierName: string, ...args: any): Modifier {
    if (typeof modifierName !== 'string')
        throw new TypeError('Invalid data type argument for useModifier, "string" expected.');
    // console.log(args);
    return new Modifier(modifierName, ...args);
}

export function useGlobal<S>(name: string, value?: S, modifiers?: IModifiers<S>): [S, TSetter<S | Modifier>] {
    if (typeof name !== 'string')
        throw new TypeError('Invalid data type for 1st argument of useGlobal, "string" expected.');

    let actual = store[name] || (store[name] = { name, value, setters: [], statesSetters: [], modifiers: modifiers });
    const { 1: setState } = useState(actual.value), id = useComponentId();

    if (!actual.setters[id])
        actual.setters[id] = createSetter(actual.statesSetters[id] = setState, id, actual);

    return [actual.value, actual.setters[id]];
}

interface ISuperStateType<T> {
    [member: string]: any
}

// export function useComplex<S extends ISuperStateType<S>>(initialValue: S | (() => S), modifiers?: IModifiers<S>) {
//     if (typeof initialValue === 'function')
//         initialValue = (initialValue as (() => S))();

//     if (typeof initialValue !== 'object')
//         throw new TypeError('The initial state value should be an object.');

//     const [state, setState] = useState(initialValue);

//     return [state, (value: object) => setState({ ...state, ...value })];
// }

interface IComplex<T> {
    value: T,
    modifiers?: IModifiers<T>
}

export function useComplex<S>(initialValue: S | (() => S), modifiers?: IModifiers<S>): [S, (value: object) => void] {
    if (typeof initialValue === 'function')
        initialValue = (initialValue as (() => S))();

    if (typeof initialValue !== 'object')
        throw new TypeError('The initial state value should be an object.');

    const [state, setState] = useState<IComplex<S>>({ value: initialValue, modifiers });

    return [state.value, (value: object | S | Modifier, ...args: any) => {
        if (value instanceof Modifier) {
            if (state.modifiers === undefined || state.modifiers[value.modifier] === undefined)
                throw ReferenceError(`The modifier "${value.modifier}" does not exists for this complex state.`);

            value = state.modifiers[value.modifier](state.value, ...value.arguments, ...args) || state.value;
        }

        setState({ modifiers: state.modifiers, value: { ...value as S } })
    }];
}

const isDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

export function useDarkMode(): boolean {
    return isDarkMode;
}