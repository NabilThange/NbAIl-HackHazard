import React from 'react';
import styled from 'styled-components';

interface SwitchProps {
  isToggled: boolean;
  onToggle: () => void;
}

const Switch: React.FC<SwitchProps> = ({ isToggled, onToggle }) => {
  return (
    <StyledWrapper>
      <div>
        <input type="checkbox" id="checkbox" checked={isToggled} onChange={onToggle} />
        <label htmlFor="checkbox" className="toggle">
          <div className="bars" id="bar1" />
          <div className="bars" id="bar2" />
          <div className="bars" id="bar3" />
        </label>
      </div>
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`
  #checkbox {
    display: none;
  }

  .toggle {
    position: relative;
    width: 28px;
    height: 28px;
    cursor: pointer;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 6px;
    transition-duration: 0.3s;
    opacity: 1;
  }

  .bars {
    width: 100%;
    height: 3px;
    background-color: rgb(253, 255, 243);
    border-radius: 5px;
    transition-duration: 0.3s;
    opacity: 1;
  }

  /* #checkbox:checked + .toggle .bars {\n    margin-left: 13px;\n  } */

  #checkbox:checked + .toggle #bar2 {
    transform: translateY(10px) rotate(60deg);
    margin-left: 0;
    transform-origin: right;
    transition-duration: 0.3s;
    z-index: 2;
  }

  #checkbox:checked + .toggle #bar1 {
    transform: translateY(20px) rotate(-60deg);
    transition-duration: 0.3s;
    transform-origin: left;
    z-index: 1;
  }

  #checkbox:checked + .toggle {
    transform: rotate(90deg);
  }
  /* #checkbox:checked + .toggle #bar3 {\n    transform: rotate(90deg);\n    transition-duration: .3s;\n    transform-origin:right;\n  } */`;

export default Switch; 