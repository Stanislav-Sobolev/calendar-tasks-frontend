import { useState, useRef, Dispatch, SetStateAction, DragEvent } from 'react';
import styled from 'styled-components';
import { toast } from 'react-toastify';

import { Edit as EditIcom, Delete as DeleteIcon, Ok as OkIcon, Cross as CrosIcon } from '../Icons';
import { ICard, ICell, IBoard } from '../../Interfaces';
import { deleteCard, updateCard } from '../../helpers/fetchers';

const StyledMarkerList = styled.ul`
  display: flex;
  gap: 2px;
`;

const StyledMarker = styled.ul`
  height: 6px;
  width: 24px;
  border-radius: 3px;
  background-color: ${props => props.color};
`;

const CheckboxLabel = styled.label`
  display: inline-block;
  width: 20px;
  height: 20px;
  margin-right: 6px;
  cursor: pointer;
  ${({ color }) => `background-color: ${color};`}
`;

const StyledInput = styled.input`
  display: block;
  width: 100%;
  font-size: 16px;
  font-weight: 700;
  padding: 6px;
`;

const Edit = styled(EditIcom)`
  cursor: default;
  path {
    stroke: var(--dark);
  }
`;

const Delete = styled(DeleteIcon)`
  cursor: default;
  path {
    stroke: var(--dark);
  }
`;

const Ok = styled(OkIcon)`
  cursor: default;
  stroke: var(--successColor);
`;

const Cross = styled(CrosIcon)`
  cursor: default;
  width: 16px;
  
  path {
    fill: var(--errorColor);
  }
`;

const CardContainer = styled.li`
  width: 100%;
  border: 2px solid var(--accentSecondary);
  padding: 6px;
  border-radius: 6px;
  margin-bottom: 5px;
  cursor: grab;
  background-color: var(--background);
  display: flex;
  flex-direction: column;
`;

const EditWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const CardTitleInput = styled.input`
  display: block;
  width: 100%;
  font-size: 16px;
  font-weight: 600;
  padding: 4px;
  height: 33px;
`;

const CardDescriptionInput = styled.input`
  display: block;
  width: 100%;
  font-size: 14px;
  color: var(--darkText);
  padding: 4px;
  height: 33px;
`;

const BottomWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  padding: 6px;
`;

const IconWrapper = styled.div`
  display: flex;
  height: 22px;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 8px;
`;

const StyledCardTitle = styled.span`
  display: block;
  width: 100%;
  font-size: 16px;
  font-weight: 600;
  padding: 4px;
`;

const StyledCardDescription = styled.span`
  display: block;
  width: 100%;
  font-size: 14px;
  color: var(--darkText);
  padding: 4px;
`;

type Props = {
  card: ICard;
  cell: ICell;
  boardId: string;
  failFetchCallback: () => void;
  setCurrentCell: Dispatch<SetStateAction<ICell | null>>;
  setCurrentCard: Dispatch<SetStateAction<ICard | null>>;
  setHoveredCard: Dispatch<SetStateAction<ICard | null>>;
  setBoardData: Dispatch<SetStateAction<IBoard | null>>;
};

export const Card = (props: Props) => {
  const { 
    card, 
    cell, 
    boardId, 
    failFetchCallback, 
    setCurrentCell, 
    setCurrentCard, 
    setHoveredCard, 
    setBoardData
  } = props;
  const { id: cardId } = card;
  const { id: cellId } = cell;

  const [title, setTitle] = useState(card.title);
  const [originalTitle, setOriginalTitle] = useState(card.title);
  const [description, setDescription] = useState(card.description);
  const [originalDescription, setOriginalDescription] = useState(card.description);
  const [colors, setColors] = useState(card.colors);
  const [originalColors, setOriginalColors] = useState(card.colors);
  const [isEditing, setEditing] = useState(false);

 const classNamesToStyle = [
  CardContainer.toString(),
  StyledCardDescription.toString(),
  StyledCardTitle.toString(),
  IconWrapper.toString(),
  Edit.toString(),
  Delete.toString()
];

  const elementRef = useRef<HTMLLIElement | null>(null);

  const dragStartHandler = (cell: ICell) => {
    setCurrentCell(cell);
    setCurrentCard(card);
  }

  const dragLeaveHandler = () => {
    if (elementRef.current) {
      elementRef.current.style.boxShadow = 'none';
    }
  };

  const dragOverHandler = (e: DragEvent<HTMLLIElement>) => {
    e.preventDefault();
    const target = e.target as HTMLLIElement;
    
  if (classNamesToStyle.includes(target.className) && elementRef.current) {
      setHoveredCard(card);
      elementRef.current.style.boxShadow = '0 5px 5px rgba(0, 0, 0, 0.2)';
    }
  } 

  const dropHandler = () => {
    if (elementRef.current) {
      elementRef.current.style.boxShadow = 'none';
    }
  }

  const editHandler = () => {
    setOriginalTitle(title);
    setOriginalDescription(description);
    setOriginalColors(colors)
    setEditing(true);
  }

  const saveUpdateCardHandler = async () => {
    if (title && description) {
      setBoardData(board => {
        if (board) {
          const cell = board.cellsData.find((col) => col.id === cellId);
          
          if (cell) {
            const cardIndex = cell.items.findIndex((c) => c.id === cardId);
  
            if (cardIndex !== -1) {
              cell.items[cardIndex] = { title, description, colors, id: cardId };
              return {...board};
            }
          }
        }
        return board;
      });
  
      updateCard(boardId, cellId, cardId, {id: cardId, title, description, colors}, failFetchCallback);
  
      setEditing(false);
    } else {
      toast.error('Please, fill Title, Description and CalendarDate');
    }
  }

  const cancelHandler = () => {
    setTitle(originalTitle);
    setDescription(originalDescription);
    setColors(originalColors);
    setEditing(false);
  }

  const deleteHandler = async () => {
    setBoardData((board) => {
      if (board) {
        
        const cell = board.cellsData.find((col) => col.id === cellId);
        
        if (cell) {
          const cardIndex = cell.items.findIndex((c) => c.id === cardId);

          if (cardIndex !== -1) {
            cell.items.splice(cardIndex, 1);
            return {...board};
          }
        }
      }
      return board;
    });

    deleteCard(boardId, cellId, cardId, failFetchCallback);
  }

  const handleCheckboxChange = (color: string) => {
    if (colors.includes(color)) {
      setColors(colors.filter((selectedColor) => selectedColor !== color));
    } else {
      setColors([...colors, color]);
    }
  };

  const renderMarkersCheckbox = () => (
    <div>
      <CheckboxLabel color="red">
        <StyledInput
          type="checkbox"
          value="red"
          checked={colors?.includes('red')}
          onChange={() => handleCheckboxChange('red')}
        />
      </CheckboxLabel>
      <CheckboxLabel color="green">
        <StyledInput
          type="checkbox"
          value="green"
          checked={colors?.includes('green')}
          onChange={() => handleCheckboxChange('green')}
        />
      </CheckboxLabel>
      <CheckboxLabel color="blue">
        <StyledInput
          type="checkbox"
          value="blue"
          checked={colors?.includes('blue')}
          onChange={() => handleCheckboxChange('blue')}
        />
      </CheckboxLabel>
    </div>
  );

  return (
    <CardContainer
      ref={elementRef}
      draggable={!isEditing}
      onDragStart={() => dragStartHandler(cell)}
      onDragLeave={dragLeaveHandler}
      onDragEnd={dragLeaveHandler}
      onDragOver={dragOverHandler}
      onDrop={dropHandler}
    >
      {isEditing ? (
        <EditWrapper>
          {renderMarkersCheckbox()}
          <CardTitleInput type="text" value={title} onChange={(e) => setTitle(e.target.value)} />
          <CardDescriptionInput
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <IconWrapper>
            <div onClick={cancelHandler}>
              <Cross />
            </div>
            <div onClick={saveUpdateCardHandler}>
              <Ok />
            </div>
          </IconWrapper>
        </EditWrapper>
      ) : (
        <>
          {colors?.length ?
            <StyledMarkerList>
              {colors.map(el => <StyledMarker key={el} color={el} />)}
            </StyledMarkerList>
            : null
          }
          <StyledCardTitle>{title}</StyledCardTitle>
          <StyledCardDescription>{description}</StyledCardDescription>
          <BottomWrapper>
            <IconWrapper>
              <div onClick={editHandler}>
                <Edit />
              </div>
              <div onClick={deleteHandler}>
                <Delete />
              </div>
            </IconWrapper>
          </BottomWrapper>
        </>
      )}
    </CardContainer>
  );
};
