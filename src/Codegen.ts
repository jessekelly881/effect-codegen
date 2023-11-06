import { pipe } from "@effect/data/Function";
import * as Match from "@effect/match"
import ts from "typescript";

interface NumberType {
    _tag: "NumberType";
}

interface StringType {
    _tag: "StringType";
}

interface BooleanType {
  _tag: "BooleanType";
}

type SimpleType = NumberType | StringType | BooleanType;

export interface ArrayCombinator {
  _tag: "ArrayCombinator";
  type: TypeReference;
}

export interface TupleCombinator {
  _tag: "TupleCombinator";
  type: TypeReference[];
}

export interface UnionCombinator {
  _tag: "UnionCombinator";
  types: Array<TypeReference>;
}

export interface LiteralCombinator {
  _tag: "LiteralCombinator";
  value: string | number | boolean;
}

type Combinator = ArrayCombinator | TupleCombinator | UnionCombinator | LiteralCombinator;

type TypeReference = SimpleType | Combinator;


// constructors

export const stringType: StringType = {
  _tag: "StringType",
};

export const numberType: NumberType = {
    _tag: "NumberType",
};

export const booleanType: BooleanType = {
  _tag: "BooleanType",
};

export function unionCombinator(
  types: Array<TypeReference>,
  name?: string
): UnionCombinator {
  return {
    _tag: "UnionCombinator",
    types,
  };
}

export function literalCombinator(
  value: string | number | boolean,
  name?: string
): LiteralCombinator {
  return {
    _tag: "LiteralCombinator",
    value,
  };
}

export function arrayCombinator(
  type: TypeReference,
  name?: string
): ArrayCombinator {
  return {
    _tag: "ArrayCombinator",
    type,
  };
}