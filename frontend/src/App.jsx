import { useEffect, useRef, useState } from "react";
import { drawNetwork } from "./network";
import "./App.css";

function App(){
  const svgRef = useRef(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    let cleanup = () => {};
    let active = true;
    fetch(
      "http://127.0.0.1:5001/api/network",
      { signal: controller.signal }
    )
    .then(response => {
      if(!response.ok){
        throw new Error("Network request failed");
      }

      return response.json();
    })
    .then(data => {
      if(!active) return;

      cleanup = drawNetwork(
        svgRef.current,
        data
      );

      setStats({
        nodes: data.nodes.length,
        edges: data.links.length
      });

      setLoading(false);
    })

    .catch(err => {
      if(!active) return;

      setError(err.message);
      setLoading(false);
    });

    return () => {
      active = false;
      controller.abort();
      cleanup();
    };
  }, []);

  return (
    <div className = "app">
      <h1>
        Citation Network Visualization in FSU
        (dms22e, Daniel Stein)
      </h1>

      {loading && <p>Loading citation network...</p>}

      {error && <p className="error">{error}</p>}

      {stats && (
        <p>
          Papers: {stats.nodes} |
          Citation Links: {stats.edges}
          
        </p>
      )}
      <svg ref = {svgRef} className = "network" />
    </div>
  );
}
export default App;