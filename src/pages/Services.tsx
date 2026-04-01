import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import Layout from "@/components/Layout";
import FloatingCTA from "@/components/FloatingCTA";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Eye,
  Contact,
  Baby,
  Glasses,
  Activity,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Shield,
  Stethoscope,
  Microscope,
  HeartPulse,
  Clock,
  Star,
  Users,
  Award,
  Zap,
  Monitor,
  Search
} from "lucide-react";
import serviceExam from "@/assets/satome/service-exam.png";
import serviceContacts from "@/assets/satome/service-contacts.png";
import servicePediatric from "@/assets/satome/service-pediatric.png";
import serviceGlasses from "@/assets/satome/service-glasses.png";
import serviceScreening from "@/assets/satome/service-screening.png";
import heroClinicWide from "@/assets/satome/hero-clinic-wide.png";

const Services = () => {
  const location = useLocation();

  // Scroll to hash section when navigating from dropdown
  useEffect(() => {
    if (location.hash) {
      const timer = setTimeout(() => {
        const el = document.querySelector(location.hash);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 100);
      return () => clearTimeout(timer);
    } else {
      window.scrollTo(0, 0);
    }
  }, [location.hash]);
  const services = [
    {
      id: "eye-exams",
      icon: Eye,
      title: "Comprehensive Eye Examinations",
      image: serviceExam,
      tagline: "Total Visual Health Evaluation",
      description:
        "Our comprehensive eye examinations go far beyond a basic vision test. Using the latest in diagnostic technology, our experienced optometrists conduct a thorough evaluation of your entire visual system — from the front surface of your eye to the delicate structures at the back. We assess visual acuity, eye coordination, peripheral vision, colour perception, and intraocular pressure. This holistic approach ensures every aspect of your optical health is reviewed, allowing us to detect early signs of systemic conditions like diabetes and hypertension.",
      benefits: [
        "Full digital visual acuity and refraction testing",
        "Retinal imaging and fundus internal examination",
        "Intraocular pressure measurement (glaucoma check)",
        "Colour vision and contrast sensitivity testing",
        "Binocular vision and accommodation assessment",
        "Personalized lifestyle and treatment recommendations",
      ],
      whoFor:
        "Recommended for everyone aged 6 and above. Adults should have a comprehensive exam at least once every two years, and annually if you wear corrective lenses, are over 40, or have a family history of eye disease.",
      pricing: "Starting from ₦15,000",
    },
    {
      id: "contact-lenses",
      icon: Contact,
      title: "Contact Lens Fitting & Care",
      image: serviceContacts,
      tagline: "Precision Freedom from Frames",
      description:
        "Whether you're switching from glasses for the first time or looking for a more comfortable lens brand, our expert contact lens fitting service ensures the perfect match for your eyes and lifestyle. We carry an extensive range of premium daily, bi-weekly, and monthly disposable lenses, as well as specialized toric lenses for astigmatism, multifocal options for presbyopia, and custom RGP lenses. Every fitting includes a comprehensive corneal health check, precise topography measurements, and a personalized wearing schedule.",
      benefits: [
        "Digital corneal topography and tear film analysis",
        "Trial lens fitting with real-time comfort and vision evaluation",
        "Guidance on daily, weekly, and monthly breathable lens options",
        "Specialized Toric lenses for intricate astigmatism correction",
        "Multifocal, bifocal, and safe cosmetic lens options",
        "Comprehensive insertion, removal, and daily hygiene training",
      ],
      whoFor:
        "Ideal for active individuals, sports enthusiasts, professionals seeking a glasses-free look, or anyone seeking a versatile alternative to spectacles. Minimum age is typically 12 years, depending on the child's maturity.",
      pricing: "Starting from ₦20,000",
    },
    {
      id: "pediatric",
      icon: Baby,
      title: "Pediatric & Myopia Control",
      image: servicePediatric,
      tagline: "Protecting Young Eyes, Building Bright Futures",
      description:
        "Children's eyes are rapidly developing, and early detection of vision abnormalities is crucial for academic success and overall cognitive development. At Satome Eye Clinic, we've created a warm, child-friendly environment where young patients feel entirely at ease. Our specialized pediatric exams detect issues like amblyopia (lazy eye), strabismus (crossed eyes), and early-onset refractive errors. Furthermore, we employ cutting-edge Myopia Control strategies to slow the progression of near-sightedness in growing children, safeguarding their long-term visual potential.",
      benefits: [
        "Interactive, age-appropriate visual acuity testing",
        "Amblyopia (lazy eye) screening, patching, and management",
        "Strabismus (eye alignment) and depth perception evaluation",
        "Advanced Myopia control strategies (specialised lenses/drops)",
        "Reading and learning-related vision and tracking assessments",
        "Detailed parental guidance on pediatric screen time management",
      ],
      whoFor:
        "All children from infancy through teenage years. A first eye exam is recommended by age 6 months, again at age 3, and right before starting school. Annual exams are essential during school years.",
      pricing: "Starting from ₦10,000",
    },
    {
      id: "glasses",
      icon: Glasses,
      title: "Designer Eyewear & Optical Boutique",
      image: serviceGlasses,
      tagline: "Where Premium Style Meets Perfect Vision",
      description:
        "Finding the right pair of glasses is about more than just correcting your vision — it's about expressing your personality and ensuring unparalleled all-day comfort. Our in-house premium optical boutique features an extensive collection of designer frames from leading international and local luxury brands. Our certified optical dispensers will guide you through frame selection specifically tailored to your face shape, skin tone, and ergonomic lifestyle needs. We also pair your frames with ultra-premium digital lens technologies.",
      benefits: [
        "Over 800 premium frame styles from top global designer brands",
        "Ultra-tough anti-reflective and hydrophobic scratch-resistant coatings",
        "Advanced Blue-light filtering lenses for heavy digital device users",
        "Latest generation rapid-transition photochromic lenses",
        "Custom, wide-corridor progressive and sophisticated bifocal options",
        "Precision frame adjustments, repairs, and ultrasonic cleaning",
      ],
      whoFor:
        "Anyone requiring vision correction — from absolute first-time wearers to long-time spectacle users looking to significantly upgrade their optical style and lens clarity.",
      pricing: "Starting from ₦25,000",
    },
    {
      id: "screening",
      icon: Activity,
      title: "Glaucoma & Cataract Screening",
      image: serviceScreening,
      tagline: "Advanced Early Detection Paradigms",
      description:
        "Glaucoma and cataracts are leading causes of preventable blindness globally. Glaucoma often steals sight silently without early symptoms. At Satome Eye Clinic, we utilize the gold-standard in advanced diagnostic tools — including non-contact tonometry, High-Definition Optical Coherence Tomography (OCT), and precision visual field analyzers — to detect these subtle conditions at their earliest microscopic stages. Early proactive diagnosis is the definitive key to preserving your vision permanently.",
      benefits: [
        "Non-contact and Goldmann applanation tonometry for pressure",
        "High-Def Optical Coherence Tomography (OCT) retinal scanning",
        "Slit-lamp biomicroscopy for microscopic anterior examination",
        "Computerized visual field testing for precise peripheral charting",
        "Detailed Cataract opacity grading and top-tier surgical co-management",
        "Long-term ongoing monitoring, medication management, and tracking",
      ],
      whoFor:
        "Crucial for adults over 40, individuals of African descent, people with a family history of glaucoma/cataracts, diabetic patients, and persons with high myopia or systemic hypertension.",
      pricing: "Starting from ₦12,000",
    },
  ];

  const specializedServices = [
    {
      icon: Monitor,
      title: "Digital Eye Strain Therapy",
      description:
        "Targeted treatments and lens technologies for professional computer users suffering from dry eyes, headaches, blurred vision, and neck pain due to prolonged screen exposure.",
    },
    {
      icon: Stethoscope,
      title: "Diabetic Retinopathy Check",
      description:
        "A highly detailed dilated retinal examination specifically protocolled for diabetic patients to detect microscopic vascular changes, hemorrhages, and macular edema early.",
    },
    {
      icon: Shield,
      title: "24/7 Emergency Eye Care",
      description:
        "Immediate, high-priority clinical attention for chemical splashes, foreign body removal, painful red eyes, sudden vision loss, and acute ocular trauma.",
    },
    {
      icon: Microscope,
      title: "Advanced Dry Eye Clinic",
      description:
        "Comprehensive tear film analysis to diagnose evaporative or aqueous-deficient dry eye, followed by tailored treatments like punctual plugs, prescribed drops, and warm compress therapy.",
    },
    {
      icon: Search,
      title: "Surgical Co-management",
      description:
        "Pre-operative evaluations and comprehensive post-operative care monitoring for LASIK, cataract removal, and other major refractive eye surgeries in partnership with top surgeons.",
    },
    {
      icon: HeartPulse,
      title: "Low Vision Rehabilitation",
      description:
        "Compassionate, specialized optics support for patients with significantly reduced vision from conditions like macular degeneration, utilizing magnifying aids and adaptive environmental techniques.",
    },
    {
      icon: Eye,
      title: "Color Vision Testing",
      description:
        "Specialized assessments using the Ishihara and Farnsworth Munsell protocols to correctly diagnosing varying degrees of color blindness for occupational or educational demands.",
    },
    {
      icon: Zap,
      title: "Orthokeratology (Ortho-K)",
      description:
        "A revolutionary non-surgical procedure involving custom-designed overnight contact lenses that gently reshape the cornea, allowing for perfectly clear, glasses-free vision during the day.",
    },
  ];

  const techFeatures = [
    {
      title: "Optical Coherence Tomography (OCT)",
      description: "Provides microscopic cross-sectional images of the retina to detect glaucoma and macular degeneration years before symptoms appear."
    },
    {
      title: "Digital Retinal Imaging",
      description: "Captures a high-resolution, wide-field map of your inner eye, creating a permanent baseline record for precise year-over-year comparison."
    },
    {
      title: "Computerized Visual Field Analyzers",
      description: "Maps your complete central and peripheral vision to accurately pinpoint blind spots originating from neurological or ocular diseases."
    },
    {
      title: "Auto-Refractors & Keratometers",
      description: "Uses advanced computerized light sensors to quickly and painlessly determine the baseline curve and prescription your eyes need."
    }
  ];

  const processSteps = [
    {
      step: "01",
      title: "Easy Appointment Scheduling",
      description:
        "Schedule your comprehensive visit online through our portal, via WhatsApp, or directly by calling our friendly front desk team.",
    },
    {
      step: "02",
      title: "High-Tech Diagnostics",
      description:
        "Our skilled technicians and optometrists will conduct a battery of tests using state-of-the-art, painless diagnostic imaging equipment.",
    },
    {
      step: "03",
      title: "Consultation & Strategy",
      description:
        "Sit down with your doctor for a clear, jargon-free explanation of your results and a tailored, long-term visual health strategy.",
    },
    {
      step: "04",
      title: "Curation & Aftercare",
      description:
        "Select your perfect eyewear from our boutique, or start your targeted treatment plan, backed by our robust ongoing patient support.",
    },
  ];

  return (
    <Layout>
      <FloatingCTA />

      {/* Hero Section */}
      <section className="relative py-32 overflow-hidden bg-black">
        <div className="absolute inset-0 z-0">
          <img
            src={heroClinicWide}
            alt="Satome Eye Clinic Superior Services"
            className="w-full h-full object-cover opacity-50"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/30"></div>
        </div>

        <div className="container mx-auto px-4 lg:px-6 relative z-10 flex flex-col items-start text-left max-w-7xl">
          <Badge className="mb-6 bg-primary/20 text-primary uppercase tracking-widest border-primary/30 backdrop-blur-sm py-2 px-4 shadow-lg">
            <Sparkles className="w-4 h-4 mr-2" />
            Uncompromising Eye Care
          </Badge>
          <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-6 leading-tight max-w-3xl">
            Precision Vision <br className="hidden md:block"/>
            <span className="text-primary tracking-tight">Excellence</span>
          </h1>
          <p className="text-lg md:text-xl text-white/80 leading-relaxed max-w-2xl mb-10 drop-shadow-lg">
            Elevate your sight with Satome Eye Clinic. From routine comprehensive evaluations to advanced microscopic diagnostics and luxury bespoke eyewear, we deliver an incredibly holistic approach tailored to your exact visual and lifestyle needs.
          </p>
          <div className="flex flex-wrap gap-4">
            <Button
              asChild
              size="lg"
              className="shadow-[0_0_30px_-5px_hsl(var(--primary))] text-base h-14 px-8"
            >
              <Link to="/book">
                Book a Consultation
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="bg-white/5 backdrop-blur-md text-white border-white/20 hover:bg-white/10 hover:text-white text-base h-14 px-8"
            >
              <a href="#primary-services">View Our Treatments</a>
            </Button>
          </div>
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="py-10 bg-gradient-to-b from-card to-background border-b border-border/40">
        <div className="container mx-auto px-4 lg:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {[
              { icon: Eye, value: "Comprehensive", label: "Diagnostic Testing" },
              { icon: Users, value: "10,000+", label: "Happy Eyes Protected" },
              { icon: Monitor, value: "State-of-the-Art", label: "Medical Technology" },
              { icon: Award, value: "Certified", label: "Optical Specialists" },
            ].map((stat, i) => (
              <div
                key={i}
                className="flex flex-col items-center text-center gap-3 group"
              >
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:bg-primary transition-all duration-300">
                  <stat.icon className="w-7 h-7 text-primary group-hover:text-primary-foreground transition-colors" />
                </div>
                <div>
                  <div className="text-xl font-bold text-foreground mb-1">
                    {stat.value}
                  </div>
                  <div className="text-sm text-muted-foreground font-medium">
                    {stat.label}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Primary Services Detail */}
      <section className="py-24 bg-background" id="primary-services">
        <div className="container mx-auto px-4 lg:px-6">
          <div className="text-center mb-20 max-w-3xl mx-auto">
            <Badge className="mb-4 bg-primary/10 text-primary border-0 text-sm px-4 py-1.5 font-semibold uppercase tracking-wider">
              Primary Treatments
            </Badge>
            <h2 className="text-4xl md:text-5xl font-extrabold mb-6 tracking-tight text-foreground">
              Mastering the Science of <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary-dark">Sight</span>
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              We leave no stone unturned in preserving and enhancing your vision. Explore our core foundational clinics engineered for absolute clarity.
            </p>
          </div>

          <div className="space-y-24 max-w-7xl mx-auto">
            {services.map((service, index) => {
              const Icon = service.icon;
              const isEven = index % 2 === 0;

              return (
                <div key={service.id} id={service.id} className="scroll-mt-32">
                  <Card className="border-0 shadow-none bg-transparent overflow-hidden group">
                    <CardContent className="p-0">
                      <div className={`grid grid-cols-1 lg:grid-cols-12 gap-10 items-center`}>
                        <div className={`lg:col-span-5 relative rounded-3xl overflow-hidden shadow-2xl ${!isEven ? "lg:order-2" : "lg:order-1"}`}>
                          <img
                            src={service.image}
                            alt={service.title}
                            className="w-full h-full object-cover min-h-[500px] transition-transform duration-1000 hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-gradient-to-tr from-black/80 via-black/20 to-transparent"></div>
                          <div className="absolute bottom-8 left-8 right-8">
                            <Badge className="bg-primary/90 text-primary-foreground backdrop-blur-md border border-white/20 shadow-xl text-sm mb-4 px-4 py-1.5">
                              {service.tagline}
                            </Badge>
                            {service.pricing && (
                              <div className="text-white/90 font-medium tracking-wide flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                                {service.pricing}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className={`lg:col-span-7 flex flex-col justify-center ${!isEven ? "lg:order-1 lg:pr-10" : "lg:pl-10"}`}>
                          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-6 group-hover:bg-primary transition-all duration-300">
                            <Icon className="h-8 w-8 text-primary group-hover:text-primary-foreground transition-colors" />
                          </div>

                          <h2 className="text-3xl md:text-5xl font-extrabold text-foreground mb-6 tracking-tight">
                            {service.title}
                          </h2>

                          <p className="text-muted-foreground mb-8 leading-relaxed text-lg">
                            {service.description}
                          </p>

                          <div className="mb-10 p-8 bg-card rounded-3xl border border-border shadow-sm">
                            <h3 className="font-bold text-foreground mb-6 text-xl flex items-center gap-3">
                              <Star className="h-6 w-6 text-primary fill-primary/20" />
                              Clinical Inclusions:
                            </h3>
                            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6">
                              {service.benefits.map((benefit, idx) => (
                                <li
                                  key={idx}
                                  className="flex items-start gap-3 group/item"
                                >
                                  <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0" />
                                  <span className="text-base text-foreground/80 font-medium leading-tight">
                                    {benefit}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          <div className="mb-10">
                            <h3 className="font-bold text-foreground mb-3 text-base uppercase tracking-widest flex items-center gap-2">
                              <Users className="h-5 w-5 text-primary" />
                              Target Demographic
                            </h3>
                            <p className="text-muted-foreground leading-relaxed text-base border-l-4 border-primary/30 pl-4 py-1">
                              {service.whoFor}
                            </p>
                          </div>

                          <div className="flex gap-4">
                            <Button asChild size="lg" className="shadow-xl h-14 px-8 text-base">
                              <Link to={`/book?service=${service.title.split(' ')[0]}`}>
                                Schedule an Evaluation
                                <ArrowRight className="ml-2 h-5 w-5" />
                              </Link>
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Advanced Technology Section */}
      <section className="py-24 bg-card border-y border-border/50 relative overflow-hidden">
        <div className="container mx-auto px-4 lg:px-6 relative z-10">
          <div className="flex flex-col lg:flex-row gap-16 items-center max-w-7xl mx-auto">
            <div className="lg:w-1/2">
              <Badge className="mb-4 bg-primary/10 text-primary border-0 text-sm px-4 py-1.5 uppercase font-semibold">
                Clinical Excellence
              </Badge>
              <h2 className="text-4xl md:text-5xl font-extrabold mb-6 tracking-tight text-foreground">
                Powered by <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary-light">Advanced Technology</span>
              </h2>
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                We believe that proper diagnosis cannot rely on guesswork. Our clinic is equipped with cutting-edge ophthalmic instrumentation to accurately analyze the microscopic anatomy of your eye, ensuring precise prescriptions and early detection of diseases.
              </p>
              <div className="grid gap-6">
                {techFeatures.map((tech, idx) => (
                  <div key={idx} className="flex gap-4 items-start">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                      <Monitor className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-foreground mb-1">{tech.title}</h4>
                      <p className="text-muted-foreground text-sm leading-relaxed">{tech.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="lg:w-1/2 w-full mt-10 lg:mt-0 relative">
              <div className="absolute inset-0 bg-primary/5 rounded-[3rem] transform rotate-3 scale-105"></div>
              <img 
                src={serviceScreening} 
                alt="Eye Diagnostic Technology" 
                className="rounded-[3rem] shadow-2xl relative z-10 border border-border max-h-[600px] w-full object-cover" 
              />
            </div>
          </div>
        </div>
      </section>

      {/* Specialized Services Sub-Grid */}
      <section className="py-24 bg-background relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary rounded-full blur-[100px] opacity-10"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-primary-light rounded-full blur-[100px] opacity-10"></div>

        <div className="container mx-auto px-4 lg:px-6 relative z-10 text-center">
          <div className="mb-16 max-w-3xl mx-auto">
            <Badge className="mb-4 bg-secondary/10 text-secondary-dark border-0 text-sm px-4 py-1.5 font-semibold uppercase tracking-wider">
              Niche Interventions
            </Badge>
            <h2 className="text-4xl md:text-5xl font-extrabold mb-6 tracking-tight">
              Specialized Sub-Clinics
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Targeted treatments designed to resolve specific visual discomforts, manage chronic ocular diseases, and handle acute medical emergencies.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto text-left">
            {specializedServices.map((service, index) => {
              const Icon = service.icon;
              return (
                <Card
                  key={index}
                  className="border border-border/60 hover:border-primary/50 transition-all duration-500 hover:shadow-2xl bg-card/50 backdrop-blur-sm group hover:-translate-y-2"
                >
                  <CardContent className="p-8">
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-background border border-border shadow-sm mb-6 group-hover:scale-110 group-hover:bg-primary group-hover:border-primary transition-all duration-300">
                      <Icon className="h-7 w-7 text-primary group-hover:text-primary-foreground transition-colors" />
                    </div>
                    <h3 className="text-xl font-bold text-foreground mb-4 leading-tight group-hover:text-primary transition-colors">
                      {service.title}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed text-sm">
                      {service.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 bg-card border-t border-border/50 relative">
        <div className="container mx-auto px-4 lg:px-6">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight">
              A Seamless Patient <span className="text-primary">Journey</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              We highly value your time. Our streamlined process ensures minimal wait times and maximized consultative attention.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {processSteps.map((item, index) => (
              <div key={index} className="relative group">
                {index < processSteps.length - 1 && (
                  <div className="hidden lg:block absolute top-[4.5rem] left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-primary/30 to-transparent z-0"></div>
                )}
                <div className="bg-background border border-border rounded-3xl p-10 text-center relative z-10 transition-all duration-300 hover:shadow-xl hover:-translate-y-2 h-full flex flex-col items-center">
                  <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center text-2xl font-black text-primary mb-8 border-4 border-background shadow-md">
                    {item.step}
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-4 group-hover:text-primary transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed text-sm">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-primary relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white to-transparent"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl mix-blend-overlay"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-black/10 rounded-full blur-3xl mix-blend-overlay"></div>

        <div className="container mx-auto px-4 lg:px-6 text-center relative z-10">
          <h2 className="text-4xl md:text-6xl font-extrabold text-primary-foreground mb-8 tracking-tight max-w-4xl mx-auto leading-tight">
            Stop Guessing with Your Eye Health. Get Exceptional Diagnostics Today.
          </h2>
          <p className="text-xl text-primary-foreground/90 mb-12 max-w-2xl mx-auto leading-relaxed font-medium">
            Join the thousands of clear-sighted individuals who trust Satome Eye Clinic for world-class, uncompromising visual care.
          </p>
          <div className="flex flex-col sm:flex-row gap-5 justify-center">
            <Button
              asChild
              size="lg"
              variant="secondary"
              className="text-lg h-16 px-10 shadow-2xl text-primary font-bold hover:scale-105 transition-transform"
            >
              <Link to="/book">
                Book Your Professional Exam
                <ArrowRight className="ml-2 h-6 w-6" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="bg-transparent text-primary-foreground border-primary-foreground/40 hover:bg-white/10 text-lg h-16 px-10 font-bold"
            >
              <Link to="/contact">Contact Support</Link>
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Services;

