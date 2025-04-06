const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
//signup
exports.signup = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const existingUser = await User.findOne({ email });

        if (existingUser) return res.status(400).json({ message: "Email already exists" });

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ name, email, password: hashedPassword });

        await user.save();
        res.status(201).json({ 
            message: "User registered successfully", 
            user: {
                name: user.name,
                email: user.email,
                createdAt: user.createdAt
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
//login
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (!user) return res.status(400).json({ message: "User not found" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

        // Include both email and name in the token payload
        const token = jwt.sign(
            { 
                email: user.email,
                name: user.name 
            }, 
            process.env.JWT_SECRET, 
            { expiresIn: "7d" }
        );

        // Send all user details except password
        const userDetails = {
            name: user.name,
            email: user.email,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
        };

        res.json({ 
            token, 
            user: userDetails,
            message: "Login successful"
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
