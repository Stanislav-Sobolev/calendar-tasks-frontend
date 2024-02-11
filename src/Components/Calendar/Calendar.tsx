import React, { 
  useState, 
  useEffect, 
  useRef,
  Dispatch, 
  SetStateAction 
} from 'react';
import styled from 'styled-components';
import moment from 'moment';
import DayCell from '../DayCell/DayCell';
import { toast } from 'react-toastify';
import cardEmptyTemplate from '../../assets/json/cardEmptyTemplate.json';
import { createCard, dndCard } from '../../helpers/fetchers';
import { Ok as OkIcon, Cross as CrosIcon } from '../Icons';
import { IBoard, ICountry, IHoliday, ICell, ICard } from '../../Interfaces';

const CalendarContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 190px);
`;

const CheckboxLabel = styled.label`
  display: inline-block;
  width: 20px;
  height: 20px;
  margin-right: 6px;
  cursor: pointer;
  ${({ color }) => `background-color: ${color};`}
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 2;
`;

const ModalWrapper = styled.div`
  background-color: #fff;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  border-radius: 8px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  z-index: 3;
`;

const StyledInput = styled.input`
  display: block;
  width: 100%;
  font-size: 16px;
  font-weight: 700;
  padding: 6px;
`;

const StyledIconWrapper = styled.div`
  display: flex;
  height: 22px;
  justify-content: flex-end;
  gap: 8px;
  margin-left: 8px;
  align-items: center;
`;

const Ok = styled(OkIcon)`
  cursor: default;
  stroke: var(--successColor);
`;

const Cross = styled(CrosIcon)`
  height: 16px;
  path {
    fill: var(--errorColor);
  }
`;

const StyledButtonWrapper = styled.div`
  display: flex;
  justify-content: center;
  gap: 12px;
  align-items: baseline;
  margin-bottom: 8px;
`;

const StyledButton = styled.button`
  padding: 10px 22px;
  font-size: 16px;
  font-weight: 600;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.3s ease;

  background-color: var(--accent);
  color: #fff;

  &:hover {
    background-color: var(--accentThird);
  }
`;

const StyledCalendarTitle = styled.span`
  display: flex;
  width: 170px;
  font-size: 22px;
  font-weight: 600;
  justify-content: center;
  color: var(--accent);
`;

type Props = {
  boardData: IBoard;
  countries: ICountry[];
  holidays: IHoliday[];
  failFetchCallback: () => void;
  setBoardData: Dispatch<SetStateAction<IBoard | null>>;
};

export const Calendar = (props: Props) => {
  const {
    boardData, 
    countries, 
    holidays, 
    failFetchCallback, 
    setBoardData
  } = props;
  const { id: boardId, cellsData } = boardData;

  const [days, setDays] = useState<JSX.Element[]>([]);
  const [currentCell, setCurrentCell] = useState<ICell | null>(null);
  const [currentCard, setCurrentCard] = useState<ICard | null>(null);
  const [hoveredCard, setHoveredCard] = useState<ICard | null>(null);
  const [activeCellId, setActiveCellId] = useState<number | null>(null);
  const [isShowModal, setIsShowModal] = useState<boolean>(false);
  const [description, setDescription] = useState<string>('');
  const [title, setTitle] = useState<string>('');
  const [colors, setColors] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState(moment());

  const refCurrentCard = useRef<ICard | null>();
  const refCurrentCell  = useRef<ICell | null>();
  const refHoveredCard  = useRef<ICard | null>();
  refCurrentCard.current = currentCard;
  refCurrentCell.current = currentCell;
  refHoveredCard.current = hoveredCard;

  useEffect(() => {
    if (cellsData && holidays && countries) {
      const startOfMonth = moment(selectedDate).startOf('month');
      const endOfMonth = moment(selectedDate).endOf('month');
      const startDate = moment(startOfMonth).startOf('week');
      const endDate = moment(endOfMonth).endOf('week');

      const countedDays = [];
      let currentDate = startDate;
            
      const cellsRange = cellsData.filter(el => {

        return moment.unix(Number(el.id)).isSameOrAfter(moment.unix(startDate.unix())) && moment.unix(Number(el.id)).isSameOrBefore(moment.unix(endDate.unix()));
      })
      
      while (currentDate.isSameOrBefore(endDate)) {
        const isOutsideMonth = !currentDate.isBetween(startOfMonth, endOfMonth, null, '[]');
        const currentCellData = cellsRange.find(el => moment.unix(Number(el.id)).format('YYYY-MM-DD') === currentDate.format('YYYY-MM-DD'));
        const currentHolidays = holidays.filter(el => el.date === moment(currentDate).format('YYYY-MM-DD'));
        let countriesData;

        if (currentHolidays.length) {
          countriesData = currentHolidays.map(el => {

            const countryFound = countries.find(country => el.countryCode === country.countryCode);

            return {...el, name: countryFound?.name ?? ''}
          });
        }

        countedDays.push(
          <DayCell
            key={currentDate.format('YYYY-MM-DD')}
            day={currentDate.format('D')}
            cellId={currentDate.unix()}
            $isOutsideMonth={isOutsideMonth}
            boardId={boardId}
            currentCell={currentCellData}
            countriesData={countriesData}
            dragOverHandler={dragOverHandler}
            dropCardHandler={dropCardHandler}
            failFetchCallback={failFetchCallback}
            setCurrentCell={setCurrentCell}
            setCurrentCard={setCurrentCard}
            setHoveredCard={setHoveredCard}
            setBoardData={setBoardData}
            addCardHandler={addCardHandler}

          />
        );
        currentDate.add(1, 'days');
      }

      setDays(countedDays)
    }
  }, [cellsData, boardData, countries, holidays, selectedDate]);

  useEffect(() => {
    moment.locale('en'); // Set the desired default locale
  }, []);

  const dragOverHandler = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const dropCardHandler = async (e: React.DragEvent<HTMLDivElement>, cellId: number) => {
    e.preventDefault();
    
    if (refCurrentCard.current && refCurrentCell.current && cellsData) {
      let dropIndex = 0;

      if (refHoveredCard.current) {
        const cellToDrop = cellsData.find(el => el.id === cellId);
        const isCardExist = cellToDrop ? cellToDrop.items.indexOf(refHoveredCard.current) : -1;
        dropIndex = isCardExist !== -1 ? isCardExist : 0;
      }

      setBoardData((board) => {
        if (board && refCurrentCard.current) {
          let cellFrom: ICell | undefined = board.cellsData.find((col) => col.id === refCurrentCell.current?.id);
          let cellTo = board.cellsData.find((col) => col.id === cellId);

          if (!cellTo) {
            const newCell = { "title": "day", "items": [], id: cellId };
            board.cellsData.push(newCell);
            cellTo = board.cellsData.find((col) => col.id === cellId);
          }

          if (cellFrom && cellTo) {
            const currentCardIndex = cellFrom.items.indexOf(refCurrentCard.current);
            cellFrom.items.splice(currentCardIndex, 1);
            cellFrom.items = [...cellFrom.items];

            cellTo.items.splice(dropIndex + 1, 0, refCurrentCard.current);
            cellTo.items = [...cellTo.items];

            return { ...board };
          }
        }
        return board;
      });
     
      dndCard(boardId, refCurrentCell.current.id, refCurrentCard.current.id, cellId, dropIndex + 1, failFetchCallback);
    }

    const target = e.target as HTMLDivElement;
    target.style.boxShadow = 'none';
  };

  const addCardHandler = (cellId: number) => {
    setActiveCellId(cellId);
    setIsShowModal(true);
  }

  const cancelHandler = () => {
    setTitle('');
    setDescription('');
    setIsShowModal(false);
    setActiveCellId(null);
  }

  const saveUpdateHandler = () => {
    const createdCard = { ...cardEmptyTemplate, id: Date.now(), title, description, colors };

    if (activeCellId && title && description) {
      setBoardData((board) => {
        if (board) {
          let foundCell = board.cellsData.find((col) => col.id === activeCellId);

          if (!foundCell) {
            const newCell = {"title": "day", "items": [], id: activeCellId}
            board.cellsData.push(newCell)
            foundCell = board.cellsData.find((col) => col.id === activeCellId);
          }
          
          if (foundCell) {
            foundCell.items.push(createdCard);
            
            return {...board};
          }
        }
        return board;
      });
  
      createCard(boardId, activeCellId, createdCard, failFetchCallback);
      cancelHandler();
    } else {
      toast.error('Please, fill Title, Description');
    }
  };

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
          checked={colors.includes('red')}
          onChange={() => handleCheckboxChange('red')}
        />
      </CheckboxLabel>
      <CheckboxLabel color="green">
        <StyledInput
          type="checkbox"
          value="green"
          checked={colors.includes('green')}
          onChange={() => handleCheckboxChange('green')}
        />
      </CheckboxLabel>
      <CheckboxLabel color="blue">
        <StyledInput
          type="checkbox"
          value="blue"
          checked={colors.includes('blue')}
          onChange={() => handleCheckboxChange('blue')}
        />
      </CheckboxLabel>
    </div>
  );

const renderModal = () => (
    <>
      <ModalOverlay>
        <ModalWrapper>
          {renderMarkersCheckbox()}
          <StyledInput
            type="text"
            value={title}
            placeholder="title"
            onChange={(e) => setTitle(e.target.value)}
          />
          <StyledInput
            type="text"
            value={description}
            placeholder="description"
            onChange={(e) => setDescription(e.target.value)}
          />
          <StyledIconWrapper>
            <div onClick={cancelHandler}>
              <Cross />
            </div>
            <div onClick={saveUpdateHandler}>
              <Ok />
            </div>
          </StyledIconWrapper>
        </ModalWrapper>
      </ModalOverlay>
    </>
  );

 return (
    <div id="calendar-container">
      <StyledButtonWrapper>
        <StyledButton onClick={() => setSelectedDate(moment(selectedDate).subtract(1, 'month'))}>
          Previous Month
        </StyledButton>
        <StyledCalendarTitle>
          {selectedDate.format('MMMM YYYY')}
        </StyledCalendarTitle>
        <StyledButton onClick={() => setSelectedDate(moment(selectedDate).add(1, 'month'))}>
          Next Month
        </StyledButton>
      </StyledButtonWrapper>
      {isShowModal ? renderModal() : null}
      <CalendarContainer>{days}</CalendarContainer>
    </div>
  );
};
