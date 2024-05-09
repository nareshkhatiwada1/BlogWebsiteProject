import express from "express";
import Post from '../models/Post.js'
import User from '../models/user.js'
import bcrypt from "bcrypt";
import jwt from 'jsonwebtoken';




const router = express.Router();

const adminLayout = '../views/layouts/admin';
const jwtSecret=process.env.JWT_SECRET;


// check login  middleware
// ROUTE

const authMiddleware = (req,res,next)=>{
    const token = req.cookies.token;

    if(!token){
        return res.status(401).json({message:"Unauthorized"});
    }
    try{
        const decoded =jwt.verify(token, process.env.JWT_SECRET);
        req.userId = decoded.userId;
        next();
    }catch(error){
        res.status(401).json({message: 'unauthorized'});
    }
}


// get
// ROUTE
router.get('/admin', async (req,res)=>{
    
    try {
        
        const locals = {
            title : 'Admin',
            descrip : "Simple Blog created with Nodejs, express and mongodb"
        }
        res.render('admin/index',{locals, layout:adminLayout});

    } catch (error) {
        console.log(error);
        
    }
});

// Post admin check in
// ROUTE

router.post('/admin', async (req,res)=>{
    
    try {
        
        const {username , password  } = req.body;

        const user = await User.findOne({username});

        if(!user){
            return res.status(401).json({message:"Invalid credentials"})
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if(!isPasswordValid){
            return res.status(401).json({message:"Invalid credentials"})
        }

        const token = jwt.sign({ userId: user._id},process.env.JWT_SECRET );
        res.cookie('token',token,{httpOnly:true});
        res.redirect('/dashboard');

    } catch (error) {
        console.log(error);
        
    }
});



// get admin dashboard
// ROUTE

router.get('/dashboard', authMiddleware, async (req,res)=>{

    try {
        const locals = {
            title : "Dashboard",
            description : "Simple Blog created with NodeJs, Express and MongoDb."
        }
        const data = await Post.find();
        res.render('admin/dashboard',{
            data,
            locals,
            layout:adminLayout});
    } catch (error) {
        
    }
    
});



// get admin create new post
// ROUTE
router.get('/add-post', authMiddleware, async (req,res)=>{

    try {
        const locals = {
            title : "Add Post",
            description : "Simple Blog created with NodeJs, Express and MongoDb."
        }
        const data = await Post.find();
        res.render('admin/add-post',{
            locals,
            layout:adminLayout});
    } catch (error) {
        
    }
    
});

// POST admin dashboard
// ROUTE
router.post('/add-post', authMiddleware, async (req,res)=>{

    try {
        try {
            const newPost = new Post ({
                title: req.body.title,
                body:req.body.body
            });
            await Post.create(newPost);
            res.redirect('/dashboard');
        } catch (error) {
            console.log(error)
        } 
    } catch (error) {
        console.log(error)
    }
    
});

// get edit and delete post
// ROUTE
router.get('/edit-post/:id', authMiddleware, async (req,res)=>{

    try {
        const locals = {
            title : "Add Post",
            description : "Simple Blog created with NodeJs, Express and MongoDb."
        }
        
        const data = await Post.findOne({_id: req.params.id});

        res.render("admin/edit-post",{
            data,
            locals,
            layout: adminLayout
       });
    } catch (error) {
        console.log(error)
    }
    
});

// put edit and delete post
// ROUTE
router.put('/edit-post/:id', authMiddleware, async (req,res)=>{

    try {
       await Post.findByIdAndUpdate(req.params.id,{
        title: req.body.title,
        body: req.body.body,
        updateAt:Date.now()
       });
       res.redirect(`/edit-post/${req.params.id}`);
    } catch (error) {
        console.log(error)
    }
    
});


// Post admin register
// ROUTE

router.post('/register', async (req,res)=>{
    
    try {
        
        const {username , password} = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);

        try{
            const user = await User.create({username, password:hashedPassword})
            res.status(201).json({message:'user Created',user});
        }catch(error){
            if(error.code ===11000){
                res.status(409).json({message:'user already in use'})
            }
            res.status(500).json({message:'internal server error'})
        }
        

    } catch (error) {
        console.log(error);
        
    }
});

//  delete post
// admin - delete post 
router.delete('/delete-post/:id', authMiddleware, async (req,res)=>{

    try {
        await Post.deleteOne({_id: req.params.id});
        res.redirect('/dashboard')
    } catch (error) {
        console.log(error);
    }
    
});

/*Get 
Admin Logout */
router.get('/logout',(req,res)=>{
    const token = req.cookies.token;
    res.clearCookie('token');

    res.redirect('/admin')


})


export default router;