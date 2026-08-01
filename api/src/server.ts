import "dotenv/config";
import express from "express";
import type { Request, Response, NextFunction } from 'express';
import { Pool } from 'pg';


const app = express();
const port = process.env.PORT;
app.use(express.json());


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


app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});