import mongoose from "mongoose";
import validator from "validator"
import bcrypt from "bcrypt"
const schema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        unique: true,
        required: [true, "Please Enter your email"],
        validate: [validator.isEmail, "Please Enter valid email"]

    },
    password: {
        type: String,
        required: [true, "Please Enter your Password"]


    }
    ,
    role: {
        type: String,
        enum: ["user", "admin"],
        default: "user"

    },
    gender: {
        type: String,
        enum: ["male", "female"],
        required: [true, "Please Enter your gender"]
    },
    dob: {
        type: String,
        required: [true, "Please Enter your Date of Birth"]
    }



}, {
    timestamps: true
})
schema.virtual("age").get(function () {
    const today = new Date();
    const dob = this.dob;
    let age = today.getFullYear() - dob.getFullYear();
    if (today.getMonth() < dob.getMonth() || (
        today.getMonth() === dob.getMonth() && today.getDate() < dob.getDate()
    )) {
        age--;
    }
    return age;

})

schema.pre("save", async function (next) {
    if (!this.isModified("password")) return next(); // Only hash if password changed
    this.password = await bcrypt.hash(this.password, 10); // Hash password
    next();
});

export const User = mongoose.model("User", schema)