import React from 'react';
import styled from 'styled-components';

const ChatOptionsCard = ({ chat, onPinToggle, onDelete }: { chat: any; onPinToggle: (chatId: string, pinned: boolean) => void; onDelete: (chatId: string) => void }) => {
  return (
    <StyledWrapper>
      <div className="card">
        <ul className="list">
          <li className="element">
            <svg xmlns="http://www.w3.org/2000/svg" width={25} height={25} viewBox="0 0 24 24" fill="none" stroke="#7e8590" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-pencil">
              <path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z" />
              <path d="m15 5 4 4" />
            </svg>
            <p className="label">Rename</p>
          </li>
          <li className="element" onClick={() => onPinToggle(chat.id, !chat.pinned)}>
            <svg className="lucide lucide-user-round-plus" strokeLinejoin="round" strokeLinecap="round" strokeWidth={2} stroke="#7e8590" fill="none" viewBox="0 0 24 24" height={24} width={24} xmlns="http://www.w3.org/2000/svg">
              <path d="M2 21a8 8 0 0 1 13.292-6" />
              <circle r={5} cy={8} cx={10} />
              <path d="M19 16v6" />
              <path d="M22 19h-6" />
            </svg>
            <p className="label">Pin</p>
          </li>
        </ul>
        <div className="separator" />
        <ul className="list">
          <li className="element">
            <svg className="lucide lucide-settings" strokeLinejoin="round" strokeLinecap="round" strokeWidth={2} stroke="#7e8590" fill="none" viewBox="0 0 24 24" height={24} width={24} xmlns="http://www.w3.org/2000/svg">
              <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
              <circle r={3} cy={12} cx={12} />
            </svg>
            <p className="label">Settings</p>
          </li>
          <li className="element delete" onClick={() => onDelete(chat.id)}>
            <svg className="lucide lucude-trash-2" strokeLinejoin="round" strokeLinecap="round" strokeWidth={2} stroke="#7e8590" fill="none" viewBox="0 0 24 24" height={24} width={24} xmlns="http://www.w3.org/2000/svg">
              <path d="M3 6h18" />
              <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
              <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
              <line y2={17} y1={11} x2={10} x1={10} />
              <line y2={17} y1={11} x2={14} x1={14} />
            </svg>
            <p className="label">Delete</p>
          </li>
        </ul>
        <div className="separator" />
        <ul className="list">
          <li className="element">
            <svg className="lucide lucide-users-round" strokeLinejoin="round" strokeLinecap="round" strokeWidth={2} stroke="#7e8590" fill="none" viewBox="0 0 24 24" height={24} width={24} xmlns="http://www.w3.org/2000/svg">
              <path d="M18 21a8 8 0 0 0-16 0" />
              <circle r={5} cy={8} cx={10} />
              <path d="M22 20c0-3.37-2-6.5-4-8a5 5 0 0 0-.45-8.3" />
            </svg>
            <p className="label">Team Access</p>
          </li>
        </ul>
      </div>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  .card {
    width: 200px;
    /* background-color: rgba(36, 40, 50, 1);\n  background-image: linear-gradient(135deg, rgba(36, 40, 50, 1) 0%, rgba(36, 40, 50, 1) 40%, rgba(37, 28, 40, 1) 100%); */

    background-color: rgba(36, 40, 50, 1);
    background-image: linear-gradient(
      139deg,
      rgba(36, 40, 50, 1) 0%,
      rgba(36, 40, 50, 1) 0%,
      rgba(37, 28, 40, 1) 100%
    );

    border-radius: 10px;
    padding: 15px 0px;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .card .separator {
    border-top: 1.5px solid #42434a;
  }

  .card .list {
    list-style-type: none;
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 0px 10px;
  }

  .card .list .element {
    display: flex;
    align-items: center;
    color: #7e8590;
    gap: 10px;
    transition: all 0.3s ease-out;
    padding: 4px 7px;
    border-radius: 6px;
    cursor: pointer;
  }

  .card .list .element svg {
    width: 19px;
    height: 19px;
    transition: all 0.3s ease-out;
  }

  .card .list .element .label {
    font-weight: 600;
  }

  .card .list .element:hover {
    background-color: #5353ff;
    color: #ffffff;
    transform: translate(1px, -1px);
  }
  .card .list .delete:hover {
    background-color: #8e2a2a;
  }

  .card .list .element:active {
    transform: scale(0.99);
  }

  .card .list:not(:last-child) .element:hover svg {
    stroke: #ffffff;
  }

  .card .list:last-child svg {
    stroke: #bd89ff;
  }
  .card .list:last-child .element {
    color: #bd89ff;
  }

  .card .list:last-child .element:hover {
    background-color: rgba(56, 45, 71, 0.836);
  }
`;

export default ChatOptionsCard; 