export type Ok<TVal> = {
	isOk: true;
	unwrap: () => TVal;
	orElse: <TElse>(f: (error: never) => TElse) => TVal;
	or: <TV2, TE2>(other: Result<TV2, TE2>) => Ok<TVal>;
};
export type Err<TErr> = {
	isOk: false;
	unwrap: () => never;
	orElse: <TElse>(f: (error: TErr) => TElse) => TElse;
	or: <TV2, TE2>(other: Result<TV2, TE2>) => Result<TV2, TE2>;
};

export type Result<TVal, TErr = Error> = {
	readonly isOk: boolean;
	unwrap: () => TVal | never;
	orElse: <TElse>(f: (error: TErr) => TElse) => TVal | TElse;
	or: <TV2, TE2>(other: Result<TV2, TE2>) => Result<TVal | TV2, TE2>;
};

export function Ok<T>(value: T): Ok<T> {
	const r: Ok<T> = {
		isOk: true,
		unwrap: () => value,
		orElse: () => value,
		or: () => r,
	};
	return r;
}

export function Err<T>(error: T): Err<T> {
	return {
		isOk: false,
		unwrap: (): never => {
			throw error;
		},
		orElse: <TElse>(f: (error: T) => TElse) => f(error),
		or: <TV2, TE2>(other: Result<TV2, TE2>) => other,
	};
}
