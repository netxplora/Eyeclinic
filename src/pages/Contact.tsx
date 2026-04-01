import Layout from "@/components/Layout";
import FloatingCTA from "@/components/FloatingCTA";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  MessageCircle,
  Sparkles,
  ArrowRight,
  Navigation,
  Car,
  Bus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import clinicExterior from "@/assets/satome/clinic-exterior.png";

const Contact = () => {
  const contactDetails = [
    {
      icon: Phone,
      title: "Phone",
      details: ["0805 907 0153"],
      action: "tel:+2348059070153",
      actionLabel: "Call Now",
    },
    {
      icon: MessageCircle,
      title: "WhatsApp",
      details: ["0805 907 0153"],
      action: "https://wa.me/2348059070153",
      actionLabel: "Chat Now",
    },
    {
      icon: Mail,
      title: "Email",
      details: ["info@satomeeyeclinic.com"],
      action: "mailto:info@satomeeyeclinic.com",
      actionLabel: "Send Email",
    },
    {
      icon: MapPin,
      title: "Address",
      details: [
        "32 W Circular Rd, Tv Rd",
        "beside licensing office, Use",
        "Benin City 300271, Edo",
      ],
      action: null,
      actionLabel: null,
    },
  ];

  const openingHours = [
    { day: "Monday - Friday", hours: "8:00 AM - 6:00 PM", isOpen: true },
    { day: "Saturday", hours: "9:00 AM - 2:00 PM", isOpen: true },
    { day: "Sunday", hours: "Closed", isOpen: false },
  ];

  const faqs = [
    {
      question: "Do I need an appointment?",
      answer:
        "While walk-ins are welcome, we strongly recommend booking an appointment to ensure minimal waiting time and a dedicated slot with our optometrist. You can book online, via WhatsApp, or by phone.",
    },
    {
      question: "What should I bring to my appointment?",
      answer:
        "Please bring any current glasses or contact lenses you wear, any previous prescriptions, your HMO card (if applicable), and a list of any medications you are currently taking.",
    },
    {
      question: "Do you accept HMO insurance?",
      answer:
        "Yes, we work with select HMO providers. Please contact our front desk to confirm if your plan is accepted before your visit. We also accept cash, bank transfer, and POS card payments.",
    },
    {
      question: "How long does an eye exam take?",
      answer:
        "A comprehensive eye examination typically takes 30–45 minutes, depending on the complexity. Specialized tests like glaucoma screening may require additional time. We'll keep you informed throughout.",
    },
  ];

  return (
    <Layout>
      <FloatingCTA />

      {/* Hero Section */}
      <section className="relative py-32 overflow-hidden bg-black">
        <div className="absolute inset-0 z-0">
          <img
            src={clinicExterior}
            alt="Satome Eye Clinic Exterior"
            className="w-full h-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-black/50"></div>
        </div>

        <div className="container mx-auto px-4 lg:px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-6 bg-background/20 text-primary-foreground border-primary-foreground/30 backdrop-blur-sm">
              <Sparkles className="w-4 h-4 mr-2" />
              Get In Touch
            </Badge>
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
              Contact <span className="text-primary">Us</span>
            </h1>
            <p className="text-xl text-white/90 leading-relaxed max-w-2xl mx-auto drop-shadow-md">
              We're here to answer your questions, address your concerns, and
              schedule your appointment. Reach out to us through any of the
              channels below — we'd love to hear from you.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Cards */}
      <section className="py-24">
        <div className="container mx-auto px-4 lg:px-6">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
              {contactDetails.map((detail, index) => {
                const Icon = detail.icon;
                return (
                  <Card
                    key={index}
                    className="border-2 hover:border-primary transition-all duration-300 hover:shadow-2xl group bg-gradient-card"
                  >
                    <CardContent className="p-8 text-center">
                      <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary mb-6 shadow-xl group-hover:scale-110 transition-transform">
                        <Icon className="h-8 w-8 text-primary-foreground" />
                      </div>
                      <h3 className="font-bold text-foreground mb-4 text-lg">
                        {detail.title}
                      </h3>
                      {detail.details.map((item, idx) => (
                        <p
                          key={idx}
                          className="text-sm text-muted-foreground mb-1"
                        >
                          {item}
                        </p>
                      ))}
                      {detail.action && (
                        <Button
                          variant="link"
                          className="p-0 h-auto mt-4 font-semibold"
                          onClick={() => {
                            if (detail.action.startsWith("http")) {
                              window.open(detail.action, "_blank");
                            } else {
                              window.location.href = detail.action;
                            }
                          }}
                        >
                          {detail.actionLabel} →
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Clinic Photo */}
            <div className="relative mb-16">
              <div className="absolute inset-0 bg-primary rounded-3xl blur-2xl opacity-20"></div>
              <Card className="relative border-2 overflow-hidden shadow-2xl">
                <CardContent className="p-0">
                  <img
                    src={clinicExterior}
                    alt="Satome Eye Clinic Exterior"
                    className="w-full h-80 md:h-[500px] object-cover"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-background/90 to-transparent p-8">
                    <h3 className="text-2xl font-bold text-foreground mb-2">
                      Satome Eye Clinic
                    </h3>
                    <p className="text-muted-foreground">
                      32 W Circular Rd, Tv Rd, beside licensing office, Use,
                      Benin City 300271, Edo
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Map and Hours */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Map */}
              <Card className="lg:col-span-2 border-2 overflow-hidden shadow-2xl flex flex-col">
                <CardContent className="p-0 flex-grow">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3965.0!2d5.6!3d6.33!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2sBenin%20City%2C%20Nigeria!5e0!3m2!1sen!2sng!4v1620000000000!5m2!1sen!2sng"
                    className="w-full h-full min-h-[500px] block"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    title="Satome Eye Clinic Location Map"
                  ></iframe>
                </CardContent>
              </Card>

              {/* Opening Hours */}
              <Card className="border-2 hover:border-primary transition-all duration-300 shadow-2xl bg-gradient-card">
                <CardContent className="p-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary mb-6 shadow-xl">
                    <Clock className="h-8 w-8 text-primary-foreground" />
                  </div>
                  <h3 className="font-bold text-2xl text-foreground mb-6">
                    Opening Hours
                  </h3>
                  <div className="space-y-4">
                    {openingHours.map((schedule, index) => (
                      <div key={index} className="p-4 bg-background rounded-xl">
                        <div className="flex items-center justify-between mb-1">
                          <p className="font-bold text-foreground">
                            {schedule.day}
                          </p>
                          <Badge
                            variant={schedule.isOpen ? "default" : "secondary"}
                            className={
                              schedule.isOpen
                                ? "bg-green-100 text-green-700 border-green-200"
                                : ""
                            }
                          >
                            {schedule.isOpen ? "Open" : "Closed"}
                          </Badge>
                        </div>
                        <p className="text-muted-foreground text-sm">
                          {schedule.hours}
                        </p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-8 pt-8 border-t border-border">
                    <p className="text-sm font-bold text-foreground mb-2">
                      🚨 Emergency Care:
                    </p>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      For urgent eye care needs outside office hours, call us
                      immediately at{" "}
                      <a
                        href="tel:+2348059070153"
                        className="text-primary font-semibold hover:underline"
                      >
                        0805 907 0153
                      </a>
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Directions */}
            <Card className="mt-8 border-2 bg-gradient-card shadow-xl">
              <CardContent className="p-10">
                <h3 className="font-bold text-3xl text-foreground mb-8">
                  Getting Here
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="group">
                    <div className="w-12 h-12 rounded-xl bg-primary-light flex items-center justify-center mb-4 group-hover:bg-primary transition-all">
                      <Car className="h-6 w-6 text-primary group-hover:text-primary-foreground transition-colors" />
                    </div>
                    <h4 className="font-bold text-foreground mb-3 text-lg">
                      By Car
                    </h4>
                    <p className="text-muted-foreground leading-relaxed text-sm">
                      We're located on 32 West Circular Road, beside the
                      licensing office in Use. Ample parking is available in
                      front of our building. Use Google Maps for the easiest
                      route from your location.
                    </p>
                  </div>
                  <div className="group">
                    <div className="w-12 h-12 rounded-xl bg-secondary-light flex items-center justify-center mb-4 group-hover:bg-primary transition-all">
                      <Bus className="h-6 w-6 text-secondary group-hover:text-primary-foreground transition-colors" />
                    </div>
                    <h4 className="font-bold text-foreground mb-3 text-lg">
                      Public Transport
                    </h4>
                    <p className="text-muted-foreground leading-relaxed text-sm">
                      The clinic is accessible via major bus routes in Benin
                      City. Ask for "West Circular Road, Use" or "Licensing
                      Office" as a landmark. Several drop-off points are within
                      a short walk.
                    </p>
                  </div>
                  <div className="group">
                    <div className="w-12 h-12 rounded-xl bg-accent-light flex items-center justify-center mb-4 group-hover:bg-primary transition-all">
                      <Navigation className="h-6 w-6 text-accent group-hover:text-primary-foreground transition-colors" />
                    </div>
                    <h4 className="font-bold text-foreground mb-3 text-lg">
                      Landmarks
                    </h4>
                    <p className="text-muted-foreground leading-relaxed text-sm">
                      We are located beside the licensing office on Tv Road.
                      Other nearby landmarks include West Circular Road junction
                      and the Use area of Benin City, Edo State.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="py-24 bg-gradient-card relative overflow-hidden">
        <div className="absolute top-0 left-0 w-72 h-72 bg-primary rounded-full blur-3xl opacity-10"></div>

        <div className="container mx-auto px-4 lg:px-6 relative z-10">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-primary-light text-primary border-primary">
              Common Questions
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Frequently Asked{" "}
              <span className="text-primary">
                Questions
              </span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Quick answers to help you plan your visit.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {faqs.map((faq, index) => (
              <Card
                key={index}
                className="border-2 hover:border-primary transition-all duration-300 hover:shadow-xl group"
              >
                <CardContent className="p-8">
                  <h3 className="text-lg font-bold text-foreground mb-3 group-hover:text-primary transition-colors">
                    {faq.question}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed text-sm">
                    {faq.answer}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-hero relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-overlay"></div>

        <div className="container mx-auto px-4 lg:px-6 text-center relative z-10">
          <Badge className="mb-6 bg-background/20 text-primary-foreground border-primary-foreground/30 backdrop-blur-sm">
            <Sparkles className="w-4 h-4 mr-2" />
            We're Waiting for You
          </Badge>
          <h2 className="text-4xl md:text-6xl font-bold text-primary-foreground mb-6">
            Ready to Book
            <br />
            Your Visit?
          </h2>
          <p className="text-xl text-primary-foreground/90 mb-10 max-w-2xl mx-auto leading-relaxed">
            Don't put off your eye health. Schedule an appointment today and
            let our team take care of your vision.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Button
              asChild
              size="lg"
              variant="secondary"
              className="text-base shadow-2xl"
            >
              <Link to="/book">
                Book Appointment
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="bg-background/10 backdrop-blur-sm text-primary-foreground border-primary-foreground/30 hover:bg-background/20 text-base"
            >
              <a href="https://wa.me/2348059070153" target="_blank" rel="noopener noreferrer">
                WhatsApp Us
              </a>
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Contact;

