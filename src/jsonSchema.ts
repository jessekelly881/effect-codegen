import * as S from "@effect/schema/Schema";
import * as Doc from "@effect/printer/Doc"
import * as SchemaUtils from "./utils/Schema";

const NullSchema = S.struct({ type: S.literal("null") })
const BooleanSchema = S.struct({ type: S.literal("boolean") })

const StringSchema = S.struct({
  type: S.literal("string"),
});

const NumericSchema = S.struct({ // number | integer
  type: S.literal("number", "integer"),
});

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
    NullSchema,
    StringSchema,
    NumericSchema,
    BooleanSchema,
    ObjectSchema,
    ArraySchema
).pipe(S.partial)

export type JSONSchema = S.To<typeof JSONSchema>

export const ParseJsonSchema = SchemaUtils.ParseJson.pipe(S.compose(JSONSchema));

export const toDoc = (schema: JSONSchema) => {
    switch(schema.type) {
        case "object": return Doc.text("S.object")
        case "string": return Doc.text("S.string")
        case "number": return Doc.text("S.number")
        case "boolean": return Doc.text("S.boolean")
        case "number": return Doc.text("S.number")
        case "integer": return Doc.text("S.number.pipe(S.int())")
        case "null": return Doc.text("S.null")
        case "array": return Doc.text("S.array(S.unknown)")
    }
  return Doc.text("")
}