import React, { useMemo } from 'react';
import styled from 'styled-components';
import { useStatusBarContext } from '../../context/StatusBarMessageContext';

const StyledInput = styled.input`
	padding: 0.5rem 0.25rem 0.25rem;
	display: inline-block;
	justify-content: center;
	align-items: center;
	border-bottom: 1px solid currentColor;
	line-height: 1;

	&:disabled {
		color: gray;
	}
`;

export function Input({
	label,
	errorMessage,
	statusBarMessage,
	id: _id,
	onFocus,
	onBlur,
	...props
}: {
	label?: string;
	errorMessage?: string;
	statusBarMessage?: string;
} & React.JSX.IntrinsicElements['input']) {
	const setStatusBarMessage = useStatusBarContext();

	const id = useMemo(() => _id ?? crypto.randomUUID(), [_id]);

	const useAltLayout = ['checkbox', 'radio'].includes(props.type ?? '');
	return (
		<div
			style={{
				display: 'flex',
				flexDirection: useAltLayout ? 'row' : 'column',
				alignItems: 'stretch',
				isolation: 'isolate',
				position: 'relative',
			}}
		>
			{useAltLayout ? (
				<>
					<input
						id={id}
						{...props}
						style={{
							position: 'absolute',
							left: 0,
							top: 0,
							width: 0,
							height: 0,
						}}
					/>
					<div
						style={{
							padding: '0.25rem 0',
							display: 'flex',
							gap: '0.25rem',
							alignItems: 'center',
						}}
					>
						<label
							htmlFor={id}
							style={{
								display: 'inline-block',
								width: '1rem',
								height: '1rem',
								backgroundColor: 'var(--color-background)',
								border: '1px solid var(--color-text)',
								position: 'relative',
							}}
						>
							{props.checked && (
								<span
									style={{
										position: 'absolute',
										inset: '0.25rem',
										backgroundColor: 'var(--color-text)',
									}}
								/>
							)}
						</label>
						{label && (
							<label
								style={{
									fontSize: '0.8rem',
								}}
								htmlFor={id}
							>
								{label}
							</label>
						)}
					</div>
				</>
			) : (
				<>
					{label && (
						<label
							style={{
								// marginLeft: '0.25rem',
								marginBottom: '-0.25rem',
								zIndex: 1,
								fontSize: '0.8rem',
							}}
							htmlFor={id}
						>
							{label}
						</label>
					)}
					<StyledInput
						id={id}
						onFocus={
							statusBarMessage
								? (e) => {
										setStatusBarMessage(statusBarMessage);
										onFocus?.(e);
								  }
								: onFocus
						}
						onBlur={
							statusBarMessage
								? (e) => {
										setStatusBarMessage(null);
										onBlur?.(e);
								  }
								: onBlur
						}
						{...props}
					/>
				</>
			)}
			{errorMessage && <label htmlFor={id}>{errorMessage}</label>}
		</div>
	);
}
