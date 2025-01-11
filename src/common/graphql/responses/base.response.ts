import { Field, ObjectType, Int } from '@nestjs/graphql';
import { Type } from '@nestjs/common';

export interface IBaseResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  hasNext: boolean;
}

export function createBaseResponse<T>(
  classRef: Type<T>,
): Type<IBaseResponse<T>> {
  @ObjectType({ isAbstract: true })
  abstract class BaseResponseType implements IBaseResponse<T> {
    @Field(() => [classRef])
    items: T[];

    @Field(() => Int)
    total: number;

    @Field(() => Int)
    page: number;

    @Field(() => Int)
    limit: number;

    @Field()
    hasNext: boolean;
  }

  return BaseResponseType as Type<IBaseResponse<T>>;
}

@ObjectType()
export class BaseResponse {
  @Field()
  success: boolean;

  @Field({ nullable: true })
  message?: string;

  @Field({ nullable: true })
  error?: string;
}
