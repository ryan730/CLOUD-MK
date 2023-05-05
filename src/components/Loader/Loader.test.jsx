import { render } from '@testing-library/react';
import React from 'react';
import Loader from './Loader';

describe('Loader', () => {
    const defaultProps = {};

    it('should render', () => {
        const props = {...defaultProps};
        const { asFragment, queryByText } = render(<Loader {...props} />);

        expect(asFragment()).toMatchSnapshot();
        expect(queryByText('Loader')).toBeTruthy();
    });
});
