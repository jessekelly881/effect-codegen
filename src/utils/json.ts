import * as S from "@effect/schema/Schema";
import * as PR from "@effect/schema/ParseResult";

// Borrowed from @effect/schema head
// TODO: Remove me when updating @effect/schema/Schema
export const parseJson = <I, A extends string>(self: S.Schema<I, A>, options?: {
    reviver?: Parameters<typeof JSON.parse>[1]
    replacer?: Parameters<typeof JSON.stringify>[1]
    space?: Parameters<typeof JSON.stringify>[2]
  }): S.Schema<I, unknown> => {
    const schema: S.Schema<I, unknown> = S.transformResult(self, S.unknown, (s) => {
      try {
        return PR.success<unknown>(JSON.parse(s, options?.reviver))
      } catch (e: any) {
        return PR.failure(PR.type(schema.ast, s, e.message))
      }
    }, (u) => {
      try {
        return PR.success(JSON.stringify(u, options?.replacer, options?.space) as A) // this is safe because `self` will check its input anyway
      } catch (e: any) {
        return PR.failure(PR.type(schema.ast, u, e.message))
      }
    })
    return schema
  }

export const ParseJson: S.Schema<string, unknown> = parseJson(S.string)