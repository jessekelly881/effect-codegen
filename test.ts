import * as S from "@effect/schema/Schema";
/**
 * JSON Meta Schema
 */ export const JsonSchema = S.struct({
  first_name: S.string,
  address: S.struct({ street_address: S.string }),
});
