import { useEffect } from "react"

function App() {
  useEffect(()=>{
    async function testFetch (){
      const res = await fetch('http://localhost:3000/api/speakers')
      const data = await res.json()
      console.log(data)
    }
    testFetch()
  }, [])

  return <h1>front2</h1>
}

export default App
