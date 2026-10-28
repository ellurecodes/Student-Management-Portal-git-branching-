const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Student name is required"],
      trim: true,
      minlength: [2, "Name must contain at least 2 characters"],
      maxlength: [100, "Name cannot exceed 100 characters"],
      match: [/^[A-Za-z\s]+$/, "Name must contain only alphabets and spaces"]
    },
    usn: {
      type: String,
      required: [true, "USN is required"],
      unique: true,
      uppercase: true,
      trim: true,
      match: [
        /^1RV[0-9]{2}[A-Z]{2,4}[0-9]{3}$/,
        "USN must follow 1RV format (e.g. 1RV24CS001)"
      ]
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        "Please enter a valid email address (e.g. student@example.com)"
      ]
    },
    department: {
      type: String,
      required: [true, "Department is required"],
      trim: true,
      uppercase: true
    },
    semester: {
      type: Number,
      required: [true, "Semester is required"],
      min: [1, "Semester must be between 1 and 8"],
      max: [8, "Semester must be between 1 and 8"]
    },
    phone: {
      type: String,
      trim: true,
      default: "",
      match: [
        /^$|^[0-9+\s\-()]{7,15}$/,
        "Phone number can only contain digits and valid phone symbols"
      ]
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Student", studentSchema);
