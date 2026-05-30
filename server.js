
const express=require('express');
const path=require('path');
const app=express();

app.set('view engine','ejs');
app.set('views', path.join(__dirname,'views'));
app.use(express.static(path.join(__dirname,'public')));

const news=require('./database/news.json');
const events=require('./database/events.json');

app.get('/',(req,res)=>res.render('home',{news,events}));
app.get('/news',(req,res)=>res.render('news',{news}));
app.get('/events',(req,res)=>res.render('events',{events}));
app.get('/contact',(req,res)=>res.render('contact'));
app.listen(process.env.PORT || 3000);
