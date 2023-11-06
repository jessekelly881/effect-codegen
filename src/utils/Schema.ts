import { ParseResult, Schema } from "@effect/schema";
import YAML from "yaml";

export const parseYaml = <I, A extends string>(self: Schema.Schema<I, A>) =>
	Schema.transformOrFail(
		self,
		Schema.unknown,
		(s, _, ast) => {
			try {
				return ParseResult.success<unknown>(YAML.parse(s));
			} catch (e: any) {
				return ParseResult.failure(ParseResult.type(ast, s, e.message));
			}
		},
		(u, _, ast) => {
			try {
				return ParseResult.success(YAML.stringify(u));
			} catch (e: any) {
				return ParseResult.failure(ParseResult.type(ast, u, e.message));
			}
		},
		{ strict: false }
	);

export const ParseYaml: Schema.Schema<string, unknown> = parseYaml(
	Schema.string
);
