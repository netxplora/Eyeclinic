import { useState, useRef, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, FileType, Trash2, File, Eye } from 'lucide-react';
import { toast } from 'sonner';

export const MedicalRecordUpload = ({ appointmentId, patientId, doctorId, disabled }: { appointmentId: string, patientId: string, doctorId: string, disabled?: boolean }) => {
  const [documents, setDocuments] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [uploadData, setUploadData] = useState({
    title: '',
    type: 'Test Result'
  });

  useEffect(() => {
    fetchDocuments();
  }, [appointmentId]);

  const fetchDocuments = async () => {
    try {
      const { data, error } = await supabase
        .from('medical_records' as any)
        .select('*')
        .eq('appointment_id', appointmentId)
        .not('file_url', 'is', null);

      if (error && error.code !== 'PGRST116') throw error;
      setDocuments(data || []);
    } catch (err) {
      console.error("Failed to load documents", err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!uploadData.title) {
        toast.error("Please provide a title for the document first.");
        return;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
      const filePath = `${patientId}/${fileName}`;

      // Upload file to Supabase Storage
      const { data: uploadResult, error: uploadError } = await supabase.storage
        .from('medical_documents')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const fileUrl = uploadResult.path;

      // Create record in medical_records
      const { error: dbError } = await supabase
        .from('medical_records' as any)
        .insert({
          appointment_id: appointmentId,
          patient_id: patientId,
          doctor_id: doctorId,
          record_title: uploadData.title,
          record_type: uploadData.type,
          file_url: fileUrl,
          file_name: file.name,
          file_type: file.type,
          file_size: file.size
        });

      if (dbError) throw dbError;

      toast.success('Medical document uploaded successfully');
      setUploadData({ title: '', type: 'Test Result' });
      if (fileInputRef.current) fileInputRef.current.value = '';
      fetchDocuments();
      
      // Log activity
      await supabase.from('activity_logs').insert({
        booking_id: appointmentId,
        staff_id: (await supabase.auth.getUser()).data.user?.id,
        action_type: 'document_uploaded',
        notes: `Uploaded document: ${uploadData.title} (${uploadData.type})`
      });

    } catch (err: any) {
      console.error("Upload error", err);
      toast.error('Failed to upload document');
    } finally {
       setUploading(false);
    }
  };

  const handleDelete = async (docId: string, fileUrl: string) => {
    if (!confirm('Are you sure you want to delete this document?')) return;
    
    try {
        // Delete from storage
        const { error: storageError } = await supabase.storage
            .from('medical_documents')
            .remove([fileUrl]);
            
        if (storageError) throw storageError;

        // Delete from DB
        const { error: dbError } = await supabase
            .from('medical_records' as any)
            .delete()
            .eq('id', docId);

        if (dbError) throw dbError;

        toast.success("Document deleted");
        fetchDocuments();
    } catch(err) {
        toast.error("Failed to delete document");
    }
  };

  const downloadFile = async (fileUrl: string, fileName: string) => {
    try {
        const { data, error } = await supabase.storage
            .from('medical_documents')
            .download(fileUrl);
            
        if (error) throw error;
        
        const url = URL.createObjectURL(data);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        URL.revokeObjectURL(url);
        document.body.removeChild(a);
    } catch(err) {
        toast.error("Failed to download file");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
           <FileText className="w-5 h-5 text-primary" />
           Medical Record Uploads
        </CardTitle>
        <CardDescription>Upload test results, prescriptions, or scans.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        
        {!disabled && (
          <div className="bg-muted/30 p-4 rounded-xl space-y-4 border border-border">
            <h4 className="font-bold text-sm uppercase text-slate-500">Upload New Document</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                 <Label>Document Title</Label>
                 <Input 
                   placeholder="e.g. Blood Test Results" 
                   value={uploadData.title} 
                   onChange={(e) => setUploadData({...uploadData, title: e.target.value})} 
                 />
              </div>
              <div className="space-y-2">
                 <Label>Record Type</Label>
                 <Select value={uploadData.type} onValueChange={(v) => setUploadData({...uploadData, type: v})}>
                    <SelectTrigger>
                       <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                       <SelectItem value="Test Result">Test Result</SelectItem>
                       <SelectItem value="Prescription">Prescription</SelectItem>
                       <SelectItem value="Scan">Scan</SelectItem>
                       <SelectItem value="Eye Test">Eye Test</SelectItem>
                       <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                 </Select>
              </div>
            </div>
            <div className="pt-2">
               <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  onChange={handleFileUpload} 
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
               />
               <Button 
                 onClick={() => fileInputRef.current?.click()} 
                 disabled={uploading || !uploadData.title || disabled}
                 className="w-full"
                 variant="outline"
               >
                  {uploading ? (
                      <span className="animate-spin mr-2 border-2 border-primary border-t-transparent rounded-full w-4 h-4"></span>
                  ) : (
                      <Upload className="w-4 h-4 mr-2" />
                  )}
                  {uploading ? 'Uploading...' : 'Select File to Upload'}
               </Button>
            </div>
          </div>
        )}

        <div className="space-y-3 mt-6">
            <h4 className="font-bold text-sm uppercase text-slate-500">Uploaded Documents ({documents.length})</h4>
            {loading ? (
                <div className="flex items-center justify-center p-4">
                    <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                </div>
            ) : documents.length === 0 ? (
                <div className="text-center p-6 bg-slate-50 border border-dashed rounded-lg">
                    <File className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-sm text-slate-500">No documents have been uploaded yet.</p>
                </div>
            ) : (
                <div className="space-y-2">
                    {documents.map((doc) => (
                        <div key={doc.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 border rounded-lg hover:border-primary/30 transition-colors bg-white">
                            <div className="flex items-start gap-3">
                                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                                   <FileType className="w-5 h-5 text-primary" />
                                </div>
                                <div className="min-w-0">
                                   <p className="font-medium text-sm truncate">{doc.record_title}</p>
                                   <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                                      <span className="bg-slate-100 px-2 py-0.5 rounded-full">{doc.record_type}</span>
                                      <span>{(doc.file_size / 1024 / 1024).toFixed(2)} MB</span>
                                   </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 mt-3 sm:mt-0">
                                <Button variant="ghost" size="sm" onClick={() => downloadFile(doc.file_url, doc.file_name)} className="h-8">
                                    <Eye className="w-4 h-4 mr-1" /> View Let
                                </Button>
                                {!disabled && (
                                   <Button variant="ghost" size="sm" onClick={() => handleDelete(doc.id, doc.file_url)} className="h-8 text-red-500 hover:text-red-700 hover:bg-red-50">
                                      <Trash2 className="w-4 h-4" />
                                   </Button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>

      </CardContent>
    </Card>
  );
};
