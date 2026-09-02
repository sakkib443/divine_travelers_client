import Navbar from "@/components/shared/Navbar";

export default function AuthLayout({ children }) {
    return (
        <div className="flex min-h-screen flex-col">
            <Navbar />
            <main className="flex flex-1 flex-col">
                {children}
            </main>
        </div>
    );
}
