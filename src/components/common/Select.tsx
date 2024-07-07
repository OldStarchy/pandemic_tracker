import React from 'react';
import styled from 'styled-components';

const StyledSelect = styled.select`
	display: inline-block;
	padding: 0.5rem 1.5rem 0.5rem 0.5rem;
	justify-content: center;
	align-items: center;
	color: inherit;
	border-bottom: 1px solid currentColor;

	&:disabled {
		color: gray;
	}
`;

const StyledBox = styled.div`
	display: inline-block;
	position: relative;
	background-color: black;

	&::after {
		content: '▼';
		position: absolute;
		right: 0.25rem;
		top: 50%;
		transform: translateY(-50%);
		width: 1rem;
		height: 1rem;
	}
`;

export function Select(props: React.JSX.IntrinsicElements['select']) {
	return (
		<StyledBox>
			<StyledSelect {...props} />
		</StyledBox>
	);
}
