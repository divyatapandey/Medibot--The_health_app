const Appointment = require("../models/Appointment");
const Doctor = require("../models/Doctor");
const { sendEmail } = require("../utils/sendEmail");

// Helper function to generate all possible time slots
const generateTimeSlots = () => {
    const slots = [];
    for (let i = 9; i < 19; i++) {
        slots.push(`${i}:00-${i+1}:00`);
    }
    return slots;
};

// Get all appointments for a user
exports.getAllAppointments = async (req, res) => {
    try {
        const userEmail = req.user.email; // Get email from JWT token

        // Find all appointments for this user
        const appointments = await Appointment.find({})
            .select('-__v')
            .sort({ date: 1, timeSlot: 1 })
            .lean();

        if (!appointments || appointments.length === 0) {
            return res.status(200).json({
                message: "No appointments found",
                appointments: {},
                totalAppointments: 0,
                upcomingAppointments: 0,
                pastAppointments: 0
            });
        }

        // Get all unique doctor names from appointments
        const doctorNames = [...new Set(appointments.map(apt => apt.doctorName))];
        
        // Fetch doctor details for all doctors in appointments
        const doctors = await Doctor.find({ name: { $in: doctorNames } }).lean();
        
        // Create a map of doctor details for quick lookup
        const doctorDetailsMap = doctors.reduce((map, doctor) => {
            map[doctor.name] = doctor;
            return map;
        }, {});

        // Format the appointments data with doctor details
        const formattedAppointments = appointments.map(appointment => {
            const doctorDetails = doctorDetailsMap[appointment.doctorName] || {};
            return {
                id: appointment._id,
                doctorDetails: {
                    name: doctorDetails.name || appointment.doctorName,
                    specialization: doctorDetails.specialization || 'N/A',
                    contactNumber: doctorDetails.contactNumber || 'N/A',
                    email: doctorDetails.email || 'N/A',
                    imageUrl: doctorDetails.imageUrl || 'N/A'
                },
                patientName: appointment.patientName,
                date: new Date(appointment.date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                }),
                rawDate: appointment.date, // Adding raw date for frontend sorting if needed
                timeSlot: appointment.timeSlot,
                status: new Date(appointment.date) > new Date() ? 'Upcoming' : 'Past',
                bookedAt: new Date(appointment.createdAt).toLocaleString('en-US')
            };
        });

        // Sort appointments by date and time
        formattedAppointments.sort((a, b) => {
            const dateCompare = new Date(a.rawDate) - new Date(b.rawDate);
            if (dateCompare === 0) {
                return a.timeSlot.localeCompare(b.timeSlot);
            }
            return dateCompare;
        });

        // Group appointments by date
        const groupedAppointments = formattedAppointments.reduce((acc, appointment) => {
            const date = appointment.date;
            if (!acc[date]) {
                acc[date] = [];
            }
            acc[date].push(appointment);
            return acc;
        }, {});

        res.status(200).json({
            message: "Appointments fetched successfully",
            appointments: groupedAppointments,
            totalAppointments: appointments.length,
            upcomingAppointments: formattedAppointments.filter(a => a.status === 'Upcoming').length,
            pastAppointments: formattedAppointments.filter(a => a.status === 'Past').length
        });
    } catch (error) {
        console.error("Error in getAllAppointments:", error);
        res.status(500).json({
            message: "Internal server error",
            error: error.message,
            code: "SERVER_ERROR"
        });
    }
};

// Book an appointment
exports.bookAppointment = async (req, res) => {
    try {
        const { doctorName, timeSlot, date } = req.body;
        const userEmail = req.user.email; // Get email from JWT token
        const patientName = req.user.name; // Get name from JWT token
        console.log(userEmail)
        console.log(patientName)
        // Validate input
        if (!doctorName || !timeSlot || !date) {
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
            patientName, // Using name from JWT token
            timeSlot,
            date: new Date(date)
        });

        await appointment.save();

        // Create a mock request body for sendEmail
        const emailReq = {
            body: {
                to: userEmail,
                subject: "Appointment Confirmation",
                html: `
                    <h1>Appointment Confirmed!</h1>
                    <p>Dear ${patientName},</p>
                    <p>Your appointment has been successfully booked:</p>
                    <ul>
                        <li><strong>Doctor:</strong> ${doctorName}</li>
                        <li><strong>Date:</strong> ${new Date(date).toLocaleDateString()}</li>
                        <li><strong>Time:</strong> ${timeSlot}</li>
                    </ul>
                    <p>Please arrive 10 minutes before your scheduled time.</p>
                    <p>Best regards,<br>Medical Team</p>
                `
            }
        };

        // Create a mock response object
        const emailRes = {
            status: (code) => ({
                json: (data) => {
                    console.log('Email status:', code, data);
                }
            })
        };

        // Send the email
        await sendEmail(emailReq, emailRes);

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