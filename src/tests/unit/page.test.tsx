import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import Home from '@/app/page';

describe('Home Page', () => {
  it('should render without crashing', () => {
    render(<Home />);
    expect(document.body).toBeTruthy();
  });
});
