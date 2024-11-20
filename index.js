require('dotenv').config();

const config = require('./config.json');
const mongoose = require('mongoose');
const User = require('./models/user.model')
const Note = require('./models/note.model')
const bcrypt = require('bcryptjs')
mongoose.connect(config.connectionString)

const express = require('express')

const cors = require('cors')
const app = express()

const jwt = require('jsonwebtoken')
const {authenticateToken }= require('./utilities')

app.use(express.json())

app.use(
    cors({
        origin:'*'
    })
)


app.get('/', (req, res) =>{
    res.json({data:'Hello'})
})

// create new user
app.post('/create-account', async(req, res)=>{
    const {fullName, email, password} = req.body;

    try {
        if(!fullName){
            return res.status(400).json({error:true, message:'Full name is required'}); 
        }
        if(!email){
            return res.status(400).json({error:true, message:'Full email is required'});
        }
        if(!password){
            return res.status(400).json({error:true, message:'Full password is required'});
        }
    
        const existingUser = await User.findOne({email:email});
        if(existingUser){
            return res.status(400).json({error:true, message:'User already exists Please login'})
        }
        
        const user = new User({
            fullName,
            email,
            password
        });
    
        await user.save()
    
        const accessToken = jwt.sign({user},process.env.ACCESS_TOKEN_SECRET,{ expiresIn:'24h'});
    
        return res.json({
            error:false,
            user,
            accessToken,
            message:'Registration Successfully'
        })
        
    } catch (error) {
        return res.status(500).json({
            error:true,
            msg:'Internal server error'
        })
    }
  
})

// user login
app.post('/login', async(req, res) =>{
    const {email, password} = req.body;
    try {
        if(!email){
            return res.json({msg:'email is required'})
        }
        if(!password){
            return res.json({msg:'password is required'})
        }

        const userInfo = await User.findOne({email:email});

        if(!userInfo){
            return res.json({msg:'user is not register'})
        }

        if(userInfo.email == email && userInfo.password == password){
            const user = {user:userInfo}
            const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET,{expiresIn:'24h'})
            console.log(accessToken)

            return res.json({
                error:true,
                msg:'Login successfully',
                email,
                accessToken, 
            })
        }else{
            return res.status(400).json({
                error:true, 
                msg:'Invalid credentials',
            })
        }

    } catch (error) {
        return res.status(500).json({
            error:true,
            msg:'Internal server error'
        })
    }
})

app.get('/get-user', authenticateToken, async(req, res) =>{
    const {user} = req.user;

    const isUser = await User.findOne({_id:user._id});
    console.log(isUser)

    if(!isUser){
        return res.status(401).json({
            error:true,
            msg:'No user data'
        })
    }

    return res.status(200).json({
        user:{
            fullName: isUser.fullName, 
            email:isUser.email, 
            "_id":isUser._id, 
            createdOn: isUser.createdOn
        },
        msg:'User is get successfully'
    })
})


// add note
app.post('/:userId/add-note', authenticateToken, async (req, res) => {
    const userID = req.params.userId;
    req.body.userId = userID
    const { title, content, tags } = req.body;
    const user = req.user;  

    try {
        // Validation checks
        if (!title) {
            return res.status(400).json({ error: true, msg: 'Title is required' });
        }
        if (!content) {
            return res.status(400).json({ error: true, msg: 'Content is required' });
        }

        // Create and save note
        const note =await Note.create({
            title,
            content,
            tags: tags || [],  // Default empty array if tags are not provided
            userId: userID,
        });

        // await note.save();

        return res.status(201).json({
            error: false,
            note,
            msg: 'Note added successfully',
        });

    } catch (error) {
        console.error('Error adding note:', error);  
        return res.status(500).json({
            error: true,
            msg: 'Internal server error',
        });
    }
});

// edit note
// app.put('/edit-note/:noteId', authenticateToken, async (req, res) => {
    
//     const noteId = req.params.noteId;
//     const {title, content, tags, isPinned} = req.body;
//     const user = req.user;
//     // console.log(user._id)

//     if(!noteId && !user._id){
//         return res.status(400).json({error:true, msg:'Missing parameters'})
//     }

//     // if(!title && !content && !tags){
//     //     return res.status(400).json({error:true, msg:'No changes made'});
//     // }

//     try {
        
//         const note = await Note.findOne({_id:noteId, userId:user._id});
//         console.log(note)
//         if(!note){
//             return res.status(404).status(404).json({error:true, msg:'Note not found'});
//         }

//         const updateFields = {}
//         if(title) updateFields.title = title;
//         if(content) updateFields.content=content;
//         if(tags) updateFields.tags = tags;
//         if(typeof isPinned === 'boolean') updateFields.isPinned = isPinned;

//         // await note.save();
//         const updateNote = await Note.updateOne({_id:noteId},{$set:updateFields})

//         // console.log(note)
//         return res.status(201).json({
//             error:false,
//             updateNote, 
//             msg:'Note updated successfully',
//         })


//     } catch (error) {
//         return res.status(500).json({
//             error:true,
//             msg:'Internal server error'
//         })
//     }
    

// })

// chat gpt
// app.put('/edit-note/:noteId', authenticateToken, async (req, res) => {
//     const noteId = req.params.noteId;
//     const { title, content, tags, isPinned } = req.body;
//     const user = req.user;

//     console.log('User :', user)
  
//     // Validate input data (optional, based on your requirements)
//     if (!noteId || !user._id) {
//       return res.status(400).json({ error: true, msg: 'Missing required parameters' });
//     }
  
//     try {
//       // Find the note to be edited, ensuring user ownership
//       const note = await Note.findOne({ _id: noteId, userId: user._id });
//       if (!note) {
//         return res.status(404).json({ error: true, msg: 'Note not found or unauthorized access' });
//       }
  
//       // Update only the modified fields for efficiency
//       const updatedFields = {};
//       if (title) updatedFields.title = title;
//       if (content) updatedFields.content = content;
//       if (tags) updatedFields.tags = tags;
//       if (typeof isPinned === 'boolean') updatedFields.isPinned = isPinned;
  
//       // Perform the update with a single call to `updateOne`
//       const updatedNote = await Note.updateOne({ _id: noteId }, { $set: updatedFields });
  
//       // Check if the update actually modified a document
//       if (updatedNote.modifiedCount === 0) {
//         return res.status(400).json({ error: true, msg: 'No changes to update' });
//       }
  
//       // Retrieve the updated note for response (optional)
//       const updatedNoteData = await Note.findOne({ _id: noteId });
  
//       return res.status(200).json({
//         error: false,
//         msg: 'Note updated successfully',
//         note: updatedNoteData || note, // Include updated data if desired
//       });
//     } catch (error) {
//       console.error('Error updating note:', error);
//       return res.status(500).json({ error: true, msg: 'Internal server error' });
//     }
//   });


app.put('/edit-note/:noteId', authenticateToken, async (req, res) => {
    const noteId = req.params.noteId;
    const { title, content, tags, isPinned } = req.body;
    const user = req.user;
  
    console.log('User :', User.userId);
  
    // Validate input data
    if (!noteId || !user._id) {
      return res.status(400).json({ error: true, msg: 'Missing required parameters' });
    }
  
    try {
      // Update only the modified fields
      const updatedFields = {};
      if (title) updatedFields.title = title;
      if (content) updatedFields.content = content;
      if (tags) updatedFields.tags = tags;
      if (typeof isPinned === 'boolean') updatedFields.isPinned = isPinned;
  
      // Find and update the note in one go
      const updatedNote = await Note.findOneAndUpdate(
        { _id: noteId, userId: user._id },
        { $set: updatedFields },
        { new: true } // Return the updated document
      );
  
      if (!updatedNote) {
        return res.status(404).json({ error: true, msg: 'Note not found or unauthorized access' });
      }
  
      return res.status(200).json({
        error: false,
        msg: 'Note updated successfully',
        note: updatedNote,
      });
    } catch (error) {
      console.error('Error updating note:', error);
      return res.status(500).json({ error: true, msg: 'Internal server error' });
    }
  });
  


// get all note
app.get("/:userId/get-all-notes", authenticateToken, async(req, res) =>{
    const userID = req.params.userId
    // req.body.userId = userID;
    try {
        const notes = await Note.find({userId: userID});
        console.log(notes)

        return res.status(200).json({  
            error:false,
            notes,
            msg:'All notes are get'
        })
    } catch (error) {
        console.log('Get user fetching error', error)
        return res.status(500).json({
            error:true,
            msg:'Internal server error'
        })
    }
})







// delete note
app.delete("/delete-note/:noteId", authenticateToken, async(req, res) =>{
    const user = req.user;
    const noteId = req.params.noteId;

    try {
        const note = await Note.findOne({_id:noteId, userId:user._id});
        if(!note){
            return res.status(404).json({error:true, msg:'Note not found'});
        }
        await Note.deleteOne({_id:noteId, userId:user._id});

        return res.status(200).json({
            error:false,
            msg:'Noted is deleted successfully'
        })

        
    } catch (error) {
        console.log('Error while delete data', error)
        return res.status(500).json({
            error:true,
            msg:'Internal server Error'
        })
    }

})


// update isPinned value of note
app.put("/update-note-pinned/:noteId", authenticateToken, async(req, res) =>{
    const noteId = req.params.noteId;
    const {isPinned} = req.body;
    const user = req.user;

    try {
        const note = await Note.findOne({_id:noteId, userId:user._id});

        if(!note){
            return res.status(404).json({
                error:true,
                msg:'Note not found'
            })
        }

        note.isPinned = isPinned;

        await note.save();

        return res.status(201).json({
            error:false,
            note,
            msg:'Pinned note is updated successfully'
        })
        
    } catch (error) {
        console.log('Internal server error', error)
        return res.status(500).json({
            error:true,
            msg:'Internal server error'
        })
    }
})



app.listen(8000)
module.exports=app