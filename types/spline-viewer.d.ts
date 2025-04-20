declare namespace JSX {
  interface IntrinsicElements {
    'spline-viewer': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
      url?: string;
      'loading-anim-type'?: string; // Use string literal for attributes with hyphens
    };
  }
} 