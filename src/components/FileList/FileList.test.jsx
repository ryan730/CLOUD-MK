import { render } from '@testing-library/react';
import React from 'react';
import FileList from './FileList';

describe('FileList', () => {
    const defaultProps = {};

    it('should render', () => {
        const props = {...defaultProps};
        const { asFragment, queryByText } = render(<FileList {...props} />);

        expect(asFragment()).toMatchSnapshot();
        expect(queryByText('FileList')).toBeTruthy();
    });
});
