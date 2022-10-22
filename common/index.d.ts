declare type TModifier<T> = (state: T, ...args: any) => any;
declare type TModifierCaller<T> = (m: TModifiers<T>) => TModifier<T>;
declare type TModifiers<T> = {
    [name: string]: TModifier<T>;
};
interface IGlobalMaker<T> {
    name: string;
    initialState: T;
    modifiers?: TModifiers<T>;
    reducers?: TModifiers<T>;
}
export declare function useGlobalMaker<V>(param: IGlobalMaker<IGlobalMaker<V>['initialState']>): void;
export declare function useGlobalMaker<V>(name: string, initialState: V, modifiers?: TModifiers<V>): void;
export declare function useModifier(modifierName: string): string;
export declare function useGlobal<V>(name: string, initialState?: V, modifiers?: TModifiers<V>, associate?: boolean): readonly [NonNullable<V>, (newState: V | TModifierCaller<V> | string, ...args: any) => void];
export declare function useGlobalState<T>(name: string): readonly [NonNullable<T>, (newState: string | T | TModifierCaller<T>, ...args: any) => void];
export declare function useComplex<V extends object | (() => V)>(initialState: V, modifiers?: TModifiers<V>): readonly [V, (newState: Partial<V> | object | TModifierCaller<V> | string, ...args: any) => void];
export declare function useDarkMode(): boolean;
export declare function useIsDarkMode(): boolean;
interface ICheckerParam {
    [member: string | number]: any;
}
export declare function useChecker(param?: ICheckerParam): number;
export {};
