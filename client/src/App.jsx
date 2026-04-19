import { useEffect, useState } from "react";

function App() {
  const [counter,setCounter] = useState(1)

  useEffect(()=>{
    async function testFetch(){
      const res = await fetch('http://localhost:3000/')
      console.log(res)
    }
    testFetch()
  },[])
  return <h1>front{counter}</h1>;
}

export default App;
