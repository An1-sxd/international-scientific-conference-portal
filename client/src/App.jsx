import { useEffect, useState } from "react";

function App() {
  const [counter, setCounter] = useState(1);

  useEffect(() => {
    async function testFetch() {
      const res = await fetch("http://localhost:3000/api/certificates/check?certificateId=CERT-2026-0001");
      console.log(res);
      const data = await res.json();
      console.log(data)
    }
    testFetch();
  }, []);
  return <h1>front{counter}</h1>;
}

export default App;
