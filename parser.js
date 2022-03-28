const { parse: parseAst } = require("./ast");

const parseColumn = (column, primaryColumns) => {
  return {
    name: column.name,
    type: column.type,
    notNull: column.modifiers.includes("NOT_NULL"),
    autoIncrement: column.modifiers.includes("AUTO_INCREMENT"),
    primaryKey: primaryColumns.includes(column.name),
  };
};

const parseTable = (table) => {
  const primaryColumns = table.constraints
    .filter((c) => c.type === "PRIMARY_KEY")
    .flatMap((c) => c.columns);

  const columns = table.columns
    .map((column) => parseColumn(column, primaryColumns))
    .reduce((columns, column) => {
      columns[column.name] = {
        ...column,
        name: undefined,
      };

      return columns;
    }, {});

  return {
    name: table.name,
    primaryColumns,
    columns,
  };
};

const parseRelationship = (relationship, table, tables) => {
  if (tables[relationship.foreignTable] === undefined) {
    throw new Error(
      `Relationship point to undefined table ${relationship.foreignTable}`
    );
  }
  if (
    tables[relationship.foreignTable].columns[relationship.foreignColumn] ===
    undefined
  ) {
    throw new Error(
      `Relationship point to undefined table column ${relationship.foreignColumn}`
    );
  }

  return {
    from: {
      table: table.name,
      column: relationship.selfColumn,
      mandatory:
        tables[table.name].columns[relationship.selfColumn].notNull ||
        tables[table.name].columns[relationship.selfColumn].primaryKey,
      type: "ONE",
    },
    to: {
      table: relationship.foreignTable,
      column: relationship.foreignColumn,
      mandatory: relationship.foreignMandatory,
      type:
        tables[table.name].columns[relationship.selfColumn].primaryKey &&
        tables[table.name].primaryColumns.length === 1
          ? "ONE"
          : "MANY",
    },
  };
};

const parseRelationships = (table, tables) => {
  return table.constraints
    .filter((c) => c.type === "FOREIGN_KEY")
    .map((relationship) => parseRelationship(relationship, table, tables));
};

const parse = (sql) => {
  const rawTables = parseAst(sql);
  const tables = rawTables.map(parseTable).reduce((tables, table) => {
    tables[table.name] = {
      ...table,
      name: undefined,
    };

    return tables;
  }, {});
  const relationships = rawTables.flatMap((table) =>
    parseRelationships(table, tables)
  );

  return {
    tables,
    relationships,
  };
};

module.exports = {
  parse,
};
