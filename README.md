# React Simplify

This library will support you to write less and do more.

## Concept

The idea of this library was implement an easy way to use global states.

    npm i react-simplify

## Usage

You can use React Simplify easily with it's custom hooks.

### useGlobalMaker

You can use this hook to create a new global state without link a component for update.

#### Information

It takes 1 or 3 arguments.

| Number | Name | Description|
|--|--|--|
| 1 | name* | The global-state's name |
| 2 | [value] | The default/initial value |
| 3 | [modifiers] | The modifiers/reducers |

or

| Number | Name | Description|
|--|--|--|
| 1 | data* | An object with the "name", "initialState" and "modifiers" or "reducers" properties |

#### Example

```js
/* App.jsx / App.tsx */
useGlobalMaker('globalState', 0, {
		increase: (state) =>  state  +  1,
		decrease: (state) =>  state  -  1
	});
```

or

```js
/* App.jsx / App.tsx */
useGlobalMaker({
	name: 'globalState',
	initialState: 0,
	reducers: {
		increase: (state) =>  state  +  1,
		decrease: (state) =>  state  -  1
	}
});
```

### useGlobal

Create (at first call) or reuse a global state, the concept is very similar than `useState`.

#### Information

It has 1 parameter plus 2 optional parameters.

| Number | Name | Description|
|--|--|--|
| 1 | name* | The global-state's name |
| 2 | [value] | The default/initial value |
| 3 | [modifiers] | The modifiers/reducers |
|--|--|--|
|Return| Type | Description
| Yes | Array | An array with the current value as first element and it's updater at second one |

#### Example

A good idea is use this hook in a parent to initialize it (if needed).

```js
/* App.jsx / App.tsx */
const [globalValue, setGlobalValue] = useGlobal('globalName', 'globalValue');
```

If the global state was called previously, the second argument can be avoided.

```js
/* Child.jsx / Child.tsx */
const [globalValue, setGlobalValue] = useGlobal('globalName');
```

### useGlobalState

> Since 1.6.9

Allows to get a global state without links the actual component to future changes.

#### Example

```js
/* Child.jsx / Child.tsx */
const [globalValue, setGlobalValue] = useGlobalState('globalName');

setGlobalValue(1); /* Update others components but not this */
```

###  useModifier()

This hook able you to invoke the modifiers of a state.

#### Information

It receives 1 argument and, optionally, the arguments list for the modifier.

| Number | Name | Description|
|--|--|--|
| 1 | name* | The modifier's name |
| ... | [values] | The values for the modifier |

#### Example

Supossing that we're using the example of `useGlobalMaker`, we could do the following to get a reference of the global state and it's modifiers:

```js
/* Child.ts, remove the '<number>' for Child.js */
const [state, setState] =  useGlobal<number>('globalState');
```

After that, we have all pieces to use `useModifier`.

```jsx
<button  onClick={() =>  setState(useModifier('increase'))}>{state}</button>
```

Easy, isn't is?
So, what if we want to pass an argument? The following ways are allowed.

```jsx
<button  onClick={() =>  setState(useModifier('increase', 1))}>{state}</button>
```

or

```jsx
<button  onClick={() =>  setState(useModifier('increase'), 1)}>{state}</button>
```

We recomend to pass the arguments to the modifier directly from the state updater, in the example's case: `setState`.

### useDarkMode()

> Deprecated, use useIsDarkMode instead

This hook just return true if the user has the DarkMode enabled, false otherwise.

### useIsDarkMode()

This hook just return true if the user has the DarkMode enabled, false otherwise.

### useComplex()

Create a manipulable complex state.

#### Example

Supossing we want to store the name, phone and email of an user and update a component if whetever of these values are changed, the normal way could be declare the following.

```js
const [name, setName] = useState('Alexander');
const [phone, setPhone] = useState('1010131351');
const [email, setEmail] = useState('anonymous@anonimate.anon');
```
But, what happens if we want to update two or more states at once? This:

```js
setPhone('2994646464');
setEmail('minsterious@email.com');
```

It will produce a double rendering of the component, this is unnecesary and non optimal.

`useContext` is the attempt to reduce the amount of states in our components, it works as a normal `useState`, the main difference is the simplicity to modify complex objects.

```js
const [useData, setUserData] = useComplex({
	name: 'Alexander',
	phone: '1010131351',
	email: 'anonymous@anonimate.anon'
});
```

If we want to update a member, we just need to do:

```jsx
<h1  onClick={() =>  setUserData({name: 'Jorge'})}>{JSON.stringify(useData)}</h1>
```

Do you want to delete a member? ¡Of course! Just do:

```jsx
<h1  onClick={() =>  setUserData({name: undefined})}>{JSON.stringify(useData)}</h1>
```

Do you want to update some elements? Go ahead:

```jsx
<h1  onClick={() =>  setUserData({email: 'mycustomemail@gmail.net', phone: '11111111111'})}>{JSON.stringify(useData)}</h1>
```

Do you want to put some new members? You're welcome!:

```jsx
<h1  onClick={() =>  setUserData({age: 25})}>{JSON.stringify(useData)}</h1>
```

### useChecker()

Create a numeric identifier of an object or array, usefull for `useEffect`.

#### Information

It has 1 parameter.

| Number | Name | Description|
|--|--|--|
| 1 | object* | The object or array |

#### Example

```js
const [users, setUsers] = useState([]);

useEffect(() => {
	// Do Something if users change
}, [useChecker(users)]);
```

This is an attempt to fix the following problem: [ReactJS - Passing array to useEffect.](https://stackoverflow.com/questions/59467758/passing-array-to-useeffect-dependency-list)