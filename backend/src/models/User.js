// Mongoose schema for user data.
// Fields: name, email, passwordHash, createdAt.
// Includes password hashing and comparison logic for authentication.
import mongoose  from "mongoose";
import bcrypt from "bcryptjs"; // For password hashing

// Define the User schema
const userSchema = new mongoose.Schema({
    name: { type: String, 
            required: true,
            trim: true},
    email:{type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true},
    password:{
        type: String,
        required: true,
        minlength: 6
    },
    // Password reset (store ONLY hashed token)
    passwordResetTokenHash: { type: String },
    passwordResetTokenExpiresAt: { type: Date },
}
, { timestamps: true });
// Hash password before saving user
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();// Only hash if password is new or modified
    try{
         const salt = await bcrypt.genSalt(10);
         this.password = await bcrypt.hash(this.password, salt);
         next();     
    }
    catch (error) {next(error);}
});
// Method to compare entered password with hashed password
userSchema.methods.comparePassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};
// Create and export the User Model
const User = mongoose.model('User', userSchema);
export default User; 

