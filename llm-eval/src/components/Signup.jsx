"use client"
import { auth } from "@/lib/firebase";
import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
const Signup = () => {
    const [err, setErr] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const handleEmailChange = (e) => {
        setEmail(e.target.value);
    };

    const handlePasswordChange = (e) => {
        setPassword(e.target.value);
    };

    const handleSignup = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await createUserWithEmailAndPassword(auth, email, password);
        } catch (error) {
            setErr(true);
            console.error("Error signing up:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSignup}>
            <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={handleEmailChange}
                className="w-full p-2 border border-gray-300 rounded"
            />
            <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={handlePasswordChange}
                className="w-full p-2 border border-gray-300 rounded mt-2"
            />
            {err && (
                <p className="text-red-500 text-xs font-bold">
                    Minimum password length is 6 characters
                </p>
            )}

            <button
                type="submit"
                className="w-full p-2 bg-lavender hover:bg-purple-500 font-medium text-black hover:text-white ease-in-out duration-300 rounded mt-2"
                disabled={loading}
            >
                {loading ? "Signing up..." : "Sign Up"}
            </button>
        </form>
    );
};

export default Signup;