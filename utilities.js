const jwt = require("jsonwebtoken")

function authenticateToken(req, res, next){
    try {
        const authHeader = req.headers['authorization']
        const token = authHeader && authHeader.split(" ")[1]
        console.log(token)

        if(!token) {
            return res.sendStatus(401).json({msg:'access token is required'});
        }
        
        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) =>{
            if(err) return res.sendStatus(403).json({msg:"Invalid token"});
            req.user=user;
            next();
        })
    } catch (error) {
        console.log(error)
    }
}


module.exports ={
    authenticateToken,
}





