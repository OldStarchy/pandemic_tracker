import React from 'react';
import styled from 'styled-components';

const StyledButton = styled.button`
	padding: 0.5rem;
	display: inline-flex;
	justify-content: center;
	align-items: center;
	border: 1px solid currentColor;
	line-height: 1;

	&:disabled {
		color: gray;
	}
`;

export function Button({
	children,
	...props
}: React.JSX.IntrinsicElements['button']) {
	return (
		<StyledButton {...props}>
			<span>{children}</span>
		</StyledButton>
	);
}
