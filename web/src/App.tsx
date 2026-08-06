import './App.css'
import { useEffect, useState } from 'react';

function App() {
  const [data, setData] = useState<any[]>([]);
  const [selectedPage, setSelectedPage] = useState<string | null>(null);

  useEffect(() => {
    fetch('http://localhost:3000/getWikiData?range=2')
      .then((response) => response.json())
      .then((wikiData) => setData(wikiData.data));
  }, []);


  // Find the max view_count in your data (for scaling bar widths relative to the top page)
  const maxViewCount = Math.max(...data.map(item => item.view_count));
  
  return (
    <div>
    <table>
      <thead>
        <tr>
          <th>Rank</th>
          <th>Page Title</th>
          <th>View Count</th>
        </tr>
      </thead>
      <tbody>
      {data.map((item, index) => (
        <tr key={index} onClick={() => setSelectedPage(item.page_title)} style={{ cursor: 'pointer', backgroundColor: selectedPage === item.page_title ? '#f0f0f0' : 'transparent' }}>
          <td>{item.rank}</td>
          <td>{item.page_title}</td>
          <td>{item.view_count} views</td>
          <td style={{ width: '300px', backgroundColor: '#e0e0e0' }}>
            <div
              style={{
                height: '10px',
                width: `${(item.view_count / maxViewCount) * 100}%`,
                backgroundColor: 'blue'
              }}
            ></div>
          </td>
        </tr>
      ))}
    </tbody>
    </table>

      {selectedPage && (
        <div>
          <h2>Selected Page: {selectedPage}</h2>
        </div>
      )}
    </div>

  );
}

export default App