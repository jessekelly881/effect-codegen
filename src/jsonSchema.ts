import * as S from "@effect/schema/Schema";
import * as SchemaUtils from "./utils/Schema";
import ts from "typescript";
import * as TSFactoryUtils from "./utils/TSFactory";
import { pipe } from "@effect/data/Function";

const NullSchema = S.struct({ type: S.literal("null") })
const BooleanSchema = S.struct({ type: S.literal("boolean") })

const StringSchema = S.struct({
  type: S.literal("string"),
});

// number | integer
const NumericSchema = S.extend( 
  S.struct({ type: S.literal("number", "integer") }),
  S.struct({
    minimum: S.number,
  }).pipe(S.partial)
);

interface ObjectSchema {
    readonly type: "object";
    readonly properties?: Record<string, JSONSchema>;
    readonly required?: ReadonlyArray<string>
}

const ObjectSchema: S.Schema<ObjectSchema> = S.lazy(() =>
  S.extend(
    S.struct({ type: S.literal("object") }),
    S.struct({
      properties: S.record(S.string, JSONSchema),
      required: S.array(S.string),
    }).pipe(S.partial)
  )
);

interface ArraySchema {
    readonly type: "array";
    readonly items?: JSONSchema | ReadonlyArray<JSONSchema>;
    readonly uniqueItems?: boolean;
    readonly contains?: JSONSchema
}
const ArraySchema: S.Schema<ArraySchema> = S.lazy(() => S.extend(
  S.struct({ type: S.literal("array") }),
  S.struct({
    items: S.union(JSONSchema, S.array(JSONSchema)),
    uniqueItems: S.boolean,
  }).pipe(S.partial)
));

export const JSONSchema = S.union(
    NullSchema,
    StringSchema,
    NumericSchema,
    BooleanSchema,
    ObjectSchema,
    ArraySchema
)

export type JSONSchema = S.To<typeof JSONSchema>

export const ParseJsonSchema = SchemaUtils.ParseJson.pipe(S.compose(JSONSchema));


const toSchemaTsNode = (schema: JSONSchema): ts.Expression => {
  switch(schema.type) {
    case "boolean": return TSFactoryUtils.boolean
    case "number": {
      return TSFactoryUtils.number
    }
    case "string": return TSFactoryUtils.string
    case "object": {
      let properties: Record<string, ts.Expression> = {};
      if(schema.properties) {
        const required = schema.required;

        Object.keys(schema.properties).forEach((key) => {
          properties[key] = toSchemaTsNode(schema.properties[key])
        })
        return TSFactoryUtils.struct(properties);
      }
      else return TSFactoryUtils.object
    }
    case "null": return TSFactoryUtils.null
    case "array": return TSFactoryUtils.array(TSFactoryUtils.unknown)
    case "integer": return pipe(TSFactoryUtils.number, TSFactoryUtils.callMethod("pipe", [TSFactoryUtils.int]))
  }
}

export const toSchemaString = (schema: JSONSchema): string => 
  TSFactoryUtils.toString([toSchemaTsNode(schema)])