import { useState } from "react";
var uid = 0;
const store = {};
function useComponentId() {
    return useState(uid++)[0];
}
function createGlobalIfNeeded(name, initialState, modifiers) {
    return store[name] || (store[name] = { setStaters: [], modifiers, currentValue: initialState });
}
export function useGlobalMaker(param1, param2, param3) {
    let name, initialState, modifiers;
    if (typeof param1 === 'object') {
        if (typeof param1.name !== 'string')
            throw TypeError(`Invalid data type of "name" for useGlobalMaker, "string" expected.`);
        name = param1.name, initialState = param1.initialState, modifiers = param1.modifiers || param1.reducers;
    }
    else
        name = param1, initialState = param2, modifiers = param3;
    if (typeof modifiers !== 'object')
        throw TypeError(`Invalid data type of "modifiers" for useGlobalMaker, "object" expected.`);
    createGlobalIfNeeded(name, initialState, modifiers);
}
function getValue(param) {
    if (typeof param.value === 'string' && param.value.startsWith('@')) {
        const modifier = param.value;
        param.value = (modifiers) => modifiers[modifier.substring(1)];
    }
    if (param.value instanceof Function) {
        if (param.modifiers === undefined)
            throw ReferenceError(param.noModifiersErrorMessage);
        const modifier = param.value(param.modifiers);
        if (!(modifier instanceof Function))
            throw ReferenceError(`Invalid modifier, function expected.`);
        const modifierResult = modifier(param.currentValue, ...param.args);
        return modifierResult === undefined ? param.currentValue : modifierResult;
    }
    else
        return param.value;
}
export function useModifier(modifierName) {
    if (typeof modifierName !== 'string')
        throw new TypeError('Invalid data type argument for useModifier, "string" expected.');
    return modifierName.startsWith('@') ? modifierName : `@${modifierName}`;
}
export function useGlobal(name, initialState, modifiers, associate = true) {
    if (typeof name !== 'string')
        throw new TypeError('Invalid data type for 1st argument of useGlobal, "string" expected.');
    const globalState = createGlobalIfNeeded(name, initialState, modifiers);
    const id = useComponentId();
    if (associate) {
        const { 1: setState } = useState(initialState);
        globalState.setStaters[id] ||= setState;
    }
    return [globalState.currentValue, (newState, ...args) => {
            globalState.currentValue = getValue({
                value: newState,
                currentValue: globalState.currentValue,
                args,
                modifiers: globalState.modifiers || modifiers,
                noModifiersErrorMessage: `Impossible reference modificator of global state "${name}", modifiers argument was undefined.`
            });
            globalState.setStaters.forEach((setStater) => setStater(globalState.currentValue));
        }];
}
export function useGlobalState(name) {
    return useGlobal(name, undefined, undefined, false);
}
export function useComplex(initialState, modifiers) {
    if (initialState instanceof Function)
        initialState = initialState();
    if (typeof initialState !== 'object')
        throw new TypeError('Invalid data type for 1st argument of useComplext, "object" expected.');
    const [state, setState] = useState(initialState);
    return [state, (newState, ...args) => {
            const currentValue = getValue({
                value: newState,
                currentValue: state,
                args,
                modifiers: modifiers,
                noModifiersErrorMessage: `Impossible reference modificator of useComplex, modifiers argument was undefined.`
            });
            if (typeof currentValue !== 'object')
                throw TypeError(`Invalid return type of modifier, "object" expected.`);
            setState({ ...state, ...currentValue });
        }];
}
export function useDarkMode() {
    return useIsDarkMode();
}
export function useIsDarkMode() {
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
            case 'undefined':
                return;
        }
        res += stringToNumber(e);
    });
    return res;
}
//# sourceMappingURL=index.js.map