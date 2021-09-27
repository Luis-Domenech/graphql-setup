import { MiddlewareFn } from 'type-graphql';
import { PAGINATION_LIMIT } from '../constants';
import { MyContext } from '../types';

export const parsePaginationInput:MiddlewareFn<MyContext> = ({context, args}, next) => {


  args.options.limit = args.options.limit ? Math.min(PAGINATION_LIMIT , args.options.limit): PAGINATION_LIMIT

  console.log("Type:", typeof args.options.cursor)

  if (typeof args.options.cursor === 'string' && args.options.cursor === '') {
    args.options.cursor = null
  }  
  
  return next()
};