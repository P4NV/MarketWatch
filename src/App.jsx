import "./App.css";
import TitleBar from "./components/TitleBar.jsx";
import SimpleLine from "./components/Charts/SimpleLine.jsx";
import TestTest from "./components/Charts/TestTest.jsx";

function App() {

  return (
    <div className='bg-mist-700 h-svh'>
        <TitleBar/>
        <main className='flex w-full'>
            <div className='w-full'>
                {/*<SimpleLine/>*/}
                <TestTest/>
            </div>
        </main>

    </div>
  );
}

export default App;
