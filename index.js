import app from './app.js';
import connectDB from './src/config/connectdb.js';
import dotenv from 'dotenv';

dotenv.config();

connectDB();

const PORT = process.env.PORT || 5000;

app.listen(PORT,()=>{
    console.log(`Server is running on port ${PORT}` );
    
})
