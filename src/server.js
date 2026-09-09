const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const path = require("path");
require("dotenv").config();

const authRoutes = require("./routes/authRoutes");
const patientRoutes = require("./routes/patientRoutes");
const userRoutes = require("./routes/userRoutes");
const polyclinicRoutes = require("./routes/polyclinicRoutes");
const doctorRoutes = require("./routes/doctorRoutes");
const registrationRoutes = require("./routes/registrationRoutes");
const medicalRecordRoutes = require("./routes/medicalRecordRoutes");
const medicineRoutes = require("./routes/medicineRoutes");
const prescriptionRoutes = require("./routes/prescriptionRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const registerRoute = require("./routes/registerRoute");

const app = express();

app.use(
    cors({
        origin: "http://localhost:5173",
        credentials: true,
    })
);

app.use(express.json());
app.use(cookieParser());

app.use(
    "/uploads",
    express.static(
        path.join(__dirname, "uploads")
    )
);

app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "SIMRS API is running",
    });
});

app.use("/api/auth", authRoutes);
app.use("/api/register", registerRoute);
app.use("/api/users", userRoutes);
app.use("/api/patients", patientRoutes);
app.use("/api/polyclinics", polyclinicRoutes);
app.use("/api/doctors", doctorRoutes);
app.use("/api/registrations", registrationRoutes);
app.use("/api/medical-records", medicalRecordRoutes);
app.use("/api/medicines", medicineRoutes);
app.use("/api/prescriptions", prescriptionRoutes);
app.use("/api/dashboard", dashboardRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(
        `SIMRS API running on port ${PORT}`
    );
});