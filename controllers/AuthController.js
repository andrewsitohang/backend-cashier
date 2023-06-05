// import user from '../models/User.js';
import User from '../models/User.js';
import bcrypt from 'bcrypt';
import jsonwebtoken from 'jsonwebtoken';
import dotenv from 'dotenv';
import { isEmailExist } from '../libraries/isEmailExist.js';

const env = dotenv.config().parsed;

const generateAccessToken = async (payload) => {
    return jsonwebtoken.sign(
        payload,
        env.JWT_ACCESS_TOKEN_SECRET,
        {
            expiresIn: env.JWT_ACCESS_TOKEN_LIFE,
        }
    )
}

const generateRefreshToken = async (payload) => {
    return jsonwebtoken.sign(
        payload,
        env.JWT_REFRESH_TOKEN_SECRET,
        {
            expiresIn: env.JWT_REFRESH_TOKEN_LIFE,
        }
    )
}

const checkEmail = async (req, res) => {
    try{
        // check email exist
        const email = await isEmailExist( req.body.email );
        if(email) { throw { code: 409, message: "EMAIL_EXIST" }}

        // send success response
        return res.status(200).json({
            status: true,
            message: 'EMAIL_NOT_EXIST'
        });
    } catch (err) {
        // send error response
        return res.status(err.code).json({
            status: false,
            message: err.message
        });
    }
}

const register = async (req, res) => {
    try{
        if(!req.body.fullname) { throw { code: 428, message: "Fullname is required" }}
        if(!req.body.email) { throw { code: 428, message: "Email is required" }}
        if(!req.body.password) { throw { code: 428, message: "Password is required" }}

        //check password match
        if(req.body.password !== req.body.retype_password) { 
            throw { code: 428, message: "PASSWORD_NOT_MATCH" }
        }

        // check email exist
        const email = await isEmailExist( req.body.email );
        if(email) { throw { code: 409, message: "EMAIL_EXIST" }}
        
        let salt = await bcrypt.genSalt(10);
        let hash = await bcrypt.hash(req.body.password, salt);

        const newUser = new User({ 
            fullname: req.body.fullname,
            email: req.body.email,
            password: hash,
        });
        const user = await newUser.save();

        if (!user) {throw {code: 500, message: 'USER_REGISTER_FAILED'}};
        
        return res.status(200).json({
            status: true,
            massage: 'USER_REGISTER_SUCCESS',
            user
        });       
    } catch (err) {
        if(!err.code) { err.code = 500 }
        return res.status(err.code).json({
            status: false,
            message: err.message
        });       
    }
}

const login = async (req, res) => {
    try{
        if(!req.body.email) { throw { code: 428, message: "Email is required" }}
        if(!req.body.password) { throw { code: 428, message: "Password is required" }}

        // check email exist
        const user = await User.findOne({ email: req.body.email });
        if(!user) { throw { code: 403, message: "EMAIL_NOT_FOUND" }}

        // check password is match
        const isMatch = await bcrypt.compareSync(req.body.password, user.password);
        if(!isMatch) { throw { code: 403, message: "WRONG_PASSWORD" }}

        // generate token
        const payload = { id: user._id, role: user.role };
        const accessToken = await generateAccessToken(payload)
        const refreshToken = await generateRefreshToken(payload) 
        
        return res.status(200).json({
            status: true,
            massage: 'LOGIN_SUCCESS',
            fullname: user.fullname,
            accessToken,
            refreshToken
        });       
    } catch (err) {
        console.log(err)
        if(!err.code) { err.code = 500 }
        return res.status(err.code).json({
            status: false,
            message: err.message
        });       
    }
}

const refreshToken = async (req, res) => {
    try{
        if(!req.body.refreshToken) { throw { code: 428, message: "REFRESH_TOKEN_REQUIRED" }}

        // verify token
        const verify = await jsonwebtoken.verify(req.body.refreshToken, env.JWT_REFRESH_TOKEN_SECRET);

        // genereate token
        let payload = { id: verify.id, role: verify.role };
        const accessToken = await generateAccessToken(payload)
        const refreshToken = await generateRefreshToken(payload) 
               
        return res.status(200).json({
            status: true,
            massage: 'REFRESH_TOKEN_SUCCESS',
            accessToken,
            refreshToken
        });       
    } catch (err) {
        if(err.message == 'jwt expired') { 
            err.message = 'REFRESH_TOKEN_EXPIRED' 
        }
        else { 
            err.message = 'REFRESH_TOKEN_INVALID' 
        }
        return res.status(err.code).json({
            status: false,
            message: err.message
        });       
    }
}

export { register, login, refreshToken, checkEmail };