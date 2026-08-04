import './App.css'
import { useEffect, useState } from 'react';

function App() {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    fetch('http://localhost:3000/getWikiData?range=2')
      .then((response) => response.json())
      .then((wikiData) => setData(wikiData.data));
  }, []);

  return (
    <div>
      {data.map((item, index) => (
        <div key={index}>{item.rank}. {item.page_title} — {item.view_count} views</div>
      ))}
    </div>
  );
}

export default App