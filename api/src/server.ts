import "dotenv/config";
import express from "express";
import type { Request, Response, NextFunction } from 'express';
import { error } from "node:console";
import { Pool } from 'pg';
import cors from 'cors';

const app = express();
const port = process.env.PORT;
app.use(express.json());
app.use(cors());

// Page views API 
// curl https://wikimedia.org/api/rest_v1/metrics/pageviews/top/en.wikipedia.org/all-access/2026/07/30
// get https://wikimedia.org/api/rest_v1/metrics/pageviews/top/en.wikipedia.org/all-access/{year}/{month}/{day}

const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT ? +process.env.DB_PORT : 5432,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
});


app.get('/health', (req: Request, res: Response) => {
    try {
        return res.json({status: 'ok'})

    } catch {
        console.error('Health function broke')
        return res.json({status: 'error'})
    }
})


const fetchWikiApi = async () => {
    // Get yesterdays date
    const yesterday: Date = new Date();
    yesterday.setDate(yesterday.getDate() - 2)
    const formattedISO = yesterday.toISOString().split('T')[0];
    if(!formattedISO){
        return console.error('Error retrieving yesterdays date')
    }
    const day = formattedISO.split('-')[2]
    const month = formattedISO.split('-')[1]
    const year = formattedISO.split('-')[0]

    try{
        const url = `https://wikimedia.org/api/rest_v1/metrics/pageviews/top/en.wikipedia.org/all-access/${year}/${month}/${day}`
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'docker-basics-practice/1.0 (wardkai558@gmail.com)'
            }
        });
        console.log(response)
        if (!response.ok) {
            return console.error('Wikipedia API error:', response.status, response.statusText);
        }
        const data = await response.json();
        const articles = data.items[0].articles;
       
        for (const element of articles.slice(0, 100)){
            const query = 'INSERT INTO wikidata(page_title, rank, view_count, snapshot_date, fetched_at) VALUES ($1, $2, $3, $4, $5)'
            const values = [element.article,  element.rank, element.views, new Date(`${year}-${month}-${day}`), new Date()];
            await pool.query(query, values);
    }
    } catch (error){
        console.error("Error retrieving pageviews api: ", error)
    }
}   

app.get('/getWikiData', async (req: Request, res: Response) => {
    try {
    // Range will be selectable from a list not an input
    const range = req.query.range ? +req.query.range : 1;

    // Map range to date filter
    const dateRange: Date = new Date();
    dateRange.setDate(dateRange.getDate() - range)

    // Build the query 
    const query = 'SELECT * FROM wikidata WHERE snapshot_date >= $1 ORDER BY rank'

    // Call the query
    const result = await pool.query(query, [dateRange])
    
    // Return query result and rows
    return res.json({status: 'success', data: result.rows})
    
    
    } catch (error){
        console.error(error)
        return res.status(500).json({status: 'error', error: error})
    }
})


app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
    fetchWikiApi().catch((error) => {
        console.error('Error fetching Wiki API:', error);
    });
});