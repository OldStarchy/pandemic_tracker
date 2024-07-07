import React from 'react';
import styled from 'styled-components';

const StyledInput = styled.input`
	padding: 0.5rem 0.25rem;
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
	children,
	...props
}: React.JSX.IntrinsicElements['input']) {
	return <StyledInput {...props} />;
}
