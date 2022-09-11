import React, { SetStateAction, useState } from "react";

var uid = 0;

type TModifier<T> = (state: T, ...args: any) => any;
type TModifiers<T> = { [name: string]: TModifier<T> }

interface IStoreElement<V> {
    currentValue?: V,
    modifiers?: TModifiers<V>,
    setStaters: Array<React.Dispatch<SetStateAction<V>>>
}
interface IStore<V> {
    [name: string]: IStoreElement<V>
}

const store: IStore<any> = {};

function useComponentId() {
    return useState(uid++)[0];
}

function createGlobalIfNeeded<V>(name: string, initialState: V, modifiers?: TModifiers<V>) {
    return store[name] || (store[name] = { setStaters: [], modifiers, currentValue: initialState });
}

export function useGlobalMaker<V>(name: string, initialState: V, modifiers?: TModifiers<V>): void {
    createGlobalIfNeeded(name, initialState, modifiers);
}

export function useGlobal<V>(name: string, initialState?: V, modifiers?: TModifiers<V>) {
    if (typeof name !== 'string')
        throw new TypeError('Invalid data type for 1st argument of useGlobal, "string" expected.');

    const globalState: IStoreElement<V> = createGlobalIfNeeded(name, initialState!, modifiers);
    const id = useComponentId(); // This number will be the same for each component.
    globalState.setStaters[id] ||= useState(initialState)[1] as React.Dispatch<SetStateAction<V>>;

    return [globalState.currentValue!, (newState: V | ((m: TModifiers<V>) => TModifier<V>), ...args: any) => {
        if (newState instanceof Function) {
            if (modifiers === undefined)
                throw ReferenceError(`Impossible reference modificator of global state "${name}", modifiers argument was undefined.`);

            const modifierResult = newState(modifiers)(globalState.currentValue!, ...args);

            newState = modifierResult === undefined ? globalState.currentValue : modifierResult;
        }

        globalState.currentValue = newState as V;

        globalState.setStaters.forEach((setStater) => setStater(globalState.currentValue!));
    }] as const;
}

export function useDarkMode(): boolean {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
}

const stringToNumber = (text: string) => text.split('').reduce((acc, char, index) => acc + char.charCodeAt(0) / (index + 1), 0);

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