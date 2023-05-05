import { render } from '@testing-library/react';
import React from 'react';
import BottomBtn from './BottomBtn';

describe('BottomBtn', () => {
    const defaultProps = {};

    it('should render', () => {
        const props = {...defaultProps};
        const { asFragment, queryByText } = render(<BottomBtn {...props} />);

        expect(asFragment()).toMatchSnapshot();
        expect(queryByText('BottomBtn')).toBeTruthy();
    });
});
