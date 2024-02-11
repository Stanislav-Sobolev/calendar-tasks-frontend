import {ICard} from './ICard'

export interface ICell { 
    id: number; 
    title: string; 
    items: ICard[]; 
}