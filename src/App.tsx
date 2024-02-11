import { useState, useEffect } from 'react';
import { saveAs } from 'file-saver';
import html2canvas from 'html2canvas';
import styled from 'styled-components';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { getBoardById, nextPublicHolidaysWorldwide, availableCountries } from './helpers/fetchers';

import { IBoard, IHoliday, ICountry } from './Interfaces';
import { Calendar } from './Components/Calendar/Calendar';

const AppContainer = styled.div`
  width: 100%;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  flex-direction: column;
`;

const SearchPanel = styled.div`
  display: flex;
  padding: 10px;
`;

const StyledInput = styled.input`
  display: block;
  width: 100%;
  font-size: 14px;
  font-weight: 600;
  padding: 6px;
`;

const CheckboxLabel = styled.label<{ color: string }>`
  display: inline-block;
  width: 20px;
  height: 20px;
  margin-right: 6px;
  cursor: pointer;
  background-color: ${({ color }) => color};
`;

const FilterColorWrapper = styled.div`
  display: flex;
  gap: 8px;
`;

const FilterColorText = styled.div`
  display: flex;
  align-items: baseline;
  font-size: 14px;
  font-weight: 600;
`;

const BtnWrapper = styled.div`
  display: flex;
  margin-bottom: 10px;
`;

const StyledFileInput = styled.input`
  display: none;
`;

const SecondaryButton = styled.label`
  padding: 2px 4px;
  font-size: 14px;
  background-color: var(--inputBackground);
  color: var(--disabled);
  border: 1px solid var(--disabled);
  border-radius: 4px;
  cursor: pointer;
  margin-right: 8px;

  &:hover {
    background-color: var(--accentSecondary);
  }
`;

export const App = () => {
  const [searchTerm, setSearchTerm] = useState<string>('1');
  const [holidays, setHolidays] = useState<IHoliday[] | null>(null);
  const [countries, setCountries] = useState<ICountry[] | null>(null);
  const [fetchedBoard, setFetchedBoard] = useState<IBoard | null>(null);
  const [filteredBoard, setFilteredBoard] = useState<IBoard | null>(null);
  const [filteredColors, setFilteredColors] = useState<string[]>(['red', 'green', 'blue']);
  const [filterText, setFilterText] = useState<string>('');

  
  useEffect(() => {
    fetchBoard(searchTerm);
    fetchHolidays();
  }, []);

  useEffect(() => {
    setFilteredBoard(fetchedBoard);
  }, [fetchedBoard]);

  useEffect(() => {
    if (fetchedBoard) {
      setFilteredBoard(prev => {
        const updatedBoard = { ...fetchedBoard };
        updatedBoard.cellsData = updatedBoard.cellsData.map(cell =>{

          const updatedCell = cell.items.filter(card => {
            const isTextIncluded = card.title.toLowerCase().includes(filterText.toLowerCase());
            const isDescriptionIncluded = card.description.toLowerCase().includes(filterText.toLowerCase());
            const isFIlteredColorsIncluded = filteredColors.some(str1 => card.colors.some(str2 => str1 === str2));

            return (isTextIncluded && isFIlteredColorsIncluded) || (isDescriptionIncluded && isFIlteredColorsIncluded)
          });          

          return { ...cell, items: updatedCell}
        });

        return updatedBoard;
      });
    }
  }, [filterText, filteredColors, fetchedBoard]);

  const handleFilterCheckboxChange = (color: string) => {
    if (filteredColors.includes(color)) {
      setFilteredColors(filteredColors.filter((selectedColor) => selectedColor !== color));
    } else {
      setFilteredColors([...filteredColors, color]);
    }
  };

  const fetchBoard = async (defaultBoardId: string) => {
    try {
      const boardId = defaultBoardId ?? searchTerm;
      
      const resBoard = await getBoardById(boardId);
    
      if (resBoard) {
        setFetchedBoard(resBoard);
      }
    } catch (error: any) {
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('An error occurred');
      }
    }
  };

  const fetchHolidays = async () => {
    try {
      const resCountries = await availableCountries();
      const resHolidays = await nextPublicHolidaysWorldwide();
    
      if (resCountries) {
        setCountries(resCountries);
      }

      if (resHolidays) {
        setHolidays(resHolidays);
      }
    } catch (error: any) {
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('An error occurred');
      }
    }
  };

  const failFetchCallback = () => {
    toast.error('Sorry, try again');
    fetchBoard(searchTerm);
  };

  const exportAsImage = () => {
    const calendarContainer = document.getElementById('calendar-container');

    if (calendarContainer) {
      html2canvas(calendarContainer).then((canvas) => {
        canvas.toBlob((blob) => {
          if (blob) {
            saveAs(blob, 'calendar.png');
          } else {
            console.error('Error creating image blob.');
          }
        });
      });
    }
  };

  const exportCalendar = () => {
    const jsonCalendarData = JSON.stringify(filteredBoard, null, 2);
    const blob = new Blob([jsonCalendarData], { type: 'application/json' });
    saveAs(blob, 'calendar.json');
  };

  const importCalendar = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importedData = JSON.parse(e.target?.result as string);
          setFetchedBoard(importedData);
        } catch (error) {
          console.error('Error parsing JSON:', error);
        }
      };
      reader.readAsText(file);
    }
  };

  const renderMarkersCheckbox = () => (
    <FilterColorWrapper>
      <FilterColorText>Filter Colors</FilterColorText>
      <div>
        <CheckboxLabel color="red">
          <StyledInput
            type="checkbox"
            value="red"
            checked={filteredColors.includes('red')}
            onChange={() => handleFilterCheckboxChange('red')}
          />
        </CheckboxLabel>
        <CheckboxLabel color="green">
          <StyledInput
            type="checkbox"
            value="green"
            checked={filteredColors.includes('green')}
            onChange={() => handleFilterCheckboxChange('green')}
          />
        </CheckboxLabel>
        <CheckboxLabel color="blue">
          <StyledInput
            type="checkbox"
            value="blue"
            checked={filteredColors.includes('blue')}
            onChange={() => handleFilterCheckboxChange('blue')}
          />
        </CheckboxLabel>
      </div>
    </FilterColorWrapper>
  );

  return (
    <AppContainer>
      <ToastContainer />
      <SearchPanel>
        <StyledInput
          type="text"
          value={filterText}
          placeholder="filter text"
          onChange={(e) => setFilterText(e.target.value)}
        />
      </SearchPanel>
      {renderMarkersCheckbox()}
      <BtnWrapper>
        <StyledFileInput type="file" accept=".json" id="customFileInput" onChange={importCalendar} />
        <SecondaryButton htmlFor="customFileInput">Import Calendar</SecondaryButton>
        <SecondaryButton onClick={exportCalendar}>Export Calendar</SecondaryButton>
        <SecondaryButton onClick={exportAsImage}>Export as Image</SecondaryButton>
      </BtnWrapper>
      {filteredBoard && countries && holidays ?
        <Calendar 
          boardData={filteredBoard}
          countries={countries}
          holidays={holidays}
          setBoardData={setFetchedBoard}
          failFetchCallback={failFetchCallback}
        />
      : null}
    </AppContainer>
  );
};
