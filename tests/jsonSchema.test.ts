import * as _ from "../src/jsonSchema";
import { describe, it, expect } from "vitest"


const expectToRender = (schema: _.JsonSchema, result: string) => 
    expect(_.toSchemaString(schema)).toEqual(result)

describe("JSON Schema", () => {
    it("boolean", () => expectToRender({ type: "boolean" }, "S.boolean"))
    it("null", () => expectToRender({ type: "null" }, "S.null"))

    it("object", () => expectToRender({ type: "object" }, "S.object"))

    it("object/ properties", () => {
      const obj: _.JsonSchema = {
        type: "object",
        properties: { foo: { type: "string" } },
      };

      expectToRender(obj, "S.struct({ foo: S.string })");
    });

    // numbers

    it("number", () => expectToRender({ type: "number" }, "S.number"))
    it("integer", () => expectToRender({ type: "integer" }, "S.number.pipe(S.int())"))

    it("number/ minimum", () =>
      expectToRender(
        { type: "number", minimum: 4 },
        "S.number.pipe(S.greaterThanOrEqualTo(4))"
      ));

    it("number/ maximum", () =>
      expectToRender(
        { type: "number", maximum: 4 },
        "S.number.pipe(S.lessThanOrEqualTo(4))"
      ));

    it("number/ minimum, maximum", () =>
      expectToRender(
        { type: "number", minimum: 1, maximum: 4 },
        "S.number.pipe(S.between(1, 4))"
      ));

    it("number/ multipleOf", () =>
      expectToRender(
        { type: "number", multipleOf: 2 },
        "S.number.pipe(S.multipleOf(2))"
      ));

    it("integer/ minimum", () =>
      expectToRender(
        { type: "integer", minimum: 4 },
        "S.number.pipe(S.int(), S.greaterThanOrEqualTo(4))"
      ));

    it("number/ enum", () => 
      expectToRender(
        { type: "number", enum: [1, 2] },
        "S.literal(1, 2)"
      ));

    // strings

    it("string", () => expectToRender({ type: "string" }, "S.string"))

    it("string/ minLength", () =>
      expectToRender(
        { type: "string", minLength: 4 },
        "S.string.pipe(S.minLength(4))"
      ));

    it("string/ maxLength", () =>
      expectToRender(
        { type: "string", maxLength: 4 },
        "S.string.pipe(S.maxLength(4))"
      ));

    it("string/ minLength, maxLength", () =>
      expectToRender(
        { type: "string", minLength: 4, maxLength: 4 },
        "S.string.pipe(S.length(4))"
      ));

    it("string/ pattern", () =>
      expectToRender(
        { type: "string", pattern: "^[a-z]+$" },
        "S.string.pipe(S.pattern(/^[a-z]+$/))"
      ));
    
    it("string/ enum", () =>
      expectToRender(
        { type: "string", enum: ["foo", "bar"] },
        'S.literal("foo", "bar")'
      ));
    
    it("array", () => expectToRender({ type: "array" }, "S.array(S.unknown)"))

    it("array/ maxItems", () =>
      expectToRender(
        { type: "array", maxItems: 4 },
        "S.array(S.unknown).pipe(S.maxItems(4))"
      ));
    
    it("array/ minItems", () =>
      expectToRender(
        { type: "array", minItems: 4 },
        "S.array(S.unknown).pipe(S.minItems(4))"
      ));

    it("array/ minItems, maxItems", () =>
      expectToRender(
        { type: "array", minItems: 4, maxItems: 4 },
        "S.array(S.unknown).pipe(S.itemsCount(4))"
      ));

    it("array/ items(string)", () =>
      expectToRender(
        { type: "array", items: { type: "string", minLength: 2 } },
        "S.array(S.string.pipe(S.minLength(2)))"
      ));

    it("array/ items(object)", () =>
      expectToRender(
        { type: "array", items: { type: "object", properties: { foo: { type: "string" } } } },
        "S.array(S.struct({ foo: S.string }))"
      ));

    it("array/ items(string, number)", () =>
      expectToRender(
        { type: "array", items: [{ type: "string" }, { type: "number" }] },
        "S.tuple(S.string, S.number)"
      ));

    it("oneOf", () =>{
      const schema: _.JsonSchema = {
        oneOf: [
          { type: "string" },
          { type: "number" },
        ]
      }

      expectToRender(schema, "S.union(S.string, S.number)")
    })
})