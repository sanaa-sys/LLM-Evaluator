"use client"
import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function Login() {
    const [err, setErr] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await signInWithEmailAndPassword(auth, email, password);
        } catch (error) {
            setErr(true);
            console.error("Error logging in:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleLogin} className="space-y-4">
            <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                className="w-full p-2 border rounded placeholder:text-gray-600 text-black"
                required
            />
            <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full p-2 border rounded placeholder:text-gray-600 text-black"
                required
            />
            {err && (
                <p className="text-red-500 text-xs font-bold">
                    Invalid email or password. Try again.
                </p>
            )}
            <button
                type="submit"
                className="w-full p-2 bg-purple-200 text-black font-medium rounded hover:bg-purple-500 hover:text-white ease-in-out duration-300"
                disabled={loading}
            >
                {loading ? "Logging in..." : "Log In"}
            </button>
        </form>
    );
}