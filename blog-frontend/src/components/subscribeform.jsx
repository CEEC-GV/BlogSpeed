import { useState } from "react";
import api from "../api/axios.js";

export default function SubscribeForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
  });
  const [status, setStatus] = useState("idle"); // idle | loading | success | error
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("loading");
    setMessage("");

    try {
      const response = await api.post("subscribers/subscribe", {
        name: formData.name,
        email: formData.email,
        source: "website",
      });

      setStatus("success");
      setMessage(response.data.message || "Successfully subscribed!");
      setFormData({ name: "", email: "" });

      // Reset success message after 5 seconds
      setTimeout(() => {
        setStatus("idle");
        setMessage("");
      }, 5000);
    } catch (error) {
      setStatus("error");
      setMessage(
        error.response?.data?.error ||
          error.response?.data?.message ||
          "Failed to subscribe. Please try again."
      );
    }
  };

  return (
    <div className="mt-16 rounded-3xl border border-gray-200 bg-gradient-to-br from-blue-50 to-white p-8 shadow-sm">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">
          Stay Updated
        </p>
        <h2 className="mt-3 text-3xl font-semibold text-gray-900 md:text-4xl">
          Subscribe to our newsletter
        </h2>
        <p className="mt-3 text-base text-gray-600">
          Get the latest insights, product updates, and design stories delivered
          straight to your inbox.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="text-left">
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700"
              >
                Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="John Doe"
                disabled={status === "loading"}
                className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 placeholder-gray-400 transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:bg-gray-50"
              />
            </div>

            <div className="text-left">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="john@example.com"
                disabled={status === "loading"}
                className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 placeholder-gray-400 transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:bg-gray-50"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={status === "loading" || status === "success"}
            className="w-full rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:px-8"
          >
            {status === "loading"
              ? "Subscribing..."
              : status === "success"
                ? "Subscribed ✓"
                : "Subscribe"}
          </button>

          {message && (
            <div
              className={`rounded-lg border p-4 text-left text-sm ${
                status === "success"
                  ? "border-green-200 bg-green-50 text-green-800"
                  : "border-red-200 bg-red-50 text-red-800"
              }`}
            >
              {message}
            </div>
          )}
        </form>

        <p className="mt-6 text-xs text-gray-500">
          We respect your privacy. Unsubscribe at any time.
        </p>
      </div>
    </div>
  );
}