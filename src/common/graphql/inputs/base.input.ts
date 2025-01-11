import { Field, InputType, Int } from '@nestjs/graphql';
import { Type } from '@nestjs/common';

export interface IBaseInput {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
  search?: string;
}

@InputType()
export class BaseInput implements IBaseInput {
  @Field(() => Int, { nullable: true, defaultValue: 1 })
  page?: number;

  @Field(() => Int, { nullable: true, defaultValue: 10 })
  limit?: number;

  @Field({ nullable: true })
  sortBy?: string;

  @Field({ nullable: true, defaultValue: 'ASC' })
  sortOrder?: 'ASC' | 'DESC';

  @Field({ nullable: true })
  search?: string;
}

export function createBaseInput<T>(): Type<T & IBaseInput> {
  @InputType({ isAbstract: true })
  abstract class BaseInputType extends BaseInput {}

  return BaseInputType as Type<T & IBaseInput>;
}
