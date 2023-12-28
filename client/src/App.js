import logo from "./logo.svg";
import "./App.css";
import Ast from "./components/Ast";

function App() {
  return (
    <div className="App">
      <h1>Abstract Syntax Tree</h1>
      <div>
        <Ast />
      </div>
    </div>
  );
}

export default App;
