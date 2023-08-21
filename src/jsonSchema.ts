import * as S from "@effect/schema/Schema";
import * as Doc from "@effect/printer/Doc"

const StringSchema = S.struct({
    type: S.literal("string"),
})

interface ObjectSchema {
    readonly type: "object";
    readonly properties?: Record<string, JSONSchema>
}

const ObjectSchema: S.Schema<ObjectSchema> = S.lazy(() =>
  S.struct({
    properties: S.record(S.string, JSONSchema),
  }).pipe(S.partial, S.extend(S.struct({ type: S.literal("object") })))
);

interface ArraySchema {
    readonly type: "array";
    readonly items?: JSONSchema | ReadonlyArray<JSONSchema>;
    readonly uniqueItems?: boolean;
    readonly contains?: JSONSchema
}
const ArraySchema: S.Schema<ArraySchema> = S.lazy(() =>
  S.struct({
    items: S.union(JSONSchema, S.array(JSONSchema)),
    uniqueItems: S.boolean,
  }).pipe(S.partial, S.extend(S.struct({ type: S.literal("array") })))
);

export const JSONSchema = S.union(
    StringSchema,
    ObjectSchema,
    ArraySchema
).pipe(S.partial)

export type JSONSchema = S.To<typeof JSONSchema>

export const parse = S.parse(JSONSchema)