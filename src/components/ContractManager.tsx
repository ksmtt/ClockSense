import { useState } from 'react';
import { Plus, Edit, Calendar, Clock, CheckCircle, Sun, Copy, Trash2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Contract } from '../hooks/useClockifyData';

interface ContractManagerProps {
  contracts: Contract[];
  currentContract?: Contract;
  onUpdateContract: (id: string, updates: Partial<Contract>) => void;
  onAddContract: (contract: Omit<Contract, 'id'>) => void;
  onDeleteContract: (id: string) => void;
}

interface ContractFormData {
  name: string;
  startDate: string;
  endDate: string;
  weeklyHours: number;
  vacationDays: number;
}

export function ContractManager({ contracts, currentContract, onUpdateContract, onAddContract, onDeleteContract }: ContractManagerProps) {
  const [isAddingContract, setIsAddingContract] = useState(false);
  const [editingContract, setEditingContract] = useState<Contract | null>(null);
  const [formData, setFormData] = useState<ContractFormData>({
    name: '',
    startDate: '',
    endDate: '',
    weeklyHours: 20,
    vacationDays: 0
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingContract) {
      onUpdateContract(editingContract.id, formData);
      setEditingContract(null);
    } else {
      onAddContract({
        ...formData,
        isActive: true
      });
      setIsAddingContract(false);
    }
    
    setFormData({
      name: '',
      startDate: '',
      endDate: '',
      weeklyHours: 20,
      vacationDays: 0
    });
  };

  const handleEdit = (contract: Contract) => {
    setFormData({
      name: contract.name,
      startDate: contract.startDate,
      endDate: contract.endDate,
      weeklyHours: contract.weeklyHours,
      vacationDays: contract.vacationDays || 0
    });
    setEditingContract(contract);
  };

  const handleDuplicate = (contract: Contract) => {
    // Find the latest end date from all contracts to set start date
    const latestEndDate = contracts.reduce((latest, c) => {
      const endDate = new Date(c.endDate);
      return endDate > latest ? endDate : latest;
    }, new Date(contract.endDate));
    
    // Set start date to the day after the latest end date
    const newStartDate = new Date(latestEndDate);
    newStartDate.setDate(newStartDate.getDate() + 1);
    
    // Calculate duration of original contract in months for the copy
    const originalStart = new Date(contract.startDate);
    const originalEnd = new Date(contract.endDate);
    const monthsDiff = Math.round((originalEnd.getTime() - originalStart.getTime()) / (1000 * 60 * 60 * 24 * 30.44));
    
    // Set end date based on original contract duration
    const newEndDate = new Date(newStartDate);
    newEndDate.setMonth(newEndDate.getMonth() + Math.max(1, monthsDiff));
    
    setFormData({
      name: `${contract.name} (Copy)`,
      startDate: newStartDate.toISOString().split('T')[0],
      endDate: newEndDate.toISOString().split('T')[0],
      weeklyHours: contract.weeklyHours,
      vacationDays: contract.vacationDays || 0
    });
    setIsAddingContract(true);
  };

  const getContractStatus = (contract: Contract) => {
    const now = new Date();
    const start = new Date(contract.startDate);
    const end = new Date(contract.endDate);
    
    if (now < start) return 'upcoming';
    if (now > end) return 'completed';
    return 'active';
  };

  const sortedContracts = [...contracts].sort((a, b) => {
    const statusOrder = { active: 0, upcoming: 1, completed: 2 };
    const aStatus = getContractStatus(a);
    const bStatus = getContractStatus(b);
    
    if (aStatus !== bStatus) {
      return statusOrder[aStatus] - statusOrder[bStatus];
    }
    
    return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-foreground">Contract Management</h2>
          <p className="text-muted-foreground text-caption">Manage your work contracts and hours</p>
        </div>
        
        <Dialog open={isAddingContract} onOpenChange={(open) => {
          if (open && !isAddingContract) {
            // When opening add dialog, set smart default dates
            const latestEndDate = contracts.length > 0 
              ? contracts.reduce((latest, c) => {
                  const endDate = new Date(c.endDate);
                  return endDate > latest ? endDate : latest;
                }, new Date(contracts[0].endDate))
              : new Date();
            
            const newStartDate = new Date(latestEndDate);
            newStartDate.setDate(newStartDate.getDate() + 1);
            
            const newEndDate = new Date(newStartDate);
            newEndDate.setMonth(newEndDate.getMonth() + 6);
            
            setFormData({
              name: '',
              startDate: newStartDate.toISOString().split('T')[0],
              endDate: newEndDate.toISOString().split('T')[0],
              weeklyHours: 20,
              vacationDays: 0
            });
          }
          setIsAddingContract(open);
        }}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2 normal-case">
              <Plus className="w-4 h-4" />
              Add Contract
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Contract</DialogTitle>
              <DialogDescription>
                Create a new work contract with specific dates and weekly hours.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Contract Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Student Assistant Q1 2024"
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="endDate">End Date</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="weeklyHours">Weekly Hours</Label>
                  <Input
                    id="weeklyHours"
                    type="number"
                    min="1"
                    max="40"
                    value={formData.weeklyHours}
                    onChange={(e) => setFormData({ ...formData, weeklyHours: parseInt(e.target.value) })}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="vacationDays">Vacation Days</Label>
                  <Input
                    id="vacationDays"
                    type="number"
                    min="0"
                    max="30"
                    step="0.5"
                    value={formData.vacationDays}
                    onChange={(e) => setFormData({ ...formData, vacationDays: parseFloat(e.target.value) || 0 })}
                    placeholder="e.g., 4.5 = 36 hours"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Each day = 8 hours (supports half days)
                  </p>
                </div>
              </div>
              
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsAddingContract(false)} className="normal-case">
                  Cancel
                </Button>
                <Button type="submit" className="normal-case">Add Contract</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Edit Contract Dialog */}
      <Dialog open={!!editingContract} onOpenChange={(open) => !open && setEditingContract(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Contract</DialogTitle>
            <DialogDescription>
              Update contract details and weekly hours.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="edit-name">Contract Name</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-startDate">Start Date</Label>
                <Input
                  id="edit-startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="edit-endDate">End Date</Label>
                <Input
                  id="edit-endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  required
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-weeklyHours">Weekly Hours</Label>
                <Input
                  id="edit-weeklyHours"
                  type="number"
                  min="1"
                  max="40"
                  value={formData.weeklyHours}
                  onChange={(e) => setFormData({ ...formData, weeklyHours: parseInt(e.target.value) })}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="edit-vacationDays">Vacation Days</Label>
                <Input
                  id="edit-vacationDays"
                  type="number"
                  min="0"
                  max="30"
                  step="0.5"
                  value={formData.vacationDays}
                  onChange={(e) => setFormData({ ...formData, vacationDays: parseFloat(e.target.value) || 0 })}
                  placeholder="e.g., 4.5 = 36 hours"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Each day = 8 hours (supports half days)
                </p>
              </div>
            </div>
            
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setEditingContract(null)} className="normal-case">
                Cancel
              </Button>
              <Button type="submit" className="normal-case">Update Contract</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Contracts List */}
      <div className="grid gap-4">
        {sortedContracts.map((contract) => {
          const status = getContractStatus(contract);
          const isActive = status === 'active';
          
          return (
            <Card key={contract.id} className={isActive ? 'border-primary' : ''}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CardTitle className="text-lg">{contract.name}</CardTitle>
                    {isActive && (
                      <Badge variant="default" className="flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        Active
                      </Badge>
                    )}
                    {status === 'upcoming' && (
                      <Badge variant="secondary">Upcoming</Badge>
                    )}
                    {status === 'completed' && (
                      <Badge variant="outline">Completed</Badge>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDuplicate(contract)}
                      className="flex items-center gap-1 normal-case"
                    >
                      <Copy className="w-4 h-4" />
                      Duplicate
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(contract)}
                      className="flex items-center gap-1 normal-case"
                    >
                      <Edit className="w-4 h-4" />
                      Edit
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex items-center gap-1 normal-case text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Contract</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete "{contract.name}"? This action cannot be undone.
                            {contract.id === currentContract?.id && (
                              <span className="block mt-2 text-destructive font-medium">
                                Warning: This is your currently active contract.
                              </span>
                            )}
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="normal-case">Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => onDeleteContract(contract.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90 normal-case"
                          >
                            Delete Contract
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
                
                <CardDescription className="flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {new Date(contract.startDate).toLocaleDateString()} - {new Date(contract.endDate).toLocaleDateString()}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {contract.weeklyHours}h/week
                  </span>
                  {contract.vacationDays > 0 && (
                    <span className="flex items-center gap-1">
                      <Sun className="w-4 h-4" />
                      {contract.vacationDays} vacation days
                    </span>
                  )}
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>
                    Duration: {Math.ceil((new Date(contract.endDate).getTime() - new Date(contract.startDate).getTime()) / (1000 * 60 * 60 * 24 * 7))} weeks
                  </span>
                  <span>
                    Total hours: {contract.weeklyHours * Math.ceil((new Date(contract.endDate).getTime() - new Date(contract.startDate).getTime()) / (1000 * 60 * 60 * 24 * 7)) + (contract.vacationDays * 8)}h
                    {contract.vacationDays > 0 && (
                      <span className="text-xs text-muted-foreground/80">
                        {' '}(+{contract.vacationDays * 8}h vacation)
                      </span>
                    )}
                  </span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {contracts.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Calendar className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No contracts yet</h3>
            <p className="text-muted-foreground text-center mb-4">
              Add your first contract to start tracking your work hours and progress.
            </p>
            <Button onClick={() => {
              // Set default dates for first contract
              const today = new Date();
              const endDate = new Date(today);
              endDate.setMonth(endDate.getMonth() + 6);
              
              setFormData({
                name: '',
                startDate: today.toISOString().split('T')[0],
                endDate: endDate.toISOString().split('T')[0],
                weeklyHours: 20,
                vacationDays: 0
              });
              setIsAddingContract(true);
            }} className="flex items-center gap-2 normal-case">
              <Plus className="w-4 h-4" />
              Add Your First Contract
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}