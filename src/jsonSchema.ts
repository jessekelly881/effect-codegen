import ts from "typescript";
import * as TSFactoryUtils from "./utils/TSFactory";
import { pipe } from "@effect/data/Function";
import * as Effect from "@effect/io/Effect";
import * as RefParser from "@apidevtools/json-schema-ref-parser";


export const decodeSchema = (val: unknown) => Effect.async<never, Error, JsonSchema>((resume) => { 
  RefParser.parse(val, (err, schema) => {
    if(!err && "type" in schema) {
      resume(Effect.succeed(schema))
    }
    else {
      resume(Effect.fail(err)) 
    }
  })
})



export type JsonSchema = Exclude<Parameters<typeof RefParser.dereference>[1], string>

const toSchemaTsNode = (schema: JsonSchema): ts.Expression => {
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
          properties[key] = toSchemaTsNode(schema.properties[key] as JsonSchema)
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

export const toSchemaString = (schema: JsonSchema): string => 
  TSFactoryUtils.toString([toSchemaTsNode(schema)])