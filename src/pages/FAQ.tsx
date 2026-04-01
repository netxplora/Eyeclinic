import Layout from "@/components/Layout";
import FloatingCTA from "@/components/FloatingCTA";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { HelpCircle, MessagesSquare, Clock, Phone, Mail, Award, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import heroSlideFrames from "@/assets/satome/hero-slide-frames.png";

const FAQ = () => {
    const faqs = [
        {
            category: "General Information",
            items: [
                {
                    question: "Where is Satome Eye Clinic located?",
                    answer: "We are located at 32 W Circular Rd, Tv Rd, beside the licensing office, Use, Benin City 300271, Edo State. We have ample parking space and our clinic is wheelchair accessible."
                },
                {
                    question: "What are your operating hours?",
                    answer: "We are open Monday through Friday from 8:00 AM to 6:00 PM, and on Saturdays from 9:00 AM to 2:00 PM. We are closed on Sundays."
                },
                {
                    question: "Do I need to book an appointment, or do you accept walk-ins?",
                    answer: "While we highly recommend booking an appointment to minimize your wait time, we gladly accept walk-in patients during our regular operating hours. Emergencies are always prioritized."
                },
                {
                    question: "How do I schedule an appointment?",
                    answer: "You can schedule an appointment quickly by clicking the 'Book Appointment' button on our website, calling us at 0805 907 0153, or messaging us on WhatsApp."
                }
            ]
        },
        {
            category: "Eye Exams & Services",
            items: [
                {
                    question: "How often should I get a comprehensive eye exam?",
                    answer: "The Nigerian Optometric Association recommends a comprehensive eye exam every 1 to 2 years for most adults. However, if you wear glasses or contacts, have a family history of eye disease, or have conditions like diabetes, you should have your eyes checked annually."
                },
                {
                    question: "What does your comprehensive eye exam cover?",
                    answer: "Our comprehensive eye exam includes visual acuity testing, refraction (calculating your prescription), eye muscle testing, binocular vision assessment, intraocular pressure measurement (glaucoma screening), and a thorough evaluation of the front and back of your eyes (retina, optic nerve)."
                },
                {
                    question: "Do you treat eye diseases and infections?",
                    answer: "Yes, our certified optometrists can diagnose, treat, and manage many eye conditions including conjunctivitis (Apollo or pink eye), dry eye syndrome, ocular allergies, and minor eye injuries."
                },
                {
                    question: "Do you offer pediatric eye care?",
                    answer: "Absolutely! We do have a specialized pediatric unit to make children feel comfortable. We recommend children have their first comprehensive eye exam at 6 months, then at age 3, and right before starting school."
                }
            ]
        },
        {
            category: "Glasses & Contact Lenses",
            items: [
                {
                    question: "How long does it take to get my new glasses?",
                    answer: "For most standard prescriptions, we offer same-day dispensing because we have an on-site lab! Complex prescriptions, progressive lenses, or special coatings may take 2 to 5 business days."
                },
                {
                    question: "Can I bring in a prescription from another eye doctor?",
                    answer: "Yes, we gladly accept valid prescriptions from other licensed eye care professionals. Come in and browse our wide selection of designer frames!"
                },
                {
                    question: "Do you offer contact lens fittings?",
                    answer: "Yes, we offer comprehensive contact lens exams and fittings. We provide various options including daily disposables, monthly lenses, toric lenses for astigmatism, and color contacts."
                },
                {
                    question: "What should I do if my glasses break?",
                    answer: "Bring them to our clinic. We offer repair services for many types of frame damages. If they are beyond repair, we can help you select a new frame and transfer your lenses if they fit."
                }
            ]
        },
        {
            category: "Payment & Insurance",
            items: [
                {
                    question: "Do you accept HMOs (Health Maintenance Organizations)?",
                    answer: "Yes, we partner with major HMOs in Nigeria. Please call our clinic with your HMO provider details so we can verify your coverage before your visit."
                },
                {
                    question: "What forms of payment do you accept?",
                    answer: "We accept Debit/Credit Cards (POS), Bank Transfers, and Cash. We ensure a seamless checkout process for your convenience."
                },
                {
                    question: "Are your services affordable?",
                    answer: "We believe quality eye care should be accessible. We offer transparent pricing with no hidden fees and provide excellent frame and lens options to fit various budgets."
                }
            ]
        }
    ];

    return (
        <Layout>
            <FloatingCTA />

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 bg-black overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <img
                        src={heroSlideFrames}
                        alt="FAQ Background"
                        className="w-full h-full object-cover opacity-60"
                    />
                    <div className="absolute inset-0 bg-black/50"></div>
                </div>
                <div className="container mx-auto px-4 lg:px-6 relative z-10 text-center">
                    <Badge className="mb-6 bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 transition-colors">
                        <HelpCircle className="w-4 h-4 mr-2" />
                        Support Center
                    </Badge>
                    <h1 className="text-4xl lg:text-5xl font-extrabold mb-6 tracking-tight text-white drop-shadow-md">
                        Frequently Asked <span className="text-primary">Questions</span>
                    </h1>
                    <p className="text-lg text-white/90 max-w-2xl mx-auto leading-relaxed drop-shadow-md">
                        Find answers to common questions about our clinic, services, eye exams, eyewear, and insurance. If you can't find what you're looking for, feel free to reach out.
                    </p>
                </div>
            </section>

            {/* Main FAQ Content */}
            <section className="py-20 bg-background">
                <div className="container mx-auto px-4 lg:px-6">
                    <div className="grid lg:grid-cols-3 gap-12">

                        {/* Left Column: Quick Info & Contact */}
                        <div className="lg:col-span-1 space-y-6">
                            <Card className="border-2 bg-card shadow-sm sticky top-28">
                                <CardContent className="p-8">
                                    <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
                                        <MessagesSquare className="h-7 w-7 text-primary" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-foreground mb-4">Still have questions?</h3>
                                    <p className="text-muted-foreground mb-8 text-sm leading-relaxed">
                                        Can't find the answer you're looking for? Our friendly team is ready to help you with any inquiries you might have regarding your eye health.
                                    </p>

                                    <div className="space-y-4 mb-8">
                                        <div className="flex flex-col gap-1">
                                            <span className="text-sm font-semibold text-foreground flex items-center gap-2">
                                                <Phone className="w-4 h-4 text-primary" /> Call Us
                                            </span>
                                            <a href="tel:+2348059070153" className="text-sm text-muted-foreground hover:text-primary transition-colors ml-6">
                                                0805 907 0153
                                            </a>
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <span className="text-sm font-semibold text-foreground flex items-center gap-2">
                                                <Mail className="w-4 h-4 text-primary" /> Email Us
                                            </span>
                                            <a href="mailto:info@satomeeyeclinic.com" className="text-sm text-muted-foreground hover:text-primary transition-colors ml-6">
                                                info@satomeeyeclinic.com
                                            </a>
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <span className="text-sm font-semibold text-foreground flex items-center gap-2">
                                                <MapPin className="w-4 h-4 text-primary" /> Visit Us
                                            </span>
                                            <p className="text-sm text-muted-foreground ml-6 leading-tight">
                                                32 W Circular Rd, Tv Rd, beside licensing office, Use, Benin City
                                            </p>
                                        </div>
                                    </div>

                                    <Button asChild className="w-full text-base font-semibold shadow-md">
                                        <Link to="/contact">Contact Support</Link>
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Right Column: Accordions */}
                        <div className="lg:col-span-2">
                            {faqs.map((category, idx) => (
                                <div key={idx} className="mb-12 last:mb-0">
                                    <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
                                        <div className="w-2 h-8 rounded-full bg-primary"></div>
                                        {category.category}
                                    </h2>
                                    <div className="bg-card border border-border/50 rounded-2xl p-2 sm:p-6 shadow-sm">
                                        <Accordion type="single" collapsible className="w-full">
                                            {category.items.map((item, i) => (
                                                <AccordionItem key={i} value={`item-${idx}-${i}`} className="border-b last:border-0 px-2 sm:px-4">
                                                    <AccordionTrigger className="text-left text-base font-semibold hover:no-underline hover:text-primary py-5">
                                                        {item.question}
                                                    </AccordionTrigger>
                                                    <AccordionContent className="text-muted-foreground leading-relaxed pb-6 text-sm sm:text-base">
                                                        {item.answer}
                                                    </AccordionContent>
                                                </AccordionItem>
                                            ))}
                                        </Accordion>
                                    </div>
                                </div>
                            ))}
                        </div>

                    </div>
                </div>
            </section>

            {/* Trust factors strip */}
            <section className="bg-primary py-12">
                <div className="container mx-auto px-4 lg:px-6">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-center divide-x divide-primary-foreground/20">
                        <div className="px-4">
                            <Award className="w-8 h-8 text-primary-foreground mx-auto mb-3" />
                            <div className="text-primary-foreground font-bold mb-1">Certified Experts</div>
                            <div className="text-primary-foreground/80 text-xs sm:text-sm">Licensed Optometrists</div>
                        </div>
                        <div className="px-4">
                            <Clock className="w-8 h-8 text-primary-foreground mx-auto mb-3" />
                            <div className="text-primary-foreground font-bold mb-1">Fast Service</div>
                            <div className="text-primary-foreground/80 text-xs sm:text-sm">Same-Day Glasses</div>
                        </div>
                        <div className="px-4">
                            <HelpCircle className="w-8 h-8 text-primary-foreground mx-auto mb-3" />
                            <div className="text-primary-foreground font-bold mb-1">Always Helpful</div>
                            <div className="text-primary-foreground/80 text-xs sm:text-sm">Friendly Support</div>
                        </div>
                        <div className="px-4">
                            <Phone className="w-8 h-8 text-primary-foreground mx-auto mb-3" />
                            <div className="text-primary-foreground font-bold mb-1">Easy Booking</div>
                            <div className="text-primary-foreground/80 text-xs sm:text-sm">Call or Book Online</div>
                        </div>
                    </div>
                </div>
            </section>
        </Layout>
    );
};

export default FAQ;
