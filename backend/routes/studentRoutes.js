const express = require("express");
const mongoose = require("mongoose");
const Student = require("../models/Student");
const localStore = require("../models/localStore");

const router = express.Router();

function getStore() {
  return mongoose.connection.readyState === 1 ? Student : localStore;
}

function isValidId(id) {
  return mongoose.isValidObjectId(id) || /^[0-9a-fA-F]{24}$/.test(id);
}

// GET /api/students?search=rahul&department=CSE&semester=4
router.get("/", async (req, res) => {
  try {
    const { search, department, semester } = req.query;
    const filter = {};

    if (search && search.trim()) {
      const safeSearch = search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      filter.$or = [
        { name: { $regex: safeSearch, $options: "i" } },
        { usn: { $regex: safeSearch, $options: "i" } },
        { email: { $regex: safeSearch, $options: "i" } }
      ];
    }

    if (department && department.trim()) {
      filter.department = department.trim().toUpperCase();
    }

    if (semester) {
      const semNum = Number(semester);
      if (!isNaN(semNum)) {
        filter.semester = semNum;
      }
    }

    const store = getStore();
    const students = await store.find(filter).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: students.length, data: students });
  } catch (error) {
    res.status(500).json({ success: false, message: "Could not retrieve students" });
  }
});

// GET /api/students/:id
router.get("/:id", async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid student ID" });
    }

    const store = getStore();
    const student = await store.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ success: false, message: "Student not found" });
    }

    res.status(200).json({ success: true, data: student });
  } catch (error) {
    res.status(500).json({ success: false, message: "Could not retrieve student" });
  }
});

// POST /api/students
router.post("/", async (req, res) => {
  try {
    const { name, usn, email, department, semester, phone } = req.body;
    const store = getStore();
    const student = await store.create({ name, usn, email, department, semester, phone });
    res.status(201).json({
      success: true,
      message: "Student created successfully",
      data: student
    });
  } catch (error) {
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern || {})[0] || "USN or email";
      return res.status(409).json({
        success: false,
        message: `A student with this ${field} already exists`
      });
    }

    res.status(400).json({
      success: false,
      message: error.name === "ValidationError"
        ? Object.values(error.errors).map(item => item.message).join(", ")
        : error.message || "Invalid student data"
    });
  }
});

// PUT /api/students/:id
router.put("/:id", async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid student ID" });
    }

    const allowed = ["name", "usn", "email", "department", "semester", "phone"];
    const updates = {};
    for (const key of allowed) {
      if (Object.prototype.hasOwnProperty.call(req.body, key)) updates[key] = req.body[key];
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ success: false, message: "Provide at least one field to update" });
    }

    const store = getStore();
    const student = await store.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
      context: "query"
    });

    if (!student) {
      return res.status(404).json({ success: false, message: "Student not found" });
    }

    res.status(200).json({
      success: true,
      message: "Student updated successfully",
      data: student
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ success: false, message: "USN or email already exists" });
    }

    res.status(400).json({
      success: false,
      message: error.name === "ValidationError"
        ? Object.values(error.errors).map(item => item.message).join(", ")
        : error.message || "Could not update student"
    });
  }
});

// DELETE /api/students/:id
router.delete("/:id", async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid student ID" });
    }

    const store = getStore();
    const student = await store.findByIdAndDelete(req.params.id);
    if (!student) {
      return res.status(404).json({ success: false, message: "Student not found" });
    }

    res.status(200).json({ success: true, message: "Student deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Could not delete student" });
  }
});

module.exports = router;
