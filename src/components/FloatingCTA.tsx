import { MessageCircle, Phone, X, Calendar } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

const FloatingCTA = () => {
  const [isOpen, setIsOpen] = useState(false);

  const actions = [
    {
      icon: MessageCircle,
      label: "WhatsApp",
      color: "bg-green-500 hover:bg-green-600",
      onClick: () =>
        window.open(
          "https://wa.me/2348059070153?text=Hello! I would like to book an appointment at Satome Eye Clinic.",
          "_blank"
        ),
    },
    {
      icon: Phone,
      label: "Call Us",
      color: "bg-blue-500 hover:bg-blue-600",
      onClick: () => (window.location.href = "tel:+2348059070153"),
    },
    {
      icon: Calendar,
      label: "Book Online",
      color: "bg-purple-500 hover:bg-purple-600",
      href: "/book",
    },
  ];

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {/* Speed-dial action items */}
      <div
        className={`flex flex-col items-end gap-3 transition-all duration-300 ${isOpen ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 translate-y-4 pointer-events-none"}`}
      >
        {actions.map((action, i) => (
          <div key={i} className="flex items-center gap-3 group">
            {/* Label */}
            <span className="text-xs font-bold text-foreground bg-background/90 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-lg border border-border/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
              {action.label}
            </span>

            {/* Button */}
            {action.href ? (
              <Link
                to={action.href}
                className={`w-12 h-12 ${action.color} text-white rounded-2xl shadow-xl flex items-center justify-center transition-all duration-200 hover:scale-110 hover:shadow-2xl`}
                onClick={() => setIsOpen(false)}
                aria-label={action.label}
              >
                <action.icon className="h-5 w-5" />
              </Link>
            ) : (
              <button
                onClick={() => {
                  action.onClick?.();
                  setIsOpen(false);
                }}
                className={`w-12 h-12 ${action.color} text-white rounded-2xl shadow-xl flex items-center justify-center transition-all duration-200 hover:scale-110 hover:shadow-2xl`}
                aria-label={action.label}
              >
                <action.icon className="h-5 w-5" />
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Main toggle button */}
      <div className="relative group">
        {/* Glow ring */}
        <div className="absolute inset-0 bg-primary rounded-2xl blur-lg opacity-60 group-hover:opacity-90 transition-opacity animate-pulse"></div>

        {/* Pulsing ring (only when closed) */}
        {!isOpen && (
          <span className="absolute inset-0 rounded-2xl bg-primary opacity-40 animate-ping"></span>
        )}

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="relative w-14 h-14 bg-primary text-primary-foreground rounded-2xl shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-110"
          aria-label={isOpen ? "Close contact options" : "Open contact options"}
        >
          <span
            className={`absolute transition-all duration-300 ${isOpen ? "opacity-100 rotate-0" : "opacity-0 rotate-90"}`}
          >
            <X className="h-6 w-6" />
          </span>
          <span
            className={`absolute transition-all duration-300 ${isOpen ? "opacity-0 -rotate-90" : "opacity-100 rotate-0"}`}
          >
            <MessageCircle className="h-6 w-6" />
          </span>
        </button>
      </div>
    </div>
  );
};

export default FloatingCTA;

