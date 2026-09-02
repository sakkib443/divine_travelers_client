"use client";

import { motion } from "framer-motion";
import { LuGlobe, LuMap } from "react-icons/lu";
import { useLanguage } from "@/context/LanguageContext";

export default function AboutStory() {
    const { language } = useLanguage();
    const isBn = language === "bn";
    const font = isBn ? "Hind Siliguri, sans-serif" : "Poppins, sans-serif";
    const heading = isBn ? "Hind Siliguri, sans-serif" : "var(--font-heading)";
    const T = (en, bn) => (isBn ? bn : en);

    return (
        <section className="py-20 md:py-32 bg-white relative overflow-hidden">
            {/* Background faint lines for the right side as in screenshot */}
            <div className="absolute bottom-0 right-0 w-full lg:w-1/2 h-full pointer-events-none hidden md:block overflow-hidden">
                <svg viewBox="0 0 500 500" fill="none" xmlns="http://www.w3.org/2000/svg" className="absolute bottom-[-20%] right-[-10%] w-[120%] h-[120%] stroke-[#F9A826]/30">
                    <path d="M0,500 C150,450 350,400 500,500" strokeWidth="1" />
                    <path d="M0,550 C150,490 350,440 500,550" strokeWidth="1" />
                    <path d="M0,600 C150,530 350,480 500,600" strokeWidth="1" />
                </svg>
            </div>
            
            {/* A light grey blob on the right edge */}
            <div className="absolute top-[30%] -right-20 w-[400px] h-[400px] bg-[#F5F5F5] rounded-full blur-[80px] pointer-events-none hidden lg:block" />

            <div className="max-w-[1400px] mx-auto px-6 lg:px-10 grid lg:grid-cols-[1fr_1.1fr] gap-16 lg:gap-24 items-center relative z-10">
                
                {/* Left: Overlapping Images */}
                <motion.div
                    initial={{ opacity: 0, x: -30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    className="relative w-full h-[450px] md:h-[600px] lg:h-[700px] mx-auto max-w-[600px] lg:max-w-none"
                >
                    {/* Main Bottom Image */}
                    <div className="absolute bottom-0 right-0 w-[85%] h-[75%] shadow-xl z-10 overflow-hidden">
                        <img src="/hero.jpg" alt="Travel" className="w-full h-full object-cover" />
                    </div>
                    {/* Top Left Square Image */}
                    <div className="absolute top-0 left-0 w-[55%] h-[55%] shadow-2xl z-20 overflow-hidden">
                        <img src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=600&q=80" alt="Adventure" className="w-full h-full object-cover" />
                    </div>
                </motion.div>

                {/* Right: Content */}
                <motion.div
                    initial={{ opacity: 0, x: 30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                >
                    <h2 className="font-extrabold text-[#222222] leading-[1.2] mb-6" style={{ fontFamily: heading, fontSize: "clamp(2rem, 4vw, 2.75rem)" }}>
                        {T(
                            "Divine Travelers is the best way to find travel tours. Let's make the most memorable adventures.",
                            "ডিভাইন ট্রাভেলার্স হলো ট্যুর খুঁজে পাওয়ার সেরা উপায়। চলুন সবচেয়ে স্মরণীয় অ্যাডভেঞ্চার তৈরি করি।"
                        )}
                    </h2>
                    
                    <p className="text-gray-600 leading-relaxed mb-12 text-[15px] md:text-[16px]" style={{ fontFamily: font }}>
                        {T(
                            "Divine Travelers is an incredible way to have an adventurous outdoor experience of world renowned destinations while traveling with comfort and sleeping soundly in the best accommodations.",
                            "ডিভাইন ট্রাভেলার্স হলো বিশ্ববিখ্যাত গন্তব্যগুলোতে আরামদায়ক ভ্রমণ এবং সেরা আবাসনে নিশ্চিন্তে রাত্রিযাপন করার মাধ্যমে একটি রোমাঞ্চকর আউটডোর অভিজ্ঞতা অর্জনের অবিশ্বাস্য উপায়।"
                        )}
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
                        {/* Feature 1 */}
                        <div>
                            <div className="mb-4 text-[#222222]">
                                <LuGlobe className="w-10 h-10" strokeWidth={1.5} />
                            </div>
                            <h3 className="font-black text-[#F9A826] text-[40px] leading-none mb-3" style={{ fontFamily: heading }}>
                                2018
                            </h3>
                            <h4 className="font-bold text-[#222222] text-[17px] mb-2" style={{ fontFamily: heading }}>
                                {T("The First Trip We Operated", "প্রথম ট্রিপ যা আমরা পরিচালনা করেছি")}
                            </h4>
                            <p className="text-gray-500 text-[14px] leading-relaxed" style={{ fontFamily: font }}>
                                {T(
                                    "We are in this industry for more than 6 years!",
                                    "আমরা ৬ বছরেরও বেশি সময় ধরে এই শিল্পে আছি!"
                                )}
                            </p>
                        </div>

                        {/* Feature 2 */}
                        <div>
                            <div className="mb-4 text-[#222222]">
                                <LuMap className="w-10 h-10" strokeWidth={1.5} />
                            </div>
                            <h3 className="font-black text-[#F9A826] text-[40px] leading-none mb-3" style={{ fontFamily: heading }}>
                                50+
                            </h3>
                            <h4 className="font-bold text-[#222222] text-[17px] mb-2" style={{ fontFamily: heading }}>
                                {T("Locations Worldwide", "বিশ্বব্যাপী গন্তব্য")}
                            </h4>
                            <p className="text-gray-500 text-[14px] leading-relaxed" style={{ fontFamily: font }}>
                                {T(
                                    "With more than 50 locations for your choices",
                                    "আপনার পছন্দের জন্য ৫০টিরও বেশি গন্তব্য"
                                )}
                            </p>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
