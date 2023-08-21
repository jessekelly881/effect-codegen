import * as _ from "../../src/utils/TSFactory";
import { describe, it, expect } from "vitest"

describe("TSFactory", () => {
    it("string", () => expect(_.toString([_.string])).toEqual("S.string"))
})