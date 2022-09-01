"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useChecker = exports.useDarkMode = exports.useComplex = exports.useGlobal = exports.useNewGlobal = exports.useModifier = void 0;
const react_1 = require("react");
class Modifier {
    modifier;
    arguments;
    constructor(modifier, ...args) {
        this.modifier = modifier;
        this.arguments = args;
    }
}
const store = {};
var uid = 0;
function useComponentId() {
    return (0, react_1.useState)(uid++)[0];
}
function createSetter(fn, id, element) {
    return (value, ...args) => {
        if (value instanceof Modifier) {
            if (element.modifiers === undefined || element.modifiers[value.modifier] === undefined)
                throw ReferenceError(`The modifier "${value.modifier}" does not exists within the global state "${element.name}".`);
            value = element.modifiers[value.modifier](element.value, ...value.arguments, ...args) || element.value;
        }
        element.statesSetters.forEach((setState, index) => index !== id && setState(value));
        return fn(element.value = value);
    };
}
function useModifier(modifierName, ...args) {
    if (typeof modifierName !== 'string')
        throw new TypeError('Invalid data type argument for useModifier, "string" expected.');
    // console.log(args);
    return new Modifier(modifierName, ...args);
}
exports.useModifier = useModifier;
function useNewGlobal(name, value, modifiers) {
    if (typeof name !== 'string')
        throw new TypeError('Invalid data type for 1st argument of useGlobal, "string" expected.');
    return (store[name] || (store[name] = { name, value, setters: [], statesSetters: [], modifiers: modifiers })).value;
}
exports.useNewGlobal = useNewGlobal;
function useGlobal(name, value, modifiers) {
    if (typeof name !== 'string')
        throw new TypeError('Invalid data type for 1st argument of useGlobal, "string" expected.');
    let actual = store[name] || (store[name] = { name, value, setters: [], statesSetters: [], modifiers: modifiers });
    const { 1: setState } = (0, react_1.useState)(actual.value), id = useComponentId();
    if (!actual.setters[id])
        actual.setters[id] = createSetter(actual.statesSetters[id] = setState, id, actual);
    return [actual.value, actual.setters[id]];
}
exports.useGlobal = useGlobal;
function useComplex(initialValue, modifiers) {
    if (typeof initialValue === 'function')
        initialValue = initialValue();
    if (typeof initialValue !== 'object')
        throw new TypeError('The initial state value should be an object.');
    const [state, setState] = (0, react_1.useState)({ value: initialValue, modifiers });
    return [state.value, (value, ...args) => {
            if (value instanceof Modifier) {
                if (state.modifiers === undefined || state.modifiers[value.modifier] === undefined)
                    throw ReferenceError(`The modifier "${value.modifier}" does not exists for this complex state.`);
                value = state.modifiers[value.modifier](state.value, ...value.arguments, ...args) || state.value;
            }
            setState({ modifiers: state.modifiers, value: { ...state.value, ...value } });
        }];
}
exports.useComplex = useComplex;
const isDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
function useDarkMode() {
    return isDarkMode;
}
exports.useDarkMode = useDarkMode;
function stringToNumber(text) {
    return text.split('').reduce((acc, char) => acc += char.charCodeAt(0), 0);
}
function useChecker(param) {
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
exports.useChecker = useChecker;
