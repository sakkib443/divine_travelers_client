"use client";

import { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

// Comprehensive Translations for Divine Travelers home page sections
const translations = {
    en: {
        // Top Info Bar
        topEmail: "XXXXXXX",
        topAddress: "XXXXXXX",
        topHours: "Sat - Thu: 9:30 AM - 8:30 PM",

        // Navbar
        home: "Home",
        tour: "Tour",
        hajjUmrah: "Hajj & Umrah",
        studyAbroad: "Study Abroad",
        blog: "Blog",
        contact: "Contact",
        login: "Login",
        register: "Register",
        getStarted: "Get Started",
        dashboard: "Dashboard",
        accountSettings: "Account Settings",
        signOut: "Sign Out",
        languageLabel: "Language",

        consultancyMigration: "Consultancy & Migration",

        // Hero Section
        openingHour: "Opening Hour: 9.30 AM To 8.30 PM",
        heroTitle: "YOUR JOURNEY STARTS WITH\nDIVINE TRAVELERS",
        bookAppointment: "Book Appointment",
        askQuestion: "Ask Question",
        hotline247: "Hotline 24/7",

        // Hero Search Tabs
        tabTour: "Tour",
        tabFlight: "Flight",
        selectLabel: "Select",
        destination: "Destination",
        tourTypes: "Tour Types",
        search: "SEARCH",

        // Services Section
        servicesTag: "✦ Our Expertise",
        servicesTitle: "OUR",
        servicesTitleHighlight: "SERVICES",
        servicesDesc: "Comprehensive travel & immigration solutions tailored to your needs.",
        viewAll: "View All",
        exploreService: "Explore",

        // Service Items

        flightBooking: "Flight Booking",
        flightBookingSub: "BEST DEALS",
        flightBookingDesc: "Get the best deals on domestic and international flights with our vast airline network.",
        flightBookingStats: "100+ Airlines",

        tourPackages: "Tour Packages",
        tourPackagesSub: "CUSTOM PLANNING",
        tourPackagesDesc: "Customized holiday packages tailored to your preferences, budget, and dreams.",
        tourPackagesStats: "200+ Packages",

        hajjUmrahService: "Hajj & Umrah",
        hajjUmrahSub: "HOLY JOURNEY",
        hajjUmrahDesc: "Complete Hajj and Umrah packages with experienced guides and premium accommodations.",
        hajjUmrahStats: "1000+ Pilgrims",

        studyAbroadService: "Study Abroad",
        studyAbroadSub: "GLOBAL EDUCATION",
        studyAbroadDesc: "Complete guidance for studying abroad including university selection & admission support.",
        studyAbroadStats: "30+ Universities",

        // Trusted Partners
        trustedPartners: "Trusted Partners",

        // Benefits Section
        whyUs: "✦ Why Us",
        ourBenefits: "Our",
        benefitsHighlight: "Benefits",
        benefitsDesc: "Why thousands of travelers choose Divine Travelers for their journey.",

        oneClickBooking: "ONE CLICK BOOKING.",
        oneClickBookingDesc: "You can hassle-free and fast tour & travel package booking by Divine Travelers.",
        learnMore: "Learn More",

        discountOffer: "DISCOUNT & OFFER.",
        discountOfferDesc: "Agencies have special discounts on flights & packages.",
        viewOffers: "View Offers",

        localExpertise: "LOCAL EXPERTISE.",
        localExpertiseDesc: "You can hassle-free and fast tour & travel package booking by Divine Travelers.",
        meetExperts: "Meet Experts",

        customizeNote: "You've Customize Your Travel Package by One Click.",
        customizePackage: "Customize Package",

        // Consultation Section
        consultTag: "✦ We Make A Difference",
        consultTitle: "Welcome to Immigration",
        consultTitleHighlight: "Advisory",
        consultTitleEnd: "Services",
        consultDesc: "We help investors and entrepreneurs secure citizenship in major nations with our top immigration programs. We have a decade of experience assisting requirements.",
        experienceTitle: "10+ Years of Experience in Travel Services",
        experienceDesc: "Our global expertise, advanced technology & customized immigration solutions will help you achieve your goals.",
        exploreMore: "Explore More",
        realAgents: "Real Agents",

        // Why Choose Us Section
        whyChooseUsTag: "✦ Why Divine Travelers",
        whyChoose: "WHY CHOOSE",
        us: "US",
        whyChooseDesc: "With years of experience in travel services, we provide accurate guidance and expert support to make your dreams come true.",

        expertGuidance: "Expert Guidance",
        expertGuidanceDesc: "Skilled professionals with deep knowledge of immigration laws and procedures.",
        fastProcessing: "Fast Processing",
        fastProcessingDesc: "Quick and efficient booking processing with high success rate and minimal delays.",
        support247: "24/7 Support",
        support247Desc: "Round-the-clock customer support for all your queries and concerns.",
        affordablePrices: "Affordable Prices",
        affordablePricesDesc: "Competitive pricing without compromising on service quality or support.",
        fiftyCountries: "50+ Countries",
        fiftyCountriesDesc: "We arrange trips to destinations across the globe with local expertise.",
        successRate: "98% Success Rate",
        successRateDesc: "Proven track record of successful trips for our clients.",

        // Stats
        yearsExperience: "Years Experience",
        tripsArranged: "Trips Arranged",
        statSuccessRate: "Success Rate",
        countriesCovered: "Countries Covered",
        customerSupport: "Customer Support",

        // Testimonials
        testimonials: "✦ Testimonials",
        voicesOfOur: "VOICES OF OUR",
        clients: "CLIENTS",
        verifiedClient: "Verified Client",

        testimonial1Name: "Tanzina Rupa",
        testimonial1Text: "Divine Travelers arranged my Singapore trip within a week. Their expert guidance made the entire process smooth and hassle-free!",
        testimonial2Name: "Mabia Rahman",
        testimonial2Text: "Amazing service! They handled my USA trip planning professionally. The team is very knowledgeable and responsive.",
        testimonial3Name: "Forkan Uddin",
        testimonial3Text: "I planned my Canada study journey through Divine Travelers. They guided me through every step of the way.",

        // Footer CTA
        readyToStart: "Ready to Start Your Journey?",
        footerCTADesc: "Let our experts help you with flight booking, tours & more",
        callNow: "Call Now",
        freeConsultation: "Free Consultation",

        // Footer Brand
        footerBrandDesc: "Your trusted partner for flight booking, Hajj & Umrah packages, and tour planning in Bangladesh.",
        hotlineTime: "Hotline (9:30 AM - 8:30 PM)",

        // Footer Column Headings
        ourServices: "Our Services",
        quickLinks: "Quick Links",

        // Footer Service Links
        footerFlightBooking: "Flight Booking",
        footerTourPackages: "Tour Packages",
        footerHajjUmrah: "Hajj & Umrah",
        footerStudyAbroad: "Study Abroad",


        // Footer Quick Links
        aboutUs: "About Us",
        footerBlog: "Blog",
        contactUs: "Contact Us",
        privacyPolicy: "Privacy Policy",
        termsOfService: "Terms of Service",
        faq: "FAQ",

        // Footer Newsletter
        newsletter: "Newsletter",
        yourEmail: "Your email",

        // Footer Bottom
        acceptedPayment: "Accepted Payment Methods",
        allRightsReserved: "All rights reserved.",
        terms: "Terms",
        privacy: "Privacy",
    },
    bn: {
        // Top Info Bar
        topEmail: "XXXXXXX",
        topAddress: "XXXXXXX",
        topHours: "শনি - বৃহঃ: সকাল ৯:৩০ - রাত ৮:৩০",

        // Navbar
        home: "হোম",
        tour: "ট্যুর",
        hajjUmrah: "হজ্জ ও ওমরাহ",
        studyAbroad: "বিদেশে পড়াশোনা",
        blog: "ব্লগ",
        contact: "যোগাযোগ",
        login: "লগইন",
        register: "রেজিস্টার",
        getStarted: "শুরু করুন",
        dashboard: "ড্যাশবোর্ড",
        accountSettings: "একাউন্ট সেটিংস",
        signOut: "লগ আউট",
        languageLabel: "ভাষা",

        consultancyMigration: "কনসালটেন্সি ও মাইগ্রেশন",

        // Hero Section
        openingHour: "কার্যকরী সময়: সকাল ৯.৩০ থেকে রাত ৮.৩০",
        heroTitle: "আপনার যাত্রা শুরু হোক\nDivine Travelers -এর সাথে",
        bookAppointment: "অ্যাপয়েন্টমেন্ট বুক",
        askQuestion: "প্রশ্ন করুন",
        hotline247: "হটলাইন ২৪/৭",

        // Hero Search Tabs
        tabTour: "ট্যুর",
        tabFlight: "ফ্লাইট",
        selectLabel: "নির্বাচন",
        destination: "গন্তব্য",
        tourTypes: "ট্যুরের ধরন",
        search: "সার্চ",

        // Services Section
        servicesTag: "✦ আমাদের দক্ষতা",
        servicesTitle: "আমাদের",
        servicesTitleHighlight: "সেবাসমূহ",
        servicesDesc: "আপনার প্রয়োজন অনুযায়ী সম্পূর্ণ ভ্রমণ ও অভিবাসন সমাধান।",
        viewAll: "সব দেখুন",
        exploreService: "দেখুন",

        // Service Items

        flightBooking: "ফ্লাইট বুকিং",
        flightBookingSub: "সেরা ডিল",
        flightBookingDesc: "আমাদের বিশাল এয়ারলাইন নেটওয়ার্কের মাধ্যমে দেশীয় ও আন্তর্জাতিক ফ্লাইটে সেরা ডিল পান।",
        flightBookingStats: "১০০+ এয়ারলাইন",

        tourPackages: "ট্যুর প্যাকেজ",
        tourPackagesSub: "কাস্টম পরিকল্পনা",
        tourPackagesDesc: "আপনার পছন্দ, বাজেট এবং স্বপ্ন অনুযায়ী কাস্টমাইজড ছুটির প্যাকেজ।",
        tourPackagesStats: "২০০+ প্যাকেজ",

        hajjUmrahService: "হজ্জ ও ওমরাহ",
        hajjUmrahSub: "পবিত্র যাত্রা",
        hajjUmrahDesc: "অভিজ্ঞ গাইড এবং প্রিমিয়াম আবাসন সহ সম্পূর্ণ হজ্জ ও ওমরাহ প্যাকেজ।",
        hajjUmrahStats: "১০০০+ হাজী",

        studyAbroadService: "বিদেশে পড়াশোনা",
        studyAbroadSub: "বৈশ্বিক শিক্ষা",
        studyAbroadDesc: "বিশ্ববিদ্যালয় নির্বাচন ও ভর্তি সহায়তা সহ বিদেশে পড়াশোনার সম্পূর্ণ গাইডেন্স।",
        studyAbroadStats: "৩০+ বিশ্ববিদ্যালয়",

        // Trusted Partners
        trustedPartners: "বিশ্বস্ত পার্টনার",

        // Benefits Section
        whyUs: "✦ কেন আমরা",
        ourBenefits: "আমাদের",
        benefitsHighlight: "সুবিধাসমূহ",
        benefitsDesc: "কেন হাজার হাজার ভ্রমণকারী তাদের যাত্রার জন্য Divine Travelers বেছে নেন।",

        oneClickBooking: "ওয়ান ক্লিক বুকিং।",
        oneClickBookingDesc: "Divine Travelers-র মাধ্যমে ঝামেলামুক্ত ও দ্রুত ট্যুর ও ট্রাভেল প্যাকেজ বুকিং করুন।",
        learnMore: "আরো জানুন",

        discountOffer: "ডিসকাউন্ট ও অফার।",
        discountOfferDesc: "ফ্লাইট এবং প্যাকেজে বিশেষ ছাড় পাওয়া যায়।",
        viewOffers: "অফার দেখুন",

        localExpertise: "স্থানীয় দক্ষতা।",
        localExpertiseDesc: "Divine Travelers-র মাধ্যমে ঝামেলামুক্ত ও দ্রুত ট্যুর ও ট্রাভেল প্যাকেজ বুকিং করুন।",
        meetExperts: "বিশেষজ্ঞদের সাথে দেখা করুন",

        customizeNote: "এক ক্লিকে আপনার ট্রাভেল প্যাকেজ কাস্টমাইজ করুন।",
        customizePackage: "প্যাকেজ কাস্টমাইজ",

        // Consultation Section
        consultTag: "✦ আমরা পার্থক্য তৈরি করি",
        consultTitle: "ইমিগ্রেশন পরামর্শ",
        consultTitleHighlight: "সেবায়",
        consultTitleEnd: "স্বাগতম",
        consultDesc: "আমরা বিনিয়োগকারী ও উদ্যোক্তাদের আমাদের শীর্ষ ইমিগ্রেশন প্রোগ্রামের মাধ্যমে প্রধান দেশগুলোতে নাগরিকত্ব অর্জনে সাহায্য করি। এ ক্ষেত্রে আমাদের এক দশকের অভিজ্ঞতা রয়েছে।",
        experienceTitle: "ট্রাভেল সেবায় ১০+ বছরের অভিজ্ঞতা",
        experienceDesc: "আমাদের বৈশ্বিক দক্ষতা, উন্নত প্রযুক্তি ও কাস্টমাইজড ইমিগ্রেশন সমাধান আপনাকে আপনার লক্ষ্য অর্জনে সাহায্য করবে।",
        exploreMore: "আরো দেখুন",
        realAgents: "প্রকৃত এজেন্ট",

        // Why Choose Us Section
        whyChooseUsTag: "✦ কেন Divine Travelers",
        whyChoose: "কেন বেছে নেবেন",
        us: "আমাদের",
        whyChooseDesc: "ভ্রমণ সেবায় বছরের পর বছরের অভিজ্ঞতা নিয়ে, আমরা আপনার স্বপ্ন পূরণে সঠিক নির্দেশনা ও বিশেষজ্ঞ সহায়তা প্রদান করি।",

        expertGuidance: "বিশেষজ্ঞ গাইডেন্স",
        expertGuidanceDesc: "অভিবাসন আইন ও পদ্ধতি সম্পর্কে গভীর জ্ঞানসম্পন্ন দক্ষ পেশাদার।",
        fastProcessing: "দ্রুত প্রসেসিং",
        fastProcessingDesc: "উচ্চ সাফল্যের হার এবং ন্যূনতম বিলম্বে দ্রুত ও দক্ষ বুকিং প্রসেসিং।",
        support247: "২৪/৭ সাপোর্ট",
        support247Desc: "আপনার সকল প্রশ্ন ও উদ্বেগের জন্য সার্বক্ষণিক গ্রাহক সেবা।",
        affordablePrices: "সাশ্রয়ী মূল্য",
        affordablePricesDesc: "সেবার মান বা সাপোর্টে আপোষ না করে প্রতিযোগিতামূলক মূল্য।",
        fiftyCountries: "৫০+ দেশ",
        fiftyCountriesDesc: "আমরা স্থানীয় দক্ষতার সাথে বিশ্বজুড়ে গন্তব্যে ভ্রমণের ব্যবস্থা করি।",
        successRate: "৯৮% সাফল্যের হার",
        successRateDesc: "আমাদের ক্লায়েন্টদের জন্য সফল ভ্রমণের প্রমাণিত ট্র্যাক রেকর্ড।",

        // Stats
        yearsExperience: "বছরের অভিজ্ঞতা",
        tripsArranged: "ট্রিপ সম্পন্ন",
        statSuccessRate: "সাফল্যের হার",
        countriesCovered: "দেশ কভার",
        customerSupport: "গ্রাহক সেবা",

        // Testimonials
        testimonials: "✦ প্রশংসাপত্র",
        voicesOfOur: "আমাদের ক্লায়েন্টদের",
        clients: "মতামত",
        verifiedClient: "যাচাইকৃত ক্লায়েন্ট",

        testimonial1Name: "তানজিনা রুপা",
        testimonial1Text: "Divine Travelers এক সপ্তাহের মধ্যে আমার সিঙ্গাপুর ট্রিপের ব্যবস্থা করেছে। তাদের বিশেষজ্ঞ গাইডেন্স পুরো প্রক্রিয়াটিকে সহজ ও ঝামেলামুক্ত করেছে!",
        testimonial2Name: "মাবিয়া রহমান",
        testimonial2Text: "অসাধারণ সেবা! তারা আমার USA ট্রিপ পরিকল্পনা পেশাদারভাবে পরিচালনা করেছে। টিমটি অত্যন্ত জ্ঞানী ও সহায়ক।",
        testimonial3Name: "ফোরকান উদ্দিন",
        testimonial3Text: "আমি Divine Travelers-র মাধ্যমে কানাডায় পড়াশোনার যাত্রা পরিকল্পনা করেছি। তারা প্রতিটি ধাপে আমাকে গাইড করেছে।",

        // Footer CTA
        readyToStart: "আপনার যাত্রা শুরু করতে প্রস্তুত?",
        footerCTADesc: "ফ্লাইট বুকিং, ট্যুর এবং আরো অনেক কিছুতে আমাদের বিশেষজ্ঞরা আপনাকে সাহায্য করুন",
        callNow: "এখনই কল করুন",
        freeConsultation: "বিনামূল্যে পরামর্শ",

        // Footer Brand
        footerBrandDesc: "বাংলাদেশে ফ্লাইট বুকিং, হজ্জ ও ওমরাহ প্যাকেজ এবং ট্যুর পরিকল্পনায় আপনার বিশ্বস্ত সঙ্গী।",
        hotlineTime: "হটলাইন (সকাল ৯:৩০ - রাত ৮:৩০)",

        // Footer Column Headings
        ourServices: "আমাদের সেবাসমূহ",
        quickLinks: "দ্রুত লিঙ্ক",

        // Footer Service Links
        footerFlightBooking: "ফ্লাইট বুকিং",
        footerTourPackages: "ট্যুর প্যাকেজ",
        footerHajjUmrah: "হজ্জ ও ওমরাহ",
        footerStudyAbroad: "বিদেশে পড়াশোনা",


        // Footer Quick Links
        aboutUs: "আমাদের সম্পর্কে",
        footerBlog: "ব্লগ",
        contactUs: "যোগাযোগ করুন",
        privacyPolicy: "গোপনীয়তা নীতি",
        termsOfService: "সেবার শর্তাবলী",
        faq: "সাধারণ জিজ্ঞাসা",

        // Footer Newsletter
        newsletter: "নিউজলেটার",
        yourEmail: "আপনার ইমেইল",

        // Footer Bottom
        acceptedPayment: "গৃহীত পেমেন্ট পদ্ধতি",
        allRightsReserved: "সর্বস্বত্ব সংরক্ষিত।",
        terms: "শর্তাবলী",
        privacy: "গোপনীয়তা",
    }
};

export function LanguageProvider({ children }) {
    const [language, setLanguage] = useState('en');
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        // Load saved language preference
        const savedLang = localStorage.getItem('language');
        if (savedLang && (savedLang === 'en' || savedLang === 'bn')) {
            setLanguage(savedLang);
            // Update HTML lang attribute for CSS font switching
            document.documentElement.lang = savedLang;
        }
    }, []);

    // Update HTML lang attribute when language changes
    useEffect(() => {
        if (mounted) {
            document.documentElement.lang = language;
        }
    }, [language, mounted]);

    const toggleLanguage = () => {
        const newLang = language === 'en' ? 'bn' : 'en';
        setLanguage(newLang);
        localStorage.setItem('language', newLang);
    };

    const setLanguageDirectly = (lang) => {
        if (lang === 'en' || lang === 'bn') {
            setLanguage(lang);
            localStorage.setItem('language', lang);
        }
    };

    const t = (key) => {
        return translations[language][key] || key;
    };

    if (!mounted) {
        return <>{children}</>;
    }

    return (
        <LanguageContext.Provider value={{ language, toggleLanguage, setLanguage: setLanguageDirectly, t }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);

    // Return safe defaults if context is not available (SSR or outside provider)
    if (!context) {
        return {
            language: 'en',
            toggleLanguage: () => { },
            setLanguage: () => { },
            t: (key) => key,
        };
    }

    return context;
}

export default LanguageProvider;
