import { faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Dispatch, ReactNode, SetStateAction } from 'react';
import { Button } from './common/Button';

export function ExpandoList<T extends ReactNode>({
	children,
	expanded,
	setExpanded,
	limit = 5,
}: {
	children: T[];
	expanded: boolean;
	setExpanded: Dispatch<SetStateAction<boolean>>;
	limit?: 5;
}) {
	const visibleChildren = expanded ? children : children.slice(0, limit);
	const hasMore = children.length > limit;

	return (
		<>
			{visibleChildren}
			{hasMore && (
				<Button type="button" onClick={() => setExpanded((e) => !e)}>
					<FontAwesomeIcon
						icon={expanded ? faChevronUp : faChevronDown}
					/>
				</Button>
			)}
		</>
	);
}
