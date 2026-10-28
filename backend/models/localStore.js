const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const DATA_DIR = path.join(__dirname, "..", "data");
const DATA_FILE = path.join(DATA_DIR, "students.json");

const NAME_REGEX = /^[A-Za-z\s]{2,100}$/;
const USN_REGEX = /^1RV[0-9]{2}[A-Z]{2,4}[0-9]{3}$/;
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

const INITIAL_STUDENTS = [
  {
    "_id": "87e435c3ac3ae892fbca2bf9",
    "name": "Vishal",
    "usn": "1RV25CS205",
    "email": "vishal.cs25@rvce.edu.in",
    "department": "CSE",
    "semester": 3,
    "phone": "+91 9876543210",
    "createdAt": new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
    "updatedAt": new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString()
  },
  {
    "_id": "65d8a1f2b3c4d5e6f7a8b901",
    "name": "Rahul Sharma",
    "usn": "1RV24CS045",
    "email": "rahul.sharma@example.edu",
    "department": "CSE",
    "semester": 4,
    "phone": "+91 9876543210",
    "createdAt": new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
    "updatedAt": new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString()
  },
  {
    "_id": "65d8a1f2b3c4d5e6f7a8b902",
    "name": "Ananya Rao",
    "usn": "1RV23IS012",
    "email": "ananya.rao@example.edu",
    "department": "ISE",
    "semester": 6,
    "phone": "+91 9845123456",
    "createdAt": new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
    "updatedAt": new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString()
  },
  {
    "_id": "65d8a1f2b3c4d5e6f7a8b903",
    "name": "Vikram Aditya",
    "usn": "1RV25EC089",
    "email": "vikram.aditya@example.edu",
    "department": "ECE",
    "semester": 2,
    "phone": "+91 9123456780",
    "createdAt": new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString(),
    "updatedAt": new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString()
  },
  {
    "_id": "65d8a1f2b3c4d5e6f7a8b904",
    "name": "Sneha Patil",
    "usn": "1RV24AI034",
    "email": "sneha.patil@example.edu",
    "department": "AIML",
    "semester": 4,
    "phone": "+91 9988776655",
    "createdAt": new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
    "updatedAt": new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString()
  }
];

function ensureFile() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(INITIAL_STUDENTS, null, 2), "utf-8");
  }
}

function loadAll() {
  ensureFile();
  try {
    const raw = fs.readFileSync(DATA_FILE, "utf-8");
    return JSON.parse(raw);
  } catch {
    return [...INITIAL_STUDENTS];
  }
}

function saveAll(items) {
  ensureFile();
  fs.writeFileSync(DATA_FILE, JSON.stringify(items, null, 2), "utf-8");
}

function generateObjectId() {
  return crypto.randomBytes(12).toString("hex");
}

function validateStudentFields(data, isUpdate = false) {
  if (!isUpdate || data.name !== undefined) {
    const name = (data.name || "").trim();
    if (!name) {
      throw new Error("Student name is required");
    }
    if (!NAME_REGEX.test(name)) {
      throw new Error("Name must contain only alphabets and spaces (minimum 2 characters)");
    }
  }

  if (!isUpdate || data.usn !== undefined) {
    const usn = (data.usn || "").trim().toUpperCase();
    if (!usn) {
      throw new Error("USN is required");
    }
    if (!USN_REGEX.test(usn)) {
      throw new Error("USN must follow 1RV format (e.g. 1RV24CS001)");
    }
  }

  if (!isUpdate || data.email !== undefined) {
    const email = (data.email || "").trim().toLowerCase();
    if (!email) {
      throw new Error("Email is required");
    }
    if (!EMAIL_REGEX.test(email)) {
      throw new Error("Please enter a valid email address (e.g. student@example.com)");
    }
  }

  if (!isUpdate || data.semester !== undefined) {
    const sem = Number(data.semester);
    if (isNaN(sem) || sem < 1 || sem > 8) {
      throw new Error("Semester must be between 1 and 8");
    }
  }

  if (!isUpdate || data.department !== undefined) {
    const dept = (data.department || "").trim();
    if (!dept) {
      throw new Error("Department is required");
    }
  }
}

const localStore = {
  find(filter = {}) {
    let list = loadAll();

    if (filter.$or && Array.isArray(filter.$or)) {
      list = list.filter(item => {
        return filter.$or.some(cond => {
          for (const key of Object.keys(cond)) {
            const regex = cond[key].$regex;
            if (regex && item[key]) {
              const re = new RegExp(regex, "i");
              if (re.test(item[key])) return true;
            }
          }
          return false;
        });
      });
    }

    if (filter.department) {
      list = list.filter(item => (item.department || "").toUpperCase() === filter.department.toUpperCase());
    }

    if (filter.semester !== undefined) {
      list = list.filter(item => Number(item.semester) === Number(filter.semester));
    }

    return {
      sort(criteria = { createdAt: -1 }) {
        const sorted = [...list];
        sorted.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        return Promise.resolve(sorted);
      }
    };
  },

  findById(id) {
    const list = loadAll();
    const item = list.find(s => s._id === id);
    return Promise.resolve(item || null);
  },

  create(data) {
    try {
      validateStudentFields(data, false);
    } catch (err) {
      return Promise.reject(err);
    }

    const list = loadAll();
    const normalizedUsn = (data.usn || "").trim().toUpperCase();
    const normalizedEmail = (data.email || "").trim().toLowerCase();

    // Check duplicate USN
    if (list.some(s => (s.usn || "").toUpperCase() === normalizedUsn)) {
      const err = new Error("A student with this USN already exists");
      err.code = 11000;
      err.keyPattern = { usn: 1 };
      return Promise.reject(err);
    }

    // Check duplicate Email
    if (list.some(s => (s.email || "").toLowerCase() === normalizedEmail)) {
      const err = new Error("A student with this email already exists");
      err.code = 11000;
      err.keyPattern = { email: 1 };
      return Promise.reject(err);
    }

    const newStudent = {
      _id: generateObjectId(),
      name: data.name ? data.name.trim() : "",
      usn: normalizedUsn,
      email: normalizedEmail,
      department: (data.department || "").toUpperCase().trim(),
      semester: Number(data.semester),
      phone: data.phone ? data.phone.trim() : "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    list.unshift(newStudent);
    saveAll(list);
    return Promise.resolve(newStudent);
  },

  findByIdAndUpdate(id, updates) {
    try {
      validateStudentFields(updates, true);
    } catch (err) {
      return Promise.reject(err);
    }

    const list = loadAll();
    const index = list.findIndex(s => s._id === id);
    if (index === -1) return Promise.resolve(null);

    const existing = list[index];

    if (updates.usn) {
      const nextUsn = updates.usn.trim().toUpperCase();
      if (list.some(s => s._id !== id && (s.usn || "").toUpperCase() === nextUsn)) {
        const err = new Error("A student with this USN already exists");
        err.code = 11000;
        return Promise.reject(err);
      }
      updates.usn = nextUsn;
    }

    if (updates.email) {
      const nextEmail = updates.email.trim().toLowerCase();
      if (list.some(s => s._id !== id && (s.email || "").toLowerCase() === nextEmail)) {
        const err = new Error("A student with this email already exists");
        err.code = 11000;
        return Promise.reject(err);
      }
      updates.email = nextEmail;
    }

    if (updates.name) {
      updates.name = updates.name.trim();
    }
    if (updates.department) {
      updates.department = updates.department.trim().toUpperCase();
    }
    if (updates.semester !== undefined) {
      updates.semester = Number(updates.semester);
    }
    if (updates.phone !== undefined) {
      updates.phone = updates.phone.trim();
    }

    const updated = {
      ...existing,
      ...updates,
      _id: existing._id,
      createdAt: existing.createdAt,
      updatedAt: new Date().toISOString()
    };

    list[index] = updated;
    saveAll(list);
    return Promise.resolve(updated);
  },

  findByIdAndDelete(id) {
    const list = loadAll();
    const index = list.findIndex(s => s._id === id);
    if (index === -1) return Promise.resolve(null);

    const [deleted] = list.splice(index, 1);
    saveAll(list);
    return Promise.resolve(deleted);
  }
};

module.exports = localStore;
