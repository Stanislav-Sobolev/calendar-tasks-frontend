import axios from "axios"
import { ICreatedCard } from '../Interfaces';

axios.defaults.baseURL = 'https://calendar-tasks-backend.vercel.app';
// axios.defaults.baseURL = 'http://localhost:4000/';

export const getBoardById = async (boardId: string) => {
    const res = await axios.get(`/board/${boardId}`);
    const boardData = res.data;
    
    return boardData;
};

export const createCard = async (boardId: string, cellId: number, cardData: ICreatedCard, failCallback: ()=>void) => {
  try {
    const res = await axios.post(`/card/${boardId}/${cellId}`, cardData);
    const boardData = res.data;
      
    return boardData;
  } catch (error) {
    failCallback && failCallback();
  }
};

export const updateCard = async (boardId: string, cellId: number, cardId: number, updatedData: ICreatedCard, failCallback: ()=>void) => {
  try {
    const res = await axios.put(`/card/${boardId}/${cellId}/${cardId}`, updatedData);
    const boardData = res.data;
      
    return boardData;
  } catch (error) {
    failCallback && failCallback();
  } 
};

export const dndCard = async (
    boardId: string, 
    cellId: number, 
    cardId: number,
    toCellId: number, 
    toCardIndexId: number,
    failCallback: ()=>void
    ) => {
      try {
        const res = await axios.patch(`/card/${boardId}/${cellId}/${cardId}/${toCellId}/${toCardIndexId}`);
        const boardData = res.data;
        
        return boardData;
      } catch (error) {
        failCallback && failCallback();
      }
};

export const deleteCard = async (boardId: string, cellId: number, cardId: number, failCallback: ()=>void) => {
  try {
    const res = await axios.delete(`/card/${boardId}/${cellId}/${cardId}`);
    const boardData = res.data;
    
    return boardData;
  } catch (error) {
    failCallback && failCallback();
  }
};

export const nextPublicHolidaysWorldwide = async () => {
  try {
    const res = await axios.get('https://date.nager.at/api/v3/NextPublicHolidaysWorldwide');

    const holidaysData = res.data;
    
    return holidaysData;
  } catch (error: any) {
    throw Error(error.response?.data?.message)
  }
};

export const availableCountries = async () => {
  try {
    const res = await axios.get('https://date.nager.at/api/v3/AvailableCountries');

    const countriesData = res.data;
    
    return countriesData;
  } catch (error: any) {
    throw Error(error.response?.data?.message)
  }
};

