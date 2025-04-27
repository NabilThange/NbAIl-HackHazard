"use client"

import React from 'react';
import styled from 'styled-components';
import { Plus } from 'lucide-react'; // Import the Plus icon

// Define the props interface to accept onClick and collapsed state
interface CustomNewChatButtonProps {
  onClick?: () => void;
  collapsed?: boolean; // Added collapsed prop
}

// Define props for StyledWrapper to use the collapsed state for styling
interface StyledWrapperProps {
  $collapsed?: boolean; // Use $ prefix for transient props (not passed to DOM)
}

const CustomNewChatButton: React.FC<CustomNewChatButtonProps> = ({ onClick, collapsed }) => {
  return (
    // Pass the collapsed state to the styled component via the transient prop $collapsed
    <StyledWrapper $collapsed={collapsed}>
      <button type="button" className="button" onClick={onClick}>
        <span className="button__text">New Chat</span>
        <span className="button__icon">
          {/* Conditionally render the icon based on collapsed state */}
          {collapsed ? (
            <Plus className="h-5 w-5 text-white" /> // Use Plus icon when collapsed
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width={24} viewBox="0 0 24 24" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" stroke="currentColor" height={24} fill="none" className="svg"><line y2={19} y1={5} x2={12} x1={12} /><line y2={12} y1={12} x2={19} x1={5} /></svg>
          )}
        </span>
      </button>
    </StyledWrapper>
  );
}

// Update StyledWrapper to accept the prop and apply conditional styles
const StyledWrapper = styled.div<StyledWrapperProps>`
  /* Add display: flex and justify-content center if you want the button centered */
  /* display: flex; */
  /* justify-content: center; */

  .button {
    position: relative;
    /* Conditional width */
    width: ${(props) => (props.$collapsed ? '40px' : '180px')};
    height: 40px;
    cursor: pointer;
    display: flex;
    align-items: center;
    /* Center content (icon) when collapsed */
    justify-content: ${(props) => (props.$collapsed ? 'center' : 'flex-start')};
    border: 1px solid #7e22ce; /* Updated border color (purple-700) */
    background-color: #9333ea; /* Updated background color (purple-600) */
    border-radius: 4px; /* Added subtle border radius */
    overflow: hidden; /* Ensures icon stays within bounds */
    /* Animate width change */
    transition: width 0.3s ease-in-out, background-color 0.3s, border-color 0.3s;
  }

  .button, .button__icon, .button__text {
    /* Base transition */
    transition: all 0.3s ease-in-out;
  }

  .button .button__text {
    /* Hide text when collapsed */
    opacity: ${(props) => (props.$collapsed ? '0' : '1')};
    /* Adjust transform for smooth hide/show */
    transform: ${(props) => (props.$collapsed ? 'translateX(-20px)' : 'translateX(25px)')};
    color: #fff;
    font-weight: 600;
    white-space: nowrap; /* Prevent text wrapping */
    /* Prevent interaction with hidden text */
    pointer-events: ${(props) => (props.$collapsed ? 'none' : 'auto')};
    /* Explicit transition for opacity and transform */
    transition: opacity 0.2s ease-in-out, transform 0.3s ease-in-out;
  }

  .button .button__icon {
    /* Use relative positioning and full width when collapsed */
    position: ${(props) => (props.$collapsed ? 'relative' : 'absolute')};
    width: ${(props) => (props.$collapsed ? '100%' : '39px')};
    /* Center icon when collapsed, otherwise position to the right */
    transform: ${(props) => (props.$collapsed ? 'translateX(0)' : 'translateX(139px)')};
    height: 100%;
    background-color: #7e22ce; /* Updated icon background color (purple-700) */
    display: flex;
    align-items: center;
    justify-content: center;
    /* Animate icon changes */
    transition: width 0.3s ease-in-out, transform 0.3s ease-in-out, background-color 0.3s;
  }

  .button .svg {
    width: 20px; /* Slightly smaller icon */
    stroke: #fff;
    /* Ensure icon doesn't shrink when button collapses */
    flex-shrink: 0;
  }

  /* --- Hover States --- */

  .button:hover {
     /* Keep hover color consistent */
    background: #7e22ce;
  }

  .button:hover .button__text {
    /* Ensure text stays hidden on hover when collapsed */
    opacity: 0;
    color: ${(props) => (props.$collapsed ? '#fff' : 'transparent')}; /* Use color transparent only when expanded */
  }

  .button:hover .button__icon {
    /* Icon takes full width on hover only when expanded */
    width: ${(props) => (props.$collapsed ? '100%' : '178px')}; /* Adjusted hover width: 180px - 2px border */
    transform: translateX(0);
  }

  /* --- Active States --- */

  .button:active .button__icon {
    background-color: #6b21a8; /* Updated active icon background color (purple-800) */
  }

  .button:active {
    border: 1px solid #6b21a8; /* Updated active border color (purple-800) */
  }
`;

export default CustomNewChatButton; 