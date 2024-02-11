import {useState, Dispatch, SetStateAction} from 'react';
import styled from 'styled-components';
import { Card } from '../Card/Card';
import { Plus as PlusIcon } from '../Icons';
import { ICell, IHoliday, IBoard, ICard } from '../../Interfaces';

const Cell = styled.div<{ $isOutsideMonth: boolean }>`
  width: 100%;
  height: 130px;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8px;
  border: 1px solid #ccc;
  overflow-y: auto;
  background-color: ${({ $isOutsideMonth }) => ($isOutsideMonth ? '#f5f5f5' : 'white')};
`;

const TopWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  margin-bottom: 6px;
`;

const DateWrapper = styled.div`
  display: flex;
`;

const CardsList = styled.ul`
  width: 100%;
`;

const CardsCount = styled.span`
  display: flex;
  align-items: center;
  font-size: 12px;
  margin-left: 6px;
  color: var(--disabled);
`;

const PlusWrapper = styled.div`
  margin-top: auto;
  cursor: pointer;

  &:hover {
    .plusIcon path {
      fill: var(--accent);
    }
  }
`;

const Plus = styled(PlusIcon)`
  path {
    fill: var(--disabled);
    transition: fill 0.3s ease;
  }

  ${PlusWrapper}:hover & {
    path {
      fill: var(--accent);
    }
  }
`;

const HolidayShower = styled.div`
  font-size: 12px;
  font-weight: 600;
  color: var(--accentThird);
  position: relative;

  &:hover {
    .plusIcon path {
      fill: var(--accent);
    }
  }
`;

const HolidayModal = styled.ul`
  position: absolute;
  display: flex;
  flex-direction: column;
  top: 25px;
  right: 0;
  padding: 3px;
  border-radius: 4px;
  background-color: var(--input);
  z-index: 2;
  gap: 4px;
`;

const HolidayCountry = styled.ul`
  font-weight: 400;
  color: var(--disabled);
`;

const HolidayName = styled.ul`
  margin-left: 4px;
  color: var(--darkText);
`;

type Props = {
  day: string;
  cellId: number;
  boardId: string;
  currentCell: ICell | undefined;
  countriesData: IHoliday[] | undefined;
  dragOverHandler: (e: React.DragEvent<HTMLDivElement>) => void;
  dropCardHandler: (e: React.DragEvent<HTMLDivElement>, cellId: number) => void;
  failFetchCallback: () => void;
  setCurrentCell: Dispatch<SetStateAction<ICell | null>>;
  setCurrentCard: Dispatch<SetStateAction<ICard | null>>;
  setHoveredCard: Dispatch<SetStateAction<ICard | null>>;
  setBoardData: Dispatch<SetStateAction<IBoard | null>>;
  addCardHandler: (cellId: number) => void;
  $isOutsideMonth: boolean;
};

const DayCell = (props: Props) => {
  const { 
    day, 
    cellId,
    boardId, 
    currentCell, 
    countriesData,
    dragOverHandler, 
    dropCardHandler, 
    failFetchCallback,
    setCurrentCell,
    setCurrentCard,
    setHoveredCard,
    setBoardData,
    addCardHandler,
    ...restProps
  } = props;

  const [isShowHolidays, setIsShowHolidays] = useState(false);

  const showHolidaysHandler = () => {
    setIsShowHolidays(!isShowHolidays);
  };

  return (
    <Cell
      {...restProps}
      onDragOver={(e) => dragOverHandler(e)}
      onDrop={(e) => dropCardHandler(e, cellId)}
    >
      <TopWrapper>
        <DateWrapper>
          <span>{day}</span>
          {currentCell?.items.length ? 
            (<CardsCount>
              {currentCell.items.length}
              {currentCell.items.length > 1 ? ' cards' : ' card'}
            </CardsCount>) 
            : null
          }
        </DateWrapper>
        {countriesData?.length ?
          (<HolidayShower
          onMouseOver={showHolidaysHandler}
          >holidays
            {isShowHolidays ?
                <HolidayModal>
                  {countriesData.map((country: IHoliday) => 
                    (<li key={countriesData.indexOf(country)}>
                      <HolidayCountry>{country.name}</HolidayCountry>
                      <HolidayName>{country.localName}</HolidayName>
                    </li>))}
                </HolidayModal>
                : null
              } 
          </HolidayShower>)
        : null}
      </TopWrapper>
      <CardsList>
        {currentCell && currentCell.items.length ? (
          <>
            {currentCell.items.map((item: ICard) => (
              <Card
                key={item.id}
                card={item}
                cell={currentCell}
                boardId={boardId}
                failFetchCallback={failFetchCallback}
                setCurrentCell={setCurrentCell}
                setCurrentCard={setCurrentCard}
                setHoveredCard={setHoveredCard}
                setBoardData={setBoardData}
              />
            ))}
          </>
        ) : null}
      </CardsList>
      <PlusWrapper onClick={() => addCardHandler(cellId)}>
        <Plus />
      </PlusWrapper>
    </Cell>
  );
};

export default DayCell;
