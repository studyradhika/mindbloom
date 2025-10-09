import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, CheckSquare, Clock, Plus, Trash2, Edit } from "lucide-react";
import { showSuccess, showError } from "@/utils/toast";

interface MemoryNotebookProps {
  userData: any;
}

const MemoryNotebook = ({ userData }: MemoryNotebookProps) => {
  const [notes, setNotes] = useState<any[]>([]);
  const [checklists, setChecklists] = useState<any[]>([]);
  const [reminders, setReminders] = useState<any[]>([]);
  const [newNote, setNewNote] = useState({ title: '', content: '' });
  const [newChecklist, setNewChecklist] = useState({ title: '', items: [''] });
  const [newReminder, setNewReminder] = useState({ title: '', time: '', description: '' });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const savedNotes = localStorage.getItem('mindbloom-notes');
    const savedChecklists = localStorage.getItem('mindbloom-checklists');
    const savedReminders = localStorage.getItem('mindbloom-reminders');

    if (savedNotes) setNotes(JSON.parse(savedNotes));
    if (savedChecklists) setChecklists(JSON.parse(savedChecklists));
    if (savedReminders) setReminders(JSON.parse(savedReminders));
  };

  const saveNotes = (updatedNotes: any[]) => {
    setNotes(updatedNotes);
    localStorage.setItem('mindbloom-notes', JSON.stringify(updatedNotes));
  };

  const saveChecklists = (updatedChecklists: any[]) => {
    setChecklists(updatedChecklists);
    localStorage.setItem('mindbloom-checklists', JSON.stringify(updatedChecklists));
  };

  const saveReminders = (updatedReminders: any[]) => {
    setReminders(updatedReminders);
    localStorage.setItem('mindbloom-reminders', JSON.stringify(updatedReminders));
  };

  const addNote = () => {
    if (!newNote.title.trim()) {
      showError('Please enter a title for your note');
      return;
    }

    const note = {
      id: Date.now(),
      title: newNote.title,
      content: newNote.content,
      createdAt: new Date().toISOString(),
      category: 'personal'
    };

    saveNotes([...notes, note]);
    setNewNote({ title: '', content: '' });
    showSuccess('Note added successfully!');
  };

  const deleteNote = (id: number) => {
    saveNotes(notes.filter(note => note.id !== id));
    showSuccess('Note deleted');
  };

  const addChecklist = () => {
    if (!newChecklist.title.trim()) {
      showError('Please enter a title for your checklist');
      return;
    }

    const checklist = {
      id: Date.now(),
      title: newChecklist.title,
      items: newChecklist.items.filter(item => item.trim()).map(item => ({
        text: item,
        completed: false,
        id: Date.now() + Math.random()
      })),
      createdAt: new Date().toISOString()
    };

    saveChecklists([...checklists, checklist

]);
    setNewChecklist({ title: '', items: [''] });
    showSuccess('Checklist created successfully!');
  };

  const toggleChecklistItem = (checklistId: number, itemId: number) => {
    const updatedChecklists = checklists.map(checklist => {
      if (checklist.id === checklistId) {
        return {
          ...checklist,
          items: checklist.items.map((item: any) => 
            item.id === itemId ? { ...item, completed: !item.completed } : item
          )
        };
      }
      return checklist;
    });
    saveChecklists(updatedChecklists);
  };

  const deleteChecklist = (id: number) => {
    saveChecklists(checklists.filter(checklist => checklist.id !== id));
    showSuccess('Checklist deleted');
  };

  const addChecklistItem = () => {
    setNewChecklist(prev => ({
      ...prev,
      items: [...prev.items, '']
    }));
  };

  const updateChecklistItem = (index: number, value: string) => {
    setNewChecklist(prev => ({
      ...prev,
      items: prev.items.map((item, i) => i === index ? value : item)
    }));
  };

  const removeChecklistItem = (index: number) => {
    setNewChecklist(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const addReminder = () => {
    if (!newReminder.title.trim() || !newReminder.time) {
      showError('Please enter a title and time for your reminder');
      return;
    }

    const reminder = {
      id: Date.now(),
      title: newReminder.title,
      time: newReminder.time,
      description: newReminder.description,
      createdAt: new Date().toISOString(),
      active: true
    };

    saveReminders([...reminders, reminder]);
    setNewReminder({ title: '', time: '', description: '' });
    showSuccess('Reminder set successfully!');
  };

  const deleteReminder = (id: number) => {
    saveReminders(reminders.filter(reminder => reminder.id !== id));
    showSuccess('Reminder deleted');
  };

  const renderNotes = () => (
    <div className="space-y-6">
      {/* Add New Note */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <Plus className="w-5 h-5 mr-2" />
            Add New Note
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            placeholder="Note title..."
            value={newNote.title}
            onChange={(e) => setNewNote(prev => ({ ...prev, title: e.target.value }))}
            className="text-lg"
          />
          <Textarea
            placeholder="Write your note here..."
            value={newNote.content}
            onChange={(e) => setNewNote(prev => ({ ...prev, content: e.target.value }))}
            rows={4}
          />
          <Button onClick={addNote} className="w-full">
            Save Note
          </Button>
        </CardContent>
      </Card>

      {/* Existing Notes */}
      <div className="space-y-4">
        {notes.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center text-gray-500">
              <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No notes yet. Create your first note above!</p>
            </CardContent>
          </Card>
        ) : (
          notes.map(note => (
            <Card key={note.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{note.title}</CardTitle>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline">
                      {new Date(note.createdAt).toLocaleDateString()}
                    </Badge>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => deleteNote(note.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap">{note.content}</p>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );

  const renderChecklists = () => (
    <div className="space-y-6">
      {/* Add New Checklist */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <Plus className="w-5 h-5 mr-2" />
            Create New Checklist
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            placeholder="Checklist title (e.g., 'Morning Routine', 'Grocery List')..."
            value={newChecklist.title}
            onChange={(e) => setNewChecklist(prev => ({ ...prev, title: e.target.value }))}
            className="text-lg"
          />
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Checklist Items:</label>
            {newChecklist.items.map((item, index) => (
              <div key={index} className="flex items-center space-x-2">
                <Input
                  placeholder={`Item ${index + 1}...`}
                  value={item}
                  onChange={(e) => updateChecklistItem(index, e.target.value)}
                />
                {newChecklist.items.length > 1 && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => removeChecklistItem(index)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}
            <Button
              variant="outline"
              onClick={addChecklistItem}
              className="w-full"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Item
            </Button>
          </div>
          
          <Button onClick={addChecklist} className="w-full">
            Create Checklist
          </Button>
        </CardContent>
      </Card>

      {/* Existing Checklists */}
      <div className="space-y-4">
        {checklists.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center text-gray-500">
              <CheckSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No checklists yet. Create your first checklist above!</p>
            </CardContent>
          </Card>
        ) : (
          checklists.map(checklist => {
            const completedItems = checklist.items.filter((item: any) => item.completed).length;
            const totalItems = checklist.items.length;
            const progress = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;

            return (
              <Card key={checklist.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{checklist.title}</CardTitle>
                    <div className="flex items-center space-x-2">
                      <Badge variant={progress === 100 ? "default" : "outline"}>
                        {completedItems}/{totalItems} completed
                      </Badge>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => deleteChecklist(checklist.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {checklist.items.map((item: any) => (
                      <div key={item.id} className="flex items-center space-x-3">
                        <Checkbox
                          checked={item.completed}
                          onCheckedChange={() => toggleChecklistItem(checklist.id, item.id)}
                        />
                        <span className={`flex-1 ${item.completed ? 'line-through text-gray-500' : ''}`}>
                          {item.text}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );

  const renderReminders = () => (
    <div className="space-y-6">
      {/* Add New Reminder */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <Plus className="w-5 h-5 mr-2" />
            Set New Reminder
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            placeholder="Reminder title (e.g., 'Take medication', 'Call doctor')..."
            value={newReminder.title}
            onChange={(e) => setNewReminder(prev => ({ ...prev, title: e.target.value }))}
            className="text-lg"
          />
          
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Time</label>
              <Input
                type="time"
                value={newReminder.time}
                onChange={(e) => setNewReminder(prev => ({ ...prev, time: e.target.value }))}
              />
            </div>
          </div>
          
          <Textarea
            placeholder="Additional details (optional)..."
            value={newReminder.description}
            onChange={(e) => setNewReminder(prev => ({ ...prev, description: e.target.value }))}
            rows={3}
          />
          
          <Button onClick={addReminder} className="w-full">
            Set Reminder
          </Button>
        </CardContent>
      </Card>

      {/* Existing Reminders */}
      <div className="space-y-4">
        {reminders.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center text-gray-500">
              <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No reminders set. Create your first reminder above!</p>
            </CardContent>
          </Card>
        ) : (
          reminders.map(reminder => (
            <Card key={reminder.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{reminder.title}</CardTitle>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline">
                      {reminder.time}
                    </Badge>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => deleteReminder(reminder.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              {reminder.description && (
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-400">{reminder.description}</p>
                </CardContent>
              )}
            </Card>
          ))
        )}
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto">
      <Card className="mb-6">
        <CardHeader>
          <CardDescription className="text-lg flex items-center">
            <BookOpen className="w-6 h-6 mr-2 text-indigo-600" />
            Your personal memory support system - notes, checklists, and reminders to help with daily life
          </CardDescription>
        </CardHeader>
      </Card>

      <Tabs defaultValue="notes" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="notes" className="text-lg py-3">
            <BookOpen className="w-4 h-4 mr-2" />
            Notes ({notes.length})
          </TabsTrigger>
          <TabsTrigger value="checklists" className="text-lg py-3">
            <CheckSquare className="w-4 h-4 mr-2" />
            Checklists ({checklists.length})
          </TabsTrigger>
          <TabsTrigger value="reminders" className="text-lg py-3">
            <Clock className="w-4 h-4 mr-2" />
            Reminders ({reminders.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="notes">
          {renderNotes()}
        </TabsContent>

        <TabsContent value="checklists">
          {renderChecklists()}
        </TabsContent>

        <TabsContent value="reminders">
          {renderReminders()}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MemoryNotebook;