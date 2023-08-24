import ts from "typescript";
import * as TSFactoryUtils from "./utils/TSFactory";
import { pipe } from "@effect/data/Function";
import * as Effect from "@effect/io/Effect";
import * as RefParser from "@apidevtools/json-schema-ref-parser";
import { isBoolean } from "@effect/data/Predicate";
import * as StringUtils from "./utils/string";


export type JsonSchema = Exclude<Parameters<typeof RefParser.dereference>[1], string>

interface Config {
  transformTitle: (title: string) => string
}

const defaultConfig: Config = {
  transformTitle: StringUtils.toPascalCase
}


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

const toSchemaTsNode = (schema: JsonSchema, config: Config = defaultConfig): ts.Expression => {
  let filters: ts.Expression[] = [];
  let root = TSFactoryUtils.unknown; 

  if(schema.title) {
    filters.push(
      TSFactoryUtils.primitive("title", [
        ts.factory.createStringLiteral(schema.title),
      ])
    )
  }

  if(schema.description) {
    filters.push(
      TSFactoryUtils.primitive("description", [
        ts.factory.createStringLiteral(schema.description),
      ])
    )
  }

  if(schema.examples) {
    filters.push(
      TSFactoryUtils.primitive("examples", [
        ts.factory.createArrayLiteralExpression(
          schema.examples.map((e:any) => ts.factory.createStringLiteral(e.toString()))
        ),
      ])
    )
  }

  const applyFilters = (node: ts.Expression) =>
    filters.length > 0
      ? pipe(node, TSFactoryUtils.callMethod("pipe", filters))
      : node;

  switch (schema.type) {
    case "boolean":
      return TSFactoryUtils.boolean;

    case "integer":
    case "number": {
      root = TSFactoryUtils.number; 

      if(schema.enum) {
        root = TSFactoryUtils.combinator("literal")( 
            ...schema.enum.map((e) => ts.factory.createNumericLiteral(e.toString()))
        )
      }

      if(schema.type === "integer") {
        filters.push(TSFactoryUtils.int)
      }

      if(schema.multipleOf) {
        filters.push(
          TSFactoryUtils.primitive("multipleOf", [
            ts.factory.createNumericLiteral(schema.multipleOf),
          ])
        )
      }

      if (schema.minimum && schema.maximum) {
        filters.push(
          TSFactoryUtils.primitive("between", [
            ts.factory.createNumericLiteral(schema.minimum),
            ts.factory.createNumericLiteral(schema.maximum),
          ])
        );
      } else {
        if (schema.minimum) {
          filters.push(
            TSFactoryUtils.primitive("greaterThanOrEqualTo", [
              ts.factory.createNumericLiteral(schema.minimum),
            ])
          );
        }
        if (schema.maximum) {
          filters.push(
            TSFactoryUtils.primitive("lessThanOrEqualTo", [
              ts.factory.createNumericLiteral(schema.maximum),
            ])
          );
        }
      }

      return applyFilters(root)
    }
    case "string": {
      root = TSFactoryUtils.string; 

      if(schema.enum) {
        root = TSFactoryUtils.combinator("literal")( 
            ...schema.enum.map((e) => ts.factory.createStringLiteral(e.toString()))
        )
      }

      if(schema.pattern) {
        filters.push(
          TSFactoryUtils.primitive("pattern", [
            ts.factory.createRegularExpressionLiteral(`/${schema.pattern}/`),
          ])
        )
      }

      if(schema.minLength && schema.maxLength && schema.minLength === schema.maxLength) {
        filters.push(
          TSFactoryUtils.primitive("length", [
            ts.factory.createNumericLiteral(schema.minLength),
          ])
        )
      }
      else {
        if (schema.minLength) {
          filters.push(
            TSFactoryUtils.primitive("minLength", [
              ts.factory.createNumericLiteral(schema.minLength),
            ])
          );
        }

        if (schema.maxLength) {
          filters.push(
            TSFactoryUtils.primitive("maxLength", [
              ts.factory.createNumericLiteral(schema.maxLength),
            ])
          );
        }
      }

      return applyFilters(root)
    }
    case "object": {
      const required = Array.isArray(schema.required) ? schema.required : [];
      let properties: Record<string, ts.Expression> = {};

      if (schema.properties) {
        Object.keys(schema.properties).forEach((key) => {
          const expression = toSchemaTsNode(
            schema.properties[key] as JsonSchema
          );

          properties[key] = required.includes(key)
            ? expression
            : TSFactoryUtils.combinator("optional")(expression);
        });
        root =  TSFactoryUtils.struct(properties);
      } 

      else if (schema.patternProperties) {
        const key = Object.keys(schema.patternProperties)[0];

        root = TSFactoryUtils.combinator("record")(
          pipe(
            TSFactoryUtils.string, 
            TSFactoryUtils.callMethod("pipe", [
            TSFactoryUtils.primitive("pattern", [
              ts.factory.createRegularExpressionLiteral(`/${key}/`),
            ])
          ])),
          toSchemaTsNode(schema.patternProperties[key] as JsonSchema)
        );
      }
      
      else {
        root =  TSFactoryUtils.object;
      }

      return applyFilters(root)
    }
    case "null":
      return TSFactoryUtils.null;
    case "array": {
      let items: ts.Expression | ts.Expression[] = TSFactoryUtils.unknown;

      if (schema.items && !isBoolean(schema.items)) {
        if (Array.isArray(schema.items)) {
          items = schema.items.map((item) => toSchemaTsNode(item as any));
        } else {
          items = toSchemaTsNode(schema.items);
        }
      }

      if(schema.maxItems && schema.minItems && schema.maxItems === schema.minItems) {
        filters.push(
          TSFactoryUtils.primitive("itemsCount", [
            ts.factory.createNumericLiteral(schema.maxItems),
          ])
        )
      }
      else {
        if (schema.minItems) {
          filters.push(
            TSFactoryUtils.primitive("minItems", [
              ts.factory.createNumericLiteral(schema.minItems),
            ])
          );
        }

        if (schema.maxItems) {
          filters.push(
            TSFactoryUtils.primitive("maxItems", [
              ts.factory.createNumericLiteral(schema.maxItems),
            ])
          );
        }
      }

      return applyFilters(Array.isArray(items) ? 
        TSFactoryUtils.tuple(...items) :
        TSFactoryUtils.array(items)
      );
    }

    default: {
      // oneOf 
      if(schema.oneOf && !isBoolean(schema.oneOf)) {
        return TSFactoryUtils.union(
          ...schema.oneOf.map((s) => toSchemaTsNode(s as any))
        )
      }

      // anyOf 
      if(schema.anyOf && !isBoolean(schema.anyOf)) {
        return TSFactoryUtils.union(
          ...schema.anyOf.map((s) => toSchemaTsNode(s as any))
        )
      }
    }
  }
};

export const toSchemaString = (schema: JsonSchema): string =>
  TSFactoryUtils.toString([toSchemaTsNode(schema)]);

export const toFile = (schema: JsonSchema, config: Config = defaultConfig): string => {
  const title = schema.title ? config.transformTitle(schema.title) : "Schema";

  return TSFactoryUtils.toString([
    ts.factory.createImportDeclaration(
      undefined,
      ts.factory.createImportClause(
        false,
        undefined,
        ts.factory.createNamespaceImport(ts.factory.createIdentifier("S"))
      ),
      ts.factory.createStringLiteral("@effect/schema/Schema"),
      undefined
    ),
    ts.factory.createVariableStatement(
      [ts.factory.createToken(ts.SyntaxKind.ExportKeyword)],
      ts.factory.createVariableDeclarationList(
        [ts.factory.createVariableDeclaration(
          ts.factory.createIdentifier(title),
          undefined,
          undefined,
          toSchemaTsNode(schema, config),      
        )],
        ts.NodeFlags.Const
      )
    ),
  ]);

}