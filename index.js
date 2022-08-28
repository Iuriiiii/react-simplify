"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useComplex = exports.useModifier = exports.useGlobal = void 0;
const react_1 = require("react");
let uid = 0;
let store = {};
function useComponentId() {
    return (0, react_1.useState)(uid++)[0];
}
function createSetter(fn, id, element) {
    return (value) => {
        element.statesSetters
            .forEach((setState, index) => index !== id && setState(value));
        return () => fn(element.value = value);
    };
}
function useGlobal(name, value, reducers) {
    // if(typeof name !== 'string')
    //     return console.error('Invalid data type for 1st argument of useGlobal, "string" expected.');
    const id = useComponentId();
    let actual = store[name];
    if (!actual)
        actual = store[name] = { value, reducers, setters: [], statesSetters: [] };
    const [, setState] = (0, react_1.useState)(actual ? actual.value : value);
    if (!actual.setters[id]) {
        actual.setters[id] = createSetter(setState, id, actual);
        actual.statesSetters[id] = setState;
    }
    return [actual.value, actual.setters[id]];
}
exports.useGlobal = useGlobal;
function useModifier(modifierName, ...args) {
    // if (typeof modifierName !== 'string')
    //     return console.error('Invalid data type argument for useModifier, "string" expected.');
    return { reducer: modifierName, arguments: [...args] };
}
exports.useModifier = useModifier;
function useComplex(initialValue, reducers) {
    if (typeof initialValue === 'function')
        initialValue = initialValue();
    if (typeof initialValue !== 'object')
        return console.error('The initial state value should be an object.');
    const [state, setState] = (0, react_1.useState)(initialValue);
    return [state, (value) => {
            return () => setState({ ...state, ...value });
        }];
}
exports.useComplex = useComplex;
