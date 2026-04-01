import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Mail, Send, Loader2, Users, FileText } from 'lucide-react';
import { toast } from 'sonner';

interface Booking {
  id: string;
  patient_name: string;
  patient_email: string;
  service_type: string;
  appointment_date: string;
  appointment_time: string;
  status: string;
}

const emailTemplates = [
  {
    id: 'appointment_reminder',
    name: 'Appointment Reminder',
    subject: 'Reminder: Your Upcoming Appointment at Satome Eye Clinic',
    message: `This is a friendly reminder about your upcoming appointment at Satome Eye Clinic.

Please arrive 10-15 minutes early to complete any necessary paperwork. If you need to reschedule or cancel, please contact us at least 24 hours in advance.

What to bring:
• Valid ID
• Insurance information (if applicable)
• Current glasses or contact lenses
• List of current medications

We look forward to seeing you soon!`
  },
  {
    id: 'appointment_confirmation',
    name: 'Appointment Confirmation',
    subject: 'Your Appointment is Confirmed - Satome Eye Clinic',
    message: `Great news! Your appointment at Satome Eye Clinic has been confirmed.

We're excited to help you with your eye care needs. Please remember to:
• Arrive 10-15 minutes early
• Bring your current glasses/contacts if applicable
• Have your insurance information ready

If you have any questions before your visit, don't hesitate to reach out.

See you soon!`
  },
  {
    id: 'follow_up',
    name: 'Follow-up Care',
    subject: 'Follow-up: How Are Your Eyes Feeling?',
    message: `We hope you're doing well after your recent visit to Satome Eye Clinic!

We wanted to check in and see how you're adjusting to your new prescription or treatment. Your eye health is our priority, and we're here to help if you have any questions or concerns.

If you're experiencing any issues or would like to schedule a follow-up appointment, please don't hesitate to contact us.

Wishing you clear vision and good health!`
  },
  {
    id: 'prescription_ready',
    name: 'Prescription Ready',
    subject: 'Your Prescription is Ready - Satome Eye Clinic',
    message: `Good news! Your prescription glasses/contact lenses are ready for pickup at Satome Eye Clinic.

Please visit us during our opening hours:
• Monday - Friday: 8:00 AM - 6:00 PM
• Saturday: 9:00 AM - 2:00 PM

Don't forget to bring a valid ID when picking up your order.

We look forward to seeing you!`
  },
  {
    id: 'special_offer',
    name: 'Special Offer',
    subject: 'Exclusive Offer for Our Valued Patients - Satome Eye Clinic',
    message: `As a valued patient of Satome Eye Clinic, we'd like to extend a special offer to you!

We're currently running exclusive promotions on:
• Comprehensive eye examinations
• Designer eyeglass frames
• Contact lens packages

Visit us or call to learn more about these limited-time offers. We appreciate your trust in us for your eye care needs!

Best regards,
The Satome Eye Clinic Team`
  },
  {
    id: 'custom',
    name: 'Custom Message',
    subject: '',
    message: ''
  }
];

const EmailPatients = () => {
  const { isStaff, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<string>('');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [customEmail, setCustomEmail] = useState('');
  const [customName, setCustomName] = useState('');
  const [sending, setSending] = useState(false);
  const [useCustomRecipient, setUseCustomRecipient] = useState(false);

  useEffect(() => {
    if (isStaff) {
      fetchBookings();
    }
  }, [isStaff]);

  const fetchBookings = async () => {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('id, patient_name, patient_email, service_type, appointment_date, appointment_time, status')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBookings(data || []);
    } catch (error) {
      toast.error('Failed to load bookings');
    } finally {
      setLoadingBookings(false);
    }
  };

  const handleTemplateChange = (templateId: string) => {
    setSelectedTemplate(templateId);
    const template = emailTemplates.find(t => t.id === templateId);
    if (template) {
      setSubject(template.subject);
      setMessage(template.message);
    }
  };

  const handleBookingChange = (bookingId: string) => {
    setSelectedBooking(bookingId);
    if (bookingId === 'custom') {
      setUseCustomRecipient(true);
    } else {
      setUseCustomRecipient(false);
      const booking = bookings.find(b => b.id === bookingId);
      if (booking) {
        setCustomEmail(booking.patient_email);
        setCustomName(booking.patient_name);
      }
    }
  };

  const handleSendEmail = async () => {
    const recipientEmail = useCustomRecipient ? customEmail : bookings.find(b => b.id === selectedBooking)?.patient_email;
    const recipientName = useCustomRecipient ? customName : bookings.find(b => b.id === selectedBooking)?.patient_name;

    if (!recipientEmail || !recipientName) {
      toast.error('Please select a recipient or enter custom details');
      return;
    }

    if (!subject.trim()) {
      toast.error('Please enter a subject');
      return;
    }

    if (!message.trim()) {
      toast.error('Please enter a message');
      return;
    }

    setSending(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-patient-email', {
        body: {
          recipientEmail,
          recipientName,
          subject,
          message,
          templateType: selectedTemplate,
          bookingId: useCustomRecipient ? undefined : selectedBooking
        }
      });

      if (error) throw error;

      toast.success('Email sent successfully!');
      // Reset form
      setSelectedBooking('');
      setSelectedTemplate('');
      setSubject('');
      setMessage('');
      setCustomEmail('');
      setCustomName('');
      setUseCustomRecipient(false);
    } catch (error: any) {
      console.error('Error sending email:', error);
      toast.error(error.message || 'Failed to send email');
    } finally {
      setSending(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate('/admin/dashboard')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Send Email to Patients</h1>
              <p className="text-sm text-muted-foreground">Communicate with your patients directly</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="grid gap-6">
          {/* Recipient Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Select Recipient
              </CardTitle>
              <CardDescription>
                Choose a patient from existing bookings or enter a custom recipient
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="booking">Patient (from bookings)</Label>
                <Select value={selectedBooking} onValueChange={handleBookingChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a patient..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="custom">Enter custom recipient</SelectItem>
                    {bookings.map((booking) => (
                      <SelectItem key={booking.id} value={booking.id}>
                        {booking.patient_name} - {booking.patient_email} ({booking.service_type})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {useCustomRecipient && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                  <div className="space-y-2">
                    <Label htmlFor="customName">Recipient Name</Label>
                    <Input
                      id="customName"
                      value={customName}
                      onChange={(e) => setCustomName(e.target.value)}
                      placeholder="Enter recipient name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="customEmail">Recipient Email</Label>
                    <Input
                      id="customEmail"
                      type="email"
                      value={customEmail}
                      onChange={(e) => setCustomEmail(e.target.value)}
                      placeholder="Enter recipient email"
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Template Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Message Template
              </CardTitle>
              <CardDescription>
                Select a pre-built template or create a custom message
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="template">Email Template</Label>
                <Select value={selectedTemplate} onValueChange={handleTemplateChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a template..." />
                  </SelectTrigger>
                  <SelectContent>
                    {emailTemplates.map((template) => (
                      <SelectItem key={template.id} value={template.id}>
                        {template.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Email Composition */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="w-5 h-5" />
                Compose Email
              </CardTitle>
              <CardDescription>
                Customize the subject and message content
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Enter email subject"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Enter your message..."
                  rows={12}
                  className="resize-none"
                />
              </div>

              <Button
                onClick={handleSendEmail}
                disabled={sending || !subject.trim() || !message.trim()}
                className="w-full"
                size="lg"
              >
                {sending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Send Email
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Preview Card */}
          {(subject || message) && (
            <Card>
              <CardHeader>
                <CardTitle>Email Preview</CardTitle>
                <CardDescription>
                  How your email will appear to the recipient
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-lg border bg-muted/30 p-6">
                  <div className="border-b pb-4 mb-4">
                    <p className="text-sm text-muted-foreground">Subject:</p>
                    <p className="font-semibold">{subject || '(No subject)'}</p>
                  </div>
                  <div className="prose prose-sm max-w-none">
                    <p className="text-muted-foreground mb-4">
                      Dear <strong>{useCustomRecipient ? customName || '[Recipient Name]' : bookings.find(b => b.id === selectedBooking)?.patient_name || '[Recipient Name]'}</strong>,
                    </p>
                    <div className="whitespace-pre-wrap text-foreground">
                      {message || '(No message)'}
                    </div>
                    <div className="mt-6 pt-4 border-t text-muted-foreground">
                      <p className="mb-1">Best regards,</p>
                      <p className="font-semibold text-primary">The Satome Eye Clinic Team</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
};

export default EmailPatients;
