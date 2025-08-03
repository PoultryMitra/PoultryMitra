import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Plus, 
  FileText, 
  CreditCard, 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  XCircle,
  Edit,
  Eye,
  Download
} from 'lucide-react';
import { useFarmerDashboardStability } from '@/hooks/useFarmerDashboardStability';

// Import creditDebitNoteService with relative path as fallback
import { creditDebitNoteService } from '../../services/creditDebitNoteService';
import type { CreditDebitNote, CreditDebitNoteInput } from '../../services/creditDebitNoteService';

interface CreditDebitNoteManagerProps {
  userRole: 'farmer' | 'dealer';
  targetUserId?: string; // For dealer viewing farmer's notes
  targetUserName?: string;
}

export function CreditDebitNoteManager({ 
  userRole, 
  targetUserId, 
  targetUserName 
}: CreditDebitNoteManagerProps) {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const { executeWithStability, isStable } = useFarmerDashboardStability();

  // State management
  const [notes, setNotes] = useState<CreditDebitNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedNote, setSelectedNote] = useState<CreditDebitNote | null>(null);
  const [filter, setFilter] = useState<'all' | 'credit' | 'debit' | 'pending' | 'approved'>('all');

  // Form state
  const [formData, setFormData] = useState<CreditDebitNoteInput>({
    type: 'credit',
    amount: 0,
    description: '',
    category: 'Feed',
    referenceOrderId: '',
    attachments: [],
    notes: ''
  });

  // Load notes with stability
  useEffect(() => {
    if (!currentUser) return;

    const loadNotes = async () => {
      try {
        await executeWithStability(
          async () => {
            const userId = userRole === 'farmer' ? currentUser.uid : targetUserId || currentUser.uid;
            const unsubscribe = creditDebitNoteService.subscribeToNotes(
              userId,
              userRole,
              (notesData) => {
                setNotes(notesData);
                setLoading(false);
              }
            );
            return unsubscribe;
          },
          'Load Credit/Debit Notes',
          { 
            showErrorToast: false, // Don't show toast for this operation
            maxRetries: 1
          }
        );
      } catch (error) {
        console.log('Credit/Debit notes service unavailable, using fallback mode');
        setLoading(false);
        // Continue with empty state - this is acceptable for credit/debit notes
      }
    };

    loadNotes();
  }, [currentUser, userRole, targetUserId, executeWithStability]);

  // Create new note
  const handleCreateNote = async () => {
    if (!currentUser || !formData.amount || !formData.description.trim()) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const success = await executeWithStability(
      async () => {
        await creditDebitNoteService.createNote(
          currentUser.uid,
          userRole,
          {
            ...formData,
            targetUserId: targetUserId || '',
            targetUserName: targetUserName || ''
          }
        );
        return true;
      },
      'Create Credit/Debit Note',
      { showSuccessToast: true }
    );

    if (success) {
      // Reset form
      setFormData({
        type: 'credit',
        amount: 0,
        description: '',
        category: 'Feed',
        referenceOrderId: '',
        attachments: [],
        notes: ''
      });
      setShowCreateModal(false);
    }
  };

  // Update note status (for approval workflow)
  const handleUpdateNoteStatus = async (noteId: string, status: 'approved' | 'rejected', approverNotes?: string) => {
    await executeWithStability(
      async () => {
        await creditDebitNoteService.updateNoteStatus(noteId, status, approverNotes);
      },
      `${status === 'approved' ? 'Approve' : 'Reject'} Note`,
      { showSuccessToast: true }
    );
  };

  // Filter notes
  const filteredNotes = notes.filter(note => {
    if (filter === 'all') return true;
    if (filter === 'credit' || filter === 'debit') return note.type === filter;
    return note.status === filter;
  });

  // Get status color and icon
  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'pending':
        return { color: 'bg-yellow-100 text-yellow-800', icon: <Clock className="w-3 h-3" /> };
      case 'approved':
        return { color: 'bg-green-100 text-green-800', icon: <CheckCircle className="w-3 h-3" /> };
      case 'rejected':
        return { color: 'bg-red-100 text-red-800', icon: <XCircle className="w-3 h-3" /> };
      default:
        return { color: 'bg-gray-100 text-gray-800', icon: <AlertCircle className="w-3 h-3" /> };
    }
  };

  // Get type color
  const getTypeColor = (type: string) => {
    return type === 'credit' ? 'text-green-600' : 'text-red-600';
  };

  if (!isStable) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <AlertCircle className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
            <p className="text-gray-600">Credit/Debit Note system is temporarily unavailable</p>
            <p className="text-sm text-gray-500 mt-1">Please wait for the system to stabilize</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Credit/Debit Notes</h2>
          <p className="text-gray-600">
            {userRole === 'farmer' ? 'Manage your account adjustments' : `Notes for ${targetUserName || 'Farmer'}`}
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={filter} onValueChange={(value: any) => setFilter(value)}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filter notes" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Notes</SelectItem>
              <SelectItem value="credit">Credit Notes</SelectItem>
              <SelectItem value="debit">Debit Notes</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            New Note
          </Button>
        </div>
      </div>

      {/* Notes List */}
      <div className="grid gap-4">
        {loading ? (
          <Card>
            <CardContent className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </CardContent>
          </Card>
        ) : filteredNotes.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-8">
              <FileText className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No notes found</h3>
              <p className="text-gray-600">
                {filter === 'all' ? 'No credit or debit notes have been created yet' : `No ${filter} notes found`}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredNotes.map((note) => {
            const statusDisplay = getStatusDisplay(note.status);
            return (
              <Card key={note.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="flex items-center gap-2">
                          <CreditCard className={`h-5 w-5 ${getTypeColor(note.type)}`} />
                          <span className={`font-semibold text-lg ${getTypeColor(note.type)}`}>
                            {note.type === 'credit' ? '+' : '-'}₹{note.amount.toLocaleString()}
                          </span>
                        </div>
                        <Badge className={statusDisplay.color}>
                          {statusDisplay.icon}
                          <span className="ml-1 capitalize">{note.status}</span>
                        </Badge>
                        <Badge variant="outline">
                          {note.category}
                        </Badge>
                      </div>
                      
                      <p className="text-gray-900 font-medium mb-1">{note.description}</p>
                      
                      <div className="text-sm text-gray-600 space-y-1">
                        <p>Created: {note.createdAt.toDate().toLocaleDateString()}</p>
                        {note.referenceOrderId && (
                          <p>Reference Order: {note.referenceOrderId}</p>
                        )}
                        {userRole === 'dealer' && (
                          <p>Farmer: {note.farmerName}</p>
                        )}
                        {note.status === 'approved' && note.approvedAt && (
                          <p>Approved: {note.approvedAt.toDate().toLocaleDateString()}</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedNote(note);
                          setShowDetailsModal(true);
                        }}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      
                      {userRole === 'dealer' && note.status === 'pending' && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-green-600 hover:text-green-700"
                            onClick={() => handleUpdateNoteStatus(note.id, 'approved')}
                          >
                            <CheckCircle className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600 hover:text-red-700"
                            onClick={() => handleUpdateNoteStatus(note.id, 'rejected')}
                          >
                            <XCircle className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Create Note Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create Credit/Debit Note</DialogTitle>
            <DialogDescription>
              Create a new adjustment note for account transactions
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="type">Type</Label>
                <Select value={formData.type} onValueChange={(value: 'credit' | 'debit') => 
                  setFormData({...formData, type: value})
                }>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="credit">Credit Note</SelectItem>
                    <SelectItem value="debit">Debit Note</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="amount">Amount (₹)</Label>
                <Input
                  type="number"
                  value={formData.amount || ''}
                  onChange={(e) => setFormData({...formData, amount: parseFloat(e.target.value) || 0})}
                  placeholder="Enter amount"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="category">Category</Label>
              <Select value={formData.category} onValueChange={(value: any) => 
                setFormData({...formData, category: value})
              }>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Feed">Feed</SelectItem>
                  <SelectItem value="Medicine">Medicine</SelectItem>
                  <SelectItem value="Chicks">Chicks</SelectItem>
                  <SelectItem value="Payment">Payment</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Describe the reason for this adjustment..."
                rows={3}
              />
            </div>
            
            <div>
              <Label htmlFor="referenceOrderId">Reference Order ID (Optional)</Label>
              <Input
                value={formData.referenceOrderId}
                onChange={(e) => setFormData({...formData, referenceOrderId: e.target.value})}
                placeholder="Enter related order ID if applicable"
              />
            </div>
            
            <div>
              <Label htmlFor="notes">Additional Notes (Optional)</Label>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                placeholder="Any additional information..."
                rows={2}
              />
            </div>
          </div>
          
          <div className="flex justify-end gap-2 mt-6">
            <Button variant="outline" onClick={() => setShowCreateModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateNote}>
              Create Note
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Note Details Modal */}
      <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {selectedNote?.type === 'credit' ? 'Credit' : 'Debit'} Note Details
            </DialogTitle>
          </DialogHeader>
          
          {selectedNote && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Type</Label>
                  <p className={`font-semibold ${getTypeColor(selectedNote.type)}`}>
                    {selectedNote.type === 'credit' ? 'Credit Note' : 'Debit Note'}
                  </p>
                </div>
                <div>
                  <Label>Amount</Label>
                  <p className={`font-semibold text-lg ${getTypeColor(selectedNote.type)}`}>
                    {selectedNote.type === 'credit' ? '+' : '-'}₹{selectedNote.amount.toLocaleString()}
                  </p>
                </div>
              </div>
              
              <div>
                <Label>Description</Label>
                <p>{selectedNote.description}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Category</Label>
                  <p>{selectedNote.category}</p>
                </div>
                <div>
                  <Label>Status</Label>
                  <Badge className={getStatusDisplay(selectedNote.status).color}>
                    {getStatusDisplay(selectedNote.status).icon}
                    <span className="ml-1 capitalize">{selectedNote.status}</span>
                  </Badge>
                </div>
              </div>
              
              {selectedNote.referenceOrderId && (
                <div>
                  <Label>Reference Order</Label>
                  <p>{selectedNote.referenceOrderId}</p>
                </div>
              )}
              
              {selectedNote.notes && (
                <div>
                  <Label>Notes</Label>
                  <p>{selectedNote.notes}</p>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                <div>
                  <Label>Created</Label>
                  <p>{selectedNote.createdAt.toDate().toLocaleString()}</p>
                </div>
                {selectedNote.approvedAt && (
                  <div>
                    <Label>Approved</Label>
                    <p>{selectedNote.approvedAt.toDate().toLocaleString()}</p>
                  </div>
                )}
              </div>
              
              {selectedNote.approverNotes && (
                <div>
                  <Label>Approver Notes</Label>
                  <p className="bg-gray-50 p-3 rounded">{selectedNote.approverNotes}</p>
                </div>
              )}
            </div>
          )}
          
          <div className="flex justify-end mt-6">
            <Button variant="outline" onClick={() => setShowDetailsModal(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
