const express = require('express');
const router = express.Router()
const User = require('../models/User')
const { body, validationResult } = require('express-validator');

const jwtSecret = "itsacanteenwebappflooredbytech"
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

router.post("/createuser",
body('email').isEmail(),
body('password', "Minimum password length should be 5").isLength({ min: 5 }),
body('name').isLength({ min: 5 }),
  async(req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const salt = await bcrypt.genSalt(10);
    let secPassword = await bcrypt.hash(req.body.password, salt);

    try {
        await User.create({
            name: req.body.name,
            email: req.body.email, 
            password: secPassword
        })
        res.json({success:true});
    } catch (error) {
        console.log(error);
        res.json({success:false})
    }
})


router.post("/loginuser",[
  body('email').isEmail(),
  body('password', "Incorrect Password").isLength({ min: 5 })
],
async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  let email = req.body.email;
  try {
    let userdata = await User.findOne({email})
    if(!userdata){
      console.log("Invalid email")
      return res.status(400).json({ errors: "Try logging in with correct credentials" });
    }
    const pwdcomp = await bcrypt.compare(req.body.password, userdata.password);
    if(!pwdcomp){
      console.log("Invalid password")
      return res.status(400).json({ errors: "Try logging in with correct credentials" });
    }

    const data = {
      user : {
        id : userdata.id
      }
    }
    const authToken = jwt.sign(data, jwtSecret);
    return res.json({success:true, authToken:authToken});

  } catch (error) {
    console.log(error);
    return res.json({success:false})
  }
})

module.exports = router; 