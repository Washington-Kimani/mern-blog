import express from 'express';
import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';


dotenv.config()
const app = express(),
PORT = process.env.PORT || 8000

// const dbUrl = process.env.DB_URL
// mongoose.connect(dbUrl,{
//     useNewUrlParser: true,
//     useUnifiedTopology: true
// }).then(()=>console.log(`Connected to Database`));


//Middlewares;
app.use(express.json());
app.use(express.urlencoded({extended: false}));

const withDB = async  (operations, res) =>{
    try {
        const client =  await MongoClient.connect( `mongodb://127.0.0.1:27017/`);
        const db = client.db("mern_blog");
        await operations(db);
        client.close();
    } catch (error) {
        res.status(500).json({message: "Error connecting to database", error});
    }
}

//ROUTES
app.get('/api/articles/:name',async  (req, res)=>{

    withDB( async (db)=>{
        const articleName = req.params.name;
        const articleInfo = await db.collection('articles').findOne({name: articleName})
        res.status(200).json(articleInfo);
    }, res);
})

app.post('/api/articles/:name/add-comments', (req, res)=>{
    const {username, text} = req.body;
    const articleName = req.params.name;
    withDB( async (db)=>{
        const articleInfo = await db.collection('articles').findOne({name: articleName});
        await  db.collection('articles').updateOne({name: articleName}, {$set: {comments: articleInfo.comments.concat({username, text})}});
        const updateArticleInfo = await db.collection('articles').findOne({name: articleName});
        res.status(200).json(updateArticleInfo);
    }, res);
});

app.listen(PORT,()=> console.log(`Server is Started at port ${PORT}`));