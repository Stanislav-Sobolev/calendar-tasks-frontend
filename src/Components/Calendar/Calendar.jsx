import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import moment from 'moment';
import DayCell from '../DayCell/DayCell';

const CalendarContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 180px);
`;

const Calendar = () => {
  const [selectedDate, setSelectedDate] = useState(moment());

  useEffect(() => {
    moment.locale('en'); // Set the desired default locale
  }, []);

  const startOfMonth = moment(selectedDate).startOf('month');
  const endOfMonth = moment(selectedDate).endOf('month');
  const startDate = moment(startOfMonth).startOf('week');
  const endDate = moment(endOfMonth).endOf('week');

  const days = [];
  let currentDate = startDate;

  while (currentDate.isSameOrBefore(endDate)) {
    const isOutsideMonth = !currentDate.isBetween(startOfMonth, endOfMonth, null, '[]');
    days.push(
      <DayCell
        key={currentDate.format('YYYY-MM-DD')}
        day={currentDate.format('D')}
        $isOutsideMonth={isOutsideMonth}
      />
    );
    currentDate.add(1, 'days');
  }

  return (
    <div>
      <div>
        <button onClick={() => setSelectedDate(moment(selectedDate).subtract(1, 'month'))}>
          Previous Month
        </button>
        {selectedDate.format('MMMM YYYY')}
        <button onClick={() => setSelectedDate(moment(selectedDate).add(1, 'month'))}>
          Next Month
        </button>
      </div>
      <CalendarContainer>{days}</CalendarContainer>
    </div>
  );
};

export default Calendar;
