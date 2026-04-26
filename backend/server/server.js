import "dotenv/config";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const app = express();
app.use(cors({ origin: "http://localhost:8080", credentials: true }));
app.use(express.json());

// ── MongoDB connection ────────────────────────────────────────────────────────
await mongoose.connect(process.env.MONGODB_URI);
console.log("✅ MongoDB connected");

// ── Schemas ───────────────────────────────────────────────────────────────────
const UserSchema = new mongoose.Schema({
  email:    { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  fullName: { type: String, required: true },
  isAdmin:  { type: Boolean, default: false },
}, { timestamps: true });

const PassengerSchema = new mongoose.Schema({
  firstName: String,
  lastName:  String,
  dob:       String,
  gender:    { type: String, enum: ["M", "F", "O"] },
}, { _id: false });

const BookingSchema = new mongoose.Schema({
  pnr:          { type: String, required: true, unique: true },
  userId:       { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  flightId:     { type: String, required: true },
  passengers:   [PassengerSchema],
  seats:        [String],
  totalPrice:   Number,
  status:       { type: String, enum: ["CONFIRMED", "CANCELLED", "RESCHEDULED"], default: "CONFIRMED" },
  contactEmail: String,
  contactPhone: String,
  checkedIn:    { type: Boolean, default: false },
  createdAt:    { type: String },
}, { timestamps: true });

const User    = mongoose.model("User",    UserSchema);
const Booking = mongoose.model("Booking", BookingSchema);

// ── Auth middleware ───────────────────────────────────────────────────────────
function auth(req, res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) return res.status(401).json({ message: "Unauthorised" });
  try {
    req.user = jwt.verify(header.slice(7), process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ message: "Invalid token" });
  }
}

function userPayload(user) {
  return { id: user._id, email: user.email, fullName: user.fullName, isAdmin: user.isAdmin };
}

// ── Auth routes ───────────────────────────────────────────────────────────────
app.post("/api/auth/signup", async (req, res) => {
  try {
    const { email, password, fullName } = req.body;
    if (!email || !password || !fullName) return res.status(400).json({ message: "All fields required" });
    if (await User.findOne({ email })) return res.status(409).json({ message: "Email already in use" });
    const hashed = await bcrypt.hash(password, 10);
    const isAdmin = email.toLowerCase() === "admin@skywings.com";
    const user = await User.create({ email, password: hashed, fullName, isAdmin });
    const token = jwt.sign(userPayload(user), process.env.JWT_SECRET, { expiresIn: "7d" });
    res.json({ token, user: userPayload(user) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post("/api/auth/signin", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email?.toLowerCase() });
    if (!user) return res.status(401).json({ message: "Invalid email or password" });
    if (!await bcrypt.compare(password, user.password)) return res.status(401).json({ message: "Invalid email or password" });
    const token = jwt.sign(userPayload(user), process.env.JWT_SECRET, { expiresIn: "7d" });
    res.json({ token, user: userPayload(user) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get("/api/auth/me", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(userPayload(user));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── Booking routes ────────────────────────────────────────────────────────────
// Get current user's bookings
app.get("/api/bookings", auth, async (req, res) => {
  try {
    const bookings = await Booking.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get ALL bookings (admin only)
app.get("/api/bookings/all", auth, async (req, res) => {
  try {
    if (!req.user.isAdmin) return res.status(403).json({ message: "Admin only" });
    const bookings = await Booking.find().sort({ createdAt: -1 });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create booking
app.post("/api/bookings", auth, async (req, res) => {
  try {
    const { pnr, flightId, passengers, seats, totalPrice, contactEmail, contactPhone, createdAt } = req.body;
    if (!pnr || !flightId) return res.status(400).json({ message: "pnr and flightId required" });
    const booking = await Booking.create({
      pnr, userId: req.user.id, flightId, passengers, seats,
      totalPrice, contactEmail, contactPhone, createdAt,
      status: "CONFIRMED", checkedIn: false,
    });
    res.status(201).json(booking);
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ message: "PNR already exists" });
    res.status(500).json({ message: err.message });
  }
});

// Cancel booking
app.patch("/api/bookings/:pnr/cancel", auth, async (req, res) => {
  try {
    const booking = await Booking.findOneAndUpdate(
      { pnr: req.params.pnr, userId: req.user.id },
      { status: "CANCELLED" },
      { new: true },
    );
    if (!booking) return res.status(404).json({ message: "Booking not found" });
    res.json(booking);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Reschedule booking
app.patch("/api/bookings/:pnr/reschedule", auth, async (req, res) => {
  try {
    const { flightId } = req.body;
    const booking = await Booking.findOneAndUpdate(
      { pnr: req.params.pnr, userId: req.user.id },
      { flightId, status: "RESCHEDULED" },
      { new: true },
    );
    if (!booking) return res.status(404).json({ message: "Booking not found" });
    res.json(booking);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Check-in
app.patch("/api/bookings/:pnr/check-in", auth, async (req, res) => {
  try {
    const booking = await Booking.findOneAndUpdate(
      { pnr: req.params.pnr, userId: req.user.id },
      { checkedIn: true },
      { new: true },
    );
    if (!booking) return res.status(404).json({ message: "Booking not found" });
    res.json(booking);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`🚀 API running on http://localhost:${PORT}`));