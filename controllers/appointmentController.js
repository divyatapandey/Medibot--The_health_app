const Appointment = require("../models/Appointment");

// Helper function to generate all possible time slots
const generateTimeSlots = () => {
    const slots = [];
    for (let i = 9; i < 19; i++) {
        slots.push(`${i}:00-${i+1}:00`);
    }
    return slots;
};

// Book an appointment
exports.bookAppointment = async (req, res) => {
    try {
        const { doctorName, patientName, timeSlot, date } = req.body;

        // Validate input
        if (!doctorName || !patientName || !timeSlot || !date) {
            return res.status(400).json({ 
                message: "Missing required fields" 
            });
        }

        // Validate time slot format
        const timeSlotRegex = /^([0-9]|1[0-7]):00-([0-9]|1[0-8]):00$/;
        if (!timeSlotRegex.test(timeSlot)) {
            return res.status(400).json({ 
                message: "Invalid time slot format. Use HH:00-HH:00 format" 
            });
        }

        // Create appointment
        const appointment = new Appointment({
            doctorName,
            patientName,
            timeSlot,
            date: new Date(date)
        });

        await appointment.save();

        res.status(201).json({
            message: "Appointment booked successfully",
            appointment
        });

    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ 
                message: "This time slot is already booked" 
            });
        }
        res.status(500).json({ message: error.message });
    }
};

// Get doctor's schedule
exports.getDoctorSchedule = async (req, res) => {
    try {
        const { doctor_name } = req.params;
        const { date } = req.query; // Optional date parameter

        if (!doctor_name) {
            return res.status(400).json({ 
                message: "Doctor name is required" 
            });
        }

        // Get all possible time slots
        const allTimeSlots = generateTimeSlots();

        // Query for booked appointments
        const queryDate = date ? new Date(date) : new Date();
        const bookedAppointments = await Appointment.find({
            doctorName: doctor_name,
            date: {
                $gte: new Date(queryDate.setHours(0,0,0)),
                $lt: new Date(queryDate.setHours(23,59,59))
            }
        }).select('timeSlot -_id');

        // Get booked slots
        const bookedSlots = bookedAppointments.map(apt => apt.timeSlot);

        // Get available slots (all slots minus booked slots)
        const availableSlots = allTimeSlots.filter(slot => !bookedSlots.includes(slot));

        res.json({
            doctorName: doctor_name,
            date: queryDate.toISOString().split('T')[0],
            availableSlots,
            bookedSlots
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}; 