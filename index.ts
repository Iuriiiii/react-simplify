/*
MIT License

Copyright (c) Iuriiiii

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

import React, { SetStateAction, useState } from "react";

var uid = 0;

type TModifier<T> = (state: T, ...args: any) => any;
type TModifierCaller<T> = (m: TModifiers<T>) => TModifier<T>;
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

interface IGlobalMaker<T> {
    name: string,
    initialState: T,
    modifiers?: TModifiers<T>,
    reducers?: TModifiers<T>
}

export function useGlobalMaker<V>(param: IGlobalMaker<IGlobalMaker<V>['initialState']>): void;
export function useGlobalMaker<V>(name: string, initialState: V, modifiers?: TModifiers<V>): void;
export function useGlobalMaker<V>(param1: any, param2?: any, param3?: any): void {
    let name: string, initialState: V, modifiers: TModifiers<V>;

    if (typeof param1 === 'object') {
        if (typeof param1.name !== 'string')
            throw TypeError(`Invalid data type of "name" for useGlobalMaker, "string" expected.`);

        name = param1.name, initialState = param1.initialState, modifiers = param1.modifiers || param1.reducers;
    } else
        name = param1, initialState = param2, modifiers = param3;

    if (typeof modifiers !== 'object')
        throw TypeError(`Invalid data type of "modifiers" for useGlobalMaker, "object" expected.`);

    createGlobalIfNeeded(name, initialState, modifiers);
}

interface IValueGetter<V> {
    value: V | TModifierCaller<V> | string,
    currentValue: V,
    modifiers?: TModifiers<V>,
    noModifiersErrorMessage: string,
    args: any[]
}

function getValue<V>(param: IValueGetter<V>): V {
    if (typeof param.value === 'string' && param.value.startsWith('@')) {
        const modifier = param.value as string;
        param.value = (modifiers) => modifiers[modifier.substring(1)];
    }

    if (param.value instanceof Function) {
        if (param.modifiers === undefined)
            throw ReferenceError(param.noModifiersErrorMessage);

        const modifier = param.value(param.modifiers!);

        if (!(modifier instanceof Function))
            throw ReferenceError(`Invalid modifier, function expected.`);

        const modifierResult = modifier(param.currentValue!, ...param.args);

        return modifierResult === undefined ? param.currentValue : modifierResult;
    } else
        return param.value as V;
}

/**
 * Allow to select a modifier by its name.
 * 
 * @param {string} modifierName The modifier's name 
 * @returns The modifier string format
 */
export function useModifier(modifierName: string): string {
    if (typeof modifierName !== 'string')
        throw new TypeError('Invalid data type argument for useModifier, "string" expected.');

    return modifierName.startsWith('@') ? modifierName : `@${modifierName}`;
}

/**
 * This function allow you to create/load a global state.
 * 
 * @param {string} name The name of the global state
 * @param {V} [initialState] The initial value of the state
 * @param {TModifiers<V>} [modifiers] The modifiers
 * @param {TModifiers<V>} [associate=true] Should the actual component be updated along the global state?
 * @returns The global state
 * @since 1.6.9
 */
export function useGlobal<V>(name: string, initialState?: V, modifiers?: TModifiers<V>, associate: boolean = true) {
    if (typeof name !== 'string')
        throw new TypeError('Invalid data type for 1st argument of useGlobal, "string" expected.');

    const globalState: IStoreElement<V> = createGlobalIfNeeded(name, initialState!, modifiers);
    const id = useComponentId(); // This number will be the same for each component.
    if (associate) {
        const { 1: setState } = useState(initialState);
        globalState.setStaters[id] = globalState.setStaters[id] || setState as React.Dispatch<SetStateAction<V>>;
    }

    return [globalState.currentValue!, (newState: V | TModifierCaller<V> | string, ...args: any) => {
        globalState.currentValue = getValue({
            value: newState,
            currentValue: globalState.currentValue!,
            args,
            modifiers: globalState.modifiers || modifiers,
            noModifiersErrorMessage: `Impossible reference modificator of global state "${name}", modifiers argument was undefined.`
        });

        globalState.setStaters.forEach((setStater) => setStater(globalState.currentValue!));
    }] as const;
}

/**
 * Gets a global state without link the actual component to
 * the state.
 * 
 * @param {string} name The name of the global state
 * @returns The global state
 * @since 1.6.9
 */
export function useGlobalState<T>(name: string) {
    return useGlobal<T>(name, undefined, undefined, false);
}

/**
 * Allows to create a state with easy modifiable complex data.
 * 
 * @param {object} initialState The initial value of the state 
 * @param modifiers The state's modifier
 * @returns A new local state
 */
export function useComplex<V extends object | (() => V)>(initialState: V, modifiers?: TModifiers<V>) {
    if (initialState instanceof Function)
        initialState = initialState();

    if (typeof initialState !== 'object')
        throw new TypeError('Invalid data type for 1st argument of useComplext, "object" expected.');

    const [state, setState] = useState(initialState);

    return [state, (newState: Partial<V> | object | TModifierCaller<V> | string, ...args: any) => {
        const currentValue = getValue({
            value: newState as V | TModifierCaller<V> | string,
            currentValue: state,
            args,
            modifiers: modifiers,
            noModifiersErrorMessage: `Impossible reference modificator of useComplex, modifiers argument was undefined.`
        });

        if (typeof currentValue !== 'object')
            throw TypeError(`Invalid return type of modifier, "object" expected.`);

        setState({ ...state, ...currentValue });
    }] as const;
}

/**
 * @deprecated
 * @see useIsDarkMode
 */
export function useDarkMode(): boolean {
    return useIsDarkMode();
}

/**
 * 
 * @returns True if dark-mode is enabled, else otherwise
 * @since 1.6.9
 */
export function useIsDarkMode(): boolean {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
}

const stringToNumber = (text: string) => text.split('').reduce((acc, char, index) => acc + char.charCodeAt(0) / (index + 1), 0);

interface ICheckerParam {
    [member: string | number]: any
}

/**
 * 
 * @param {object} param The object to be checked
 * @returns A unique represent number
 */
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
            case 'undefined':
                return;
        }

        res += stringToNumber(e);
    });

    return res;
}