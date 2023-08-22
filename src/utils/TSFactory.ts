import ts from "typescript";

export const addJsDocComment = (node: ts.Node, documentation: string): void => {
  ts.addSyntheticLeadingComment(
    node,
    ts.SyntaxKind.MultiLineCommentTrivia,
    `* ${documentation} `,
    true
  );
};

export const toString = (
  nodes: ts.Node[],
  printerOptions?: ts.PrinterOptions
): string => {
  const sourceFile = ts.createSourceFile(
    "print.ts",
    "",
    ts.ScriptTarget.Latest,
    false,
    ts.ScriptKind.TS
  );
  const printer = ts.createPrinter(printerOptions);

  return printer.printList(
    ts.ListFormat.MultiLine,
    ts.factory.createNodeArray(nodes),
    sourceFile
  ).trim();
};

const primitive = (name: string, call:boolean = false) => {
  const e = ts.factory.createPropertyAccessExpression(
    ts.factory.createIdentifier("S"),
    ts.factory.createIdentifier(name)
  );

  return call ? ts.factory.createCallExpression(e, undefined, []) : e
}

export const combinator =
  (name: string) =>
  (...es: ts.Expression[]) =>
    ts.factory.createCallExpression(
      ts.factory.createPropertyAccessExpression(
        ts.factory.createIdentifier("S"),
        ts.factory.createIdentifier(name)
      ),
      undefined,
      es
    );

export const callMethod =
  (name: string, es: ts.Expression[]) =>
  (self: ts.Expression) =>
    ts.factory.createCallExpression(
      ts.factory.createPropertyAccessExpression(
        self,
        ts.factory.createIdentifier(name)
      ),
      undefined,
      es
    );

export const string = primitive("string");
export const number = primitive("number");
export const bigint = primitive("bigint");
export const boolean = primitive("boolean");
export const symbol = primitive("symbol");
export const object = primitive("object");

export const array = combinator("array");
export const union = combinator("union");
export const tuple = combinator("tuple");

export const unknown = primitive("unknown");
export const null_ = primitive("null");

export const int = primitive("int", true);

export const struct = (properties: Record<string, ts.Expression>) =>
  combinator("struct")(
    ts.factory.createObjectLiteralExpression(Object.keys(properties).map(s => 
      ts.factory.createPropertyAssignment(s, properties[s])
    )
  ))

export {
    null_ as null,
}