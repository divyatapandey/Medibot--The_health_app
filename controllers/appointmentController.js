const mailchimp = require('@mailchimp/mailchimp_marketing');

// Configure Mailchimp
mailchimp.setConfig({
    apiKey: process.env.MAILCHIMP_API_KEY,
    server: process.env.MAILCHIMP_SERVER_PREFIX
});

const AUDIENCE_ID = process.env.MAILCHIMP_AUDIENCE_ID;

exports.bookAppointment = async (req, res) => {
    const { name, doctorName, date, time, email } = req.body;

    // Validate input
    if (!name || !doctorName || !date || !time || !email) {
        return res.status(400).json({ 
            message: 'Missing required fields: name, doctorName, date, time, email' 
        });
    }

    try {
        // Verify the authenticated user's email matches the appointment email
        if (req.user.email !== email) {
            return res.status(403).json({ 
                message: "Email doesn't match authenticated user" 
            });
        }

        // Add or update user in Mailchimp audience
        const response = await mailchimp.lists.setListMember(AUDIENCE_ID, email, {
            email_address: email,
            status_if_new: 'subscribed',
            merge_fields: {
                FNAME: name,
                DOCTOR: doctorName,
                APPT_DATE: date,
                APPT_TIME: time,
            },
        });

        console.log('User added/updated in Mailchimp:', response);
        res.status(200).json({ 
            message: 'Appointment booked, email sent successfully!' 
        });
    } catch (error) {
        console.error('Error sending email via Mailchimp:', error);
        res.status(500).json({ 
            message: 'Failed to send email', 
            error: error.message 
        });
    }
}; 