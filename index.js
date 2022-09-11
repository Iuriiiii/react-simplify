import { useState } from "react";
var uid = 0;
const store = {};
function useComponentId() {
    return useState(uid++)[0];
}
function createGlobalIfNeeded(name, initialState, modifiers) {
    return store[name] || (store[name] = { setStaters: [], modifiers, currentValue: initialState });
}
export function useGlobalMaker(name, initialState, modifiers) {
    createGlobalIfNeeded(name, initialState, modifiers);
}
export function useGlobal(name, initialState, modifiers) {
    if (typeof name !== 'string')
        throw new TypeError('Invalid data type for 1st argument of useGlobal, "string" expected.');
    const globalState = createGlobalIfNeeded(name, initialState, modifiers);
    const id = useComponentId();
    globalState.setStaters[id] ||= useState(initialState)[1];
    return [globalState.currentValue, (newState, ...args) => {
            if (newState instanceof Function) {
                if (modifiers === undefined)
                    throw ReferenceError(`Impossible reference modificator of global state "${name}", modifiers argument was undefined.`);
                const modifierResult = newState(modifiers)(globalState.currentValue, ...args);
                newState = modifierResult === undefined ? globalState.currentValue : modifierResult;
            }
            globalState.currentValue = newState;
            globalState.setStaters.forEach((setStater) => setStater(globalState.currentValue));
        }];
}
export function useDarkMode() {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
}
const stringToNumber = (text) => text.split('').reduce((acc, char, index) => acc + char.charCodeAt(0) / (index + 1), 0);
export function useChecker(param) {
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
//# sourceMappingURL=index.js.map