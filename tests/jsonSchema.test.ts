import * as Render from "@effect/printer/Render"
import * as _ from "../src/jsonSchema";
import { describe, it, expect } from "vitest"


const expectToRender = (schema: _.JSONSchema, result: string) => 
    expect(Render.pretty(_.toDoc(schema), { lineWidth: 14 })).toEqual(result)

describe("JSON Schema", () => {
    it("object", () => expectToRender({ type: "object" }, "S.object"))
    it("string", () => expectToRender({ type: "string" }, "S.string"))
    it("number", () => expectToRender({ type: "number" }, "S.number"))
    it("boolean", () => expectToRender({ type: "boolean" }, "S.boolean"))
    it("integer", () => expectToRender({ type: "integer" }, "S.number.pipe(S.int())"))
    it("null", () => expectToRender({ type: "null" }, "S.null"))
    it("array", () => expectToRender({ type: "array" }, "S.array(S.unknown)"))
})