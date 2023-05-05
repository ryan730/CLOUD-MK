import { render } from '@testing-library/react';
import React from 'react';
import TabList from './TabList';

describe('TabList', () => {
    const defaultProps = {};

    it('should render', () => {
        const props = {...defaultProps};
        const { asFragment, queryByText } = render(<TabList {...props} />);

        expect(asFragment()).toMatchSnapshot();
        expect(queryByText('TabList')).toBeTruthy();
    });
});
