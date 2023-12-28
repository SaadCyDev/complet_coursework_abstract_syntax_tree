import React, { useEffect, useRef, useState } from "react";
import axios from "axios";

function Ast() {
  let displayCode1 = useRef();
  let refTextArea1 = useRef();
  let refTextArea2 = useRef();
  let [selectedFile1, setSelectedFile1] = useState(null);
  let [selectedFile2, setSelectedFile2] = useState(null);
  let [similarity, setSimilarity] = useState("0");
  let [otherSimilarity, setOtherSimilarity] = useState("0");

  useEffect(() => {
    axios.defaults.baseURL = "http://localhost:1234";
  }, []);

  let readFile = (selectedFile) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const fileContent = e.target.result;
      console.log(fileContent);
    };
    reader.readAsText(selectedFile);
  };

  const handleTextAreaChange1 = (event) => {
    const file = event.target.files[0];

    if (file) {
      if (file.name.endsWith(".txt")) {
        setSelectedFile1(file);
        //readFile(file);
        event.target.value = null;
      } else {
        alert("Please select a text file");
        event.target.value = null;
      }
    }
  };

  const handleTextAreaChange2 = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.name.endsWith(".txt")) {
        setSelectedFile2(file);
        //readFile(file);
        event.target.value = null;
      } else {
        alert("Please select a text file");
        event.target.value = null;
      }
    }
  };

  const handleASTComparison = async () => {
    try {
      let dataToSend = new FormData();
      dataToSend.append("files", selectedFile2);
      dataToSend.append("files", selectedFile1);

      let reqOptions = {
        method: "POST",
        body: dataToSend,
      };

      let convertedData = await fetch(
        "http://localhost:1234/AbstractSyntax",
        reqOptions
      );
      let JSOData = await convertedData.json();
      console.log(JSOData.status);
      if (JSOData.status == "success") {
        console.log(JSOData.data);
        setSimilarity(JSOData.data[0]);
        setOtherSimilarity(JSOData.data[1]);
      } else {
        setSimilarity(JSOData.data);
      }
    } catch (e) {
      alert("Error uploading files", e);
    }
  };

  return (
    <div>
      <div className="divInputs">
        <label>Code 1:</label>
        <input
          type="file"
          accept=".txt"
          onChange={handleTextAreaChange1}
          //ref={refTextArea1}
        ></input>

        <label>Code 2:</label>
        <input
          type="file"
          accept=".txt"
          onChange={handleTextAreaChange2}
          //ref={refTextArea2}
        ></input>
      </div>
      <div className="divFiles">
        <h6> {selectedFile1 && <p>Selected File 1:{selectedFile1.name}</p>}</h6>
        <h6> {selectedFile2 && <p>Selected File 2:{selectedFile2.name}</p>}</h6>
      </div>
      <div className="divButton">
        <button
          onClick={handleASTComparison}
          disabled={!selectedFile1 || !selectedFile2}
          style={{
            backgroundColor:
              !selectedFile1 || !selectedFile2 ? "#ccc" : "#3498db",
          }}
        >
          AST comparison{" "}
        </button>
      </div>
      <div>
        <h1>Result </h1>
      </div>
      <div className="divSim">
        <h3>Data Similarity : {similarity} % </h3>
        <h3>Other things Similarity : {otherSimilarity} % </h3>
      </div>
    </div>
  );
}

export default Ast;
