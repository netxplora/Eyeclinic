import Layout from "@/components/Layout";
import FloatingCTA from "@/components/FloatingCTA";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  Eye,
  Heart,
  Target,
  Users,
  Award,
  Clock,
  Star,
  Shield,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Stethoscope,
  GraduationCap,
} from "lucide-react";
import teamOptometrist from "@/assets/satome/team-optometrist.png";
import clinicInterior from "@/assets/satome/clinic-interior.png";

const About = () => {
  const values = [
    {
      icon: Eye,
      title: "Excellence",
      description:
        "We pursue the highest standard of care with cutting-edge technology and continuous professional development, ensuring every patient receives world-class treatment.",
    },
    {
      icon: Heart,
      title: "Compassion",
      description:
        "Every patient is treated with genuine kindness, empathy, and respect. We listen, we understand, and we tailor our approach to each individual's needs.",
    },
    {
      icon: Target,
      title: "Precision",
      description:
        "Our advanced diagnostic equipment and meticulous clinical protocols ensure accurate diagnoses and effective treatment plans — leaving nothing to chance.",
    },
    {
      icon: Users,
      title: "Community",
      description:
        "As a proud Benin City institution, we are deeply committed to improving the eye health of our community through accessible, affordable quality care.",
    },
    {
      icon: Shield,
      title: "Integrity",
      description:
        "We believe in honest, transparent communication. We'll always give you straightforward advice and never recommend treatments you don't need.",
    },
    {
      icon: GraduationCap,
      title: "Education",
      description:
        "We empower our patients with knowledge about their eye health, prevention strategies, and treatment options so they can make informed decisions.",
    },
  ];

  const milestones = [
    {
      year: "2009",
      title: "Clinic Founded",
      description:
        "Satome Eye Clinic opened its doors on West Circular Road, Benin City, with a vision to make quality eye care accessible to everyone.",
    },
    {
      year: "2013",
      title: "Equipment Upgrade",
      description:
        "Major investment in state-of-the-art diagnostic equipment including digital retinal imaging and automated refraction systems.",
    },
    {
      year: "2017",
      title: "Optical Boutique Launch",
      description:
        "Expanded our facility to include a premium optical boutique with over 500 designer frames and advanced lens solutions.",
    },
    {
      year: "2020",
      title: "Pediatric Wing Opening",
      description:
        "Launched our dedicated pediatric eye care unit, creating a child-friendly environment for young patients.",
    },
    {
      year: "2024",
      title: "5,000th Patient Milestone",
      description:
        "Celebrated serving over 5,000 patients, with a community outreach programme reaching schools across Edo State.",
    },
  ];

  const team = [
    {
      name: "Dr. Emeka Satome",
      role: "Medical Director & Lead Optometrist",
      qualifications: "OD, MPH, FNOA",
      bio: "With over 15 years of experience in clinical optometry, Dr. Satome is a Fellow of the Nigerian Optometric Association and holds a Master's in Public Health. He specializes in comprehensive eye care, glaucoma management, and community eye health. His passion for accessible vision care led him to establish Satome Eye Clinic with the goal of bringing international-standard eye care services to Benin City.",
      image: teamOptometrist,
    },
  ];

  const stats = [
    { value: "15+", label: "Years of Excellence" },
    { value: "5,000+", label: "Happy Patients" },
    { value: "500+", label: "Frame Styles" },
    { value: "4.9★", label: "Patient Rating" },
  ];

  return (
    <Layout>
      <FloatingCTA />

      {/* Hero Section */}
      <section className="relative py-32 overflow-hidden bg-black">
        <div className="absolute inset-0 z-0">
          <img
            src={clinicInterior}
            alt="Satome Eye Clinic Interior"
            className="w-full h-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-black/50"></div>
        </div>

        <div className="container mx-auto px-4 lg:px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-6 bg-background/20 text-primary-foreground border-primary-foreground/30 backdrop-blur-sm">
              <Sparkles className="w-4 h-4 mr-2" />
              About Us
            </Badge>
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
              About Satome
              <br />
              <span className="text-primary">Eye Clinic</span>
            </h1>
            <p className="text-xl text-white/90 leading-relaxed max-w-3xl mx-auto drop-shadow-md">
              For over 15 years, we've been Benin City's trusted partner in
              vision health — dedicated to providing exceptional eye care with
              professionalism, compassion, and the latest in diagnostic
              technology.
            </p>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="py-8 bg-card border-b border-border/50">
        <div className="container mx-auto px-4 lg:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {stats.map((stat, i) => (
              <div key={i} className="text-center group border-r border-border last:border-0 md:px-4">
                <div className="text-4xl font-black text-primary group-hover:scale-110 transition-transform duration-500 inline-block drop-shadow-sm">
                  {stat.value}
                </div>
                <div className="text-[11px] text-muted-foreground font-bold uppercase tracking-[0.1em] mt-1">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-24">
        <div className="container mx-auto px-4 lg:px-6">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-primary/10 text-primary border-primary">
              Our Purpose
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Mission &{" "}
              <span className="text-primary">
                Vision
              </span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <Card className="border-2 hover:border-primary transition-all duration-500 hover:shadow-2xl group hover:scale-[1.02] bg-card/50 backdrop-blur-sm">
              <CardContent className="p-10">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-[2rem] bg-primary mb-8 shadow-2xl group-hover:rotate-6 transition-all duration-500">
                  <Target className="h-10 w-10 text-primary-foreground" />
                </div>
                <h2 className="text-3xl font-bold text-foreground mb-4 group-hover:text-primary transition-colors">
                  Our Mission
                </h2>
                <p className="text-muted-foreground leading-relaxed text-base">
                  To provide comprehensive, high-quality, and affordable eye
                  care services that enhance the vision and quality of life for
                  every member of our community. We are committed to using the
                  latest technology and evidence-based practices while
                  maintaining a personal, patient-centered approach that treats
                  every individual with dignity and respect.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-primary transition-all duration-500 hover:shadow-2xl group hover:scale-[1.02] bg-card/50 backdrop-blur-sm">
              <CardContent className="p-10">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-[2rem] bg-accent mb-8 shadow-2xl group-hover:-rotate-6 transition-all duration-500">
                  <Eye className="h-10 w-10 text-accent-foreground" />
                </div>
                <h2 className="text-3xl font-bold text-foreground mb-4 group-hover:text-primary transition-colors">
                  Our Vision
                </h2>
                <p className="text-muted-foreground leading-relaxed text-base">
                  To be the most trusted and respected eye care provider in
                  Benin City and Edo State — known for our clinical excellence,
                  advanced technology, community impact, and unwavering
                  commitment to improving vision health across all age groups. We
                  envision a future where no one in our community suffers from
                  preventable vision loss.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Our Story + Image */}
      <section className="py-24 bg-card relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl opacity-10"></div>

        <div className="container mx-auto px-4 lg:px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center max-w-7xl mx-auto">
            <div>
              <Badge className="mb-4 bg-primary/10 text-primary border-primary">
                Our Story
              </Badge>
              <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
                A Legacy of{" "}
                <span className="text-primary">
                  Vision Care
                </span>
              </h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  Satome Eye Clinic was founded in 2009 with a simple yet
                  powerful purpose: to bring world-class eye care services to
                  the heart of Benin City. At a time when many residents had to
                  travel long distances for quality vision care, our founder Dr.
                  Emeka Satome saw an opportunity to bridge that gap right here
                  in our community.
                </p>
                <p>
                  What began as a modest practice on West Circular Road has
                  grown into one of Edo State's most comprehensive eye care
                  centres. Over the years, we have invested heavily in
                  state-of-the-art diagnostic equipment, expanded our team of
                  trained professionals, and built a warm, welcoming facility
                  where patients of all ages feel comfortable and cared for.
                </p>
                <p>
                  Today, with over 5,000 satisfied patients and counting, we
                  remain committed to our founding principles of excellence,
                  compassion, and accessibility. We continue to expand our
                  services, invest in new technologies, and engage with our
                  community through school vision screening programmes and
                  public eye health awareness campaigns across Edo State.
                </p>
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-primary/10 rounded-3xl blur-2xl opacity-20"></div>
              <Card className="relative border-2 overflow-hidden shadow-2xl">
                <CardContent className="p-0">
                  <img
                    src={clinicInterior}
                    alt="Interior of Satome Eye Clinic"
                    className="w-full h-[500px] object-cover"
                  />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Timeline / Milestones */}
      <section className="py-24">
        <div className="container mx-auto px-4 lg:px-6">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-primary/10 text-primary border-primary">
              Our Journey
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Key{" "}
              <span className="text-primary">
                Milestones
              </span>
            </h2>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="space-y-8">
              {milestones.map((milestone, index) => (
                <Card
                  key={index}
                  className="border-2 hover:border-primary transition-all duration-500 hover:shadow-2xl group hover:translate-x-2 bg-card/50 backdrop-blur-sm"
                >
                  <CardContent className="p-8 lg:p-10">
                    <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
                      <div className="text-5xl font-black text-primary/20 group-hover:text-primary transition-colors duration-500 leading-none tracking-tighter w-24 text-center md:text-left">
                        {milestone.year}
                      </div>
                      <div className="flex-grow text-center md:text-left">
                        <h3 className="text-2xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors">
                          {milestone.title}
                        </h3>
                        <p className="text-muted-foreground leading-relaxed text-base">
                          {milestone.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-24 bg-card relative overflow-hidden">
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-accent/5 rounded-full blur-3xl opacity-10"></div>

        <div className="container mx-auto px-4 lg:px-6 relative z-10">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-primary/10 text-primary border-primary">
              What We Stand For
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Our Core{" "}
              <span className="text-primary">
                Values
              </span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              These principles guide every interaction, every diagnosis, and
              every treatment decision we make.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <Card
                  key={index}
                  className="border-2 hover:border-primary transition-all duration-300 hover:shadow-2xl group"
                >
                  <CardContent className="p-8">
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary mb-5 shadow-lg group-hover:scale-110 transition-transform">
                      <Icon className="h-7 w-7 text-primary-foreground" />
                    </div>
                    <h3 className="text-xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors">
                      {value.title}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed text-sm">
                      {value.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Meet the Team */}
      <section className="py-24 relative overflow-hidden">
        <div className="container mx-auto px-4 lg:px-6">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-primary/10 text-primary border-primary">
              Our People
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Meet Our{" "}
              <span className="text-primary">
                Team
              </span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Led by experienced professionals who are passionate about eye
              health and committed to your well-being.
            </p>
          </div>

          <div className="max-w-5xl mx-auto">
            {team.map((member, index) => (
              <Card
                key={index}
                className="border-2 hover:border-primary transition-all duration-300 overflow-hidden shadow-2xl group"
              >
                <CardContent className="p-0">
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-0">
                    <div className="md:col-span-2 overflow-hidden">
                      <img
                        src={member.image}
                        alt={member.name}
                        className="w-full h-full object-cover min-h-[400px] transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                    <div className="md:col-span-3 p-8 lg:p-12 flex flex-col justify-center">
                      <Badge className="mb-4 bg-primary/10 text-primary border-primary self-start">
                        <Stethoscope className="w-3 h-3 mr-1.5" />
                        {member.role}
                      </Badge>
                      <h3 className="text-3xl font-bold text-foreground mb-2">
                        {member.name}
                      </h3>
                      <p className="text-primary font-semibold mb-6 flex items-center gap-2">
                        <GraduationCap className="w-4 h-4" />
                        {member.qualifications}
                      </p>
                      <p className="text-muted-foreground leading-relaxed mb-6">
                        {member.bio}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {[
                          "Comprehensive Eye Care",
                          "Glaucoma Management",
                          "Community Eye Health",
                          "Pediatric Optometry",
                        ].map((spec) => (
                          <Badge
                            key={spec}
                            variant="outline"
                            className="text-xs"
                          >
                            {spec}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="max-w-3xl mx-auto mt-12">
            <Card className="border-2 bg-card">
              <CardContent className="p-8 text-center">
                <h3 className="text-xl font-bold text-foreground mb-3">
                  Our Support Team
                </h3>
                <p className="text-muted-foreground leading-relaxed mb-6">
                  Behind every great clinic is an exceptional team. Our
                  dedicated optical dispensers, patient care coordinators, and
                  administrative staff work together to ensure your visit is
                  seamless from the moment you walk in. They are here to assist
                  with scheduling, insurance queries, frame selection, and any
                  questions you may have.
                </p>
                <Button asChild>
                  <Link to="/contact">
                    Get in Touch
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-primary relative overflow-hidden">
        <div className="absolute top-10 right-10 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-pulse"></div>

        <div className="container mx-auto px-4 lg:px-6 text-center relative z-10">
          <Badge className="mb-6 bg-white/10 text-white border-white/20">
            <Sparkles className="w-4 h-4 mr-2" />
            Join Our Family
          </Badge>
          <h2 className="text-4xl md:text-6xl font-bold text-primary-foreground mb-6">
            Experience the Satome
            <br />
            Difference
          </h2>
          <p className="text-xl text-primary-foreground/90 mb-10 max-w-2xl mx-auto leading-relaxed">
            Schedule your visit today and discover why thousands of families in
            Benin City trust Satome Eye Clinic with their vision.
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
              className="bg-primary text-primary-foreground border-primary-foreground/30 hover:bg-primary/90 text-base shadow-2xl"
            >
              <Link to="/services">Explore Our Services</Link>
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default About;