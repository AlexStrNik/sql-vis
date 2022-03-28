const { parse } = require("./parser");

const drawColumn = (column, index, pkCount, count) => {
  const modifiers = [];
  if (column.notNull) {
    modifiers.push("NN");
  }
  if (column.autoIncrement) {
    modifiers.push("AI");
  }

  return `
    <tr>
      <td sides="l" cellpadding="0" port="${column.name}_in_0"></td>
      ${
        index === 0 && column.primaryKey
          ? `<td sides="tbr" rowspan="${5 * pkCount}">PK</td>`
          : index === pkCount
          ? `<td sides="tbr" rowspan="${5 * (count - pkCount)}"></td>`
          : ""
      }
      <td sides="tb" align="left" rowspan="5">${
        column.name
      }: <font color="gray">${column.type}</font></td>
      <td align="right" sides="tb" rowspan="5">${modifiers.join(",")}</td>
      <td sides="r" cellpadding="0" port="${column.name}_out_0"></td>
    </tr>
    ${[1, 2, 3].map(
      (i) =>
        `<tr><td sides="l" cellpadding="0" port="${column.name}_in_${i}"></td><td sides="r" cellpadding="0" port="${column.name}_out_${i}"></td></tr>`
    )}
    <tr>
      <td sides="l${
        index == count - 1 || index == pkCount - 1 ? "b" : ""
      }" cellpadding="0" port="${column.name}_in_4"></td>
      <td sides="rb" cellpadding="0" port="${column.name}_out_4"></td>
    </tr>
  `;
};

const drawTable = (name, table) => {
  const columns = Object.entries(table.columns).map(([name, column]) => ({
    ...column,
    name,
  }));

  columns.sort((a, b) => {
    const aScore = table.primaryColumns.includes(a.name) ? 0 : 1;
    const bScore = table.primaryColumns.includes(b.name) ? 0 : 1;

    const result = aScore - bScore;

    return result || b.name.localeCompare(a.name);
  });

  return `
    ${name} [label=<
      <table cellpadding="10" border="0" cellborder="1" cellspacing="0">
        <tr>
          <td BGCOLOR="lightblue" colspan="5">${name}</td>
        </tr>
        ${columns
          .map((c, i) =>
            drawColumn(c, i, table.primaryColumns.length, columns.length)
          )
          .join("")}
      </table>
    >]
  `;
};

const drawRelationship = (relationship, occupiedPorts) => {
  const fromName = `${relationship.from.table}:${relationship.from.column}_out`;
  const toName = `${relationship.to.table}:${relationship.to.column}_in`;

  return `
    ${fromName}_${occupiedPorts[fromName]++} -> ${toName}_${occupiedPorts[
    toName
  ]++} [arrowhead=${relationship.to.type === "ONE" ? "tee" : "crow"}${
    relationship.to.mandatory ? "tee" : "odot"
  } arrowtail=${relationship.from.type === "ONE" ? "tee" : "crow"}${
    relationship.from.mandatory ? "tee" : "odot"
  } dir=both]
  `;
};

const draw = (sql) => {
  const data = parse(sql);

  const occupiedPorts = Object.fromEntries(
    Object.entries(data.tables).flatMap(([table, t]) =>
      Object.keys(t.columns).flatMap((column) => [
        [`${table}:${column}_in`, 0],
        [`${table}:${column}_out`, 0],
      ])
    )
  );

  return `
  digraph {
    graph [pad="0.5", nodesep="0.5", ranksep="2"];
    node [shape=plain]
    rankdir=LR;

    ${Object.entries(data.tables)
      .map(([name, table]) => drawTable(name, table))
      .join("")} 

    ${data.relationships
      .map((r) => drawRelationship(r, occupiedPorts))
      .join("")}
  }
  `;
};

module.exports = {
  draw,
};
