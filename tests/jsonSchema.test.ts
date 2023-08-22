import * as _ from "../src/jsonSchema";
import { describe, it, expect } from "vitest"


const expectToRender = (schema: _.JsonSchema, result: string) => 
    expect(_.toSchemaString(schema)).toEqual(result)

describe("JSON Schema", () => {
    it("object", () => expectToRender({ type: "object" }, "S.object"))
    it("string", () => expectToRender({ type: "string" }, "S.string"))
    it("number", () => expectToRender({ type: "number" }, "S.number"))
    it("boolean", () => expectToRender({ type: "boolean" }, "S.boolean"))
    it("integer", () => expectToRender({ type: "integer" }, "S.number.pipe(S.int())"))
    it("null", () => expectToRender({ type: "null" }, "S.null"))
    it("array", () => expectToRender({ type: "array" }, "S.array(S.unknown)"))

    it("object/ properties", () => {
        const obj: _.JsonSchema = { type: "object", properties: { foo: { type: "string" } } }

        expectToRender(obj, "S.struct({ foo: S.string })")
    })

    it("number/ minimum", () => expectToRender({ type: "number", minimum: 4 }, "S.number"))
})