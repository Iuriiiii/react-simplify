import React, { SetStateAction, useState } from "react";

export type TSetter<T> = (value: T, ...args: any) => void;

type TModifiersCallback<T> = (state: T, ...args: any) => T | any
export interface IModifiers<T> {
    [member: string]: TModifiersCallback<T>
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

function createSetter<S>(fn: React.Dispatch<SetStateAction<S>>, id: number, element: TStoreElement<S>) {
    return (value: S | Modifier | ((modifiers: IModifiers<S>) => TModifiersCallback<S>), ...args: any) => {

        if (value instanceof Modifier) {
            if (element.modifiers === undefined || element.modifiers[value.modifier] === undefined)
                throw ReferenceError(`The modifier "${value.modifier}" does not exists within the global state "${element.name}".`);

            value = element.modifiers[value.modifier](element.value, ...value.arguments, ...args) || element.value;
        } else if (value instanceof Function) {
            if (element.modifiers === undefined || typeof element.modifiers !== 'object')
                throw TypeError('Invalid data type of member "modifiers" of useGlobal/useGlobalMaker, "object" expected.');

            value = value(element.modifiers)(element.value, ...args) || element.value;
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

interface IGlobalMaker<T> {
    name: string,
    initialState: T,
    modifiers?: IModifiers<T>,
    reducers?: IModifiers<T>
}

export function useGlobalMaker<S>(param: IGlobalMaker<IGlobalMaker<S>['initialState']>): S;
export function useGlobalMaker<S>(name: string, value?: S, modifiers?: IModifiers<S>): S;
export function useGlobalMaker<S>(name: any, value?: any, modifiers?: any): any {
    let obj: IGlobalMaker<S>;

    if (typeof name !== 'string' && typeof name !== 'object')
        throw TypeError('Invalid data type for 1st argument of useGlobalMaker, "string" or "object" expected.');

    if (typeof name === 'string')
        obj = { name, initialState: value, modifiers };
    else if (typeof name === 'object') {
        obj = (name as IGlobalMaker<S>);

        if (obj.name === undefined || obj.initialState === undefined)
            throw ReferenceError(`The member "name" or "initialState" does not exists within the object.`);
    }
    // console.log(obj.name, { name: obj.name, value: obj.initialState, setters: [], statesSetters: [], modifiers: obj.modifiers || obj.reducers });
    return (store[obj!.name] || (store[obj!.name] = { name: obj!.name, value: obj!.initialState, setters: [], statesSetters: [], modifiers: obj!.modifiers || obj!.reducers })).value;
}

export function useGlobal<S>(name: string, value?: S, modifiers?: IModifiers<S>) {
    if (typeof name !== 'string')
        throw new TypeError('Invalid data type for 1st argument of useGlobal, "string" expected.');

    let actual = store[name] || (store[name] = { name, value, setters: [], statesSetters: [], modifiers: modifiers });
    const { 1: setState } = useState(actual.value), id = useComponentId();

    if (!actual.setters[id])
        actual.setters[id] = createSetter(actual.statesSetters[id] = setState, id, actual);

    return [actual.value, actual.setters[id]] as [S, TSetter<S | Modifier | ((modifiers: IModifiers<S>) => TModifiersCallback<S>)>];
}

interface IComplex<T> {
    value: T,
    modifiers?: IModifiers<T>
}

// interface A {
//     a: number
// }

// const [state, setState] = useComplex<A>({ a: 1 }, {
//     increase: (state) => state.a + 1
// });

// setState((state) => state.increase);

/* TODO: FIX IN THE FUTURE THE INFERENCE OF M GENERIC TYPE */
/* Is not my fault, https://github.com/microsoft/TypeScript/issues/10571 */
export function useComplex<S extends object | (() => S), M extends IModifiers<S> = IModifiers<S>>(initialValue: S, modifiers?: M) {
    if (initialValue instanceof Function)
        initialValue = initialValue();

    if (typeof initialValue !== 'object')
        throw TypeError('Invalid data type for 1st argument of useComplex, "object" expected.');

    const [state, setState] = useState<IComplex<S>>({ value: initialValue, modifiers });

    return [state.value, (value: Partial<S | object> | Modifier | ((modifiers: M) => TModifiersCallback<S>), ...args: any) => {
        if (value instanceof Modifier) {
            if (state.modifiers === undefined || state.modifiers[value.modifier] === undefined)
                throw ReferenceError(`The modifier "${value.modifier}" does not exists for this complex state.`);

            value = state.modifiers[value.modifier](state.value, ...value.arguments, ...args) || state.value;
        } else if (value instanceof Function) {
            if (modifiers === undefined || typeof modifiers !== 'object')
                throw TypeError('Invalid data type for 3rd argument of useComplex, "object" expected.');

            value = value(modifiers)(state.value, ...args) || state.value;
        }

        setState({ modifiers: state.modifiers, value: { ...state.value, ...value } })
    }] as const // [S, (value: Partial<S | object> | Omit<Modifier, keyof TModifierData> | ((state: M) => TModifiersCallback<S>), ...args: any) => void];
}

const isDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

export function useDarkMode(): boolean {
    return isDarkMode;
}

function stringToNumber(text: string): number {
    return textasd.split('').reduce((acc, char, index) => acc + char.charCodeAt(0) / (index + 1), 0);
}

interface ICheckerParam {
    [member: string | number]: any
}

export function useChecker(param?: ICheckerParam): number {
    if (!param)
        return 0;

    if (typeof param !== 'object')
        throw TypeError('Invalid data type for 1st argument of useChecker, "object" expected.');

    const refs = [param];
    let res = 0;

    Object.keys(param).forEach(e => {
        const value = param[e];

        switch (typeof value) {
            case 'number':
                res += value;
                break;
            case 'string':
                res += stringToNumber(value);
                break;
            case 'object':
                if (refs.includes(value))
                    break;

                res += useChecker(value);
                refs.push(value);
                break;
            case 'boolean':
                res += (+value);
                break;
        }

        res += stringToNumber(e);
    });

    return res;
}