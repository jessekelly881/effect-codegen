/**
 * @since 1.0.0
 */
import { ParseYaml } from "@/utils/Schema";
import { Parser, Schema } from "@effect/schema";

const Type = Schema.literal(
	"string",
	"integer",
	"number",
	"object",
	"boolean",
	"array"
);

interface DataModel {
	readonly $ref?: string;

	readonly description?: string;
	readonly example?: string | object; // TODO: stringify
	readonly type?: Schema.Schema.To<typeof Type>;
}

/**
 * JSON Schema-ish OpenApi Schema definition
 */
const DataModel: Schema.Schema<DataModel> = Schema.lazy<DataModel>(() =>
	Schema.struct({
		$ref: Schema.string,

		description: Schema.string,
		example: Schema.union(Schema.string, Schema.object),
		type: Type
	}).pipe(Schema.partial)
);

const HttpMethod = Schema.literal(
	"get",
	"put",
	"post",
	"delete",
	"options",
	"head",
	"patch",
	"trace"
);

const Response = Schema.struct({
	description: Schema.string.pipe(Schema.optional)
});

// e.g. GET /users
const Endpoint = Schema.struct({
	operationId: Schema.string,
	description: Schema.string,
	summary: Schema.string.pipe(Schema.optional),
	responses: Schema.record(Schema.string, Response).pipe(Schema.optional),
	externalDocs: Schema.struct({
		url: Schema.string,
		description: Schema.string.pipe(Schema.optional)
	})
}).pipe(Schema.partial);

export const OpenApiSchema = Schema.struct({
	basePath: Schema.string.pipe(Schema.optional),
	info: Schema.struct({
		title: Schema.string,
		description: Schema.string.pipe(Schema.optional),
		version: Schema.string
	}),
	servers: Schema.array(
		Schema.struct({
			description: Schema.string.pipe(Schema.optional),
			url: Schema.string
		})
	).pipe(Schema.optional),
	paths: Schema.record(
		Schema.string,
		Schema.record(HttpMethod, Endpoint).pipe(Schema.partial)
	).pipe(Schema.optional), // TODO: Decide what to do about missing paths

	components: Schema.struct({
		schemas: Schema.record(Schema.string, DataModel)
	}).pipe(Schema.optional)
});

export type OpenApiSchema = Schema.Schema.To<typeof OpenApiSchema>;

export const decodeFromString = ParseYaml.pipe(
	Schema.compose(OpenApiSchema),
	Parser.decode
);
