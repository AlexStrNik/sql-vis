#!/usr/bin/env node

const fs = require("fs");
const { draw } = require("./graphvis");

function main() {
  if (process.argv.length != 4) {
    console.log("Usage: sql-vis <input.sql> <output.png>");
    process.exit(1);
  }

  var args = process.argv.slice(2);
  const { spawn } = require("child_process");

  function run(input, output) {
    const dot = spawn("dot", ["-Tpng", "-o", output]);

    fs.readFile(input, {}, function (err, data) {
      if (err) {
        console.log(err);
      }

      try {
        const dotData = draw(data.toString());

        dot.stdin.write(dotData);
        dot.stdin.end();
      } catch (e) {
        console.log(e);
      }
    });
  }

  run(args[0], args[1]);

  console.log("Now watching '" + args[0] + "' !");

  fs.watch(args[0], (event, filename) => {
    if (filename) {
      console.log("File changed! Computing...");

      run(args[0], args[1]);
    }
  });
}

main();
