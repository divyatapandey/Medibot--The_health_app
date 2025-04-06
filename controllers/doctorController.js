const Doctor = require('../models/Doctor');

exports.addDoctor = async (req, res) => {
    try {
        const { name, specialization, contactNumber, email, imageUrl } = req.body;

        // Validate required fields
        if (!name || !specialization || !contactNumber || !email || !imageUrl) {
            return res.status(400).json({ 
                message: "All fields are required",
                code: "MISSING_FIELDS"
            });
        }

        // Check if doctor with same email already exists
        const existingDoctor = await Doctor.findOne({ email });
        if (existingDoctor) {
            return res.status(400).json({ 
                message: "Doctor with this email already exists",
                code: "EMAIL_EXISTS"
            });
        }

        // Create new doctor
        const doctor = new Doctor({
            name,
            specialization,
            contactNumber,
            email,
            imageUrl
        });

        // Save doctor to database
        await doctor.save();

        res.status(201).json({
            message: "Doctor added successfully",
            doctor
        });
    } catch (error) {
        console.error("Error in addDoctor:", error);
        res.status(500).json({ 
            message: "Internal server error",
            code: "SERVER_ERROR"
        });
    }
};

// Get all doctors
exports.getAllDoctors = async (req, res) => {
    try {
        const doctors = await Doctor.find({})
            .select('-__v') // Exclude the version field
            .sort({ name: 1 }); // Sort by name in ascending order

        res.status(200).json({
            message: "Doctors fetched successfully",
            doctors,
            count: doctors.length
        });
    } catch (error) {
        console.error("Error in getAllDoctors:", error);
        res.status(500).json({
            message: "Internal server error",
            code: "SERVER_ERROR"
        });
    }
}; 