"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useDarkMode = exports.useComplex = exports.useGlobal = exports.useModifier = void 0;
const react_1 = require("react");
class Modifier {
    reducer;
    arguments;
    constructor(reducer, ...args) {
        this.reducer = reducer;
        this.arguments = [...args];
    }
}
const store = {};
var uid = 0;
function useComponentId() {
    return (0, react_1.useState)(uid++)[0];
}
function createSetter(fn, id, element) {
    return (value) => {
        if (value instanceof Modifier) {
            if (element.reducers === undefined || element.reducers[value.reducer] === undefined)
                throw ReferenceError(`The modifier/reducer "${value.reducer}" does not exists within the global state "${element.name}".`);
            // console.log('AFTER: element.value', element.value, 'value.arguments', value.arguments, 'value', value);
            value = element.reducers[value.reducer](element.value, value.arguments) || element.value;
            // console.log('element.value', element.value, 'value', value);
        }
        element.statesSetters.forEach((setState, index) => index !== id && setState(value));
        return fn(element.value = value);
    };
}
function useModifier(modifierName, ...args) {
    if (typeof modifierName !== 'string')
        throw new TypeError('Invalid data type argument for useModifier, "string" expected.');
    // console.log(args);
    return new Modifier(modifierName, args);
}
exports.useModifier = useModifier;
function useGlobal(name, value, modifiers) {
    if (typeof name !== 'string')
        throw new TypeError('Invalid data type for 1st argument of useGlobal, "string" expected.');
    let actual = store[name] || (store[name] = { name, value, setters: [], statesSetters: [], reducers: modifiers });
    const { 1: setState } = (0, react_1.useState)(actual.value), id = useComponentId();
    if (!actual.setters[id])
        actual.setters[id] = createSetter(actual.statesSetters[id] = setState, id, actual);
    return [actual.value, actual.setters[id]];
}
exports.useGlobal = useGlobal;
function useComplex(initialValue, reducers) {
    if (typeof initialValue === 'function')
        initialValue = initialValue();
    if (typeof initialValue !== 'object')
        throw new TypeError('The initial state value should be an object.');
    const [state, setState] = (0, react_1.useState)(initialValue);
    return [state, (value) => setState({ ...state, ...value })];
}
exports.useComplex = useComplex;
const isDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
function useDarkMode() {
    return isDarkMode;
}
exports.useDarkMode = useDarkMode;
