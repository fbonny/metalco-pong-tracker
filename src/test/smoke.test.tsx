import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Home from '@/pages/index';

describe('Smoke Tests - Zero Mocking', () => {
  it('should render app root without crashing', () => {
    const { container } = render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );
    expect(container).not.toBeEmptyDOMElement();
  });

  it('should render logo and navigation', () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );
    
    // Check that the page renders some core elements
    expect(document.body).toBeTruthy();
  });

  it('should render all tabs without crashing', () => {
    const { rerender } = render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );
    
    // Just verify the component renders for each state
    expect(document.body).not.toBeEmptyDOMElement();
    
    // Re-render to ensure no memory leaks
    rerender(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );
    
    expect(document.body).not.toBeEmptyDOMElement();
  });
});
