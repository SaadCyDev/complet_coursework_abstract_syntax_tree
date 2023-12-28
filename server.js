const express = require("express");
const multer = require("multer");
const cors = require("cors");
const fs = require("node:fs");
const path = require("node:path");
const langDetect = require("langdetect");
// const { parse, walk2 } = require("abstract-syntax-tree");

const app = express();
const port = 1234;

app.use(cors());

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads");
  },
  filename: function (req, file, cb) {
    console.log(file);

    cb(null, `${Date.now()}_${file.originalname}`);
  },
});

const upload = multer({ storage: storage });

app.use("/uploads", express.static("uploads"));

const util = require("util");
const readFileAsync = util.promisify(fs.readFile);
let readFile = async (file, nameFile) => {
  try {
    const fileContent = await readFileAsync(file, "utf-8");
    //console.log(fileContent);
    return fileContent;
  } catch (err) {
    console.log("Error reading file", err);
    throw { error: "Internal server error" };
  }
};
//npm install acon-walk
const acorn = require("acorn");
const walk = require("acorn-walk");
const options = {
  ecmaVersion: 2022,
};
let acornastComparison = (file, options) => {
  const dataList = [];

  walk.simple(acorn.parse(file), {
    Literal(node) {
      // console.log(node.value);
      dataList.push(node.value.toString());
    },
  });

  return dataList;
};

//
//new method
let extractFunctionsAndClasses = async (code) => {
  const ast = await acorn.parse(code, { ecmaVersion: 2022 });

  const functions = [];
  const classes = [];

  // Traverse the AST to extract function names and class names
  walk.simple(ast, {
    FunctionDeclaration(node) {
      functions.push(node.id.name);
    },
    ClassDeclaration(node) {
      classes.push(node.id.name);
    },
  });

  return { functions, classes };
};

let compareFunctionsAndClasses = async (code1, code2) => {
  const result1 = await extractFunctionsAndClasses(code1);
  const result2 = await extractFunctionsAndClasses(code2);

  console.log("Functions in Code 1:", result1.functions);
  console.log("Functions in Code 2:", result2.functions);
  console.log("Classes in Code 1:", result1.classes);
  console.log("Classes in Code 2:", result2.classes);
  // console.log(result1.functions.length);
  // console.log(result2.functions.length);
  const commonElements = result1.functions.filter((element) =>
    result2.functions.includes(element)
  );
  let similarityFunctions =
    (commonElements.length /
      Math.max(result1.functions.length, result2.functions.length)) *
    100;
  // console.log(similarityFunctions);
  // Compare function and class names
  const commonFunctions = result1.functions.filter((name) =>
    result2.functions.includes(name)
  );
  const commonClasses = result1.classes.filter((name) =>
    result2.classes.includes(name)
  );

  console.log("Common Functions:", commonFunctions);
  console.log("Common Classes:", commonClasses);
  return similarityFunctions;
};

let dataComparison = async (data1, data2) => {
  let similarityData = 0;
  const commonData = await data1.filter((data0) => data2.includes(data0));
  similarityData =
    (commonData.length / Math.max(data1.length, data2.length)) * 100;
  console.log(similarityData);
  return similarityData;
};
//

app.post("/AbstractSyntax", upload.array("files", 2), async (req, res) => {
  try {
    const file1 = req.files[0].path;
    const nameFile1 = req.files[0].originalname;
    let ast1 = await readFile(file1, nameFile1);

    const file2 = req.files[1].path;
    const nameFile2 = req.files[1].originalname;

    let ast2 = await readFile(file2, nameFile2);

    console.log(
      "******************************  data file 1 **********************************"
    );
    const data1List = await acornastComparison(ast1.toString(), options);
    console.log(acornastComparison(ast1.toString(), options));
    console.log(
      " ******************************************data file 2***************************************"
    );
    const data2List = await acornastComparison(ast2.toString(), options);
    console.log(acornastComparison(ast2.toString(), options));
    console.log(
      "****************************************** End files ******************************************\n\n\n"
    );

    console.log(
      "****************************************** Comparison Functions, Classes and Data *************************************** "
    );
    console.log(data1List);
    console.log(data2List);
    let dataPercentage = await dataComparison(data1List, data2List);

    let otherExpressionPercentage = await compareFunctionsAndClasses(
      ast1.toString(),
      ast2.toString()
    );
    console.log(
      "********************* Data comparison ***************************"
    );

    //
    //
    console.log("Data similarity ", dataPercentage.toFixed(2));
    console.log("\n");
    console.log("Other things similarity", otherExpressionPercentage);
    console.log("\n\n");
    console.log("similarity");
    let total = [dataPercentage.toFixed(2), otherExpressionPercentage];
    console.log(total);
    res.json({
      status: "success",
      message: "Files uploaded successfully.",
      data: total,
    });
  } catch (e) {
    console.log("error handling file upload");
    res.json({
      status: "failure",
      message: "the codes have different size",
      data: 0,
    });
  }
});

app.listen(port, () => {
  console.log("Server is running on ${port}");
});
