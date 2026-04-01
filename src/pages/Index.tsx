import Layout from "@/components/Layout";
import FloatingCTA from "@/components/FloatingCTA";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Eye,
  Glasses,
  Baby,
  Contact,
  Activity,
  Award,
  Clock,
  Users,
  Star,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Shield,
  HeartPulse,
  Phone,
  MapPin,
} from "lucide-react";
import { useState, useEffect } from "react";
import heroSlide1 from "@/assets/satome/hero-clinic-wide.png";
import heroSlide2 from "@/assets/satome/hero-slide-exam.png";
import heroSlide3 from "@/assets/satome/hero-slide-frames.png";
import serviceExam from "@/assets/satome/service-exam.png";
import serviceContacts from "@/assets/satome/service-contacts.png";
import servicePediatric from "@/assets/satome/service-pediatric.png";
import serviceGlasses from "@/assets/satome/service-glasses.png";

const Index = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const heroSlides = [heroSlide1, heroSlide2, heroSlide3];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [heroSlides.length]);

  const services = [
    {
      icon: Eye,
      title: "Comprehensive Eye Exams",
      description:
        "Thorough eye health assessments using advanced diagnostic technology to evaluate your complete visual system and detect early signs of disease.",
      image: serviceExam,
      color: "primary",
      link: "/services#eye-exams",
    },
    {
      icon: Contact,
      title: "Contact Lens Fitting",
      description:
        "Expert fitting and ongoing care with a wide range of daily, monthly, toric, and multifocal contact lens options tailored to your lifestyle.",
      image: serviceContacts,
      color: "secondary",
      link: "/services#contact-lenses",
    },
    {
      icon: Baby,
      title: "Pediatric Eye Care",
      description:
        "Specialized, child-friendly eye exams that monitor vision development, detect amblyopia, and address learning-related vision problems early.",
      image: servicePediatric,
      color: "accent",
      link: "/services#pediatric",
    },
    {
      icon: Glasses,
      title: "Designer Frames & Lenses",
      description:
        "Over 500 frame styles from leading brands with premium lens options including blue-light filtering, photochromic, and progressive lenses.",
      image: serviceGlasses,
      color: "primary",
      link: "/services#glasses",
    },
  ];

  const stats = [
    { icon: Users, value: "5,000+", label: "Happy Patients" },
    { icon: Award, value: "15+", label: "Years Experience" },
    { icon: Star, value: "4.9", label: "Average Rating" },
    { icon: Clock, value: "Same Day", label: "Results Available" },
  ];

  const testimonials = [
    {
      name: "Mrs. Eseosa Ogiemwonyi",
      role: "School Teacher",
      rating: 5,
      text: "Satome Eye Clinic is simply the best! Dr. Satome took his time to explain every step of my exam. I got my new glasses the same day. The staff were professional and the clinic is so clean and modern. Highly recommended!",
      avatar: "EO",
    },
    {
      name: "Engr. Patrick Idemudia",
      role: "Civil Engineer",
      rating: 5,
      text: "I've been a patient here for over 5 years. Their glaucoma screening saved my sight — they caught the condition early before I even had symptoms. The best eye care clinic in Benin City without a doubt.",
      avatar: "PI",
    },
    {
      name: "Mrs. Grace Aiguobasinmwin",
      role: "Pharmacist",
      rating: 5,
      text: "My children love coming here! The pediatric unit is fantastic — they make kids feel so comfortable. Both my son and daughter got their first glasses at Satome and they couldn't be happier with the experience.",
      avatar: "GA",
    },
  ];

  const benefits = [
    "State-of-the-art diagnostic equipment",
    "Experienced & certified optometrists",
    "Wide selection of 500+ designer frames",
    "Same-day service available",
    "Affordable pricing & HMO accepted",
    "Child-friendly pediatric unit",
    "Convenient location in Benin City",
    "Walk-in & emergency care available",
  ];

  const quickServices = [
    {
      icon: Activity,
      title: "Glaucoma Screening",
      desc: "Advanced pressure testing and OCT imaging for early detection",
    },
    {
      icon: HeartPulse,
      title: "Diabetic Eye Care",
      desc: "Specialized retinal screening for diabetic patients",
    },
    {
      icon: Shield,
      title: "Emergency Eye Care",
      desc: "Urgent attention for injuries, infections, and sudden vision changes",
    },
  ];

  return (
    <Layout>
      <FloatingCTA />

      {/* Hero Section */}
      <section className="relative min-h-[92vh] flex items-center overflow-hidden bg-black">
        {/* Background Image Slider */}
        <div className="absolute inset-0 w-full h-full z-0">
          {heroSlides.map((slide, index) => (
            <img
              key={index}
              src={slide}
              alt={`Satome Eye Clinic facility ${index + 1}`}
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out ${currentSlide === index ? "opacity-100" : "opacity-0"
                }`}
            />
          ))}
          {/* Dark Overlay to make text readable */}
          <div className="absolute inset-0 bg-black/60 z-10"></div>
        </div>

        {/* Content */}
        <div className="container mx-auto px-4 lg:px-6 relative z-20 w-full">
          <div className="max-w-3xl py-24">
            <Badge className="mb-6 self-start px-5 py-2 text-sm bg-primary/20 hover:bg-primary/30 border-primary/50 text-white animate-fade-in-up backdrop-blur-sm">
              <Sparkles className="w-4 h-4 mr-2 text-primary" />
              Trusted Eye Care in Benin City
            </Badge>

            <h1 className="text-5xl md:text-6xl xl:text-7xl font-extrabold mb-6 leading-[1.08] tracking-tight animate-fade-in-up animation-delay-100 text-white">
              See the world
              <br />
              <span className="text-primary">with clarity.</span>
            </h1>

            <p className="text-lg md:text-xl text-white/90 mb-8 leading-relaxed max-w-xl animate-fade-in-up animation-delay-200 drop-shadow-md">
              Benin City's most trusted optometry clinic — delivering
              comprehensive eye exams, designer eyewear, pediatric care,
              and advanced glaucoma screening for your entire family.
            </p>

            {/* Trust badges */}
            <div className="flex flex-wrap gap-3 mb-10">
              {[
                { icon: Award, text: "15+ Years Experience" },
                { icon: Users, text: "5,000+ Patients" },
                { icon: Star, text: "4.9★ Rated" },
              ].map((badge, i) => (
                <div key={i} className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-sm font-medium text-white hover:border-primary transition-colors">
                  <badge.icon className="w-4 h-4 text-primary" />
                  {badge.text}
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-4 mb-12 animate-fade-in-up animation-delay-300">
              <Button asChild size="lg" className="text-base shadow-xl h-14 px-8 bg-primary hover:bg-primary/90 text-primary-foreground border-none hover:scale-105 transition-all duration-300">
                <Link to="/book">
                  Book Appointment
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-14 px-8 bg-white/10 backdrop-blur-md border-white/20 text-white hover:bg-white/20 hover:text-white hover:scale-105 transition-all duration-300">
                <Link to="/services">Our Services</Link>
              </Button>
              <Button asChild size="lg" variant="ghost" className="text-white hover:bg-white/10 hover:text-white h-14 transition-all hover:scale-105 duration-300">
                <a href="tel:+2348059070153">
                  <Phone className="mr-2 h-5 w-5 text-primary" />
                  0805 907 0153
                </a>
              </Button>
            </div>

            {/* Stats strip - Adjusted for dark bg */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl animate-fade-in-up animation-delay-400">
              {stats.map((stat, index) => (
                <div
                  key={index}
                  className="text-center p-5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/15 hover:border-primary transition-all duration-300 hover:scale-105 group"
                >
                  <stat.icon className="w-6 h-6 mx-auto mb-2 text-primary group-hover:scale-110 transition-transform" />
                  <div className="text-xl font-bold text-white tracking-tight">
                    {stat.value}
                  </div>
                  <div className="text-[11px] text-white/80 font-semibold uppercase tracking-wider mt-1">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Info Overlay at Bottom Right */}
        <div className="absolute bottom-6 right-6 z-30 hidden md:block animate-fade-in-up animation-delay-300">
          <div className="flex bg-black/50 backdrop-blur-md rounded-xl p-4 shadow-lg border border-white/10">
            <div className="flex-shrink-0 w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center mr-4">
              <MapPin className="text-primary w-5 h-5" />
            </div>
            <div className="flex flex-col justify-center">
              <h3 className="font-bold text-white text-sm">Satome Eye Clinic</h3>
              <p className="text-xs text-white/70">32 W Circular Rd, Use, Benin City, Edo</p>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-24 bg-muted/30 border-y border-border/40 relative overflow-hidden">
        <div className="container mx-auto px-4 lg:px-6 relative z-10">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
              Our Services
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
              Comprehensive Eye Care
              <br />
              <span className="text-primary">
                Solutions
              </span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              From routine exams to specialized treatments, we provide complete
              vision care for the whole family using the latest technology.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {services.map((service, index) => (
              <Card
                key={index}
                className="group border-2 hover:border-primary transition-all duration-500 hover:shadow-2xl overflow-hidden bg-card hover:scale-[1.03] flex flex-col h-full"
              >
                <div className="relative h-56 overflow-hidden">
                  <img
                    src={service.image}
                    alt={service.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-80"></div>
                  <div className="absolute bottom-5 left-5">
                    <div
                      className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center shadow-2xl group-hover:rotate-6 transition-all duration-500"
                    >
                      <service.icon className="h-7 w-7 text-primary-foreground" />
                    </div>
                  </div>
                </div>
                <CardContent className="p-8 flex flex-col flex-grow">
                  <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors">
                    {service.title}
                  </h3>
                  <p className="text-muted-foreground text-sm mb-6 leading-relaxed flex-grow">
                    {service.description}
                  </p>
                  <Link
                    to={service.link}
                    className="text-primary font-bold text-sm inline-flex items-center gap-2 group/link transition-all"
                  >
                    Explore Service
                    <ArrowRight className="h-4 w-4 transition-transform group-hover/link:translate-x-2" />
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Additional Quick Services */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {quickServices.map((qs, index) => (
              <Card
                key={index}
                className="border-2 hover:border-primary transition-all duration-300 hover:shadow-xl group"
              >
                <CardContent className="p-6 flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary transition-colors">
                    <qs.icon className="h-6 w-6 text-primary group-hover:text-primary-foreground transition-colors" />
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground mb-1 group-hover:text-primary transition-colors">
                      {qs.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {qs.desc}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center">
            <Button asChild size="lg" variant="outline">
              <Link to="/services">
                View All Services
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-24 relative overflow-hidden bg-background">
        <div className="container mx-auto px-4 lg:px-6 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
                Why Choose Us
              </Badge>
              <h2 className="text-4xl md:text-5xl font-bold mb-6 text-foreground">
                Excellence in
                <br />
                <span className="text-primary">
                  Eye Care
                </span>
              </h2>
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                At Satome Eye Clinic, we combine cutting-edge diagnostic
                technology with compassionate, patient-centered care to deliver
                the best vision solutions for you and your entire family.
                Here's why thousands of patients trust us with their eyes:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center gap-2.5 group">
                    <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                    <span className="text-foreground font-medium text-sm">
                      {benefit}
                    </span>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-3">
                <Button asChild size="lg">
                  <Link to="/about">Learn About Us</Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link to="/book">Book Now</Link>
                </Button>
              </div>
            </div>

            <div className="relative">
              <Card className="relative border-0 bg-muted overflow-hidden shadow-none">
                <CardContent className="p-8">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 rounded-xl bg-primary flex items-center justify-center shadow-md">
                      <Award className="h-8 w-8 text-primary-foreground" />
                    </div>
                    <div>
                      <div className="text-3xl font-bold text-foreground">
                        15+
                      </div>
                      <div className="text-sm text-primary font-bold">
                        Years of Excellence
                      </div>
                    </div>
                  </div>
                  <p className="text-muted-foreground leading-relaxed mb-6">
                    Over 15 years of dedicated service to the Benin City
                    community, helping thousands maintain healthy vision and
                    find the perfect eyewear solutions. Our track record speaks
                    for itself.
                  </p>
                  <div className="p-4 bg-background rounded-xl border border-border/50">
                    <div className="flex items-start gap-3">
                      <MapPin className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold text-foreground text-sm">
                          Visit Us
                        </p>
                        <p className="text-sm text-muted-foreground">
                          32 W Circular Rd, Tv Rd, beside licensing office,
                          Use, Benin City 300271, Edo
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Technology Section */}
      <section className="py-24 bg-card relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl opacity-10"></div>
        
        <div className="container mx-auto px-4 lg:px-6 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center max-w-7xl mx-auto">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/10 rounded-3xl blur-2xl opacity-20"></div>
              <Card className="relative border-2 overflow-hidden shadow-2xl">
                <img 
                  src={serviceExam} 
                  alt="Professional eye care instruments" 
                  className="w-full h-[400px] object-cover"
                />
              </Card>
            </div>
            <div>
              <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
                Our Technology
              </Badge>
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Advanced Diagnostic
                <br />
                <span className="text-primary">Equipment</span>
              </h2>
              <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                We invest in the latest optometric technology to ensure accurate diagnoses and effective treatments. Our state-of-the-art equipment allows us to detect eye conditions early and provide the best possible care.
              </p>
              <div className="space-y-4">
                <div className="p-4 bg-background rounded-xl border border-border">
                  <h4 className="font-bold text-foreground mb-1">Digital Retinal Imaging</h4>
                  <p className="text-sm text-muted-foreground">High-resolution images of your retina for early disease detection</p>
                </div>
                <div className="p-4 bg-background rounded-xl border border-border">
                  <h4 className="font-bold text-foreground mb-1">Automated Visual Field Testing</h4>
                  <p className="text-sm text-muted-foreground">Comprehensive peripheral vision assessment</p>
                </div>
                <div className="p-4 bg-background rounded-xl border border-border">
                  <h4 className="font-bold text-foreground mb-1">Non-Contact Tonometry</h4>
                  <p className="text-sm text-muted-foreground">Gentle, air-puff eye pressure measurement</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 bg-muted/30 relative overflow-hidden">
        <div className="container mx-auto px-4 lg:px-6 relative z-10">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
              Testimonials
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
              What Our Patients
              <br />
              <span className="text-primary">
                Say About Us
              </span>
            </h2>
            <div className="flex items-center justify-center gap-2 mt-6">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="w-6 h-6 fill-accent text-accent"
                  />
                ))}
              </div>
              <span className="text-2xl font-bold">4.9</span>
              <span className="text-muted-foreground">out of 5</span>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card
                key={index}
                className="border-2 hover:border-primary transition-all duration-500 hover:shadow-2xl bg-card group hover:scale-[1.02]"
              >
                <CardContent className="p-10 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 group-hover:bg-primary/10 transition-colors"></div>
                  <div className="flex gap-1 mb-6">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star
                        key={i}
                        className="w-5 h-5 fill-accent text-accent animate-pulse"
                        style={{ animationDelay: `${i * 150}ms` }}
                      />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-8 leading-relaxed italic text-base relative z-10">
                    "{testimonial.text}"
                  </p>
                  <div className="flex items-center gap-4 relative z-10">
                    <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center text-primary-foreground font-black shadow-xl group-hover:rotate-6 transition-transform">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <div className="font-bold text-foreground text-lg group-hover:text-primary transition-colors">
                        {testimonial.name}
                      </div>
                      <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        {testimonial.role}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Why Book With Us — Trust Strip */}
      <section className="py-20 border-y border-border/40">
        <div className="container mx-auto px-4 lg:px-6">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-primary/10 text-primary border-primary">Why Choose Satome</Badge>
            <h2 className="text-3xl md:text-4xl font-bold">
              The Satome{" "}
              <span className="text-primary">Difference</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {[
              {
                icon: Award,
                title: "Certified Optometrists",
                desc: "All our optometrists are fully licensed and registered with the Optometrists and Dispensing Opticians Registration Board of Nigeria (ODORBN).",
              },
              {
                icon: Clock,
                title: "Same-Day Service",
                desc: "We respect your time. Same-day exam results and prescription dispensing available for most services — no unnecessary delays.",
              },
              {
                icon: Shield,
                title: "Transparent Pricing",
                desc: "We believe in honesty. You'll always know the cost upfront, with no hidden fees. We also offer flexible payment options including HMO.",
              },
              {
                icon: HeartPulse,
                title: "Lifetime Patient Care",
                desc: "From your first visit to ongoing check-ups, we build long-term relationships with every patient and their family across generations.",
              },
            ].map((item, i) => (
              <Card
                key={i}
                className="border-2 hover:border-primary transition-all duration-300 hover:shadow-2xl group text-center"
              >
                <CardContent className="p-8">
                  <div className="w-16 h-16 mx-auto rounded-2xl bg-primary flex items-center justify-center shadow-xl mb-5 group-hover:scale-110 transition-transform">
                    <item.icon className="h-8 w-8 text-primary-foreground" />
                  </div>
                  <h3 className="font-bold text-foreground text-lg mb-3 group-hover:text-primary transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed text-sm">{item.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative bg-primary">
        <div className="container mx-auto px-4 lg:px-6 relative z-10 text-center">
          <Badge className="mb-6 bg-white/10 text-white border-white/20">
            <Sparkles className="w-4 h-4 mr-2" />
            Book Now
          </Badge>
          <h2 className="text-4xl md:text-6xl font-bold text-primary-foreground mb-6">
            Ready to See Better?
          </h2>
          <p className="text-xl text-primary-foreground/90 mb-10 max-w-2xl mx-auto leading-relaxed">
            Schedule your comprehensive eye examination today and experience
            the difference that professional, compassionate care makes. Your
            eyes deserve the best — and that's exactly what we deliver.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Button
              asChild
              size="lg"
              variant="secondary"
              className="text-base shadow-2xl"
            >
              <Link to="/book">
                Book Your Appointment
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="bg-primary text-primary-foreground border-primary hover:bg-primary/90 text-base shadow-2xl"
            >
              <Link to="/contact">Contact Us</Link>
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
