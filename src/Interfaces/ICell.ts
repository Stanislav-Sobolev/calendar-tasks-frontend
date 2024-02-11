import {ICard} from './ICard'

export interface ICell { 
    id: string; 
    title: string; 
    items: ICard[]; 
}