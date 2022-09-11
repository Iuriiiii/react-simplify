declare type TModifier<T> = (state: T, ...args: any) => any;
declare type TModifiers<T> = {
    [name: string]: TModifier<T>;
};
export declare function useGlobalMaker<V>(name: string, initialState: V, modifiers?: TModifiers<V>): void;
export declare function useGlobal<V>(name: string, initialState?: V, modifiers?: TModifiers<V>): readonly [NonNullable<V>, (newState: V | ((m: TModifiers<V>) => TModifier<V>), ...args: any) => void];
export declare function useDarkMode(): boolean;
interface ICheckerParam {
    [member: string | number]: any;
}
export declare function useChecker(param?: ICheckerParam): number;
export {};
//# sourceMappingURL=index.d.ts.map